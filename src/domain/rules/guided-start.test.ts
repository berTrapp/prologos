import { describe, expect, it } from 'vitest';
import { KITS, findKit } from '@/content/kits';
import { SUPPORTED_LANGUAGES, type Language } from '@/i18n/languages';
import { testId } from '../fixtures';
import type { Kit } from '../schemas/kit';
import { ProjectSnapshotSchema, type ProjectSnapshot } from '../schemas/snapshot';
import {
  EMPTY_ANSWERS,
  buildProjectFromAnswers,
  effectiveExperience,
  firstStep,
  previewCounts,
  type GuidedAnswers,
} from './guided-start';
import { validateMap } from './map';

const kit = (id: string): Kit => {
  const found = findKit(id);
  if (!found) throw new Error(id);
  return found;
};

const build = (answers: Partial<GuidedAnswers>, kitId?: string, language: Language = 'pt-BR') =>
  buildProjectFromAnswers({ ...EMPTY_ANSWERS, ...answers }, findKit(kitId), {
    id: 'project-1',
    now: 1_000,
    createId: testId,
    language,
    unnamed: 'Projeto sem nome',
    noKitNames: { stack: 'Stack', database: 'Banco de dados', hosting: 'Hospedagem' },
    kits: KITS,
  });

const byRef = (snapshot: ProjectSnapshot, ref: string) => {
  const item = snapshot.items.find((i) => i.kitRef === ref);
  if (!item) throw new Error(ref);
  return item;
};

