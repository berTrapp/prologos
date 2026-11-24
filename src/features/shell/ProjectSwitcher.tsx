import { ChevronsUpDown, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useWorkspace } from '@/app/services';
import { Menu, MenuItem, MenuLabel, MenuSeparator } from '@/components/ui/Menu';
import { StatusDot } from '@/components/ui/StatusDot';
import { Tooltip } from '@/components/ui/Tooltip';
import { isInMainList } from '@/domain/rules/project';
import type { Project } from '@/domain/schemas/project';
import { STATUS_TONE, projectColor } from '@/lib/project-status';
import { zoneText, zoneTint } from '@/lib/zone-colors';
import { cn } from '@/lib/utils';
import { useUi } from './ui-store';

export function ProjectTile({
  project,
  size = 'sm',
}: {
  project: Pick<Project, 'id' | 'name'>;
  size?: 'xs' | 'sm' | 'lg';
}) {
  const color = projectColor(project.id);
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center font-semibold uppercase inset-ring inset-ring-border',
        zoneTint[color],
        zoneText[color],
        size === 'xs' && 'size-5 rounded-badge text-[10.5px]',
        size === 'sm' && 'size-8 rounded-control text-[13px]',
        size === 'lg' && 'size-12 rounded-inner text-[17px]',
      )}
    >
      {project.name.trim().charAt(0)}
    </span>
  );
}

/** Current project at the top of the sidebar; opens the list of projects. */
export function ProjectSwitcher({
  project,
  collapsed,
}: {
  project: Project | undefined;
  collapsed: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const projects = useWorkspace((s) => s.projects);
  const openNewProject = useUi((s) => s.setNewProjectOpen);

  const trigger = (
    <button
      type="button"
      aria-label={t('nav.switchProject')}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-track bg-fill-subtle p-1.5 text-left inset-ring inset-ring-border',
        'transition-colors duration-(--duration-fast) hover:bg-fill focus-visible:outline-2 focus-visible:outline-ring',
        collapsed && 'justify-center bg-transparent p-1 inset-ring-0',
      )}
    >
      {project ? (
        <ProjectTile project={project} />
      ) : (
        <span className="grid size-8 place-items-center rounded-control text-muted inset-ring inset-ring-border">
          ?
        </span>
      )}
      {collapsed ? null : (
        <>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-semibold text-text">
              {project?.name ?? t('nav.noProject')}
            </span>
            {project ? (
              <StatusDot tone={STATUS_TONE[project.status]} className="text-[11.5px]">
                {t(`status.project.${project.status}`)}
              </StatusDot>
            ) : null}
          </span>
          <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-muted" />
        </>
      )}
    </button>
  );

  return (
    <Menu
      align="start"
      side={collapsed ? 'right' : 'bottom'}
      trigger={
        collapsed ? (
          <Tooltip content={t('nav.switchProject')} side="right">
            {trigger}
          </Tooltip>
        ) : (
          trigger
        )
      }
    >
      <MenuLabel>{t('nav.allProjects')}</MenuLabel>
      {projects
        .filter((s) => isInMainList(s.project))
        .map(({ project: p }) => (
          <MenuItem
            key={p.id}
            icon={<ProjectTile project={p} size="xs" />}
            onSelect={() => navigate(`/p/${p.id}`)}
          >
            <span className="truncate">{p.name}</span>
          </MenuItem>
        ))}
      <MenuSeparator />
      <MenuItem icon={<Plus />} onSelect={() => openNewProject(true)}>
        {t('nav.newProject')}
      </MenuItem>
    </Menu>
  );
}
