import { Panel } from '@xyflow/react';
import { StickyNote, Tags } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Popover } from '@/components/ui/Popover';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ZoneTag } from '@/components/ui/ZoneTag';
import type { View } from '@/domain/schemas/project';
import { cn } from '@/lib/utils';
import { useMapUi } from '../map-ui-store';
import type { MapActions } from '../useMapActions';
import type { MapModel } from '../useMapModel';

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
  const topZones = model.snapshot.zones
    .filter((zone) => zone.parentId === null)
    .sort((a, b) => a.order - b.order);

  return (
    <Panel position="top-left" className="m-4! ml-[72px]!">
      <div className="surface-raised flex items-center gap-1.5 rounded-inner p-1 inset-ring inset-ring-stroke-strong">
        <SegmentedControl<View>
          label={t('map.view.label')}
          value={model.snapshot.project.view}
          onValueChange={actions.setView}
          options={[
            { value: 'today', label: t('map.view.today') },
            { value: 'complete', label: t('map.view.complete') },
          ]}
        />
        <Button
          variant="quiet"
          size="compact"
          icon={<StickyNote />}
          aria-pressed={showAnnotations}
          className={cn(showAnnotations && 'bg-fill-active text-text')}
          onClick={() => onShowAnnotations(!showAnnotations)}
        >
          {t('map.annotations')}
          <span className="font-mono text-[11.5px] text-muted tabular-nums">
            {model.annotationTotal}
          </span>
        </Button>
        <Popover
          align="start"
          trigger={
            <Button
              variant="quiet"
              size="compact"
              icon={<Tags />}
              className={cn(filter.length > 0 && 'bg-fill-active text-text')}
            >
              {filter.length > 0
                ? t('map.filter.active', { count: filter.length })
                : t('map.filter.button')}
            </Button>
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
