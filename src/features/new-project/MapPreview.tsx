import { useTranslation } from 'react-i18next';
import {
  MapMiniature,
  MiniatureLegend,
  MiniatureStats,
  type MiniatureZone,
} from '@/components/ui/MapMiniature';
import { kitText } from '@/domain/rules/kit';
import type { GuidedModel } from './useGuidedModel';

/** Live preview of the map the answers build (Hoje view). */
export function MapPreview({
  model,
  inSheet = false,
  className,
}: {
  model: GuidedModel;
  /** In the phone sheet the sheet title already says "Prévia do mapa". */
  inSheet?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const { preview, counts, kit, language } = model;

  const zones: MiniatureZone[] = preview.zones
    .filter((zone) => zone.parentId === null)
    .map((zone) => ({
      id: zone.id,
      color: zone.color,
      name: zone.key ? t(`zones.${zone.key}`) : (zone.name ?? ''),
      items: preview.items
        .filter((item) => item.zoneId === zone.id && item.when === 'now')
        .map((item) => ({
          id: item.id,
          name: item.choice ?? item.name,
          pending: item.state === 'pending',
          isNew: item.newForYou,
        })),
    }));

  return (
    <section aria-label={inSheet ? undefined : t('newProject.preview.label')} className={className}>
      <div className="flex items-baseline justify-between gap-3">
        {inSheet ? null : (
          <p className="font-mono text-[11.5px] tracking-[0.14em] text-faint uppercase">
            {t('newProject.preview.label')}
          </p>
        )}
        <p className="truncate text-[13px] text-muted">
          {kit ? kitText(kit.name, language) : t('newProject.preview.noKit')}
        </p>
      </div>
      <p className="mt-2 truncate text-[20px] font-semibold text-text">{preview.project.name}</p>
      <div className="mt-5 rounded-inner bg-fill-subtle p-3 inset-ring inset-ring-border">
        <MapMiniature zones={zones} />
      </div>
      <MiniatureLegend className="mt-4" />
      <MiniatureStats
        className="mt-6"
        stats={[
          {
            value: counts.decided,
            label: t('newProject.preview.decided', { count: counts.decided }),
            tone: 'text',
          },
          {
            value: counts.pending,
            label: t('newProject.preview.pending', { count: counts.pending }),
            tone: 'warning',
          },
          {
            value: counts.newForYou,
            label: t('newProject.preview.newForYou', { count: counts.newForYou }),
            tone: 'accent',
          },
        ]}
      />
    </section>
  );
}
