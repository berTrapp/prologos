import { z } from 'zod';
import { Id, Text, Timestamp } from './common';
import { ProjectSnapshotSchema, SnapshotPartSchema } from './snapshot';

/** RN 8: automatic after an editing session, or named by the person. */
export const VersionSchema = z.discriminatedUnion('kind', [
  z.object({
    id: Id,
    projectId: Id,
    kind: z.literal('auto'),
    createdAt: Timestamp,
    snapshot: ProjectSnapshotSchema,
  }),
  z.object({
    id: Id,
    projectId: Id,
    kind: z.literal('named'),
    name: Text(80),
    createdAt: Timestamp,
    snapshot: ProjectSnapshotSchema,
  }),
]);

/** RN 11: what went to the trash, with everything that went along with it. */
export const TRASH_KINDS = [
  'project',
  'zone',
  'item',
  'connection',
  'flow',
  'note',
  'risk',
  'envVar',
  'cost',
] as const;

export const TrashEntrySchema = z.object({
  id: Id,
  /** Null for a whole project. */
  projectId: Id.nullable(),
  kind: z.enum(TRASH_KINDS),
  /** Name shown in the trash ("Redis"). */
  label: z.string().max(120),
  deletedAt: Timestamp,
  payload: SnapshotPartSchema,
});

export type Version = z.infer<typeof VersionSchema>;
export type TrashEntry = z.infer<typeof TrashEntrySchema>;
export type TrashKind = TrashEntry['kind'];
