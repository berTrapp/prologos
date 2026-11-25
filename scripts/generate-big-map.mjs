// Generates prologos-300.json: a backup with one project of 300 items, 40 connections and
// 3 flows, to import in Configurações and check that the map stays fluid (Fase 5).
// Usage: node scripts/generate-big-map.mjs [items] [file]
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ZONES = ['method', 'tools', 'ui', 'app', 'data', 'env', 'infra', 'security', 'observability'];

export function bigMapBackup({ items = 300, connections = 40, now = Date.now() } = {}) {
  const projectId = 'big-map';
  let n = 0;
  const id = (prefix) => `${prefix}-${++n}`;
  const zones = ZONES.map((key, order) => ({
    id: id('zone'),
    projectId,
    parentId: null,
    key,
    color: key,
    order,
    collapsed: false,
  }));
  // Two subzones, so the map also shows nesting.
  for (const [parent, name] of [
    [zones[3], 'Web'],
    [zones[4], 'Cache'],
  ]) {
    zones.push({
      id: id('zone'),
      projectId,
      parentId: parent.id,
      name,
      color: parent.color,
      order: 0,
      collapsed: false,
    });
  }
  const list = Array.from({ length: items }, (_, index) => {
    const zone = zones[index % zones.length];
    return {
      id: id('item'),
      projectId,
      zoneId: zone.id,
      name: `Item ${String(index + 1).padStart(3, '0')}`,
      state: index % 7 === 0 ? 'pending' : 'decided',
      when: index % 11 === 0 ? 'later' : 'now',
      newForYou: index % 13 === 0,
      order: Math.floor(index / zones.length),
    };
  });
  const links = Array.from({ length: connections }, (_, index) => ({
    id: id('link'),
    projectId,
    from: list[index * 3].id,
    to: list[index * 3 + 1].id,
    ...(index % 2 === 0 ? { type: 'uses' } : {}),
  }));
  const flows = [0, 1, 2].map((flow) => ({
    id: id('flow'),
    projectId,
    name: `Fluxo ${flow + 1}`,
    steps: links.slice(flow * 4, flow * 4 + 3).map((link) => link.id),
  }));
  return {
    format: 'prologos-backup',
    version: 1,
    exportedAt: now,
    projects: [
      {
        project: {
          id: projectId,
          name: `Mapa com ${items} itens`,
          type: 'web',
          status: 'planning',
          view: 'complete',
          environments: ['development', 'staging', 'production'],
          createdAt: now,
          updatedAt: now,
        },
        zones,
        items: list,
        connections: links,
        flows,
        notes: [],
        risks: [],
        envVars: [],
        costs: [],
        checklist: [],
      },
    ],
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const items = Number(process.argv[2] ?? 300);
  const file = process.argv[3] ?? `prologos-${items}.json`;
  writeFileSync(file, `${JSON.stringify(bigMapBackup({ items }), null, 2)}\n`);
  console.log(`${file}: ${items} items`);
}
