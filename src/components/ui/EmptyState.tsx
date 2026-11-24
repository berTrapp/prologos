import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  variant?: 'empty' | 'error';
  /** Lucide icon for the empty variant; the error variant always uses the triangle. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** At most two actions; at most one primary (ux-ui 13.17). */
  actions?: ReactNode;
  className?: string;
};

/** Invitation when an area has no content, or explanation when it failed to open (ux-ui 13.17). */
export function EmptyState({
  variant = 'empty',
  icon,
  title,
  description,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : undefined}
      className={cn('flex flex-col items-center px-6 py-10 text-center', className)}
    >
      <div className="mb-4 grid size-11 place-items-center rounded-inner bg-fill text-muted inset-ring inset-ring-border [&_svg]:size-4">
        {variant === 'error' ? <TriangleAlert aria-hidden /> : icon}
      </div>
      <h3 className="text-[16px] font-semibold text-text">{title}</h3>
      {description ? (
        <p className="mt-2 line-clamp-2 max-w-[420px] text-[13.5px] text-muted">{description}</p>
      ) : null}
      {actions ? <div className="mt-4 flex flex-wrap justify-center gap-2">{actions}</div> : null}
    </div>
  );
}
