import { useEffect, type CSSProperties } from 'react';
import { Toaster as SonnerToaster } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { notify } from '@/lib/notify';
import { MAX_VISIBLE_TOASTS } from '@/lib/toast-timing';

/**
 * Toast region: bottom right on desktop, top on phones, at most 3 (ux-ui 13.12).
 * Mount once at the app root.
 */
export function Toaster() {
  const isPhone = useMediaQuery('(max-width: 759px)');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      // Dialogs, sheets and popovers own Esc while they are open.
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;
      if (notify.dismissNewest()) event.preventDefault();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <SonnerToaster
      position={isPhone ? 'top-center' : 'bottom-right'}
      visibleToasts={MAX_VISIBLE_TOASTS}
      expand
      gap={8}
      offset={20}
      mobileOffset={10}
      style={{ '--width': '380px' } as CSSProperties}
      toastOptions={{ unstyled: true, className: 'prologos-toast' }}
    />
  );
}
