import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader } from '@/components/ui/Card';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { KITS } from '@/content/kits';
import { effectiveExperience } from '@/domain/rules/guided-start';
import { EXPERIENCE_LEVELS, equivalenceRows, kitText, type Experience } from '@/domain/rules/kit';
import { useGuided } from './guided-store';
import { NoKitNotice } from './NoKitNotice';
import { StepHeader } from './StepHeader';
import { useGuidedModel } from './useGuidedModel';

/** Step 3: each technology as Conheço / Usei pouco / Nunca usei, and the equivalences (RN 15). */
export function ExperienceStep() {
  const { t } = useTranslation();
  const { answers, kit, knownKit, language } = useGuidedModel();
  const setAnswers = useGuided((s) => s.setAnswers);

  const header = (
    <StepHeader
      index={2}
      title={t('newProject.experience.title')}
      lead={t('newProject.experience.lead')}
    />
  );
  if (!kit) {
    return (
      <div className="flex flex-col gap-8">
        {header}
        <NoKitNotice body={t('newProject.noKit.experience')} />
      </div>
    );
  }

  const levels = effectiveExperience(answers, kit, KITS);
  const rows = equivalenceRows(knownKit, kit);
  const options = EXPERIENCE_LEVELS.map((level) => ({
    value: level,
    label: t(`newProject.experience.levels.${level}`),
  }));

  return (
    <div className="flex flex-col gap-8">
      {header}
      <Card padding="none">
        <ul className="flex flex-col">
          {kit.technologies.map((tech) => {
            const name = kitText(tech.name, language);
            return (
              <li
                key={tech.id}
                className="flex flex-col gap-3 border-t border-border px-5 py-4 first:border-t-0 tablet:flex-row tablet:items-center"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[14.5px] font-medium text-text">{name}</span>
                  <span className="text-[13px] leading-snug text-muted">
                    {kitText(tech.what, language)}
                  </span>
                </div>
                <SegmentedControl<Experience>
                  label={t('newProject.experience.levelLabel', { name })}
                  value={levels[tech.id] ?? 'never'}
                  options={options}
                  className="self-start tablet:self-center"
                  onValueChange={(level) =>
                    setAnswers({ experience: { ...answers.experience, [tech.id]: level } })
                  }
                />
              </li>
            );
          })}
        </ul>
      </Card>
      {knownKit && rows.length > 0 ? (
        <Card>
          <CardHeader
            title={t('newProject.experience.equivalences', {
              stack: t(`newProject.stack.stacks.${knownKit.knownStack ?? 'none'}`),
            })}
          />
          <p className="mt-1 text-[13px] text-muted">
            {t('newProject.experience.equivalencesLead')}
          </p>
          <dl className="mt-4 flex flex-col">
            {rows.map((row) => (
              <div
                key={row.concept}
                className="flex flex-col gap-1 border-t border-border py-2.5 tablet:grid tablet:grid-cols-[180px_minmax(0,1fr)] tablet:items-center tablet:gap-4"
              >
                <dt className="text-[13px] text-muted">
                  {t(`newProject.experience.concepts.${row.concept}`)}
                </dt>
                <dd className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[12.5px]">
                  <span className="text-faint">{row.from}</span>
                  <ArrowRight aria-hidden className="size-3.5 shrink-0 text-faint" />
                  <span className="text-text">{row.to}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      ) : null}
    </div>
  );
}
