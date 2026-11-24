/**
 * The nine default zones, in display order (ux-ui 2, RN 1).
 * Their ids are also the only zone colors: a zone the person adds picks one of them.
 */
export const ZONE_IDS = [
  'method',
  'tools',
  'ui',
  'app',
  'data',
  'env',
  'infra',
  'security',
  'observability',
] as const;

export type ZoneId = (typeof ZONE_IDS)[number];
/** A zone color is always one of the default zone ids, never a loose value. */
export type ZoneColor = ZoneId;
