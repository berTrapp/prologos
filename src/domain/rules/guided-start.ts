import type { Language } from '@/i18n/languages';
import type { ChecklistExpectation } from '../schemas/checklist';
import type { Kit } from '../schemas/kit';
import type { Connection, Flow, Item } from '../schemas/map';
import type { KnownStack, ProjectType } from '../schemas/project';
import type { ProjectSnapshot } from '../schemas/snapshot';
import type { ZoneId } from '../zones';
import { defaultExperience, kitText, type Experience } from './kit';
import { createProjectSnapshot } from './project';

/** What the five steps of the guided start collect (RN 13). Every field can stay empty. */
export type GuidedAnswers = {
  name: string;
  goal: string;
  type: ProjectType;
  /** undefined: not answered; 'none': knows none of the listed stacks. */
  knownStack?: KnownStack | 'none';
  /** undefined: "Ainda não sei" or skipped. */
  kitId?: string;
  /** Technology id → level; technologies left out use the default. */
  experience: Record<string, Experience>;
  /** "Onde roda": kit item id → index of the chosen option; missing means "Ainda não sei". */
  runsOn: Record<string, number>;
};

export const EMPTY_ANSWERS: GuidedAnswers = {
  name: '',
  goal: '',
  type: 'unknown',
  experience: {},
  runsOn: {},
};

/** Pending items of a project with no kit yet (RN 13), with the zone each one lives in. */
export const NO_KIT_ITEMS = [
  { ref: 'stack', zone: 'app' },
  { ref: 'database', zone: 'data' },
  { ref: 'hosting', zone: 'infra' },
] as const satisfies readonly { ref: string; zone: ZoneId }[];
export type NoKitItemRef = (typeof NO_KIT_ITEMS)[number]['ref'];

/** "Onde roda" of a project with no kit: database, then hosting. */
const NO_KIT_RUNS_ON = ['database', 'hosting'];

type BuildContext = {
  id: string;
  now: number;
  createId: () => string;
  language: Language;
  /** Name used when the person skipped it. */
  unnamed: string;
  /** Names of the pending items of a project with no kit, in the current language. */
  noKitNames: Record<NoKitItemRef, string>;
  /** Every kit, for the experience defaults. */
  kits: readonly Kit[];
};

/** RN 15: the person's answers over the defaults that come from the stack they know. */
export function effectiveExperience(
  answers: Pick<GuidedAnswers, 'experience' | 'knownStack'>,
  kit: Kit,
  kits: readonly Kit[],
): Record<string, Experience> {
  const known = answers.knownStack === 'none' ? undefined : answers.knownStack;
  const defaults = defaultExperience(kit, kits, known);
  const answered = Object.entries(answers.experience).filter(([tech]) => tech in defaults);
  return { ...defaults, ...Object.fromEntries(answered) };
}

/**
 * Builds the project the guided start creates (RN 13, 14, 15): the nine zones, the kit's
 * decided and pending items, "Novo para você", the "Onde roda" choices, connections,
 * the suggested flow and the checklist expectations.
 */
