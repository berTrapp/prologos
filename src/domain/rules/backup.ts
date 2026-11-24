import { z } from 'zod';
import { ProjectSnapshotSchema, type ProjectSnapshot } from '../schemas/snapshot';
import { withoutSecretValues } from './env';

/** RN 10, 18: prologos.json, the backup that can be imported back. */
export const BACKUP_FORMAT = 'prologos-backup';
export const BACKUP_VERSION = 1;

export const BackupSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.number().int().nonnegative(),
  projects: z.array(ProjectSnapshotSchema),
});
export type Backup = z.infer<typeof BackupSchema>;

/** RN 18 + RN 3: the backup holds every project and never a secret value. */
export function createBackup(projects: readonly ProjectSnapshot[], now: number): Backup {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now,
    projects: projects.map((snapshot) => ({
      ...snapshot,
      envVars: withoutSecretValues(snapshot.envVars),
    })),
  };
}

export type ParsedBackup =
  | { ok: true; backup: Backup }
  | { ok: false; error: 'not-json' | 'not-a-backup' | 'newer-version' | 'invalid' };

export function parseBackup(text: string): ParsedBackup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'not-json' };
  }
  if (
    typeof data !== 'object' ||
    data === null ||
    (data as { format?: unknown }).format !== BACKUP_FORMAT
  ) {
    return { ok: false, error: 'not-a-backup' };
  }
  const version = (data as { version?: unknown }).version;
  if (typeof version === 'number' && version > BACKUP_VERSION)
    return { ok: false, error: 'newer-version' };

  // RN 3: a secret value in a hand-edited file is dropped, not imported.
  const projects = (data as { projects?: unknown }).projects;
  const sanitized = Array.isArray(projects)
    ? projects.map((p: { envVars?: unknown }) =>
        Array.isArray(p?.envVars) ? { ...p, envVars: withoutSecretValues(p.envVars) } : p,
      )
    : projects;
  const result = BackupSchema.safeParse({ ...data, projects: sanitized });
  return result.success ? { ok: true, backup: result.data } : { ok: false, error: 'invalid' };
}

/** RN 18: importing never deletes; a project whose id already exists asks what to do. */
export function findImportConflicts(backup: Backup, existingIds: ReadonlySet<string>): string[] {
  return backup.projects.filter((s) => existingIds.has(s.project.id)).map((s) => s.project.id);
}

/**
 * Copy of a project with new ids everywhere, keeping every reference intact
 * (import as a copy; duplicate).
 */
export function copyProject(
  snapshot: ProjectSnapshot,
  { createId, now, name }: { createId: () => string; now: number; name: string },
): ProjectSnapshot {
  const ids = new Map<string, string>();
  const remap = (id: string) => {
    let next = ids.get(id);
    if (!next) {
      next = createId();
      ids.set(id, next);
    }
    return next;
  };
  const projectId = remap(snapshot.project.id);
  const maybe = (id: string | undefined) => (id === undefined ? undefined : remap(id));

  return {
    project: { ...snapshot.project, id: projectId, name, createdAt: now, updatedAt: now },
    zones: snapshot.zones.map((z) => ({
      ...z,
      id: remap(z.id),
      projectId,
      parentId: z.parentId === null ? null : remap(z.parentId),
    })),
    items: snapshot.items.map((i) => ({
      ...i,
      id: remap(i.id),
      projectId,
      zoneId: remap(i.zoneId),
    })),
    connections: snapshot.connections.map((c) => ({
      ...c,
      id: remap(c.id),
      projectId,
      from: remap(c.from),
      to: remap(c.to),
    })),
    flows: snapshot.flows.map((f) => ({
      ...f,
      id: remap(f.id),
      projectId,
      steps: f.steps.map(remap),
    })),
    notes: snapshot.notes.map((n) => ({
      ...n,
      id: remap(n.id),
      projectId,
      itemId: maybe(n.itemId),
    })),
    risks: snapshot.risks.map((r) => ({
      ...r,
      id: remap(r.id),
      projectId,
      itemId: maybe(r.itemId),
    })),
    envVars: withoutSecretValues(snapshot.envVars).map((e) => ({
      ...e,
      id: remap(e.id),
      projectId,
    })),
    costs: snapshot.costs.map((c) => ({
      ...c,
      id: remap(c.id),
      projectId,
      itemId: maybe(c.itemId),
    })),
    checklist: snapshot.checklist.map((c) => ({
      ...c,
      id: remap(c.id),
      projectId,
      zoneId: remap(c.zoneId),
    })),
  };
}

/** RN 18: reminder after 7 days; "Lembrar depois" hides it for 1 day. */
export const BACKUP_REMINDER_DAYS = 7;
export const BACKUP_SNOOZE_DAYS = 1;
const DAY = 24 * 60 * 60 * 1000;

type ReminderState = {
  enabled: boolean;
  projectCount: number;
  lastBackupAt: number | undefined;
  snoozedUntil: number | undefined;
  now: number;
};

export function isBackupReminderDue({
  enabled,
  projectCount,
  lastBackupAt,
  snoozedUntil,
  now,
}: ReminderState): boolean {
  if (!enabled || projectCount === 0) return false;
  if (snoozedUntil !== undefined && now < snoozedUntil) return false;
  return lastBackupAt === undefined || now - lastBackupAt > BACKUP_REMINDER_DAYS * DAY;
}

export function snoozeBackupReminder(now: number): number {
  return now + BACKUP_SNOOZE_DAYS * DAY;
}
