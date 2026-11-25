import type { ChecklistExpectation } from '../schemas/checklist';
import type { Kit } from '../schemas/kit';
import type { Item, Zone } from '../schemas/map';
import type { View } from '../schemas/project';
import type { ProjectSnapshot } from '../schemas/snapshot';

/** RN 5: how a row of "O que falta decidir" stands. */
export type ChecklistStatus = 'decided' | 'pending' | 'notApplicable' | 'missing';

export type ChecklistRow = {
  /** Expectation id, or the item id for a pending item the kit did not expect. */
  key: string;
  expectationId?: string;
  itemId?: string;
  /** Kit item id, to name a missing item and to add it back. */
  kitRef?: string;
  status: ChecklistStatus;
  future: boolean;
  reason?: string;
};

export type ChecklistSection = { zoneId: string; rows: ChecklistRow[]; pending: number };

export type PrepStep = { index: number; done: boolean };

export type ChecklistView = {
  /** "Preparar o ambiente", when a technology is new (RN 15). */
  prep?: { steps: PrepStep[]; done: number };
  sections: ChecklistSection[];
  resolved: number;
  total: number;
  /** Rounded down, so 100% only when everything is resolved. */
  percent: number;
};

const RESOLVED: ReadonlySet<ChecklistStatus> = new Set(['decided', 'notApplicable']);
export const isResolved = (status: ChecklistStatus) => RESOLVED.has(status);

/** RN 15: the section exists when the kit has a trail and some technology is new. */
export function hasPrepTrail(snapshot: Pick<ProjectSnapshot, 'items'>, kit: Kit | undefined) {
  return Boolean(kit && kit.prepTrail.length > 0 && snapshot.items.some((item) => item.newForYou));
}

export function prepComplete(snapshot: ProjectSnapshot, kit: Kit | undefined): boolean {
  if (!kit || !hasPrepTrail(snapshot, kit)) return true;
  const done = new Set(snapshot.project.prepDone ?? []);
  return kit.prepTrail.every((_, index) => done.has(index));
}

/** Expectations marked "Não se aplica", by the kit item they expect. */
export function notApplicableRefs(checklist: readonly ChecklistExpectation[]) {
  return new Map(
    checklist.flatMap((row) =>
      row.notApplicable ? [[row.itemRef, row.notApplicable.reason]] : [],
    ),
  );
}

/** The item a map item is marked "Não se aplica" by, if any (RN 5). */
export function notApplicableReason(
  item: Pick<Item, 'kitRef'>,
  checklist: readonly ChecklistExpectation[],
): string | undefined {
  return item.kitRef ? notApplicableRefs(checklist).get(item.kitRef) : undefined;
}

function topZone(zones: ReadonlyMap<string, Zone>, zoneId: string): string {
  let zone = zones.get(zoneId);
  while (zone?.parentId) zone = zones.get(zone.parentId);
  return zone?.id ?? zoneId;
}

/**
 * RN 5, 15: what is left to decide, in order, with the share already resolved in the
 * active view.
 */
