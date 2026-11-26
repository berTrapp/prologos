import { Tooltip as TooltipPrimitive } from 'radix-ui';
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Kbd } from './Kbd';

export const TooltipProvider = TooltipPrimitive.Provider;

type TooltipProps = Omit<ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>, 'content'> & {
  content: ReactNode;
  shortcut?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  children: ReactNode;
};

/**
 * Short hint for icon-only controls; shows on hover and keyboard focus.
 * Forwards ref and props to its child, so it can sit inside another trigger (a popover's).
 */
export const Tooltip = forwardRef<HTMLButtonElement, TooltipProps>(function Tooltip(
  { content, shortcut, side = 'top', children, ...props },
  ref,
) {
  return (
    <TooltipPrimitive.Root delayDuration={400}>
      <TooltipPrimitive.Trigger ref={ref} asChild {...props}>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            'surface-raised z-50 flex items-center gap-2 rounded-badge px-2 py-1 text-[12px] text-text inset-ring inset-ring-stroke-strong',
            'data-[state=delayed-open]:animate-[fade-in_var(--duration-fast)_var(--ease-out)]',
          )}
        >
          {content}
          {shortcut ? <Kbd>{shortcut}</Kbd> : null}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
});
