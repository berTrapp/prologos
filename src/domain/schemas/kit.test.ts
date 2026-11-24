/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { KitSchema, type Kit } from './kit';

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

  it.each([
    ['a duplicate item id', (k: Kit) => ({ ...k, items: [...k.items, k.items[0]] })],
    ['an item in a zone the kit does not have', (k: Kit) => ({ ...k, zones: k.zones.slice(1) })],
    ['an item with an unknown technology', (k: Kit) => ({ ...k, technologies: [] })],
    [
      'a connection to a missing item',
      (k: Kit) => ({ ...k, connections: [{ from: 'kanban', to: 'gone' }] }),
    ],
    ['a checklist entry for a missing item', (k: Kit) => ({ ...k, checklist: { data: ['gone'] } })],
    [
      'options for a missing item',
      (k: Kit) => ({ ...k, pendingOptions: { gone: k.pendingOptions.database } }),
    ],
  ])('rejects %s', (_label, mutate) => {
    const kit = KitSchema.parse(valid);
    expect(KitSchema.safeParse(mutate(kit)).success).toBe(false);
  });
});
