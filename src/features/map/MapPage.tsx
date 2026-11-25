import { ReactFlowProvider } from '@xyflow/react';
import { useCallback, useEffect, useRef } from 'react';
import { Chip } from '@/components/ui/Chip';
import { kitText } from '@/domain/rules/kit';
import { DataNotice } from '@/features/project/DataNotice';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { usePersistentState } from '@/hooks/usePersistentState';
import { MapCanvas } from './canvas/MapCanvas';
import { DetailsPanel } from './details/DetailsPanel';
import { useMapUi } from './map-ui-store';
import { MobileMap } from './mobile/MobileMap';
import { NextStepBar } from './NextStepBar';
import { FlowPlayer } from './overlays/FlowPlayer';
import { MapToolbar } from './overlays/MapToolbar';
import { NewItemPopover } from './overlays/NewItemPopover';
import { NewZoneDialog } from './overlays/NewZoneDialog';
import { ViewControls } from './overlays/ViewControls';
import { ZoomControls } from './overlays/ZoomControls';
import { useMapActions } from './useMapActions';
import { useMapModel } from './useMapModel';
import { useMapShortcuts } from './useMapShortcuts';

/** The project map: the heart of the product (RN 1, 2, 9, 13, 15). */
export function MapPage() {
  const model = useMapModel();
  const actions = useMapActions();
  const phone = useBreakpoint() === 'phone';
  const projectId = model?.snapshot.project.id;
  const openProject = useMapUi((s) => s.openProject);

  // Another project starts with a clean selection, tools and filter; coming back to the
  // same one (from the checklist, say) keeps what was picked.
  useEffect(() => {
    if (projectId) openProject(projectId);
  }, [projectId, openProject]);

  if (!model) return null;
  if (phone) return <MobileMap model={model} actions={actions} />;
  return <DesktopMap model={model} actions={actions} />;
}

function DesktopMap({
  model,
  actions,
}: {
  model: NonNullable<ReturnType<typeof useMapModel>>;
  actions: ReturnType<typeof useMapActions>;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const selection = useMapUi((s) => s.selection);
  const openNewItemAt = useMapUi((s) => s.openNewItem);
  // ux-ui 10: the panel and the notes toggle are remembered.
  const [panelCollapsed, setPanelCollapsed] = usePersistentState(
    'prologos.mapPanelCollapsed',
    false,
  );
  const [showAnnotations, setShowAnnotations] = usePersistentState('prologos.mapAnnotations', true);

  // Picking something opens the details, which is where it is explained and edited.
  useEffect(() => {
    if (selection) setPanelCollapsed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  const openNewItem = useCallback(
    (origin?: DOMRect) => {
      const ui = useMapUi.getState();
      const selected = ui.selection;
      const zoneId =
        selected?.kind === 'zone'
          ? selected.id
          : selected?.kind === 'item'
            ? model.itemById.get(selected.id)?.zoneId
            : undefined;
      const area = origin ?? canvasRef.current?.getBoundingClientRect();
      const point = area
        ? origin
          ? { x: area.right, y: area.top + area.height / 2 }
          : { x: area.left + area.width / 2, y: area.top + area.height / 3 }
        : { x: 0, y: 0 };
      openNewItemAt(zoneId, point);
    },
    [model, openNewItemAt],
  );

  useMapShortcuts({ model, actions, openNewItem: () => openNewItem(), enabled: true });
  const kitName = model.kit ? kitText(model.kit.name, model.language) : undefined;

  return (
    <div className="flex h-dvh min-w-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-6">
          <h1 className="min-w-0 shrink truncate text-[16px] font-semibold text-text">
            {model.snapshot.project.name}
          </h1>
          {kitName ? <Chip>{kitName}</Chip> : null}
          <NextStepBar model={model} className="ml-3 max-w-[760px] flex-1" />
        </header>
        <DataNotice className="mx-6 mt-4 mb-0" />
        <div ref={canvasRef} className="relative min-h-0 flex-1">
          <ReactFlowProvider>
            <MapCanvas model={model} actions={actions} editable showAnnotations={showAnnotations}>
              <MapToolbar
                onNewItem={() =>
                  openNewItem(
                    canvasRef.current?.querySelector('[role=toolbar]')?.getBoundingClientRect(),
                  )
                }
              />
              <ViewControls
                model={model}
                actions={actions}
                showAnnotations={showAnnotations}
                onShowAnnotations={setShowAnnotations}
              />
              <ZoomControls />
              <FlowPlayer model={model} actions={actions} editable />
            </MapCanvas>
          </ReactFlowProvider>
        </div>
      </div>
      <DetailsPanel
        model={model}
        actions={actions}
        collapsed={panelCollapsed}
        onCollapsedChange={setPanelCollapsed}
      />
      <NewItemPopover model={model} actions={actions} />
      <NewZoneDialog model={model} actions={actions} />
    </div>
  );
}
