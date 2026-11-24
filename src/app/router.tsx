import { createBrowserRouter, type RouteObject } from 'react-router';
import { HomeRoute } from './routes/HomeRoute';

const routes: RouteObject[] = [{ path: '/', element: <HomeRoute /> }];

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
