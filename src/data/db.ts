import Dexie, { type Table } from 'dexie';
import type { ChecklistExpectation } from '@/domain/schemas/checklist';
import type { Cost } from '@/domain/schemas/cost';
import type { EnvVar } from '@/domain/schemas/env';
import type { TrashEntry, Version } from '@/domain/schemas/history';
import type { Connection, Flow, Item, Zone } from '@/domain/schemas/map';
import type { Note, Risk } from '@/domain/schemas/notes';
import type { Project } from '@/domain/schemas/project';

export type MetaRow = { key: string; value: unknown };

/**
 * Local database (RN 18: in the MVP, projects live only in this browser).
 * Every schema change adds a new `version()` with its upgrade; never edit an old one.
 */
export class PrologosDb extends Dexie {
  projects!: Table<Project, string>;
  zones!: Table<Zone, string>;
  items!: Table<Item, string>;
  connections!: Table<Connection, string>;
  flows!: Table<Flow, string>;
  notes!: Table<Note, string>;
  risks!: Table<Risk, string>;
  envVars!: Table<EnvVar, string>;
  costs!: Table<Cost, string>;
  checklist!: Table<ChecklistExpectation, string>;
  versions!: Table<Version, string>;
  trash!: Table<TrashEntry, string>;
  meta!: Table<MetaRow, string>;

  constructor(name = 'prologos') {
    super(name);
    this.version(1).stores({
      projects: 'id, status, updatedAt',
      zones: 'id, projectId',
      items: 'id, projectId, zoneId',
      connections: 'id, projectId',
      flows: 'id, projectId',
      notes: 'id, projectId',
      risks: 'id, projectId',
      envVars: 'id, projectId',
      costs: 'id, projectId',
      checklist: 'id, projectId',
      versions: 'id, projectId, createdAt',
      trash: 'id, projectId, deletedAt',
      meta: 'key',
    });
  }
}
