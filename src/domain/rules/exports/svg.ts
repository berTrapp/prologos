import type { Item, Zone } from '../../schemas/map';
import { LAYOUT, layoutMap } from '../layout';
import { visibleMap } from '../view';
import {
  exportModel,
  type ExportInput,
  type ExportItem,
  type ExportModel,
  type ExportZone,
} from './model';

/** Color of a token: a value for a standalone file, or var(--name) inside mapa.html. */
export type Paint = (token: string) => string;

/** Escapes text for XML content and attributes. */
export const xml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const FONT = "Geist, 'Geist Variable', ui-sans-serif, system-ui, sans-serif";
const MARGIN = 32;
const TITLE = 64;
/** Characters that fit on an item card at 13 px. */
const NAME_CHARS = 21;
const LINE_CHARS = 25;

const clip = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

type Box = { x: number; y: number; width: number; height: number };
type Point = { x: number; y: number };

/** A curve from the side of one card to the side of the other that faces it. */
function edgePath(from: Box, to: Box): string {
  const fromCenter = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
  const toCenter = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
  let start: Point;
  let end: Point;
  let horizontal = true;
  if (to.x >= from.x + from.width) {
    start = { x: from.x + from.width, y: fromCenter.y };
    end = { x: to.x, y: toCenter.y };
  } else if (to.x + to.width <= from.x) {
    start = { x: from.x, y: fromCenter.y };
    end = { x: to.x + to.width, y: toCenter.y };
  } else {
    horizontal = false;
    const down = toCenter.y >= fromCenter.y;
    start = { x: fromCenter.x, y: down ? from.y + from.height : from.y };
    end = { x: toCenter.x, y: down ? to.y : to.y + to.height };
  }
  const bend = Math.max(24, Math.abs(horizontal ? end.x - start.x : end.y - start.y) / 2);
  const c1 = horizontal
    ? { x: start.x + Math.sign(end.x - start.x) * bend, y: start.y }
    : { x: start.x, y: start.y + Math.sign(end.y - start.y || 1) * bend };
  const c2 = horizontal
    ? { x: end.x - Math.sign(end.x - start.x) * bend, y: end.y }
    : { x: end.x, y: end.y - Math.sign(end.y - start.y || 1) * bend };
  const n = (value: number) => Math.round(value * 10) / 10;
  return `M${n(start.x)} ${n(start.y)} C${n(c1.x)} ${n(c1.y)} ${n(c2.x)} ${n(c2.y)} ${n(end.x)} ${n(end.y)}`;
}

export type MapSvg = { svg: string; width: number; height: number };

export type SvgOptions = {
  paint: Paint;
  /** Extra attributes on the root (mapa.html adds ids and classes). */
  attributes?: string;
  /** Hides the title block (mapa.html shows its own header). */
  title?: boolean;
  /** Keeps ids unique when a page holds more than one map. */
  idPrefix?: string;
  /** Items become focusable buttons (mapa.html). */
  interactive?: boolean;
};

/**
 * RN 10: the map as an SVG drawn from the automatic layout, every zone open.
 * Pure: the same project gives the same file. Used for mapa.svg, mapa.png and mapa.html.
 */
