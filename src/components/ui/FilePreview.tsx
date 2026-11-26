import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FilePreviewProps = {
  name: string;
  /** "7 linhas", already translated. */
  meta?: ReactNode;
  content: string;
  /** "Copiar", on the right of the header. */
  action?: ReactNode;
  /** Accessible name of the scrolling area. */
  label: string;
  className?: string;
};

/** Read-only preview of a generated file: header, then mono text that scrolls (ux-ui 13.28). */
export function FilePreview({ name, meta, content, action, label, className }: FilePreviewProps) {
  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="flex min-h-12 items-center gap-3 border-b border-border px-5">
        <span className="min-w-0 truncate font-mono text-[13px] text-text">{name}</span>
        {meta ? <span className="shrink-0 font-mono text-[12px] text-faint">{meta}</span> : null}
        {action ? <span className="ml-auto shrink-0">{action}</span> : null}
      </div>
      <pre
        // A scrolling region takes focus so the keyboard can scroll it (ux-ui 9).
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="region"
        aria-label={label}
        className="m-0 min-h-0 flex-1 overflow-auto bg-textarea px-6 py-5 font-mono text-[12.5px] leading-[1.7] text-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        {content}
      </pre>
    </div>
  );
}
