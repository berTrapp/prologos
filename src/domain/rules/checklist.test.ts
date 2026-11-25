import { describe, expect, it } from 'vitest';
import { KITS, findKit } from '@/content/kits';
import { testId } from '../fixtures';
import type { Kit } from '../schemas/kit';
import type { ProjectSnapshot } from '../schemas/snapshot';
import {
  checklistView,
  hasPrepTrail,
  isResolved,
  notApplicableReason,
  prepComplete,
  setNotApplicable,
  setPrepStep,
} from './checklist';
import { updateItem } from './edit';
import { EMPTY_ANSWERS, buildProjectFromAnswers, firstStep, nextSteps } from './guided-start';
import { removeItem } from './map';

const kit = (id: string): Kit => {
  const found = findKit(id);
  if (!found) throw new Error(id);
  return found;
};

const project = (knownStack: 'django' | 'none' = 'none', kitId: string | null = 'django') =>
  buildProjectFromAnswers(
    { ...EMPTY_ANSWERS, name: 'Agenda', knownStack },
    findKit(kitId ?? undefined),
    {
      id: 'p',
      now: 0,
      createId: testId,
      language: 'pt-BR',
      unnamed: 'Projeto sem nome',
      noKitNames: { stack: 'Stack', database: 'Banco de dados', hosting: 'Hospedagem' },
      kits: KITS,
    },
  );

const byRef = (snapshot: ProjectSnapshot, ref: string) => {
  const item = snapshot.items.find((i) => i.kitRef === ref);
  if (!item) throw new Error(ref);
  return item;
};
const expectation = (snapshot: ProjectSnapshot, ref: string) => {
  const row = snapshot.checklist.find((c) => c.itemRef === ref);
  if (!row) throw new Error(ref);
  return row;
};
const allRows = (view: ReturnType<typeof checklistView>) => view.sections.flatMap((s) => s.rows);

describe('checklistView (RN 5)', () => {
  it('lists every expected item of the kit, by zone', () => {
    const snapshot = project('django');
    const view = checklistView(snapshot, kit('django'), 'complete');
    expect(allRows(view).map((r) => r.kitRef)).toEqual(
      expect.arrayContaining(['database', 'hosting', 'kanban', 'https']),
    );
    expect(view.prep).toBeUndefined();
  });

  it('puts zones with pending items first, database and hosting ahead, resolved last', () => {
    const snapshot = project('django');
    const zones = new Map(snapshot.zones.map((z) => [z.id, z.key]));
    const view = checklistView(snapshot, kit('django'), 'today');
    const order = view.sections.map((s) => zones.get(s.zoneId));
    expect(order.slice(0, 3)).toEqual(['data', 'infra', 'security']);
    const firstResolved = view.sections.findIndex((s) => s.pending === 0);
    expect(view.sections.slice(firstResolved).every((s) => s.pending === 0)).toBe(true);
    const data = view.sections[0];
    expect(data?.rows[0]?.status).toBe('pending');
    expect(data?.rows.at(-1)?.status).toBe('decided');
  });

  it('follows the active view: future items only count in Completo', () => {
    const snapshot = project('django');
    const today = checklistView(snapshot, kit('django'), 'today');
    const complete = checklistView(snapshot, kit('django'), 'complete');
    expect(allRows(today).some((r) => r.kitRef === 'error-tracking')).toBe(false);
    const future = allRows(complete).find((r) => r.kitRef === 'error-tracking');
    expect(future).toMatchObject({ future: true, status: 'pending' });
    expect(complete.total).toBe(today.total + 1);
  });

  it('counts decided and "Não se aplica" as resolved, and reaches 100% only then', () => {
    let snapshot = project('django');
    const view = checklistView(snapshot, kit('django'), 'today');
    expect(view.percent).toBeLessThan(100);
    for (const row of allRows(view).filter((r) => r.status === 'pending')) {
      snapshot =
        row.kitRef === 'backup'
          ? setNotApplicable(snapshot, row.expectationId ?? '', 'Sem dados')
          : updateItem(snapshot, row.itemId ?? '', { state: 'decided' });
    }
    const done = checklistView(snapshot, kit('django'), 'today');
    expect(done.resolved).toBe(done.total);
    expect(done.percent).toBe(100);
    expect(allRows(done).find((r) => r.kitRef === 'backup')).toMatchObject({
      status: 'notApplicable',
      reason: 'Sem dados',
    });
  });

  it('never rounds up to 100%', () => {
    const snapshot = project('django');
    const view = checklistView(snapshot, kit('django'), 'today');
    expect(view.percent).toBe(Math.floor((view.resolved / view.total) * 100));
  });

  it('shows an expected item that left the map as missing', () => {
    const snapshot = project('django');
    const { snapshot: without } = removeItem(snapshot, byRef(snapshot, 'https').id);
    const row = allRows(checklistView(without, kit('django'), 'today')).find(
      (r) => r.kitRef === 'https',
    );
    expect(row).toMatchObject({ status: 'missing' });
    expect(row?.itemId).toBeUndefined();
    expect(isResolved('missing')).toBe(false);
  });

  it('lists pending items the kit did not expect, and a project with no kit', () => {
    const snapshot = project('none', null);
    const view = checklistView(snapshot, undefined, 'today');
    expect(allRows(view).map((r) => r.status)).toEqual(['pending', 'pending', 'pending']);
    expect(view.total).toBe(3);
    expect(view.percent).toBe(0);
  });

  it('puts subzone items under their top zone', () => {
    const snapshot = project('django');
    const data = snapshot.zones.find((z) => z.key === 'data');
    if (!data) throw new Error('data');
    const sub = { ...data, id: 'sub', parentId: data.id, key: undefined, name: 'Cache', order: 0 };
    const moved = {
      ...snapshot,
      zones: [...snapshot.zones, sub],
      items: snapshot.items.map((i) => (i.kitRef === 'database' ? { ...i, zoneId: 'sub' } : i)),
    };
    const section = checklistView(moved, kit('django'), 'today').sections.find((s) =>
      s.rows.some((r) => r.kitRef === 'database'),
    );
    expect(section?.zoneId).toBe(data.id);
  });

  it('gives an empty project 100%', () => {
    const snapshot = { ...project('none', null), items: [] };
    expect(checklistView(snapshot, undefined, 'today')).toMatchObject({ total: 0, percent: 100 });
  });
});

