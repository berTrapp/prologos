import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const cardVariants = cva('relative block text-left inset-ring', {
  variants: {
    variant: {
      default: 'surface rounded-card inset-ring-border',
      inner: 'rounded-inner bg-fill-subtle inset-ring-border',
      highlight: 'rounded-card bg-accent/7 inset-ring-accent/30',
    },
    padding: { default: 'p-5', compact: 'p-4', none: '' },
    interactive: {
      true: [
        'w-full cursor-pointer transition-shadow duration-(--duration-fast) hover:inset-ring-border-strong',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      ],
      false: '',
    },
  },
  defaultVariants: { variant: 'default', padding: 'default', interactive: false },
});

type CardProps = HTMLAttributes<HTMLDivElement> &
  Omit<VariantProps<typeof cardVariants>, 'interactive'> & {
    /** The whole card is a button; never place another button inside (ux-ui 13.9). */
    onSelect?: () => void;
  };

/** Surface for grouped content (ux-ui 13.9). */
export function Card({ className, variant, padding, onSelect, children, ...props }: CardProps) {
  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn(cardVariants({ variant, padding, interactive: true }), className)}
      >
        {children}
      </button>
    );
  }
  return (
    <div className={cn(cardVariants({ variant, padding }), className)} {...props}>
      {children}
    </div>
  );
}

/** Title (14–15 px, 600) with an optional mono label on the right. */
export function CardHeader({
  title,
  label,
  className,
}: {
  title: ReactNode;
  label?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-3 flex items-baseline justify-between gap-3', className)}>
      <h3 className="text-[14.5px] leading-snug font-semibold text-text">{title}</h3>
      {label ? (
        <span className="font-mono text-[11px] tracking-wide text-faint uppercase">{label}</span>
      ) : null}
    </div>
  );
}
