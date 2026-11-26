import { isValidEnvKey } from './env';

/** Byte order mark some editors put at the start of the file. */
const BOM = String.fromCharCode(0xfeff);

export type DotenvLine =
  | { kind: 'entry'; line: number; key: string; value: string; valid: boolean; duplicate: boolean }
  | { kind: 'invalid'; line: number; text: string };

/**
 * Reads a .env text: comments, blank lines, `export`, single and double quotes,
 * inline comments and CRLF. Values live only in memory, for the preview (RN 3).
 * A key repeated later wins; the earlier ones are marked duplicate.
 */
export function parseDotenv(text: string): DotenvLine[] {
  const lines = (text.startsWith(BOM) ? text.slice(1) : text).split(/\r?\n/);
  const result: DotenvLine[] = [];
  lines.forEach((raw, index) => {
    const line = index + 1;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const body = trimmed.replace(/^export\s+/, '');
    const eq = body.indexOf('=');
    if (eq <= 0) {
      result.push({ kind: 'invalid', line, text: trimmed });
      return;
    }
    const key = body.slice(0, eq).trim();
    result.push({
      kind: 'entry',
      line,
      key,
      value: readValue(body.slice(eq + 1).trim()),
      valid: isValidEnvKey(key),
      duplicate: false,
    });
  });

  const last = new Map<string, number>();
  result.forEach((entry, index) => {
    if (entry.kind === 'entry') last.set(entry.key, index);
  });
  return result.map((entry, index) =>
    entry.kind === 'entry' && last.get(entry.key) !== index ? { ...entry, duplicate: true } : entry,
  );
}

function readValue(raw: string): string {
  const quote = raw[0];
  if (quote === '"' || quote === "'") {
    // In double quotes, \" does not close the value.
    let end = raw.indexOf(quote, 1);
    while (quote === '"' && end > 0 && raw[end - 1] === '\\') end = raw.indexOf(quote, end + 1);
    if (end > 0) {
      const inner = raw.slice(1, end);
      return quote === '"' ? inner.replace(/\\n/g, '\n').replace(/\\"/g, '"') : inner;
    }
  }
  // Unquoted: an inline comment starts at " #".
  const comment = raw.search(/\s#/);
  return (comment >= 0 ? raw.slice(0, comment) : raw).trim();
}
