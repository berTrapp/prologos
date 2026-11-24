import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { Toast, type ToastAction } from '@/components/ui/Toast';
import { toastDuration, type ToastVariant } from './toast-timing';

type NotifyOptions = { description?: ReactNode; action?: ToastAction; id?: string | number };

/** Ids on screen, oldest first; Esc closes the newest. */
const visible: (string | number)[] = [];
const forget = (id: string | number) => {
  const index = visible.indexOf(id);
  if (index >= 0) visible.splice(index, 1);
};

function show(variant: ToastVariant, title: ReactNode, options: NotifyOptions = {}) {
  const duration = toastDuration(variant, Boolean(options.action));
  const id = options.id ?? crypto.randomUUID();
  forget(id);
  visible.push(id);
  toast.custom(
    () => (
      <Toast
        variant={variant}
        title={title}
        description={options.description}
        action={options.action}
        duration={duration}
        onDismiss={() => toast.dismiss(id)}
      />
    ),
    {
      id,
      duration,
      onDismiss: () => forget(id),
      onAutoClose: () => forget(id),
    },
  );
  return id;
}

/**
 * The only way to show a toast (ux-ui 13.12, 14).
 * A loading toast turns into success or error in place: pass its id back.
 */
export const notify = {
  success: (title: ReactNode, options?: NotifyOptions) => show('success', title, options),
  error: (title: ReactNode, options?: NotifyOptions) => show('error', title, options),
  warning: (title: ReactNode, options?: NotifyOptions) => show('warning', title, options),
  loading: (title: ReactNode, options?: NotifyOptions) => show('loading', title, options),
  dismiss: (id?: string | number) => (id === undefined ? toast.dismiss() : toast.dismiss(id)),
  dismissNewest: () => {
    const id = visible.at(-1);
    if (id === undefined) return false;
    toast.dismiss(id);
    forget(id);
    return true;
  },
};
