import { createStore } from 'zustand/vanilla';
import {
  copyProject,
  createBackup,
  findImportConflicts,
  parseBackup,
  snoozeBackupReminder,
  type Backup,
  type ParsedBackup,
} from '@/domain/rules/backup';
import { restore } from '@/domain/rules/map';
import { createProjectSnapshot } from '@/domain/rules/project';
import type { TrashEntry } from '@/domain/schemas/history';
import type { Project, ProjectStatus, ProjectType } from '@/domain/schemas/project';
import { ProjectSnapshotSchema, type ProjectSnapshot } from '@/domain/schemas/snapshot';
import type { ZoneColor } from '@/domain/zones';
import type { ProjectRepository } from './repository';
import type { ProjectStore } from './project-store';

/** What the home and the navigation need to know about each project. */
export type ProjectSummary = {
  project: Project;
  zoneColors: ZoneColor[];
  counts: { zones: number; items: number; flows: number };
};

export type Settings = {
  backupReminder: boolean;
  lastBackupAt?: number;
  lastBackupCount?: number;
  snoozedUntil?: number;
  lastOpenedProjectId?: string;
  /** RN 18: the one-time notice shown when the first project is created. */
  dataNoticeSeen?: boolean;
};

const DEFAULT_SETTINGS: Settings = { backupReminder: true };
const SETTINGS_KEY = 'settings';

export type ImportChoice = 'replace' | 'copy';

type Deps = {
  repo: ProjectRepository;
  /** The open project, so trash and status changes stay in sync with it. */
  projectStore?: ProjectStore;
  now?: () => number;
  createId?: () => string;
};

function summarize(snapshot: ProjectSnapshot): ProjectSummary {
  const topZones = snapshot.zones
    .filter((zone) => zone.parentId === null)
    .sort((a, b) => a.order - b.order);
  return {
    project: snapshot.project,
    zoneColors: topZones.map((zone) => zone.color),
    counts: { zones: topZones.length, items: snapshot.items.length, flows: snapshot.flows.length },
  };
}

