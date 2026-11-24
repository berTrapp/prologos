import { workspaceStore } from '@/app/services';
import i18n from '@/i18n';
import { downloadText } from '@/lib/download';
import { notify } from '@/lib/notify';

/** RN 10, 18: prologos.json with every project, never a secret value. */
export async function exportBackupFile() {
  const { json, count } = await workspaceStore.getState().exportBackup();
  downloadText('prologos.json', json);
  // ux-ui 14: the download does not show on screen, so it gets a toast.
  notify.success(i18n.t('toast.backupSaved', { count }));
}
