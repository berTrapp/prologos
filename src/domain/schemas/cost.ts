import { z } from 'zod';
import { ITEM_WHEN } from './map';
import { Id, Text } from './common';

/** RN 6: kept in the original currency and period. */
export const COST_PERIODS = ['monthly', 'yearly'] as const;

export const CostSchema = z.object({
  id: Id,
  projectId: Id,
  itemId: Id.optional(),
  name: Text(80),
  amount: z.number().nonnegative().finite(),
  /** ISO 4217 code (BRL, USD, EUR). */
  currency: z.string().regex(/^[A-Z]{3}$/),
  period: z.enum(COST_PERIODS),
  /** Free plan limit as text, for reference only (RN 6). */
  freeTierLimit: z.string().max(200).optional(),
  when: z.enum(ITEM_WHEN),
});

export type Cost = z.infer<typeof CostSchema>;
