import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { KITS, findKit } from '@/content/kits';
import {
  buildProjectFromAnswers,
  firstStep,
  previewCounts,
  type GuidedAnswers,
} from '@/domain/rules/guided-start';
import { kitForStack, recommendKit } from '@/domain/rules/kit';
import type { Kit } from '@/domain/schemas/kit';
import type { ProjectSnapshot } from '@/domain/schemas/snapshot';
import { resolveLanguage } from '@/i18n/languages';
import { useGuided, type KitChoice } from './guided-store';

/** The kit the answers lead to: the person's pick, or the recommendation while unanswered. */
export function resolveKit(choice: KitChoice, recommended: Kit | undefined): Kit | undefined {
  if (choice === 'none') return undefined;
  return choice === undefined ? recommended : findKit(choice);
}

export function useBuildContext() {
  const { t, i18n } = useTranslation();
  const language = resolveLanguage(i18n.language);
  return useMemo(
    () => ({
      language,
      unnamed: t('newProject.summary.unnamed'),
      noKitNames: {
        stack: t('newProject.noKitItems.stack'),
        database: t('newProject.noKitItems.database'),
        hosting: t('newProject.noKitItems.hosting'),
      },
      kits: KITS,
    }),
    [language, t],
  );
}

export type GuidedModel = {
  answers: GuidedAnswers;
  language: ReturnType<typeof resolveLanguage>;
  knownStack: GuidedAnswers['knownStack'];
  /** Kit of the stack the person knows, for the equivalences. */
  knownKit: Kit | undefined;
  recommended: Kit | undefined;
  kit: Kit | undefined;
  preview: ProjectSnapshot;
  counts: ReturnType<typeof previewCounts>;
  first: ReturnType<typeof firstStep>;
};

/** Everything the steps and the live preview read, derived from the draft. */
export function useGuidedModel(): GuidedModel {
  const answers = useGuided((s) => s.answers);
  const kitChoice = useGuided((s) => s.kitChoice);
  const context = useBuildContext();
  const known = answers.knownStack === 'none' ? undefined : answers.knownStack;
  const recommended = useMemo(() => recommendKit(KITS, answers.type, known), [answers.type, known]);
  const kit = resolveKit(kitChoice, recommended);

  const preview = useMemo(() => {
    let counter = 0;
    return buildProjectFromAnswers(answers, kit, {
      ...context,
      id: 'preview',
      now: 0,
      createId: () => `preview-${++counter}`,
    });
  }, [answers, kit, context]);

  return {
    answers,
    language: context.language,
    knownStack: answers.knownStack,
    knownKit: kitForStack(KITS, known),
    recommended,
    kit,
    preview,
    counts: previewCounts(preview.items),
    first: firstStep(preview, kit),
  };
}
