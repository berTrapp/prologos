import { describe, expect, it } from 'vitest';
import { SUPPORTED_LANGUAGES } from './languages';
import { resources } from './resources';

type Tree = { [key: string]: string | Tree };

function flattenKeys(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [path] : flattenKeys(value, path);
  });
}

const reference = resources['pt-BR'];

// RN 17: pt-BR is the reference; any key missing in en or es is reported here.
describe.each(SUPPORTED_LANGUAGES.filter((lng) => lng !== 'pt-BR'))('locale %s', (lng) => {
  for (const [ns, tree] of Object.entries(reference)) {
    const expected = flattenKeys(tree as Tree);
    const actual = flattenKeys((resources[lng] as Record<string, Tree>)[ns] ?? {});

    it(`has every key of pt-BR in "${ns}"`, () => {
      expect(expected.filter((key) => !actual.includes(key))).toEqual([]);
    });

    it(`has no key missing from pt-BR in "${ns}"`, () => {
      expect(actual.filter((key) => !expected.includes(key))).toEqual([]);
    });
  }
});

describe('pt-BR locale', () => {
  it('has no empty strings', () => {
    for (const tree of Object.values(reference)) {
      const values = JSON.stringify(tree);
      expect(values).not.toMatch(/:""/);
    }
  });
});
