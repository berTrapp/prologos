import { describe, expect, it } from 'vitest';
import { makeSnapshot } from '../fixtures';
import { ProjectSnapshotSchema } from '../schemas/snapshot';
import { ZONE_IDS } from '../zones';
import { filterProjects, isInMainList } from './project';

describe('createProjectSnapshot', () => {
  it('starts planning, in Hoje, with the nine default zones in order (RN 1, 4)', () => {
    const snapshot = makeSnapshot();
    expect(snapshot.project.status).toBe('planning');
    expect(snapshot.project.view).toBe('today');
    expect(snapshot.zones.map((zone) => zone.key)).toEqual([...ZONE_IDS]);
    expect(snapshot.zones.every((zone) => zone.parentId === null && zone.color === zone.key)).toBe(
      true,
    );
  });

  it('starts with the fixed environments (RN 3)', () => {
    expect(makeSnapshot().project.environments).toEqual(['development', 'staging', 'production']);
  });

  it('produces a valid snapshot', () => {
    expect(ProjectSnapshotSchema.safeParse(makeSnapshot()).success).toBe(true);
  });
});

describe('project status (RN 4)', () => {
  const projects = (['planning', 'developing', 'paused', 'done', 'archived'] as const).map(
    (status) => ({ status }),
  );

  it('archived projects leave the main list', () => {
    expect(isInMainList({ status: 'archived' })).toBe(false);
    expect(isInMainList({ status: 'paused' })).toBe(true);
  });

  it('filters by status inside the main list', () => {
    expect(filterProjects(projects, 'all').map((p) => p.status)).toEqual([
      'planning',
      'developing',
      'paused',
      'done',
    ]);
    expect(filterProjects(projects, 'paused')).toEqual([{ status: 'paused' }]);
  });

  it('shows archived projects only when asked', () => {
    expect(filterProjects(projects, 'archived')).toEqual([{ status: 'archived' }]);
  });
});
