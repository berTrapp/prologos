import { Panel, useViewportStore } from '@xyflow/react';
import { Slot } from 'radix-ui';
import { StickyNote, Tags } from 'lucide-react';
import { forwardRef, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Popover } from '@/components/ui/Popover';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Tooltip } from '@/components/ui/Tooltip';
import { ZoneTag } from '@/components/ui/ZoneTag';
import type { View } from '@/domain/schemas/project';
import { cn } from '@/lib/utils';
import { useMapUi } from '../map-ui-store';
import type { MapActions } from '../useMapActions';
import type { MapModel } from '../useMapModel';

/** Below this canvas width the full labels do not fit beside the tool rail (ux-ui 12). */
const COMPACT_BELOW = 520;

type ViewControlsProps = {
  model: MapModel;
  actions: MapActions;
  showAnnotations: boolean;
  onShowAnnotations: (show: boolean) => void;
};

/** Hoje / Completo, notes and risks, and the zone filter ("Tags"), above the canvas. */
export function ViewControls({
  model,
  actions,
  showAnnotations,
  onShowAnnotations,
}: ViewControlsProps) {
  const { t } = useTranslation();
  const filter = useMapUi((s) => s.zoneFilter);
  const toggle = useMapUi((s) => s.toggleZoneFilter);
  const clear = useMapUi((s) => s.clearZoneFilter);
  // Narrow canvas (both panels open at 1024 px): icon and count stay, the name goes to the tooltip.
  const compact = useViewportStore((s) => s.width > 0 && s.width < COMPACT_BELOW);
  const annotationsLabel = t('map.annotations');
  const filterLabel =
    filter.length > 0 ? t('map.filter.active', { count: filter.length }) : t('map.filter.button');
  const topZones = model.snapshot.zones
    .filter((zone) => zone.parentId === null)
    .sort((a, b) => a.order - b.order);

  return (
    // Never wider than the canvas: on a narrow one the controls wrap instead of being cut off.
    <Panel position="top-left" className="m-4! ml-[72px]! max-w-[calc(100%-88px)]">
      <div className="surface-raised flex flex-wrap items-center gap-1.5 rounded-inner p-1 inset-ring inset-ring-stroke-strong">
        <SegmentedControl<View>
          label={t('map.view.label')}
          value={model.snapshot.project.view}
          onValueChange={actions.setView}
          options={[
            { value: 'today', label: t('map.view.today') },
            { value: 'complete', label: t('map.view.complete') },
          ]}
        />
        <MaybeTooltip label={compact ? annotationsLabel : undefined}>
          <Button
            variant="quiet"
            size="compact"
            icon={<StickyNote />}
            aria-pressed={showAnnotations}
            className={cn(showAnnotations && 'bg-fill-active text-text')}
            onClick={() => onShowAnnotations(!showAnnotations)}
          >
            <span className={cn(compact && 'sr-only')}>{annotationsLabel}</span>
            <span className="font-mono text-[11.5px] text-muted tabular-nums">
              {model.annotationTotal}
            </span>
          </Button>
        </MaybeTooltip>
        <Popover
          align="start"
          trigger={
            <MaybeTooltip label={compact ? filterLabel : undefined}>
              <Button
                variant="quiet"
                size={compact && filter.length === 0 ? 'icon' : 'compact'}
                icon={<Tags />}
                className={cn(filter.length > 0 && 'bg-fill-active text-text')}
              >
                <span className={cn(compact && 'sr-only')}>{filterLabel}</span>
                {compact && filter.length > 0 ? (
                  <span aria-hidden className="font-mono text-[11.5px] tabular-nums">
                    {filter.length}
                  </span>
                ) : null}
              </Button>
            </MaybeTooltip>
          }
        >
          <p className="pb-1 text-[13px] font-semibold text-muted">{t('map.filter.title')}</p>
          <div className="flex flex-col">
            {topZones.map((zone) => (
              <Checkbox
                key={zone.id}
                checked={filter.includes(zone.id)}
                onCheckedChange={() => toggle(zone.id)}
                label={
                  <ZoneTag zone={zone.color} label={model.zoneName(zone)} className="text-[13px]" />
                }
              />
            ))}
          </div>
          {filter.length > 0 ? (
            <Button variant="quiet" size="compact" className="mt-2" onClick={clear}>
              {t('map.filter.clear')}
            </Button>
          ) : null}
        </Popover>
      </div>
    </Panel>
  );
}

/** The tooltip only when the name is hidden; with the name on screen it would repeat it. */
const MaybeTooltip = forwardRef<HTMLButtonElement, { label?: string; children: ReactElement }>(
  function MaybeTooltip({ label, children, ...props }, ref) {
    if (label) {
      return (
        <Tooltip ref={ref} content={label} side="bottom" {...props}>
          {children}
        </Tooltip>
      );
    }
    return (
      <Slot.Root ref={ref} {...props}>
        {children}
      </Slot.Root>
    );
  },
);
