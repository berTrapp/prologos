import { describe, expect, it } from 'vitest';
import { isTrashExpired, partitionExpiredTrash, trashDaysLeft, trashExpiresAt } from './trash';

const DAY = 24 * 60 * 60 * 1000;

describe('trash (RN 11)', () => {
  const entry = { deletedAt: 1_000 };

  it('keeps entries for 30 days', () => {
    expect(trashExpiresAt(entry)).toBe(1_000 + 30 * DAY);
    expect(isTrashExpired(entry, 1_000 + 30 * DAY - 1)).toBe(false);
    expect(isTrashExpired(entry, 1_000 + 30 * DAY)).toBe(true);
  });

  it('counts the days left', () => {
    expect(trashDaysLeft(entry, 1_000)).toBe(30);
    expect(trashDaysLeft(entry, 1_000 + 29.5 * DAY)).toBe(0);
    expect(trashDaysLeft(entry, 1_000 + 40 * DAY)).toBe(0);
  });

  it('splits expired entries for cleanup', () => {
    const fresh = { id: 'a', deletedAt: 20 * DAY };
    const old = { id: 'b', deletedAt: 0 };
    expect(partitionExpiredTrash([fresh, old], 31 * DAY)).toEqual({
      keep: [fresh],
      expired: [old],
    });
  });
});
