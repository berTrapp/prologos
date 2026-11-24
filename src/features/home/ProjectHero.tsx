import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { StatusDot } from '@/components/ui/StatusDot';
import { ZoneTag } from '@/components/ui/ZoneTag';
import type { ProjectSummary } from '@/data/workspace-store';
import { formatRelative } from '@/lib/format';
import { STATUS_TONE } from '@/lib/project-status';
import { ZonePreview } from './ZonePreview';

/** Highlight of the last opened project (inicio.png). */
export function ProjectHero({ summary, now }: { summary: ProjectSummary; now: number }) {
  const { t, i18n } = useTranslation();
  const { project, counts, zones, zoneColors } = summary;
  const stats = [
    [counts.zones, t('home.stats.zones')],
    [counts.items, t('home.stats.items')],
    [counts.flows, t('home.stats.flows')],
  ] as const;

  return (
    <section className="surface grid overflow-hidden rounded-card inset-ring inset-ring-border md:grid-cols-[1.5fr_1fr]">
      <ZonePreview
        colors={zoneColors}
        label={t('home.preview', { name: project.name })}
        className="min-h-56 border-b border-border md:border-r md:border-b-0"
      />
      <div className="flex flex-col gap-4 p-6">
        <p className="flex flex-wrap items-center gap-3 text-[12.5px] text-muted">
          <StatusDot tone={STATUS_TONE[project.status]}>
            {t(`status.project.${project.status}`)}
          </StatusDot>
          {t('home.editedAgo', { time: formatRelative(project.updatedAt, now, i18n.language) })}
        </p>
        <div className="flex flex-col gap-2">
          <h2 className="text-[26px] leading-tight font-semibold tracking-tight text-text">
            {project.name}
          </h2>
          {project.goal ? <p className="text-[14.5px] text-muted">{project.goal}</p> : null}
        </div>
        <dl className="grid grid-cols-3 gap-3 border-y border-border py-4">
          {stats.map(([value, label]) => (
            <div key={label} className="flex flex-col-reverse gap-0.5">
              <dt className="text-[12px] text-muted">{label}</dt>
              <dd className="text-[24px] leading-none font-semibold text-text tabular-nums">
                {value.toLocaleString(i18n.language)}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {zones.map((zone, index) => (
            <ZoneTag key={`${zone.color}-${index}`} zone={zone.color} label={zone.name} />
          ))}
        </div>
        <Link
          to={`/p/${project.id}`}
          className="mt-auto inline-flex w-fit items-center gap-2 rounded-control text-[13.5px] font-semibold text-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t('home.openMap')}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </section>
  );
}
