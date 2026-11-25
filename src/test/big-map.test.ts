import { describe, expect, it } from 'vitest';
import { layoutMap, mapEdges } from '@/domain/rules/layout';
import { parseBackup } from '@/domain/rules/backup';
import { visibleMap } from '@/domain/rules/view';
// @ts-expect-error The generator is a plain Node script without types.
import { bigMapBackup } from '../../scripts/generate-big-map.mjs';

describe('300-item map (Fase 5)', () => {
  const text = JSON.stringify(bigMapBackup({ items: 300, now: 1 }));

  it('is a valid backup that imports', () => {
    const parsed = parseBackup(text);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.backup.projects[0]?.items).toHaveLength(300);
  });

  it('lays out and links in a few milliseconds', () => {
    const parsed = parseBackup(text);
    if (!parsed.ok) throw new Error('backup');
    const [snapshot] = parsed.backup.projects;
    if (!snapshot) throw new Error('project');
    const start = performance.now();
    const { items, connections } = visibleMap(snapshot, 'complete');
    const layout = layoutMap(snapshot.zones, items);
    mapEdges(connections, layout);
    expect(layout.items).toHaveLength(300);
    expect(performance.now() - start).toBeLessThan(50);
  });
});
