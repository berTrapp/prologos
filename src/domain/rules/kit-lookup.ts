import { SUPPORTED_LANGUAGES, type Language } from '@/i18n/languages';
import type { Kit, KitItem, KitName, KitText } from '../schemas/kit';
import type { Item, Zone } from '../schemas/map';
import type { ProjectSnapshot } from '../schemas/snapshot';
import { chosenOption } from './checklist';
import { kitText, type EquivalenceConcept } from './kit';

const allLanguages = (value: KitName): string[] =>
  typeof value === 'string' ? [value] : SUPPORTED_LANGUAGES.map((lng) => value[lng]);

/**
 * RN 17: text that came from a kit (or from the translations) follows the current
 * language while it is unchanged; once the person rewrites it, it stays as written.
 * `variants` are the same text in every language.
 */
export function followLanguage(stored: string, variants: readonly string[], current: string) {
  return variants.includes(stored) ? current : stored;
}

export function kitItemFor(item: Pick<Item, 'kitRef'>, kit: Kit | undefined): KitItem | undefined {
  return item.kitRef ? kit?.items.find((source) => source.id === item.kitRef) : undefined;
}

/** Name shown on the map: the kit name in the current language until renamed (RN 17). */
export function itemDisplayName(
  item: Pick<Item, 'name' | 'kitRef'>,
  kit: Kit | undefined,
  language: Language,
): string {
  const source = kitItemFor(item, kit);
  if (!source) return item.name;
  return followLanguage(item.name, allLanguages(source.name), kitText(source.name, language));
}

/** The chosen option in the current language, while it is one of the kit's options. */
export function choiceDisplayName(
  item: Pick<Item, 'choice' | 'kitRef'>,
  kit: Kit | undefined,
  language: Language,
): string | undefined {
  if (!item.choice) return undefined;
  const options = item.kitRef ? (kit?.pendingOptions[item.kitRef] ?? []) : [];
  const option = options.find((o) => allLanguages(o.name).includes(item.choice ?? ''));
  return option ? kitText(option.name, language) : item.choice;
}

export type ItemOption = { index: number; name: string; why: string; recommended: boolean };

export type ItemKnowledge = {
  /** What the technology is (RN 15). */
  what?: string;
  /** Why the kit put it in the map. */
  why?: string;
  docs?: string;
  /** "No Laravel, o equivalente é Eloquent" (RN 15). */
  equivalent?: { concept: EquivalenceConcept; value: string };
  /** Options with consequences for a pending item, recommended one marked. */
  options: ItemOption[];
};

/** Everything the details panel explains about an item that came from a kit. */
export function itemKnowledge(
  item: Pick<Item, 'kitRef' | 'tech'>,
  kit: Kit | undefined,
  knownKit: Kit | undefined,
  language: Language,
): ItemKnowledge {
  const source = kitItemFor(item, kit);
  const tech = kit?.technologies.find((t) => t.id === (item.tech ?? source?.tech));
  const knowledge: ItemKnowledge = {
    options: (item.kitRef ? (kit?.pendingOptions[item.kitRef] ?? []) : []).map((option, index) => ({
      index,
      name: kitText(option.name, language),
      why: kitText(option.why, language),
      recommended: option.recommended === true,
    })),
  };
  if (tech) knowledge.what = kitText(tech.what, language);
  if (source?.why) knowledge.why = kitText(source.why, language);
  const docs = source?.docs ?? tech?.docs;
  if (docs) knowledge.docs = docs;
  const concept = source?.concept;
  const value =
    concept && knownKit && knownKit.id !== kit?.id ? knownKit.equivalences?.[concept] : undefined;
  if (concept && value) knowledge.equivalent = { concept, value: kitText(value, language) };
  return knowledge;
}

export type Suggestion = { kitRef: string; name: string; tech?: string; state: KitItem['state'] };

/**
 * Kit items that are not on the map, for the new item popover. In a default zone only
 * that zone's items are suggested; in a zone the person added, all of them.
 */
export function suggestionsFor(
  snapshot: Pick<ProjectSnapshot, 'items'>,
  kit: Kit | undefined,
  zone: Pick<Zone, 'key'> | undefined,
  language: Language,
): Suggestion[] {
  if (!kit) return [];
  const present = new Set(snapshot.items.map((item) => item.kitRef).filter(Boolean));
  return kit.items
    .filter((source) => !present.has(source.id) && (!zone?.key || source.zone === zone.key))
    .map((source) => {
      const suggestion: Suggestion = {
        kitRef: source.id,
        name: kitText(source.name, language),
        state: source.state,
      };
      if (source.tech) suggestion.tech = source.tech;
      return suggestion;
    });
}

/**
 * RN 3: where to get a variable's value. What was chosen in "Onde roda" wins over the kit's
 * general hint, so DATABASE_URL follows the database (PostgreSQL, not "SQLite to start").
 */
export function envHowToGet(
  snapshot: Pick<ProjectSnapshot, 'items'>,
  kit: Kit | undefined,
  key: string,
): KitText | undefined {
  if (!kit) return undefined;
  for (const ref of kit.runsOn) {
    const hint = chosenOption(snapshot, kit, ref)?.env?.[key]?.howToGet;
    if (hint) return hint;
  }
  return kit.envVars.find((v) => v.key === key)?.howToGet;
}
