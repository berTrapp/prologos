import { CircleAlert, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProject } from '@/app/services';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

/** Discreet save state, no toast (ux-ui 7). */
export function SaveIndicator({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const status = useProject((s) => s.saveStatus);
  const open = useProject((s) => s.snapshot !== null);
  if (!open) return null;

  const label =
    status === 'saving' ? t('save.saving') : status === 'error' ? t('save.error') : t('save.saved');
  return (
    <p
      role="status"
      aria-live="polite"
      title={compact ? label : undefined}
      className={cn(
        'flex items-center gap-2 text-[12px]',
        status === 'error' ? 'text-danger' : 'text-muted',
        compact && 'justify-center',
      )}
    >
      {status === 'saving' ? (
        <Spinner className="size-3.5" />
      ) : status === 'error' ? (
        <CircleAlert aria-hidden className="size-3.5" />
      ) : (
        <Check aria-hidden className="size-3.5" />
      )}
      <span className={cn(compact && 'sr-only')}>{label}</span>
    </p>
  );
}
