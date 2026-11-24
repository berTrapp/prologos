import { X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { IconButton } from './IconButton';

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Large dialogs use radius 20 (ux-ui 4). */
  size?: 'default' | 'large';
  footer?: ReactNode;
  children?: ReactNode;
};

export const DialogTrigger = DialogPrimitive.Trigger;

/** Centered dialog on a 60% scrim; Esc closes (ux-ui 13.10). */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  size = 'default',
  footer,
  children,
}: DialogProps) {
  const { t } = useTranslation();
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-scrim data-[state=closed]:animate-[fade-out_var(--duration-fast)_ease-in] data-[state=open]:animate-[fade-in_var(--duration-base)_var(--ease-out)]" />
        <DialogPrimitive.Content
          className={cn(
            'surface-raised fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col inset-ring inset-ring-stroke-strong',
            size === 'large' ? 'max-w-[640px] rounded-sheet' : 'max-w-[440px] rounded-card',
            'data-[state=closed]:animate-[dialog-out_var(--duration-fast)_ease-in] data-[state=open]:animate-[dialog-in_var(--duration-base)_var(--ease-out)]',
            'focus-visible:outline-none',
          )}
        >
          <div className="flex items-start justify-between gap-4 px-5 pt-5">
            <div className="flex flex-col gap-1">
              <DialogPrimitive.Title className="text-[16px] font-semibold text-text">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="text-[13px] text-muted">
                  {description}
                </DialogPrimitive.Description>
              ) : (
                <DialogPrimitive.Description className="sr-only">
                  {title}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <IconButton label={t('ui.close')} icon={<X />} className="-mt-1 -mr-2" />
            </DialogPrimitive.Close>
          </div>
          {children ? (
            <div className="min-h-0 overflow-y-auto px-5 pt-4 pb-5">{children}</div>
          ) : null}
          {footer ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
