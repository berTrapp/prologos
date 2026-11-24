import { cva } from 'class-variance-authority';
import { Info, OctagonAlert, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'flex flex-col gap-3 rounded-inner px-4 py-3 inset-ring sm:flex-row sm:items-center',
  {
    variants: {
      variant: {
        warning: 'bg-warning/10 inset-ring-warning/24 [--alert-icon:var(--warning)]',
        danger: 'bg-danger/10 inset-ring-danger/24 [--alert-icon:var(--danger)]',
        info: 'bg-info/10 inset-ring-info/24 [--alert-icon:var(--info)]',
      },
    },
  },
);

const icons = { warning: TriangleAlert, danger: OctagonAlert, info: Info };

type InlineAlertProps = {
  variant: 'warning' | 'danger' | 'info';
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/** Persistent notice that belongs to an area of the screen (ux-ui 13.13). */
export function InlineAlert({ variant, title, children, actions, className }: InlineAlertProps) {
  const Icon = icons[variant];
  return (
    <div className={cn(alertVariants({ variant }), className)}>
      <div className="flex min-w-0 flex-1 gap-3">
        <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-(--alert-icon)" />
        <div className="min-w-0">
          {title ? (
            <p className="text-[14px] leading-snug font-semibold text-text">{title}</p>
          ) : null}
          {children ? (
            <p className={cn('text-[13px] leading-snug', title ? 'text-muted' : 'text-text')}>
              {children}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2 pl-7 sm:pl-0">{actions}</div> : null}
    </div>
  );
}
