import type { EnvVar } from '../../schemas/env';
import { envHowToGet } from '../kit-lookup';
import { exportModel, slugify, type ExportInput } from './model';
import { mapMermaid } from './mermaid';

export type GeneratedFile = { path: string; content: string };

const DOCKER_FILE = 'docker-compose.yml';
const DEFAULT_DOCKER_ENV = { user: 'DB_USER', password: 'DB_PASSWORD', database: 'DB_NAME' };

export type DatabaseEngine = 'postgres' | 'mysql' | 'sqlserver';

/** What the docker-compose.yml can run for the database the person chose (RN 16). */
export type ComposePlan =
  /** The kit does not use Docker: no docker-compose.yml. */
  | { kind: 'none' }
  | { kind: 'pending' | 'notApplicable' | 'sqlite' }
  | { kind: 'unknown'; choice: string }
  | {
      kind: 'service';
      engine: DatabaseEngine;
      /** Keys the file reads from .env; SQL Server has a fixed user and no database name. */
      keys: { user?: string; password: string; database?: string };
    };

function engineOf(choice: string): DatabaseEngine | 'sqlite' | undefined {
  if (/postgres/i.test(choice)) return 'postgres';
  if (/mysql|mariadb/i.test(choice)) return 'mysql';
  if (/sql ?server|mssql/i.test(choice)) return 'sqlserver';
  if (/sqlite/i.test(choice)) return 'sqlite';
  return undefined;
}

export function composePlan({ snapshot, kit }: Pick<ExportInput, 'snapshot' | 'kit'>): ComposePlan {
  if (!kit?.dependencyFiles.includes(DOCKER_FILE)) return { kind: 'none' };
  const skipped = snapshot.checklist.some((row) => row.itemRef === 'database' && row.notApplicable);
  if (skipped) return { kind: 'notApplicable' };
  const database = snapshot.items.find((item) => item.kitRef === 'database');
  const choice = database?.state === 'decided' ? (database.choice ?? database.name) : undefined;
  if (!choice) return { kind: 'pending' };
  const engine = engineOf(choice);
  if (!engine) return { kind: 'unknown', choice };
  if (engine === 'sqlite') return { kind: 'sqlite' };
  const env = kit.dockerEnv ?? DEFAULT_DOCKER_ENV;
  return {
    kind: 'service',
    engine,
    keys:
      engine === 'sqlserver'
        ? { password: env.password }
        : { user: env.user, password: env.password, database: env.database },
  };
}

const CLIENT_SIDES = new Set(['front', 'app']);
type EnvGroup = 'client' | 'back' | 'docker' | 'other';
const GROUPS: readonly EnvGroup[] = ['client', 'back', 'docker', 'other'];

function groupOf(envVar: Pick<EnvVar, 'usedIn'>): EnvGroup {
  if (envVar.usedIn.some((side) => CLIENT_SIDES.has(side))) return 'client';
  if (envVar.usedIn.includes('back')) return 'back';
  if (envVar.usedIn.includes('docker')) return 'docker';
  return 'other';
}

/** One row per key: the description of any environment, a value only from development. */
type EnvRow = {
  key: string;
  group: EnvGroup;
  secret: boolean;
  value?: string;
  description?: string;
};

function envRows(input: ExportInput, plan: ComposePlan): EnvRow[] {
  const rows = new Map<string, EnvRow>();
  for (const envVar of input.snapshot.envVars) {
    const row = rows.get(envVar.key) ?? {
      key: envVar.key,
      group: groupOf(envVar),
      secret: envVar.secret,
    };
    // RN 3: a key that is secret in any environment is secret everywhere in the files.
    row.secret ||= envVar.secret;
    if (!row.description && envVar.description?.trim()) row.description = envVar.description.trim();
    if (!envVar.secret && envVar.environment === 'development' && envVar.value)
      row.value = envVar.value;
    rows.set(envVar.key, row);
  }
  if (plan.kind === 'service') {
    const defaults = {
      user: 'app',
      database: slugify(input.snapshot.project.name).replaceAll('-', '_'),
    };
    const { user, password, database } = plan.keys;
    const docker = input.t('files.env.dockerDescription');
    if (user && !rows.has(user))
      rows.set(user, {
        key: user,
        group: 'docker',
        secret: false,
        value: defaults.user,
        description: docker,
      });
    if (database && !rows.has(database))
      rows.set(database, {
        key: database,
        group: 'docker',
        secret: false,
        value: defaults.database,
        description: docker,
      });
    if (!rows.has(password))
      rows.set(password, { key: password, group: 'docker', secret: true, description: docker });
  }
  for (const row of rows.values()) if (row.secret) delete row.value;
  return [...rows.values()];
}

