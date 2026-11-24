import { useTranslation } from 'react-i18next';
import { workspaceStore } from '@/app/services';
import type { Project, ProjectStatus } from '@/domain/schemas/project';
import { notify } from '@/lib/notify';

/** Status, archive and trash with Desfazer in the toast (RN 4, 11; ux-ui 8, 14). */
export function useProjectActions() {
  const { t } = useTranslation();
  const workspace = () => workspaceStore.getState();

  const undoStatus = (projectId: string, previous: ProjectStatus | undefined) =>
    previous
      ? { label: t('toast.undo'), onClick: () => void workspace().setStatus(projectId, previous) }
      : undefined;

  return {
    async changeStatus(project: Project, status: ProjectStatus) {
      if (project.status === status) return;
      const previous = await workspace().setStatus(project.id, status);
      notify.success(t('toast.statusChanged', { status: t(`status.project.${status}`) }), {
        action: undoStatus(project.id, previous),
      });
    },

    async archive(project: Project) {
      const previous = await workspace().setStatus(project.id, 'archived');
      notify.success(t('toast.archived'), { action: undoStatus(project.id, previous) });
    },

    async unarchive(project: Project) {
      const previous = await workspace().setStatus(project.id, 'planning');
      notify.success(t('toast.unarchived'), { action: undoStatus(project.id, previous) });
    },

    async moveToTrash(project: Project) {
      const entry = await workspace().moveProjectToTrash(project.id);
      if (!entry) return;
      notify.success(t('toast.trashed'), {
        action: { label: t('toast.undo'), onClick: () => void workspace().restoreTrash(entry) },
      });
    },
  };
}
