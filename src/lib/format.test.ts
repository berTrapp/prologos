import { describe, expect, it } from 'vitest';
import { dayPeriod, formatLongDate, formatRelative } from './format';

const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;
const now = Date.UTC(2026, 10, 19, 15);

describe('formatRelative (ux-ui 11)', () => {
  it.each([
    [now - 10 * 1000, 'agora'],
    [now - 12 * MIN, 'há 12 minutos'],
    [now - 3 * 60 * MIN, 'há 3 horas'],
    [now - DAY, 'ontem'],
    [now - 3 * DAY, 'há 3 dias'],
    [now - 14 * DAY, 'há 2 semanas'],
    [now - 60 * DAY, 'há 2 meses'],
    [now - 400 * DAY, 'ano passado'],
  ])('pt-BR %#', (timestamp, expected) => {
    expect(formatRelative(timestamp, now, 'pt-BR')).toBe(expected);
  });

  it('follows the language', () => {
    expect(formatRelative(now - DAY, now, 'en')).toBe('yesterday');
    expect(formatRelative(now + 3 * DAY, now, 'es')).toBe('dentro de 3 días');
  });
});

describe('formatLongDate', () => {
  it('writes weekday, day and month in the language', () => {
    expect(formatLongDate(Date.UTC(2026, 10, 19, 15), 'pt-BR')).toMatch(
      /quinta-feira, 19 de novembro/,
    );
  });
});

describe('dayPeriod', () => {
  it.each([
    [4, 'evening'],
    [5, 'morning'],
    [11, 'morning'],
    [12, 'afternoon'],
    [17, 'afternoon'],
    [18, 'evening'],
    [23, 'evening'],
  ] as const)('%i h → %s', (hour, period) => {
    expect(dayPeriod(hour)).toBe(period);
  });
});
