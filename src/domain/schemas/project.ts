import { z } from 'zod';
import { Id, Text, Timestamp } from './common';

/** RN 13: project types of the guided start. */
export const PROJECT_TYPES = ['web', 'api', 'mobile', 'site', 'unknown'] as const;
/** RN 4. */
export const PROJECT_STATUSES = ['planning', 'developing', 'paused', 'done', 'archived'] as const;
/** RN 2. */
export const VIEWS = ['today', 'complete'] as const;
/** RN 15: stacks a person can say they already know. */
export const KNOWN_STACKS = ['laravel', 'node', 'spring', 'dotnet', 'django'] as const;
/** RN 3: fixed environments; the person can add others. */
export const DEFAULT_ENVIRONMENTS = ['development', 'staging', 'production'] as const;

export const ProjectSchema = z.object({
  id: Id,
  name: Text(120),
  goal: z.string().trim().max(240).optional(),
  type: z.enum(PROJECT_TYPES),
  status: z.enum(PROJECT_STATUSES),
  kitId: z.string().min(1).optional(),
  /** RN 15: the stack the person already knows, for the equivalences. */
  knownStack: z.enum(KNOWN_STACKS).optional(),
  /** RN 15: steps of "Preparar o ambiente" already done, by their position in the kit. */
  prepDone: z.array(z.number().int().nonnegative()).optional(),
  /** RN 15: setup steps of a chosen option already done, as "ref:choice:position". */
  setupDone: z.array(z.string().max(200)).optional(),
  view: z.enum(VIEWS),
  environments: z.array(Text(40)).min(1),
  createdAt: Timestamp,
  updatedAt: Timestamp,
});

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectType = Project['type'];
export type ProjectStatus = Project['status'];
export type View = Project['view'];
export type KnownStack = (typeof KNOWN_STACKS)[number];
