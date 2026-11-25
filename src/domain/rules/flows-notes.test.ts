import { describe, expect, it } from 'vitest';
import { makeConnection, makeItem, makeSnapshot, zoneByKey } from '../fixtures';
import type { ProjectSnapshot } from '../schemas/snapshot';
import { addFlow, canAppendStep, removeFlow, renameFlow, restoreFlow } from './flows';
import {
  addNote,
  addRisk,
  annotationCount,
  annotationsByItem,
  removeNote,
  removeRisk,
  restoreNote,
  restoreRisk,
  setRiskResolved,
} from './notes';

function base() {
  const snapshot = makeSnapshot();
  const app = zoneByKey(snapshot, 'app');
  const [a, b, c] = [makeItem(app.id), makeItem(app.id), makeItem(app.id)];
  const ab = makeConnection(a.id, b.id);
  const bc = makeConnection(b.id, c.id);
  const ca = makeConnection(c.id, a.id);
  return {
    snapshot: { ...snapshot, items: [a, b, c], connections: [ab, bc, ca] } as ProjectSnapshot,
    a,
    ab,
    bc,
    ca,
  };
}

describe('flows (RN 1)', () => {
  it('adds, renames, removes and restores a flow', () => {
    const { snapshot, ab, bc } = base();
    const added = addFlow(snapshot, { id: 'f', name: ' Salvar ', steps: [ab.id, bc.id] });
    expect(added.flows[0]).toMatchObject({ id: 'f', name: 'Salvar', steps: [ab.id, bc.id] });
    expect(renameFlow(added, 'f', ' Publicar ').flows[0]?.name).toBe('Publicar');
    expect(renameFlow(added, 'f', '  ').flows[0]?.name).toBe('Salvar');
    const { removed, snapshot: without } = removeFlow(added, 'f');
    expect(without.flows).toEqual([]);
    if (!removed) throw new Error('flow');
    expect(restoreFlow(without, removed, 0).flows).toEqual(added.flows);
    expect(restoreFlow(added, removed, 0)).toBe(added);
  });

  it('needs at least one step', () => {
    expect(() => addFlow(base().snapshot, { id: 'f', name: 'Vazio', steps: [] })).toThrow();
  });

  it('appends only a connection that starts where the last one ended', () => {
    const { snapshot, ab, bc, ca } = base();
    expect(canAppendStep(snapshot, [], ab.id)).toBe(true);
    expect(canAppendStep(snapshot, [ab.id], bc.id)).toBe(true);
    expect(canAppendStep(snapshot, [ab.id], ca.id)).toBe(false);
    expect(canAppendStep(snapshot, [ab.id], ab.id)).toBe(false);
    expect(canAppendStep(snapshot, [ab.id], 'gone')).toBe(false);
    expect(canAppendStep(snapshot, ['gone'], bc.id)).toBe(false);
  });
});

describe('notes and risks (RN 9)', () => {
  it('pins notes and risks to items, most severe risk first', () => {
    const { snapshot, a } = base();
    let next = addNote(snapshot, { id: 'n', itemId: a.id, text: ' Usar UUID ', now: 1 });
    next = addRisk(next, { id: 'r1', itemId: a.id, text: 'Lento', severity: 'low', now: 2 });
    next = addRisk(next, { id: 'r2', itemId: a.id, text: 'Perde dados', severity: 'high', now: 3 });
    const notes = annotationsByItem(next).get(a.id);
    expect(notes?.notes.map((n) => n.text)).toEqual(['Usar UUID']);
    expect(notes?.risks.map((r) => r.id)).toEqual(['r2', 'r1']);
    expect(annotationCount(next)).toBe(3);
  });

  it('takes a resolved risk off the map', () => {
    const { snapshot, a } = base();
    const withRisk = addRisk(snapshot, {
      id: 'r',
      itemId: a.id,
      text: 'X',
      severity: 'medium',
      now: 1,
    });
    const resolved = setRiskResolved(withRisk, 'r', true);
    expect(annotationsByItem(resolved).get(a.id)?.risks ?? []).toEqual([]);
    expect(annotationCount(resolved)).toBe(0);
    expect(setRiskResolved(resolved, 'r', false).risks[0]?.resolved).toBe(false);
  });

  it('removes and restores notes and risks', () => {
    const { snapshot, a } = base();
    const withNote = addNote(snapshot, { id: 'n', itemId: a.id, text: 'X', now: 1 });
    const note = withNote.notes[0];
    if (!note) throw new Error('note');
    const noNote = removeNote(withNote, 'n');
    expect(noNote.notes).toEqual([]);
    expect(restoreNote(noNote, note).notes).toEqual([note]);
    expect(restoreNote(withNote, note)).toBe(withNote);

    const withRisk = addRisk(snapshot, {
      id: 'r',
      itemId: a.id,
      text: 'X',
      severity: 'low',
      now: 1,
    });
    const risk = withRisk.risks[0];
    if (!risk) throw new Error('risk');
    const noRisk = removeRisk(withRisk, 'r');
    expect(noRisk.risks).toEqual([]);
    expect(restoreRisk(noRisk, risk).risks).toEqual([risk]);
    expect(restoreRisk(withRisk, risk)).toBe(withRisk);
  });

  it('ignores notes and risks that are not on an item', () => {
    const { snapshot } = base();
    const loose = {
      ...snapshot,
      notes: [{ id: 'n', projectId: 'p1', text: 'Geral', private: false, createdAt: 0 }],
      risks: [
        {
          id: 'r',
          projectId: 'p1',
          text: 'Geral',
          severity: 'low' as const,
          resolved: false,
          createdAt: 0,
        },
      ],
    };
    expect(annotationsByItem(loose).size).toBe(0);
    expect(annotationCount(loose)).toBe(0);
  });
});
