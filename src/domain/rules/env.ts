import type { Language } from '@/i18n/languages';
import type { EnvVar } from '../schemas/env';
import type { Kit } from '../schemas/kit';
import type { ProjectSnapshot } from '../schemas/snapshot';
import type { Removal } from './map';

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

/** RN 3: secret, public (has the stack's public prefix) or configuration. */
export type EnvType = 'secret' | 'public' | 'config';

export function envType(
  envVar: Pick<EnvVar, 'key' | 'secret'>,
  publicPrefix: string | null,
): EnvType {
  if (envVar.secret) return 'secret';
  return publicPrefix && envVar.key.startsWith(publicPrefix) ? 'public' : 'config';
}

/** "6 variáveis · 2 segredos · 1 aviso" for one environment. */
export function envSummary(vars: readonly EnvVar[], publicPrefix: string | null) {
  const issues = validateEnvVars(vars, publicPrefix);
  return {
    count: vars.length,
    secrets: vars.filter((v) => v.secret).length,
    warnings: [...issues.values()].filter((list) => list.length > 0).length,
  };
}

export type EnvVarInput = {
  key: string;
  description?: string;
  usedIn: string[];
  secret: boolean;
  /** Only for non-secret variables (RN 3). */
  value?: string;
};

function buildEnvVar(
  id: string,
  projectId: string,
  environment: string,
  input: EnvVarInput,
): EnvVar {
  const base = {
    id,
    projectId,
    key: input.key.trim(),
    environment,
    usedIn: [...new Set(input.usedIn)],
    ...(input.description?.trim() ? { description: input.description.trim() } : {}),
  };
  if (input.secret) return { ...base, secret: true };
  return { ...base, secret: false, ...(input.value?.trim() ? { value: input.value.trim() } : {}) };
}

/** Adds a variable to each environment chosen; a secret never carries a value (RN 3). */
export function addEnvVar(
  snapshot: ProjectSnapshot,
  input: EnvVarInput,
  environments: readonly string[],
  createId: () => string,
): ProjectSnapshot {
  const added = environments.map((environment) =>
    buildEnvVar(createId(), snapshot.project.id, environment, input),
  );
  return { ...snapshot, envVars: [...snapshot.envVars, ...added] };
}

/** Edits one variable; turning it into a secret drops its value (RN 3). */
export function updateEnvVar(
  snapshot: ProjectSnapshot,
  envVarId: string,
  input: EnvVarInput,
): { snapshot: ProjectSnapshot; valueDiscarded: boolean } {
  let valueDiscarded = false;
  const envVars = snapshot.envVars.map((envVar) => {
    if (envVar.id !== envVarId) return envVar;
    valueDiscarded =
      input.secret && !envVar.secret && envVar.value !== undefined && envVar.value !== '';
    return buildEnvVar(envVar.id, envVar.projectId, envVar.environment, input);
  });
  return { snapshot: { ...snapshot, envVars }, valueDiscarded };
}

export function removeEnvVar(snapshot: ProjectSnapshot, envVarId: string): Removal {
  return {
    removed: { envVars: snapshot.envVars.filter((v) => v.id === envVarId) },
    snapshot: { ...snapshot, envVars: snapshot.envVars.filter((v) => v.id !== envVarId) },
  };
}

/** RN 3: the person can add environments beyond the three fixed ones. */
export function addEnvironment(snapshot: ProjectSnapshot, name: string): ProjectSnapshot {
  const trimmed = name.trim().slice(0, 40);
  if (!trimmed || snapshot.project.environments.includes(trimmed)) return snapshot;
  return {
    ...snapshot,
    project: { ...snapshot.project, environments: [...snapshot.project.environments, trimmed] },
  };
}

/**
 * The kit's variables in every environment given; the safe example only in development
 * and never on a secret (RN 3, 14).
 */
export function kitEnvVars(
  kit: Kit,
  language: Language,
  projectId: string,
  environments: readonly string[],
  createId: () => string,
): EnvVar[] {
  return environments.flatMap((environment) =>
    kit.envVars.map((source) =>
      buildEnvVar(createId(), projectId, environment, {
        key: source.key,
        description: source.what[language],
        usedIn: source.usedIn,
        secret: source.secret,
        // Examples are local values ("http://localhost:8000"): only in development.
        ...(source.example && !source.secret && environment === 'development'
          ? { value: source.example }
          : {}),
      }),
    ),
  );
}
