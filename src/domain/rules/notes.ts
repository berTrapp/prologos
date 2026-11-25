import type { Note, Risk, Severity } from '../schemas/notes';
import type { ProjectSnapshot } from '../schemas/snapshot';

/** RN 9: notes and risks pinned to items. */

export function addNote(
  snapshot: ProjectSnapshot,
  input: { id: string; itemId: string; text: string; now: number },
): ProjectSnapshot {
  const note: Note = {
    id: input.id,
    projectId: snapshot.project.id,
    itemId: input.itemId,
    text: input.text.trim(),
    private: false,
    createdAt: input.now,
  };
  return { ...snapshot, notes: [...snapshot.notes, note] };
}

export function addRisk(
  snapshot: ProjectSnapshot,
  input: { id: string; itemId: string; text: string; severity: Severity; now: number },
): ProjectSnapshot {
  const risk: Risk = {
    id: input.id,
    projectId: snapshot.project.id,
    itemId: input.itemId,
    text: input.text.trim(),
    severity: input.severity,
    resolved: false,
    createdAt: input.now,
  };
  return { ...snapshot, risks: [...snapshot.risks, risk] };
}

/** RN 9: a resolved risk leaves the map and stays in the history. */
export function setRiskResolved(snapshot: ProjectSnapshot, riskId: string, resolved: boolean) {
  return {
    ...snapshot,
    risks: snapshot.risks.map((risk) => (risk.id === riskId ? { ...risk, resolved } : risk)),
  };
}

export function removeNote(snapshot: ProjectSnapshot, noteId: string) {
  return { ...snapshot, notes: snapshot.notes.filter((note) => note.id !== noteId) };
}

export function restoreNote(snapshot: ProjectSnapshot, note: Note) {
  return snapshot.notes.some((n) => n.id === note.id)
    ? snapshot
    : { ...snapshot, notes: [...snapshot.notes, note] };
}

export function removeRisk(snapshot: ProjectSnapshot, riskId: string) {
  return { ...snapshot, risks: snapshot.risks.filter((risk) => risk.id !== riskId) };
}

export function restoreRisk(snapshot: ProjectSnapshot, risk: Risk) {
  return snapshot.risks.some((r) => r.id === risk.id)
    ? snapshot
    : { ...snapshot, risks: [...snapshot.risks, risk] };
}

export type ItemAnnotations = { notes: Note[]; risks: Risk[] };

const SEVERITY_ORDER: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

/** What the map shows on each item: its notes, and open risks with the most severe first. */
export function annotationsByItem(
  snapshot: Pick<ProjectSnapshot, 'notes' | 'risks'>,
): Map<string, ItemAnnotations> {
  const result = new Map<string, ItemAnnotations>();
  const entry = (itemId: string) => {
    const found = result.get(itemId) ?? { notes: [], risks: [] };
    result.set(itemId, found);
    return found;
  };
  for (const note of snapshot.notes) if (note.itemId) entry(note.itemId).notes.push(note);
  for (const risk of snapshot.risks) {
    if (risk.itemId && !risk.resolved) entry(risk.itemId).risks.push(risk);
  }
  for (const value of result.values()) {
    value.risks.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }
  return result;
}

/** Count on the "Notas e riscos" button: notes plus open risks. */
export function annotationCount(snapshot: Pick<ProjectSnapshot, 'notes' | 'risks'>): number {
  return (
    snapshot.notes.filter((note) => note.itemId).length +
    snapshot.risks.filter((risk) => risk.itemId && !risk.resolved).length
  );
}
