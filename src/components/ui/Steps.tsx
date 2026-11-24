import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Progress } from './Progress';
import { Spinner } from './Spinner';

export type StepStatus = 'done' | 'current' | 'upcoming';
export type Step = { id: string; label: ReactNode; detail?: ReactNode; status: StepStatus };

type StepsProps = {
  steps: readonly Step[];
  /** Real progress 0–100. */
  progress: number;
  /** One sentence of context under the bar. */
  context?: ReactNode;
  onCancel?: () => void;
  className?: string;
};

/** Vertical steps with real progress and Cancel, for 2–10 s waits (ux-ui 13.14, 15). */
export function Steps({ steps, progress, context, onCancel, className }: StepsProps) {
  const { t } = useTranslation();
  const statusLabel: Record<StepStatus, string> = {
    done: t('ui.stepDone'),
    current: t('ui.stepCurrent'),
    upcoming: t('ui.stepUpcoming'),
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <ol className="flex flex-col gap-2.5">
        {steps.map((step) => (
          <li
            key={step.id}
            aria-current={step.status === 'current' ? 'step' : undefined}
            className="flex items-center gap-3"
          >
            <span
              className={cn(
                'grid size-[22px] shrink-0 place-items-center rounded-full',
                step.status === 'done' && 'bg-success/14 text-success',
                step.status === 'current' && 'text-text',
                step.status === 'upcoming' && 'inset-ring inset-ring-stroke-strong',
              )}
            >
              {step.status === 'done' ? (
                <Check aria-hidden className="size-3.5" strokeWidth={2.5} />
              ) : step.status === 'current' ? (
                <Spinner />
              ) : null}
            </span>
            <span className="sr-only">{statusLabel[step.status]}: </span>
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-[13.5px]',
                step.status === 'upcoming' ? 'text-muted' : 'text-text',
              )}
            >
              {step.label}
            </span>
            {step.detail ? (
              <span className="shrink-0 font-mono text-[11.5px] text-faint">{step.detail}</span>
            ) : null}
          </li>
        ))}
      </ol>
      <Progress value={progress} />
      {context || onCancel ? (
        <div className="flex items-center justify-between gap-3">
          {context ? <p className="text-[12.5px] text-muted">{context}</p> : <span />}
          {onCancel ? (
            <Button size="compact" onClick={onCancel}>
              {t('ui.cancel')}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
