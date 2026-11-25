import type { Connection, ConnectionType, Item, Zone } from '../schemas/map';
import type { ProjectSnapshot } from '../schemas/snapshot';
import type { ZoneColor } from '../zones';
import { canConnect, canCreateSubzone } from './map';

/** Map edits (RN 1, 2, 13). Each one returns a new snapshot and never touches the input. */

const nextOrder = (rows: readonly { order: number }[]) =>
  rows.reduce((max, row) => Math.max(max, row.order + 1), 0);

export type NewItem = {
  id: string;
  zoneId: string;
  name: string;
  kitRef?: string;
  tech?: string;
  state?: Item['state'];
  when?: Item['when'];
};

/**
 * Adds an item at the end of its zone. A technology the person marked as new
 * elsewhere in the map stays new here (RN 15).
 */
export function addItem(snapshot: ProjectSnapshot, input: NewItem): ProjectSnapshot {
  if (!snapshot.zones.some((zone) => zone.id === input.zoneId))
    throw new Error(`Zone ${input.zoneId} not found`);
  const item: Item = {
    id: input.id,
    projectId: snapshot.project.id,
    zoneId: input.zoneId,
    name: input.name.trim(),
    state: input.state ?? 'decided',
    when: input.when ?? 'now',
    newForYou: input.tech
      ? snapshot.items.some((other) => other.tech === input.tech && other.newForYou)
      : false,
    order: nextOrder(snapshot.items.filter((other) => other.zoneId === input.zoneId)),
  };
  if (input.kitRef) item.kitRef = input.kitRef;
  if (input.tech) item.tech = input.tech;
  return { ...snapshot, items: [...snapshot.items, item] };
}

export type ItemPatch = Partial<Pick<Item, 'name' | 'description' | 'when' | 'state'>>;

/** Renames or changes Atual/Futuro and Decidido/Pendente. Pending drops the chosen option. */
export function updateItem(
  snapshot: ProjectSnapshot,
  itemId: string,
  patch: ItemPatch,
): ProjectSnapshot {
  return {
    ...snapshot,
    items: snapshot.items.map((item) => {
      if (item.id !== itemId) return item;
      const next: Item = { ...item, ...patch };
      if (patch.name !== undefined) next.name = patch.name.trim() || item.name;
      if (patch.state === 'pending') delete next.choice;
      return next;
    }),
  };
}

/** RN 13: picking an option decides a pending item ("Banco: PostgreSQL"). */
export function chooseOption(
  snapshot: ProjectSnapshot,
  itemId: string,
  choice: string,
): ProjectSnapshot {
  return {
    ...snapshot,
    items: snapshot.items.map((item) =>
      item.id === itemId ? { ...item, state: 'decided', choice } : item,
    ),
  };
}

/** Desfazer of an option: the item goes back exactly as it was. */
export function revertItem(snapshot: ProjectSnapshot, previous: Item): ProjectSnapshot {
  return {
    ...snapshot,
    items: snapshot.items.map((item) => (item.id === previous.id ? previous : item)),
  };
}

/**
 * RN 1: moves an item to a zone at a position, renumbering both zones so the
 * order stays 0, 1, 2…
 */
export function placeItem(
  snapshot: ProjectSnapshot,
  itemId: string,
  zoneId: string,
  index: number,
): ProjectSnapshot {
  const moving = snapshot.items.find((item) => item.id === itemId);
  if (!moving) throw new Error(`Item ${itemId} not found`);
  if (!snapshot.zones.some((zone) => zone.id === zoneId))
    throw new Error(`Zone ${zoneId} not found`);

  const sorted = (id: string) =>
    snapshot.items
      .filter((item) => item.zoneId === id && item.id !== itemId)
      .sort((a, b) => a.order - b.order);
  const target = sorted(zoneId);
  const at = Math.max(0, Math.min(index, target.length));
  target.splice(at, 0, { ...moving, zoneId });

  const orders = new Map<string, { zoneId: string; order: number }>();
  target.forEach((item, order) => orders.set(item.id, { zoneId, order }));
  if (moving.zoneId !== zoneId) {
    sorted(moving.zoneId).forEach((item, order) =>
      orders.set(item.id, { zoneId: moving.zoneId, order }),
    );
  }
  return {
    ...snapshot,
    items: snapshot.items.map((item) => {
      const next = orders.get(item.id);
      return next ? { ...item, ...next } : item;
    }),
  };
}

export type NewZone = { id: string; name: string; color: ZoneColor; parentId: string | null };

/** RN 1: a new zone or subzone (two levels at most) uses one of the nine zone colors. */
export function addZone(snapshot: ProjectSnapshot, input: NewZone): ProjectSnapshot {
  if (input.parentId !== null && !canCreateSubzone(snapshot.zones, input.parentId))
    throw new Error('Subzones go at most two levels deep');
  const zone: Zone = {
    id: input.id,
    projectId: snapshot.project.id,
    parentId: input.parentId,
    name: input.name.trim(),
    color: input.color,
    order: nextOrder(snapshot.zones.filter((other) => other.parentId === input.parentId)),
    collapsed: false,
  };
  return { ...snapshot, zones: [...snapshot.zones, zone] };
}

export type ZonePatch = Partial<Pick<Zone, 'name' | 'color' | 'collapsed'>>;

export function updateZone(
  snapshot: ProjectSnapshot,
  zoneId: string,
  patch: ZonePatch,
): ProjectSnapshot {
  return {
    ...snapshot,
    zones: snapshot.zones.map((zone) => {
      if (zone.id !== zoneId) return zone;
      const next = { ...zone, ...patch };
      if (patch.name !== undefined) next.name = patch.name.trim() || zone.name;
      return next;
    }),
  };
}

/** ux-ui 10: collapsed zones are remembered with the project. */
export function setCollapsed(
  snapshot: ProjectSnapshot,
  zoneIds: readonly string[],
  collapsed: boolean,
): ProjectSnapshot {
  const ids = new Set(zoneIds);
  return {
    ...snapshot,
    zones: snapshot.zones.map((zone) => (ids.has(zone.id) ? { ...zone, collapsed } : zone)),
  };
}

export type NewConnection = { id: string; from: string; to: string; type?: ConnectionType };

/** RN 1: direction is mandatory, the type optional; the same link is never repeated. */
export function connect(snapshot: ProjectSnapshot, input: NewConnection): ProjectSnapshot {
  if (!canConnect(snapshot, input.from, input.to)) throw new Error('These items cannot connect');
  const connection: Connection = {
    id: input.id,
    projectId: snapshot.project.id,
    from: input.from,
    to: input.to,
  };
  if (input.type) connection.type = input.type;
  return { ...snapshot, connections: [...snapshot.connections, connection] };
}

export function setConnectionType(
  snapshot: ProjectSnapshot,
  connectionId: string,
  type: ConnectionType | undefined,
): ProjectSnapshot {
  return {
    ...snapshot,
    connections: snapshot.connections.map((connection) => {
      if (connection.id !== connectionId) return connection;
      const next = { ...connection };
      if (type) next.type = type;
      else delete next.type;
      return next;
    }),
  };
}
