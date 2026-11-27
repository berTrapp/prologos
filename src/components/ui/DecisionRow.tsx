import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { DecisionMark } from './DecisionMark';

type DecisionRowProps = {
  label: ReactNode;
  /** The choice when resolved ("Django Auth"), what is missing otherwise ("A decidir"). */
  detail?: ReactNode;
  resolved: boolean;
};

/** One essential decision: mark, label and detail on the right (ux-ui 13.26). */
export function DecisionRow({ label, detail, resolved }: DecisionRowProps) {
  return (
    <li className="flex min-h-12 items-center gap-3 border-t border-border py-2.5 first:border-t-0">
      <DecisionMark resolved={resolved} />
      <span className="min-w-0 flex-1 text-[14px] text-text">{label}</span>
      {detail ? (
        <span
          className={cn(
            // Wraps instead of cutting: the choice is the answer the row exists to show.
            'max-w-[55%] text-right text-[13px] leading-snug text-pretty break-words',
            resolved ? 'text-muted' : 'text-warning',
          )}
        >
          {detail}
        </span>
      ) : null}
    </li>
  );
}
