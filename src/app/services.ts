import { useStore } from 'zustand';
import { DexieProjectRepository } from '@/data/dexie-repository';
import { createProjectStore, type ProjectActions, type ProjectState } from '@/data/project-store';
import { createWorkspaceStore } from '@/data/workspace-store';
import i18n from '@/i18n';
import { notify } from '@/lib/notify';

/** The app's single repository and stores (RN 18: everything lives in this browser). */
export const repository = new DexieProjectRepository();

export const projectStore = createProjectStore({
  repo: repository,
  // ux-ui 14: a failed save is a sticky error that says what happens to the changes.
  onSaveError: () =>
    notify.error(i18n.t('save.errorTitle'), { description: i18n.t('save.errorBody') }),
});

export const workspaceStore = createWorkspaceStore({ repo: repository, projectStore });

type WorkspaceState = ReturnType<typeof workspaceStore.getState>;

export function useWorkspace<T>(selector: (state: WorkspaceState) => T): T {
  return useStore(workspaceStore, selector);
}

export function useProject<T>(selector: (state: ProjectState & ProjectActions) => T): T {
  return useStore(projectStore, selector);
}

/** RN 18: asks the browser not to clear our storage on its own. */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

// Leaving the page saves what is pending (ux-ui 7).
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => void projectStore.getState().flush());
}
