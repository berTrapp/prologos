import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type SpinnerProps = {
  className?: string;
  /** Announce the spinner to assistive tech; leave false when the parent already says it is busy. */
  announce?: boolean;
};

/** 16 px ring, 2.5 px stroke, one turn every 0.9 s (ux-ui 13.14). */
export function Spinner({ className, announce = false }: SpinnerProps) {
  const { t } = useTranslation();
  return (
    <span
      data-allow-motion
      role={announce ? 'status' : undefined}
      aria-label={announce ? t('ui.loading') : undefined}
      aria-hidden={announce ? undefined : true}
      className={cn(
        'inline-block size-4 shrink-0 animate-[spin_0.9s_linear_infinite] rounded-full border-[2.5px] border-current/20 border-t-current',
        className,
      )}
    />
  );
}
