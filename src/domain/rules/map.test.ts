import { describe, expect, it } from 'vitest';
import { makeConnection, makeItem, makeSnapshot, makeSubzone, zoneByKey } from '../fixtures';
import type { Flow } from '../schemas/map';
import type { Note, Risk } from '../schemas/notes';
import {
  canConnect,
  canCreateSubzone,
  moveItem,
  removeConnection,
  removeItem,
  removeZone,
  restore,
  validateMap,
  zoneDepth,
} from './map';

function project() {
  const base = makeSnapshot();
  const data = zoneByKey(base, 'data');
  const app = zoneByKey(base, 'app');
  const sub = makeSubzone(data.id, { name: 'Cache' });
  const api = makeItem(app.id, { name: 'API' });
  const db = makeItem(data.id, { name: 'PostgreSQL' });
  const redis = makeItem(sub.id, { name: 'Redis' });
  const apiToDb = makeConnection(api.id, db.id);
  const apiToRedis = makeConnection(api.id, redis.id);
  const flow: Flow = {
    id: 'f1',
    projectId: 'p1',
    name: 'Salvar',
    steps: [apiToDb.id, apiToRedis.id],
  };
  const note: Note = {
    id: 'n1',
    projectId: 'p1',
    itemId: redis.id,
    text: 'TTL curto',
    private: false,
    createdAt: 0,
  };
  const risk: Risk = {
    id: 'r1',
    projectId: 'p1',
    itemId: db.id,
    text: 'Sem backup',
    severity: 'high',
    resolved: false,
    createdAt: 0,
  };
  const snapshot = {
    ...base,
    zones: [...base.zones, sub],
    items: [api, db, redis],
    connections: [apiToDb, apiToRedis],
    flows: [flow],
    notes: [note],
    risks: [risk],
    checklist: [{ id: 'c1', projectId: 'p1', zoneId: data.id, itemRef: 'database', order: 0 }],
  };
  return { snapshot, data, app, sub, api, db, redis, apiToDb, apiToRedis };
}

describe('zone depth (RN 1)', () => {
  it('counts zone = 1 and subzone = 2', () => {
    const { snapshot, data, sub } = project();
    expect(zoneDepth(snapshot.zones, data.id)).toBe(1);
    expect(zoneDepth(snapshot.zones, sub.id)).toBe(2);
    expect(zoneDepth(snapshot.zones, 'missing')).toBe(0);
  });

  it('allows a subzone under a zone, never under a subzone', () => {
    const { snapshot, data, sub } = project();
    expect(canCreateSubzone(snapshot.zones, data.id)).toBe(true);
    expect(canCreateSubzone(snapshot.zones, sub.id)).toBe(false);
    expect(canCreateSubzone(snapshot.zones, 'missing')).toBe(false);
  });

  it('flags a third level and a missing parent', () => {
    const { snapshot, sub } = project();
    const deep = makeSubzone(sub.id);
    const orphan = makeSubzone('gone');
    const issues = validateMap({ ...snapshot, zones: [...snapshot.zones, deep, orphan] });
    expect(issues).toContainEqual({ code: 'zone-too-deep', zoneId: deep.id });
    expect(issues).toContainEqual({ code: 'zone-parent-missing', zoneId: orphan.id });
  });

  it('survives a parent cycle', () => {
    const a = makeSubzone('b', { id: 'a' });
    const b = makeSubzone('a', { id: 'b' });
    expect(zoneDepth([a, b], 'a')).toBe(2);
  });
});

describe('items and connections (RN 1)', () => {
  it('a valid project has no issues', () => {
    expect(validateMap(project().snapshot)).toEqual([]);
  });

  it('flags items without a zone and broken or repeated connections', () => {
    const { snapshot, api, db } = project();
    const lost = makeItem('gone');
    const broken = makeConnection(api.id, 'gone');
    const repeated = makeConnection(api.id, db.id);
    const issues = validateMap({
      ...snapshot,
      items: [...snapshot.items, lost],
      connections: [...snapshot.connections, broken, repeated],
    });
    expect(issues).toEqual([
      { code: 'item-zone-missing', itemId: lost.id },
      { code: 'connection-item-missing', connectionId: broken.id },
      { code: 'connection-duplicate', connectionId: repeated.id },
    ]);
  });

  it('moves an item to another zone, keeping it in one zone only', () => {
    const { snapshot, db, app } = project();
    const moved = moveItem(snapshot, db.id, app.id);
    expect(moved.items.filter((item) => item.id === db.id)).toEqual([{ ...db, zoneId: app.id }]);
    expect(() => moveItem(snapshot, db.id, 'gone')).toThrow();
  });

  it('connects two different existing items once per direction', () => {
    const { snapshot, api, db, redis } = project();
    expect(canConnect(snapshot, db.id, redis.id)).toBe(true);
    expect(canConnect(snapshot, db.id, api.id)).toBe(true);
    expect(canConnect(snapshot, api.id, db.id)).toBe(false);
    expect(canConnect(snapshot, api.id, api.id)).toBe(false);
    expect(canConnect(snapshot, api.id, 'gone')).toBe(false);
  });
});

