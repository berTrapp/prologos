import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChoiceCard, ChoiceGroup } from '@/components/ui/ChoiceCard';
import { KITS } from '@/content/kits';
import { kitText, kitsForType } from '@/domain/rules/kit';
import { KNOWN_STACKS } from '@/domain/schemas/project';
import { useGuided } from './guided-store';
import { StepHeader } from './StepHeader';
import { useGuidedModel } from './useGuidedModel';

const STACK_CHOICES = [...KNOWN_STACKS, 'none'] as const;
type StackChoice = (typeof STACK_CHOICES)[number];

/** Step 2: the stack the person knows, then the kit, with the recommended one marked (RN 13). */
export function StackStep() {
  const { t } = useTranslation();
  const { answers, kit, recommended, language } = useGuidedModel();
  const kitChoice = useGuided((s) => s.kitChoice);
  const setAnswers = useGuided((s) => s.setAnswers);
  const setKitChoice = useGuided((s) => s.setKitChoice);

  const offered = kitsForType(KITS, answers.type);
  const hidesSome = offered.length < KITS.length;
  // A kit picked before the type changed stays visible.
  const [showAll, setShowAll] = useState(() => Boolean(kit && !offered.includes(kit)));
  const listed = [...(showAll ? KITS : offered)].sort(
    (a, b) => Number(b === recommended) - Number(a === recommended),
  );
  const value = kitChoice === 'none' ? 'none' : kit?.id;

  return (
    <div className="flex flex-col gap-8">
      <StepHeader index={1} title={t('newProject.stack.title')} lead={t('newProject.stack.lead')} />
      <ChoiceGroup<StackChoice>
        label={t('newProject.stack.known')}
        value={answers.knownStack}
        onValueChange={(knownStack) => setAnswers({ knownStack })}
      >
        {STACK_CHOICES.map((stack) => (
          <ChoiceCard key={stack} value={stack} title={t(`newProject.stack.stacks.${stack}`)} />
        ))}
      </ChoiceGroup>
      <div className="flex flex-col gap-3">
        <ChoiceGroup<string>
          label={t('newProject.stack.kit')}
          value={value}
          columns={2}
          onValueChange={setKitChoice}
        >
          {listed.map((item) => (
            <ChoiceCard
              key={item.id}
              value={item.id}
              title={kitText(item.name, language)}
              description={kitText(item.summary, language)}
              badge={
                item === recommended ? (
                  <Badge variant="accent">{t('newProject.stack.recommended')}</Badge>
                ) : undefined
              }
            />
          ))}
          <ChoiceCard
            value="none"
            title={t('newProject.stack.unknownKit')}
            description={t('newProject.stack.unknownKitBody')}
          />
        </ChoiceGroup>
        {hidesSome ? (
          <Button
            variant="quiet"
            size="compact"
            className="self-start"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? t('newProject.stack.showFewer') : t('newProject.stack.showAll')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
