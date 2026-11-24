/** The nine map zones, in display order (ux-ui 2). */
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
