import { ReactFlowProvider } from '@xyflow/react';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { IconButton } from '@/components/ui/IconButton';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Sheet } from '@/components/ui/Sheet';
import { StatusDot } from '@/components/ui/StatusDot';
import { ZoneTag } from '@/components/ui/ZoneTag';
import type { View } from '@/domain/schemas/project';
import { DataNotice } from '@/features/project/DataNotice';
import { usePersistentState } from '@/hooks/usePersistentState';
import { STATUS_TONE } from '@/lib/project-status';
import { MapCanvas } from '../canvas/MapCanvas';
import { ItemDetails } from '../details/ItemDetails';
import { useMapUi } from '../map-ui-store';
import { NextStepBar } from '../NextStepBar';
import { ZoomControls } from '../overlays/ZoomControls';
import type { MapActions } from '../useMapActions';
import type { MapModel } from '../useMapModel';
import { ZoneAccordion } from './ZoneAccordion';

type MobileView = 'zones' | 'map';

/** The map on the phone: Zonas (accordion, default) or Mapa (canvas), details in a sheet. */
export function MobileMap({ model, actions }: { model: MapModel; actions: MapActions }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const project = model.snapshot.project;
  const [view, setView] = usePersistentState<MobileView>('prologos.mapMobileView', 'zones');
  const [open, setOpen] = usePersistentState<string[]>(`prologos.mapMobileOpen.${project.id}`, []);
  const selection = useMapUi((s) => s.selection);
  const select = useMapUi((s) => s.select);
  const item = selection?.kind === 'item' ? model.itemById.get(selection.id) : undefined;
  const zone = item ? model.zoneById.get(item.zoneId) : undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-bg/92 px-2 backdrop-blur-xl">
        <IconButton
          label={t('nav.back')}
          icon={<ChevronLeft />}
          onClick={() => (location.key !== 'default' ? navigate(-1) : navigate('/'))}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="truncate text-[17px] leading-tight font-semibold text-text">
            {project.name}
          </h1>
          <StatusDot tone={STATUS_TONE[project.status]} className="text-[12.5px]">
            {t(`status.project.${project.status}`)}
          </StatusDot>
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4 pt-4">
        <DataNotice className="mb-0" />
        <div className="flex gap-2">
          <SegmentedControl<MobileView>
            label={t('map.mobile.views')}
            value={view}
            onValueChange={setView}
            options={[
              { value: 'zones', label: t('map.mobile.zones') },
              { value: 'map', label: t('map.mobile.map') },
            ]}
            className="flex-1 [&>*]:flex-1"
          />
          <SegmentedControl<View>
            label={t('map.view.label')}
            value={project.view}
            onValueChange={actions.setView}
            options={[
              { value: 'today', label: t('map.view.today') },
              { value: 'complete', label: t('map.view.complete') },
            ]}
          />
        </div>
        <NextStepBar model={model} stacked />
      </div>

      {view === 'zones' ? (
        <div className="px-4 pt-3 pb-28">
          <ZoneAccordion
            model={model}
            open={open}
            onToggle={(id) =>
              setOpen(open.includes(id) ? open.filter((x) => x !== id) : [...open, id])
            }
            onItem={(picked) => select({ kind: 'item', id: picked.id })}
          />
        </div>
      ) : (
        <div className="relative mt-3 h-[calc(100dvh-56px-180px-72px)] min-h-[360px] border-t border-border">
          <ReactFlowProvider>
            <MapCanvas model={model} actions={actions} editable={false} showAnnotations>
              <ZoomControls minimap={false} />
            </MapCanvas>
          </ReactFlowProvider>
        </div>
      )}

      <Sheet
        open={item !== undefined}
        onOpenChange={(next) => (next ? undefined : select(null))}
        title={item ? model.itemName(item) : ''}
        description={
          zone ? (
            <ZoneTag zone={zone.color} label={model.zoneName(zone)} className="text-muted" />
          ) : undefined
        }
      >
        {item ? (
          <ItemDetails
            key={`${item.id}:${item.name}`}
            item={item}
            model={model}
            actions={actions}
            compact
          />
        ) : null}
      </Sheet>
    </div>
  );
}
