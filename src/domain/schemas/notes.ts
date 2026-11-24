import { z } from 'zod';
import { Id, Text, Timestamp } from './common';

export const NoteSchema = z.object({
  id: Id,
  projectId: Id,
  itemId: Id.optional(),
  text: Text(2000),
  /** Private notes never leave in mapa.html (RN 19). */
  private: z.boolean(),
  createdAt: Timestamp,
});

/** RN 9. */
export const SEVERITIES = ['high', 'medium', 'low'] as const;

export const RiskSchema = z.object({
  id: Id,
  projectId: Id,
  itemId: Id.optional(),
  text: Text(500),
  severity: z.enum(SEVERITIES),
  resolved: z.boolean(),
  createdAt: Timestamp,
});

export type Note = z.infer<typeof NoteSchema>;
export type Risk = z.infer<typeof RiskSchema>;
export type Severity = Risk['severity'];
