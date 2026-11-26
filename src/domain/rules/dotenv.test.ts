import { describe, expect, it } from 'vitest';
import { KITS } from '@/content/kits';
import { parseDotenv } from './dotenv';

const entries = (text: string) =>
  parseDotenv(text).flatMap((line) => (line.kind === 'entry' ? [[line.key, line.value]] : []));

describe('parseDotenv', () => {
  it('reads a real Laravel .env with comments, blank lines and quotes', () => {
    const text = [
      '# Laravel',
      'APP_NAME="Agenda de aulas"',
      'APP_ENV=local',
      'APP_KEY=base64:not-a-real-key',
      'APP_DEBUG=true',
      '',
      'DB_CONNECTION=pgsql',
      "DB_PASSWORD='p@ss # not a comment'",
      'MAIL_FROM_ADDRESS="hello@example.com" # inline comment after quotes',
      'VITE_APP_NAME="${APP_NAME}"',
    ].join('\n');
    expect(entries(text)).toEqual([
      ['APP_NAME', 'Agenda de aulas'],
      ['APP_ENV', 'local'],
      ['APP_KEY', 'base64:not-a-real-key'],
      ['APP_DEBUG', 'true'],
      ['DB_CONNECTION', 'pgsql'],
      ['DB_PASSWORD', 'p@ss # not a comment'],
      ['MAIL_FROM_ADDRESS', 'hello@example.com'],
      ['VITE_APP_NAME', '${APP_NAME}'],
    ]);
  });

  it('handles export, spaces around =, inline comments, CRLF and a BOM', () => {
    const text = '﻿export NODE_ENV = production\r\nPORT=3000 # the API port\r\nEMPTY=\r\n';
    expect(entries(text)).toEqual([
      ['NODE_ENV', 'production'],
      ['PORT', '3000'],
      ['EMPTY', ''],
    ]);
  });

  it('keeps a # inside an unquoted value without spaces', () => {
    expect(entries('COLOR=#7C5CFF')).toEqual([['COLOR', '#7C5CFF']]);
  });

  it('unescapes newlines and quotes inside double quotes only', () => {
    expect(entries('A="one\\ntwo \\"x\\""\nB=\'raw\\n\'')).toEqual([
      ['A', 'one\ntwo "x"'],
      ['B', 'raw\\n'],
    ]);
  });

  it('marks lines without = as invalid, and invalid keys as not valid', () => {
    const parsed = parseDotenv('JUST TEXT\n=value\napp_key=x\nOK=1');
    expect(parsed.map((line) => line.kind)).toEqual(['invalid', 'invalid', 'entry', 'entry']);
    expect(parsed[2]).toMatchObject({ key: 'app_key', valid: false });
    expect(parsed[3]).toMatchObject({ key: 'OK', valid: true, line: 4 });
  });

  it('keeps the last of a repeated key and marks the others', () => {
    const parsed = parseDotenv('A=1\nB=2\nA=3');
    expect(
      parsed.map((line) => line.kind === 'entry' && [line.key, line.value, line.duplicate]),
    ).toEqual([
      ['A', '1', true],
      ['B', '2', false],
      ['A', '3', false],
    ]);
  });

  it.each(KITS.map((kit) => [kit.id, kit] as const))('reads the .env.example of %s', (_id, kit) => {
    const text = kit.envVars.map((v) => `${v.key}=${v.example ?? ''}`).join('\n');
    const parsed = parseDotenv(text);
    expect(parsed.every((line) => line.kind === 'entry' && line.valid)).toBe(true);
    expect(parsed).toHaveLength(kit.envVars.length);
  });
});
