import { useTranslation } from 'react-i18next';
import { useWorkspace, workspaceStore } from '@/app/services';
import { Button } from '@/components/ui/Button';
import { InlineAlert } from '@/components/ui/InlineAlert';

/** RN 18: shown once, after the first project is created, until "Entendi". */
export function DataNotice() {
  const { t } = useTranslation();
  const seen = useWorkspace((s) => s.settings.dataNoticeSeen);
  if (seen) return null;
  return (
    <InlineAlert
      variant="info"
      className="mb-6"
      actions={
        <Button
          size="compact"
          onClick={() => void workspaceStore.getState().updateSettings({ dataNoticeSeen: true })}
        >
          {t('dataNotice.gotIt')}
        </Button>
      }
    >
      {t('dataNotice.body')}
    </InlineAlert>
  );
}
