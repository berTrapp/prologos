import { describe, expect, it } from 'vitest';
import { makeConnection, makeItem, makeSnapshot, makeSubzone, zoneByKey } from '../fixtures';
import type { ProjectSnapshot } from '../schemas/snapshot';
import {
  addItem,
  addZone,
  chooseOption,
  connect,
  placeItem,
  revertItem,
  setCollapsed,
  setConnectionType,
  updateItem,
  updateZone,
} from './edit';

function base() {
  const snapshot = makeSnapshot();
  const app = zoneByKey(snapshot, 'app');
  const data = zoneByKey(snapshot, 'data');
  const a = makeItem(app.id, { order: 0, name: 'A' });
  const b = makeItem(app.id, { order: 1, name: 'B' });
  const c = makeItem(app.id, { order: 2, name: 'C' });
  const d = makeItem(data.id, { order: 0, name: 'D', state: 'pending' });
  return {
    snapshot: { ...snapshot, items: [a, b, c, d] } as ProjectSnapshot,
    app,
    data,
    a,
    b,
    c,
    d,
  };
}

const names = (snapshot: ProjectSnapshot, zoneId: string) =>
  snapshot.items
    .filter((item) => item.zoneId === zoneId)
    .sort((x, y) => x.order - y.order)
    .map((item) => item.name);

describe('addItem', () => {
  it('adds at the end of the zone, decided and current by default', () => {
    const { snapshot, app } = base();
    const next = addItem(snapshot, { id: 'new', zoneId: app.id, name: '  Filas ' });
    expect(next.items.at(-1)).toMatchObject({
      id: 'new',
      name: 'Filas',
      order: 3,
      state: 'decided',
      when: 'now',
      newForYou: false,
    });
    expect(snapshot.items).toHaveLength(4);
  });

  it('keeps a kit item linked, and new for you if its technology is new (RN 15)', () => {
    const { snapshot, data } = base();
    const withNew = {
      ...snapshot,
      items: [...snapshot.items, makeItem(data.id, { tech: 'django', newForYou: true })],
    };
    const next = addItem(withNew, {
      id: 'n',
      zoneId: data.id,
      name: 'Filas',
      kitRef: 'queues',
      tech: 'django',
      state: 'pending',
      when: 'later',
    });
    expect(next.items.at(-1)).toMatchObject({
      kitRef: 'queues',
      tech: 'django',
      newForYou: true,
      state: 'pending',
      when: 'later',
    });
  });

  it('refuses a zone that does not exist', () => {
    expect(() => addItem(base().snapshot, { id: 'x', zoneId: 'nope', name: 'X' })).toThrow();
  });
});

describe('updateItem', () => {
  it('renames, keeping the old name when the new one is blank', () => {
    const { snapshot, a } = base();
    expect(updateItem(snapshot, a.id, { name: ' Novo ' }).items[0]?.name).toBe('Novo');
    expect(updateItem(snapshot, a.id, { name: '  ' }).items[0]?.name).toBe('A');
  });

  it('drops the chosen option when the item goes back to pending', () => {
    const { snapshot, d } = base();
    const chosen = chooseOption(snapshot, d.id, 'PostgreSQL');
    expect(chosen.items[3]).toMatchObject({ state: 'decided', choice: 'PostgreSQL' });
    expect(updateItem(chosen, d.id, { state: 'pending' }).items[3]?.choice).toBeUndefined();
    expect(updateItem(chosen, d.id, { when: 'later' }).items[3]?.choice).toBe('PostgreSQL');
  });

  it('reverts an item to how it was (Desfazer)', () => {
    const { snapshot, d } = base();
    const chosen = chooseOption(snapshot, d.id, 'MySQL');
    expect(revertItem(chosen, d).items[3]).toEqual(d);
  });
});

