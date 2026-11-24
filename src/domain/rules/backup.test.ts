import { describe, expect, it } from 'vitest';
import { makeConnection, makeItem, makeSnapshot, makeSubzone, zoneByKey } from '../fixtures';
import type { EnvVar } from '../schemas/env';
import type { ProjectSnapshot } from '../schemas/snapshot';
import { validateMap } from './map';
import {
  BACKUP_FORMAT,
  copyProject,
  createBackup,
  findImportConflicts,
  isBackupReminderDue,
  parseBackup,
  snoozeBackupReminder,
} from './backup';

const DAY = 24 * 60 * 60 * 1000;

function project(): ProjectSnapshot {
  const base = makeSnapshot();
  const data = zoneByKey(base, 'data');
  const sub = makeSubzone(data.id);
  const a = makeItem(data.id, { name: 'API' });
  const b = makeItem(sub.id, { name: 'Redis' });
  const c = makeConnection(a.id, b.id);
  return {
    ...base,
    zones: [...base.zones, sub],
    items: [a, b],
    connections: [c],
    flows: [{ id: 'f', projectId: 'p1', name: 'Cache', steps: [c.id] }],
    notes: [{ id: 'n', projectId: 'p1', itemId: b.id, text: 'TTL', private: false, createdAt: 0 }],
    checklist: [{ id: 'k', projectId: 'p1', zoneId: data.id, itemRef: 'database', order: 0 }],
    envVars: [
      {
        id: 'e',
        projectId: 'p1',
        key: 'APP_KEY',
        environment: 'development',
        usedIn: ['back'],
        secret: true,
        value: 'leak',
      } as unknown as EnvVar,
    ],
  };
}

describe('backup file (RN 18)', () => {
  it('round-trips through JSON without any secret value (RN 3)', () => {
    const text = JSON.stringify(createBackup([project()], 5));
    expect(text).not.toContain('leak');
    const parsed = parseBackup(text);
    expect(parsed.ok && parsed.backup.projects[0]?.items).toHaveLength(2);
  });

  it('drops a secret value added by hand to the file', () => {
    const backup = createBackup([project()], 5);
    const tampered = JSON.parse(JSON.stringify(backup));
    tampered.projects[0].envVars[0].value = 'hand-edited';
    const parsed = parseBackup(JSON.stringify(tampered));
    expect(parsed.ok).toBe(true);
    expect(JSON.stringify(parsed)).not.toContain('hand-edited');
  });

  it.each([
    ['not json', '{', 'not-json'],
    ['another file', JSON.stringify({ name: 'package' }), 'not-a-backup'],
    ['null', 'null', 'not-a-backup'],
    [
      'a newer version',
      JSON.stringify({ format: BACKUP_FORMAT, version: 99, projects: [] }),
      'newer-version',
    ],
    [
      'broken projects',
      JSON.stringify({ format: BACKUP_FORMAT, version: 1, exportedAt: 0, projects: [{}] }),
      'invalid',
    ],
    [
      'missing projects',
      JSON.stringify({ format: BACKUP_FORMAT, version: 1, exportedAt: 0 }),
      'invalid',
    ],
  ])('rejects %s', (_label, text, error) => {
    expect(parseBackup(text)).toEqual({ ok: false, error });
  });

  it('finds projects that already exist', () => {
    const backup = createBackup([project()], 0);
    expect(findImportConflicts(backup, new Set(['p1']))).toEqual(['p1']);
    expect(findImportConflicts(backup, new Set())).toEqual([]);
  });
});

describe('copyProject', () => {
  let n = 0;
  const copy = copyProject(project(), { createId: () => `new-${++n}`, now: 9, name: 'Cópia' });

  it('gives every row a new id and keeps every reference valid', () => {
    const original = project();
    const oldIds = new Set([
      original.project.id,
      ...original.zones.map((z) => z.id),
      ...original.items.map((i) => i.id),
      ...original.connections.map((c) => c.id),
    ]);
    expect(oldIds.has(copy.project.id)).toBe(false);
    expect(copy.zones.some((z) => oldIds.has(z.id))).toBe(false);
    expect(copy.items.some((i) => oldIds.has(i.id))).toBe(false);
    expect(validateMap(copy)).toEqual([]);
    expect(copy.flows[0]?.steps).toEqual([copy.connections[0]?.id]);
    expect(copy.notes[0]?.itemId).toBe(copy.items[1]?.id);
    expect(copy.checklist[0]?.zoneId).toBe(copy.zones.find((z) => z.key === 'data')?.id);
    expect([...copy.zones, ...copy.items].every((row) => row.projectId === copy.project.id)).toBe(
      true,
    );
  });

  it('uses the new name and dates, and no secret value', () => {
    expect(copy.project).toMatchObject({ name: 'Cópia', createdAt: 9, updatedAt: 9 });
    expect(copy.envVars[0]).not.toHaveProperty('value');
  });
});

describe('backup reminder (RN 18)', () => {
  const base = { enabled: true, projectCount: 2, lastBackupAt: 0, snoozedUntil: undefined, now: 0 };

  it('shows after 7 days without a backup', () => {
    expect(isBackupReminderDue({ ...base, now: 7 * DAY })).toBe(false);
    expect(isBackupReminderDue({ ...base, now: 7 * DAY + 1 })).toBe(true);
  });

  it('shows when there was never a backup and there are projects', () => {
    expect(isBackupReminderDue({ ...base, lastBackupAt: undefined })).toBe(true);
    expect(isBackupReminderDue({ ...base, lastBackupAt: undefined, projectCount: 0 })).toBe(false);
  });

  it('can be turned off', () => {
    expect(isBackupReminderDue({ ...base, enabled: false, now: 30 * DAY })).toBe(false);
  });

  it('"Lembrar depois" hides it for 1 day', () => {
    const now = 30 * DAY;
    const snoozedUntil = snoozeBackupReminder(now);
    expect(snoozedUntil).toBe(now + DAY);
    expect(isBackupReminderDue({ ...base, now: now + DAY - 1, snoozedUntil })).toBe(false);
    expect(isBackupReminderDue({ ...base, now: now + DAY, snoozedUntil })).toBe(true);
  });
});
