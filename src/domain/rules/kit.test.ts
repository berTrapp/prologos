import { describe, expect, it } from 'vitest';
import { KITS, findKit } from '@/content/kits';
import type { Kit } from '../schemas/kit';
import {
  defaultExperience,
  equivalenceRows,
  kitForStack,
  kitText,
  kitsForType,
  recommendKit,
} from './kit';

const kit = (id: string): Kit => {
  const found = findKit(id);
  if (!found) throw new Error(id);
  return found;
};

describe('kitsForType', () => {
  it('offers only the kits made for the type', () => {
    expect(kitsForType(KITS, 'site').map((k) => k.id)).toEqual(['static-astro']);
    expect(kitsForType(KITS, 'mobile').map((k) => k.id)).toEqual(['react-native', 'flutter']);
    expect(kitsForType(KITS, 'api')).toHaveLength(5);
  });

  it('offers every kit when the type is "Ainda não sei"', () => {
    expect(kitsForType(KITS, 'unknown')).toHaveLength(8);
  });
});

describe('recommendKit (RN 13)', () => {
  it('recommends the static site for a site, whatever the stack', () => {
    expect(recommendKit(KITS, 'site', 'spring')?.id).toBe('static-astro');
    expect(recommendKit(KITS, 'site', undefined)?.id).toBe('static-astro');
  });

  it('recommends React Native on mobile to people who know Laravel or Node', () => {
    expect(recommendKit(KITS, 'mobile', 'laravel')?.id).toBe('react-native');
    expect(recommendKit(KITS, 'mobile', 'node')?.id).toBe('react-native');
  });

  it('recommends Flutter on mobile otherwise', () => {
    expect(recommendKit(KITS, 'mobile', 'django')?.id).toBe('flutter');
    expect(recommendKit(KITS, 'mobile', undefined)?.id).toBe('flutter');
  });

  it.each([
    ['laravel', 'laravel-react'],
    ['node', 'node-react'],
    ['spring', 'spring-react'],
    ['dotnet', 'dotnet-react'],
    ['django', 'django'],
  ] as const)('recommends the kit of the known stack (%s)', (stack, id) => {
    expect(recommendKit(KITS, 'web', stack)?.id).toBe(id);
    expect(recommendKit(KITS, 'api', stack)?.id).toBe(id);
    expect(recommendKit(KITS, 'unknown', stack)?.id).toBe(id);
  });

  it('recommends nothing when no stack is known', () => {
    expect(recommendKit(KITS, 'web', undefined)).toBeUndefined();
    expect(recommendKit(KITS, 'unknown', undefined)).toBeUndefined();
  });
});

describe('kitForStack', () => {
  it('finds the kit of a stack, or nothing', () => {
    expect(kitForStack(KITS, 'dotnet')?.id).toBe('dotnet-react');
    expect(kitForStack(KITS, undefined)).toBeUndefined();
  });
});

describe('defaultExperience (RN 15)', () => {
  it('marks as known what the known stack shares with the kit', () => {
    expect(defaultExperience(kit('node-react'), KITS, 'laravel')).toEqual({
      ts: 'known',
      node: 'never',
      express: 'never',
      react: 'known',
      prisma: 'never',
    });
  });

  it('marks everything as known for the kit of the known stack', () => {
    const levels = Object.values(defaultExperience(kit('django'), KITS, 'django'));
    expect(levels.every((level) => level === 'known')).toBe(true);
  });

  it('marks everything as never used when no stack is known', () => {
    const levels = Object.values(defaultExperience(kit('flutter'), KITS, undefined));
    expect(levels.every((level) => level === 'never')).toBe(true);
  });
});

describe('equivalenceRows (RN 15)', () => {
  it('translates the concepts of the chosen kit from the known one', () => {
    const rows = equivalenceRows(kit('laravel-react'), kit('django'), 'pt-BR');
    expect(rows[0]).toEqual({ concept: 'orm', from: 'Eloquent', to: 'Django ORM' });
    expect(rows.map((row) => row.concept)).toEqual([
      'orm',
      'migrate',
      'routes',
      'packages',
      'devServer',
      'config',
      'templates',
      'auth',
      'tests',
    ]);
  });

  it('shows each value in the interface language (RN 17)', () => {
    const config = (lng: 'pt-BR' | 'en' | 'es') =>
      equivalenceRows(kit('laravel-react'), kit('django'), lng).find((r) => r.concept === 'config');
    expect(config('pt-BR')?.to).toBe('settings.py + variáveis de ambiente');
    expect(config('en')?.to).toBe('settings.py + environment variables');
    expect(config('es')?.to).toBe('settings.py + variables de entorno');
  });

  it('is empty for the same stack, no known stack, or kits without a table', () => {
    expect(equivalenceRows(kit('django'), kit('django'), 'pt-BR')).toEqual([]);
    expect(equivalenceRows(undefined, kit('django'), 'pt-BR')).toEqual([]);
    expect(equivalenceRows(kit('laravel-react'), kit('flutter'), 'pt-BR')).toEqual([]);
  });

  it('skips a concept one of the kits does not have', () => {
    const from = { ...kit('laravel-react'), equivalences: { orm: 'Eloquent', auth: 'Sanctum' } };
    expect(equivalenceRows(from, kit('django'), 'pt-BR').map((r) => r.concept)).toEqual([
      'orm',
      'auth',
    ]);
  });
});

describe('kitText', () => {
  it('picks the language, and keeps technical names', () => {
    expect(kitText({ 'pt-BR': 'Filas', en: 'Queues', es: 'Colas' }, 'es')).toBe('Colas');
    expect(kitText('Eloquent', 'en')).toBe('Eloquent');
  });
});
