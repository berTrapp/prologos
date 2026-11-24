import { describe, expect, it } from 'vitest';
import { parseThemePreference, resolveTheme } from './theme';

describe('parseThemePreference', () => {
  it.each(['system', 'light', 'dark'] as const)('keeps %s', (value) => {
    expect(parseThemePreference(value)).toBe(value);
  });

  it.each([null, undefined, '', 'blue', 1])('falls back to system for %s', (value) => {
    expect(parseThemePreference(value)).toBe('system');
  });
});

describe('resolveTheme', () => {
  it('follows the system by default', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('respects an explicit choice regardless of the system', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});
