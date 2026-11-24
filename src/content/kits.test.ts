/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SUPPORTED_LANGUAGES } from '@/i18n/languages';
import type { KitName } from '@/domain/schemas/kit';
import { KITS, KIT_ORDER, findKit } from './kits';

const DOCS = join(process.cwd(), 'docs/kits');

function docBlock(file: string): unknown {
  const block = /```json\n([\s\S]*?)```/.exec(readFileSync(join(DOCS, file), 'utf8'))?.[1];
  if (!block) throw new Error(`No JSON block in ${file}`);
  return JSON.parse(block);
}

const names = (value: KitName) =>
  typeof value === 'string' ? [value] : SUPPORTED_LANGUAGES.map((lng) => value[lng]);

describe('content kits (RN 14)', () => {
  it('loads the 8 curated kits in order', () => {
    expect(KITS.map((kit) => kit.id)).toEqual([...KIT_ORDER]);
  });

  it.each(readdirSync(DOCS).filter((f) => f.endsWith('.md')))(
    '%s is identical to its JSON file (run npm run kits:extract)',
    (file) => {
      const doc = docBlock(file) as { id: string };
      const json: unknown = JSON.parse(
        readFileSync(join(process.cwd(), 'src/content/kits', `${doc.id}.json`), 'utf8'),
      );
      expect(json).toEqual(doc);
    },
  );

  it.each(KITS.map((kit) => [kit.id, kit] as const))(
    '%s pins no version number in names',
    (_id, kit) => {
      const all = [
        ...names(kit.name),
        ...kit.items.flatMap((item) => names(item.name)),
        ...kit.technologies.flatMap((tech) => names(tech.name)),
        ...Object.values(kit.pendingOptions).flatMap((options) =>
          options.flatMap((option) => names(option.name)),
        ),
      ];
      expect(all.filter((name) => /\d/.test(name))).toEqual([]);
    },
  );

  it('finds a kit by id', () => {
    expect(findKit('django')?.id).toBe('django');
    expect(findKit('nope')).toBeUndefined();
    expect(findKit(undefined)).toBeUndefined();
  });
});
