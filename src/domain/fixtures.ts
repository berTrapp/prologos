import type { Connection, Item, Zone } from './schemas/map';
import type { ProjectSnapshot } from './schemas/snapshot';
import { createProjectSnapshot } from './rules/project';

/** Test helpers: small projects built from the real factory. */
let counter = 0;
export const testId = () => `id-${++counter}`;

export function makeSnapshot(): ProjectSnapshot {
  return createProjectSnapshot({
    id: 'p1',
    name: 'Agenda de aulas',
    type: 'web',
    now: 0,
    createId: testId,
  });
}

export function zoneByKey(snapshot: ProjectSnapshot, key: Zone['key']): Zone {
  const zone = snapshot.zones.find((z) => z.key === key);
  if (!zone) throw new Error(`zone ${key}`);
  return zone;
}

export function makeItem(zoneId: string, patch: Partial<Item> = {}): Item {
  return {
    id: testId(),
    projectId: 'p1',
    zoneId,
    name: 'Item',
    state: 'decided',
    when: 'now',
    newForYou: false,
    order: 0,
    ...patch,
  };
}

export function makeConnection(
  from: string,
  to: string,
  patch: Partial<Connection> = {},
): Connection {
  return { id: testId(), projectId: 'p1', from, to, ...patch };
}

export function makeSubzone(parentId: string, patch: Partial<Zone> = {}): Zone {
  return {
    id: testId(),
    projectId: 'p1',
    parentId,
    name: 'Subzona',
    color: 'data',
    order: 0,
    collapsed: false,
    ...patch,
  };
}
