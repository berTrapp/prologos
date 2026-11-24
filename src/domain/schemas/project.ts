import { z } from 'zod';
import { Id, Text, Timestamp } from './common';

/** RN 13: project types of the guided start. */
export const PROJECT_TYPES = ['web', 'api', 'mobile', 'site', 'unknown'] as const;
/** RN 4. */
export const PROJECT_STATUSES = ['planning', 'developing', 'paused', 'done', 'archived'] as const;
/** RN 2. */
export const VIEWS = ['today', 'complete'] as const;
/** RN 3: fixed environments; the person can add others. */
export const DEFAULT_ENVIRONMENTS = ['development', 'staging', 'production'] as const;

export const ProjectSchema = z.object({
  id: Id,
  name: Text(120),
  goal: z.string().trim().max(240).optional(),
  type: z.enum(PROJECT_TYPES),
  status: z.enum(PROJECT_STATUSES),
  kitId: z.string().min(1).optional(),
  view: z.enum(VIEWS),
  environments: z.array(Text(40)).min(1),
  createdAt: Timestamp,
  updatedAt: Timestamp,
});

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectType = Project['type'];
export type ProjectStatus = Project['status'];
export type View = Project['view'];
