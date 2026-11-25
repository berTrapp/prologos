import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProject } from '@/app/services';
import { KITS, findKit } from '@/content/kits';
import { notApplicableReason } from '@/domain/rules/checklist';
import { NO_KIT_ITEMS, nextSteps } from '@/domain/rules/guided-start';
import { kitForStack } from '@/domain/rules/kit';
import { choiceDisplayName, followLanguage, itemDisplayName } from '@/domain/rules/kit-lookup';
import { layoutMap, mapEdges, type MapEdge, type MapLayout } from '@/domain/rules/layout';
import { annotationCount, annotationsByItem, type ItemAnnotations } from '@/domain/rules/notes';
import { mapItemStatus, visibleMap } from '@/domain/rules/view';
import type { MapItemStatus } from '@/components/ui/MapItem';
import type { Kit } from '@/domain/schemas/kit';
import type { Connection, Item, Zone } from '@/domain/schemas/map';
import type { ProjectSnapshot } from '@/domain/schemas/snapshot';
import { SUPPORTED_LANGUAGES, resolveLanguage, type Language } from '@/i18n/languages';

export type MapModel = {
  snapshot: ProjectSnapshot;
  language: Language;
  kit: Kit | undefined;
  knownKit: Kit | undefined;
  items: Item[];
  connections: Connection[];
  layout: MapLayout;
  edges: MapEdge[];
  annotations: Map<string, ItemAnnotations>;
  annotationTotal: number;
  /** RN 5: items marked "Não se aplica" in the checklist, with the reason. */
  notApplicable: Map<string, string>;
  /** Card status, with "Não se aplica" over the item's own (ux-ui 13.16). */
  itemStatus(item: Item): MapItemStatus;
  steps: ReturnType<typeof nextSteps>;
  pendingCount: number;
  zoneName(zone: Pick<Zone, 'key' | 'name'>): string;
  itemName(item: Pick<Item, 'name' | 'kitRef'>): string;
  choiceName(item: Pick<Item, 'choice' | 'kitRef'>): string | undefined;
  zoneById: Map<string, Zone>;
  itemById: Map<string, Item>;
};

/** Everything the map screen reads, derived from the open project (RN 1, 2, 13, 17). */
export function useMapModel(): MapModel | undefined {
  const { t, i18n } = useTranslation();
  const snapshot = useProject((s) => s.snapshot);
  const language = resolveLanguage(i18n.language);

  return useMemo(() => {
    if (!snapshot) return undefined;
    const kit = findKit(snapshot.project.kitId);
    const knownKit = kitForStack(KITS, snapshot.project.knownStack);
    const { items, connections } = visibleMap(snapshot, snapshot.project.view);
    const layout = layoutMap(snapshot.zones, items);

    // Items of a project with no kit are named by the translations (RN 13, 17).
    const noKitVariants = new Map(
      NO_KIT_ITEMS.map(({ ref }) => [
        ref,
        SUPPORTED_LANGUAGES.map((lng) => i18n.getFixedT(lng)(`newProject.noKitItems.${ref}`)),
      ]),
    );
    const itemName = (item: Pick<Item, 'name' | 'kitRef'>) => {
      const variants = !kit && item.kitRef ? noKitVariants.get(item.kitRef as never) : undefined;
      if (variants && item.kitRef)
        return followLanguage(
          item.name,
          variants,
          t(`newProject.noKitItems.${item.kitRef as 'stack'}`),
        );
      return itemDisplayName(item, kit, language);
    };

    const notApplicable = new Map(
      snapshot.items.flatMap((item) => {
        const reason = notApplicableReason(item, snapshot.checklist);
        return reason ? [[item.id, reason] as const] : [];
      }),
    );

    return {
      snapshot,
      language,
      kit,
      knownKit,
      items,
      connections,
      layout,
      edges: mapEdges(connections, layout),
      annotations: annotationsByItem(snapshot),
      annotationTotal: annotationCount(snapshot),
      notApplicable,
      itemStatus: (item) => (notApplicable.has(item.id) ? 'notApplicable' : mapItemStatus(item)),
      steps: nextSteps(snapshot, kit),
      pendingCount: items.filter((item) => item.state === 'pending').length,
      zoneName: (zone) => zone.name ?? (zone.key ? t(`zones.${zone.key}`) : ''),
      itemName,
      choiceName: (item) => choiceDisplayName(item, kit, language),
      zoneById: new Map(snapshot.zones.map((zone) => [zone.id, zone])),
      itemById: new Map(snapshot.items.map((item) => [item.id, item])),
    } satisfies MapModel;
  }, [snapshot, language, t, i18n]);
}
