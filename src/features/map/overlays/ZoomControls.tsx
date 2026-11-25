import { MiniMap, Panel, useReactFlow, useViewport, type Node } from '@xyflow/react';
import { Maximize, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/ui/IconButton';
import type { ZoneColor } from '@/domain/zones';
import { FIT_PADDING } from '../map-keys';
import { useCameraDuration } from '../useCameraDuration';
import { cn } from '@/lib/utils';

/** Minimap with −, zoom level, + and "Ver tudo", always visible (ux-ui 12, 13.23). */
export function ZoomControls({
  minimap = true,
  className,
}: {
  minimap?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const duration = useCameraDuration();

  return (
    <Panel position="bottom-left" className={cn('m-4!', className)}>
      <div className="surface-raised w-[208px] overflow-hidden rounded-inner inset-ring inset-ring-stroke-strong">
        {minimap ? (
          <MiniMap
            pannable
            zoomable
            ariaLabel={t('map.minimap')}
            nodeColor={(node: Node) =>
              node.type === 'zone'
                ? `color-mix(in srgb, var(--zone-${(node.data as { color?: ZoneColor }).color ?? 'app'}) 40%, transparent)`
                : 'var(--fill-strong)'
            }
            nodeBorderRadius={6}
            className="static! m-0! h-[120px]! w-full! bg-transparent!"
          />
        ) : null}
        <div className="flex items-center justify-between border-t border-border px-1 py-1">
          <IconButton
            label={t('map.zoom.out')}
            icon={<Minus />}
            onClick={() => void zoomOut({ duration })}
          />
          <span className="font-mono text-[12px] text-muted tabular-nums">
            <span aria-hidden>{Math.round(zoom * 100)}%</span>
            <span className="sr-only">
              {t('map.zoom.level', { value: Math.round(zoom * 100) })}
            </span>
          </span>
          <IconButton
            label={t('map.zoom.in')}
            icon={<Plus />}
            onClick={() => void zoomIn({ duration })}
          />
          <IconButton
            label={t('map.zoom.fit')}
            icon={<Maximize />}
            onClick={() => void fitView({ duration, padding: FIT_PADDING })}
          />
        </div>
      </div>
    </Panel>
  );
}
