import { createBrowserRouter, type RouteObject } from 'react-router';
import { AppShell } from '@/features/shell/AppShell';
import { RootLayout } from './RootLayout';

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/features/home/HomePage')).HomePage }),
      },
      {
        path: 'novo',
        lazy: async () => ({
          Component: (await import('@/features/new-project/NewProjectPage')).NewProjectPage,
        }),
      },
      {
        element: <AppShell />,
        children: [
          {
            path: 'p/:projectId',
            lazy: async () => ({
              Component: (await import('@/features/project/ProjectLayout')).ProjectLayout,
            }),
            children: [
              {
                index: true,
                // The map uses the whole area next to the sidebar.
                handle: { fullBleed: true },
                lazy: async () => ({
                  Component: (await import('@/features/map/MapPage')).MapPage,
                }),
              },
              {
                path: 'checklist',
                lazy: async () => ({
                  Component: (await import('@/features/checklist/ChecklistPage')).ChecklistPage,
                }),
              },
              {
                path: 'variaveis',
                lazy: async () => {
                  const { ProjectPlaceholderPage } =
                    await import('@/features/project/ProjectPlaceholderPage');
                  return { Component: () => <ProjectPlaceholderPage page="variables" /> };
                },
              },
            ],
          },
          {
            path: 'lixeira',
            lazy: async () => ({
              Component: (await import('@/features/trash/TrashPage')).TrashPage,
            }),
          },
          {
            path: 'configuracoes',
            lazy: async () => ({
              Component: (await import('@/features/settings/SettingsPage')).SettingsPage,
            }),
          },
        ],
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/features/home/HomePage')).HomePage }),
      },
    ],
  },
];

// Dev-only pages never reach the public build (the branch is removed by Vite).
if (import.meta.env.DEV) {
  routes.push({
    path: '/dev/componentes',
    lazy: async () => {
      const { ComponentsPage } = await import('@/features/dev/ComponentsPage');
      return { Component: ComponentsPage };
    },
  });
}

export const router = createBrowserRouter(routes);
