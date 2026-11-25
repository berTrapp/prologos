import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useParams } from 'react-router';
import { projectStore, useProject, workspaceStore } from '@/app/services';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { MapLoader } from '@/components/ui/MapLoader';

/** Opens the project in the store while its pages are on screen. */
export function ProjectLayout() {
  const { t } = useTranslation();
  const { projectId = '' } = useParams();
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');
  const openId = useProject((s) => s.snapshot?.project.id);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (projectStore.getState().snapshot?.project.id === projectId) {
        setState('ready');
      } else {
        setState('loading');
        const found = await projectStore.getState().open(projectId);
        if (cancelled) return;
        setState(found ? 'ready' : 'missing');
      }
      if (!cancelled) await workspaceStore.getState().markOpened(projectId);
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (state === 'missing' || (state === 'ready' && openId !== projectId)) {
    return (
      <div className="pt-10">
        <EmptyState
          variant="error"
          title={t('projectPage.notFoundTitle')}
          description={t('projectPage.notFoundBody')}
          actions={
            <>
              <Button asChild>
                <Link to="/lixeira">{t('projectPage.goTrash')}</Link>
              </Button>
              <Button asChild>
                <Link to="/">{t('projectPage.goHome')}</Link>
              </Button>
            </>
          }
        />
      </div>
    );
  }
  // ux-ui 15: under 0.4 s nothing shows; a heavier map gets the mini-map loader.
  if (state === 'loading')
    return (
      <div className="grid min-h-[60dvh] place-items-center">
        <MapLoader />
      </div>
    );

  return <Outlet />;
}
