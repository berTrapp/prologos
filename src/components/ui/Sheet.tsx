import { Dialog as DialogPrimitive } from 'radix-ui';
import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
};

const CLOSE_DISTANCE = 96;

/**
 * Mobile sheet: rises from the bottom with a 36 × 4 handle, radius 20 on top.
 * Closes by tapping outside, tapping the handle or dragging it down (ux-ui 13.10).
 */
export function Sheet({ open, onOpenChange, title, description, children }: SheetProps) {
  const { t } = useTranslation();
  const [offset, setOffset] = useState(0);
  const start = useRef<number | null>(null);
  const moved = useRef(false);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    start.current = event.clientY;
    moved.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (start.current === null) return;
    const delta = Math.max(0, event.clientY - start.current);
    if (delta > 4) moved.current = true;
    setOffset(delta);
  };
  const onPointerUp = () => {
    if (start.current === null) return;
    const shouldClose = offset > CLOSE_DISTANCE;
    start.current = null;
    setOffset(0);
    if (shouldClose) onOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-scrim data-[state=closed]:animate-[fade-out_var(--duration-fast)_ease-in] data-[state=open]:animate-[fade-in_var(--duration-base)_var(--ease-out)]" />
        <DialogPrimitive.Content
          style={offset ? { transform: `translateY(${offset}px)`, transition: 'none' } : undefined}
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-sheet bg-surface/92 pb-[env(safe-area-inset-bottom)] inset-ring inset-ring-stroke-strong backdrop-blur-xl',
            'transition-transform duration-(--duration-slow) ease-(--ease-out)',
            'data-[state=closed]:animate-[sheet-out_var(--duration-base)_ease-in] data-[state=open]:animate-[sheet-in_var(--duration-slow)_var(--ease-out)]',
            'focus-visible:outline-none',
          )}
        >
          <button
            type="button"
            aria-label={t('ui.dragToClose')}
            className="flex h-6 w-full shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={() => {
              if (!moved.current) onOpenChange(false);
            }}
          >
            <span aria-hidden className="h-1 w-9 rounded-full bg-switch-off" />
          </button>
          <div className="px-5 pb-2">
            <DialogPrimitive.Title className="text-[16px] font-semibold text-text">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 text-[13px] text-muted">
                {description}
              </DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
            )}
          </div>
          <div className="min-h-0 overflow-y-auto px-5 pt-2 pb-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
