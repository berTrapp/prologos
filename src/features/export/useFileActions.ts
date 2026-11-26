import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { notify } from '@/lib/notify';

/**
 * Generating takes from a moment to a second or two: the button shows it is working and
 * the toast confirms the download, which does not show on screen (ux-ui 14, 15).
 */
export function useFileActions() {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const download = async (name: string, run: () => Promise<string>) => {
    if (busy) return;
    setBusy(true);
    try {
      const saved = await run();
      notify.success(t('export.toast.downloaded', { name: saved }));
    } catch {
      notify.error(t('export.toast.failed', { name }), {
        description: t('export.toast.failedBody'),
        action: { label: t('export.toast.retry'), onClick: () => void download(name, run) },
      });
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify.success(t('export.toast.copied'));
    } catch {
      notify.error(t('export.toast.copyFailed'), { description: t('export.toast.copyFailedBody') });
    }
  };

  return { busy, download, copy };
}
