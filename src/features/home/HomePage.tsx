import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNow } from '@/hooks/useNow';
import { useWorkspace } from '@/app/services';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { filterProjects } from '@/domain/rules/project';
import { useUi } from '@/features/shell/ui-store';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { usePersistentState } from '@/hooks/usePersistentState';
import { dayPeriod, formatLongDate } from '@/lib/format';
import { BackupAlert } from './BackupAlert';
import { HomeTopBar } from './HomeTopBar';
import { ProjectCard, ProjectRow } from './ProjectCard';
import { ProjectHero } from './ProjectHero';

const FILTERS = ['all', 'planning', 'developing', 'paused'] as const;
type Filter = (typeof FILTERS)[number];

/** Home: projects with status, filter, empty invitation and backup reminder (RN 4, 18). */
export function HomePage() {
  const { t, i18n } = useTranslation();
  const phone = useBreakpoint() === 'phone';
  const openNewProject = useUi((s) => s.setNewProjectOpen);
  const summaries = useWorkspace((s) => s.projects);
  const lastOpened = useWorkspace((s) => s.settings.lastOpenedProjectId);
  const [filter, setFilter] = usePersistentState<Filter>('prologos.homeFilter', 'all');
  const [showArchived, setShowArchived] = useState(false);
  const now = useNow();

  const active = filterProjects(
    summaries.map((s) => ({ ...s, status: s.project.status })),
    'all',
  );
  const archived = summaries.filter((s) => s.project.status === 'archived');
  const visible = showArchived
    ? archived
    : filter === 'all'
      ? active
      : active.filter((s) => s.status === filter);
  const hero = active.find((s) => s.project.id === lastOpened) ?? active[0];

  const newProject = (
    <Button variant="primary" icon={<Plus />} onClick={() => openNewProject(true)}>
      {t('nav.newProject')}
    </Button>
  );

  return (
    <div className="min-h-dvh bg-bg">
      <HomeTopBar />
      <main
        id="content"
        className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-8 pb-28 sm:px-8 sm:pt-14 sm:pb-16"
      >
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[11.5px] tracking-wider text-faint uppercase">
              {formatLongDate(now, i18n.language)}
            </p>
            <h1 className="text-[32px] leading-tight font-semibold tracking-tight text-text sm:text-[40px]">
              {t(`home.greeting.${dayPeriod(new Date(now).getHours())}`)}
            </h1>
            <p className="text-[15px] text-muted">{t('home.subtitle')}</p>
          </div>
          {phone ? null : newProject}
        </header>

        <BackupAlert />

        {summaries.length === 0 ? (
          <div className="surface rounded-card inset-ring inset-ring-border">
            <EmptyState
              icon={<Plus />}
              title={t('home.emptyTitle')}
              description={t('home.emptyBody')}
            />
          </div>
        ) : (
          <>
            {hero && !showArchived ? <ProjectHero summary={hero} now={now} /> : null}

            <section className="flex flex-col gap-4" aria-labelledby="all-projects">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="all-projects" className="text-[17px] font-semibold text-text">
                  {showArchived ? t('home.archivedTitle') : t('home.allProjects')}
                </h2>
                {phone || showArchived ? null : (
                  <SegmentedControl<Filter>
                    label={t('home.filterLabel')}
                    value={filter}
                    onValueChange={setFilter}
                    options={FILTERS.map((value) => ({ value, label: t(`home.filter.${value}`) }))}
                  />
                )}
              </div>

              {visible.length === 0 ? (
                <div className="rounded-card inset-ring inset-ring-border">
                  <EmptyState
                    title={t('home.emptyFilterTitle')}
                    description={t('home.emptyFilterBody')}
                    actions={<Button onClick={() => setFilter('all')}>{t('home.showAll')}</Button>}
                  />
                </div>
              ) : phone ? (
                <ul className="flex flex-col">
                  {visible.map((summary) => (
                    <ProjectRow key={summary.project.id} summary={summary} now={now} />
                  ))}
                </ul>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {visible.map((summary) => (
                    <ProjectCard key={summary.project.id} summary={summary} now={now} />
                  ))}
                  {showArchived ? null : (
                    <button
                      type="button"
                      onClick={() => openNewProject(true)}
                      className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-strong p-8 text-center transition-colors duration-(--duration-fast) hover:bg-fill-subtle focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span className="grid size-11 place-items-center rounded-full text-text inset-ring inset-ring-stroke-strong">
                        <Plus aria-hidden className="size-4" />
                      </span>
                      <span className="text-[15px] font-semibold text-text">
                        {t('home.startTitle')}
                      </span>
                      <span className="max-w-64 text-[13px] text-muted">{t('home.startBody')}</span>
                    </button>
                  )}
                </div>
              )}

              {archived.length > 0 || showArchived ? (
                <div>
                  <Button variant="quiet" size="compact" onClick={() => setShowArchived((v) => !v)}>
                    {showArchived
                      ? t('home.hideArchived')
                      : t('home.showArchived', { count: archived.length })}
                  </Button>
                </div>
              ) : null}
            </section>
          </>
        )}
      </main>
      {phone ? (
        <div className="fixed right-4 bottom-[calc(16px+env(safe-area-inset-bottom))] z-20">
          <Button
            variant="primary"
            size="touch"
            icon={<Plus />}
            onClick={() => openNewProject(true)}
            className="shadow-raised"
          >
            {t('nav.newProject')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
