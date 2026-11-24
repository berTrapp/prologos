import { RadioGroup } from 'radix-ui';
import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type OptionListProps<T extends string> = {
  label: ReactNode;
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: ReactNode }[];
  className?: string;
};

/** Single choice as 48 px rows, for touch screens (ux-ui 13.19). */
export function OptionList<T extends string>({
  label,
  value,
  onValueChange,
  options,
  className,
}: OptionListProps<T>) {
  const labelId = useId();
  return (
    <div
      className={cn('surface rounded-card px-4 pt-3 pb-1 inset-ring inset-ring-border', className)}
    >
      <p id={labelId} className="pb-2 text-[13px] font-semibold text-muted">
        {label}
      </p>
      <RadioGroup.Root
        aria-labelledby={labelId}
        value={value}
        onValueChange={(next) => onValueChange(next as T)}
        className="flex flex-col"
      >
        {options.map((option) => (
          <RadioGroup.Item
            key={option.value}
            value={option.value}
            className={cn(
              'group flex min-h-12 items-center justify-between gap-4 border-t border-border px-1 text-left text-[16px] text-text',
              'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
            )}
          >
            {option.label}
            <span
              aria-hidden
              className="grid size-[22px] shrink-0 place-items-center rounded-full inset-ring-[1.5px] inset-ring-stroke-strong group-data-[state=checked]:bg-text group-data-[state=checked]:inset-ring-text"
            >
              <span className="size-2 rounded-full bg-bg opacity-0 group-data-[state=checked]:opacity-100" />
            </span>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </div>
  );
}
