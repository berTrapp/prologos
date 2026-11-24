import { beforeEach, describe, expect, it } from 'vitest';
import { makeItem, zoneByKey } from '@/domain/fixtures';
import { MemoryProjectRepository } from './memory-repository';
import { createProjectStore } from './project-store';
import { createWorkspaceStore } from './workspace-store';

const DAY = 24 * 60 * 60 * 1000;
let clock = 0;
let n = 0;

function setup() {
  const repo = new MemoryProjectRepository();
  const deps = { repo, now: () => clock, createId: () => `id-${++n}` };
  const projectStore = createProjectStore({ ...deps, saveDelay: 0 });
  const store = createWorkspaceStore({ ...deps, projectStore });
  return { repo, projectStore, store, s: () => store.getState() };
}

beforeEach(() => {
  clock = 100 * DAY;
});

describe('workspace: projects', () => {
  it('creates a project with the default zones and lists it with counts', async () => {
    const { s } = setup();
    await s().init();
    const id = await s().createProject({ name: 'Agenda', type: 'web' });
    expect(s().projects).toHaveLength(1);
    expect(s().projects[0]?.project.id).toBe(id);
    expect(s().projects[0]?.counts).toEqual({ zones: 9, items: 0, flows: 0 });
    expect(s().projects[0]?.zoneColors[0]).toBe('method');
  });

  it('changes status and returns the previous one for Desfazer (RN 4)', async () => {
    const { s } = setup();
    const id = await s().createProject({ name: 'Agenda', type: 'web' });
    expect(await s().setStatus(id, 'archived')).toBe('planning');
    expect(s().projects[0]?.project.status).toBe('archived');
    expect(await s().setStatus(id, 'planning')).toBe('archived');
    expect(await s().setStatus('missing', 'paused')).toBeUndefined();
  });

  it('changes the status of the open project through its store', async () => {
    const { s, projectStore } = setup();
    const id = await s().createProject({ name: 'Agenda', type: 'web' });
    await projectStore.getState().open(id);
    await s().setStatus(id, 'paused');
    expect(projectStore.getState().snapshot?.project.status).toBe('paused');
    expect(s().projects[0]?.project.status).toBe('paused');
  });
});

