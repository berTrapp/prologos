import { describe, expect, it } from 'vitest';
import { ConnectionSchema, ZoneSchema } from './map';

const zone = {
  id: 'z',
  projectId: 'p1',
  parentId: null,
  color: 'data',
  order: 0,
  collapsed: false,
};

describe('ZoneSchema (RN 1)', () => {
  it('a default zone needs only its key; an added zone needs a name', () => {
    expect(ZoneSchema.safeParse({ ...zone, key: 'data' }).success).toBe(true);
    expect(ZoneSchema.safeParse({ ...zone, name: 'Pagamentos' }).success).toBe(true);
    expect(ZoneSchema.safeParse(zone).success).toBe(false);
  });

  it('the color is always one of the zone colors', () => {
    expect(ZoneSchema.safeParse({ ...zone, name: 'X', color: 'pink' }).success).toBe(false);
  });
});

describe('ConnectionSchema (RN 1)', () => {
  it('links two different items', () => {
    expect(
      ConnectionSchema.safeParse({ id: 'c', projectId: 'p1', from: 'a', to: 'b' }).success,
    ).toBe(true);
    expect(
      ConnectionSchema.safeParse({ id: 'c', projectId: 'p1', from: 'a', to: 'a' }).success,
    ).toBe(false);
  });
});
