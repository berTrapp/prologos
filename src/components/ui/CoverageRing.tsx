import { useId, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type CoverageRingProps = {
  value: number;
  size?: number;
  /** Line under a large number ("6 de 13 resolvidos"); without it the number stays small. */
  caption?: ReactNode;
  className?: string;
};

/** Coverage ring: progress stroke in a circle, brand gradient, percentage beside (ux-ui 5, 13.14). */
export function CoverageRing({ value, size = 44, caption, className }: CoverageRingProps) {
  const { t } = useTranslation();
  const gradientId = useId();
  const clamped = Math.min(100, Math.max(0, value));
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      role="img"
      aria-label={t('ui.coverage', { value: Math.round(clamped) })}
      className={cn('inline-flex items-center gap-3', className)}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--brand-from)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--brand-to)' }} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-fill-strong"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
        />
      </svg>
      {caption ? (
        <span className="flex flex-col gap-1 pl-2">
          <span
            aria-hidden
            className="text-[32px] leading-none font-semibold text-text tabular-nums"
          >
            {Math.round(clamped)}%
          </span>
          <span className="text-[13.5px] text-muted">{caption}</span>
        </span>
      ) : (
        <span aria-hidden className="text-[15px] font-semibold text-text tabular-nums">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
