import { Archive, ArchiveRestore, Ellipsis, FolderOpen, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { IconButton } from '@/components/ui/IconButton';
import { Menu, MenuItem, MenuLabel, MenuRadioGroup, MenuSeparator } from '@/components/ui/Menu';
import type { Project, ProjectStatus } from '@/domain/schemas/project';
import { PICKABLE_STATUSES } from '@/lib/project-status';
import { cn } from '@/lib/utils';
import { useProjectActions } from './useProjectActions';

/** Project actions (ux-ui 13.18): status, archive and, apart, move to the trash. */
export function ProjectMenu({ project, className }: { project: Project; className?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const actions = useProjectActions();
  const archived = project.status === 'archived';

  return (
    <Menu
      trigger={
        <IconButton
          label={t('home.actions', { name: project.name })}
          icon={<Ellipsis />}
          className={cn('relative z-10', className)}
        />
      }
    >
      <MenuItem icon={<FolderOpen />} onSelect={() => navigate(`/p/${project.id}`)}>
        {t('projectMenu.open')}
      </MenuItem>
      {archived ? null : (
        <>
          <MenuSeparator />
          <MenuLabel>{t('projectMenu.status')}</MenuLabel>
          <MenuRadioGroup<ProjectStatus>
            value={project.status}
            onValueChange={(status) => void actions.changeStatus(project, status)}
            options={PICKABLE_STATUSES.map((status) => ({
              value: status,
              label: t(`status.project.${status}`),
            }))}
          />
        </>
      )}
      <MenuSeparator />
      {archived ? (
        <MenuItem icon={<ArchiveRestore />} onSelect={() => void actions.unarchive(project)}>
          {t('projectMenu.unarchive')}
        </MenuItem>
      ) : (
        <MenuItem icon={<Archive />} onSelect={() => void actions.archive(project)}>
          {t('projectMenu.archive')}
        </MenuItem>
      )}
      <MenuSeparator />
      <MenuItem icon={<Trash2 />} destructive onSelect={() => void actions.moveToTrash(project)}>
        {t('projectMenu.trash')}
      </MenuItem>
    </Menu>
  );
}