describe('deleting goes to the trash with everything inside (RN 1, 11)', () => {
  it('deleting a zone takes subzones, items, their connections, notes, risks and checklist', () => {
    const { snapshot, data, sub, db, redis, apiToDb, apiToRedis } = project();
    const { snapshot: after, removed } = removeZone(snapshot, data.id);

    expect(removed.zones?.map((z) => z.id)).toEqual([data.id, sub.id]);
    expect(removed.items?.map((i) => i.id)).toEqual([db.id, redis.id]);
    expect(removed.connections?.map((c) => c.id)).toEqual([apiToDb.id, apiToRedis.id]);
    expect(removed.notes).toHaveLength(1);
    expect(removed.risks).toHaveLength(1);
    expect(removed.checklist).toHaveLength(1);

    expect(after.zones.some((z) => z.id === data.id || z.id === sub.id)).toBe(false);
    expect(after.items.map((i) => i.name)).toEqual(['API']);
    expect(after.connections).toEqual([]);
    expect(after.notes).toEqual([]);
  });

  it('keeps flows; their missing steps become gaps (RN 1)', () => {
    const { snapshot, data } = project();
    expect(removeZone(snapshot, data.id).snapshot.flows).toEqual(snapshot.flows);
  });

  it('deleting a zone or a subzone also works for subzones alone', () => {
    const { snapshot, sub, redis } = project();
    const { removed } = removeZone(snapshot, sub.id);
    expect(removed.zones?.map((z) => z.id)).toEqual([sub.id]);
    expect(removed.items?.map((i) => i.id)).toEqual([redis.id]);
  });

  it('deleting an item takes its connections and what hangs on it', () => {
    const { snapshot, redis, apiToRedis } = project();
    const { snapshot: after, removed } = removeItem(snapshot, redis.id);
    expect(removed.items).toEqual([redis]);
    expect(removed.connections).toEqual([apiToRedis]);
    expect(removed.notes).toHaveLength(1);
    expect(after.items).toHaveLength(2);
  });

  it('deleting an item keeps costs and notes of other items', () => {
    const { snapshot, redis, db } = project();
    const cost = {
      id: 'k1',
      projectId: 'p1',
      itemId: db.id,
      name: 'Neon',
      amount: 0,
      currency: 'USD',
      period: 'monthly' as const,
      when: 'now' as const,
    };
    const { snapshot: after, removed } = removeItem({ ...snapshot, costs: [cost] }, redis.id);
    expect(after.costs).toEqual([cost]);
    expect(removed.costs).toEqual([]);
  });

  it('deleting a connection takes only that connection', () => {
    const { snapshot, apiToDb } = project();
    const { snapshot: after, removed } = removeConnection(snapshot, apiToDb.id);
    expect(removed.connections).toEqual([apiToDb]);
    expect(after.connections).toHaveLength(1);
  });

  it('Desfazer restores exactly what left', () => {
    const { snapshot, data } = project();
    const { snapshot: after, removed } = removeZone(snapshot, data.id);
    const { snapshot: back, skipped } = restore(after, removed);
    expect(skipped).toEqual([]);
    const sort = <T extends { id: string }>(rows: T[]) =>
      [...rows].sort((a, b) => a.id.localeCompare(b.id));
    expect(sort(back.zones)).toEqual(sort(snapshot.zones));
    expect(sort(back.items)).toEqual(sort(snapshot.items));
    expect(sort(back.connections)).toEqual(sort(snapshot.connections));
    expect(back.notes).toEqual(snapshot.notes);
    expect(back.risks).toEqual(snapshot.risks);
    expect(back.checklist).toEqual(snapshot.checklist);
  });

  it('restoring twice does not duplicate rows', () => {
    const { snapshot, redis } = project();
    const { snapshot: after, removed } = removeItem(snapshot, redis.id);
    const once = restore(after, removed).snapshot;
    expect(restore(once, removed).snapshot.items).toHaveLength(3);
  });

  it('skips what lost its parent; a subzone whose zone is gone comes back as a zone', () => {
    const { snapshot, data, sub, redis } = project();
    const { snapshot: noRedis, removed: redisPart } = removeItem(snapshot, redis.id);
    const { snapshot: noData } = removeZone(noRedis, data.id);
    const result = restore(noData, redisPart);
    expect(result.skipped).toContain(redis.id);

    const orphanSub = restore(noData, { zones: [sub] }).snapshot.zones.find((z) => z.id === sub.id);
    expect(orphanSub?.parentId).toBeNull();
  });

  it('restores loose rows: flows, variables and rows not tied to an item', () => {
    const { snapshot } = project();
    const part = {
      flows: [{ id: 'f2', projectId: 'p1', name: 'Login', steps: ['x'] }],
      envVars: [
        {
          id: 'e1',
          projectId: 'p1',
          key: 'APP_KEY',
          environment: 'development',
          usedIn: ['back'],
          secret: true as const,
        },
      ],
      notes: [{ id: 'n2', projectId: 'p1', text: 'Geral', private: true, createdAt: 0 }],
      costs: [
        {
          id: 'k1',
          projectId: 'p1',
          itemId: 'gone',
          name: 'Render',
          amount: 7,
          currency: 'USD',
          period: 'monthly' as const,
          when: 'now' as const,
        },
      ],
    };
    const result = restore(snapshot, part);
    expect(result.snapshot.flows).toHaveLength(2);
    expect(result.snapshot.envVars).toHaveLength(1);
    expect(result.snapshot.notes).toHaveLength(2);
    expect(result.skipped).toEqual(['k1']);
  });
});
