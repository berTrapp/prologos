import { describe, expect, it } from 'vitest';
import { KITS, findKit } from '@/content/kits';
import { makeSnapshot, testId } from '../fixtures';
import { EnvVarSchema, type EnvVar } from '../schemas/env';
import type { ProjectSnapshot } from '../schemas/snapshot';
import { parseDotenv } from './dotenv';
import {
  addEnvVar,
  addEnvironment,
  envSummary,
  envType,
  kitEnvVars,
  removeEnvVar,
  updateEnvVar,
} from './env';
import { applyImport, classifyImport, looksSecret, rowFor, type ImportContext } from './env-import';

const existing: EnvVar[] = [
  {
    id: 'a',
    projectId: 'p1',
    key: 'VITE_API_URL',
    environment: 'development',
    usedIn: ['front'],
    secret: false,
  },
  {
    id: 'b',
    projectId: 'p1',
    key: 'VITE_APP_NAME',
    environment: 'development',
    usedIn: ['front'],
    secret: false,
  },
  {
    id: 'c',
    projectId: 'p1',
    key: 'VITE_ENABLE_SHARING',
    environment: 'development',
    usedIn: ['front'],
    secret: false,
  },
  {
    id: 'd',
    projectId: 'p1',
    key: 'VITE_API_URL',
    environment: 'production',
    usedIn: ['back'],
    secret: false,
  },
];

const client: ImportContext = {
  existing,
  environments: ['development'],
  destination: 'client',
  clientSide: 'front',
  publicPrefix: 'VITE_',
};

const env = [
  'VITE_APP_NAME=Prólogos',
  'VITE_API_URL=https://api.exemplo.com',
  'VITE_SENTRY_DSN=https://chave-publica@o0.ingest.sentry.io/1',
  'VITE_ENABLE_SHARING=false',
  'DB_PASSWORD=super-secret-value',
  'SENTRY_ORG=bertrapp',
  'not valid',
].join('\n');

describe('looksSecret (RN 3)', () => {
  it.each([
    'DB_PASSWORD',
    'APP_KEY',
    'JWT__KEY',
    'STRIPE_SECRET',
    'GITHUB_TOKEN',
    'VITE_STRIPE_SECRET',
    'OPENAI_API_KEY',
    'PRIVATE_KEY',
  ])('sees %s as a secret', (key) => expect(looksSecret(key)).toBe(true));
  it.each([
    'APP_ENV',
    'DB_HOST',
    'VITE_API_URL',
    'VITE_STRIPE_PUBLIC_KEY',
    'VITE_SENTRY_DSN',
    'KEYBOARD_LAYOUT',
  ])('sees %s as not secret', (key) => expect(looksSecret(key)).toBe(false));
  it('trusts the kit mark', () => {
    expect(looksSecret('CONNECTIONSTRINGS__DEFAULT', new Set(['CONNECTIONSTRINGS__DEFAULT']))).toBe(
      true,
    );
  });
});

describe('classifyImport (RN 3)', () => {
  const rows = classifyImport(parseDotenv(env), client);
  const row = (key: string) => rows.find((r) => r.key === key);

  it('classifies new, same and invalid lines', () => {
    expect(row('VITE_APP_NAME')?.status).toBe('same');
    expect(row('VITE_SENTRY_DSN')?.status).toBe('new');
    expect(row('not valid')?.status).toBe('invalid');
  });

  it('marks as update a variable that changes where it is used or its secret mark', () => {
    const both = classifyImport(parseDotenv('VITE_API_URL=x'), {
      ...client,
      environments: ['development', 'production'],
    });
    expect(both[0]?.status).toBe('update');
  });

  it('warns about a secret going to the client and about the missing prefix', () => {
    expect(row('DB_PASSWORD')).toMatchObject({
      secret: true,
      warnings: ['secret-on-client', 'missing-public-prefix'],
      selected: false,
    });
    expect(row('SENTRY_ORG')).toMatchObject({
      warnings: ['missing-public-prefix'],
      selected: true,
    });
  });

  it('checks new and updated rows by default, not equal ones', () => {
    expect(rows.filter((r) => r.selected).map((r) => r.key)).toEqual([
      'VITE_SENTRY_DSN',
      'SENTRY_ORG',
    ]);
  });

  it('does not warn on the server, and recomputes when the person changes the secret mark', () => {
    const server = { ...client, destination: 'server' as const };
    const serverRows = classifyImport(parseDotenv('DB_PASSWORD=x'), server);
    expect(serverRows[0]).toMatchObject({ warnings: [], selected: true, status: 'new' });
    expect(rowFor(1, 'DB_PASSWORD', 'x', false, client).warnings).toEqual([
      'missing-public-prefix',
    ]);
  });

  it('keeps only the last line of a repeated key', () => {
    const repeated = classifyImport(parseDotenv('NEW_ONE=1\nNEW_ONE=2'), client);
    expect(repeated).toHaveLength(1);
    expect(repeated[0]?.value).toBe('2');
  });

  it('reports an invalid key as invalid', () => {
    expect(classifyImport(parseDotenv('lower=1'), client)[0]?.status).toBe('invalid');
  });
});

