import {
  exportModel,
  type ExportConnection,
  type ExportInput,
  type ExportItem,
  type ExportModel,
  type ExportZone,
} from './model';

/** Mermaid label: quotes escaped, one line. */
const label = (text: string) => text.replace(/\s+/g, ' ').replace(/"/g, '#quot;');

export function itemLabel(item: ExportItem, t: ExportInput['t']): string {
  const name =
    item.choice && item.choice !== item.name ? `${item.name}: ${item.choice}` : item.name;
  if (item.notApplicable) return `${name} (${t('mapItem.status.notApplicable').toLowerCase()})`;
  if (item.status === 'pending') return `${name} (${t('mapItem.status.pending').toLowerCase()})`;
  if (item.status === 'future') return `${name} (${t('mapItem.status.future').toLowerCase()})`;
  return name;
}

/**
 * RN 10: mapa.mmd, the map in Mermaid for any editor: zones as subgraphs, items,
 * connections with their type, and each flow as a comment. Ids are short and stable.
 */
export function mapMermaid(input: ExportInput, model: ExportModel = exportModel(input)): string {
  const { t } = input;
  const refs = new Map(model.items.map((item) => [item.id, item.ref]));
  const hasItems = (zone: ExportZone): boolean =>
    zone.items.length > 0 ||
    model.zones.filter((z) => z.parentId === zone.id).some((child) => hasItems(child));

  const view = t(`files.view.${model.view}`);
  const lines = [
    `%% ${t('files.mermaid.title', { name: model.name, view })}`,
    `%% ${t('files.generated')}`,
    'flowchart LR',
  ];
  const writeZone = (zone: ExportZone, depth: number) => {
    if (!hasItems(zone)) return;
    const pad = '  '.repeat(depth);
    lines.push(`${pad}subgraph ${zone.ref}["${label(zone.name)}"]`);
    for (const item of zone.items)
      lines.push(`${pad}  ${item.ref}["${label(itemLabel(item, t))}"]`);
    for (const child of model.zones.filter((z) => z.parentId === zone.id))
      writeZone(child, depth + 1);
    lines.push(`${pad}end`);
  };
  for (const zone of model.zones.filter((z) => z.parentId === null)) writeZone(zone, 1);

  for (const connection of model.connections) {
    const arrow = connection.type ? `-->|"${label(connection.type)}"|` : '-->';
    lines.push(`  ${refs.get(connection.from)} ${arrow} ${refs.get(connection.to)}`);
  }

  const pending = model.items.filter((i) => i.status === 'pending' && !i.notApplicable);
  const future = model.items.filter((i) => i.status === 'future');
  const muted = model.items.filter((i) => i.notApplicable);
  lines.push('  classDef pending stroke-dasharray: 5 4');
  lines.push('  classDef future stroke-dasharray: 2 4');
  lines.push('  classDef muted opacity: 0.5');
  if (pending.length > 0) lines.push(`  class ${pending.map((i) => i.ref).join(',')} pending`);
  if (future.length > 0) lines.push(`  class ${future.map((i) => i.ref).join(',')} future`);
  if (muted.length > 0) lines.push(`  class ${muted.map((i) => i.ref).join(',')} muted`);

  const ends = new Map(model.connections.map((c) => [c.id, c]));
  const names = new Map(model.items.map((item) => [item.id, item.name]));
  for (const flow of model.flows) {
    const path: string[] = [];
    // Flow connections are already the visible ones, between items of the model.
    for (const id of flow.connections) {
      const connection = ends.get(id) as ExportConnection;
      if (path.length === 0) path.push(names.get(connection.from) as string);
      path.push(names.get(connection.to) as string);
    }
    if (path.length > 1)
      lines.push(`  %% ${t('files.mermaid.flow', { name: flow.name, path: path.join(' → ') })}`);
  }
  return `${lines.join('\n')}\n`;
}
