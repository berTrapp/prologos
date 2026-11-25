import {
  MarkerType,
  type NodeChangeset,
  ReactFlow,
  useReactFlow,
  type Edge,
  type EdgeChangeset,
  type Node,
  type NodeMouseHandler,
  type OnNodeDrag,
  type Viewport,
} from '@xyflow/react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { canConnect } from '@/domain/rules/map';
import { canAppendStep } from '@/domain/rules/flows';
import { LAYOUT } from '@/domain/rules/layout';
import { canCreateSubzone } from '@/domain/rules/map';
import { isFuture } from '@/domain/rules/view';
import { cn } from '@/lib/utils';
import { FIT_PADDING } from '../map-keys';
import { useMapUi } from '../map-ui-store';
import type { MapActions } from '../useMapActions';
import type { MapModel } from '../useMapModel';
import { ConnectionEdge, type ConnectionFlowEdge } from './ConnectionEdge';
import { ItemNode, type ItemFlowNode } from './ItemNode';
import { ZoneNode, type ZoneFlowNode } from './ZoneNode';
import { ZoneCallbacksContext, type ZoneCallbacks } from './zone-callbacks';

const nodeTypes = { item: ItemNode, zone: ZoneNode };
const edgeTypes = { connection: ConnectionEdge };

type FlowNode = ItemFlowNode | ZoneFlowNode;
type Rect = { id: string; x: number; y: number; width: number; height: number; depth: number };

const viewportKey = (projectId: string) => `prologos.mapViewport.${projectId}`;

function readViewport(projectId: string): Viewport | undefined {
  try {
    const raw = localStorage.getItem(viewportKey(projectId));
    return raw ? (JSON.parse(raw) as Viewport) : undefined;
  } catch {
    return undefined;
  }
}

type MapCanvasProps = {
  model: MapModel;
  actions: MapActions;
  /** Desktop edits; on the phone the map is for reading and deciding (ux-ui 12). */
  editable: boolean;
  showAnnotations: boolean;
  /** Overlays drawn inside the React Flow provider (controls, minimap, flow player). */
  children?: ReactNode;
  className?: string;
};

