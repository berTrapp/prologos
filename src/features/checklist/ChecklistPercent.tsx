import { useTranslation } from 'react-i18next';
import { useProject } from '@/app/services';
import { findKit } from '@/content/kits';
import { checklistView } from '@/domain/rules/checklist';

/** Share resolved in the active view, next to "Checklist" in the sidebar (RN 5). */
export function ChecklistPercent({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const snapshot = useProject((s) => s.snapshot);
  if (snapshot?.project.id !== projectId) return null;
  const { percent } = checklistView(
    snapshot,
    findKit(snapshot.project.kitId),
    snapshot.project.view,
  );
  return (
    <>
      <span aria-hidden>{percent}%</span>
      <span className="sr-only">{t('checklist.percentLabel', { value: percent })}</span>
    </>
  );
}
