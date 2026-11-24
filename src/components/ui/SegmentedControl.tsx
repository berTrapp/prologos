import { ToggleGroup } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Option<T extends string> = { value: T; label: ReactNode; icon?: ReactNode };

type SegmentedControlProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly Option<T>[];
  /** Accessible name of the group ("Vista", "Tema"). */
  label: string;
  className?: string;
};

/** View switch with 2 to 4 options (ux-ui 13.8). */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  label,
  className,
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      aria-label={label}
      // An empty value would deselect everything; a segmented control always has one active option.
      onValueChange={(next) => next && onValueChange(next as T)}
      className={cn(
        'inline-flex rounded-track bg-fill-subtle p-[3px] inset-ring inset-ring-border',
        className,
      )}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          className={cn(
            'inline-flex h-8 items-center justify-center gap-1.5 rounded-control px-3 text-[13px] font-medium whitespace-nowrap text-muted',
            'pointer-coarse:h-10 pointer-coarse:px-4',
            'transition-[background-color,color,box-shadow] duration-(--duration-fast) hover:text-text',
            'data-[state=on]:bg-fill-active data-[state=on]:text-text data-[state=on]:shadow-segment',
            'focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-4',
          )}
        >
          {option.icon}
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
