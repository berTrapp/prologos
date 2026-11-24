import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router';
import { useWorkspace } from '@/app/services';
import { isInMainList } from '@/domain/rules/project';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { usePersistentState } from '@/hooks/usePersistentState';
import { MobileTabBar } from './MobileTabBar';
import { MoreSheet } from './MoreSheet';
import { Sidebar } from './Sidebar';

/** Layout of every screen except the home: sidebar on desktop and tablet, tabs on the phone. */
export function AppShell() {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();
  const { projectId } = useParams();
  const lastOpened = useWorkspace((s) => s.settings.lastOpenedProjectId);
  const projects = useWorkspace((s) => s.projects);
  const currentId = projectId ?? lastOpened;
  // Falls back to the most recent active project when the last one opened is gone.
  const project =
    projects.find((p) => p.project.id === currentId)?.project ??
    (projectId ? undefined : projects.find((p) => isInMainList(p.project))?.project);

  // ux-ui 10, 12: remembered; on a tablet it starts collapsed.
  const [collapsed, setCollapsed] = usePersistentState(
    'prologos.sidebarCollapsed',
    () => breakpoint === 'tablet',
  );
  const [moreOpen, setMoreOpen] = useState(false);
  const phone = breakpoint === 'phone';

  return (
    <div className="flex min-h-dvh bg-bg">
      <a
        href="#content"
        className="sr-only z-50 rounded-control bg-primary px-3 py-2 text-primary-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('nav.skipToContent')}
      </a>
      {phone ? null : (
        <div className="sticky top-0 h-dvh">
          <Sidebar project={project} collapsed={collapsed} onCollapsedChange={setCollapsed} />
        </div>
      )}
      <main id="content" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
        <div
          className={
            phone ? (project ? 'px-4 pb-24' : 'px-4 pb-8') : 'mx-auto max-w-5xl px-10 py-12'
          }
        >
          <Outlet />
        </div>
      </main>
      {phone && project ? (
        <>
          <MobileTabBar projectId={project.id} onMore={() => setMoreOpen(true)} />
          <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
        </>
      ) : null}
    </div>
  );
}
