import { z } from 'zod';
import { Id, Text } from './common';

const base = {
  id: Id,
  projectId: Id,
  key: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  environment: Text(40),
  /** Where it is used: front, back, docker… (RN 3). */
  usedIn: z.array(Text(40)),
};

/**
 * RN 3: Prólogos never stores secret values.
 * A secret variable has no value field at all; strict objects reject one if it shows up.
 */
export const SecretEnvVarSchema = z.strictObject({ ...base, secret: z.literal(true) });
export const PlainEnvVarSchema = z.strictObject({
  ...base,
  secret: z.literal(false),
  /** Optional for non-secret values (APP_ENV=production). */
  value: z.string().max(2000).optional(),
});

export const EnvVarSchema = z.discriminatedUnion('secret', [SecretEnvVarSchema, PlainEnvVarSchema]);

export type SecretEnvVar = z.infer<typeof SecretEnvVarSchema>;
export type PlainEnvVar = z.infer<typeof PlainEnvVarSchema>;
export type EnvVar = z.infer<typeof EnvVarSchema>;
