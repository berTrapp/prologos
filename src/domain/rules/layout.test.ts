import { describe, expect, it } from 'vitest';
import { makeConnection, makeItem, makeSnapshot, makeSubzone, zoneByKey } from '../fixtures';
import type { Item } from '../schemas/map';
import { LAYOUT, SUBZONE_WIDTH, ZONE_WIDTH, layoutMap, mapEdges } from './layout';

function withItems(count: number, zoneKey: 'app' | 'data' = 'app') {
  const snapshot = makeSnapshot();
  const zone = zoneByKey(snapshot, zoneKey);
  const items: Item[] = Array.from({ length: count }, (_, order) =>
    makeItem(zone.id, { order, name: `Item ${order}` }),
  );
  return { snapshot: { ...snapshot, items }, zone };
}

describe('layoutMap (RN 1)', () => {
  it('places the nine zones in three columns', () => {
    const { zones } = layoutMap(makeSnapshot().zones, []);
    expect(zones).toHaveLength(9);
    const columns = new Set(zones.map((z) => z.x));
    expect([...columns].sort((a, b) => a - b)).toEqual([
      0,
      ZONE_WIDTH + LAYOUT.zoneGap,
      2 * (ZONE_WIDTH + LAYOUT.zoneGap),
    ]);
    expect(zones.every((z) => z.width === ZONE_WIDTH)).toBe(true);
  });

  it('lays items in rows of two, in their order', () => {
    const { snapshot, zone } = withItems(3);
    const shuffled = [...snapshot.items].reverse();
    const { items } = layoutMap(snapshot.zones, shuffled);
    const byId = new Map(items.map((i) => [i.id, i]));
    const [a, b, c] = snapshot.items.map((i) => byId.get(i.id));
    expect(a).toMatchObject({ zoneId: zone.id, x: LAYOUT.padding, y: LAYOUT.header });
    expect(b?.x).toBe(LAYOUT.padding + LAYOUT.itemWidth + LAYOUT.itemGap);
    expect(c).toMatchObject({
      x: LAYOUT.padding,
      y: LAYOUT.header + LAYOUT.itemHeight + LAYOUT.itemGap,
    });
  });

  it('sizes a zone by its rows, and keeps room in an empty one', () => {
    const { snapshot, zone } = withItems(3);
    const laid = layoutMap(snapshot.zones, snapshot.items).zones;
    const app = laid.find((z) => z.id === zone.id);
    const empty = laid.find((z) => z.id !== zone.id);
    expect(app?.height).toBe(
      LAYOUT.header + 2 * LAYOUT.itemHeight + LAYOUT.itemGap + LAYOUT.bottom,
    );
    expect(empty?.height).toBe(LAYOUT.header + LAYOUT.emptyBody + LAYOUT.bottom);
    expect(app?.count).toBe(3);
  });

  it('nests subzones under the items, at full width', () => {
    const { snapshot, zone } = withItems(1);
    const sub = makeSubzone(zone.id);
    const inner = makeItem(sub.id);
    const layout = layoutMap([...snapshot.zones, sub], [...snapshot.items, inner]);
    const laidSub = layout.zones.find((z) => z.id === sub.id);
    expect(laidSub).toMatchObject({
      parentId: zone.id,
      width: SUBZONE_WIDTH,
      y: LAYOUT.header + LAYOUT.itemHeight + LAYOUT.subzoneGap,
    });
    expect(layout.items.find((i) => i.id === inner.id)?.x).toBe(LAYOUT.subPadding);
    expect(layout.zones.find((z) => z.id === zone.id)?.count).toBe(2);
  });

  it('starts a subzone right under the header in a zone without items', () => {
    const { snapshot, zone } = withItems(0);
    const sub = makeSubzone(zone.id);
    const layout = layoutMap([...snapshot.zones, sub], []);
    expect(layout.zones.find((z) => z.id === sub.id)?.y).toBe(LAYOUT.header);
  });

  it('turns a collapsed zone into a card and anchors its items to it', () => {
    const { snapshot, zone } = withItems(2);
    const sub = makeSubzone(zone.id);
    const inner = makeItem(sub.id);
    const zones = snapshot.zones.map((z) => (z.id === zone.id ? { ...z, collapsed: true } : z));
    const layout = layoutMap([...zones, sub], [...snapshot.items, inner]);
    expect(layout.zones.find((z) => z.id === zone.id)).toMatchObject({
      collapsed: true,
      height: LAYOUT.collapsedHeight,
      count: 3,
    });
    expect(layout.zones.some((z) => z.id === sub.id)).toBe(false);
    expect(layout.items).toHaveLength(0);
    expect(layout.anchor.get(inner.id)).toBe(zone.id);
  });

  it('lays 300 items out quickly', () => {
    const { snapshot } = withItems(300);
    const start = performance.now();
    layoutMap(snapshot.zones, snapshot.items);
    expect(performance.now() - start).toBeLessThan(50);
  });
});

describe('mapEdges (RN 1)', () => {
  it('draws one edge per connection, with its type', () => {
    const { snapshot } = withItems(2);
    const [a, b] = snapshot.items;
    if (!a || !b) throw new Error('items');
    const link = makeConnection(a.id, b.id, { type: 'uses' });
    const edges = mapEdges([link], layoutMap(snapshot.zones, snapshot.items));
    expect(edges).toEqual([
      { id: `${a.id}>${b.id}`, source: a.id, target: b.id, connectionIds: [link.id], type: 'uses' },
    ]);
  });

  it('points to the collapsed card and groups the connections with the count', () => {
    const snapshot = makeSnapshot();
    const app = zoneByKey(snapshot, 'app');
    const data = zoneByKey(snapshot, 'data');
    const a = makeItem(app.id);
    const b = makeItem(data.id, { order: 0 });
    const c = makeItem(data.id, { order: 1 });
    const zones = snapshot.zones.map((z) => (z.id === data.id ? { ...z, collapsed: true } : z));
    const layout = layoutMap(zones, [a, b, c]);
    const links = [
      makeConnection(a.id, b.id, { type: 'writes-to' }),
      makeConnection(a.id, c.id, { type: 'uses' }),
      makeConnection(b.id, c.id),
    ];
    const edges = mapEdges(links, layout);
    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({ source: a.id, target: data.id });
    expect(edges[0]?.connectionIds).toHaveLength(2);
    expect(edges[0]?.type).toBeUndefined();
  });

  it('skips connections whose ends are not on the map', () => {
    const { snapshot } = withItems(1);
    const [a] = snapshot.items;
    if (!a) throw new Error('items');
    const layout = layoutMap(snapshot.zones, snapshot.items);
    expect(mapEdges([makeConnection(a.id, 'hidden')], layout)).toEqual([]);
  });
});
