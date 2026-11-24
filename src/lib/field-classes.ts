import { cn } from './utils';

/** Shared look of text fields (ux-ui 13.11). */
export const fieldClasses = cn(
  'w-full min-w-0 bg-fill-subtle text-text inset-ring inset-ring-stroke placeholder:text-faint',
  'transition-shadow duration-(--duration-fast)',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'aria-invalid:inset-ring-danger/60 disabled:opacity-50',
);
