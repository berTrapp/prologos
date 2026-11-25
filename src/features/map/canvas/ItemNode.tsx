import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { StickyNote, TriangleAlert } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapItem, type MapItemStatus } from '@/components/ui/MapItem';
import type { Severity } from '@/domain/schemas/notes';
import type { ZoneColor } from '@/domain/zones';
import { cn } from '@/lib/utils';

export type ItemNodeData = {
  name: string;
  detail?: string;
  zone: ZoneColor;
  status: MapItemStatus;
  isNew: boolean;
  notes: number;
  /** Most severe open risk, if any. */
  risk?: Severity;
  risks: number;
  showAnnotations: boolean;
  dimmed: boolean;
  /** Picked as the source while connecting. */
  connecting: boolean;
};

export type ItemFlowNode = Node<ItemNodeData, 'item'>;

const riskTone: Record<Severity, string> = {
  high: 'text-danger',
  medium: 'text-warning',
  low: 'text-muted',
};

const handleClass = 'pointer-events-none! size-px! min-h-0! min-w-0! border-0! bg-transparent!';

/** An item on the canvas (ux-ui 13.16), with note and risk marks when they are on. */
export const ItemNode = memo(function ItemNode({ data, selected }: NodeProps<ItemFlowNode>) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'relative transition-opacity duration-(--duration-fast)',
        data.dimmed && 'opacity-35',
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={handleClass}
        isConnectable={false}
      />
      <MapItem
        inert
        name={data.name}
        detail={data.detail}
        zone={data.zone}
        status={data.status}
        isNew={data.isNew}
        selected={selected || data.connecting}
      />
      {data.showAnnotations && (data.notes > 0 || data.risks > 0) ? (
        <span className="absolute -top-2 right-2 flex items-center gap-1 rounded-badge bg-bg px-1 py-0.5 inset-ring inset-ring-border">
          {data.notes > 0 ? (
            <span className="flex items-center gap-0.5 text-[10.5px] leading-none text-muted">
              <StickyNote aria-hidden className="size-3" />
              <span aria-hidden>{data.notes}</span>
              <span className="sr-only">{t('map.item.notes', { count: data.notes })}</span>
            </span>
          ) : null}
          {data.risk ? (
            <span
              className={cn(
                'flex items-center gap-0.5 text-[10.5px] leading-none',
                riskTone[data.risk],
              )}
            >
              <TriangleAlert aria-hidden className="size-3" />
              <span aria-hidden>{data.risks}</span>
              <span className="sr-only">{t('map.item.risks', { count: data.risks })}</span>
            </span>
          ) : null}
        </span>
      ) : null}
      <Handle
        type="source"
        position={Position.Right}
        className={handleClass}
        isConnectable={false}
      />
    </div>
  );
});
