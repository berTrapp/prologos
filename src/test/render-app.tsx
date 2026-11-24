import { act, render } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { projectStore, repository, workspaceStore } from '@/app/services';
import { routes } from '@/app/router';
import { Toaster } from '@/components/ui/Toaster';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { useUi } from '@/features/shell/ui-store';

/** Clears everything the app keeps in this (fake) browser. */
export async function resetAppData() {
  await projectStore.getState().close();
  for (const project of await repository.listProjects()) await repository.deleteProject(project.id);
  await repository.emptyTrash();
  await repository.setMeta('settings', { backupReminder: true, dataNoticeSeen: true });
  localStorage.clear();
  useUi.setState({ paletteOpen: false, newProjectOpen: false });
}

/** Renders the real app (routes, stores, Dexie on fake IndexedDB) at a path. */
export async function renderApp(path = '/') {
  await act(() => workspaceStore.getState().init());
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const utils = render(
    <TooltipProvider>
      <RouterProvider router={router} />
      <Toaster />
    </TooltipProvider>,
  );
  return { ...utils, router };
}
