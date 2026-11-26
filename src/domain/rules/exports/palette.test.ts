import { describe, expect, it } from 'vitest';
import tokens from '@/styles/tokens.css?raw';
import { cssVariables, parseTokens } from './palette';

describe('parseTokens', () => {
  const { dark, light } = parseTokens(tokens);

  it('reads both themes and the shared tokens', () => {
    expect(dark.bg).toBeTruthy();
    expect(light.bg).toBeTruthy();
    expect(light.bg).not.toBe(dark.bg);
    expect(dark['zone-data']).toBeTruthy();
    expect(dark['brand-from']).toBe(light['brand-from']);
  });

  it('writes custom properties, with initial for a missing one', () => {
    expect(cssVariables({ bg: 'black' }, ['bg', 'nope'])).toBe('--bg:black;--nope:initial;');
  });
});
