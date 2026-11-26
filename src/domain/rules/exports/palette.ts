/** Token values of one theme, by name without the leading dashes ("bg", "zone-data"). */
export type Palette = Record<string, string>;
export type Palettes = { dark: Palette; light: Palette };

function declarations(block: string): Palette {
  const palette: Palette = {};
  for (const match of block.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g))
    palette[String(match[1])] = String(match[2]).trim();
  return palette;
}

function blocks(css: string, selector: RegExp): string {
  return [...css.matchAll(new RegExp(`${selector.source}\\s*\\{([^}]*)\\}`, 'g'))]
    .map((match) => String(match[1]))
    .join('\n');
}

/**
 * Reads both themes from src/styles/tokens.css, the only place colors live (ux-ui 13.1).
 * Generated files that leave the app (SVG, PNG, mapa.html) need the values themselves.
 */
export function parseTokens(css: string): Palettes {
  const shared = declarations(blocks(css, /:root(?!,)/));
  const dark = { ...shared, ...declarations(blocks(css, /:root,\s*\[data-theme='dark'\]/)) };
  const light = { ...dark, ...declarations(blocks(css, /\[data-theme='light'\]/)) };
  return { dark, light };
}

/** The values a generated map needs, as CSS custom properties for one theme. */
export function cssVariables(palette: Palette, names: readonly string[]): string {
  return names.map((name) => `--${name}:${palette[name] ?? 'initial'};`).join('');
}
