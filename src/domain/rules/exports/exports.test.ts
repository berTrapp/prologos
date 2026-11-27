import { JSDOM, VirtualConsole } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { KITS, KIT_ORDER, findKit } from '@/content/kits';
import { fixedTranslate } from '@/i18n/fixed-translate';
import type { Language } from '@/i18n/languages';
import tokens from '@/styles/tokens.css?raw';
import type { EnvVar } from '../../schemas/env';
import type { ProjectSnapshot } from '../../schemas/snapshot';
import { EMPTY_ANSWERS, buildProjectFromAnswers, type GuidedAnswers } from '../guided-start';
import { mapHtml } from './html';
import { mapMermaid } from './mermaid';
import { exportModel, slugify, type ExportInput, type ExportOptions } from './model';
import { parseTokens } from './palette';
import { composePlan, dockerCompose, envExample, readme, repoFiles } from './repo-files';
import { mapSvg } from './svg';

const palettes = parseTokens(tokens);
const OPTIONS: ExportOptions = { futures: true, notes: true };

/** Same answers, same ids: the files come out the same on every run. */
function project(
  kitId: string | undefined,
  language: Language,
  answers: Partial<GuidedAnswers> = {},
): ProjectSnapshot {
  let counter = 0;
  return buildProjectFromAnswers(
    {
      ...EMPTY_ANSWERS,
      name: 'Agenda de aulas',
      goal: 'Alunos marcam aulas e o professor confirma.',
      knownStack: 'none',
      ...answers,
    },
    findKit(kitId),
    {
      id: 'p1',
      now: 0,
      createId: () => `id-${++counter}`,
      language,
      unnamed: 'Projeto sem nome',
      noKitNames: { stack: 'Stack', database: 'Banco de dados', hosting: 'Hospedagem' },
      kits: KITS,
    },
  );
}

const input = (
  snapshot: ProjectSnapshot,
  language: Language,
  options: ExportOptions = OPTIONS,
): ExportInput => ({
  snapshot,
  kit: findKit(snapshot.project.kitId),
  language,
  t: fixedTranslate(language),
  options,
});

/** Every file the phase generates, by name. */
function allFiles(source: ExportInput): Record<string, string> {
  const files = Object.fromEntries(repoFiles(source).map((file) => [file.path, file.content]));
  return {
    ...files,
    'mapa.mmd': mapMermaid(source),
    'mapa.svg': mapSvg(source, { paint: (token) => palettes.dark[token] ?? '' }).svg,
    'mapa.html': mapHtml(source, palettes),
  };
}

const snapshotName = (path: string) => `${path.replace(/^\./, '')}.snap`;

describe('generated files of the 8 kits (RN 10, 16)', () => {
  for (const kitId of KIT_ORDER) {
    for (const language of ['pt-BR', 'en'] as const) {
      it(`${kitId} in ${language}`, async () => {
        // The recommended "Onde roda" option, as most people start.
        const snapshot = project(kitId, language, {
          runsOn: Object.fromEntries((findKit(kitId)?.runsOn ?? []).map((ref) => [ref, 0])),
        });
        const files = allFiles(input(snapshot, language));
        expect(Object.keys(files)).toContain('README.md');
        for (const [path, content] of Object.entries(files))
          await expect(content).toMatchFileSnapshot(
            `./__snapshots__/${kitId}/${language}/${snapshotName(path)}`,
          );
      });
    }
  }
});

