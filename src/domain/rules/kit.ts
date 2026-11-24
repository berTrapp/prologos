import type { Language } from '@/i18n/languages';
import type { Kit, KitName } from '../schemas/kit';
import type { KnownStack, ProjectType } from '../schemas/project';

/** RN 15: how well the person knows each technology of the kit. */
export const EXPERIENCE_LEVELS = ['known', 'some', 'never'] as const;
export type Experience = (typeof EXPERIENCE_LEVELS)[number];

/** RN 15: concepts translated between stacks, in display order. */
export const EQUIVALENCE_CONCEPTS = [
  'orm',
  'migrate',
  'routes',
  'packages',
  'devServer',
  'config',
  'templates',
  'auth',
  'tests',
] as const;
export type EquivalenceConcept = (typeof EQUIVALENCE_CONCEPTS)[number];

/** Kit text in the given language; technical names stay as written. */
export function kitText(value: KitName, language: Language): string {
  return typeof value === 'string' ? value : value[language];
}

export function kitForStack(kits: readonly Kit[], stack: KnownStack | undefined): Kit | undefined {
  return stack ? kits.find((kit) => kit.knownStack === stack) : undefined;
}

/** Kits offered for a project type; "Ainda não sei" sees every kit (RN 13). */
export function kitsForType(kits: readonly Kit[], type: ProjectType): Kit[] {
  return type === 'unknown' ? [...kits] : kits.filter((kit) => kit.projectTypes.includes(type));
}

/**
 * RN 13: site → static site; mobile → React Native when the person knows Laravel or Node
 * (they already know React), otherwise Flutter; other types → the kit of the known stack.
 */
export function recommendKit(
  kits: readonly Kit[],
  type: ProjectType,
  knownStack: KnownStack | undefined,
): Kit | undefined {
  const offered = kitsForType(kits, type);
  if (type === 'site') return offered[0];
  if (type === 'mobile') {
    const wanted = knownStack === 'laravel' || knownStack === 'node' ? 'react-native' : 'flutter';
    return offered.find((kit) => kit.id === wanted);
  }
  return kitForStack(offered, knownStack);
}

/**
 * RN 15: the default comes from the stack the person knows. Technologies that also belong
 * to the kit of that stack start as "Conheço"; the others start as "Nunca usei".
 */
export function defaultExperience(
  kit: Kit,
  kits: readonly Kit[],
  knownStack: KnownStack | undefined,
): Record<string, Experience> {
  const known = new Set(kitForStack(kits, knownStack)?.technologies.map((tech) => tech.id));
  return Object.fromEntries(
    kit.technologies.map((tech) => [tech.id, known.has(tech.id) ? 'known' : 'never']),
  );
}

export type EquivalenceRow = { concept: EquivalenceConcept; from: string; to: string };

/**
 * RN 15: the chosen kit's concepts, explained from the stack the person knows.
 * Empty when the person knows that same stack, or when either kit has no table (mobile, site).
 */
export function equivalenceRows(from: Kit | undefined, to: Kit): EquivalenceRow[] {
  if (!from || from.id === to.id || !from.equivalences || !to.equivalences) return [];
  const source = from.equivalences;
  const target = to.equivalences;
  return EQUIVALENCE_CONCEPTS.flatMap((concept) => {
    const a = source[concept];
    const b = target[concept];
    return a && b ? [{ concept, from: a, to: b }] : [];
  });
}
