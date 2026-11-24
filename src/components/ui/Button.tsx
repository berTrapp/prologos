import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import {
  forwardRef,
  useLayoutEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium select-none',
    'rounded-control pointer-coarse:rounded-inner',
    'transition-[background-color,box-shadow,color] duration-(--duration-fast)',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'disabled:pointer-events-none disabled:opacity-45 aria-disabled:cursor-not-allowed',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-primary font-semibold text-primary-fg hover:bg-primary-hover',
        ghost: 'text-text inset-ring inset-ring-stroke-strong hover:bg-fill',
        destructive: 'text-danger inset-ring inset-ring-stroke-strong hover:bg-danger/8',
        quiet: 'text-muted hover:bg-fill hover:text-text',
      },
      size: {
        default: 'h-9 px-3.5 text-[13px] pointer-coarse:h-11 pointer-coarse:px-4',
        compact: 'h-8 px-3 text-[13px] pointer-coarse:h-11',
        touch: 'h-11 rounded-inner px-4 text-[14px]',
        icon: 'size-8 pointer-coarse:size-11',
      },
    },
    defaultVariants: { variant: 'ghost', size: 'default' },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Shows a spinner in place of the icon and keeps the width (ux-ui 13.7). */
    loading?: boolean;
    /** Gerund text shown while loading ("Exportando…"). */
    loadingText?: ReactNode;
    icon?: ReactNode;
  };

/** Primary (one per screen), ghost, destructive and icon-only buttons (ux-ui 13.7). */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    loadingText,
    icon,
    children,
    onClick,
    style,
    type = 'button',
    ...props
  },
  forwardedRef,
) {
  const innerRef = useRef<HTMLButtonElement | null>(null);
  const idleWidth = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (!loading && innerRef.current) idleWidth.current = innerRef.current.offsetWidth;
  });

  const setRefs = (node: HTMLButtonElement | null) => {
    innerRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  if (asChild) {
    return (
      <Slot.Root
        ref={setRefs}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      ref={setRefs}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      style={loading && idleWidth.current ? { ...style, minWidth: idleWidth.current } : style}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {loading && loadingText ? loadingText : children}
    </button>
  );
});
