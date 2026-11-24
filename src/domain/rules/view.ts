import type { Connection, Flow, Item } from '../schemas/map';
import type { View } from '../schemas/project';
import type { ProjectSnapshot } from '../schemas/snapshot';

/** RN 2: an item is current or future; there is no "discarded". */
export function isFuture(item: Pick<Item, 'when'>): boolean {
  return item.when === 'later';
}

/** Status shown on the map card (ux-ui 13.16). */
export function mapItemStatus(
  item: Pick<Item, 'when' | 'state'>,
): 'decided' | 'pending' | 'future' {
  return isFuture(item) ? 'future' : item.state;
}

/** RN 2: in Hoje, future items and the connections that touch them are hidden. */
export function visibleMap(
  snapshot: Pick<ProjectSnapshot, 'items' | 'connections'>,
  view: View,
): { items: Item[]; connections: Connection[] } {
  if (view === 'complete')
    return { items: [...snapshot.items], connections: [...snapshot.connections] };
  const items = snapshot.items.filter((item) => !isFuture(item));
  const ids = new Set(items.map((item) => item.id));
  return {
    items,
    connections: snapshot.connections.filter((c) => ids.has(c.from) && ids.has(c.to)),
  };
}

export type FlowSegment = { connectionId: string; look: 'solid' | 'dashed' | 'gap' };

/**
 * RN 1, 2: a flow may pass through future items; in Hoje that stretch is dashed.
 * A step whose connection is gone (in the trash) is a gap.
 */
export function flowSegments(
  flow: Pick<Flow, 'steps'>,
  snapshot: Pick<ProjectSnapshot, 'items' | 'connections'>,
  view: View,
): FlowSegment[] {
  const items = new Map(snapshot.items.map((item) => [item.id, item]));
  const connections = new Map(snapshot.connections.map((c) => [c.id, c]));
  return flow.steps.map((connectionId) => {
    const connection = connections.get(connectionId);
    if (!connection) return { connectionId, look: 'gap' };
    const ends = [items.get(connection.from), items.get(connection.to)];
    if (ends.some((item) => item === undefined)) return { connectionId, look: 'gap' };
    const throughFuture = ends.some((item) => item && isFuture(item));
    return { connectionId, look: view === 'today' && throughFuture ? 'dashed' : 'solid' };
  });
}
