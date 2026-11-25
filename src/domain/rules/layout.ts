import type { Connection, Item, Zone } from '../schemas/map';

/** Sizes of the automatic layout (RN 1, ux-ui 13.16, 13.23). */
export const LAYOUT = {
  itemWidth: 168,
  itemHeight: 48,
  itemGap: 8,
  /** Horizontal padding of a top zone; subzones use `subPadding`. */
  padding: 20,
  subPadding: 8,
  bottom: 12,
  header: 40,
  /** Height of an empty zone body, so there is room to drop an item. */
  emptyBody: 56,
  collapsedHeight: 48,
  zoneGap: 24,
  subzoneGap: 12,
  columns: 3,
} as const;

const ITEMS_PER_ROW = 2;
const ROW_WIDTH = ITEMS_PER_ROW * LAYOUT.itemWidth + (ITEMS_PER_ROW - 1) * LAYOUT.itemGap;
/** Width of a subzone and of a top zone (which holds a subzone plus its padding). */
export const SUBZONE_WIDTH = ROW_WIDTH + 2 * LAYOUT.subPadding;
export const ZONE_WIDTH = SUBZONE_WIDTH + 2 * (LAYOUT.padding - LAYOUT.subPadding);

export type LaidZone = {
  id: string;
  parentId: string | null;
  /** Relative to the parent zone, or absolute for a top zone. */
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed: boolean;
  /** Items inside, including those in subzones (shown on a collapsed card). */
  count: number;
};

export type LaidItem = { id: string; zoneId: string; x: number; y: number };

export type MapLayout = {
  zones: LaidZone[];
  items: LaidItem[];
  /** Node id that stands for each item: itself, or the collapsed zone that hides it. */
  anchor: Map<string, string>;
};

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

/**
 * RN 1: zones in a grid sized by their content, items in rows of two in their order.
 * Collapsed zones become a card; the items inside are anchored to it.
 * `items` is the visible set (the Hoje view already applied).
 */
export function layoutMap(zones: readonly Zone[], items: readonly Item[]): MapLayout {
  const childrenOf = new Map<string | null, Zone[]>();
  for (const zone of zones) {
    const list = childrenOf.get(zone.parentId) ?? [];
    list.push(zone);
    childrenOf.set(zone.parentId, list);
  }
  for (const list of childrenOf.values()) list.sort(byOrder);
  const itemsOf = new Map<string, Item[]>();
  for (const item of items) {
    const list = itemsOf.get(item.zoneId) ?? [];
    list.push(item);
    itemsOf.set(item.zoneId, list);
  }
  for (const list of itemsOf.values()) list.sort(byOrder);

  const laidZones: LaidZone[] = [];
  const laidItems: LaidItem[] = [];
  const anchor = new Map<string, string>();

  const countIn = (zoneId: string): number =>
    (itemsOf.get(zoneId)?.length ?? 0) +
    (childrenOf.get(zoneId) ?? []).reduce((sum, child) => sum + countIn(child.id), 0);

  const anchorAll = (zoneId: string, to: string) => {
    for (const item of itemsOf.get(zoneId) ?? []) anchor.set(item.id, to);
    for (const child of childrenOf.get(zoneId) ?? []) anchorAll(child.id, to);
  };

  /** Lays a zone out at (x, y) relative to its parent; returns its height. */
  const place = (zone: Zone, x: number, y: number, width: number): number => {
    const isSub = zone.parentId !== null;
    const entry: LaidZone = {
      id: zone.id,
      parentId: zone.parentId,
      x,
      y,
      width,
      height: LAYOUT.collapsedHeight,
      collapsed: zone.collapsed,
      count: countIn(zone.id),
    };
    laidZones.push(entry);
    if (zone.collapsed) {
      anchorAll(zone.id, zone.id);
      return entry.height;
    }

    const pad = isSub ? LAYOUT.subPadding : LAYOUT.padding;
    const own = itemsOf.get(zone.id) ?? [];
    own.forEach((item, index) => {
      const column = index % ITEMS_PER_ROW;
      const row = Math.floor(index / ITEMS_PER_ROW);
      laidItems.push({
        id: item.id,
        zoneId: zone.id,
        x: pad + column * (LAYOUT.itemWidth + LAYOUT.itemGap),
        y: LAYOUT.header + row * (LAYOUT.itemHeight + LAYOUT.itemGap),
      });
      anchor.set(item.id, item.id);
    });
    const rows = Math.ceil(own.length / ITEMS_PER_ROW);
    let cursor =
      LAYOUT.header + (rows > 0 ? rows * (LAYOUT.itemHeight + LAYOUT.itemGap) - LAYOUT.itemGap : 0);

    const subzones = childrenOf.get(zone.id) ?? [];
    for (const child of subzones) {
      cursor += rows > 0 || child !== subzones[0] ? LAYOUT.subzoneGap : 0;
      cursor += place(child, LAYOUT.padding - LAYOUT.subPadding, cursor, SUBZONE_WIDTH);
    }
    if (rows === 0 && subzones.length === 0) cursor += LAYOUT.emptyBody;
    entry.height = cursor + LAYOUT.bottom;
    return entry.height;
  };

  // Masonry: each top zone goes to the shortest column, in order.
  const columnHeights: number[] = Array.from({ length: LAYOUT.columns }, () => 0);
  for (const zone of childrenOf.get(null) ?? []) {
    const column = columnHeights.indexOf(Math.min(...columnHeights));
    const x = column * (ZONE_WIDTH + LAYOUT.zoneGap);
    const top = columnHeights[column] ?? 0;
    const height = place(zone, x, top, ZONE_WIDTH);
    columnHeights[column] = top + height + LAYOUT.zoneGap;
  }

  return { zones: laidZones, items: laidItems, anchor };
}

export type MapEdge = {
  id: string;
  source: string;
  target: string;
  connectionIds: string[];
  /** Type label when the edge stands for a single connection. */
  type?: Connection['type'];
};

/**
 * RN 1: connections that touch a collapsed zone point to its card, grouped by
 * source and target with the count. Connections inside one collapsed zone disappear.
 */
export function mapEdges(connections: readonly Connection[], layout: MapLayout): MapEdge[] {
  const groups = new Map<string, MapEdge>();
  for (const connection of connections) {
    const source = layout.anchor.get(connection.from);
    const target = layout.anchor.get(connection.to);
    if (!source || !target || source === target) continue;
    const key = `${source}>${target}`;
    const group = groups.get(key);
    if (group) {
      group.connectionIds.push(connection.id);
      delete group.type;
    } else {
      const edge: MapEdge = { id: key, source, target, connectionIds: [connection.id] };
      if (connection.type) edge.type = connection.type;
      groups.set(key, edge);
    }
  }
  return [...groups.values()];
}
