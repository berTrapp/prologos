import { describe, expect, it } from 'vitest';
import { AUTO_VERSION_IDLE_MS, pruneVersions, shouldCreateAutoVersion } from './history';

const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;

describe('automatic version (RN 8)', () => {
  it('is created 30 min after the last change', () => {
    expect(AUTO_VERSION_IDLE_MS).toBe(30 * MIN);
    expect(
      shouldCreateAutoVersion({ lastEditAt: 0, lastVersionAt: undefined, now: 29 * MIN }),
    ).toBe(false);
    expect(
      shouldCreateAutoVersion({ lastEditAt: 0, lastVersionAt: undefined, now: 30 * MIN }),
    ).toBe(true);
  });

  it('is not repeated when nothing changed since the last version', () => {
    expect(shouldCreateAutoVersion({ lastEditAt: 10, lastVersionAt: 10, now: DAY })).toBe(false);
    expect(shouldCreateAutoVersion({ lastEditAt: 10, lastVersionAt: 50, now: DAY })).toBe(false);
    expect(shouldCreateAutoVersion({ lastEditAt: 60, lastVersionAt: 50, now: DAY })).toBe(true);
  });
});

describe('version retention (RN 8)', () => {
  it('keeps named versions forever and automatic ones for 90 days', () => {
    const now = 200 * DAY;
    const named = { kind: 'named' as const, createdAt: 0 };
    const oldAuto = { kind: 'auto' as const, createdAt: now - 91 * DAY };
    const recentAuto = { kind: 'auto' as const, createdAt: now - 89 * DAY };
    expect(pruneVersions([named, oldAuto, recentAuto], now)).toEqual({
      keep: [named, recentAuto],
      remove: [oldAuto],
    });
  });
});
