import type { Connection, Item, Zone } from '../schemas/map';
import type { ProjectSnapshot, SnapshotPart } from '../schemas/snapshot';

/** RN 1: zone and subzone, never deeper. */
export const MAX_ZONE_DEPTH = 2;

export function zoneDepth(zones: readonly Zone[], zoneId: string): number {
  let depth = 0;
  let current = zones.find((zone) => zone.id === zoneId);
  const seen = new Set<string>();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    depth += 1;
    const parentId = current.parentId;
    current = parentId === null ? undefined : zones.find((zone) => zone.id === parentId);
  }
  return depth;
}

/** RN 1: a subzone can only hang from a top-level zone. */
export function canCreateSubzone(zones: readonly Zone[], parentId: string): boolean {
  const parent = zones.find((zone) => zone.id === parentId);
  return parent !== undefined && zoneDepth(zones, parentId) < MAX_ZONE_DEPTH;
}

export type MapIssue =
  | { code: 'zone-too-deep'; zoneId: string }
  | { code: 'zone-parent-missing'; zoneId: string }
  | { code: 'item-zone-missing'; itemId: string }
  | { code: 'connection-item-missing'; connectionId: string }
  | { code: 'connection-duplicate'; connectionId: string };

/** Structural rules of RN 1 over a whole project (used on import and in tests). */
export function validateMap(
  snapshot: Pick<ProjectSnapshot, 'zones' | 'items' | 'connections'>,
): MapIssue[] {
  const issues: MapIssue[] = [];
  const zoneIds = new Set(snapshot.zones.map((zone) => zone.id));
  const itemIds = new Set(snapshot.items.map((item) => item.id));

  for (const zone of snapshot.zones) {
    if (zone.parentId !== null && !zoneIds.has(zone.parentId)) {
      issues.push({ code: 'zone-parent-missing', zoneId: zone.id });
    } else if (zoneDepth(snapshot.zones, zone.id) > MAX_ZONE_DEPTH) {
      issues.push({ code: 'zone-too-deep', zoneId: zone.id });
    }
  }
  for (const item of snapshot.items) {
    if (!zoneIds.has(item.zoneId)) issues.push({ code: 'item-zone-missing', itemId: item.id });
  }
  const links = new Set<string>();
  for (const connection of snapshot.connections) {
    if (!itemIds.has(connection.from) || !itemIds.has(connection.to)) {
      issues.push({ code: 'connection-item-missing', connectionId: connection.id });
    }
    const link = `${connection.from}>${connection.to}`;
    if (links.has(link)) issues.push({ code: 'connection-duplicate', connectionId: connection.id });
    links.add(link);
  }
  return issues;
}

/** RN 1: moving keeps the item in exactly one zone. */
export function moveItem(
  snapshot: ProjectSnapshot,
  itemId: string,
  zoneId: string,
): ProjectSnapshot {
  if (!snapshot.zones.some((zone) => zone.id === zoneId))
    throw new Error(`Zone ${zoneId} not found`);
  return {
    ...snapshot,
    items: snapshot.items.map((item) => (item.id === itemId ? { ...item, zoneId } : item)),
  };
}

export function canConnect(
  snapshot: Pick<ProjectSnapshot, 'items' | 'connections'>,
  from: string,
  to: string,
): boolean {
  if (from === to) return false;
  const ids = new Set(snapshot.items.map((item) => item.id));
  if (!ids.has(from) || !ids.has(to)) return false;
  return !snapshot.connections.some((c) => c.from === from && c.to === to);
}

function descendantZoneIds(zones: readonly Zone[], zoneId: string): Set<string> {
  const ids = new Set([zoneId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const zone of zones) {
      if (zone.parentId !== null && ids.has(zone.parentId) && !ids.has(zone.id)) {
        ids.add(zone.id);
        grew = true;
      }
    }
  }
  return ids;
}

export type Removal = { snapshot: ProjectSnapshot; removed: SnapshotPart };