describe('"Preparar o ambiente" (RN 15)', () => {
  it('appears with a new technology and counts its steps', () => {
    const snapshot = project('none');
    expect(hasPrepTrail(snapshot, kit('django'))).toBe(true);
    const view = checklistView(snapshot, kit('django'), 'today');
    expect(view.prep?.steps).toHaveLength(kit('django').prepTrail.length);
    expect(view.prep?.done).toBe(0);
    const withStep = setPrepStep(snapshot, 0, true);
    const after = checklistView(withStep, kit('django'), 'today');
    expect(after.prep?.done).toBe(1);
    expect(after.resolved).toBe(view.resolved + 1);
    expect(setPrepStep(withStep, 0, false).project.prepDone).toEqual([]);
  });

  it('leaves the next steps once every step is done', () => {
    let snapshot = project('none');
    expect(firstStep(snapshot, kit('django'))).toEqual({ kind: 'prepare-env' });
    kit('django').prepTrail.forEach((_, index) => {
      snapshot = setPrepStep(snapshot, index, true);
    });
    expect(prepComplete(snapshot, kit('django'))).toBe(true);
    expect(firstStep(snapshot, kit('django')).kind).toBe('decide');
  });

  it('is complete when there is no trail to follow', () => {
    expect(prepComplete(project('django'), kit('django'))).toBe(true);
    expect(prepComplete(project('django'), undefined)).toBe(true);
  });
});

describe('"Não se aplica" (RN 5)', () => {
  it('marks and clears with a short reason, and skips the item in the next steps', () => {
    const snapshot = project('django');
    const row = expectation(snapshot, 'database');
    const marked = setNotApplicable(snapshot, row.id, '  Só arquivos estáticos  ');
    expect(expectation(marked, 'database').notApplicable).toEqual({
      reason: 'Só arquivos estáticos',
    });
    expect(notApplicableReason(byRef(marked, 'database'), marked.checklist)).toBe(
      'Só arquivos estáticos',
    );
    expect(
      nextSteps(marked, kit('django')).map((s) => s.kind === 'decide' && s.itemId),
    ).not.toContain(byRef(marked, 'database').id);
    const cleared = setNotApplicable(marked, row.id, undefined);
    expect(expectation(cleared, 'database').notApplicable).toBeUndefined();
    expect(setNotApplicable(marked, row.id, '   ').checklist).toEqual(cleared.checklist);
  });

  it('keeps the reason within 140 characters, and ignores items without kit', () => {
    const snapshot = project('django');
    const marked = setNotApplicable(snapshot, expectation(snapshot, 'backup').id, 'x'.repeat(200));
    expect(expectation(marked, 'backup').notApplicable?.reason).toHaveLength(140);
    expect(notApplicableReason({}, marked.checklist)).toBeUndefined();
  });
});
