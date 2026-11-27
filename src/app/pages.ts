/** Each screen's code, loaded on first visit or ahead of time by `preloadPages`. */
export const pages = {
  home: () => import('@/features/home/HomePage'),
  newProject: () => import('@/features/new-project/NewProjectPage'),
  project: () => import('@/features/project/ProjectLayout'),
  map: () => import('@/features/map/MapPage'),
  checklist: () => import('@/features/checklist/ChecklistPage'),
  variables: () => import('@/features/variables/VariablesPage'),
  importEnv: () => import('@/features/variables/ImportEnvPage'),
  ready: () => import('@/features/export/ReadyPage'),
  export: () => import('@/features/export/ExportPage'),
  trash: () => import('@/features/trash/TrashPage'),
  settings: () => import('@/features/settings/SettingsPage'),
};

/**
 * Loads every screen while the browser is idle, so moving between them never waits on
 * the network (ux-ui 15: changing screens shows nothing beyond the pressed state).
 */
export function preloadPages() {
  for (const load of Object.values(pages)) void load().catch(() => undefined);
}
