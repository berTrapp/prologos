import { Tabs } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FileTabsProps = {
  /** Accessible name of the list ("Arquivos do repositório"). */
  label: string;
  files: readonly { path: string }[];
  value: string;
  onValueChange: (path: string) => void;
  /** The preview of the selected file. */
  children: ReactNode;
  className?: string;
};

/**
 * Generated files with the preview of the selected one (ux-ui 13.28): a column on the
 * left when the card is 560 px wide or more, a scrolling row of tabs when it is narrower.
 */
export function FileTabs({
  label,
  files,
  value,
  onValueChange,
  children,
  className,
}: FileTabsProps) {
  return (
    <div className={cn('@container min-h-0', className)}>
      <Tabs.Root
        value={value}
        onValueChange={onValueChange}
        orientation="vertical"
        className="flex min-h-0 flex-col @min-[560px]:flex-row"
      >
        <Tabs.List
          aria-label={label}
          className="flex shrink-0 gap-1 overflow-x-auto border-b border-border p-2 [scrollbar-width:none] @min-[560px]:w-52 @min-[560px]:flex-col @min-[560px]:overflow-visible @min-[560px]:border-r @min-[560px]:border-b-0"
        >
          {files.map((file) => (
            <Tabs.Trigger
              key={file.path}
              value={file.path}
              className={cn(
                'flex h-9 shrink-0 items-center rounded-control px-3 font-mono text-[13px] whitespace-nowrap text-muted pointer-coarse:h-11',
                'hover:text-text data-[state=active]:bg-fill-strong data-[state=active]:text-text',
                'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
              )}
            >
              {file.path}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value={value} className="min-w-0 flex-1 focus-visible:outline-none">
          {children}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
