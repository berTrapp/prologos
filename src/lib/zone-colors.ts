import type { ZoneId } from '@/domain/zones';

/** Static class names so Tailwind can see every zone color. */
export const zoneBg: Record<ZoneId, string> = {
  methodology: 'bg-zone-methodology',
  tools: 'bg-zone-tools',
  interface: 'bg-zone-interface',
  application: 'bg-zone-application',
  data: 'bg-zone-data',
  environment: 'bg-zone-environment',
  infrastructure: 'bg-zone-infrastructure',
  security: 'bg-zone-security',
  observability: 'bg-zone-observability',
};

export const zoneBorder: Record<ZoneId, string> = {
  methodology: 'border-zone-methodology/45',
  tools: 'border-zone-tools/45',
  interface: 'border-zone-interface/45',
  application: 'border-zone-application/45',
  data: 'border-zone-data/45',
  environment: 'border-zone-environment/45',
  infrastructure: 'border-zone-infrastructure/45',
  security: 'border-zone-security/45',
  observability: 'border-zone-observability/45',
};

export const zoneTint: Record<ZoneId, string> = {
  methodology: 'bg-zone-methodology/5',
  tools: 'bg-zone-tools/5',
  interface: 'bg-zone-interface/5',
  application: 'bg-zone-application/5',
  data: 'bg-zone-data/5',
  environment: 'bg-zone-environment/5',
  infrastructure: 'bg-zone-infrastructure/5',
  security: 'bg-zone-security/5',
  observability: 'bg-zone-observability/5',
};
