import type { ReactNode } from 'react';

/** A titled group in the details panel. */
export function DetailsSection({
  title,
  hint,
  children,
}: {
  title: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[13px] font-semibold text-text">{title}</h3>
        {hint ? <p className="text-[12.5px] text-muted">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}
