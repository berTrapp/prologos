import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Chip } from '@/components/ui/Chip';
import { kitText } from '@/domain/rules/kit';
import type { ChecklistView, PrepStepId } from '@/domain/rules/checklist';
import type { Language } from '@/i18n/languages';
import { badgeForState } from '@/lib/status-variants';
import { cn } from '@/lib/utils';

const newBadge = badgeForState('label', 'newForYou');

/** RN 15: install, create, run, first test; each step with its command and how to tell. */
export function PrepSection({
  prep,
  techs,
  language,
  onToggle,
}: {
  prep: NonNullable<ChecklistView['prep']>;
  techs: string;
  language: Language;
  onToggle: (id: PrepStepId, done: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card padding="none">
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-6 pt-5 pb-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="text-[16px] font-semibold text-text">{t('checklist.prep.title')}</h2>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
            <Badge {...newBadge}>{t('ui.newForYou')}</Badge>
            {techs}
          </p>
        </div>
        <span className="text-[13px] text-muted tabular-nums">
          {t('checklist.prep.count', { done: prep.done, total: prep.steps.length })}
        </span>
      </header>
      <ol className="flex flex-col">
        {prep.steps.map(({ id, step, done }) => {
          const title = kitText(step.title, language);
          return (
            <li
              key={id.kind === 'trail' ? id.index : id.key}
              className="flex flex-col gap-2 border-t border-border px-6 py-4 tablet:flex-row tablet:items-start tablet:gap-4"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Checkbox
                  checked={done}
                  onCheckedChange={(next) => onToggle(id, next)}
                  label={
                    <span
                      className={cn(
                        'text-[14.5px] font-medium',
                        done ? 'text-muted line-through' : 'text-text',
                      )}
                    >
                      {title}
                    </span>
                  }
                />
                <p className="pl-[28px] text-[13px] text-muted">
                  {t('checklist.prep.ok', { text: kitText(step.ok, language) })}
                </p>
              </div>
              <Chip wrap className="ml-[28px] self-start tablet:ml-0 tablet:max-w-[45%]">
                {step.command}
              </Chip>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
