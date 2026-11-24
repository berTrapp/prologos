import { CircleAlert, CircleCheck, TriangleAlert, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { ToastVariant } from '@/lib/toast-timing';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Spinner } from './Spinner';

export type ToastAction = { label: string; onClick: () => void };

type ToastProps = {
  variant: ToastVariant;
  title: ReactNode;
  description?: ReactNode;
  action?: ToastAction;
  /** Finite duration draws the 2 px timeline at the bottom. */
  duration: number;
  onDismiss: () => void;
};

const tone: Record<ToastVariant, string> = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  loading: 'text-text',
};

const timeline: Record<ToastVariant, string> = {
  success: 'bg-success',
  error: 'bg-danger',
  warning: 'bg-warning',
  loading: 'bg-text',
};

/** Toast body rendered inside Sonner (ux-ui 13.12). Use `notify`, never this directly. */
export function Toast({ variant, title, description, action, duration, onDismiss }: ToastProps) {
  const { t } = useTranslation();
  const icon =
    variant === 'loading' ? (
      <Spinner />
    ) : variant === 'error' ? (
      <CircleAlert aria-hidden className="size-4" />
    ) : variant === 'warning' ? (
      <TriangleAlert aria-hidden className="size-4" />
    ) : (
      <CircleCheck aria-hidden className="size-4" />
    );

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className="surface-raised relative flex w-full items-start gap-3 overflow-hidden rounded-inner p-3 pr-2 inset-ring inset-ring-stroke-strong"
    >
      <span className={cn('mt-0.5 flex shrink-0', tone[variant])}>{icon}</span>
      <div className="min-w-0 flex-1 py-px">
        <p className="text-[13.5px] leading-snug font-semibold text-text">{title}</p>
        {description ? (
          <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-muted">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Button
          size="compact"
          variant="ghost"
          onClick={() => {
            action.onClick();
            onDismiss();
          }}
        >
          {action.label}
        </Button>
      ) : null}
      <Button
        size="icon"
        variant="quiet"
        aria-label={t('ui.dismissNotification')}
        icon={<X />}
        onClick={onDismiss}
      />
      {Number.isFinite(duration) ? (
        <span
          key={`${variant}-${duration}`}
          data-toast-timeline
          data-allow-motion
          aria-hidden
          style={{ animationDuration: `${duration}ms` }}
          className={cn(
            'absolute inset-x-0 bottom-0 h-0.5 origin-left animate-[toast-timeline_linear_forwards]',
            timeline[variant],
          )}
        />
      ) : null}
    </div>
  );
}
