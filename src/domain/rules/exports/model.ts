import type { Language } from '@/i18n/languages';
import type { Kit } from '../../schemas/kit';
import type { Zone } from '../../schemas/map';
import type { Severity } from '../../schemas/notes';
import type { View } from '../../schemas/project';
import type { ProjectSnapshot } from '../../schemas/snapshot';
import type { ZoneId } from '../../zones';
import { notApplicableRefs } from '../checklist';
import { kitText } from '../kit';
import { choiceDisplayName, itemDisplayName } from '../kit-lookup';
import { flowSegments, isFuture, visibleMap } from '../view';

/** Translation function for the generated files; they come out in the chosen language (RN 10, 17). */
export type Translate = (key: string, values?: Record<string, unknown>) => string;

/** RN 10: what the person picks on the Exportar screen. Secrets never leave, so there is no option. */
export type ExportOptions = {
  /** Future items, and the Completo view of mapa.html. */
  futures: boolean;
  /** Public notes and open risks. Private notes never leave (RN 19). */
  notes: boolean;
};

export type ExportInput = {
  snapshot: ProjectSnapshot;
  kit: Kit | undefined;
  language: Language;
  t: Translate;
  options: ExportOptions;
};

export type ExportItem = {
  id: string;
  /** Short, stable id for the files (n1, n2…), never the database id. */
  ref: string;
  name: string;
  zoneId: string;
  /** Name of the zone or subzone it lives in. */
  zone: string;
  status: 'decided' | 'pending' | 'future';
  notApplicable: boolean;
  choice?: string;
  description?: string;
  notes: string[];
  risks: { text: string; severity: Severity }[];
};

export type ExportZone = {
  id: string;
  ref: string;
  parentId: string | null;
  name: string;
  color: ZoneId;
  items: ExportItem[];
};

export type ExportConnection = { id: string; from: string; to: string; type?: string };

export type ExportFlow = {
  name: string;
  /** Connection ids that still exist in this view (gaps and hidden stretches left out). */
  connections: string[];
};

export type ExportModel = {
  name: string;
  goal?: string;
  kitName?: string;
  view: View;
  /** Zones in reading order: each top zone followed by its subzones. */
  zones: ExportZone[];
  items: ExportItem[];
  connections: ExportConnection[];
  flows: ExportFlow[];
  /** Public project notes, not tied to an item. */
  notes: string[];
  risks: { text: string; severity: Severity; item?: string }[];
};

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

/** Lowercase, no accents, words joined by hyphens: "Agenda de aulas" → agenda-de-aulas. */
export function slugify(text: string, fallback = 'projeto'): string {
  const slug = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

/**
 * Everything the generated files show, resolved once: names in the chosen language,
 * the active view (Hoje, or Completo with future items), and nothing secret or private.
 */
export function exportModel({ snapshot, kit, language, t, options }: ExportInput): ExportModel {
  const view: View = options.futures ? 'complete' : 'today';
  const visible = visibleMap(snapshot, view);
  const skipped = notApplicableRefs(snapshot.checklist);
  const publicNotes = snapshot.notes.filter((note) => !note.private);
  const openRisks = snapshot.risks.filter((risk) => !risk.resolved);

  const items: ExportItem[] = [];
  const itemsOf = new Map<string, ExportItem[]>();
  const sortedItems = [...visible.items].sort(byOrder);

  const zones: ExportZone[] = [];
  const place = (zone: Zone) => {
    const entry: ExportZone = {
      id: zone.id,
      ref: `z${zones.length + 1}`,
      parentId: zone.parentId,
      name: zone.name ?? t(`zones.${String(zone.key)}`),
      color: zone.color,
      items: [],
    };
    zones.push(entry);
    itemsOf.set(zone.id, entry.items);
    snapshot.zones
      .filter((child) => child.parentId === zone.id)
      .sort(byOrder)
      .forEach(place);
  };
  snapshot.zones
    .filter((zone) => zone.parentId === null)
    .sort(byOrder)
    .forEach(place);

  // Refs follow every item in reading order, so Hoje and Completo share them.
  const refOf = new Map<string, string>();
  const allItems = [...snapshot.items].sort(byOrder);
  for (const zone of zones)
    for (const item of allItems.filter((i) => i.zoneId === zone.id))
      refOf.set(item.id, `n${refOf.size + 1}`);

  for (const zone of zones) {
    for (const item of sortedItems.filter((i) => i.zoneId === zone.id)) {
      const choice = choiceDisplayName(item, kit, language);
      const entry: ExportItem = {
        id: item.id,
        ref: refOf.get(item.id) ?? item.id,
        name: itemDisplayName(item, kit, language),
        zoneId: item.zoneId,
        zone: zone.name,
        status: isFuture(item) ? 'future' : item.state,
        notApplicable: Boolean(item.kitRef && skipped.has(item.kitRef)),
        notes: options.notes
          ? publicNotes.filter((note) => note.itemId === item.id).map((note) => note.text)
          : [],
        risks: options.notes
          ? openRisks
              .filter((risk) => risk.itemId === item.id)
              .map(({ text, severity }) => ({ text, severity }))
          : [],
      };
      if (choice) entry.choice = choice;
      if (item.description?.trim()) entry.description = item.description.trim();
      items.push(entry);
      itemsOf.get(zone.id)?.push(entry);
    }
  }
  const shown = new Set(items.map((item) => item.id));
  const names = new Map(items.map((item) => [item.id, item.name]));

  const connections: ExportConnection[] = visible.connections
    .filter((c) => shown.has(c.from) && shown.has(c.to))
    .map((c) => ({
      id: c.id,
      from: c.from,
      to: c.to,
      ...(c.type ? { type: t(`map.connectionTypes.${c.type}`) } : {}),
    }));
  const visibleIds = new Set(connections.map((c) => c.id));
  const flows: ExportFlow[] = snapshot.flows.map((flow) => ({
    name: flow.name,
    connections: flowSegments(flow, snapshot, view)
      .map((segment) => segment.connectionId)
      .filter((id) => visibleIds.has(id)),
  }));

  const model: ExportModel = {
    name: snapshot.project.name,
    view,
    zones,
    items,
    connections,
    flows,
    notes: options.notes ? publicNotes.filter((note) => !note.itemId).map((note) => note.text) : [],
    risks: options.notes
      ? openRisks.map((risk) => {
          const item = risk.itemId ? names.get(risk.itemId) : undefined;
          return { text: risk.text, severity: risk.severity, ...(item ? { item } : {}) };
        })
      : [],
  };
  if (snapshot.project.goal?.trim()) model.goal = snapshot.project.goal.trim();
  if (kit) model.kitName = kitText(kit.name, language);
  return model;
}
