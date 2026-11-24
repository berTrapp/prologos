import type { EnvVar } from '../schemas/env';

/** RN 3: keys in MAIÚSCULAS_COM_UNDERSCORE. */
export const ENV_KEY_PATTERN = /^[A-Z][A-Z0-9]*(?:_+[A-Z0-9]+)*$/;

/** Where a variable reaches the client (browser or app), so it must carry the public prefix. */
export const CLIENT_SIDES = ['front', 'app'] as const;

export type EnvIssue =
  'invalid-key' | 'duplicate-key' | 'missing-public-prefix' | 'secret-is-public';

export function isValidEnvKey(key: string): boolean {
  return ENV_KEY_PATTERN.test(key);
}

/** RN 3: validation of every variable of a project; returns issues by variable id. */
export function validateEnvVars(
  vars: readonly EnvVar[],
  publicPrefix: string | null,
): Map<string, EnvIssue[]> {
  const issues = new Map<string, EnvIssue[]>();
  const add = (id: string, issue: EnvIssue) => issues.set(id, [...(issues.get(id) ?? []), issue]);

  const seen = new Map<string, string>();
  for (const envVar of vars) {
    if (!isValidEnvKey(envVar.key)) add(envVar.id, 'invalid-key');

    const slot = `${envVar.environment}\u0000${envVar.key}`;
    const first = seen.get(slot);
    if (first === undefined) seen.set(slot, envVar.id);
    else add(envVar.id, 'duplicate-key');

    if (publicPrefix) {
      const isPublic = envVar.key.startsWith(publicPrefix);
      const onClient = envVar.usedIn.some((side) =>
        (CLIENT_SIDES as readonly string[]).includes(side),
      );
      if (onClient && !isPublic && !envVar.secret) add(envVar.id, 'missing-public-prefix');
      if (envVar.secret && (isPublic || onClient)) add(envVar.id, 'secret-is-public');
    }
  }
  return issues;
}

/**
 * RN 3: marking a variable as secret discards any stored value.
 * `valueDiscarded` lets the screen say so ("o valor guardado foi apagado", ux-ui 14).
 */
export function setSecret(
  envVar: EnvVar,
  secret: boolean,
): { envVar: EnvVar; valueDiscarded: boolean } {
  if (secret) {
    const valueDiscarded = !envVar.secret && envVar.value !== undefined && envVar.value !== '';
    const { id, projectId, key, description, environment, usedIn } = envVar;
    return {
      envVar: { id, projectId, key, description, environment, usedIn, secret: true },
      valueDiscarded,
    };
  }
  if (!envVar.secret) return { envVar, valueDiscarded: false };
  return { envVar: { ...envVar, secret: false }, valueDiscarded: false };
}

/** RN 3: a secret value never leaves this function, whatever the input carried. */
export function withoutSecretValues<T extends EnvVar>(
  vars: readonly (T & { value?: string })[],
): EnvVar[] {
  return vars.map((envVar) => (envVar.secret ? setSecret(envVar, true).envVar : envVar));
}