describe('buildProjectFromAnswers', () => {
  it.each(KITS.flatMap((k) => SUPPORTED_LANGUAGES.map((lng) => [k.id, lng] as const)))(
    '%s builds a valid map in %s',
    (kitId, language) => {
      const snapshot = build(
        { name: 'Agenda', type: 'web', knownStack: 'laravel' },
        kitId,
        language,
      );
      expect(ProjectSnapshotSchema.safeParse(snapshot).success).toBe(true);
      expect(validateMap(snapshot)).toEqual([]);
      expect(snapshot.items).toHaveLength(kit(kitId).items.length);
      expect(snapshot.flows).toHaveLength(kit(kitId).flows.length);
      expect(snapshot.checklist.length).toBeGreaterThan(0);
      expect(snapshot.envVars).toHaveLength(kit(kitId).envVars.length * 3);
      expect(snapshot.project.kitId).toBe(kitId);
    },
  );

  it('still creates a project when every step is skipped (RN 13)', () => {
    const snapshot = build({});
    expect(ProjectSnapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(snapshot.project).toMatchObject({ name: 'Projeto sem nome', type: 'unknown' });
    expect(snapshot.project.kitId).toBeUndefined();
    expect(snapshot.project.goal).toBeUndefined();
    expect(snapshot.zones).toHaveLength(9);
    expect(snapshot.items.map((i) => [i.kitRef, i.name, i.state])).toEqual([
      ['stack', 'Stack', 'pending'],
      ['database', 'Banco de dados', 'pending'],
      ['hosting', 'Hospedagem', 'pending'],
    ]);
  });

  it('puts each pending item of a project with no kit in its zone', () => {
    const snapshot = build({ name: '  Agenda  ', goal: '  ' });
    const zoneKey = (ref: string) =>
      snapshot.zones.find((z) => z.id === byRef(snapshot, ref).zoneId)?.key;
    expect(zoneKey('stack')).toBe('app');
    expect(zoneKey('database')).toBe('data');
    expect(zoneKey('hosting')).toBe('infra');
    expect(snapshot.project.name).toBe('Agenda');
    expect(snapshot.project.goal).toBeUndefined();
  });

  it('keeps the known stack, but not "none"', () => {
    expect(build({ knownStack: 'django' }).project.knownStack).toBe('django');
    expect(build({ knownStack: 'none' }).project.knownStack).toBeUndefined();
  });

  it('names items in the language of the moment, and technical names as they are', () => {
    expect(byRef(build({}, 'laravel-react', 'en'), 'queues').name).toBe('Queues');
    expect(byRef(build({}, 'laravel-react', 'es'), 'queues').name).toBe('Colas');
    expect(byRef(build({}, 'laravel-react', 'es'), 'eloquent').name).toBe('Eloquent');
  });

  it('marks "Nunca usei" technologies as new for you (RN 15)', () => {
    const snapshot = build(
      { knownStack: 'laravel', experience: { node: 'some', prisma: 'never', react: 'never' } },
      'node-react',
    );
    const newItems = snapshot.items.filter((i) => i.newForYou);
    expect(new Set(newItems.map((i) => i.tech))).toEqual(new Set(['express', 'prisma', 'react']));
    expect(snapshot.items.filter((i) => !i.tech).every((i) => !i.newForYou)).toBe(true);
  });

  it('uses the default experience when the step is skipped', () => {
    const known = build({ knownStack: 'django' }, 'django');
    expect(known.items.some((i) => i.newForYou)).toBe(false);
    const none = build({ knownStack: 'none' }, 'django');
    expect(none.items.filter((i) => i.tech).every((i) => i.newForYou)).toBe(true);
  });

  it('decides the "Onde roda" items with the chosen option', () => {
    const snapshot = build({ runsOn: { database: 0, hosting: 2 } }, 'laravel-react');
    expect(byRef(snapshot, 'database')).toMatchObject({ state: 'decided', choice: 'PostgreSQL' });
    expect(byRef(snapshot, 'hosting')).toMatchObject({
      state: 'decided',
      choice: 'Só local por enquanto',
    });
  });

  it('keeps an "Onde roda" item pending on "Ainda não sei" or an unknown option', () => {
    const snapshot = build({ runsOn: { hosting: 9, backup: 0 } }, 'laravel-react');
    expect(byRef(snapshot, 'database').state).toBe('pending');
    expect(byRef(snapshot, 'hosting').state).toBe('pending');
    // Backup is not asked in "Onde roda", so an answer for it is ignored.
    expect(byRef(snapshot, 'backup').state).toBe('pending');
  });

  it('turns the suggested flow into connections in order', () => {
    const snapshot = build({}, 'laravel-react');
    const flow = snapshot.flows[0];
    const ids = new Set(snapshot.connections.map((c) => c.id));
    expect(flow?.name).toBe('Salvar um registro');
    expect(flow?.steps).toHaveLength(4);
    expect(flow?.steps.every((step) => ids.has(step))).toBe(true);
    const first = snapshot.connections.find((c) => c.id === flow?.steps[0]);
    expect(first?.from).toBe(byRef(snapshot, 'react-vite').id);
    expect(first?.type).toBe('calls');
  });

  it('orders items inside each zone', () => {
    const snapshot = build({}, 'laravel-react');
    const data = snapshot.items.filter((i) => i.zoneId === byRef(snapshot, 'database').zoneId);
    expect(data.map((i) => i.order)).toEqual([0, 1, 2]);
  });
});

describe('effectiveExperience', () => {
  it('ignores answers for technologies of another kit', () => {
    const levels = effectiveExperience(
      { knownStack: 'none', experience: { php: 'known', dart: 'some' } },
      kit('flutter'),
      KITS,
    );
    expect(levels).toEqual({ dart: 'some', flutter: 'never', riverpod: 'never' });
  });
});

describe('previewCounts', () => {
  it('counts the Hoje view only', () => {
    const counts = previewCounts(build({ knownStack: 'none' }, 'laravel-react').items);
    const kitItems = kit('laravel-react').items.filter((i) => i.when === 'now');
    expect(counts.decided + counts.pending).toBe(kitItems.length);
    expect(counts.pending).toBe(3);
    expect(counts.newForYou).toBeGreaterThan(0);
  });
});

describe('firstStep (RN 13)', () => {
  it('asks to choose the stack when there is no kit', () => {
    expect(firstStep(build({}), undefined)).toEqual({ kind: 'choose-stack' });
  });

  it('prepares the environment when a technology is new', () => {
    const snapshot = build({ knownStack: 'none' }, 'django');
    expect(firstStep(snapshot, kit('django'))).toEqual({ kind: 'prepare-env' });
  });

  it('then decides the database, then the hosting', () => {
    const known = { knownStack: 'django' } as const;
    const a = build(known, 'django');
    expect(firstStep(a, kit('django'))).toEqual({
      kind: 'decide',
      itemId: byRef(a, 'database').id,
    });
    const b = build({ ...known, runsOn: { database: 0 } }, 'django');
    expect(firstStep(b, kit('django'))).toEqual({ kind: 'decide', itemId: byRef(b, 'hosting').id });
  });

  it('follows the kit order on mobile (back end, then stores)', () => {
    const snapshot = build(
      { knownStack: 'laravel', experience: { ts: 'known', rn: 'known', expo: 'known' } },
      'react-native',
    );
    expect(firstStep(snapshot, kit('react-native'))).toEqual({
      kind: 'decide',
      itemId: byRef(snapshot, 'backend').id,
    });
  });

  it('ends with drawing the first flow', () => {
    const snapshot = build({ knownStack: 'django', runsOn: { database: 0, hosting: 0 } }, 'django');
    expect(firstStep(snapshot, kit('django'))).toEqual({ kind: 'draw-flow' });
  });

  it('falls back to database and hosting when the kit is not available', () => {
    const snapshot = build({ knownStack: 'django' }, 'django');
    expect(firstStep(snapshot, undefined)).toEqual({
      kind: 'decide',
      itemId: byRef(snapshot, 'database').id,
    });
  });
});
