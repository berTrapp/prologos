import { formatCount } from '@/lib/format-count';
import { cn } from '@/lib/utils';

type CountProps = { value: number; className?: string; 'aria-label'?: string };

/** Pending count on navigation (ux-ui 13.3). Hidden at zero. */
export function Count({ value, className, ...props }: CountProps) {
  if (value <= 0) return null;
  return (
    <span
      className={cn(
        'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-count px-[5px] text-[11px] leading-none font-bold text-count-fg tabular-nums',
        'pointer-coarse:h-4 pointer-coarse:min-w-4',
        className,
      )}
      {...props}
    >
      {formatCount(value)}
    </span>
  );
}