describe('no secret leaves (RN 3, 10, 19)', () => {
  const SECRET = 'sk_live_never_export_this';
  const PRIVATE = 'nota-privada-nunca-sai';
  const STAGING = 'valor-de-homologacao';

  it.each(KIT_ORDER.map((id) => [id] as const))('%s', (kitId) => {
    const base = project(kitId, 'pt-BR', { runsOn: { database: 0 } });
    const first = base.items[0];
    if (!first) throw new Error('items');
    const leaked = {
      id: 'x',
      projectId: 'p1',
      key: 'LEAKED_TOKEN',
      environment: 'development',
      usedIn: ['back'],
      secret: true,
      value: SECRET,
    } as unknown as EnvVar;
    const snapshot: ProjectSnapshot = {
      ...base,
      envVars: [
        ...base.envVars,
        leaked,
        {
          id: 'y',
          projectId: 'p1',
          key: 'APP_MODE',
          environment: 'staging',
          usedIn: ['back'],
          secret: false,
          value: STAGING,
        },
      ],
      notes: [
        { id: 'n', projectId: 'p1', itemId: first.id, text: PRIVATE, private: true, createdAt: 0 },
        { id: 'm', projectId: 'p1', text: 'Nota pública', private: false, createdAt: 0 },
      ],
    };
    const files = allFiles(input(snapshot, 'pt-BR'));
    const kit = findKit(kitId);
    for (const [path, content] of Object.entries(files)) {
      expect(content, path).not.toContain(SECRET);
      expect(content, path).not.toContain(PRIVATE);
      expect(content, path).not.toContain(STAGING);
    }
    const env = files['.env.example'] ?? '';
    expect(env).toMatch(/^LEAKED_TOKEN=$/m);
    for (const secret of kit?.envVars.filter((v) => v.secret) ?? [])
      expect(env).toMatch(new RegExp(`^${secret.key}=$`, 'm'));
    expect(files['README.md']).toContain('Nota pública');
  });

  it('keeps notes and risks out when the option is off', () => {
    const base = project('django', 'pt-BR');
    const snapshot: ProjectSnapshot = {
      ...base,
      notes: [{ id: 'm', projectId: 'p1', text: 'Nota pública', private: false, createdAt: 0 }],
      risks: [
        {
          id: 'r',
          projectId: 'p1',
          text: 'Prazo curto',
          severity: 'high',
          resolved: false,
          createdAt: 0,
        },
      ],
    };
    const on = readme(input(snapshot, 'pt-BR'));
    expect(on).toContain('**Alta** · Prazo curto');
    const off = readme(input(snapshot, 'pt-BR', { futures: false, notes: false }));
    expect(off).not.toContain('Nota pública');
    expect(off).not.toContain('Prazo curto');
  });
});

