import { describe, expect, expectTypeOf, it } from 'vitest';
import { EnvVarSchema, type EnvVar, type SecretEnvVar } from '../schemas/env';
import { isValidEnvKey, setSecret, validateEnvVars, withoutSecretValues } from './env';

const base = { projectId: 'p1', environment: 'development', usedIn: ['back'] };
const plain = (id: string, key: string, patch: Partial<EnvVar> = {}): EnvVar =>
  ({ id, key, ...base, secret: false, ...patch }) as EnvVar;
const secret = (id: string, key: string, patch: Partial<EnvVar> = {}): EnvVar =>
  ({ id, key, ...base, secret: true, ...patch }) as EnvVar;

describe('env keys (RN 3)', () => {
  it.each(['APP_KEY', 'DB_HOST', 'VITE_API_URL', 'CONNECTIONSTRINGS__DEFAULT', 'S3'])(
    'accepts %s',
    (key) => {
      expect(isValidEnvKey(key)).toBe(true);
    },
  );

  it.each(['app_key', 'App_Key', '1KEY', 'KEY-NAME', 'KEY_', '_KEY', 'KEY NAME', ''])(
    'rejects "%s"',
    (key) => {
      expect(isValidEnvKey(key)).toBe(false);
    },
  );
});

describe('validateEnvVars (RN 3)', () => {
  it('flags invalid keys', () => {
    expect(validateEnvVars([plain('a', 'app_env')], null).get('a')).toEqual(['invalid-key']);
  });

  it('does not repeat a key in the same environment, but allows it in another', () => {
    const issues = validateEnvVars(
      [
        plain('a', 'APP_ENV'),
        plain('b', 'APP_ENV'),
        plain('c', 'APP_ENV', { environment: 'production' }),
      ],
      null,
    );
    expect(issues.get('a')).toBeUndefined();
    expect(issues.get('b')).toEqual(['duplicate-key']);
    expect(issues.get('c')).toBeUndefined();
  });

  it('variables used on the client need the kit public prefix', () => {
    const issues = validateEnvVars(
      [
        plain('a', 'API_URL', { usedIn: ['front'] }),
        plain('b', 'VITE_API_URL', { usedIn: ['front'] }),
      ],
      'VITE_',
    );
    expect(issues.get('a')).toEqual(['missing-public-prefix']);
    expect(issues.get('b')).toBeUndefined();
  });

  it('warns when a secret is in a public variable or reaches the client', () => {
    const issues = validateEnvVars(
      [
        secret('a', 'VITE_STRIPE_KEY', { usedIn: ['front'] }),
        secret('b', 'EXPO_TOKEN', { usedIn: ['app'] }),
      ],
      'VITE_',
    );
    expect(issues.get('a')).toEqual(['secret-is-public']);
    expect(issues.get('b')).toEqual(['secret-is-public']);
  });

  it('without a public prefix (no client), only key rules apply', () => {
    expect(validateEnvVars([plain('a', 'API_URL', { usedIn: ['front'] })], null).size).toBe(0);
  });
});

describe('secrets never keep a value (RN 3)', () => {
  it('the secret type has no value field', () => {
    expectTypeOf<SecretEnvVar>().not.toHaveProperty('value');
  });

  it('the schema rejects a secret with a value', () => {
    const input = { id: 'a', key: 'APP_KEY', ...base, secret: true, value: 'base64:abc' };
    expect(EnvVarSchema.safeParse(input).success).toBe(false);
  });

  it('the schema accepts an optional value on a non-secret variable', () => {
    expect(
      EnvVarSchema.safeParse({ id: 'a', key: 'APP_ENV', ...base, secret: false, value: 'local' })
        .success,
    ).toBe(true);
    expect(
      EnvVarSchema.safeParse({ id: 'a', key: 'APP_ENV', ...base, secret: false }).success,
    ).toBe(true);
  });

  it('marking as secret discards the stored value and says so', () => {
    const result = setSecret(
      plain('a', 'DB_PASSWORD', { value: 'local-only' } as Partial<EnvVar>),
      true,
    );
    expect(result.valueDiscarded).toBe(true);
    expect(result.envVar).not.toHaveProperty('value');
    expect(result.envVar.secret).toBe(true);
  });

  it('marking as secret without a value discards nothing', () => {
    expect(setSecret(plain('a', 'DB_PASSWORD'), true).valueDiscarded).toBe(false);
  });

  it('unmarking keeps the variable without a value', () => {
    const result = setSecret(secret('a', 'DB_PASSWORD'), false);
    expect(result.envVar).toMatchObject({ secret: false });
    expect(result.envVar).not.toHaveProperty('value');
    expect(setSecret(plain('b', 'APP_ENV'), false).envVar.key).toBe('APP_ENV');
  });

  it('strips any value that slipped into a secret', () => {
    const leaked = { ...secret('a', 'APP_KEY'), value: 'should-not-exist' } as EnvVar & {
      value: string;
    };
    const [clean] = withoutSecretValues([
      leaked,
      plain('b', 'APP_ENV', { value: 'local' } as Partial<EnvVar>),
    ]);
    expect(clean).not.toHaveProperty('value');
    expect(EnvVarSchema.safeParse(clean).success).toBe(true);
  });
});
