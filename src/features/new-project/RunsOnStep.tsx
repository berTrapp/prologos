import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { ChoiceCard, ChoiceGroup } from '@/components/ui/ChoiceCard';
import { kitText } from '@/domain/rules/kit';
import { useGuided } from './guided-store';
import { NoKitNotice } from './NoKitNotice';
import { StepHeader } from './StepHeader';
import { useGuidedModel } from './useGuidedModel';

const UNKNOWN = 'unknown';

/** Step 4: where it runs, with the kit's options; "Ainda não sei" keeps the item pending (RN 13). */
export function RunsOnStep() {
  const { t } = useTranslation();
  const { answers, kit, language } = useGuidedModel();
  const setAnswers = useGuided((s) => s.setAnswers);

  const header = (
    <StepHeader index={3} title={t('newProject.runsOn.title')} lead={t('newProject.runsOn.lead')} />
  );
  if (!kit) {
    return (
      <div className="flex flex-col gap-8">
        {header}
        <NoKitNotice body={t('newProject.noKit.runsOn')} />
      </div>
    );
  }

  const choose = (ref: string, value: string) => {
    const rest = Object.entries(answers.runsOn).filter(([key]) => key !== ref);
    if (value !== UNKNOWN) rest.push([ref, Number(value)]);
    setAnswers({ runsOn: Object.fromEntries(rest) });
  };

  return (
    <div className="flex flex-col gap-8">
      {header}
      {kit.runsOn.map((ref) => {
        const item = kit.items.find((i) => i.id === ref);
        const options = kit.pendingOptions[ref] ?? [];
        if (!item) return null;
        const picked = answers.runsOn[ref];
        return (
          <ChoiceGroup<string>
            key={ref}
            label={kitText(item.name, language)}
            value={picked === undefined ? UNKNOWN : String(picked)}
            columns={2}
            onValueChange={(value) => choose(ref, value)}
          >
            {options.map((option, index) => (
              <ChoiceCard
                key={index}
                value={String(index)}
                title={kitText(option.name, language)}
                description={kitText(option.why, language)}
                badge={
                  option.recommended ? (
                    <Badge variant="accent">{t('newProject.stack.recommended')}</Badge>
                  ) : undefined
                }
              />
            ))}
            <ChoiceCard
              value={UNKNOWN}
              title={t('newProject.runsOn.unknown')}
              description={t('newProject.runsOn.unknownBody')}
            />
          </ChoiceGroup>
        );
      })}
    </div>
  );
}