function removeItems(
  snapshot: ProjectSnapshot,
  itemIds: Set<string>,
  zoneIds = new Set<string>(),
): Removal {
  const touches = (c: Connection) => itemIds.has(c.from) || itemIds.has(c.to);
  const onItem = (row: { itemId?: string }) => row.itemId !== undefined && itemIds.has(row.itemId);

  const removed: SnapshotPart = {
    zones: snapshot.zones.filter((zone) => zoneIds.has(zone.id)),
    items: snapshot.items.filter((item) => itemIds.has(item.id)),
    connections: snapshot.connections.filter(touches),
    notes: snapshot.notes.filter(onItem),
    risks: snapshot.risks.filter(onItem),
    costs: snapshot.costs.filter(onItem),
    checklist: snapshot.checklist.filter((row) => zoneIds.has(row.zoneId)),
  };
  return {
    removed,
    snapshot: {
      ...snapshot,
      zones: snapshot.zones.filter((zone) => !zoneIds.has(zone.id)),
      items: snapshot.items.filter((item) => !itemIds.has(item.id)),
      // RN 1: flows stay; a step whose connection left shows as a gap.
      connections: snapshot.connections.filter((c) => !touches(c)),
      notes: snapshot.notes.filter((row) => !onItem(row)),
      risks: snapshot.risks.filter((row) => !onItem(row)),
      costs: snapshot.costs.filter((row) => !onItem(row)),
      checklist: snapshot.checklist.filter((row) => !zoneIds.has(row.zoneId)),
    },
  };
}

/** RN 1, 11: deleting a zone takes its subzones, items and their connections to the trash. */
export function removeZone(snapshot: ProjectSnapshot, zoneId: string): Removal {
  const zoneIds = descendantZoneIds(snapshot.zones, zoneId);
  const itemIds = new Set(
    snapshot.items.filter((item) => zoneIds.has(item.zoneId)).map((item) => item.id),
  );
  return removeItems(snapshot, itemIds, zoneIds);
}

/** RN 11: deleting an item takes its connections, notes, risks and costs along. */
export function removeItem(snapshot: ProjectSnapshot, itemId: string): Removal {
  return removeItems(snapshot, new Set([itemId]));
}

export function removeConnection(snapshot: ProjectSnapshot, connectionId: string): Removal {
  return {
    removed: { connections: snapshot.connections.filter((c) => c.id === connectionId) },
    snapshot: {
      ...snapshot,
      connections: snapshot.connections.filter((c) => c.id !== connectionId),
    },
  };
}

type Restored = { snapshot: ProjectSnapshot; skipped: string[] };

function mergeById<T extends { id: string }>(
  current: readonly T[],
  incoming: readonly T[] = [],
): T[] {
  const ids = new Set(current.map((row) => row.id));
  return [...current, ...incoming.filter((row) => !ids.has(row.id))];
}

/**
 * Puts a removed part back (Desfazer or restore from the trash, RN 11).
 * Rows whose parent no longer exists are skipped and reported.
 */
export function restore(snapshot: ProjectSnapshot, part: SnapshotPart): Restored {
  const skipped: string[] = [];
  const zones = mergeById(snapshot.zones, part.zones).map((zone) =>
    zone.parentId !== null &&
    ![...snapshot.zones, ...(part.zones ?? [])].some((z) => z.id === zone.parentId)
      ? { ...zone, parentId: null }
      : zone,
  );
  const zoneIds = new Set(zones.map((zone) => zone.id));

  const incomingItems = (part.items ?? []).filter((item) => {
    const ok = zoneIds.has(item.zoneId);
    if (!ok) skipped.push(item.id);
    return ok;
  });
  const items: Item[] = mergeById(snapshot.items, incomingItems);
  const itemIds = new Set(items.map((item) => item.id));

  const incomingConnections = (part.connections ?? []).filter((c) => {
    const ok = itemIds.has(c.from) && itemIds.has(c.to);
    if (!ok) skipped.push(c.id);
    return ok;
  });
  const keepOnItem = <T extends { id: string; itemId?: string }>(rows: readonly T[] = []) =>
    rows.filter((row) => {
      const ok = row.itemId === undefined || itemIds.has(row.itemId);
      if (!ok) skipped.push(row.id);
      return ok;
    });

  return {
    skipped,
    snapshot: {
      ...snapshot,
      zones,
      items,
      connections: mergeById(snapshot.connections, incomingConnections),
      flows: mergeById(snapshot.flows, part.flows),
      notes: mergeById(snapshot.notes, keepOnItem(part.notes)),
      risks: mergeById(snapshot.risks, keepOnItem(part.risks)),
      costs: mergeById(snapshot.costs, keepOnItem(part.costs)),
      envVars: mergeById(snapshot.envVars, part.envVars),
      checklist: mergeById(
        snapshot.checklist,
        (part.checklist ?? []).filter((row) => zoneIds.has(row.zoneId)),
      ),
    },
  };
}
