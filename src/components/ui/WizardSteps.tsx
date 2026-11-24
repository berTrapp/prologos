import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type WizardStep = { id: string; label: ReactNode; answer?: ReactNode };

type WizardStepListProps = {
  steps: readonly WizardStep[];
  current: number;
  /** Steps up to this index can be opened directly. */
  reachable: number;
  onSelect: (index: number) => void;
  label: string;
  className?: string;
};

/** Vertical list of a guided flow's steps, for the desktop (ux-ui 13.22). */
export function WizardStepList({
  steps,
  current,
  reachable,
  onSelect,
  label,
  className,
}: WizardStepListProps) {
  return (
    <nav aria-label={label} className={className}>
      <ol className="flex flex-col gap-1">
        {steps.map((step, index) => {
          const active = index === current;
          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={index > reachable}
                aria-current={active ? 'step' : undefined}
                onClick={() => onSelect(index)}
                className={cn(
                  'flex min-h-12 w-full items-center gap-3 rounded-track px-2.5 py-1.5 text-left',
                  'transition-colors duration-(--duration-fast) hover:bg-fill-subtle disabled:pointer-events-none',
                  'focus-visible:outline-2 focus-visible:outline-ring',
                  active && 'bg-fill-subtle',
                )}
              >
                <span
                  className={cn(
                    'grid size-[22px] shrink-0 place-items-center rounded-full font-mono text-[11.5px]',
                    active ? 'bg-text text-bg' : 'text-muted inset-ring inset-ring-stroke-strong',
                  )}
                >
                  {index + 1}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span
                    className={cn(
                      'text-[14px] leading-snug',
                      active ? 'font-semibold text-text' : 'text-muted',
                    )}
                  >
                    {step.label}
                  </span>
                  {step.answer ? (
                    <span className="truncate text-[12.5px] leading-snug text-muted">
                      {step.answer}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** One 4 px segment per step, for the phone and tablet (ux-ui 13.22). */
export function WizardStepBar({
  total,
  current,
  label,
  className,
}: {
  total: number;
  current: number;
  /** "Passo 2 de 5", read by screen readers. */
  label: string;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-1.5', className)}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          aria-hidden
          className={cn('h-1 flex-1 rounded-full', index <= current ? 'bg-text' : 'bg-fill-strong')}
        />
      ))}
    </div>
  );
}
