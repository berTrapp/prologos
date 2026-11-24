import { Popover as PopoverPrimitive } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PopoverProps = {
  trigger: ReactNode;
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
  children,
  open,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  className,
}: PopoverProps) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={8}
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
