import { Check } from 'lucide-react';

/** Resolved: a filled check; open: an empty ring. The shape changes, not only the color (ux-ui 13.25). */
export function DecisionMark({ resolved }: { resolved: boolean }) {
  return resolved ? (
    <span
      aria-hidden
      className="grid size-[18px] shrink-0 place-items-center rounded-full bg-success text-bg"
    >
      <Check className="size-3" strokeWidth={3} />
    </span>
  ) : (
    <span
      aria-hidden
      className="size-[18px] shrink-0 rounded-full inset-ring-[1.5px] inset-ring-stroke-strong"
    />
  );
}
