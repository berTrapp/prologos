/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrast } from './contrast';

const css = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8');

function block(selector: string) {
  const start = css.indexOf(selector);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{3,8})\s*;/gi)].map((m) => [m[1], m[2]]),
  ) as Record<string, string>;
}

const themes = {
  dark: block("[data-theme='dark']"),
  light: block("[data-theme='light']"),
};

const TEXT_ON_BACKGROUNDS = [
  'text',
  'muted',
  'faint',
  'success',
  'warning',
  'danger',
  'info',
  'accent',
  'neutral',
];
const BACKGROUNDS = ['bg', 'surface-from', 'surface-to', 'surface-raised-from'];
const ZONES = ['method', 'tools', 'ui', 'app', 'data', 'env', 'infra', 'security', 'observability'];

describe.each(Object.entries(themes))('%s theme (ux-ui 5: contrast AA)', (_name, tokens) => {
  const get = (name: string) => {
    const value = tokens[name];
    if (!value) throw new Error(`Missing token --${name}`);
    return value;
  };

  for (const fg of TEXT_ON_BACKGROUNDS) {
    for (const bg of BACKGROUNDS) {
      it(`--${fg} on --${bg} is at least 4.5:1`, () => {
        expect(contrast(get(fg), get(bg))).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it.each([
    ['primary-fg', 'primary'],
    ['count-fg', 'count'],
    ['chip-fg', 'surface-from'],
    ['text', 'map-item'],
    ['muted', 'map-item'],
    ['text', 'textarea'],
  ])('--%s on --%s is at least 4.5:1', (fg, bg) => {
    expect(contrast(get(fg), get(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(ZONES)('zone %s is at least 3:1 on --bg (icons and strokes)', (zone) => {
    expect(contrast(get(`zone-${zone}`), get('bg'))).toBeGreaterThanOrEqual(3);
  });

  it('focus ring is at least 3:1 on --bg', () => {
    expect(contrast(get('ring'), get('bg'))).toBeGreaterThanOrEqual(3);
  });
});
