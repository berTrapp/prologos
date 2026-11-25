import {
  BaseEdge,
  EdgeLabelRenderer,
  Position,
  getBezierPath,
  useInternalNode,
  type Edge,
  type EdgeProps,
  type InternalNode,
} from '@xyflow/react';
import { memo } from 'react';
import { cn } from '@/lib/utils';

export type ConnectionEdgeData = {
  label?: string;
  /** In the active flow: animated gradient; `current` is the stretch being played. */
  flow?: 'active' | 'current';
  /** RN 1, 2: the stretch passes a future item in the Hoje view. */
  dashed: boolean;
  dimmed: boolean;
  /** Can be picked while drawing a flow. */
  pickable: boolean;
};

export type ConnectionFlowEdge = Edge<ConnectionEdgeData, 'connection'>;

type Box = { x: number; y: number; width: number; height: number };

const box = (node: InternalNode): Box => ({
  x: node.internals.positionAbsolute.x,
  y: node.internals.positionAbsolute.y,
  width: node.measured.width ?? 0,
  height: node.measured.height ?? 0,
});

/**
 * Floating ends: the edge leaves from the side that faces the other node, so the auto
 * layout never produces loops around the cards.
 */
function ends(source: Box, target: Box) {
  const sc = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
  const tc = { x: target.x + target.width / 2, y: target.y + target.height / 2 };
  const dx = tc.x - sc.x;
  const dy = tc.y - sc.y;
  const horizontal =
    Math.abs(dx) > (source.width + target.width) / 4 || Math.abs(dx) > Math.abs(dy);
  if (horizontal) {
    const right = dx >= 0;
    return {
      sx: right ? source.x + source.width : source.x,
      sy: sc.y,
      sp: right ? Position.Right : Position.Left,
      tx: right ? target.x : target.x + target.width,
      ty: tc.y,
      tp: right ? Position.Left : Position.Right,
    };
  }
  const down = dy >= 0;
  return {
    sx: sc.x,
    sy: down ? source.y + source.height : source.y,
    sp: down ? Position.Bottom : Position.Top,
    tx: tc.x,
    ty: down ? target.y : target.y + target.height,
    tp: down ? Position.Top : Position.Bottom,
  };
}

/** A connection on the canvas (ux-ui 13.24). */
export const ConnectionEdge = memo(function ConnectionEdge({
  id,
  source,
  target,
  data,
  selected,
  markerEnd,
}: EdgeProps<ConnectionFlowEdge>) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  if (!sourceNode || !targetNode) return null;

  const { sx, sy, sp, tx, ty, tp } = ends(box(sourceNode), box(targetNode));
  const [path, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sp,
    targetX: tx,
    targetY: ty,
    targetPosition: tp,
  });
  const gradient = `flow-${id.replace(/[^a-zA-Z0-9-]/g, '')}`;
  const inFlow = data?.flow !== undefined;

  return (
    <>
      {inFlow ? (
        <defs>
          <linearGradient
            id={gradient}
            gradientUnits="userSpaceOnUse"
            x1={sx}
            y1={sy}
            x2={tx}
            y2={ty}
          >
            <stop offset="0%" style={{ stopColor: 'var(--brand-from)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--brand-to)' }} />
          </linearGradient>
        </defs>
      ) : null}
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        interactionWidth={16}
        className={cn(
          'fill-none transition-[stroke,opacity] duration-(--duration-fast)',
          inFlow ? 'map-flow-edge' : selected ? 'stroke-text' : 'stroke-stroke-strong',
          data?.dashed && !inFlow && '[stroke-dasharray:4_4]',
          data?.dimmed && 'opacity-35',
          data?.pickable && 'stroke-accent',
        )}
        style={{
          strokeWidth: inFlow ? (data.flow === 'current' ? 2.5 : 2) : selected ? 2 : 1.5,
          ...(inFlow ? { stroke: `url(#${gradient})` } : {}),
        }}
      />
      {data?.label ? (
        <EdgeLabelRenderer>
          <span
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
            className={cn(
              'pointer-events-none absolute rounded-badge bg-bg px-1.5 py-0.5 font-mono text-[11px] leading-none text-muted',
              data.dimmed && 'opacity-35',
            )}
          >
            {data.label}
          </span>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
});
