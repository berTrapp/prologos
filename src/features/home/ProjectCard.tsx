import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { StatusDot } from '@/components/ui/StatusDot';
import type { ProjectSummary } from '@/data/workspace-store';
import { ProjectMenu } from '@/features/projects/ProjectMenu';
import { ProjectTile } from '@/features/shell/ProjectSwitcher';
import { formatRelative } from '@/lib/format';
import { STATUS_TONE } from '@/lib/project-status';
import { zoneBg } from '@/lib/zone-colors';
import { cn } from '@/lib/utils';
import { ZonePreview } from './ZonePreview';

/**
 * The whole card opens the project through its title link (stretched);
 * the menu is a sibling button, never nested in the link (ux-ui 13.9).
 */
export function ProjectCard({ summary, now }: { summary: ProjectSummary; now: number }) {
  const { t, i18n } = useTranslation();
  const { project, counts, zoneColors } = summary;

  return (
    <article className="surface group relative flex flex-col overflow-hidden rounded-card inset-ring inset-ring-border transition-shadow duration-(--duration-fast) focus-within:inset-ring-border-strong hover:inset-ring-border-strong">
      <ZonePreview
        colors={zoneColors}
        label={t('home.preview', { name: project.name })}
        className="h-36 border-b border-border"
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start gap-3">
          <h3 className="min-w-0 flex-1 text-[15px] leading-snug font-semibold text-text">
            <Link
              to={`/p/${project.id}`}
              className="after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
            >
              {project.name}
            </Link>
          </h3>
          <StatusDot tone={STATUS_TONE[project.status]} className="mt-0.5 shrink-0">
            {t(`status.project.${project.status}`)}
          </StatusDot>
        </div>
        {project.goal ? (
          <p className="line-clamp-2 text-[13.5px] text-muted">{project.goal}</p>
        ) : null}
        <div className="mt-auto flex items-center gap-3 border-t border-border pt-3 font-mono text-[11.5px] text-faint">
          <span aria-hidden className="flex gap-0.5">
            {zoneColors.slice(0, 3).map((color, i) => (
              <span key={i} className={cn('size-1.5 rounded-tag', zoneBg[color])} />
            ))}
          </span>
          <span className="flex-1 truncate">
            {t('home.itemCount', { count: counts.items })} ·{' '}
            {t('home.flowCount', { count: counts.flows })}
          </span>
          <span className="shrink-0">{formatRelative(project.updatedAt, now, i18n.language)}</span>
          <ProjectMenu project={project} className="-my-2 -mr-2" />
        </div>
      </div>
    </article>
  );
}

/** Phone row: tile, name, status and time (celular-inicio.png). */
export function ProjectRow({ summary, now }: { summary: ProjectSummary; now: number }) {
  const { t, i18n } = useTranslation();
  const { project } = summary;
  return (
    <li className="relative flex items-center gap-4 py-3">
      <ProjectTile project={project} size="lg" />
      <div className="min-w-0 flex-1">
        <Link
          to={`/p/${project.id}`}
          className="block truncate text-[16px] font-semibold text-text after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-inner focus-visible:after:outline-2 focus-visible:after:outline-ring"
        >
          {project.name}
        </Link>
        <StatusDot tone={STATUS_TONE[project.status]} className="text-[13px]">
          {t(`status.project.${project.status}`)} ·{' '}
          {formatRelative(project.updatedAt, now, i18n.language)}
        </StatusDot>
      </div>
      <ProjectMenu project={project} />
      <ChevronRight aria-hidden className="size-4 shrink-0 text-muted" />
    </li>
  );
}
