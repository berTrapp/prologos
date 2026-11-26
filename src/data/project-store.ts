import { applyPatches, enablePatches, produceWithPatches, type Draft, type Patch } from 'immer';
import { createStore } from 'zustand/vanilla';
import { AUTO_VERSION_IDLE_MS, shouldCreateAutoVersion } from '@/domain/rules/history';
import {
  removeConnection,
  removeItem,
  removeZone,
  restore,
  type Removal,
} from '@/domain/rules/map';
import { removeEnvVar } from '@/domain/rules/env';
import type { TrashEntry, TrashKind } from '@/domain/schemas/history';
import type { ProjectSnapshot } from '@/domain/schemas/snapshot';
import { emptyUndo, pushUndo, takeRedo, takeUndo, type UndoStack } from '@/domain/undo';
import type { ProjectRepository } from './repository';

enablePatches();

/** ux-ui 7: "Salvo neste navegador", "Salvando…", "Não foi possível salvar". */
export type SaveStatus = 'saved' | 'saving' | 'error';

/** One undoable change; a move to the trash keeps its entry so undo can take it back out. */
type Step = { patches: Patch[]; inverse: Patch[]; trash?: TrashEntry };
/** Edits the draft in place, or returns a whole new snapshot (from a domain rule). */
type Recipe = (draft: Draft<ProjectSnapshot>) => ProjectSnapshot | undefined;

export type ProjectState = {
  snapshot: ProjectSnapshot | null;
  saveStatus: SaveStatus;
  history: UndoStack<Step>;
  /** Last change made in this session. */
  lastEditAt: number | undefined;
};

export type ProjectActions = {
  open(projectId: string): Promise<boolean>;
  create(snapshot: ProjectSnapshot): Promise<void>;
  close(): Promise<void>;
  /** Every change goes through here: optimistic, undoable and saved automatically. */
  change(recipe: Recipe, trash?: TrashEntry): void;
  undo(): void;
  redo(): void;
  /** RN 1, 11: moves a zone, item or connection (with what goes along) to the trash. */
  moveToTrash(
    kind: Extract<TrashKind, 'zone' | 'item' | 'connection' | 'envVar'>,
    id: string,
    label: string,
  ): Promise<TrashEntry | undefined>;
  /** Desfazer from the toast, or Restaurar from the trash. */
  restoreFromTrash(entry: TrashEntry): Promise<string[]>;
  /** Saves now (leaving the page, closing the project). */
  flush(): Promise<void>;
};

export type ProjectStore = ReturnType<typeof createProjectStore>;

type Deps = {
  repo: ProjectRepository;
  now?: () => number;
  createId?: () => string;
  /** Debounce for the automatic save. */
  saveDelay?: number;
  onSaveError?: (error: unknown) => void;
};

const removers = {
  zone: removeZone,
  item: removeItem,
  connection: removeConnection,
  envVar: removeEnvVar,
} satisfies Record<string, (snapshot: ProjectSnapshot, id: string) => Removal>;

