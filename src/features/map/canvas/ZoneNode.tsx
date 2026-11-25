import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import {
  ChevronDown,
  ChevronRight,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { memo, useContext, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/ui/IconButton';
import { Menu, MenuItem, MenuSeparator } from '@/components/ui/Menu';
import type { ZoneColor } from '@/domain/zones';
import { cn } from '@/lib/utils';
import { zoneBg, zoneRing, zoneText, zoneTint } from '@/lib/zone-colors';
import { ZoneCallbacksContext } from './zone-callbacks';

export type ZoneNodeData = {
  name: string;
  color: ZoneColor;
  count: number;
  collapsed: boolean;
  isSubzone: boolean;
  canAddSubzone: boolean;
  dimmed: boolean;
  /** An item is being dragged over it. */
  dropTarget: boolean;
  editable: boolean;
};

export type ZoneFlowNode = Node<ZoneNodeData, 'zone'>;

const handleClass = 'pointer-events-none! size-px! min-h-0! min-w-0! border-0! bg-transparent!';
const stop = (event: MouseEvent) => event.stopPropagation();

/** A zone or subzone on the canvas; collapsed, it becomes a card (ux-ui 13.23). */
export const ZoneNode = memo(function ZoneNode({ id, data, selected }: NodeProps<ZoneFlowNode>) {
  const { t } = useTranslation();
  const callbacks = useContext(ZoneCallbacksContext);
  const name = data.name;

  return (
    <div
      className={cn(
        'h-full w-full inset-ring transition-[opacity,box-shadow] duration-(--duration-fast)',
        data.isSubzone ? 'rounded-inner' : 'rounded-card',
        zoneRing[data.color],
        zoneTint[data.color],
        data.dimmed && 'opacity-35',
        data.dropTarget && 'inset-ring-2',
        selected && 'shadow-[0_0_0_1.5px_var(--text)]',
      )}
    >
      {data.collapsed ? (
        <>
          <Handle
            type="target"
            position={Position.Left}
            className={handleClass}
            isConnectable={false}
          />
          <Handle
            type="source"
            position={Position.Right}
            className={handleClass}
            isConnectable={false}
          />
        </>
      ) : null}
      <div
        className={cn(
          'flex items-center gap-2 pr-1.5',
          data.collapsed ? 'h-12 pl-3.5' : 'h-10 pl-3.5',
        )}
      >
        <span aria-hidden className={cn('size-2 shrink-0 rounded-full', zoneBg[data.color])} />
        <span className={cn('min-w-0 truncate text-[13.5px] font-semibold', zoneText[data.color])}>
          {name}
        </span>
        <span className="shrink-0 text-[12px] text-muted tabular-nums">
          {t('map.zone.items', { count: data.count })}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-0.5 nodrag nopan">
          {data.editable && !data.collapsed ? (
            <IconButton
              label={t('map.zone.add', { name })}
              icon={<Plus />}
              onClick={(event) => {
                stop(event);
                callbacks?.add(id, event.currentTarget.getBoundingClientRect());
              }}
            />
          ) : null}
          {data.editable ? (
            <Menu
              trigger={
                <IconButton label={t('map.zone.menu', { name })} icon={<MoreHorizontal />} />
              }
            >
              <MenuItem icon={<Pencil />} onSelect={() => callbacks?.rename(id)}>
                {t('map.zone.rename')}
              </MenuItem>
              {data.canAddSubzone ? (
                <MenuItem icon={<FolderPlus />} onSelect={() => callbacks?.addSubzone(id)}>
                  {t('map.zone.addSub')}
                </MenuItem>
              ) : null}
              <MenuSeparator />
              <MenuItem icon={<Trash2 />} destructive onSelect={() => callbacks?.remove(id, name)}>
                {t('map.zone.delete')}
              </MenuItem>
            </Menu>
          ) : null}
          <IconButton
            label={
              data.collapsed ? t('map.zone.expand', { name }) : t('map.zone.collapse', { name })
            }
            icon={data.collapsed ? <ChevronRight /> : <ChevronDown />}
            aria-expanded={!data.collapsed}
            onClick={(event) => {
              stop(event);
              callbacks?.toggle(id, !data.collapsed);
            }}
          />
        </span>
      </div>
      {!data.collapsed && data.count === 0 && data.editable ? (
        <p className="px-5 text-[12.5px] text-faint">{t('map.zone.empty')}</p>
      ) : null}
    </div>
  );
});
