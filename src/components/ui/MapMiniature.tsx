import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { ZoneColor } from '@/domain/zones';
import { cn } from '@/lib/utils';
import { zoneRing, zoneText, zoneTint } from '@/lib/zone-colors';

export type MiniatureItem = { id: string; name: string; pending: boolean; isNew: boolean };
export type MiniatureZone = { id: string; color: ZoneColor; name: string; items: MiniatureItem[] };

const MAX_ITEMS = 4;

/** Still preview of a map in the Hoje view (ux-ui 13.21). Changes at once, never animates. */
export function MapMiniature({ zones, className }: { zones: MiniatureZone[]; className?: string }) {
  const { t } = useTranslation();
  return (
    <div aria-hidden className={cn('grid grid-cols-3 gap-2', className)}>
      {zones.map((zone) => {
        const shown = zone.items.slice(0, MAX_ITEMS);
        const hidden = zone.items.length - shown.length;
        return (
          <div
            key={zone.id}
            className={cn(
              'flex min-h-[72px] min-w-0 flex-col gap-1 rounded-control p-1.5 inset-ring',
              zoneRing[zone.color],
              zoneTint[zone.color],
            )}
          >
            <span
              className={cn(
                'truncate px-0.5 text-[10.5px] leading-4 font-semibold',
                zoneText[zone.color],
              )}
            >
              {zone.name}
            </span>
            {shown.map((item) => (
              <span
                key={item.id}
                className={cn(
                  'flex h-[18px] min-w-0 items-center gap-1 rounded-badge bg-map-item px-1.5 text-[10.5px] leading-none',
                  item.pending
                    ? 'border border-dashed border-warning/70 text-warning'
                    : 'text-text inset-ring inset-ring-border',
                )}
              >
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                {item.isNew ? (
                  <span className="size-[5px] shrink-0 rounded-full bg-accent" />
                ) : null}
              </span>
            ))}
            {hidden > 0 ? (
              <span className="px-0.5 text-[10.5px] leading-4 text-muted">
                {t('miniature.more', { count: hidden })}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** Legend of the miniature: each state with its own shape, never color alone (ux-ui 5). */
export function MiniatureLegend({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <ul
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-muted',
        className,
      )}
    >
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="h-2.5 w-3.5 rounded-tag inset-ring inset-ring-stroke-strong" />
        {t('miniature.decided')}
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="h-2.5 w-3.5 rounded-tag border border-dashed border-warning" />
        {t('miniature.pending')}
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="size-1.5 rounded-full bg-accent" />
        {t('ui.newForYou')}
      </li>
    </ul>
  );
}

type Stat = { value: number; label: ReactNode; tone: 'text' | 'warning' | 'accent' };

const toneClasses: Record<Stat['tone'], string> = {
  text: 'text-text',
  warning: 'text-warning',
  accent: 'text-accent',
};

/** The three numbers under the miniature: decided, to decide, new for you. */
export function MiniatureStats({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <dl className={cn('grid grid-cols-3 gap-3', className)}>
      {stats.map((stat, index) => (
        <div key={index} className="flex flex-col-reverse gap-0.5">
          <dt className="text-[13px] text-muted">{stat.label}</dt>
          <dd
            className={cn(
              'text-[22px] leading-none font-semibold tabular-nums',
              toneClasses[stat.tone],
            )}
          >
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
