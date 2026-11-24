import { useTranslation } from 'react-i18next';
import { ChoiceCard, ChoiceGroup } from '@/components/ui/ChoiceCard';
import { Input } from '@/components/ui/Input';
import { PROJECT_TYPES, type ProjectType } from '@/domain/schemas/project';
import { useGuided } from './guided-store';
import { StepHeader } from './StepHeader';

/** Step 1: name, goal and project type (RN 13). */
export function IdeaStep() {
  const { t } = useTranslation();
  const answers = useGuided((s) => s.answers);
  const setAnswers = useGuided((s) => s.setAnswers);

  return (
    <div className="flex flex-col gap-8">
      <StepHeader index={0} title={t('newProject.idea.title')} lead={t('newProject.idea.lead')} />
      <div className="flex flex-col gap-5">
        <Input
          label={t('newProject.idea.name')}
          placeholder={t('newProject.idea.namePlaceholder')}
          value={answers.name}
          maxLength={120}
          onChange={(event) => setAnswers({ name: event.target.value })}
        />
        <Input
          label={t('newProject.idea.goal')}
          placeholder={t('newProject.idea.goalPlaceholder')}
          value={answers.goal}
          maxLength={240}
          onChange={(event) => setAnswers({ goal: event.target.value })}
        />
      </div>
      <ChoiceGroup<ProjectType>
        label={t('newProject.idea.type')}
        value={answers.type}
        onValueChange={(type) => setAnswers({ type })}
      >
        {PROJECT_TYPES.map((type) => (
          <ChoiceCard
            key={type}
            value={type}
            title={t(`projectTypes.${type}`)}
            description={t(`newProject.idea.types.${type}`)}
          />
        ))}
      </ChoiceGroup>
    </div>
  );
}