/** Quotes a value only when a .env parser would read it differently. */
function envValue(value: string): string {
  return /[\s#"'\\]/.test(value) ? `"${value.replace(/["\\]/g, '\\$&')}"` : value;
}

/**
 * RN 3, 10: the keys the project needs, grouped by where they go. Secrets stay blank;
 * only safe development values show up.
 */
export function envExample(input: ExportInput, plan = composePlan(input)): string {
  const { t, snapshot, kit } = input;
  const rows = envRows(input, plan);
  const clientSide = kit?.projectTypes.includes('mobile') ? 'app' : 'front';
  const lines = [
    `# ${t('files.env.title', { name: snapshot.project.name })}`,
    `# ${t('files.env.generated')}`,
  ];
  if (rows.length === 0) lines.push('', `# ${t('files.env.empty')}`);
  for (const group of GROUPS) {
    const inGroup = rows.filter((row) => row.group === group);
    if (inGroup.length === 0) continue;
    const heading =
      group === 'client' ? `files.env.group.${clientSide}` : `files.env.group.${group}`;
    lines.push('', `# ${t(heading)}`);
    for (const row of inGroup) lines.push(`${row.key}=${row.value ? envValue(row.value) : ''}`);
  }
  return `${lines.join('\n')}\n`;
}

const SERVICES: Record<
  DatabaseEngine,
  {
    image: string;
    port: string;
    data: string;
    env: (keys: Extract<ComposePlan, { kind: 'service' }>['keys'], required: string) => string[];
  }
> = {
  postgres: {
    image: 'postgres',
    port: '5432',
    // From PostgreSQL 18 on, the image keeps its data under /var/lib/postgresql.
    data: '/var/lib/postgresql',
    env: (keys, required) => [
      `POSTGRES_USER: \${${keys.user}}`,
      `POSTGRES_PASSWORD: "\${${keys.password}:?${required}}"`,
      `POSTGRES_DB: \${${keys.database}}`,
    ],
  },
  mysql: {
    image: 'mysql',
    port: '3306',
    data: '/var/lib/mysql',
    env: (keys, required) => [
      `MYSQL_USER: \${${keys.user}}`,
      `MYSQL_PASSWORD: "\${${keys.password}:?${required}}"`,
      `MYSQL_DATABASE: \${${keys.database}}`,
      `MYSQL_RANDOM_ROOT_PASSWORD: "yes"`,
    ],
  },
  sqlserver: {
    image: 'mcr.microsoft.com/mssql/server',
    port: '1433',
    data: '/var/opt/mssql',
    env: (keys, required) => [
      `ACCEPT_EULA: "Y"`,
      `MSSQL_SA_PASSWORD: "\${${keys.password}:?${required}}"`,
    ],
  },
};

/**
 * RN 3, 16: the database service for development. Passwords come from .env and never
 * appear in the file; without a database to run, the file explains what is missing.
 */
export function dockerCompose(input: ExportInput, plan = composePlan(input)): string | undefined {
  if (plan.kind === 'none') return undefined;
  const { t, snapshot } = input;
  const lines = [
    `# ${t('files.compose.title', { name: snapshot.project.name })}`,
    `# ${t('files.compose.generated')}`,
  ];
  if (plan.kind !== 'service') {
    const reason =
      plan.kind === 'unknown'
        ? t('files.compose.unknown', { choice: plan.choice })
        : t(`files.compose.${plan.kind}`);
    lines.push(`# ${reason}`, '', 'services: {}');
    return `${lines.join('\n')}\n`;
  }
  const service = SERVICES[plan.engine];
  lines.push(
    `# ${t('files.compose.version')}`,
    '',
    'services:',
    '  db:',
    `    image: ${service.image}`,
    '    restart: unless-stopped',
    '    environment:',
    ...service
      .env(plan.keys, t('files.compose.required', { key: plan.keys.password }))
      .map((line) => `      ${line}`),
    '    ports:',
    `      - "${service.port}:${service.port}"`,
    '    volumes:',
    `      - db-data:${service.data}`,
    '',
    'volumes:',
    '  db-data:',
  );
  return `${lines.join('\n')}\n`;
}

/** RN 16: the stack's .gitignore; .env stays out, .env.example goes in. */
export function gitignore({ kit, t }: Pick<ExportInput, 'kit' | 't'>): string {
  const lines = kit?.gitignore ?? ['.env', '.DS_Store'];
  return `# ${t('files.gitignore.title')}\n${lines.join('\n')}\n`;
}

/** Markdown table cell: one line, pipes escaped. */
const cell = (text: string) => text.replace(/\s*\n\s*/g, ' ').replace(/\|/g, '\\|');
const code = (text: string) => `\`${text}\``;

/**
 * RN 10, 16: the README with "Como rodar localmente" (prerequisites, steps in order,
 * every variable with what it is for and where to get it), the folders and the map.
 */
export function readme(input: ExportInput, plan = composePlan(input)): string {
  const { t, snapshot, kit, language } = input;
  const model = exportModel(input);
  const slug = slugify(snapshot.project.name);
  const rows = envRows(input, plan);
  const out: string[] = [`# ${snapshot.project.name}`, ''];
  if (model.goal) out.push(model.goal, '');
  if (model.kitName) out.push(t('files.readme.stack', { kit: model.kitName }), '');

  out.push(`## ${t('files.readme.runLocally')}`, '', `### ${t('files.readme.prerequisites')}`, '');
  const prerequisites = kit
    ? kit.prerequisites.map((name) => (typeof name === 'string' ? name : name[language]))
    : ['Git'];
  if (plan.kind === 'service') prerequisites.push('Docker');
  out.push(...prerequisites.map((name) => `- ${name}`), '');

  out.push(`### ${t('files.readme.steps')}`, '');
  const steps: { title: string; commands: string[] }[] = [
    {
      title: t('files.readme.clone'),
      commands: [
        `git clone https://github.com/${t('files.readme.githubUser')}/${slug}.git`,
        `cd ${slug}`,
      ],
    },
  ];
  const kitStep = (step: { title: Record<string, string>; command: string }) => ({
    title: `${step.title[language] ?? ''}:`,
    commands: [step.command],
  });
  if (kit) steps.push(...kit.runLocally.install.map(kitStep));
  if (rows.length > 0)
    steps.push({ title: t('files.readme.copyEnv'), commands: ['cp .env.example .env'] });
  if (plan.kind === 'service')
    steps.push({ title: t('files.readme.startDatabase'), commands: ['docker compose up -d'] });
  if (kit) steps.push(...kit.runLocally.run.map(kitStep));
  steps.forEach((step, index) => {
    out.push(
      `${index + 1}. ${step.title}`,
      '   ```bash',
      ...step.commands.map((c) => `   ${c}`),
      '   ```',
    );
  });
  out.push('');
  if (!kit) out.push(t('files.readme.noStack'), '');

  out.push(`### ${t('files.readme.variables')}`, '');
  if (rows.length === 0) out.push(t('files.readme.noVariables'), '');
  else {
    out.push(
      `| ${t('files.readme.table.key')} | ${t('files.readme.table.what')} | ${t('files.readme.table.howToGet')} |`,
      '| --- | --- | --- |',
    );
    for (const row of rows) {
      const hint = envHowToGet(snapshot, kit, row.key);
      const howToGet = hint
        ? cell(hint[language])
        : row.value
          ? t('files.readme.example', { value: code(row.value) })
          : row.group === 'docker' && row.secret
            ? t('files.readme.localPassword')
            : '—';
      const key = row.secret ? `${code(row.key)} ${t('files.readme.secret')}` : code(row.key);
      out.push(`| ${key} | ${row.description ? cell(row.description) : '—'} | ${howToGet} |`);
    }
    out.push('', t('files.readme.noSecrets'), '');
  }

  if (kit && kit.folders.length > 0) {
    out.push(
      `## ${t('files.readme.folders')}`,
      '',
      `| ${t('files.readme.table.path')} | ${t('files.readme.table.contains')} |`,
      '| --- | --- |',
    );
    for (const folder of kit.folders)
      out.push(`| ${code(folder.path)} | ${cell(folder.what[language])} |`);
    out.push('');
  }

  out.push(
    `## ${t('files.readme.map')}`,
    '',
    '```mermaid',
    mapMermaid(input, model).trimEnd(),
    '```',
    '',
  );

  if (model.notes.length > 0) {
    out.push(
      `## ${t('files.readme.notes')}`,
      '',
      ...model.notes.map((note) => `- ${cell(note)}`),
      '',
    );
  }
  if (model.risks.length > 0) {
    out.push(`## ${t('files.readme.risks')}`, '');
    for (const risk of model.risks) {
      const where = risk.item ? ` (${risk.item})` : '';
      out.push(`- **${t(`status.severity.${risk.severity}`)}** · ${cell(risk.text)}${where}`);
    }
    out.push('');
  }

  out.push('---', '', t('files.readme.footer'));
  return `${out.join('\n')}\n`;
}

/** RN 16: the repository start kit, in the order the Pronto para codar screen lists it. */
export function repoFiles(input: ExportInput): GeneratedFile[] {
  const plan = composePlan(input);
  const files: GeneratedFile[] = [
    { path: 'README.md', content: readme(input, plan) },
    { path: '.env.example', content: envExample(input, plan) },
    { path: '.gitignore', content: gitignore(input) },
  ];
  const compose = dockerCompose(input, plan);
  if (compose) files.push({ path: DOCKER_FILE, content: compose });
  return files;
}
