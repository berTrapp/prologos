import { describe, expect, it } from 'vitest';
import { makeConnection, makeItem } from '../fixtures';
import { flowSegments, isFuture, mapItemStatus, visibleMap } from './view';

const api = makeItem('z', { name: 'API' });
const db = makeItem('z', { name: 'PostgreSQL', state: 'pending' });
const queue = makeItem('z', { name: 'Filas', when: 'later' });
const apiToDb = makeConnection(api.id, db.id);
const apiToQueue = makeConnection(api.id, queue.id);
const snapshot = { items: [api, db, queue], connections: [apiToDb, apiToQueue] };

describe('Hoje / Completo (RN 2)', () => {
  it('knows current and future items', () => {
    expect(isFuture(queue)).toBe(true);
    expect(isFuture(api)).toBe(false);
  });

  it('maps the card status: future wins over decided or pending', () => {
    expect(mapItemStatus(api)).toBe('decided');
    expect(mapItemStatus(db)).toBe('pending');
    expect(mapItemStatus({ when: 'later', state: 'pending' })).toBe('future');
  });

  it('Hoje hides future items and the connections that touch them', () => {
    const today = visibleMap(snapshot, 'today');
    expect(today.items.map((i) => i.name)).toEqual(['API', 'PostgreSQL']);
    expect(today.connections).toEqual([apiToDb]);
  });

  it('Completo shows everything', () => {
    const complete = visibleMap(snapshot, 'complete');
    expect(complete.items).toHaveLength(3);
    expect(complete.connections).toHaveLength(2);
  });
});

describe('flow segments (RN 1, 2)', () => {
  const flow = { steps: [apiToDb.id, apiToQueue.id, 'in-trash'] };

  it('in Hoje, the stretch through a future item is dashed and a missing step is a gap', () => {
    expect(flowSegments(flow, snapshot, 'today').map((s) => s.look)).toEqual([
      'solid',
      'dashed',
      'gap',
    ]);
  });

  it('in Completo, the future stretch is solid', () => {
    expect(flowSegments(flow, snapshot, 'complete').map((s) => s.look)).toEqual([
      'solid',
      'solid',
      'gap',
    ]);
  });

  it('a connection whose item is gone is a gap', () => {
    const lonely = { items: [api], connections: [apiToDb] };
    expect(flowSegments({ steps: [apiToDb.id] }, lonely, 'complete')).toEqual([
      { connectionId: apiToDb.id, look: 'gap' },
    ]);
  });
});
