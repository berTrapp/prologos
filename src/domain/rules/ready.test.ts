import { describe, expect, it } from 'vitest';
import { findKit } from '@/content/kits';
import { kitProject } from '../fixtures';
import type { Kit } from '../schemas/kit';
import type { ProjectSnapshot } from '../schemas/snapshot';
import { setNotApplicable, setPrepStep, prepSteps } from './checklist';
import { readyView } from './ready';

const kit = (id: string): Kit => {
  const found = findKit(id);
  if (!found) throw new Error(id);
  return found;
};
const keys = (snapshot: ProjectSnapshot, k: Kit | undefined) =>
  readyView(snapshot, k).essentials.map((e) => (e.key === 'runsOn' ? `runsOn:${e.ref}` : e.key));

describe('readyView (RN 16)', () => {
  it('lists the essential decisions of a kit with a trail', () => {
    const django = kit('django');
    const snapshot = kitProject('django', { knownStack: 'none' });
    expect(keys(snapshot, django)).toEqual([
      'stack',
      'prep',
      'runsOn:database',
      'runsOn:hosting',
      'auth',
      'variables',
    ]);
    const view = readyView(snapshot, django);
    expect(view.essentials[0]).toMatchObject({ key: 'stack', done: true });
    expect(view.essentials[1]).toMatchObject({ key: 'prep', done: false, doneSteps: 0, total: 5 });
    expect(view.essentials[2]).toMatchObject({ status: 'pending', done: false });
    expect(view.essentials[4]).toMatchObject({ key: 'auth', ref: 'auth', status: 'decided' });
    expect(view.essentials[5]).toMatchObject({ key: 'variables', count: 4, done: true });
    expect(view).toMatchObject({ missing: 3, ready: false });
  });

  it('is ready once the trail is done and the runsOn items are decided or not applicable', () => {
    const django = kit('django');
    let snapshot = kitProject('django', { knownStack: 'none', runsOn: { database: 0 } });
    // Every step, the database setup included (RN 15).
    for (const step of prepSteps(snapshot, django)) snapshot = setPrepStep(snapshot, step.id, true);
    const hosting = snapshot.checklist.find((row) => row.itemRef === 'hosting');
    if (!hosting) throw new Error('hosting');
    snapshot = setNotApplicable(snapshot, hosting.id, 'Só local');
    const view = readyView(snapshot, django);
    expect(view.essentials.find((e) => e.key === 'runsOn')).toMatchObject({ status: 'decided' });
    expect(view.essentials.at(3)).toMatchObject({ status: 'notApplicable', done: true });
    expect(view.ready).toBe(true);
  });

  it('skips the trail when nothing is new and auth when the kit has none', () => {
    const snapshot = kitProject('flutter', {
      knownStack: 'none',
      experience: { dart: 'known', flutter: 'known', riverpod: 'known' },
    });
    expect(keys(snapshot, kit('flutter'))).toEqual([
      'stack',
      'runsOn:backend',
      'runsOn:stores',
      'variables',
    ]);
  });

  it('asks for variables with a description, and at least one', () => {
    const django = kit('django');
    const snapshot = kitProject('django');
    const first = snapshot.envVars[0];
    if (!first) throw new Error('vars');
    const undocumented = {
      ...snapshot,
      envVars: snapshot.envVars.map((v) => (v.key === first.key ? { ...v, description: ' ' } : v)),
    };
    expect(readyView(undocumented, django).essentials.at(-1)).toMatchObject({
      done: false,
      undocumented: 1,
    });
    expect(readyView({ ...snapshot, envVars: [] }, django).essentials.at(-1)).toMatchObject({
      done: false,
      count: 0,
    });
  });

  it('reports an essential item removed from the map as missing', () => {
    const django = kit('django');
    const snapshot = kitProject('django');
    const without = { ...snapshot, items: snapshot.items.filter((i) => i.kitRef !== 'auth') };
    expect(readyView(without, django).essentials.find((e) => e.key === 'auth')).toMatchObject({
      status: 'missing',
      done: false,
    });
  });

  it('without a kit, asks for the stack item, the database and the hosting', () => {
    const snapshot = kitProject(undefined);
    expect(keys(snapshot, undefined)).toEqual([
      'stack',
      'runsOn:database',
      'runsOn:hosting',
      'variables',
    ]);
    const decided = {
      ...snapshot,
      items: snapshot.items.map((i) =>
        i.kitRef === 'stack' ? { ...i, state: 'decided' as const } : i,
      ),
    };
    expect(readyView(snapshot, undefined).essentials[0]?.done).toBe(false);
    expect(readyView(decided, undefined).essentials[0]?.done).toBe(true);
  });
});
