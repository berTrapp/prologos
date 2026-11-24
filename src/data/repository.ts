import type { TrashEntry, Version } from '@/domain/schemas/history';
import type { Project } from '@/domain/schemas/project';
import type { ProjectSnapshot } from '@/domain/schemas/snapshot';

/**
 * Storage contract. The MVP implements it with Dexie (IndexedDB);
 * the future backend (Laravel API) only needs another implementation.
 */
export interface ProjectRepository {
  listProjects(): Promise<Project[]>;
  loadProject(projectId: string): Promise<ProjectSnapshot | undefined>;
  /** Replaces everything stored for the project, atomically. Secret values are stripped (RN 3). */
  saveProject(snapshot: ProjectSnapshot): Promise<void>;
  /** Removes the project and everything in it (used when it moves to the trash). */
  deleteProject(projectId: string): Promise<void>;

  listTrash(): Promise<TrashEntry[]>;
  addTrash(entry: TrashEntry): Promise<void>;
  removeTrash(entryId: string): Promise<void>;
  /** RN 11: deletes entries older than 30 days; returns how many left. */
  purgeExpiredTrash(now: number): Promise<number>;
  emptyTrash(): Promise<void>;

  listVersions(projectId: string): Promise<Version[]>;
  addVersion(version: Version): Promise<void>;
  /** RN 8: drops automatic versions older than 90 days. */
  pruneVersions(projectId: string, now: number): Promise<number>;

  getMeta<T>(key: string): Promise<T | undefined>;
  setMeta(key: string, value: unknown): Promise<void>;
}
