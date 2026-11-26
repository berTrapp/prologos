import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { makeSnapshot, testId } from '@/domain/fixtures';
import { parseDotenv } from '@/domain/rules/dotenv';
import { applyImport, classifyImport } from '@/domain/rules/env-import';
import { PrologosDb } from './db';
import { DexieProjectRepository } from './dexie-repository';

let db: PrologosDb;

beforeEach(() => {
  db = new PrologosDb(`env-${crypto.randomUUID()}`);
});

afterEach(async () => {
  await db.delete();
});

const SECRETS = ['super-secret-password', 'sk_live_not_real_but_secret', 'base64:also-a-secret'];

// Fase 7 acceptance: after importing a .env, no value reaches IndexedDB (RN 3).
describe('importing a .env', () => {
  it('stores keys, never values', async () => {
    const env = [
      `DB_PASSWORD=${SECRETS[0]}`,
      `STRIPE_SECRET="${SECRETS[1]}"`,
      `APP_KEY=${SECRETS[2]}`,
      'APP_ENV=production',
      'DB_HOST=db.internal',
    ].join('\n');
    const snapshot = makeSnapshot();
    const context = {
      existing: [],
      environments: ['development', 'production'],
      destination: 'server' as const,
      clientSide: 'front',
      publicPrefix: 'VITE_',
    };
    const rows = classifyImport(parseDotenv(env), context);
    const { snapshot: next } = applyImport(snapshot, rows, context, testId);

    const repo = new DexieProjectRepository(db);
    await repo.saveProject(next);

    const stored = await db.envVars.toArray();
    expect(stored).toHaveLength(10);
    expect(stored.every((row) => !('value' in row))).toBe(true);
    const raw = JSON.stringify(stored);
    for (const secret of SECRETS) expect(raw).not.toContain(secret);
    expect(raw).not.toContain('db.internal');
  });
});
