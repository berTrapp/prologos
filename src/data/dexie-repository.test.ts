import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { makeConnection, makeItem, makeSnapshot, zoneByKey } from '@/domain/fixtures';
import type { EnvVar } from '@/domain/schemas/env';
import type { ProjectSnapshot } from '@/domain/schemas/snapshot';
import { PrologosDb } from './db';
import { DexieProjectRepository } from './dexie-repository';

const DAY = 24 * 60 * 60 * 1000;
let db: PrologosDb;
let repo: DexieProjectRepository;

beforeEach(() => {
  db = new PrologosDb(`test-${crypto.randomUUID()}`);
  repo = new DexieProjectRepository(db);
});
afterEach(async () => {
  await db.delete();
});

function project(id = 'p1'): ProjectSnapshot {
  const base = makeSnapshot();
  const snapshot = {
    ...base,
    project: { ...base.project, id },
    zones: base.zones.map((zone) => ({ ...zone, projectId: id })),
  };
  const data = zoneByKey(snapshot, 'data');
  const a = makeItem(data.id, { projectId: id, name: 'API' });
  const b = makeItem(data.id, { projectId: id, name: 'PostgreSQL' });
  return {
    ...snapshot,
    items: [a, b],
    connections: [makeConnection(a.id, b.id, { projectId: id })],
  };
}

describe('DexieProjectRepository', () => {
  it('saves and loads a whole project', async () => {
    const snapshot = project();
    await repo.saveProject(snapshot);
    const loaded = await repo.loadProject('p1');
    expect(loaded?.project).toEqual(snapshot.project);
    expect(loaded?.zones).toHaveLength(9);
    expect(loaded?.items.map((i) => i.name).sort()).toEqual(['API', 'PostgreSQL']);
    expect(loaded?.connections).toHaveLength(1);
  });

  it('returns undefined for an unknown project', async () => {
    expect(await repo.loadProject('nope')).toBeUndefined();
  });

  it('saving replaces rows: removed rows are gone', async () => {
    const snapshot = project();
    await repo.saveProject(snapshot);
    await repo.saveProject({ ...snapshot, items: snapshot.items.slice(0, 1), connections: [] });
    const loaded = await repo.loadProject('p1');
    expect(loaded?.items).toHaveLength(1);
    expect(loaded?.connections).toHaveLength(0);
  });

  it('keeps projects apart and lists the most recent first', async () => {
    const older = project('p1');
    const newer = project('p2');
    await repo.saveProject({ ...older, project: { ...older.project, updatedAt: 1 } });
    await repo.saveProject({ ...newer, project: { ...newer.project, updatedAt: 2 } });
    expect((await repo.listProjects()).map((p) => p.id)).toEqual(['p2', 'p1']);
    expect((await repo.loadProject('p1'))?.items).toHaveLength(2);
  });

  it('never writes a secret value, even if one slips in (RN 3)', async () => {
    const leaked = {
      id: 'e1',
      projectId: 'p1',
      key: 'APP_KEY',
      environment: 'development',
      usedIn: ['back'],
      secret: true,
      value: 'should-never-be-stored',
    } as unknown as EnvVar;
    await repo.saveProject({ ...project(), envVars: [leaked] });
    const stored = await db.envVars.get('e1');
    expect(stored).toBeDefined();
    expect(stored).not.toHaveProperty('value');
    expect(JSON.stringify(await db.envVars.toArray())).not.toContain('should-never-be-stored');
  });

  it('refuses an invalid project', async () => {
    const snapshot = project();
    await expect(
      repo.saveProject({ ...snapshot, project: { ...snapshot.project, name: '' } }),
    ).rejects.toThrow();
    expect(await repo.loadProject('p1')).toBeUndefined();
  });

  it('deletes a project with everything inside', async () => {
    await repo.saveProject(project());
    await repo.addVersion({
      id: 'v1',
      projectId: 'p1',
      kind: 'auto',
      createdAt: 0,
      snapshot: project(),
    });
    await repo.deleteProject('p1');
    expect(await repo.loadProject('p1')).toBeUndefined();
    expect(await db.items.count()).toBe(0);
    expect(await repo.listVersions('p1')).toEqual([]);
  });
});

describe('trash (RN 11)', () => {
  const entry = (id: string, deletedAt: number) => ({
    id,
    projectId: 'p1',
    kind: 'item' as const,
    label: 'Redis',
    deletedAt,
    payload: { items: [] },
  });

  it('adds, lists newest first and removes', async () => {
    await repo.addTrash(entry('a', 1));
    await repo.addTrash(entry('b', 2));
    expect((await repo.listTrash()).map((e) => e.id)).toEqual(['b', 'a']);
    await repo.removeTrash('b');
    expect((await repo.listTrash()).map((e) => e.id)).toEqual(['a']);
  });

  it('purges entries after 30 days', async () => {
    await repo.addTrash(entry('old', 0));
    await repo.addTrash(entry('new', 20 * DAY));
    expect(await repo.purgeExpiredTrash(31 * DAY)).toBe(1);
    expect((await repo.listTrash()).map((e) => e.id)).toEqual(['new']);
  });

  it('empties the trash', async () => {
    await repo.addTrash(entry('a', 1));
    await repo.emptyTrash();
    expect(await repo.listTrash()).toEqual([]);
  });

  it('strips secret values from trashed variables (RN 3)', async () => {
    const leaked = {
      id: 'e1',
      projectId: 'p1',
      key: 'DB_PASSWORD',
      environment: 'production',
      usedIn: ['back'],
      secret: true,
      value: 'x',
    };
    await repo.addTrash({
      ...entry('a', 1),
      kind: 'envVar',
      payload: { envVars: [leaked as unknown as EnvVar] },
    });
    expect(JSON.stringify(await repo.listTrash())).not.toContain('"value"');
  });
});

describe('versions (RN 8)', () => {
  it('lists newest first and prunes automatic versions after 90 days', async () => {
    const now = 200 * DAY;
    await repo.addVersion({
      id: 'named',
      projectId: 'p1',
      kind: 'named',
      name: 'Antes do deploy',
      createdAt: 0,
      snapshot: project(),
    });
    await repo.addVersion({
      id: 'old',
      projectId: 'p1',
      kind: 'auto',
      createdAt: now - 100 * DAY,
      snapshot: project(),
    });
    await repo.addVersion({
      id: 'new',
      projectId: 'p1',
      kind: 'auto',
      createdAt: now - DAY,
      snapshot: project(),
    });
    expect(await repo.pruneVersions('p1', now)).toBe(1);
    expect((await repo.listVersions('p1')).map((v) => v.id)).toEqual(['new', 'named']);
  });
});

describe('meta', () => {
  it('stores small values like the last backup date', async () => {
    expect(await repo.getMeta('lastBackupAt')).toBeUndefined();
    await repo.setMeta('lastBackupAt', 123);
    expect(await repo.getMeta<number>('lastBackupAt')).toBe(123);
  });
});
