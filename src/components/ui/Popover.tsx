import { Popover as PopoverPrimitive } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PopoverProps = {
  /** The element that opens it; or `anchorPoint` when it grows from a point on screen. */
  trigger?: ReactNode;
  anchorPoint?: { x: number; y: number };
  /** Accessible name when there is no trigger to name it. */
  label?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
};

/** Anchored to its origin, radius 12, raised surface; Esc closes (ux-ui 13.10). */
export function Popover({
  trigger,
  anchorPoint,
  label,
  children,
  open,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  className,
}: PopoverProps) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger> : null}
      {anchorPoint ? (
        <PopoverPrimitive.Anchor asChild>
          {/* Zero-size anchor at the point the popover grows from (ux-ui 13.10). */}
          <span
            aria-hidden
            className="pointer-events-none fixed size-0"
            style={{ left: anchorPoint.x, top: anchorPoint.y }}
          />
        </PopoverPrimitive.Anchor>
      ) : null}
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={8}
          aria-label={label}
          collisionPadding={16}
          className={cn(
            'surface-raised z-50 w-72 max-w-[calc(100vw-32px)] rounded-inner p-3 inset-ring inset-ring-stroke-strong',
            'origin-(--radix-popover-content-transform-origin)',
            'data-[state=closed]:animate-[popover-out_var(--duration-fast)_ease-in] data-[state=open]:animate-[popover-in_var(--duration-fast)_var(--ease-out)]',
            'focus-visible:outline-none',
            className,
          )}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
