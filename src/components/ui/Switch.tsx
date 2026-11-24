import { Switch as SwitchPrimitive } from 'radix-ui';
import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SwitchProps = {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

/** 34 × 20 px switch, on in green; label on the left and the whole row is clickable (ux-ui 13.11). */
export function Switch({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: SwitchProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex min-h-8 cursor-pointer items-center justify-between gap-4 pointer-coarse:min-h-11',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span className="flex flex-col">
        <span className="text-[13px] text-text">{label}</span>
        {description ? <span className="text-[12px] text-muted">{description}</span> : null}
      </span>
      <SwitchPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'relative h-5 w-[34px] shrink-0 rounded-full bg-switch-off transition-colors duration-(--duration-fast)',
          'data-[state=checked]:bg-switch-on',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'block size-4 translate-x-0.5 rounded-full bg-knob shadow-segment',
            'transition-transform duration-(--duration-fast) ease-(--ease-out) data-[state=checked]:translate-x-4',
          )}
        />
      </SwitchPrimitive.Root>
    </label>
  );
}