/** The project map on React Flow: zones as groups, items, connections and flows (RN 1). */
export function MapCanvas({
  model,
  actions,
  editable,
  showAnnotations,
  children,
  className,
}: MapCanvasProps) {
  const { t } = useTranslation();
  const flow = useReactFlow<FlowNode, ConnectionFlowEdge>();
  const selection = useMapUi((s) => s.selection);
  const tool = useMapUi((s) => s.tool);
  const connectFrom = useMapUi((s) => s.connectFrom);
  const zoneFilter = useMapUi((s) => s.zoneFilter);
  const activeFlowId = useMapUi((s) => s.activeFlowId);
  const flowStep = useMapUi((s) => s.flowStep);
  const drawing = useMapUi((s) => s.drawing);
  const ui = useMapUi.getState;
  const { snapshot, layout } = model;
  const projectId = snapshot.project.id;
  const [dropZone, setDropZone] = useState<string>();
  const [connectError, setConnectError] = useState(false);

  // Zones the "Tags" filter keeps: a top zone and everything under it (RN 1).
  const topOf = useMemo(() => {
    const result = new Map<string, string>();
    for (const zone of snapshot.zones) {
      let top = zone;
      while (top.parentId) top = model.zoneById.get(top.parentId) ?? top;
      result.set(zone.id, top.id);
    }
    return result;
  }, [snapshot.zones, model.zoneById]);
  const filtered = useCallback(
    (zoneId: string) => zoneFilter.length > 0 && !zoneFilter.includes(topOf.get(zoneId) ?? zoneId),
    [zoneFilter, topOf],
  );

  const activeFlow = snapshot.flows.find((f) => f.id === activeFlowId);
  const currentStep = activeFlow?.steps[flowStep];

  const zoneCallbacks = useMemo<ZoneCallbacks>(
    () => ({
      add: (zoneId, origin) =>
        ui().openNewItem(zoneId, { x: origin.left + origin.width / 2, y: origin.bottom }),
      toggle: (zoneId, collapsed) => actions.setCollapsed([zoneId], collapsed),
      rename: (zoneId) => ui().select({ kind: 'zone', id: zoneId }),
      addSubzone: (zoneId) => ui().openNewZone(zoneId),
      remove: (zoneId, name) => void actions.removeZone(zoneId, name),
    }),
    [actions, ui],
  );

  const computedNodes = useMemo<FlowNode[]>(() => {
    const zoneNodes: ZoneFlowNode[] = layout.zones.map((laid) => {
      const zone = model.zoneById.get(laid.id);
      const name = zone ? model.zoneName(zone) : '';
      return {
        id: laid.id,
        type: 'zone',
        position: { x: laid.x, y: laid.y },
        ...(laid.parentId ? { parentId: laid.parentId } : {}),
        width: laid.width,
        height: laid.height,
        style: { width: laid.width, height: laid.height },
        draggable: false,
        ariaLabel: name,
        data: {
          name,
          color: zone?.color ?? 'app',
          count: laid.count,
          collapsed: laid.collapsed,
          isSubzone: laid.parentId !== null,
          canAddSubzone: canCreateSubzone(snapshot.zones, laid.id),
          dimmed: filtered(laid.id),
          dropTarget: false,
          editable,
        },
      };
    });
    const itemNodes: ItemFlowNode[] = layout.items.map((laid) => {
      const item = model.itemById.get(laid.id);
      const zone = model.zoneById.get(laid.zoneId);
      if (!item || !zone) throw new Error(`Missing item ${laid.id}`);
      const notes = model.annotations.get(item.id);
      const status = model.itemStatus(item);
      const name = model.itemName(item);
      const choice = item.state === 'decided' ? model.choiceName(item) : undefined;
      return {
        id: item.id,
        type: 'item',
        position: { x: laid.x, y: laid.y },
        parentId: laid.zoneId,
        width: LAYOUT.itemWidth,
        height: LAYOUT.itemHeight,
        draggable: editable,
        ariaLabel: t('map.item.aria', {
          name,
          zone: model.zoneName(zone),
          status: choice ?? t(`mapItem.status.${status}`),
        }),
        data: {
          name,
          ...(choice ? { detail: choice } : {}),
          zone: zone.color,
          status,
          isNew: item.newForYou,
          notes: notes?.notes.length ?? 0,
          risks: notes?.risks.length ?? 0,
          ...(notes?.risks[0] ? { risk: notes.risks[0].severity } : {}),
          showAnnotations,
          dimmed: filtered(laid.zoneId),
          connecting: false,
        },
      };
    });
    return [...zoneNodes, ...itemNodes];
  }, [layout, model, snapshot.zones, editable, showAnnotations, filtered, t]);

  // React Flow reports sizes and drag positions; the layout owns everything else.
  const [measured, setMeasured] = useState<Record<string, { width: number; height: number }>>({});
  const [drag, setDrag] = useState<{ id: string; position: { x: number; y: number } }>();
  // Selection, the connecting source and the drop target touch one or two nodes: only those
  // get a new object, so React Flow re-renders just them (300 items stay fluid).
  const nodes = useMemo(
    () =>
      computedNodes.map((node) => {
        const size = measured[node.id];
        const moved = drag?.id === node.id;
        const selected =
          (selection?.kind === 'item' || selection?.kind === 'zone') && selection.id === node.id;
        const connecting = node.type === 'item' && connectFrom === node.id;
        const dropTarget = node.type === 'zone' && dropZone === node.id;
        if (!size && !moved && !selected && !connecting && !dropTarget) return node;
        const next = { ...node, selected, ...(size ? { measured: size } : {}) } as FlowNode;
        if (moved && drag) Object.assign(next, { position: drag.position, dragging: true });
        if (connecting) next.data = { ...node.data, connecting: true } as never;
        if (dropTarget) next.data = { ...node.data, dropTarget: true } as never;
        return next;
      }),
    [computedNodes, measured, drag, selection, connectFrom, dropZone],
  );

  const baseEdges = useMemo<ConnectionFlowEdge[]>(() => {
    const zoneOfNode = (id: string) => model.itemById.get(id)?.zoneId ?? id;
    return model.edges.map((edge) => {
      const ends = edge.connectionIds.flatMap((cid) => {
        const c = snapshot.connections.find((x) => x.id === cid);
        return c ? [c.from, c.to] : [];
      });
      const touchesFuture = ends.some((id) => {
        const item = model.itemById.get(id);
        return item ? isFuture(item) : false;
      });
      const inFlow = activeFlow?.steps.some((step) => edge.connectionIds.includes(step));
      const isCurrent = currentStep !== undefined && edge.connectionIds.includes(currentStep);
      const only = edge.connectionIds.length === 1 ? edge.connectionIds[0] : undefined;
      const label =
        edge.connectionIds.length > 1
          ? t('map.edge.count', { count: edge.connectionIds.length })
          : edge.type
            ? t(`map.connectionTypes.${edge.type}`)
            : undefined;
      const result: ConnectionFlowEdge = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'connection',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: inFlow ? 'var(--brand-to)' : 'var(--stroke-strong)',
        },
        data: {
          ...(label ? { label } : {}),
          ...(isCurrent ? { flow: 'current' as const } : inFlow ? { flow: 'active' as const } : {}),
          dashed: touchesFuture,
          dimmed: filtered(zoneOfNode(edge.source)) || filtered(zoneOfNode(edge.target)),
          pickable:
            drawing !== undefined && only !== undefined && canAppendStep(snapshot, drawing, only),
        },
      };
      return result;
    });
  }, [model, snapshot, activeFlow, currentStep, drawing, filtered, t]);
  const edges = useMemo(
    () =>
      baseEdges.map((edge) =>
        selection?.kind === 'edge' && selection.id === edge.id ? { ...edge, selected: true } : edge,
      ),
    [baseEdges, selection],
  );

  // Absolute rectangles of the open zones, deepest last, to find where a drag ends.
  const zoneRects = useMemo<Rect[]>(() => {
    const byId = new Map(layout.zones.map((z) => [z.id, z]));
    return layout.zones
      .filter((z) => !z.collapsed)
      .map((z) => {
        const parent = z.parentId ? byId.get(z.parentId) : undefined;
        return {
          id: z.id,
          x: z.x + (parent?.x ?? 0),
          y: z.y + (parent?.y ?? 0),
          width: z.width,
          height: z.height,
          depth: parent ? 1 : 0,
        };
      })
      .sort((a, b) => a.depth - b.depth);
  }, [layout]);

  const dropAt = useCallback(
    (node: Node) => {
      const internal = flow.getInternalNode(node.id);
      if (!internal) return undefined;
      const cx = internal.internals.positionAbsolute.x + LAYOUT.itemWidth / 2;
      const cy = internal.internals.positionAbsolute.y + LAYOUT.itemHeight / 2;
      const hits = zoneRects.filter(
        (r) => cx >= r.x && cx <= r.x + r.width && cy >= r.y && cy <= r.y + r.height,
      );
      const zone = hits.at(-1);
      if (!zone) return undefined;
      const column = cx - zone.x < zone.width / 2 ? 0 : 1;
      const row = Math.max(
        0,
        Math.floor((cy - zone.y - LAYOUT.header) / (LAYOUT.itemHeight + LAYOUT.itemGap)),
      );
      return { zoneId: zone.id, index: row * 2 + column };
    },
    [flow, zoneRects],
  );

  const onNodeDrag: OnNodeDrag<FlowNode> = (_event, node) => {
    const target = dropAt(node)?.zoneId;
    if (target !== dropZone) setDropZone(target);
  };

  const onNodeDragStop: OnNodeDrag<FlowNode> = (_event, node) => {
    setDropZone(undefined);
    const target = dropAt(node);
    const item = model.itemById.get(node.id);
    setDrag(undefined);
    if (!target || !item) return;
    const current = snapshot.items
      .filter((i) => i.zoneId === item.zoneId)
      .sort((a, b) => a.order - b.order)
      .findIndex((i) => i.id === item.id);
    if (target.zoneId === item.zoneId && target.index === current) return;
    actions.placeItem(item.id, target.zoneId, target.index);
  };

  const onNodesChange = (changes: NodeChangeset<FlowNode>) => {
    // Positions move only while dragging; selection is kept in the map store.
    const sizes = changes.getByType('dimensions').filter((c) => c.dimensions);
    if (sizes.length > 0) {
      setMeasured((current) => {
        const next = { ...current };
        for (const change of sizes) if (change.dimensions) next[change.id] = change.dimensions;
        return next;
      });
    }
    for (const change of changes.getByType('position')) {
      if (change.position && change.dragging) setDrag({ id: change.id, position: change.position });
    }
    for (const change of changes.getByType('select')) {
      if (!change.selected) continue;
      const node = nodes.find((n) => n.id === change.id);
      if (node?.type === 'item' && tool !== 'connect' && !drawing)
        ui().select({ kind: 'item', id: node.id });
      if (node?.type === 'zone' && !drawing) ui().select({ kind: 'zone', id: node.id });
    }
  };

  const onEdgesChange = (changes: EdgeChangeset<ConnectionFlowEdge>) => {
    for (const change of changes.getByType('select')) {
      if (!change.selected || drawing) continue;
      const edge = model.edges.find((e) => e.id === change.id);
      if (edge) ui().select({ kind: 'edge', id: edge.id, connectionIds: edge.connectionIds });
    }
  };

  const onNodeClick: NodeMouseHandler<FlowNode> = (_event, node) => {
    if (tool !== 'connect' || node.type !== 'item') return;
    if (!connectFrom) {
      ui().setConnectFrom(node.id);
      setConnectError(false);
      return;
    }
    if (connectFrom === node.id) return;
    if (!canConnect(snapshot, connectFrom, node.id)) {
      setConnectError(true);
      return;
    }
    actions.connect(connectFrom, node.id);
    ui().setTool('select');
    ui().select({ kind: 'item', id: node.id });
  };

  const onEdgeClick = (_event: unknown, edge: Edge) => {
    if (!drawing) return;
    const found = model.edges.find((e) => e.id === edge.id);
    const only = found?.connectionIds.length === 1 ? found.connectionIds[0] : undefined;
    if (only && canAppendStep(snapshot, drawing, only)) ui().setDrawing([...drawing, only]);
  };

  const [initialViewport] = useState(() => readViewport(projectId));

  return (
    <div className={cn('relative h-full w-full', className)}>
      <ZoneCallbacksContext value={zoneCallbacks}>
        <ReactFlow<FlowNode, ConnectionFlowEdge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onPaneClick={() => {
            ui().select(null);
            ui().setConnectFrom(undefined);
          }}
          onMoveEnd={(_event, viewport) => {
            try {
              localStorage.setItem(viewportKey(projectId), JSON.stringify(viewport));
            } catch {
              // Storage unavailable: the camera is not remembered this time.
            }
          }}
          {...(initialViewport
            ? { defaultViewport: initialViewport }
            : { fitView: true, fitViewOptions: { padding: FIT_PADDING, maxZoom: 1 } })}
          minZoom={0.2}
          maxZoom={2}
          nodesDraggable={editable}
          nodesConnectable={false}
          edgesFocusable
          elementsSelectable
          deleteKeyCode={null}
          selectionKeyCode={null}
          multiSelectionKeyCode={null}
          zoomOnDoubleClick={false}
          onlyRenderVisibleElements
          proOptions={{ hideAttribution: true }}
          ariaLabelConfig={{
            'node.a11yDescription.default': t('map.label'),
            'controls.zoomIn.ariaLabel': t('map.zoom.in'),
            'controls.zoomOut.ariaLabel': t('map.zoom.out'),
            'controls.fitView.ariaLabel': t('map.zoom.fit'),
            'minimap.ariaLabel': t('map.minimap'),
          }}
          aria-label={t('map.label')}
          className={cn(tool === 'connect' && 'cursor-crosshair')}
        >
          {children}
        </ReactFlow>
      </ZoneCallbacksContext>
      {tool === 'connect' ? (
        <p
          role="status"
          className="surface-raised pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-1.5 text-[13px] text-text inset-ring inset-ring-stroke-strong"
        >
          {connectError
            ? t('map.connectFailed')
            : connectFrom
              ? t('map.connectToHint')
              : t('map.connectHint')}
        </p>
      ) : null}
    </div>
  );
}