describe('docker-compose.yml (RN 16)', () => {
  const compose = (choice: number | undefined, kitId = 'laravel-react') => {
    const snapshot = project(kitId, 'pt-BR', {
      runsOn: choice === undefined ? {} : { database: choice },
    });
    const source = input(snapshot, 'pt-BR');
    return { plan: composePlan(source), file: dockerCompose(source) ?? '', source };
  };

  it('runs PostgreSQL with the password read from .env', () => {
    const { plan, file, source } = compose(0);
    expect(plan).toMatchObject({ kind: 'service', engine: 'postgres' });
    expect(file).toContain('image: postgres');
    expect(file).toContain('POSTGRES_PASSWORD: "${DB_PASSWORD:?defina DB_PASSWORD no .env}"');
    expect(envExample(source)).toMatch(/^DB_PASSWORD=$/m);
  });

  it('runs MySQL with a random root password', () => {
    const { file } = compose(1);
    expect(file).toContain('image: mysql');
    expect(file).toContain('MYSQL_RANDOM_ROOT_PASSWORD: "yes"');
    // The app user may create the test and shadow databases, read from .env like the rest.
    expect(file).toContain('target: /docker-entrypoint-initdb.d/dev-grants.sql');
    expect(file).toContain("GRANT ALL PRIVILEGES ON *.* TO '${DB_USERNAME}'@'%';");
    expect(compose(0).file).not.toContain('dev-grants');
  });

  it('runs SQL Server for .NET and adds the Docker keys to .env.example', () => {
    const { plan, file, source } = compose(1, 'dotnet-react');
    expect(plan).toMatchObject({ engine: 'sqlserver', keys: { password: 'DB_PASSWORD' } });
    expect(file).toContain('MSSQL_SA_PASSWORD');
    expect(envExample(source)).toContain('# Docker (lidas pelo docker-compose.yml)\nDB_PASSWORD=');
  });

  it('explains what is missing with SQLite, an undecided or skipped database', () => {
    expect(compose(2).file).toContain('SQLite');
    expect(compose(2).file).toContain('services: {}');
    expect(compose(undefined).plan).toEqual({ kind: 'pending' });
    const snapshot = project('laravel-react', 'pt-BR');
    const skipped = {
      ...snapshot,
      checklist: snapshot.checklist.map((row) =>
        row.itemRef === 'database' ? { ...row, notApplicable: { reason: 'Sem banco' } } : row,
      ),
    };
    expect(composePlan({ snapshot: skipped, kit: findKit('laravel-react') })).toEqual({
      kind: 'notApplicable',
    });
  });

  it('names a database it cannot run and leaves out the file for kits without Docker', () => {
    const snapshot = project('laravel-react', 'pt-BR');
    const mongo = {
      ...snapshot,
      items: snapshot.items.map((item) =>
        item.kitRef === 'database'
          ? { ...item, state: 'decided' as const, choice: 'MongoDB' }
          : item,
      ),
    };
    const source = input(mongo, 'pt-BR');
    expect(dockerCompose(source)).toContain('serviço de MongoDB');
    const astro = input(project('static-astro', 'pt-BR'), 'pt-BR');
    expect(dockerCompose(astro)).toBeUndefined();
    expect(repoFiles(astro).map((file) => file.path)).toEqual([
      'README.md',
      '.env.example',
      '.gitignore',
    ]);
  });
});

describe('files of a project without a kit', () => {
  it('still has a README, a .env.example and a .gitignore that keeps .env out', () => {
    const source = input({ ...project(undefined, 'pt-BR'), envVars: [] }, 'pt-BR');
    const files = Object.fromEntries(repoFiles(source).map((f) => [f.path, f.content]));
    expect(files['README.md']).toContain('ainda falta decidir no mapa');
    expect(files['README.md']).toContain('O projeto ainda não tem variáveis de ambiente.');
    expect(files['.env.example']).toContain('O projeto ainda não tem variáveis.');
    expect(files['.gitignore']).toMatch(/^\.env$/m);
  });

  it('quotes values a .env parser would split', () => {
    const base = project(undefined, 'pt-BR');
    const snapshot: ProjectSnapshot = {
      ...base,
      envVars: [
        {
          id: 'a',
          projectId: 'p1',
          key: 'APP_NAME',
          environment: 'development',
          usedIn: ['other'],
          secret: false,
          value: 'Agenda "de" aulas',
        },
      ],
    };
    expect(envExample(input(snapshot, 'pt-BR'))).toContain(
      '# Outras\nAPP_NAME="Agenda \\"de\\" aulas"',
    );
  });
});

