import { useTranslation } from 'react-i18next';
import type { FirstStep } from '@/domain/rules/guided-start';
import type { ProjectSnapshot } from '@/domain/schemas/snapshot';

/** Title and sentence of the first step (RN 13), for the summary and the project. */
export function useFirstStepText(step: FirstStep, items: ProjectSnapshot['items']) {
  const { t } = useTranslation();
  if (step.kind === 'decide') {
    const name = items.find((item) => item.id === step.itemId)?.name ?? '';
    return { title: t('firstStep.decide', { name }), body: t('firstStep.body.decide') };
  }
  return { title: t(`firstStep.${step.kind}`), body: t(`firstStep.body.${step.kind}`) };
}
