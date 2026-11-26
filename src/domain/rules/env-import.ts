import type { EnvVar } from '../schemas/env';
import type { ProjectSnapshot } from '../schemas/snapshot';
import type { DotenvLine } from './dotenv';
import { setSecret } from './env';

/** Where the .env goes: the client (browser or app, public prefix) or the server. */
export type ImportDestination = 'client' | 'server';
export type ImportStatus = 'new' | 'update' | 'same' | 'invalid';
export type ImportWarning = 'secret-on-client' | 'missing-public-prefix';

export type ImportRow = {
  line: number;
  key: string;
  /** Kept only in memory, for the preview; never saved (RN 3). */
  value: string;
  status: ImportStatus;
  secret: boolean;
  warnings: ImportWarning[];
  /** Checked by default in the preview. */
  selected: boolean;
};

const SECRET_NAME = /(SECRET|PASSWORD|PASSWD|PWD|TOKEN|PRIVATE|CREDENTIAL|API_?KEY|(^|_)KEY$)/;
const PUBLIC_NAME = /(PUBLIC|PUBLISHABLE)/;

/** RN 3: a secret by its name (SECRET, PASSWORD, TOKEN, KEY…) or by the kit's mark. */
export function looksSecret(key: string, kitSecrets: ReadonlySet<string> = new Set()): boolean {
  if (kitSecrets.has(key)) return true;
  const bare = key.replace(/^(VITE_|EXPO_PUBLIC_|PUBLIC_|NEXT_PUBLIC_)/, '');
  return SECRET_NAME.test(bare) && !PUBLIC_NAME.test(bare);
}

export type ImportContext = {
  existing: readonly EnvVar[];
  environments: readonly string[];
  destination: ImportDestination;
  /** Where a client variable is used: "front" on the web, "app" on mobile. */
  clientSide: string;
  publicPrefix: string | null;
  kitSecrets?: ReadonlySet<string>;
};

export const sideOf = (context: Pick<ImportContext, 'destination' | 'clientSide'>) =>
  context.destination === 'client' ? context.clientSide : 'back';

function status(key: string, secret: boolean, context: ImportContext): ImportStatus {
  const side = sideOf(context);
  let changes = false;
  for (const environment of context.environments) {
    const current = context.existing.find((v) => v.key === key && v.environment === environment);
    if (!current) return 'new';
    if (!current.usedIn.includes(side) || current.secret !== secret) changes = true;
  }
  return changes ? 'update' : 'same';
}

/** Warnings for one row; they change with the secret mark the person picks. */
export function importWarnings(
  key: string,
  secret: boolean,
  context: ImportContext,
): ImportWarning[] {
  if (context.destination !== 'client') return [];
  const warnings: ImportWarning[] = [];
  if (secret) warnings.push('secret-on-client');
  if (context.publicPrefix && !key.startsWith(context.publicPrefix))
    warnings.push('missing-public-prefix');
  return warnings;
}

/**
 * RN 3: classifies every line of the .env against the chosen environments
 * (nova, atualiza, igual, inválida) and warns before anything is added.
 * A repeated key keeps only its last line.
 */
export function classifyImport(lines: readonly DotenvLine[], context: ImportContext): ImportRow[] {
  return lines.flatMap((line): ImportRow[] => {
    if (line.kind === 'invalid')
      return [
        {
          line: line.line,
          key: line.text,
          value: '',
          status: 'invalid',
          secret: false,
          warnings: [],
          selected: false,
        },
      ];
    if (line.duplicate) return [];
    if (!line.valid)
      return [
        {
          line: line.line,
          key: line.key,
          value: line.value,
          status: 'invalid',
          secret: false,
          warnings: [],
          selected: false,
        },
      ];
    const secret = looksSecret(line.key, context.kitSecrets);
    return [rowFor(line.line, line.key, line.value, secret, context)];
  });
}

/** Recomputes a row after the person changes its secret mark in the preview. */
export function rowFor(
  line: number,
  key: string,
  value: string,
  secret: boolean,
  context: ImportContext,
): ImportRow {
  const rowStatus = status(key, secret, context);
  const warnings = importWarnings(key, secret, context);
  return {
    line,
    key,
    value,
    status: rowStatus,
    secret,
    warnings,
    selected:
      (rowStatus === 'new' || rowStatus === 'update') && !warnings.includes('secret-on-client'),
  };
}

export type ImportResult = {
  snapshot: ProjectSnapshot;
  added: number;
  updated: number;
  ignored: number;
};

/**
 * RN 3: adds the chosen rows to each environment. Every imported value is discarded,
 * secret or not; existing variables only gain where they are used and the secret mark.
 */
export function applyImport(
  snapshot: ProjectSnapshot,
  rows: readonly ImportRow[],
  context: Pick<ImportContext, 'environments' | 'destination' | 'clientSide'>,
  createId: () => string,
  describe: (key: string) => string | undefined = () => undefined,
): ImportResult {
  const side = sideOf(context);
  const chosen = rows.filter(
    (row) => row.selected && row.status !== 'invalid' && row.status !== 'same',
  );
  let envVars = [...snapshot.envVars];
  let added = 0;
  let updated = 0;
  for (const row of chosen) {
    for (const environment of context.environments) {
      const index = envVars.findIndex((v) => v.key === row.key && v.environment === environment);
      const current = envVars[index];
      if (current) {
        const withSide = { ...current, usedIn: [...new Set([...current.usedIn, side])] } as EnvVar;
        envVars[index] = setSecret(withSide, row.secret).envVar;
        updated += 1;
      } else {
        const description = describe(row.key);
        const base = {
          id: createId(),
          projectId: snapshot.project.id,
          key: row.key,
          environment,
          usedIn: [side],
          ...(description ? { description } : {}),
        };
        envVars = [...envVars, row.secret ? { ...base, secret: true } : { ...base, secret: false }];
        added += 1;
      }
    }
  }
  return {
    snapshot: { ...snapshot, envVars },
    added,
    updated,
    ignored: rows.length - chosen.length,
  };
}
