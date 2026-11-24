/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { KitSchema } from './kit';

const KITS_DIR = join(process.cwd(), 'docs/kits');

function kitJson(file: string): unknown {
  const source = readFileSync(join(KITS_DIR, file), 'utf8');
  const block = /```json\n([\s\S]*?)```/.exec(source)?.[1];
  if (!block) throw new Error(`No JSON block in ${file}`);
  return JSON.parse(block);
}

const files = readdirSync(KITS_DIR).filter((file) => file.endsWith('.md'));

describe('kits in docs/kits (RN 14)', () => {
  it('has the 8 curated kits', () => {
    expect(files).toHaveLength(8);
  });

  it.each(files)('%s matches the kit schema and its references hold', (file) => {
    const result = KitSchema.safeParse(kitJson(file));
    expect(
      result.success ? [] : result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    ).toEqual([]);
  });
});

describe('KitSchema', () => {
  const valid = kitJson('laravel-react.md') as Record<string, unknown>;

  it('rejects an example value on a secret variable (RN 3)', () => {
    const envVars = [
      {
        key: 'APP_KEY',
        secret: true,
        example: 'base64:abc',
        usedIn: ['back'],
        what: valid.summary,
      },
    ];
    expect(KitSchema.safeParse({ ...valid, envVars }).success).toBe(false);
  });

  it('rejects kit text missing a language (RN 17)', () => {
    expect(KitSchema.safeParse({ ...valid, summary: { 'pt-BR': 'Só português' } }).success).toBe(
      false,
    );
  });

  it('rejects a flow step without a connection', () => {
    const flows = [{ id: 'x', name: valid.summary, path: ['kanban', 'database'] }];
    expect(KitSchema.safeParse({ ...valid, flows }).success).toBe(false);
  });
});
