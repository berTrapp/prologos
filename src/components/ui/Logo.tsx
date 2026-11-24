import { useId } from 'react';
import { cn } from '@/lib/utils';

/** Brand mark: the only place, with active flows, that uses the gradient (ux-ui 5). */
export function Logo({ size = 24, className }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--brand-from)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--brand-to)' }} />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill={`url(#${id})`} />
      <path
        d="M9 18V6.5h3.6a3.6 3.6 0 0 1 0 7.2H9"
        fill="none"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: 'var(--knob)' }}
      />
    </svg>
  );
}
