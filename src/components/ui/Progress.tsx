import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type ProgressProps = {
  /** Real progress from 0 to 100; never a fake value (ux-ui 15). */
  value: number;
  label?: string;
  className?: string;
};

/** 6 px progress bar; opens at its current value, no entrance animation (ux-ui 6, 13.14). */
export function Progress({ value, label, className }: ProgressProps) {
  const { t } = useTranslation();
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      aria-label={label ?? t('ui.progress', { value: Math.round(clamped) })}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-fill-strong', className)}
    >
      <div
        style={{ transform: `scaleX(${clamped / 100})` }}
        className="h-full origin-left rounded-full bg-progress transition-transform duration-(--duration-slow) ease-(--ease-out)"
      />
    </div>
  );
}