describe('export model', () => {
  it('hides future items in Hoje and keeps the refs of Completo', () => {
    const snapshot = project('django', 'pt-BR');
    const complete = exportModel(input(snapshot, 'pt-BR'));
    const today = exportModel(input(snapshot, 'pt-BR', { futures: false, notes: false }));
    expect(today.items.length).toBeLessThan(complete.items.length);
    for (const item of today.items)
      expect(complete.items.find((i) => i.id === item.id)?.ref).toBe(item.ref);
    expect(today.view).toBe('today');
  });

  it('names custom zones and subzones and slugifies names', () => {
    const snapshot = project('django', 'pt-BR');
    const app = snapshot.zones.find((zone) => zone.key === 'app');
    if (!app) throw new Error('app');
    const withSub: ProjectSnapshot = {
      ...snapshot,
      zones: [
        ...snapshot.zones,
        {
          id: 'sub',
          projectId: 'p1',
          parentId: app.id,
          name: 'Pagamentos',
          color: 'app',
          order: 0,
          collapsed: true,
        },
      ],
      items: [
        ...snapshot.items,
        {
          id: 'pay',
          projectId: 'p1',
          zoneId: 'sub',
          name: 'Stripe "Checkout"',
          state: 'decided',
          when: 'now',
          newForYou: false,
          order: 0,
          description: ' Cobrança ',
        },
      ],
    };
    const source = input(withSub, 'pt-BR');
    const model = exportModel(source);
    const zoneNames = model.zones.map((zone) => zone.name);
    expect(zoneNames.indexOf('Pagamentos')).toBe(zoneNames.indexOf('Aplicação') + 1);
    expect(model.items.find((item) => item.id === 'pay')?.description).toBe('Cobrança');
    expect(mapMermaid(source)).toContain('Stripe #quot;Checkout#quot;');
    expect(mapSvg(source, { paint: () => 'x' }).svg).toContain('Stripe &quot;Checkout&quot;');
    expect(slugify('Ação & Reação!')).toBe('acao-reacao');
    expect(slugify('!!!')).toBe('projeto');
  });
});