export function checklistView(
  snapshot: ProjectSnapshot,
  kit: Kit | undefined,
  view: View,
): ChecklistView {
  const zones = new Map(snapshot.zones.map((zone) => [zone.id, zone]));
  const byRef = new Map<string, Item>();
  for (const item of snapshot.items)
    if (item.kitRef && !byRef.has(item.kitRef)) byRef.set(item.kitRef, item);
  const kitWhen = new Map(kit?.items.map((source) => [source.id, source.when]));
  const shows = (future: boolean) => view === 'complete' || !future;

  const rows = new Map<string, ChecklistRow[]>();
  const push = (zoneId: string, row: ChecklistRow) => {
    const top = topZone(zones, zoneId);
    rows.set(top, [...(rows.get(top) ?? []), row]);
  };

  const expected = new Set<string>();
  for (const expectation of [...snapshot.checklist].sort((a, b) => a.order - b.order)) {
    const item = byRef.get(expectation.itemRef);
    const future = item ? item.when === 'later' : kitWhen.get(expectation.itemRef) === 'later';
    if (item) expected.add(item.id);
    if (!shows(future)) continue;
    const status: ChecklistStatus = expectation.notApplicable
      ? 'notApplicable'
      : item
        ? item.state
        : 'missing';
    const row: ChecklistRow = {
      key: expectation.id,
      expectationId: expectation.id,
      kitRef: expectation.itemRef,
      status,
      future,
    };
    if (item) row.itemId = item.id;
    if (expectation.notApplicable) row.reason = expectation.notApplicable.reason;
    push(item?.zoneId ?? expectation.zoneId, row);
  }

  // Pending items the kit did not expect still have to be decided (RN 5).
  for (const item of [...snapshot.items].sort((a, b) => a.order - b.order)) {
    if (expected.has(item.id) || item.state !== 'pending') continue;
    const future = item.when === 'later';
    if (!shows(future)) continue;
    const row: ChecklistRow = { key: item.id, itemId: item.id, status: 'pending', future };
    if (item.kitRef) row.kitRef = item.kitRef;
    push(item.zoneId, row);
  }

  const priority = (row: ChecklistRow) => {
    const index = row.kitRef ? (kit?.runsOn.indexOf(row.kitRef) ?? -1) : -1;
    return index >= 0 ? index : Number.POSITIVE_INFINITY;
  };
  const zoneOrder = (zoneId: string) => zones.get(zoneId)?.order ?? 0;

  const sections: ChecklistSection[] = [...rows.entries()].map(([zoneId, list]) => {
    const open = list.filter((row) => !isResolved(row.status));
    const done = list.filter((row) => isResolved(row.status));
    return { zoneId, rows: [...open, ...done], pending: open.length };
  });
  sections.sort((a, b) => {
    if (a.pending > 0 !== b.pending > 0) return a.pending > 0 ? -1 : 1;
    const pa = Math.min(...a.rows.filter((r) => !isResolved(r.status)).map(priority));
    const pb = Math.min(...b.rows.filter((r) => !isResolved(r.status)).map(priority));
    if (pa !== pb) return pa - pb;
    return zoneOrder(a.zoneId) - zoneOrder(b.zoneId);
  });

  const result: ChecklistView = { sections, resolved: 0, total: 0, percent: 100 };
  if (kit && hasPrepTrail(snapshot, kit)) {
    const done = new Set(snapshot.project.prepDone ?? []);
    const steps = kit.prepTrail.map((_, index) => ({ index, done: done.has(index) }));
    result.prep = { steps, done: steps.filter((step) => step.done).length };
  }

  const all = sections.flatMap((section) => section.rows);
  result.total = all.length + (result.prep?.steps.length ?? 0);
  result.resolved = all.filter((row) => isResolved(row.status)).length + (result.prep?.done ?? 0);
  result.percent = result.total === 0 ? 100 : Math.floor((result.resolved / result.total) * 100);
  return result;
}

/** RN 5: "Não se aplica" needs a short reason; clearing it brings the item back. */
export function setNotApplicable(
  snapshot: ProjectSnapshot,
  expectationId: string,
  reason: string | undefined,
): ProjectSnapshot {
  return {
    ...snapshot,
    checklist: snapshot.checklist.map((row) => {
      if (row.id !== expectationId) return row;
      const next = { ...row };
      const text = reason?.trim();
      if (text) next.notApplicable = { reason: text.slice(0, 140) };
      else delete next.notApplicable;
      return next;
    }),
  };
}

/** RN 15: marks a step of "Preparar o ambiente" as done or not. */
export function setPrepStep(
  snapshot: ProjectSnapshot,
  index: number,
  done: boolean,
): ProjectSnapshot {
  const current = new Set(snapshot.project.prepDone ?? []);
  if (done) current.add(index);
  else current.delete(index);
  return {
    ...snapshot,
    project: { ...snapshot.project, prepDone: [...current].sort((a, b) => a - b) },
  };
}
