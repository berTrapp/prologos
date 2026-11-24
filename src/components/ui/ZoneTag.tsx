import { useTranslation } from 'react-i18next';
import type { ZoneId } from '@/domain/zones';
import { zoneBg } from '@/lib/zone-colors';
import { cn } from '@/lib/utils';

/** Zone identifier: 6 px square in the zone color + name (ux-ui 13.6). */
export function ZoneTag({
  zone,
  label,
  className,
}: {
  zone: ZoneId;
  /** Name of a zone the person added; default zones use their translated name. */
  label?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <span className={cn('inline-flex items-center gap-2 text-[12px] text-text', className)}>
      <span aria-hidden className={cn('size-1.5 shrink-0 rounded-tag', zoneBg[zone])} />
      {label ?? t(`zones.${zone}`)}
    </span>
  );
}
