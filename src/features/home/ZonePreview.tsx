import type { ZoneColor } from '@/domain/zones';
import { zoneBg, zoneBorder, zoneTint } from '@/lib/zone-colors';
import { cn } from '@/lib/utils';

/**
 * Still miniature of the project's zones. Stands in for the real map thumbnail
 * until the map exists (phase 5). No motion, no shimmer (ux-ui 6, 13.14).
 */
export function ZonePreview({
  colors,
  label,
  className,
}: {
  colors: ZoneColor[];
  label: string;
  className?: string;
}) {
  const shown = colors.slice(0, 9);
  return (
    <div
      role="img"
      aria-label={label}
      className={cn('grid grid-cols-3 gap-2 overflow-hidden bg-fill-subtle p-3', className)}
    >
      {shown.map((color, index) => (
        <div
          key={`${color}-${index}`}
          className={cn(
            'flex flex-col gap-1.5 rounded-control border p-2',
            zoneBorder[color],
            zoneTint[color],
          )}
        >
          <span className={cn('h-1 w-1/3 rounded-full opacity-70', zoneBg[color])} />
          <span className="h-2.5 w-full rounded-tag bg-fill-strong" />
          <span className="h-2.5 w-2/3 rounded-tag bg-fill-strong" />
        </div>
      ))}
    </div>
  );
}
