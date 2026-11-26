import type { Kit } from '../schemas/kit';
import type { Item } from '../schemas/map';
import type { ProjectSnapshot } from '../schemas/snapshot';
import { hasPrepTrail, notApplicableRefs } from './checklist';
import { NO_KIT_RUNS_ON } from './guided-start';

/** How an essential decision tied to a map item stands. */
export type DecisionStatus = 'decided' | 'pending' | 'notApplicable' | 'missing';

export type Essential =
  | { key: 'stack'; done: boolean; item?: Item }
  | { key: 'prep'; done: boolean; doneSteps: number; total: number }
  | { key: 'runsOn' | 'auth'; done: boolean; ref: string; status: DecisionStatus; item?: Item }
  | { key: 'variables'; done: boolean; count: number; undocumented: number };

export type ReadyView = {
  essentials: Essential[];
  /** Essentials still open. */
  missing: number;
  /** RN 16: "Pronto para codar" once every essential decision is closed. */
  ready: boolean;
};

const resolved = (status: DecisionStatus) => status === 'decided' || status === 'notApplicable';

/**
 * RN 16: the essential decisions before the first commit, in this order: stack chosen,
 * environment prepared (when there is a trail), each "Onde roda" item, authentication
 * (when the kit has it) and the variables documented.
 */
export function readyView(snapshot: ProjectSnapshot, kit: Kit | undefined): ReadyView {
  const skipped = notApplicableRefs(snapshot.checklist);
  const byRef = (ref: string) => snapshot.items.find((item) => item.kitRef === ref);
  const decision = (ref: string) => {
    const item = byRef(ref);
    const status: DecisionStatus = skipped.has(ref) ? 'notApplicable' : (item?.state ?? 'missing');
    return { ref, status, done: resolved(status), ...(item ? { item } : {}) };
  };

  const essentials: Essential[] = [];
  const stackItem = kit ? undefined : byRef('stack');
  essentials.push({
    key: 'stack',
    done: Boolean(kit) || stackItem?.state === 'decided',
    ...(stackItem ? { item: stackItem } : {}),
  });

  if (kit && hasPrepTrail(snapshot, kit)) {
    const done = new Set(snapshot.project.prepDone ?? []);
    const doneSteps = kit.prepTrail.filter((_, index) => done.has(index)).length;
    essentials.push({
      key: 'prep',
      done: doneSteps === kit.prepTrail.length,
      doneSteps,
      total: kit.prepTrail.length,
    });
  }

  for (const ref of kit?.runsOn ?? NO_KIT_RUNS_ON)
    essentials.push({ key: 'runsOn', ...decision(ref) });

  const auth = kit?.items.find((item) => item.concept === 'auth');
  if (auth) essentials.push({ key: 'auth', ...decision(auth.id) });

  const keys = new Map<string, boolean>();
  for (const envVar of snapshot.envVars)
    keys.set(envVar.key, (keys.get(envVar.key) ?? false) || Boolean(envVar.description?.trim()));
  const undocumented = [...keys.values()].filter((documented) => !documented).length;
  essentials.push({
    key: 'variables',
    done: keys.size > 0 && undocumented === 0,
    count: keys.size,
    undocumented,
  });

  const missing = essentials.filter((essential) => !essential.done).length;
  return { essentials, missing, ready: missing === 0 };
}
