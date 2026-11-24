import {
  DEFAULT_ENVIRONMENTS,
  type Project,
  type ProjectStatus,
  type ProjectType,
} from '../schemas/project';
import type { ProjectSnapshot } from '../schemas/snapshot';
import type { Zone } from '../schemas/map';
import { ZONE_IDS } from '../zones';

type NewProject = {
  id: string;
  name: string;
  type: ProjectType;
  goal?: string;
  kitId?: string;
  now: number;
  /** Creates ids for the default zones. */
  createId: () => string;
};

/** A new project starts planning, in the Hoje view, with the nine default zones (RN 1, 4). */
export function createProjectSnapshot({
  id,
  name,
  type,
  goal,
  kitId,
  now,
  createId,
}: NewProject): ProjectSnapshot {
  const project: Project = {
    id,
    name,
    type,
    goal,
    kitId,
    status: 'planning',
    view: 'today',
    environments: [...DEFAULT_ENVIRONMENTS],
    createdAt: now,
    updatedAt: now,
  };
  const zones: Zone[] = ZONE_IDS.map((key, order) => ({
    id: createId(),
    projectId: id,
    parentId: null,
    key,
    color: key,
    order,
    collapsed: false,
  }));
  return {
    project,
    zones,
    items: [],
    connections: [],
    flows: [],
    notes: [],
    risks: [],
    envVars: [],
    costs: [],
    checklist: [],
  };
}

/** RN 4: archiving takes a project off the main list without deleting it. */
export function isInMainList(project: Pick<Project, 'status'>): boolean {
  return project.status !== 'archived';
}

export function filterProjects<T extends Pick<Project, 'status'>>(
  projects: readonly T[],
  status: ProjectStatus | 'all',
): T[] {
  if (status === 'archived') return projects.filter((p) => p.status === 'archived');
  const main = projects.filter(isInMainList);
  return status === 'all' ? main : main.filter((p) => p.status === status);
}
