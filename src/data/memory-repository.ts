import { withoutSecretValues } from '@/domain/rules/env';
import { pruneVersions } from '@/domain/rules/history';
import { partitionExpiredTrash } from '@/domain/rules/trash';
import type { TrashEntry, Version } from '@/domain/schemas/history';
import { ProjectSnapshotSchema, type ProjectSnapshot } from '@/domain/schemas/snapshot';
import type { ProjectRepository } from './repository';

/** In-memory repository for tests and previews. Same rules as the Dexie one. */
export class MemoryProjectRepository implements ProjectRepository {
  projects = new Map<string, ProjectSnapshot>();
  trash = new Map<string, TrashEntry>();
  versions = new Map<string, Version>();
  meta = new Map<string, unknown>();
  /** Makes the next saves fail, to test error handling. */
  failSaves = false;

  async listProjects() {
    return [...this.projects.values()]
      .map((s) => s.project)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async loadProject(projectId: string) {
    const snapshot = this.projects.get(projectId);
    return snapshot ? structuredClone(snapshot) : undefined;
  }
  async saveProject(snapshot: ProjectSnapshot) {
    if (this.failSaves) throw new Error('Save failed');
    const clean = ProjectSnapshotSchema.parse({
      ...snapshot,
      envVars: withoutSecretValues(snapshot.envVars),
    });
    this.projects.set(clean.project.id, clean);
  }
  async deleteProject(projectId: string) {
    this.projects.delete(projectId);
    for (const [id, version] of this.versions)
      if (version.projectId === projectId) this.versions.delete(id);
  }
  async listTrash() {
    return [...this.trash.values()].sort((a, b) => b.deletedAt - a.deletedAt);
  }
  async addTrash(entry: TrashEntry) {
    this.trash.set(entry.id, structuredClone(entry));
  }
  async removeTrash(entryId: string) {
    this.trash.delete(entryId);
  }
  async purgeExpiredTrash(now: number) {
    const { expired } = partitionExpiredTrash([...this.trash.values()], now);
    expired.forEach((entry) => this.trash.delete(entry.id));
    return expired.length;
  }
  async emptyTrash() {
    this.trash.clear();
  }
  async listVersions(projectId: string) {
    return [...this.versions.values()]
      .filter((v) => v.projectId === projectId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  async addVersion(version: Version) {
    this.versions.set(version.id, structuredClone(version));
  }
  async pruneVersions(projectId: string, now: number) {
    const { remove } = pruneVersions(await this.listVersions(projectId), now);
    remove.forEach((v) => this.versions.delete(v.id));
    return remove.length;
  }
  async getMeta<T>(key: string) {
    return this.meta.get(key) as T | undefined;
  }
  async setMeta(key: string, value: unknown) {
    this.meta.set(key, value);
  }
}
