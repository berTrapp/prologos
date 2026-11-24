import { Check, Minus } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CheckboxProps = {
  label: ReactNode;
  checked: boolean | 'indeterminate';
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

/** 18 px box, checked in green with a dark check, 32 px hit area (ux-ui 13.11). */
export function Checkbox({ label, checked, onCheckedChange, disabled, className }: CheckboxProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex min-h-8 cursor-pointer items-center gap-2.5 pointer-coarse:min-h-11',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className={cn(
          'grid size-[18px] shrink-0 place-items-center rounded-badge bg-fill-subtle inset-ring inset-ring-stroke-strong',
          'transition-colors duration-(--duration-fast)',
          'data-[state=checked]:bg-success data-[state=checked]:inset-ring-success',
          'data-[state=indeterminate]:bg-success data-[state=indeterminate]:inset-ring-success',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        )}
      >
        <CheckboxPrimitive.Indicator className="text-bg">
          {checked === 'indeterminate' ? (
            <Minus aria-hidden className="size-3.5" strokeWidth={3} />
          ) : (
            <Check aria-hidden className="size-3.5" strokeWidth={3} />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span className="text-[13px] text-text">{label}</span>
    </label>
  );
}
