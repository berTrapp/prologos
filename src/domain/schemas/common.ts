import { z } from 'zod';

export const Id = z.string().min(1);
export const Timestamp = z.number().int().nonnegative();
/** Free text the person wrote; kept as written (RN 17). */
export const Text = (max: number) => z.string().trim().min(1).max(max);