export function createProjectStore({
  repo,
  now = Date.now,
  createId = () => crypto.randomUUID(),
  saveDelay = 600,
  onSaveError,
}: Deps) {
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  let versionTimer: ReturnType<typeof setTimeout> | undefined;
  let lastSaved: ProjectSnapshot | null = null;
  let saving: Promise<void> | undefined;

  const store = createStore<ProjectState & ProjectActions>()((set, get) => {
    const clearTimers = () => {
      clearTimeout(saveTimer);
      clearTimeout(versionTimer);
      saveTimer = versionTimer = undefined;
    };

    const save = async (): Promise<void> => {
      clearTimeout(saveTimer);
      saveTimer = undefined;
      const { snapshot } = get();
      if (!snapshot || snapshot === lastSaved) return;
      set({ saveStatus: 'saving' });
      try {
        await repo.saveProject(snapshot);
        lastSaved = snapshot;
        // Changes made while writing are saved in the next round.
        if (get().snapshot !== snapshot) scheduleSave();
        else set({ saveStatus: 'saved' });
      } catch (error) {
        // ux-ui 7: optimistic change rolls back to the last saved state.
        set({ snapshot: lastSaved, saveStatus: 'error', history: emptyUndo() });
        onSaveError?.(error);
      }
    };

    const runSave = () => {
      saving = save().finally(() => (saving = undefined));
      return saving;
    };

    const scheduleSave = () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => void runSave(), saveDelay);
    };

    const createAutoVersion = async () => {
      const { snapshot, lastEditAt } = get();
      if (!snapshot || lastEditAt === undefined) return;
      const [last] = await repo.listVersions(snapshot.project.id);
      if (!shouldCreateAutoVersion({ lastEditAt, lastVersionAt: last?.createdAt, now: now() }))
        return;
      await (saving ?? runSave());
      await repo.addVersion({
        id: createId(),
        projectId: snapshot.project.id,
        kind: 'auto',
        createdAt: now(),
        snapshot,
      });
      await repo.pruneVersions(snapshot.project.id, now());
    };

    /** RN 8: a version is written when an editing session ends (30 min idle). */
    const scheduleVersion = () => {
      clearTimeout(versionTimer);
      versionTimer = setTimeout(() => void createAutoVersion(), AUTO_VERSION_IDLE_MS);
    };

    const commit = (next: ProjectSnapshot, step?: Step) => {
      set((state) => ({
        snapshot: next,
        history: step ? pushUndo(state.history, step) : state.history,
        lastEditAt: now(),
        saveStatus: state.saveStatus === 'error' ? 'saving' : state.saveStatus,
      }));
      scheduleSave();
      scheduleVersion();
    };

    return {
      snapshot: null,
      saveStatus: 'saved',
      history: emptyUndo(),
      lastEditAt: undefined,

      async open(projectId) {
        await get().close();
        const snapshot = await repo.loadProject(projectId);
        if (!snapshot) return false;
        lastSaved = snapshot;
        set({ snapshot, saveStatus: 'saved', history: emptyUndo(), lastEditAt: undefined });
        // RN 8: a session that ended with the tab closed still gets its version.
        const [last] = await repo.listVersions(projectId);
        const lastEditAt = snapshot.project.updatedAt;
        if (shouldCreateAutoVersion({ lastEditAt, lastVersionAt: last?.createdAt, now: now() })) {
          await repo.addVersion({
            id: createId(),
            projectId,
            kind: 'auto',
            createdAt: now(),
            snapshot,
          });
          await repo.pruneVersions(projectId, now());
        }
        return true;
      },

      async create(snapshot) {
        await get().close();
        await repo.saveProject(snapshot);
        lastSaved = snapshot;
        set({ snapshot, saveStatus: 'saved', history: emptyUndo(), lastEditAt: undefined });
      },

      async close() {
        await get().flush();
        clearTimers();
        lastSaved = null;
        set({ snapshot: null, history: emptyUndo(), lastEditAt: undefined, saveStatus: 'saved' });
      },

      change(recipe, trash) {
        const current = get().snapshot;
        if (!current) return;
        const [changed, patches, inverse] = produceWithPatches(current, recipe);
        if (patches.length === 0) return;
        const [next, stampPatches, stampInverse] = produceWithPatches(changed, (draft) => {
          draft.project.updatedAt = now();
        });
        commit(next, {
          patches: [...patches, ...stampPatches],
          inverse: [...stampInverse, ...inverse],
          trash,
        });
      },

      undo() {
        const { snapshot, history } = get();
        const step = snapshot && takeUndo(history);
        if (!snapshot || !step) return;
        set({ history: step.stack });
        commit(applyPatches(snapshot, step.entry.inverse));
        if (step.entry.trash) void repo.removeTrash(step.entry.trash.id);
      },

      redo() {
        const { snapshot, history } = get();
        const step = snapshot && takeRedo(history);
        if (!snapshot || !step) return;
        set({ history: step.stack });
        commit(applyPatches(snapshot, step.entry.patches));
        if (step.entry.trash) void repo.addTrash(step.entry.trash);
      },

      async moveToTrash(kind, id, label) {
        const snapshot = get().snapshot;
        if (!snapshot) return undefined;
        const { snapshot: next, removed } = removers[kind](snapshot, id);
        const entry: TrashEntry = {
          id: createId(),
          projectId: snapshot.project.id,
          kind,
          label,
          deletedAt: now(),
          payload: removed,
        };
        await repo.addTrash(entry);
        get().change(() => next, entry);
        return entry;
      },

      async restoreFromTrash(entry) {
        const snapshot = get().snapshot;
        if (!snapshot || entry.projectId !== snapshot.project.id) return [];
        const result = restore(snapshot, entry.payload);
        get().change(() => result.snapshot);
        await repo.removeTrash(entry.id);
        return result.skipped;
      },

      async flush() {
        if (saveTimer !== undefined) await runSave();
        else if (saving) await saving;
      },
    };
  });

  return store;
}
