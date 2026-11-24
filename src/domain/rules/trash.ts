import type { TrashEntry } from '../schemas/history';

/** RN 11. */
export const TRASH_RETENTION_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

export function trashExpiresAt(entry: Pick<TrashEntry, 'deletedAt'>): number {
  return entry.deletedAt + TRASH_RETENTION_DAYS * DAY;
}

export function isTrashExpired(entry: Pick<TrashEntry, 'deletedAt'>, now: number): boolean {
  return now >= trashExpiresAt(entry);
}

/** Days left before the entry is deleted for good, counting today: 30 right after deleting, 0 once expired. */
export function trashDaysLeft(entry: Pick<TrashEntry, 'deletedAt'>, now: number): number {
  return Math.max(0, Math.ceil((trashExpiresAt(entry) - now) / DAY));
}

export function partitionExpiredTrash<T extends Pick<TrashEntry, 'deletedAt'>>(
  entries: readonly T[],
  now: number,
): { keep: T[]; expired: T[] } {
  const keep: T[] = [];
  const expired: T[] = [];
  for (const entry of entries) (isTrashExpired(entry, now) ? expired : keep).push(entry);
  return { keep, expired };
}
