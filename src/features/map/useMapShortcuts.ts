import { useEffect } from 'react';
import { projectStore } from '@/app/services';
import { useMapUi } from './map-ui-store';
import type { MapActions } from './useMapActions';
import type { MapModel } from './useMapModel';

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/**
 * ux-ui 9: V selecionar, N novo item, Z nova zona, C conectar; Delete moves the
 * selection to the trash; Ctrl Z / Ctrl Shift Z undo and redo; Esc cancels.
 */
export function useMapShortcuts({
  model,
  actions,
  openNewItem,
  enabled,
}: {
  model: MapModel | undefined;
  actions: MapActions;
  openNewItem: () => void;
  enabled: boolean;
}) {
  useEffect(() => {
    if (!enabled || !model) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (typing(event.target) || event.altKey) return;
      if (document.querySelector('[role="dialog"], [role="menu"]')) return;
      const ui = useMapUi.getState();
      const key = event.key.toLowerCase();
      const mod = event.ctrlKey || event.metaKey;

      if (mod && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) projectStore.getState().redo();
        else projectStore.getState().undo();
        return;
      }
      if (mod && key === 'y') {
        event.preventDefault();
        projectStore.getState().redo();
        return;
      }
      if (mod) return;

      if (key === 'escape') {
        if (ui.drawing) ui.setDrawing(undefined);
        else if (ui.tool === 'connect') ui.setTool('select');
        else ui.select(null);
        return;
      }
      if (key === 'v') ui.setTool('select');
      else if (key === 'c') ui.setTool(ui.tool === 'connect' ? 'select' : 'connect');
      else if (key === 'n') {
        event.preventDefault();
        openNewItem();
      } else if (key === 'z') {
        event.preventDefault();
        ui.openNewZone(null);
      } else if (key === 'delete' || key === 'backspace') {
        const selection = ui.selection;
        if (!selection) return;
        event.preventDefault();
        if (selection.kind === 'item') {
          const item = model.itemById.get(selection.id);
          if (item) void actions.removeItem(item.id, model.itemName(item));
        } else if (selection.kind === 'zone') {
          const zone = model.zoneById.get(selection.id);
          if (zone) void actions.removeZone(zone.id, model.zoneName(zone));
        } else if (selection.connectionIds.length === 1) {
          const link = model.snapshot.connections.find((c) => c.id === selection.connectionIds[0]);
          const from = link && model.itemById.get(link.from);
          const to = link && model.itemById.get(link.to);
          if (link && from && to)
            void actions.removeConnection(
              link.id,
              `${model.itemName(from)} → ${model.itemName(to)}`,
            );
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [enabled, model, actions, openNewItem]);
}
