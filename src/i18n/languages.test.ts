import { describe, expect, it } from 'vitest';
import { resolveLanguage } from './languages';

describe('resolveLanguage', () => {
  it.each([
    ['pt-BR', 'pt-BR'],
    ['pt-PT', 'pt-BR'],
    ['pt', 'pt-BR'],
    ['en-US', 'en'],
    ['en', 'en'],
    ['es-MX', 'es'],
    ['es_AR', 'es'],
  ])('maps %s to %s', (tag, expected) => {
    expect(resolveLanguage(tag)).toBe(expected);
  });

  it.each([['fr-FR'], ['de'], [''], [undefined], [null]])('falls back to pt-BR for %s', (tag) => {
    expect(resolveLanguage(tag)).toBe('pt-BR');
  });
});
