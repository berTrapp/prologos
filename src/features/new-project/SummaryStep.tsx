import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { kitText } from '@/domain/rules/kit';
import { useGuided } from './guided-store';
import { StepHeader } from './StepHeader';
import { useFirstStepText } from './useFirstStepText';
import { useGuidedModel } from './useGuidedModel';

/** Step 5: what will be created, the first step and what is left to decide (RN 13). */
export function SummaryStep() {
  const { t } = useTranslation();
  const { answers, kit, preview, first, language } = useGuidedModel();
  const goTo = useGuided((s) => s.goTo);
  const firstText = useFirstStepText(first, preview.items);
  const today = preview.items.filter((item) => item.when === 'now');
  const pending = today.filter((item) => item.state === 'pending');
  const fresh = today.filter((item) => item.newForYou);

  const rows = [
    { label: t('newProject.summary.project'), value: preview.project.name, step: 0 },
    { label: t('newProject.summary.type'), value: t(`projectTypes.${answers.type}`), step: 0 },
    {
      label: t('newProject.summary.kit'),
      value: kit ? kitText(kit.name, language) : t('newProject.summary.noKit'),
      step: 1,
    },
    // What was chosen in step 4, so nothing answered disappears from the review (RN 13).
    ...(kit
      ? [
          {
            label: t('newProject.summary.runsOn'),
            value: kit.runsOn
              .flatMap((ref) => preview.items.filter((item) => item.kitRef === ref))
              .map((item) =>
                item.state === 'decided'
                  ? (item.choice ?? item.name)
                  : t('newProject.summary.undecided', { name: item.name }),
              )
              .join(' · '),
            step: 3,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        index={4}
        title={t('newProject.summary.title')}
        lead={t('newProject.summary.lead')}
      />
      <Card padding="none">
        <dl className="flex flex-col">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex min-h-12 items-center gap-3 border-t border-border px-5 py-2 first:border-t-0"
            >
              <dt className="w-24 shrink-0 text-[13px] text-muted">{row.label}</dt>
              <dd className="min-w-0 flex-1 truncate text-[14px] text-text">{row.value}</dd>
              <Button
                variant="quiet"
                size="compact"
                aria-label={t('newProject.summary.edit', { step: row.label })}
                onClick={() => goTo(row.step)}
              >
                {t('newProject.summary.change')}
              </Button>
            </div>
          ))}
        </dl>
      </Card>
      <Card variant="highlight">
        <p className="font-mono text-[11.5px] tracking-[0.14em] text-accent uppercase">
          {t('firstStep.label')}
        </p>
        <p className="mt-1.5 text-[16px] font-semibold text-text">{firstText.title}</p>
        <p className="mt-1 text-[13.5px] text-muted">{firstText.body}</p>
      </Card>
      <div className="grid gap-4 tablet:grid-cols-2">
        <Card>
          <CardHeader title={t('newProject.summary.pending')} label={String(pending.length)} />
          <ItemList
            names={pending.map((item) => item.name)}
            marker="pending"
            empty={t('newProject.summary.nothing')}
          />
        </Card>
        <Card>
          <CardHeader title={t('newProject.summary.newForYou')} label={String(fresh.length)} />
          <ItemList
            names={fresh.map((item) => item.name)}
            marker="new"
            empty={t('newProject.summary.nothing')}
          />
        </Card>
      </div>
    </div>
  );
}

function ItemList({
  names,
  marker,
  empty,
}: {
  names: string[];
  marker: 'pending' | 'new';
  empty: string;
}) {
  if (names.length === 0) return <p className="mt-3 text-[13.5px] text-muted">{empty}</p>;
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {names.map((name) => (
        <li key={name} className="flex items-center gap-2.5 text-[13.5px] text-text">
          {marker === 'pending' ? (
            <span
              aria-hidden
              className="h-2.5 w-3.5 shrink-0 rounded-tag border border-dashed border-warning"
            />
          ) : (
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
          )}
          <span className="min-w-0 truncate">{name}</span>
        </li>
      ))}
    </ul>
  );
}
