import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const dotVariants = cva('size-1.5 shrink-0 rounded-full', {
  variants: {
    tone: {
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
      info: 'bg-info',
      accent: 'bg-accent',
      neutral: 'bg-neutral',
    },
  },
});

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral';

/** Project and connection status: 6 px dot + text, never color alone (ux-ui 13.4). */
export function StatusDot({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[12px] text-muted', className)}>
      <span aria-hidden className={dotVariants({ tone })} />
      {children}
    </span>
  );
}