export function buildProjectFromAnswers(
  answers: GuidedAnswers,
  kit: Kit | undefined,
  context: BuildContext,
): ProjectSnapshot {
  const { id, now, createId, language } = context;
  const snapshot = createProjectSnapshot({
    id,
    name: answers.name.trim() || context.unnamed,
    goal: answers.goal.trim() || undefined,
    type: answers.type,
    kitId: kit?.id,
    now,
    createId,
  });
  if (answers.knownStack && answers.knownStack !== 'none') {
    snapshot.project.knownStack = answers.knownStack;
  }
  const zoneIds = new Map(snapshot.zones.map((zone) => [zone.key, zone.id]));
  const zoneOf = (key: ZoneId) => {
    const zoneId = zoneIds.get(key);
    if (!zoneId) throw new Error(`Missing default zone ${key}`);
    return zoneId;
  };
  const orderIn = new Map<string, number>();
  const nextOrder = (zoneId: string) => {
    const order = orderIn.get(zoneId) ?? 0;
    orderIn.set(zoneId, order + 1);
    return order;
  };

  if (!kit) {
    snapshot.items = NO_KIT_ITEMS.map(({ ref, zone }) => {
      const zoneId = zoneOf(zone);
      return {
        id: createId(),
        projectId: id,
        zoneId,
        name: context.noKitNames[ref],
        state: 'pending',
        when: 'now',
        kitRef: ref,
        newForYou: false,
        order: nextOrder(zoneId),
      } satisfies Item;
    });
    return snapshot;
  }

  const experience = effectiveExperience(answers, kit, context.kits);
  const itemIds = new Map<string, string>();
  snapshot.items = kit.items.map((source) => {
    const zoneId = zoneOf(source.zone);
    const itemId = createId();
    itemIds.set(source.id, itemId);
    const optionIndex = kit.runsOn.includes(source.id) ? answers.runsOn[source.id] : undefined;
    const option =
      optionIndex === undefined ? undefined : kit.pendingOptions[source.id]?.[optionIndex];
    const item: Item = {
      id: itemId,
      projectId: id,
      zoneId,
      name: kitText(source.name, language),
      state: option ? 'decided' : source.state,
      when: source.when,
      kitRef: source.id,
      newForYou: source.tech ? experience[source.tech] === 'never' : false,
      order: nextOrder(zoneId),
    };
    if (option) item.choice = kitText(option.name, language);
    if (source.tech) item.tech = source.tech;
    return item;
  });
  const itemId = (ref: string) => {
    const found = itemIds.get(ref);
    if (!found) throw new Error(`Missing kit item ${ref}`);
    return found;
  };

  const connectionIds = new Map<string, string>();
  snapshot.connections = kit.connections.map((source) => {
    const connection: Connection = {
      id: createId(),
      projectId: id,
      from: itemId(source.from),
      to: itemId(source.to),
    };
    if (source.type) connection.type = source.type;
    connectionIds.set(`${source.from}>${source.to}`, connection.id);
    return connection;
  });

  snapshot.flows = kit.flows.map((source): Flow => ({
    id: createId(),
    projectId: id,
    name: kitText(source.name, language),
    steps: source.path.slice(1).map((to, index) => {
      const step = connectionIds.get(`${source.path[index]}>${to}`);
      if (!step) throw new Error(`Flow ${source.id} has no connection to ${to}`);
      return step;
    }),
  }));

  snapshot.checklist = Object.entries(kit.checklist).flatMap(([zone, refs]) =>
    (refs ?? []).map((itemRef, order): ChecklistExpectation => ({
      id: createId(),
      projectId: id,
      zoneId: zoneOf(zone as ZoneId),
      itemRef,
      order,
    })),
  );

  return snapshot;
}

export type PreviewCounts = { decided: number; pending: number; newForYou: number };

/** Numbers of the live preview, in the Hoje view (RN 2): future items are left out. */
export function previewCounts(items: readonly Pick<Item, 'state' | 'when' | 'newForYou'>[]) {
  const today = items.filter((item) => item.when === 'now');
  return {
    decided: today.filter((item) => item.state === 'decided').length,
    pending: today.filter((item) => item.state === 'pending').length,
    newForYou: today.filter((item) => item.newForYou).length,
  } satisfies PreviewCounts;
}

export type FirstStep =
  | { kind: 'choose-stack' }
  | { kind: 'prepare-env' }
  | { kind: 'decide'; itemId: string }
  | { kind: 'draw-flow' };

/**
 * RN 13: the first step, in priority order: choose the stack (no kit) → prepare the
 * environment (a new technology) → decide where it runs, in the kit's "Onde roda" order
 * (database, then hosting) → draw the first flow.
 */
export function firstStep(snapshot: ProjectSnapshot, kit: Kit | undefined): FirstStep {
  if (!snapshot.project.kitId) return { kind: 'choose-stack' };
  if (snapshot.items.some((item) => item.newForYou)) return { kind: 'prepare-env' };
  for (const ref of kit?.runsOn ?? NO_KIT_RUNS_ON) {
    const pending = snapshot.items.find((item) => item.kitRef === ref && item.state === 'pending');
    if (pending) return { kind: 'decide', itemId: pending.id };
  }
  return { kind: 'draw-flow' };
}
