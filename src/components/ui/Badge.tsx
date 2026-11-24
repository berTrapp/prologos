import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import type { BadgeVariant } from '@/lib/status-variants';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-badge px-2 text-[12px] leading-none font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'bg-neutral/12 text-neutral inset-ring inset-ring-neutral/24',
        success: 'bg-success/12 text-success inset-ring inset-ring-success/24',
        warning: 'bg-warning/12 text-warning inset-ring inset-ring-warning/24',
        danger: 'bg-danger/12 text-danger inset-ring inset-ring-danger/24',
        info: 'bg-info/12 text-info inset-ring inset-ring-info/24',
        accent: 'bg-accent/12 text-accent inset-ring inset-ring-accent/24',
        planned: 'border border-dashed border-muted/60 text-muted',
      } satisfies Record<BadgeVariant, string>,
    },
  },
);

type BadgeProps = {
  variant: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * Short state or category label, not clickable (ux-ui 13.2).
 * Pick the variant with `badgeForState`, never by hand.
 */
export function Badge({ variant, dot = false, children, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {dot ? <span aria-hidden className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
