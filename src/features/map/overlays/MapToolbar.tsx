import { Panel } from '@xyflow/react';
import { FolderPlus, MousePointer2, Plus, Redo2, Spline, Undo2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProject } from '@/app/services';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/utils';
import { MAP_KEYS } from '../map-keys';
import { useMapUi } from '../map-ui-store';

/** Vertical tool rail: V, N, Z, C, then Desfazer and Refazer. */
export function MapToolbar({ onNewItem }: { onNewItem: () => void }) {
  const { t } = useTranslation();
  const tool = useMapUi((s) => s.tool);
  const setTool = useMapUi((s) => s.setTool);
  const openNewZone = useMapUi((s) => s.openNewZone);
  const history = useProject((s) => s.history);
  const undo = useProject((s) => s.undo);
  const redo = useProject((s) => s.redo);

  const toolClass = (active: boolean) => cn(active && 'bg-fill-active text-text');

  return (
    <Panel position="top-left" className="m-4!">
      <div
        role="toolbar"
        aria-label={t('map.tools.label')}
        aria-orientation="vertical"
        className="surface-raised flex flex-col gap-1 rounded-inner p-1 inset-ring inset-ring-stroke-strong"
      >
        <IconButton
          label={t('map.tools.select')}
          shortcut={MAP_KEYS.select}
          tooltipSide="right"
          icon={<MousePointer2 />}
          aria-pressed={tool === 'select'}
          className={toolClass(tool === 'select')}
          onClick={() => setTool('select')}
        />
        <IconButton
          label={t('map.tools.newItem')}
          shortcut={MAP_KEYS.newItem}
          tooltipSide="right"
          icon={<Plus />}
          onClick={onNewItem}
        />
        <IconButton
          label={t('map.tools.newZone')}
          shortcut={MAP_KEYS.newZone}
          tooltipSide="right"
          icon={<FolderPlus />}
          onClick={() => openNewZone(null)}
        />
        <IconButton
          label={t('map.tools.connect')}
          shortcut={MAP_KEYS.connect}
          tooltipSide="right"
          icon={<Spline />}
          aria-pressed={tool === 'connect'}
          className={toolClass(tool === 'connect')}
          onClick={() => setTool(tool === 'connect' ? 'select' : 'connect')}
        />
        <span aria-hidden className="mx-1.5 my-0.5 h-px bg-border" />
        <IconButton
          label={t('map.tools.undo')}
          shortcut={t('keys.undo')}
          tooltipSide="right"
          icon={<Undo2 />}
          disabled={history.past.length === 0}
          onClick={undo}
        />
        <IconButton
          label={t('map.tools.redo')}
          shortcut={t('keys.redo')}
          tooltipSide="right"
          icon={<Redo2 />}
          disabled={history.future.length === 0}
          onClick={redo}
        />
      </div>
    </Panel>
  );
}
