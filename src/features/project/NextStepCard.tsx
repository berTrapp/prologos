import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { findKit } from '@/content/kits';
import { firstStep } from '@/domain/rules/guided-start';
import type { ProjectSnapshot } from '@/domain/schemas/snapshot';
import { useFirstStepText } from '@/features/new-project/useFirstStepText';

/** The first step in highlight, always visible at the top of the project (RN 13, ux-ui 13.9). */
export function NextStepCard({ snapshot }: { snapshot: ProjectSnapshot }) {
  const { t } = useTranslation();
  const step = firstStep(snapshot, findKit(snapshot.project.kitId));
  const text = useFirstStepText(step, snapshot.items);
  return (
    <Card variant="highlight" className="mb-6">
      <p className="font-mono text-[11.5px] tracking-[0.14em] text-accent uppercase">
        {t('firstStep.label')}
      </p>
      <p className="mt-1.5 text-[16px] font-semibold text-text">{text.title}</p>
      <p className="mt-1 text-[13.5px] text-muted">{text.body}</p>
    </Card>
  );
}
