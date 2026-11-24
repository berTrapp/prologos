import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DevSectionProps = {
  index: number;
  title: ReactNode;
  children: ReactNode;
  className?: string;
};

export function DevSection({ index, title, children, className }: DevSectionProps) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <div>
        <p className="font-mono text-[11px] tracking-wider text-faint uppercase">
          {String(index).padStart(2, '0')}
        </p>
        <h2 className="text-[18px] font-semibold text-text">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function DevRow({ label, children }: { label?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <p className="font-mono text-[11px] tracking-wider text-faint uppercase">{label}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
