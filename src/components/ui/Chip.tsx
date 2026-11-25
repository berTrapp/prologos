import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type ChipProps = {
  children: ReactNode;
  className?: string;
  /** Makes the chip a button (filter, clickable suggestion). */
  onClick?: () => void;
  pressed?: boolean;
  /** Adds a 12 px × that removes the chip; its label is built from the chip text. */
  onRemove?: () => void;
  /** Long commands break across lines instead of being cut (ux-ui 13.5). */
  wrap?: boolean;
};

const base =
  'relative inline-flex h-6 max-w-full items-center gap-1 rounded-badge bg-fill px-2 font-mono text-[11.5px] text-chip-fg inset-ring inset-ring-stroke';

/** Technology, key, command or technical value (ux-ui 13.5). */
export function Chip({ children, className, onClick, pressed, onRemove, wrap = false }: ChipProps) {
  const { t } = useTranslation();
  const label = <span className={wrap ? 'break-all' : 'truncate'}>{children}</span>;

  if (onClick) {
    return (
      <button
        type="button"
        aria-pressed={pressed}
        onClick={onClick}
        className={cn(
          base,
          'transition-colors duration-(--duration-fast) hover:bg-fill-strong hover:inset-ring-stroke-strong',
          'aria-pressed:bg-fill-active aria-pressed:text-text aria-pressed:inset-ring-stroke-strong',
          // Extends the hit area to 32 px (44 on touch) without changing the chip size.
          'after:absolute after:-inset-x-0.5 after:-inset-y-1 pointer-coarse:after:-inset-y-2.5',
          className,
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <span
      className={cn(
        base,
        onRemove && 'pr-0.5',
        wrap && 'h-auto min-h-6 py-1 leading-snug',
        className,
      )}
    >
      {label}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('ui.remove', { name: typeof children === 'string' ? children : '' })}
          className={cn(
            'relative grid size-5 place-items-center rounded-badge text-muted hover:bg-fill-strong hover:text-text',
            'after:absolute after:-inset-1.5 pointer-coarse:after:-inset-3',
          )}
        >
          <X aria-hidden className="size-3" />
        </button>
      ) : null}
    </span>
  );
}
