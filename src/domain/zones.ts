/** The nine map zones, in display order (ux-ui 2). */
export const ZONE_IDS = [
  'methodology',
  'tools',
  'interface',
  'application',
  'data',
  'environment',
  'infrastructure',
  'security',
  'observability',
] as const;

export type ZoneId = (typeof ZONE_IDS)[number];