describe('placeItem (RN 1)', () => {
  it('reorders inside a zone', () => {
    const { snapshot, app, c } = base();
    expect(names(placeItem(snapshot, c.id, app.id, 0), app.id)).toEqual(['C', 'A', 'B']);
  });

  it('moves to another zone and renumbers both', () => {
    const { snapshot, app, data, a } = base();
    const next = placeItem(snapshot, a.id, data.id, 1);
    expect(names(next, data.id)).toEqual(['D', 'A']);
    expect(names(next, app.id)).toEqual(['B', 'C']);
    expect(
      next.items
        .filter((i) => i.zoneId === app.id)
        .map((i) => i.order)
        .sort(),
    ).toEqual([0, 1]);
  });

  it('clamps the position and refuses unknown ids', () => {
    const { snapshot, app, a } = base();
    expect(names(placeItem(snapshot, a.id, app.id, 99), app.id)).toEqual(['B', 'C', 'A']);
    expect(() => placeItem(snapshot, 'nope', app.id, 0)).toThrow();
    expect(() => placeItem(snapshot, a.id, 'nope', 0)).toThrow();
  });
});

describe('zones (RN 1)', () => {
  it('adds a zone with one of the zone colors at the end', () => {
    const next = addZone(makeSnapshot(), {
      id: 'z',
      name: ' Entrega ',
      color: 'infra',
      parentId: null,
    });
    expect(next.zones.at(-1)).toMatchObject({ id: 'z', name: 'Entrega', color: 'infra', order: 9 });
  });

  it('adds a subzone, but never a third level', () => {
    const snapshot = makeSnapshot();
    const app = zoneByKey(snapshot, 'app');
    const withSub = addZone(snapshot, { id: 's', name: 'Web', color: 'app', parentId: app.id });
    expect(withSub.zones.at(-1)).toMatchObject({ parentId: app.id, order: 0 });
    expect(() =>
      addZone(withSub, { id: 't', name: 'Fundo', color: 'app', parentId: 's' }),
    ).toThrow();
  });

  it('renames, recolors and collapses', () => {
    const snapshot = makeSnapshot();
    const app = zoneByKey(snapshot, 'app');
    const sub = makeSubzone(app.id);
    const base = { ...snapshot, zones: [...snapshot.zones, sub] };
    const renamed = updateZone(base, app.id, { name: ' Back-end ', color: 'ui' });
    expect(renamed.zones.find((z) => z.id === app.id)).toMatchObject({
      name: 'Back-end',
      color: 'ui',
    });
    expect(
      updateZone(renamed, app.id, { name: ' ' }).zones.find((z) => z.id === app.id)?.name,
    ).toBe('Back-end');
    const collapsed = setCollapsed(base, [app.id, sub.id], true);
    expect(collapsed.zones.filter((z) => z.collapsed).map((z) => z.id)).toEqual([app.id, sub.id]);
  });
});

describe('connections (RN 1)', () => {
  it('connects two items with a direction and an optional type', () => {
    const { snapshot, a, b } = base();
    const next = connect(snapshot, { id: 'k', from: a.id, to: b.id, type: 'uses' });
    expect(next.connections).toEqual([
      { id: 'k', projectId: 'p1', from: a.id, to: b.id, type: 'uses' },
    ]);
    expect(
      connect(snapshot, { id: 'k', from: a.id, to: b.id }).connections[0]?.type,
    ).toBeUndefined();
  });

  it('never repeats a link or links an item to itself', () => {
    const { snapshot, a, b } = base();
    const once = connect(snapshot, { id: 'k', from: a.id, to: b.id });
    expect(() => connect(once, { id: 'k2', from: a.id, to: b.id })).toThrow();
    expect(() => connect(snapshot, { id: 'k3', from: a.id, to: a.id })).toThrow();
  });

  it('changes or clears the type', () => {
    const { snapshot, a, b } = base();
    const link = makeConnection(a.id, b.id, { type: 'uses' });
    const withLink = { ...snapshot, connections: [link] };
    expect(setConnectionType(withLink, link.id, 'calls').connections[0]?.type).toBe('calls');
    expect(setConnectionType(withLink, link.id, undefined).connections[0]).not.toHaveProperty(
      'type',
    );
    expect(setConnectionType(withLink, 'other', 'calls').connections[0]?.type).toBe('uses');
  });
});
