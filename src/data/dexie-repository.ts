import { withoutSecretValues } from '@/domain/rules/env';
import { pruneVersions } from '@/domain/rules/history';
import { partitionExpiredTrash } from '@/domain/rules/trash';
import {
  TrashEntrySchema,
  VersionSchema,
  type TrashEntry,
  type Version,
} from '@/domain/schemas/history';
import {
  ProjectSnapshotSchema,
  SNAPSHOT_COLLECTIONS,
  type ProjectSnapshot,
} from '@/domain/schemas/snapshot';
import type { Table } from 'dexie';
import { PrologosDb } from './db';
import type { ProjectRepository } from './repository';

/** RN 3: secrets lose any value and the whole project is validated before it is written. */
function clean(snapshot: ProjectSnapshot): ProjectSnapshot {
  return ProjectSnapshotSchema.parse({
    ...snapshot,
    envVars: withoutSecretValues(snapshot.envVars),
  });
}

export class DexieProjectRepository implements ProjectRepository {
  constructor(private readonly db: PrologosDb = new PrologosDb()) {}

  private get rowTables() {
    return SNAPSHOT_COLLECTIONS.map((name) => this.db[name]);
  }

  async listProjects() {
    return this.db.projects.orderBy('updatedAt').reverse().toArray();
  }

  async loadProject(projectId: string): Promise<ProjectSnapshot | undefined> {
    return this.db.transaction('r', [this.db.projects, ...this.rowTables], async () => {
      const project = await this.db.projects.get(projectId);
      if (!project) return undefined;
      const rows = await Promise.all(
        SNAPSHOT_COLLECTIONS.map((name) =>
          this.db[name].where('projectId').equals(projectId).toArray(),
        ),
      );
      return Object.fromEntries([
        ['project', project],
        ...SNAPSHOT_COLLECTIONS.map((name, i) => [name, rows[i]]),
      ]) as ProjectSnapshot;
    });
  }

  async saveProject(snapshot: ProjectSnapshot) {
    const data = clean(snapshot);
    const projectId = data.project.id;
    await this.db.transaction('rw', [this.db.projects, ...this.rowTables], async () => {
      await this.db.projects.put(data.project);
      for (const name of SNAPSHOT_COLLECTIONS) {
        // Each table holds the rows of the collection with the same name.
        const table = this.db[name] as unknown as Table<{ id: string }, string>;
        await table.where('projectId').equals(projectId).delete();
        await table.bulkPut(data[name]);
      }
    });
  }

  async deleteProject(projectId: string) {
    await this.db.transaction(
      'rw',
      [this.db.projects, this.db.versions, ...this.rowTables],
      async () => {
        await this.db.projects.delete(projectId);
        await this.db.versions.where('projectId').equals(projectId).delete();
        for (const table of this.rowTables)
          await table.where('projectId').equals(projectId).delete();
      },
    );
  }

  async listTrash() {
    return this.db.trash.orderBy('deletedAt').reverse().toArray();
  }

  async addTrash(entry: TrashEntry) {
    const { payload } = entry;
    const safe = payload.envVars
      ? { ...payload, envVars: withoutSecretValues(payload.envVars) }
      : payload;
    await this.db.trash.put(TrashEntrySchema.parse({ ...entry, payload: safe }));
  }

  async removeTrash(entryId: string) {
    await this.db.trash.delete(entryId);
  }

  async purgeExpiredTrash(now: number) {
    const { expired } = partitionExpiredTrash(await this.db.trash.toArray(), now);
    await this.db.trash.bulkDelete(expired.map((entry) => entry.id));
    return expired.length;
  }

  async emptyTrash() {
    await this.db.trash.clear();
  }

  async listVersions(projectId: string) {
    const versions = await this.db.versions.where('projectId').equals(projectId).toArray();
    return versions.sort((a, b) => b.createdAt - a.createdAt);
  }

  async addVersion(version: Version) {
    await this.db.versions.put(
      VersionSchema.parse({ ...version, snapshot: clean(version.snapshot) }),
    );
  }

  async pruneVersions(projectId: string, now: number) {
    const { remove } = pruneVersions(
      await this.db.versions.where('projectId').equals(projectId).toArray(),
      now,
    );
    await this.db.versions.bulkDelete(remove.map((version) => version.id));
    return remove.length;
  }

  async getMeta<T>(key: string) {
    return (await this.db.meta.get(key))?.value as T | undefined;
  }

  async setMeta(key: string, value: unknown) {
    await this.db.meta.put({ key, value });
  }
}
