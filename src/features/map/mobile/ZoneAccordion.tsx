import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Item, Zone } from '@/domain/schemas/map';
import { cn } from '@/lib/utils';
import { zoneBg, zoneRing, zoneText } from '@/lib/zone-colors';
import type { MapModel } from '../useMapModel';

type ZoneAccordionProps = {
  model: MapModel;
  open: string[];
  onToggle: (zoneId: string) => void;
  onItem: (item: Item) => void;
};

/** "Zonas" on the phone: zones as an accordion, subzones nested (ux-ui 12). */
export function ZoneAccordion({ model, open, onToggle, onItem }: ZoneAccordionProps) {
  const byParent = (parentId: string | null) =>
    model.snapshot.zones
      .filter((zone) => zone.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  return (
    <ul className="flex flex-col gap-2">
      {byParent(null).map((zone) => (
        <ZoneRow
          key={zone.id}
          zone={zone}
          model={model}
          open={open}
          onToggle={onToggle}
          onItem={onItem}
          byParent={byParent}
        />
      ))}
    </ul>
  );
}

function ZoneRow({
  zone,
  model,
  open,
  onToggle,
  onItem,
  byParent,
}: ZoneAccordionProps & { zone: Zone; byParent: (parentId: string | null) => Zone[] }) {
  const { t } = useTranslation();
  const expanded = open.includes(zone.id);
  const isSub = zone.parentId !== null;
  const items = model.items
    .filter((item) => item.zoneId === zone.id)
    .sort((a, b) => a.order - b.order);
  const subzones = byParent(zone.id);
  const count =
    model.layout.zones.find((z) => z.id === zone.id)?.count ??
    items.length +
      subzones.reduce((sum, sub) => sum + model.items.filter((i) => i.zoneId === sub.id).length, 0);
  const name = model.zoneName(zone);
  const panelId = `zone-panel-${zone.id}`;

  return (
    <li
      className={cn(
        'overflow-hidden inset-ring',
        isSub ? 'rounded-inner' : 'surface rounded-card',
        expanded ? zoneRing[zone.color] : 'inset-ring-border',
      )}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => onToggle(zone.id)}
        className="flex min-h-14 w-full items-center gap-3 px-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <span aria-hidden className={cn('size-2.5 shrink-0 rounded-tag', zoneBg[zone.color])} />
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-[15px] font-semibold',
            expanded ? zoneText[zone.color] : 'text-text',
          )}
        >
          {name}
        </span>
        <span className="shrink-0 text-[13px] text-muted tabular-nums">
          {t('map.zone.items', { count })}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            'size-4 shrink-0 text-muted transition-transform duration-(--duration-fast)',
            expanded && 'rotate-180',
          )}
        />
      </button>
      {expanded ? (
        <div id={panelId} className="flex flex-col gap-1 px-2 pb-2">
          {items.map((item) => {
            const status = model.itemStatus(item);
            const choice = item.state === 'decided' ? model.choiceName(item) : undefined;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onItem(item)}
                className={cn(
                  'flex min-h-14 items-center gap-3 rounded-inner px-3 text-left focus-visible:outline-2 focus-visible:outline-ring',
                  status === 'pending'
                    ? 'border border-dashed border-warning/70'
                    : 'bg-fill-subtle',
                  status === 'future' && 'opacity-60',
                  status === 'notApplicable' && 'opacity-50',
                )}
              >
                <span
                  aria-hidden
                  className={cn('size-2 shrink-0 rounded-full', zoneBg[zone.color])}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[15px] font-medium text-text">
                    {model.itemName(item)}
                  </span>
                  <span
                    className={cn(
                      'truncate text-[13px]',
                      status === 'pending' ? 'text-warning' : 'text-muted',
                    )}
                  >
                    {choice ?? t(`mapItem.status.${status}`)}
                  </span>
                </span>
                {item.newForYou ? (
                  <span className="size-2 shrink-0 rounded-full bg-accent">
                    <span className="sr-only">{t('ui.newForYou')}</span>
                  </span>
                ) : null}
              </button>
            );
          })}
          {subzones.length > 0 ? (
            <ul className="mt-1 flex flex-col gap-1.5">
              {subzones.map((sub) => (
                <ZoneRow
                  key={sub.id}
                  zone={sub}
                  model={model}
                  open={open}
                  onToggle={onToggle}
                  onItem={onItem}
                  byParent={byParent}
                />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