describe('workspace: trash (RN 11)', () => {
  it('moves a whole project to the trash and restores it with everything', async () => {
    const { s, repo } = setup();
    const id = await s().createProject({ name: 'Agenda', type: 'web' });
    await s().markOpened(id);
    const entry = await s().moveProjectToTrash(id);
    expect(entry?.kind).toBe('project');
    expect(s().projects).toHaveLength(0);
    expect(s().trash).toHaveLength(1);
    expect(s().settings.lastOpenedProjectId).toBeUndefined();

    if (!entry) throw new Error('entry');
    expect(await s().restoreTrash(entry)).toBe(id);
    expect(s().projects).toHaveLength(1);
    expect((await repo.loadProject(id))?.zones).toHaveLength(9);
    expect(s().trash).toHaveLength(0);
  });

  it('closes the project first when it is open', async () => {
    const { s, projectStore } = setup();
    const id = await s().createProject({ name: 'Agenda', type: 'web' });
    await projectStore.getState().open(id);
    await s().moveProjectToTrash(id);
    expect(projectStore.getState().snapshot).toBeNull();
    expect(await s().moveProjectToTrash('missing')).toBeUndefined();
  });

  it('restores an item into a project that is not open', async () => {
    const { s, repo, projectStore } = setup();
    const id = await s().createProject({ name: 'Agenda', type: 'web' });
    const snapshot = await repo.loadProject(id);
    if (!snapshot) throw new Error('snapshot');
    const item = makeItem(zoneByKey(snapshot, 'data').id, { projectId: id, name: 'Redis' });
    await repo.saveProject({ ...snapshot, items: [item] });

    await projectStore.getState().open(id);
    const entry = await projectStore.getState().moveToTrash('item', item.id, 'Redis');
    await projectStore.getState().close();
    await s().refresh();
    if (!entry) throw new Error('entry');

    expect(await s().restoreTrash(entry)).toBe(id);
    expect((await repo.loadProject(id))?.items.map((i) => i.name)).toEqual(['Redis']);
    expect(s().trash).toHaveLength(0);
  });

  it('restores an item into the open project through its store', async () => {
    const { s, repo, projectStore } = setup();
    const id = await s().createProject({ name: 'Agenda', type: 'web' });
    const snapshot = await repo.loadProject(id);
    if (!snapshot) throw new Error('snapshot');
    const item = makeItem(zoneByKey(snapshot, 'data').id, { projectId: id, name: 'Redis' });
    await repo.saveProject({ ...snapshot, items: [item] });
    await projectStore.getState().open(id);
    const entry = await projectStore.getState().moveToTrash('item', item.id, 'Redis');
    if (!entry) throw new Error('entry');
    await s().restoreTrash(entry);
    expect(projectStore.getState().snapshot?.items).toHaveLength(1);
  });

  it('cannot restore into a project that is gone', async () => {
    const { s } = setup();
    const orphan = {
      id: 't',
      projectId: 'gone',
      kind: 'item' as const,
      label: 'X',
      deletedAt: clock,
      payload: {},
    };
    expect(await s().restoreTrash(orphan)).toBeUndefined();
    expect(await s().restoreTrash({ ...orphan, projectId: null })).toBeUndefined();
  });

  it('purges entries older than 30 days on start and empties on request', async () => {
    const { s, repo } = setup();
    await repo.addTrash({
      id: 'old',
      projectId: 'p',
      kind: 'item',
      label: 'Velho',
      deletedAt: clock - 31 * DAY,
      payload: {},
    });
    await repo.addTrash({
      id: 'new',
      projectId: 'p',
      kind: 'item',
      label: 'Novo',
      deletedAt: clock - DAY,
      payload: {},
    });
    await s().init();
    expect(s().trash.map((e) => e.id)).toEqual(['new']);
    await s().emptyTrash();
    expect(s().trash).toEqual([]);
  });
});

describe('workspace: backup (RN 18)', () => {
  it('exports every project and records the date', async () => {
    const { s } = setup();
    await s().createProject({ name: 'A', type: 'web' });
    await s().createProject({ name: 'B', type: 'api' });
    const { json, count } = await s().exportBackup();
    expect(count).toBe(2);
    expect(JSON.parse(json).projects).toHaveLength(2);
    expect(s().settings).toMatchObject({ lastBackupAt: clock, lastBackupCount: 2 });
  });

  it('reads a backup and reports conflicts; replaces or copies without deleting anything', async () => {
    const { s } = setup();
    const id = await s().createProject({ name: 'Agenda', type: 'web' });
    const { json } = await s().exportBackup();

    const read = await s().readBackup(json);
    expect(read.ok && read.conflicts).toEqual([id]);
    if (!read.ok) throw new Error('read');

    await s().importBackup(read.backup, { [id]: 'copy' }, (name) => `${name} (cópia)`);
    expect(
      s()
        .projects.map((p) => p.project.name)
        .sort(),
    ).toEqual(['Agenda', 'Agenda (cópia)']);

    await s().setStatus(id, 'paused');
    await s().importBackup(read.backup, { [id]: 'replace' }, (name) => name);
    expect(s().projects.find((p) => p.project.id === id)?.project.status).toBe('planning');
    expect(s().projects).toHaveLength(2);
  });

  it('reports a broken file', async () => {
    const { s } = setup();
    expect(await s().readBackup('nope')).toEqual({ ok: false, error: 'not-json' });
  });

  it('remembers settings and snoozes the reminder for a day', async () => {
    const { s, repo } = setup();
    await s().updateSettings({ backupReminder: false });
    await s().snoozeBackup();
    expect(s().settings.snoozedUntil).toBe(clock + DAY);
    const again = createWorkspaceStore({ repo });
    await again.getState().init();
    expect(again.getState().settings.backupReminder).toBe(false);
  });
});
