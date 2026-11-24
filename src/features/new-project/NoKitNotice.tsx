import { Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGuided } from './guided-store';

/** Shown in the steps that need a kit when the person chose "Ainda não sei". */
export function NoKitNotice({ body }: { body: string }) {
  const { t } = useTranslation();
  const goTo = useGuided((s) => s.goTo);
  return (
    <div className="rounded-card border border-dashed border-border-strong">
      <EmptyState
        icon={<Layers />}
        title={t('newProject.noKit.title')}
        description={body}
        actions={<Button onClick={() => goTo(1)}>{t('newProject.noKit.action')}</Button>}
      />
    </div>
  );
}
