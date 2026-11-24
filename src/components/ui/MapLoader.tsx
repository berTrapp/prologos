import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ZoneId } from '@/domain/zones';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

const PHRASES = ['prologue', 'dots', 'zones', 'variables', 'flows'] as const;

/** Five points, in zone colors, joined in order by flow lines. */
const POINTS: { x: number; y: number; zone: ZoneId }[] = [
  { x: 14, y: 44, zone: 'methodology' },
  { x: 46, y: 14, zone: 'interface' },
  { x: 48, y: 74, zone: 'data' },
  { x: 86, y: 44, zone: 'infrastructure' },
  { x: 120, y: 20, zone: 'security' },
];

const LOOP_MS = 2400;
const PHRASE_MS = 2000;
export const MAP_LOADER_DELAY_MS = 400;

type MapLoaderProps = {
  /** Wait before showing anything, so fast loads never flash (ux-ui 15). */
  delay?: number;
  /** Forces reduced motion (preview); otherwise follows the system. */
  reducedMotion?: boolean;
  className?: string;
};

/** Mini-map shown while a heavy map opens (ux-ui 13.14, 15). */
export function MapLoader({
  delay = MAP_LOADER_DELAY_MS,
  reducedMotion,
  className,
}: MapLoaderProps) {
  const { t } = useTranslation();
  const systemReduced = usePrefersReducedMotion();
  const still = reducedMotion ?? systemReduced;
  const [visible, setVisible] = useState(delay === 0);
  const [phrase, setPhrase] = useState(0);

  useEffect(() => {
    if (delay === 0) return;
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setInterval(() => setPhrase((i) => (i + 1) % PHRASES.length), PHRASE_MS);
    return () => window.clearInterval(timer);
  }, [visible]);

  if (!visible) return null;

  const segments = POINTS.slice(0, -1).flatMap((from, index) => {
    const to = POINTS[index + 1];
    return to ? [{ from, to, index }] : [];
  });

  return (
    <div
      role="status"
      aria-label={t('ui.openingProject')}
      className={cn('flex flex-col items-center gap-5', className)}
    >
      <svg width="134" height="88" viewBox="0 0 134 88" aria-hidden className="overflow-visible">
        {segments.map(({ from, to, index }) => (
          <line
            key={index}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            pathLength={1}
            strokeDasharray="1"
            strokeLinecap="round"
            data-allow-motion={still ? undefined : true}
            className={cn('stroke-border-strong', !still && 'map-loader-line')}
            style={still ? undefined : { animationDelay: `${(index + 1) * (LOOP_MS / 10)}ms` }}
            strokeWidth={1.5}
          />
        ))}
        {POINTS.map((point, index) => (
          <g key={point.zone} className={`map-loader-point zone-${point.zone}`}>
            <circle cx={point.x} cy={point.y} r={8} className="fill-(--zone)/18" />
            <circle
              cx={point.x}
              cy={point.y}
              r={4}
              className={cn('fill-(--zone)', !still && 'map-loader-dot')}
              data-allow-motion={still ? undefined : true}
              style={still ? undefined : { animationDelay: `${index * (LOOP_MS / 10)}ms` }}
            />
          </g>
        ))}
      </svg>
      <p aria-live="off" className="text-[14px] text-text">
        {t(`mapLoader.phrases.${PHRASES[phrase] ?? 'prologue'}`)}
      </p>
    </div>
  );
}
