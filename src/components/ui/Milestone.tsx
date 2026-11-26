import { cn } from '@/lib/utils';

type MilestoneProps = {
  /** Steps of the milestone, in order ("Faltam 3", "Pronto"). */
  steps: readonly [string, string];
  /** Index of the step the project is at. */
  current: 0 | 1;
  /** What a screen reader hears ("Faltam 3 decisões essenciais"). */
  label: string;
  className?: string;
};

/** Where the project stands on a two-step milestone; looks segmented, never clickable (ux-ui 13.27). */
export function Milestone({ steps, current, label, className }: MilestoneProps) {
  return (
    <div
      role="status"
      className={cn(
        'inline-flex rounded-track bg-fill-subtle p-[3px] inset-ring inset-ring-border',
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      {steps.map((step, index) => (
        <span
          key={step}
          aria-hidden
          className={cn(
            'inline-flex h-8 flex-1 items-center justify-center rounded-control px-3 text-[13px] font-medium whitespace-nowrap pointer-coarse:h-11',
            index === current ? 'bg-fill-active text-text shadow-segment' : 'text-faint',
          )}
        >
          {step}
        </span>
      ))}
    </div>
  );
}
