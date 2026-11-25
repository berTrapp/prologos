import { useTranslation } from 'react-i18next';
import type { MapModel } from './useMapModel';

/**
 * RN 13: the steps ahead in one sentence, "Preparar o ambiente, depois escolher:
 * Banco de dados e Hospedagem", plus the first item to decide, if any.
 */
export function useNextStepText(model: MapModel) {
  const { t } = useTranslation();
  const list = new Intl.ListFormat(model.language, { type: 'conjunction' });
  const parts: string[] = [];
  const decide: string[] = [];
  let firstItemId: string | undefined;
  for (const step of model.steps) {
    if (step.kind === 'choose-stack') parts.push(t('map.next.chooseStack'));
    if (step.kind === 'prepare-env') parts.push(t('map.next.prepare'));
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
  return {
    text: parts.join(t('map.next.then')),
    pending: t('map.next.pending', { count: model.pendingCount }),
    firstItemId,
  };
}
