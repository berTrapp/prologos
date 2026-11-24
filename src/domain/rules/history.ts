import type { Version } from '../schemas/history';

/** RN 8: an editing session ends after 30 min without changes. */
export const AUTO_VERSION_IDLE_MS = 30 * 60 * 1000;
/** RN 8: automatic versions are kept for 90 days; named ones forever. */
export const AUTO_VERSION_RETENTION_DAYS = 90;
const DAY = 24 * 60 * 60 * 1000;

type SessionState = {
  /** Last change to the project. */
  lastEditAt: number;
  /** Last version of any kind, if any. */
  lastVersionAt: number | undefined;
  now: number;
};

/** RN 8: there are changes after the last version and 30 min have passed since the last one. */
export function shouldCreateAutoVersion({ lastEditAt, lastVersionAt, now }: SessionState): boolean {
  const unsaved = lastVersionAt === undefined || lastEditAt > lastVersionAt;
  return unsaved && now - lastEditAt >= AUTO_VERSION_IDLE_MS;
}

export function pruneVersions<T extends Pick<Version, 'kind' | 'createdAt'>>(
  versions: readonly T[],
  now: number,
): { keep: T[]; remove: T[] } {
  const limit = now - AUTO_VERSION_RETENTION_DAYS * DAY;
  const keep: T[] = [];
  const remove: T[] = [];
  for (const version of versions) {
    (version.kind === 'auto' && version.createdAt < limit ? remove : keep).push(version);
  }
  return { keep, remove };
}
