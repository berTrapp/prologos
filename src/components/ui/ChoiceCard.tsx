import { RadioGroup } from 'radix-ui';
import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ChoiceGroupProps<T extends string> = {
  /** Visible name of the group, above the cards. */
  label: ReactNode;
  value: T | undefined;
  onValueChange: (value: T) => void;
  children: ReactNode;
  /** Desktop columns; one column below 760 px. */
  columns?: 1 | 2 | 3;
  className?: string;
};

const columnClasses = {
  1: '',
  2: 'tablet:grid-cols-2',
  3: 'tablet:grid-cols-2 desktop:grid-cols-3',
};

/** Single choice among cards that need a sentence each (ux-ui 13.20). */
export function ChoiceGroup<T extends string>({
  label,
  value,
  onValueChange,
  children,
  columns = 3,
  className,
}: ChoiceGroupProps<T>) {
  const labelId = useId();
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <p id={labelId} className="text-[13.5px] font-semibold text-text">
        {label}
      </p>
      <RadioGroup.Root
        aria-labelledby={labelId}
        value={value ?? ''}
        onValueChange={(next) => onValueChange(next as T)}
        className={cn('grid grid-cols-1 gap-2', columnClasses[columns])}
      >
        {children}
      </RadioGroup.Root>
    </div>
  );
}

type ChoiceCardProps = {
  value: string;
  title: ReactNode;
  description?: ReactNode;
  /** Optional badge next to the title ("Recomendado para começar"). */
  badge?: ReactNode;
  className?: string;
};

/** One card of a ChoiceGroup: radio indicator, title and one sentence (ux-ui 13.20). */
export function ChoiceCard({ value, title, description, badge, className }: ChoiceCardProps) {
  return (
    <RadioGroup.Item
      value={value}
      className={cn(
        'group surface flex min-h-14 items-start gap-3 rounded-inner px-4 py-3.5 text-left inset-ring inset-ring-border',
        'transition-shadow duration-(--duration-fast) hover:inset-ring-stroke-strong',
        'data-[state=checked]:bg-fill-subtle data-[state=checked]:inset-ring-[1.5px] data-[state=checked]:inset-ring-text',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className,
      )}
    >
      <span
        aria-hidden
        className="mt-px grid size-[18px] shrink-0 place-items-center rounded-full inset-ring-[1.5px] inset-ring-stroke-strong group-data-[state=checked]:bg-text group-data-[state=checked]:inset-ring-text"
      >
        <span className="size-1.5 rounded-full bg-bg opacity-0 group-data-[state=checked]:opacity-100" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[14.5px] leading-snug font-medium text-text">{title}</span>
          {badge}
        </span>
        {description ? (
          <span className="text-[13px] leading-snug text-muted">{description}</span>
        ) : null}
      </span>
    </RadioGroup.Item>
  );
}