export function createWorkspaceStore({
  repo,
  projectStore,
  now = Date.now,
  createId = () => crypto.randomUUID(),
}: Deps) {
  return createStore<{
    ready: boolean;
    projects: ProjectSummary[];
    trash: TrashEntry[];
    settings: Settings;
    init(): Promise<void>;
    refresh(): Promise<void>;
    createProject(input: { name: string; type: ProjectType; goal?: string }): Promise<string>;
    setStatus(projectId: string, status: ProjectStatus): Promise<ProjectStatus | undefined>;
    moveProjectToTrash(projectId: string): Promise<TrashEntry | undefined>;
    restoreTrash(entry: TrashEntry): Promise<string | undefined>;
    emptyTrash(): Promise<void>;
    exportBackup(): Promise<{ json: string; count: number }>;
    readBackup(text: string): Promise<ParsedBackup & { conflicts?: string[] }>;
    importBackup(
      backup: Backup,
      choices: Record<string, ImportChoice>,
      copyName: (name: string) => string,
    ): Promise<number>;
    updateSettings(patch: Partial<Settings>): Promise<void>;
    snoozeBackup(): Promise<void>;
    markOpened(projectId: string): Promise<void>;
  }>()((set, get) => {
    /** Writes through the open project when it is the one being changed. */
    const isOpen = (projectId: string) =>
      projectStore?.getState().snapshot?.project.id === projectId;

    const loadAll = async () => {
      const projects = await repo.listProjects();
      const snapshots = await Promise.all(projects.map((p) => repo.loadProject(p.id)));
      return snapshots.filter((s): s is ProjectSnapshot => s !== undefined).map(summarize);
    };

    return {
      ready: false,
      projects: [],
      trash: [],
      settings: DEFAULT_SETTINGS,

      async init() {
        await repo.purgeExpiredTrash(now());
        const stored = await repo.getMeta<Settings>(SETTINGS_KEY);
        set({ settings: { ...DEFAULT_SETTINGS, ...stored } });
        await get().refresh();
        set({ ready: true });
      },

      async refresh() {
        const [projects, trash] = await Promise.all([loadAll(), repo.listTrash()]);
        set({ projects, trash });
      },

      async createProject({ name, type, goal }) {
        const id = createId();
        const snapshot = createProjectSnapshot({ id, name, type, goal, now: now(), createId });
        await repo.saveProject(snapshot);
        await get().refresh();
        return id;
      },

      async setStatus(projectId, status) {
        if (isOpen(projectId) && projectStore) {
          const previous = projectStore.getState().snapshot?.project.status;
          projectStore.getState().change((draft) => {
            draft.project.status = status;
          });
          await projectStore.getState().flush();
          await get().refresh();
          return previous;
        }
        const snapshot = await repo.loadProject(projectId);
        if (!snapshot) return undefined;
        const previous = snapshot.project.status;
        await repo.saveProject({
          ...snapshot,
          project: { ...snapshot.project, status, updatedAt: now() },
        });
        await get().refresh();
        return previous;
      },

      async moveProjectToTrash(projectId) {
        if (isOpen(projectId)) await projectStore?.getState().close();
        const snapshot = await repo.loadProject(projectId);
        if (!snapshot) return undefined;
        const entry: TrashEntry = {
          id: createId(),
          projectId: null,
          kind: 'project',
          label: snapshot.project.name,
          deletedAt: now(),
          payload: snapshot,
        };
        await repo.addTrash(entry);
        await repo.deleteProject(projectId);
        if (get().settings.lastOpenedProjectId === projectId) {
          await get().updateSettings({ lastOpenedProjectId: undefined });
        }
        await get().refresh();
        return entry;
      },

      /** RN 11: restores an entry whole; returns the project it went back to. */
      async restoreTrash(entry) {
        if (entry.kind === 'project') {
          const snapshot = ProjectSnapshotSchema.parse(entry.payload);
          await repo.saveProject(snapshot);
          await repo.removeTrash(entry.id);
          await get().refresh();
          return snapshot.project.id;
        }
        const projectId = entry.projectId;
        if (!projectId) return undefined;
        if (isOpen(projectId) && projectStore) {
          await projectStore.getState().restoreFromTrash(entry);
          await projectStore.getState().flush();
        } else {
          const snapshot = await repo.loadProject(projectId);
          if (!snapshot) return undefined;
          await repo.saveProject({
            ...restore(snapshot, entry.payload).snapshot,
            project: { ...snapshot.project, updatedAt: now() },
          });
          await repo.removeTrash(entry.id);
        }
        await get().refresh();
        return projectId;
      },

      async emptyTrash() {
        await repo.emptyTrash();
        await get().refresh();
      },

      async exportBackup() {
        await projectStore?.getState().flush();
        const projects = await repo.listProjects();
        const snapshots = (await Promise.all(projects.map((p) => repo.loadProject(p.id)))).filter(
          (s): s is ProjectSnapshot => s !== undefined,
        );
        const json = JSON.stringify(createBackup(snapshots, now()), null, 2);
        await get().updateSettings({
          lastBackupAt: now(),
          lastBackupCount: snapshots.length,
          snoozedUntil: undefined,
        });
        return { json, count: snapshots.length };
      },

      async readBackup(text) {
        const parsed = parseBackup(text);
        if (!parsed.ok) return parsed;
        const existing = new Set((await repo.listProjects()).map((p) => p.id));
        return { ...parsed, conflicts: findImportConflicts(parsed.backup, existing) };
      },

      async importBackup(backup, choices, copyName) {
        for (const snapshot of backup.projects) {
          const choice = choices[snapshot.project.id];
          if (choice === 'copy') {
            await repo.saveProject(
              copyProject(snapshot, {
                createId,
                now: now(),
                name: copyName(snapshot.project.name),
              }),
            );
          } else {
            if (isOpen(snapshot.project.id)) await projectStore?.getState().close();
            await repo.saveProject(snapshot);
          }
        }
        await get().refresh();
        return backup.projects.length;
      },

      async updateSettings(patch) {
        const settings = { ...get().settings, ...patch };
        set({ settings });
        await repo.setMeta(SETTINGS_KEY, settings);
      },

      async snoozeBackup() {
        await get().updateSettings({ snoozedUntil: snoozeBackupReminder(now()) });
      },

      async markOpened(projectId) {
        if (get().settings.lastOpenedProjectId !== projectId) {
          await get().updateSettings({ lastOpenedProjectId: projectId });
        }
      },
    };
  });
}

export type WorkspaceStore = ReturnType<typeof createWorkspaceStore>;
