import { useTranslation } from 'react-i18next';
import type { MapModel } from './useMapModel';

/** Where the next step bar takes the person: an item, the trail in the checklist, or a new flow. */
export type NextStepTarget =
  { kind: 'item'; id: string } | { kind: 'checklist' } | { kind: 'flow' };

/**
 * RN 13: the steps ahead in one sentence, "Preparar o ambiente, depois escolher:
 * Banco de dados e Hospedagem", the pending count and where a click on the bar goes.
 * The trail counts as one pending step until it is done (RN 15).
 */
export function useNextStepText(model: MapModel) {
  const { t } = useTranslation();
  const list = new Intl.ListFormat(model.language, { type: 'conjunction' });
  const parts: string[] = [];
  const decide: string[] = [];
  let firstItemId: string | undefined;
  let prepare = false;
  for (const step of model.steps) {
    if (step.kind === 'choose-stack') {
      parts.push(t('map.next.chooseStack'));
      firstItemId ??= model.snapshot.items.find(
        (item) => item.kitRef === 'stack' && item.state === 'pending',
      )?.id;
    }
    if (step.kind === 'prepare-env') {
      parts.push(t('map.next.prepare'));
      prepare = true;
    }
    if (step.kind === 'draw-flow') parts.push(t('map.next.drawFlow'));
    if (step.kind === 'decide') {
      const item = model.itemById.get(step.itemId);
      if (item) decide.push(model.itemName(item));
      firstItemId ??= step.itemId;
    }
  }
  if (decide.length > 0) {
    const names = list.format(decide);
    parts.push(
      parts.length > 0 ? t('map.next.decideAfter', { names }) : t('map.next.decide', { names }),
    );
  }
  // A decision opens right on the map; the trail lives in the checklist; with nothing
  // left, the bar starts the first flow.
  const target: NextStepTarget | undefined = firstItemId
    ? { kind: 'item', id: firstItemId }
    : prepare
      ? { kind: 'checklist' }
      : model.steps.some((step) => step.kind === 'draw-flow')
        ? { kind: 'flow' }
        : undefined;
  return {
    text: parts.join(t('map.next.then')),
    pending: t('map.next.pending', { count: model.pendingCount + (prepare ? 1 : 0) }),
    target,
  };
}
