import type { StatusTone } from '@/components/ui/StatusDot';
import type { ProjectStatus } from '@/domain/schemas/project';
import { ZONE_IDS, type ZoneColor } from '@/domain/zones';

/** Dot color of each project status; the text always comes with it (ux-ui 5, 13.4). */
export const STATUS_TONE: Record<ProjectStatus, StatusTone> = {
  planning: 'accent',
  developing: 'info',
  paused: 'neutral',
  done: 'success',
  archived: 'neutral',
};

/** Statuses a person picks from the project menu (archiving has its own action). */
export const PICKABLE_STATUSES = ['planning', 'developing', 'paused', 'done'] as const;

/** Stable tile color for a project, always one of the zone colors. */
export function projectColor(projectId: string): ZoneColor {
  let hash = 0;
  for (const char of projectId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return ZONE_IDS[hash % ZONE_IDS.length] ?? 'ui';
}
