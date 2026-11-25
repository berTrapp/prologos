import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { ZoneId } from '@/domain/zones';
import { zoneBg } from '@/lib/zone-colors';
import { cn } from '@/lib/utils';

export type MapItemStatus = 'decided' | 'pending' | 'future';

const itemVariants = cva(
  [
    'relative flex h-12 w-[168px] items-center gap-2.5 rounded-inner bg-map-item px-3 text-left',
    'transition-shadow duration-(--duration-fast)',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  ],
  {
    variants: {
      status: {
        decided: 'inset-ring inset-ring-border-strong hover:inset-ring-stroke-strong',
        pending: 'border border-dashed border-warning/70',
        future: 'opacity-60 inset-ring inset-ring-border-strong',
      },
      selected: {
        true: 'shadow-[0_0_0_1.5px_var(--text),0_0_0_5.5px_color-mix(in_srgb,var(--text)_14%,transparent)]',
        false: '',
      },
    },
  },
);

type MapItemProps = {
  name: ReactNode;
  zone: ZoneId;
  status: MapItemStatus;
  isNew?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  /** Secondary line in place of the status ("PostgreSQL" on a decided pending item). */
  detail?: ReactNode;
  /**
   * Inside the map canvas the node itself takes focus and selection, so the card is
   * drawn without its own button.
   */
  inert?: boolean;
  className?: string;
};

/** Item card on the map, 168 × 48 (ux-ui 13.16). */
export function MapItem({
  name,
  zone,
  status,
  isNew,
  selected = false,
  onSelect,
  detail,
  inert = false,
  className,
}: MapItemProps) {
  const { t } = useTranslation();
  const classes = cn(itemVariants({ status, selected }), className);
  const content = (
    <>
      <span aria-hidden className={cn('size-2 shrink-0 rounded-full', zoneBg[zone])} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] leading-tight font-medium text-text">{name}</span>
        <span
          className={cn(
            'text-[11.5px] leading-tight',
            status === 'pending' ? 'text-warning' : 'text-muted',
          )}
        >
          {detail ?? t(`mapItem.status.${status}`)}
        </span>
      </span>
      {isNew ? (
        <span className="size-[7px] shrink-0 rounded-full bg-accent">
          <span className="sr-only">{t('ui.newForYou')}</span>
        </span>
      ) : null}
    </>
  );
  if (inert) return <div className={classes}>{content}</div>;
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected} className={classes}>
      {content}
    </button>
  );
}
