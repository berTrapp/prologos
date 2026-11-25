import { describe, expect, it } from 'vitest';
import { findKit } from '@/content/kits';
import { makeItem, makeSnapshot, zoneByKey } from '../fixtures';
import type { Kit } from '../schemas/kit';
import {
  choiceDisplayName,
  followLanguage,
  itemDisplayName,
  itemKnowledge,
  suggestionsFor,
} from './kit-lookup';

const kit = (id: string): Kit => {
  const found = findKit(id);
  if (!found) throw new Error(id);
  return found;
};

describe('names follow the language until renamed (RN 17)', () => {
  it('translates a kit item name the person has not changed', () => {
    const item = { name: 'Filas', kitRef: 'queues' };
    expect(itemDisplayName(item, kit('laravel-react'), 'en')).toBe('Queues');
    expect(itemDisplayName({ name: 'Queues', kitRef: 'queues' }, kit('laravel-react'), 'es')).toBe(
      'Colas',
    );
  });

  it('keeps a renamed item, an item without kit, or a missing kit as written', () => {
    expect(
      itemDisplayName({ name: 'Fila de e-mails', kitRef: 'queues' }, kit('laravel-react'), 'en'),
    ).toBe('Fila de e-mails');
    expect(itemDisplayName({ name: 'Meu item' }, kit('laravel-react'), 'en')).toBe('Meu item');
    expect(itemDisplayName({ name: 'Filas', kitRef: 'queues' }, undefined, 'en')).toBe('Filas');
    expect(followLanguage('Stack', ['Stack'], 'Pila')).toBe('Pila');
  });

  it('translates a chosen option of the kit, and keeps one the person wrote', () => {
    const laravel = kit('laravel-react');
    expect(
      choiceDisplayName({ choice: 'Só local por enquanto', kitRef: 'hosting' }, laravel, 'en'),
    ).toBe('Local only for now');
    expect(choiceDisplayName({ choice: 'Fly.io', kitRef: 'hosting' }, laravel, 'en')).toBe(
      'Fly.io',
    );
    expect(choiceDisplayName({ kitRef: 'hosting' }, laravel, 'en')).toBeUndefined();
    expect(choiceDisplayName({ choice: 'X' }, laravel, 'en')).toBe('X');
  });
});

describe('itemKnowledge (RN 15)', () => {
  it('explains what it is, why it is there and where the docs are', () => {
    const info = itemKnowledge(
      { kitRef: 'eloquent', tech: 'laravel' },
      kit('laravel-react'),
      undefined,
      'pt-BR',
    );
    expect(info.what).toMatch(/Framework do back-end/);
    expect(info.why).toMatch(/Transforma tabelas/);
    expect(info.docs).toBe('https://laravel.com/docs/eloquent');
    expect(info.options).toEqual([]);
    expect(info.equivalent).toBeUndefined();
  });

  it('shows the equivalent in the stack the person knows', () => {
    const info = itemKnowledge(
      { kitRef: 'orm', tech: 'django' },
      kit('django'),
      kit('laravel-react'),
      'pt-BR',
    );
    expect(info.equivalent).toEqual({ concept: 'orm', value: 'Eloquent' });
    const same = itemKnowledge({ kitRef: 'orm' }, kit('django'), kit('django'), 'pt-BR');
    expect(same.equivalent).toBeUndefined();
  });

  it('lists the options of a pending item with the recommended one', () => {
    const info = itemKnowledge({ kitRef: 'database' }, kit('laravel-react'), undefined, 'en');
    expect(info.options.map((o) => [o.name, o.recommended])).toEqual([
      ['PostgreSQL', true],
      ['MySQL', false],
      ['SQLite', false],
    ]);
    expect(info.options[2]?.why).toMatch(/single file/);
  });

  it('knows nothing about an item without a kit', () => {
    expect(itemKnowledge({}, undefined, undefined, 'pt-BR')).toEqual({ options: [] });
  });
});

describe('suggestionsFor', () => {
  it('suggests the kit items of the zone that are not on the map', () => {
    const snapshot = makeSnapshot();
    const data = zoneByKey(snapshot, 'data');
    const items = [makeItem(data.id, { kitRef: 'eloquent' })];
    const suggestions = suggestionsFor({ items }, kit('laravel-react'), data, 'pt-BR');
    expect(suggestions.map((s) => s.kitRef)).toEqual(['database', 'migrations']);
    expect(suggestions[0]).toEqual({
      kitRef: 'database',
      name: 'Banco de dados',
      state: 'pending',
    });
    expect(suggestions[1]?.tech).toBe('laravel');
  });

  it('suggests from every zone in a zone the person added, and nothing without a kit', () => {
    expect(suggestionsFor({ items: [] }, kit('laravel-react'), {}, 'pt-BR')).toHaveLength(
      kit('laravel-react').items.length,
    );
    expect(suggestionsFor({ items: [] }, undefined, {}, 'pt-BR')).toEqual([]);
  });
});