describe('applyImport (RN 3)', () => {
  const snapshot: ProjectSnapshot = { ...makeSnapshot(), envVars: existing };

  it('adds the chosen rows to each environment and never keeps a value', () => {
    const rows = classifyImport(parseDotenv(env), {
      ...client,
      environments: ['development', 'production'],
    }).map((r) => (r.key === 'DB_PASSWORD' ? { ...r, selected: true } : r));
    const result = applyImport(
      snapshot,
      rows,
      { environments: ['development', 'production'], destination: 'client', clientSide: 'front' },
      testId,
      (key) => (key === 'SENTRY_ORG' ? 'Organização no Sentry' : undefined),
    );
    for (const envVar of result.snapshot.envVars) {
      expect(EnvVarSchema.safeParse(envVar).success).toBe(true);
      expect(envVar).not.toHaveProperty('value');
    }
    const password = result.snapshot.envVars.filter((v) => v.key === 'DB_PASSWORD');
    expect(password.map((v) => v.environment)).toEqual(['development', 'production']);
    expect(password.every((v) => v.secret)).toBe(true);
    expect(result.snapshot.envVars.find((v) => v.key === 'SENTRY_ORG')?.description).toBe(
      'Organização no Sentry',
    );
    const prod = result.snapshot.envVars.find(
      (v) => v.key === 'VITE_API_URL' && v.environment === 'production',
    );
    expect(prod?.usedIn).toEqual(['back', 'front']);
    expect(result.added).toBeGreaterThan(0);
    expect(result.updated).toBeGreaterThan(0);
    expect(result.ignored).toBe(
      rows.filter((r) => !r.selected || r.status === 'invalid' || r.status === 'same').length,
    );
  });

  it('drops a value when an existing plain variable becomes secret', () => {
    const withValue: ProjectSnapshot = {
      ...snapshot,
      envVars: [
        {
          id: 'z',
          projectId: 'p1',
          key: 'SESSION_KEY',
          environment: 'development',
          usedIn: ['back'],
          secret: false,
          value: 'kept',
        },
      ],
    };
    const rows = classifyImport(parseDotenv('SESSION_KEY=new'), {
      ...client,
      existing: withValue.envVars,
      destination: 'server',
    });
    const result = applyImport(
      withValue,
      rows,
      { environments: ['development'], destination: 'server', clientSide: 'front' },
      testId,
    );
    expect(result.snapshot.envVars[0]).toEqual({
      id: 'z',
      projectId: 'p1',
      key: 'SESSION_KEY',
      environment: 'development',
      usedIn: ['back'],
      secret: true,
    });
  });
});

describe('env editing (RN 3)', () => {
  const snapshot = makeSnapshot();

  it('types a variable as secret, public or configuration', () => {
    expect(envType({ key: 'APP_KEY', secret: true }, 'VITE_')).toBe('secret');
    expect(envType({ key: 'VITE_API_URL', secret: false }, 'VITE_')).toBe('public');
    expect(envType({ key: 'DB_HOST', secret: false }, 'VITE_')).toBe('config');
    expect(envType({ key: 'VITE_API_URL', secret: false }, null)).toBe('config');
  });

  it('adds to each environment, edits, and a secret drops its value', () => {
    const added = addEnvVar(
      snapshot,
      {
        key: ' APP_ENV ',
        description: ' Ambiente ',
        usedIn: ['back', 'back'],
        secret: false,
        value: 'local',
      },
      ['development', 'production'],
      testId,
    );
    expect(added.envVars).toHaveLength(2);
    expect(added.envVars[0]).toMatchObject({
      key: 'APP_ENV',
      description: 'Ambiente',
      usedIn: ['back'],
      value: 'local',
    });
    const id = added.envVars[0]?.id ?? '';
    const secret = updateEnvVar(added, id, {
      key: 'APP_ENV',
      usedIn: ['back'],
      secret: true,
      value: 'local',
    });
    expect(secret.valueDiscarded).toBe(true);
    expect(secret.snapshot.envVars[0]).not.toHaveProperty('value');
    expect(
      updateEnvVar(secret.snapshot, id, { key: 'APP_ENV', usedIn: ['back'], secret: true })
        .valueDiscarded,
    ).toBe(false);
    const { snapshot: without, removed } = removeEnvVar(secret.snapshot, id);
    expect(without.envVars).toHaveLength(1);
    expect(removed.envVars?.[0]?.id).toBe(id);
  });

  it('adds an environment once', () => {
    const next = addEnvironment(snapshot, ' Preview ');
    expect(next.project.environments).toEqual(['development', 'staging', 'production', 'Preview']);
    expect(addEnvironment(next, 'Preview')).toBe(next);
    expect(addEnvironment(next, '  ')).toBe(next);
  });

  it('sums up an environment', () => {
    const vars: EnvVar[] = [
      {
        id: '1',
        projectId: 'p1',
        key: 'APP_KEY',
        environment: 'development',
        usedIn: ['back'],
        secret: true,
      },
      {
        id: '2',
        projectId: 'p1',
        key: 'VITE_STRIPE_SECRET',
        environment: 'development',
        usedIn: ['front'],
        secret: true,
      },
      {
        id: '3',
        projectId: 'p1',
        key: 'DB_HOST',
        environment: 'development',
        usedIn: ['back'],
        secret: false,
      },
    ];
    expect(envSummary(vars, 'VITE_')).toEqual({ count: 3, secrets: 2, warnings: 1 });
  });

  it.each(KITS.map((kit) => [kit.id] as const))('seeds the variables of %s safely', (kitId) => {
    const kit = findKit(kitId);
    if (!kit) throw new Error(kitId);
    const vars = kitEnvVars(kit, 'pt-BR', 'p1', ['development', 'production'], testId);
    expect(vars).toHaveLength(kit.envVars.length * 2);
    for (const envVar of vars) {
      expect(EnvVarSchema.safeParse(envVar).success).toBe(true);
      if (envVar.secret || envVar.environment !== 'development')
        expect(envVar).not.toHaveProperty('value');
    }
  });
});
