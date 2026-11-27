import { createBrowserRouter, type RouteObject } from 'react-router';
import { AppShell } from '@/features/shell/AppShell';
import { pages } from './pages';
import { RootLayout } from './RootLayout';

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await pages.home()).HomePage }),
      },
      {
        path: 'novo',
        lazy: async () => ({
          Component: (await pages.newProject()).NewProjectPage,
        }),
      },
      {
        element: <AppShell />,
        children: [
          {
            path: 'p/:projectId',
            lazy: async () => ({
              Component: (await pages.project()).ProjectLayout,
            }),
            children: [
              {
                index: true,
                // The map uses the whole area next to the sidebar.
                handle: { fullBleed: true },
                lazy: async () => ({
                  Component: (await pages.map()).MapPage,
                }),
              },
              {
                path: 'checklist',
                lazy: async () => ({
                  Component: (await pages.checklist()).ChecklistPage,
                }),
              },
              {
                path: 'variaveis',
                lazy: async () => ({
                  Component: (await pages.variables()).VariablesPage,
                }),
              },
              {
                path: 'variaveis/importar',
                lazy: async () => ({
                  Component: (await pages.importEnv()).ImportEnvPage,
                }),
              },
              {
                path: 'pronto',
                lazy: async () => ({
                  Component: (await pages.ready()).ReadyPage,
                }),
              },
              {
                path: 'exportar',
                lazy: async () => ({
                  Component: (await pages.export()).ExportPage,
                }),
              },
            ],
          },
          {
            path: 'lixeira',
            lazy: async () => ({
              Component: (await pages.trash()).TrashPage,
            }),
          },
          {
            path: 'configuracoes',
            lazy: async () => ({
              Component: (await pages.settings()).SettingsPage,
            }),
          },
        ],
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await pages.home()).HomePage }),
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
