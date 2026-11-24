import type { ZoneId } from '@/domain/zones';

/** Static class names so Tailwind can see every zone color. */
export const zoneBg: Record<ZoneId, string> = {
  method: 'bg-zone-method',
  tools: 'bg-zone-tools',
  ui: 'bg-zone-ui',
  app: 'bg-zone-app',
  data: 'bg-zone-data',
  env: 'bg-zone-env',
  infra: 'bg-zone-infra',
  security: 'bg-zone-security',
  observability: 'bg-zone-observability',
};

export const zoneBorder: Record<ZoneId, string> = {
  method: 'border-zone-method/45',
  tools: 'border-zone-tools/45',
  ui: 'border-zone-ui/45',
  app: 'border-zone-app/45',
  data: 'border-zone-data/45',
  env: 'border-zone-env/45',
  infra: 'border-zone-infra/45',
  security: 'border-zone-security/45',
  observability: 'border-zone-observability/45',
};

export const zoneTint: Record<ZoneId, string> = {
  method: 'bg-zone-method/5',
  tools: 'bg-zone-tools/5',
  ui: 'bg-zone-ui/5',
  app: 'bg-zone-app/5',
  data: 'bg-zone-data/5',
  env: 'bg-zone-env/5',
  infra: 'bg-zone-infra/5',
  security: 'bg-zone-security/5',
  observability: 'bg-zone-observability/5',
};

export const zoneText: Record<ZoneId, string> = {
  method: 'text-zone-method',
  tools: 'text-zone-tools',
  ui: 'text-zone-ui',
  app: 'text-zone-app',
  data: 'text-zone-data',
  env: 'text-zone-env',
  infra: 'text-zone-infra',
  security: 'text-zone-security',
  observability: 'text-zone-observability',
};

export const zoneRing: Record<ZoneId, string> = {
  method: 'inset-ring-zone-method/30',
  tools: 'inset-ring-zone-tools/30',
  ui: 'inset-ring-zone-ui/30',
  app: 'inset-ring-zone-app/30',
  data: 'inset-ring-zone-data/30',
  env: 'inset-ring-zone-env/30',
  infra: 'inset-ring-zone-infra/30',
  security: 'inset-ring-zone-security/30',
  observability: 'inset-ring-zone-observability/30',
};
