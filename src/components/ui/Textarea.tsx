import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { fieldClasses } from '@/lib/field-classes';
import { FieldFrame } from './Input';

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  mono?: boolean;
  id?: string;
};

/** Multi-line field, radius 12 (ux-ui 13.11). */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, mono, id, className, rows = 4, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldFrame id={fieldId} label={label} hint={hint} error={error} className={className}>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(
          fieldClasses,
          'resize-y rounded-inner bg-textarea px-3 py-2.5 text-[13.5px] leading-relaxed pointer-coarse:text-[16px]',
          mono && 'font-mono text-[12.5px]',
        )}
        {...props}
      />
    </FieldFrame>
  );
});
