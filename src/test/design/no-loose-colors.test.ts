/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(process.cwd(), 'src');
const ALLOWED = [join(SRC, 'styles/tokens.css')];
const SKIP_DIR = join(SRC, 'test/design');
const COLOR_LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch)\(/i;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return path === SKIP_DIR ? [] : files(path);
    return /\.(tsx?|css)$/.test(name) && !ALLOWED.includes(path) ? [path] : [];
  });
}

describe('colors come only from tokens (ux-ui 13)', () => {
  const sources = files(SRC);

  it('scans the source tree, CSS included', () => {
    expect(sources.some((path) => path.endsWith('index.css'))).toBe(true);
    expect(sources.length).toBeGreaterThan(30);
  });

  it('no color literal outside src/styles/tokens.css', () => {
    const offenders = sources.flatMap((path) =>
      readFileSync(path, 'utf8')
        .split('\n')
        .map((line, index) => ({ line: line.replace(/url\(#[^)]*\)/g, ''), index }))
        .filter(({ line }) => COLOR_LITERAL.test(line))
        .map(({ index }) => `${relative(SRC, path)}:${index + 1}`),
    );
    expect(offenders).toEqual([]);
  });
});
