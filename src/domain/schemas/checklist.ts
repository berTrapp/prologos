import { z } from 'zod';
import { Id, Text } from './common';

/** RN 5: an item a zone is expected to have, which can be marked "Não se aplica". */
export const ChecklistExpectationSchema = z.object({
  id: Id,
  projectId: Id,
  zoneId: Id,
  /** Kit item id it expects (database, https…). */
  itemRef: z.string().min(1),
  notApplicable: z.object({ reason: Text(140) }).optional(),
  order: z.number().int().nonnegative(),
});

export type ChecklistExpectation = z.infer<typeof ChecklistExpectationSchema>;
