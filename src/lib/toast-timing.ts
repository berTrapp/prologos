export type ToastVariant = 'success' | 'error' | 'warning' | 'loading';

/** How long a toast stays (ux-ui 13.12). Infinity = until resolved or closed. */
export function toastDuration(variant: ToastVariant, hasAction: boolean): number {
  if (variant === 'error' || variant === 'loading') return Infinity;
  return hasAction ? 6000 : 4000;
}

export const MAX_VISIBLE_TOASTS = 3;
