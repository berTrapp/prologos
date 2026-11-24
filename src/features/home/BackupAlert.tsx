import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNow } from '@/hooks/useNow';
import { useWorkspace, workspaceStore } from '@/app/services';
import { Button } from '@/components/ui/Button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { isBackupReminderDue } from '@/domain/rules/backup';
import { exportBackupFile } from '@/features/projects/backup-actions';
import { formatRelative } from '@/lib/format';

/** RN 18: inline alert on the home when the last backup is older than 7 days. */
export function BackupAlert() {
  const { t, i18n } = useTranslation();
  const settings = useWorkspace((s) => s.settings);
  const projectCount = useWorkspace((s) => s.projects.length);
  const now = useNow();

  const due = isBackupReminderDue({
    enabled: settings.backupReminder,
    projectCount,
    lastBackupAt: settings.lastBackupAt,
    snoozedUntil: settings.snoozedUntil,
    now,
  });
  if (!due) return null;

  return (
    <InlineAlert
      variant="warning"
      title={
        settings.lastBackupAt === undefined
          ? t('backupAlert.neverTitle')
          : t('backupAlert.title', {
              time: formatRelative(settings.lastBackupAt, now, i18n.language),
            })
      }
      actions={
        <>
          <Button size="compact" onClick={() => void workspaceStore.getState().snoozeBackup()}>
            {t('backupAlert.later')}
          </Button>
          <Button size="compact" icon={<Download />} onClick={() => void exportBackupFile()}>
            {t('backupAlert.exportNow')}
          </Button>
        </>
      }
    >
      {t('backupAlert.body')}
    </InlineAlert>
  );
}
