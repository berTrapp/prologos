import type { Connection, Item, Zone } from './schemas/map';
import type { ProjectSnapshot } from './schemas/snapshot';
import { KITS, findKit } from '@/content/kits';
import type { Language } from '@/i18n/languages';
import { EMPTY_ANSWERS, buildProjectFromAnswers, type GuidedAnswers } from './rules/guided-start';
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

/** A project built by the guided start from a curated kit, or with no kit. */
export function kitProject(
  kitId: string | undefined,
  answers: Partial<GuidedAnswers> = {},
  language: Language = 'pt-BR',
): ProjectSnapshot {
  return buildProjectFromAnswers(
    {
      ...EMPTY_ANSWERS,
      name: 'Agenda de aulas',
      goal: 'Alunos marcam aulas e o professor confirma.',
      ...answers,
    },
    findKit(kitId),
    {
      id: `p-${kitId ?? 'none'}`,
      now: 0,
      createId: testId,
      language,
      unnamed: 'Projeto sem nome',
      noKitNames: { stack: 'Stack', database: 'Banco de dados', hosting: 'Hospedagem' },
      kits: KITS,
    },
  );
}
