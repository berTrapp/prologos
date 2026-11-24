import type { ReactNode } from 'react';
import type { ZoneId } from '@/domain/zones';
import { zoneBorder, zoneTint } from '@/lib/zone-colors';
import { cn } from '@/lib/utils';

type SkeletonProps = { className?: string };

/** Still block in the shape of the real content; no shimmer (ux-ui 13.14). */
export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden className={cn('rounded-badge bg-fill-strong', className)} />;
}

/** Zone outline while the map loads: dashed in the zone color (ux-ui 13.14). */
export function SkeletonZone({
  zone,
  className,
  children,
}: {
  zone: ZoneId;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'rounded-card border border-dashed p-3',
        zoneBorder[zone],
        zoneTint[zone],
        className,
      )}
    >
      {children}
    </div>
  );
}