describe('mapa.html (RN 19)', () => {
  const html = mapHtml(input(project('laravel-react', 'pt-BR'), 'pt-BR'), palettes);

  it('needs no network and has nothing to edit', () => {
    expect(html).not.toMatch(/<(input|textarea|select|form|link|iframe|img)\b/i);
    expect(html).not.toMatch(
      /contenteditable|fetch\(|XMLHttpRequest|WebSocket|@import|src=|href=/i,
    );
    const urls = html.match(/https?:\/\/[^\s"')]+/g) ?? [];
    expect(urls.every((url) => url === 'http://www.w3.org/2000/svg')).toBe(true);
  });

  it('opens offline, switches views, highlights a flow and shows an item read-only', () => {
    const errors: string[] = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', (error) => errors.push(error.message));
    const { window } = new JSDOM(html, { runScripts: 'dangerously', virtualConsole });
    const { document } = window;
    expect(errors).toEqual([]);

    const today = document.querySelector<HTMLButtonElement>('[data-view-button="today"]');
    today?.click();
    expect(document.querySelector<HTMLElement>('[data-view="complete"]')?.hidden).toBe(true);
    expect(today?.getAttribute('aria-pressed')).toBe('true');

    document.querySelector<HTMLButtonElement>('[data-flow="0"]')?.click();
    const stage = document.querySelector('[data-view="today"]');
    expect(stage?.classList.contains('flowing')).toBe(true);
    expect(stage?.querySelectorAll('.edge.on').length).toBeGreaterThan(0);

    document.querySelector<HTMLButtonElement>('[data-zone-button]')?.click();
    expect(stage?.classList.contains('filtering')).toBe(true);

    const item = stage?.querySelector<SVGGElement>('.item');
    item?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const details = document.getElementById('details');
    expect(details?.hidden).toBe(false);
    expect(document.getElementById('d-name')?.textContent).toBeTruthy();
    window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
    expect(details?.hidden).toBe(true);

    document.getElementById('zoom-in')?.click();
    expect(stage?.getAttribute('style')).toContain('scale(');
    expect(errors).toEqual([]);
  });

  it('without future items shows only Hoje', () => {
    const today = mapHtml(
      input(project('django', 'en'), 'en', { futures: false, notes: false }),
      palettes,
    );
    expect(today).not.toMatch(/<button[^>]*data-view-button/);
    expect(today).toContain('<html lang="en">');
  });
});

describe('a hand-drawn map', () => {
  /** Items in three columns and two rows, so connections leave every side of a card. */
  function drawn(): ProjectSnapshot {
    const base = project(undefined, 'pt-BR', { goal: '' });
    const zone = (key: string) => base.zones.find((z) => z.key === key)?.id ?? '';
    const item = (id: string, zoneId: string, order: number, patch = {}) => ({
      id,
      projectId: 'p1',
      zoneId,
      name: id,
      state: 'decided' as const,
      when: 'now' as const,
      newForYou: false,
      order,
      ...patch,
    });
    const link = (id: string, from: string, to: string, type?: 'uses') => ({
      id,
      projectId: 'p1',
      from,
      to,
      ...(type ? { type } : {}),
    });
    return {
      ...base,
      zones: [
        ...base.zones,
        {
          id: 'empty',
          projectId: 'p1',
          parentId: null,
          name: 'Vazia',
          color: 'data',
          order: 20,
          collapsed: false,
        },
        {
          id: 'outer',
          projectId: 'p1',
          parentId: null,
          name: 'Externa',
          color: 'ui',
          order: 21,
          collapsed: false,
        },
        {
          id: 'inner',
          projectId: 'p1',
          parentId: 'outer',
          name: 'Interna',
          color: 'ui',
          order: 0,
          collapsed: false,
        },
      ],
      items: [
        item('A', zone('method'), 0),
        item('B', zone('tools'), 0, { choice: 'B' }),
        item('C', zone('ui'), 0, { kitRef: 'skipped' }),
        item('D', zone('method'), 1),
        item('E', zone('app'), 0, { state: 'pending' }),
        item('F', 'inner', 0),
      ],
      connections: [
        link('ab', 'A', 'B', 'uses'),
        link('ba', 'B', 'A'),
        link('ad', 'A', 'D'),
        link('ea', 'E', 'A'),
        link('cf', 'C', 'F'),
      ],
      flows: [
        { id: 'f', projectId: 'p1', name: 'Ida e volta', steps: ['ab', 'gone', 'ba'] },
        { id: 'g', projectId: 'p1', name: 'Só lacuna', steps: ['gone'] },
      ],
      checklist: [
        {
          id: 'k',
          projectId: 'p1',
          zoneId: zone('ui'),
          itemRef: 'skipped',
          notApplicable: { reason: 'Não' },
          order: 0,
        },
      ],
      risks: [
        {
          id: 'r1',
          projectId: 'p1',
          itemId: 'A',
          text: 'Risco do A',
          severity: 'low',
          resolved: false,
          createdAt: 0,
        },
        {
          id: 'r2',
          projectId: 'p1',
          text: 'Resolvido',
          severity: 'high',
          resolved: true,
          createdAt: 0,
        },
      ],
      envVars: [],
    };
  }

  it('draws every kind of item and connection', () => {
    const source = input(drawn(), 'pt-BR');
    const mermaid = mapMermaid(source);
    expect(mermaid).toContain('(não se aplica)');
    expect(mermaid).toMatch(/class n\d+ muted/);
    expect(mermaid).toMatch(/n\d+ --> n\d+/);
    expect(mermaid).not.toContain('Vazia');
    expect(mermaid).toContain('subgraph');
    expect(mermaid).toContain('Fluxo "Ida e volta": A → B → A');
    expect(mermaid).not.toContain('Só lacuna');

    const { svg } = mapSvg(source, { paint: (token) => `var(--${token})` });
    expect(svg.match(/class="edge"/g)).toHaveLength(5);
    expect(svg).toContain('opacity="0.5"');
    expect(svg).not.toContain('font-size="13" fill="var(--muted)"');

    const html = mapHtml(source, palettes);
    expect(html).toContain('Risco do A');
    expect(html).not.toContain('Resolvido');
    expect(readme(source)).toContain('· Risco do A (A)');
  });

  it('opens the map without a goal and without flows', () => {
    const snapshot = { ...drawn(), flows: [] };
    const html = mapHtml(input(snapshot, 'pt-BR'), palettes);
    expect(html).not.toContain('data-flow=');
    expect(html).not.toContain('<p>');
    expect(readme(input(snapshot, 'pt-BR'))).toMatch(/^# Agenda de aulas\n\n## /);
  });
});
