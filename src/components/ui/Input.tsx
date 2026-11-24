import { CircleAlert } from 'lucide-react';
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { fieldClasses } from '@/lib/field-classes';
import { cn } from '@/lib/utils';

type FieldFrameProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Label always visible above; hint and error below (ux-ui 13.11). */
export function FieldFrame({ id, label, hint, error, children, className }: FieldFrameProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[12.5px] font-medium text-text">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-[12px] text-danger">
          <CircleAlert aria-hidden className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[12px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  mono?: boolean;
  id?: string;
};

/** Text field, 36 px (44 px with 16 px text on touch) (ux-ui 13.11). */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, mono, id, className, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldFrame id={fieldId} label={label} hint={hint} error={error} className={className}>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(
          fieldClasses,
          'h-9 rounded-control px-3 text-[13.5px] pointer-coarse:h-11 pointer-coarse:rounded-inner pointer-coarse:text-[16px]',
          mono && 'font-mono text-[13px]',
        )}
        {...props}
      />
    </FieldFrame>
  );
});