export function mapSvg(
  input: ExportInput,
  { paint, attributes = '', title = true, idPrefix = '', interactive = false }: SvgOptions,
  model: ExportModel = exportModel(input),
): MapSvg {
  const { t, snapshot } = input;
  const open: Zone[] = snapshot.zones.map((zone) => ({ ...zone, collapsed: false }));
  const visible = visibleMap(snapshot, model.view).items.filter((item: Item) =>
    model.items.some((shown) => shown.id === item.id),
  );
  const layout = layoutMap(open, visible);
  const zoneById = new Map(model.zones.map((zone) => [zone.id, zone]));

  // Absolute positions: subzones and items are laid out relative to their zone.
  const origin = new Map<string, Point>();
  for (const zone of layout.zones) {
    const parent = zone.parentId ? (origin.get(zone.parentId) as Point) : { x: 0, y: 0 };
    origin.set(zone.id, { x: parent.x + zone.x, y: parent.y + zone.y });
  }
  const top = title ? TITLE : 0;
  const shift = (point: Point): Point => ({ x: point.x + MARGIN, y: point.y + MARGIN + top });
  const boxes = new Map<string, Box>();
  for (const item of layout.items) {
    const zone = origin.get(item.zoneId) as Point;
    const at = shift({ x: zone.x + item.x, y: zone.y + item.y });
    boxes.set(item.id, { ...at, width: LAYOUT.itemWidth, height: LAYOUT.itemHeight });
  }

  const right = Math.max(0, ...layout.zones.map((z) => (origin.get(z.id) as Point).x + z.width));
  const bottom = Math.max(0, ...layout.zones.map((z) => (origin.get(z.id) as Point).y + z.height));
  const width = Math.ceil(right + 2 * MARGIN);
  const height = Math.ceil(bottom + 2 * MARGIN + top);

  const out: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="${FONT}" role="img" aria-label="${xml(t('files.svg.label', { name: model.name }))}"${attributes}>`,
    `<defs><marker id="${idPrefix}arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9 z" fill="${paint('muted')}"/></marker></defs>`,
    `<rect width="100%" height="100%" fill="${paint('bg')}"/>`,
  ];
  if (title) {
    out.push(
      `<text x="${MARGIN}" y="${MARGIN + 22}" font-size="22" font-weight="600" fill="${paint('text')}">${xml(model.name)}</text>`,
    );
    if (model.goal)
      out.push(
        `<text x="${MARGIN}" y="${MARGIN + 46}" font-size="13" fill="${paint('muted')}">${xml(clip(model.goal, 120))}</text>`,
      );
  }

  for (const laid of layout.zones) {
    // The layout holds the same zones as the model, parents before children.
    const zone = zoneById.get(laid.id) as ExportZone;
    const at = shift(origin.get(laid.id) as Point);
    const color = paint(`zone-${zone.color}`);
    const sub = laid.parentId !== null;
    out.push(
      `<g class="zone" data-zone="${zone.ref}">`,
      `<rect x="${at.x}" y="${at.y}" width="${laid.width}" height="${laid.height}" rx="${sub ? 12 : 16}" fill="${paint('surface')}" stroke="${color}" stroke-opacity="0.35"/>`,
      `<rect x="${at.x}" y="${at.y}" width="${laid.width}" height="${laid.height}" rx="${sub ? 12 : 16}" fill="${color}" fill-opacity="0.05"/>`,
      `<circle cx="${at.x + (sub ? 16 : 24)}" cy="${at.y + 20}" r="4" fill="${color}"/>`,
      `<text x="${at.x + (sub ? 28 : 36)}" y="${at.y + 24.5}" font-size="12.5" font-weight="600" fill="${paint('text')}">${xml(clip(zone.name, 30))}<tspan fill="${paint('faint')}" font-weight="400">  ${laid.count}</tspan></text>`,
      '</g>',
    );
  }

  const refs = new Map(model.items.map((item) => [item.id, item.ref]));
  model.connections.forEach((connection, index) => {
    // Model connections join model items, and every model item has a card.
    const from = boxes.get(connection.from) as Box;
    const to = boxes.get(connection.to) as Box;
    const ends = `${refs.get(connection.from)} ${refs.get(connection.to)}`;
    out.push(
      `<path class="edge" data-edge="e${index + 1}" data-ends="${ends}" d="${edgePath(from, to)}" fill="none" stroke="${paint('muted')}" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#${idPrefix}arrow)">${connection.type ? `<title>${xml(connection.type)}</title>` : ''}</path>`,
    );
  });

  const statusText = (item: ExportItem) => {
    if (item.notApplicable) return t('mapItem.status.notApplicable');
    if (item.status === 'decided')
      return item.choice && item.choice !== item.name ? item.choice : '';
    return t(`mapItem.status.${item.status}`);
  };
  for (const item of model.items) {
    const box = boxes.get(item.id) as Box;
    const pending = item.status === 'pending' && !item.notApplicable;
    const future = item.status === 'future';
    const stroke = pending ? paint('warning') : future ? paint('faint') : paint('border-strong');
    const dash = pending || future ? ' stroke-dasharray="5 4"' : '';
    const opacity = item.notApplicable ? ' opacity="0.5"' : future ? ' opacity="0.75"' : '';
    const status = statusText(item);
    const nameY = status ? box.y + 20 : box.y + 29;
    out.push(
      `<g class="item" data-item="${item.ref}"${opacity}${interactive ? ` tabindex="0" role="button" aria-label="${xml(item.name)}"` : ''}>`,
      `<title>${xml(item.name)}</title>`,
      `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="10" fill="${paint('map-item')}" stroke="${stroke}"${dash}/>`,
      `<text x="${box.x + 12}" y="${nameY}" font-size="13" font-weight="500" fill="${paint('text')}">${xml(clip(item.name, NAME_CHARS))}</text>`,
    );
    if (status)
      out.push(
        `<text x="${box.x + 12}" y="${box.y + 37}" font-size="11.5" fill="${pending ? paint('warning') : paint('muted')}">${xml(clip(status, LINE_CHARS))}</text>`,
      );
    out.push('</g>');
  }
  out.push('</svg>');
  return { svg: out.join('\n'), width, height };
}
