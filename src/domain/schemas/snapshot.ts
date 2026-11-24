import { z } from 'zod';
import { ChecklistExpectationSchema } from './checklist';
import { CostSchema } from './cost';
import { EnvVarSchema } from './env';
import { ConnectionSchema, FlowSchema, ItemSchema, ZoneSchema } from './map';
import { NoteSchema, RiskSchema } from './notes';
import { ProjectSchema } from './project';

/** A whole project with everything inside it. */
export const ProjectSnapshotSchema = z.object({
  project: ProjectSchema,
  zones: z.array(ZoneSchema),
  items: z.array(ItemSchema),
  connections: z.array(ConnectionSchema),
  flows: z.array(FlowSchema),
  notes: z.array(NoteSchema),
  risks: z.array(RiskSchema),
  envVars: z.array(EnvVarSchema),
  costs: z.array(CostSchema),
  checklist: z.array(ChecklistExpectationSchema),
});

export type ProjectSnapshot = z.infer<typeof ProjectSnapshotSchema>;

/** Collections of a snapshot that hold rows (everything but the project itself). */
export const SNAPSHOT_COLLECTIONS = [
  'zones',
  'items',
  'connections',
  'flows',
  'notes',
  'risks',
  'envVars',
  'costs',
  'checklist',
] as const;
export type SnapshotCollection = (typeof SNAPSHOT_COLLECTIONS)[number];

/** Part of a project, used for trash entries. */
export const SnapshotPartSchema = ProjectSnapshotSchema.omit({ project: true })
  .partial()
  .extend({ project: ProjectSchema.optional() });
export type SnapshotPart = z.infer<typeof SnapshotPartSchema>;
