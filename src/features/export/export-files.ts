import { createBackup } from '@/domain/rules/backup';
import { mapHtml } from '@/domain/rules/exports/html';
import { mapMermaid } from '@/domain/rules/exports/mermaid';
import { slugify, type ExportInput } from '@/domain/rules/exports/model';
import { parseTokens, type Palette } from '@/domain/rules/exports/palette';
import {
  composePlan,
  dockerCompose,
  envExample,
  readme,
  repoFiles,
} from '@/domain/rules/exports/repo-files';
import { mapSvg } from '@/domain/rules/exports/svg';
import { downloadBlob } from '@/lib/download';
import tokens from '@/styles/tokens.css?raw';

/** Both themes, read from the tokens; the only source of color (ux-ui 13.1). */
export const PALETTES = parseTokens(tokens);

/** Formats of the Exportar screen, in its order (RN 10). */
export const EXPORT_FORMATS = [
  'env',
  'compose',
  'readme',
  'mermaid',
  'image',
  'html',
  'json',
] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];
export type ImageType = 'png' | 'svg';

export const fileName = (format: ExportFormat, image: ImageType = 'png'): string =>
  ({
    env: '.env.example',
    compose: 'docker-compose.yml',
    readme: 'README.md',
    mermaid: 'mapa.mmd',
    image: `mapa.${image}`,
    html: 'mapa.html',
    json: 'prologos.json',
  })[format];

/** Formats this project offers: docker-compose.yml only when the kit uses Docker. */
export function availableFormats(input: ExportInput): ExportFormat[] {
  const docker = composePlan(input).kind !== 'none';
  return EXPORT_FORMATS.filter((format) => format !== 'compose' || docker);
}

/** Project backup for one project: prologos.json, never with a secret value (RN 3, 18). */
export function projectJson(input: ExportInput, now = Date.now()): string {
  return `${JSON.stringify(createBackup([input.snapshot], now), null, 2)}\n`;
}

export function imageSvg(input: ExportInput, palette: Palette) {
  return mapSvg(input, { paint: (token) => palette[token] ?? '' });
}

/** Text of a format; the image shows as SVG in the preview. */
export function formatText(format: ExportFormat, input: ExportInput, palette: Palette): string {
  switch (format) {
    case 'env':
      return envExample(input);
    case 'compose':
      return dockerCompose(input) ?? '';
    case 'readme':
      return readme(input);
    case 'mermaid':
      return mapMermaid(input);
    case 'image':
      return imageSvg(input, palette).svg;
    case 'html':
      return mapHtml(input, PALETTES);
    case 'json':
      return projectJson(input);
  }
}

const MIME: Record<ExportFormat, string> = {
  env: 'text/plain',
  compose: 'text/yaml',
  readme: 'text/markdown',
  mermaid: 'text/plain',
  image: 'image/svg+xml',
  html: 'text/html',
  json: 'application/json',
};

/** Draws the SVG on a canvas at twice its size: the PNG in high resolution. */
async function svgToPng(svg: string, width: number, height: number, scale = 2): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas');
    context.scale(scale, scale);
    context.drawImage(image, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('png'))), 'image/png'),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Generates and downloads one format; returns the file name for the toast. */
export async function downloadFormat(
  format: ExportFormat,
  input: ExportInput,
  palette: Palette,
  image: ImageType,
): Promise<string> {
  const name = fileName(format, image);
  if (format === 'image' && image === 'png') {
    const { svg, width, height } = imageSvg(input, palette);
    downloadBlob(name, await svgToPng(svg, width, height));
    return name;
  }
  downloadBlob(name, new Blob([formatText(format, input, palette)], { type: MIME[format] }));
  return name;
}

/** RN 16: the repository start as a .zip, everything inside a folder named after the project. */
export async function downloadRepoZip(input: ExportInput): Promise<string> {
  const { zipSync, strToU8 } = await import('fflate');
  const slug = slugify(input.snapshot.project.name);
  const files = Object.fromEntries(
    repoFiles(input).map((file) => [`${slug}/${file.path}`, strToU8(file.content)]),
  );
  const name = `${slug}.zip`;
  downloadBlob(name, new Blob([zipSync(files)], { type: 'application/zip' }));
  return name;
}

/** "7 linhas": a final newline does not count as a line. */
export const lineCount = (text: string) => text.replace(/\n$/, '').split('\n').length;
