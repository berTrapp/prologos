import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { unzipSync, strFromU8 } from 'fflate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { workspaceStore } from '@/app/services';
import { KITS, findKit } from '@/content/kits';
import {
  EMPTY_ANSWERS,
  buildProjectFromAnswers,
  type GuidedAnswers,
} from '@/domain/rules/guided-start';
import i18n from '@/i18n';
import { notify } from '@/lib/notify';
import { renderApp, resetAppData } from '@/test/render-app';

/** Captures every download: its name and the file itself. */
function captureDownloads() {
  const files: { name: string; blob: Blob }[] = [];
  let pending: Blob | undefined;
  Object.assign(URL, {
    createObjectURL: vi.fn((blob: Blob) => {
      pending = blob;
      return 'blob:file';
    }),
    revokeObjectURL: vi.fn(),
  });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    if (pending) files.push({ name: this.download, blob: pending });
  });
  return files;
}

beforeEach(async () => {
  notify.dismiss();
  vi.restoreAllMocks();
  await i18n.changeLanguage('pt-BR');
  await resetAppData();
});

let counter = 0;
async function djangoProject(answers: Partial<GuidedAnswers> = {}) {
  const snapshot = buildProjectFromAnswers(
    {
      ...EMPTY_ANSWERS,
      name: 'Agenda de aulas',
      goal: 'Alunos marcam aulas e o professor confirma.',
      type: 'web',
      knownStack: 'none',
      ...answers,
    },
    findKit('django'),
    {
      id: `e-${++counter}`,
      now: Date.now(),
      createId: () => `eid-${++counter}`,
      language: 'pt-BR',
      unnamed: 'Projeto sem nome',
      noKitNames: { stack: 'Stack', database: 'Banco de dados', hosting: 'Hospedagem' },
      kits: KITS,
    },
  );
  await workspaceStore.getState().addProject(snapshot);
  return snapshot;
}

describe('Pronto para codar (RN 16)', () => {
  it('lists the essential decisions, previews the files and downloads the .zip', async () => {
    const user = userEvent.setup();
    const files = captureDownloads();
    const project = await djangoProject();
    await renderApp(`/p/${project.project.id}/pronto`);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Quase pronto para codar' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Faltam 3 decisões essenciais')).toBeInTheDocument();
    const essentials = screen.getByRole('heading', { name: 'Decisões essenciais' }).parentElement;
    if (!essentials) throw new Error('essentials');
    expect(within(essentials).getByText('Python + Django')).toBeInTheDocument();
    expect(within(essentials).getByText('0 de 5')).toBeInTheDocument();
    expect(within(essentials).getAllByText('A decidir')).toHaveLength(2);
    expect(within(essentials).getByText('Django Auth')).toBeInTheDocument();
    expect(within(essentials).getByText('4 variáveis')).toBeInTheDocument();

    expect(screen.getByRole('region', { name: 'Prévia de README.md' })).toHaveTextContent(
      'Como rodar localmente',
    );
    await user.click(screen.getByRole('tab', { name: '.env.example' }));
    expect(screen.getByRole('region', { name: 'Prévia de .env.example' })).toHaveTextContent(
      'SECRET_KEY=',
    );
    expect(screen.getByText('chore: estrutura inicial do projeto')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Baixar mesmo assim' }));
    expect(await screen.findByText('agenda-de-aulas.zip baixado')).toBeInTheDocument();
    const zip = files.find((file) => file.name === 'agenda-de-aulas.zip');
    if (!zip) throw new Error('zip');
    const entries = unzipSync(new Uint8Array(await zip.blob.arrayBuffer()));
    expect(Object.keys(entries)).toEqual([
      'agenda-de-aulas/README.md',
      'agenda-de-aulas/.env.example',
      'agenda-de-aulas/.gitignore',
      'agenda-de-aulas/docker-compose.yml',
    ]);
    const compose = strFromU8(entries['agenda-de-aulas/docker-compose.yml'] ?? new Uint8Array());
    expect(compose).toContain('O banco de dados ainda está a decidir');
  });

  it('says Pronto once the essential decisions are closed', async () => {
    const project = await djangoProject({
      experience: { python: 'known', django: 'known', tpl: 'known', htmx: 'known' },
      runsOn: { database: 0, hosting: 0 },
    });
    await renderApp(`/p/${project.project.id}/pronto`);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Pronto para codar' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Pronto para codar').length).toBeGreaterThan(1);
    expect(
      screen.getByRole('button', { name: 'Baixar o início do repositório' }),
    ).toBeInTheDocument();
  });

  it('opens from the checklist', async () => {
    const user = userEvent.setup();
    const project = await djangoProject();
    const { router } = await renderApp(`/p/${project.project.id}/checklist`);
    await user.click(await screen.findByRole('link', { name: 'Pronto para codar' }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(`/p/${project.project.id}/pronto`),
    );
  });
});

describe('Exportar (RN 10, 19)', () => {
  it('previews each format, copies it and downloads with a toast', async () => {
    const user = userEvent.setup();
    const files = captureDownloads();
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const project = await djangoProject({ runsOn: { database: 0 } });
    await renderApp(`/p/${project.project.id}/exportar`);

    expect(await screen.findByRole('heading', { level: 1, name: 'Exportar' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /\.env\.example/ })).toBeChecked();
    const preview = screen.getByRole('region', { name: 'Prévia de .env.example' });
    expect(preview).toHaveTextContent('DEBUG=True');

    await user.click(screen.getByRole('button', { name: 'Copiar' }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('SECRET_KEY='));
    expect(await screen.findByText('Copiado')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /docker-compose\.yml/ }));
    expect(screen.getByRole('region', { name: 'Prévia de docker-compose.yml' })).toHaveTextContent(
      'image: postgres',
    );
    await user.click(screen.getByRole('button', { name: 'Baixar docker-compose.yml' }));
    expect(await screen.findByText('docker-compose.yml baixado')).toBeInTheDocument();
    expect(files.at(-1)?.name).toBe('docker-compose.yml');
  });

  it('downloads the read-only mapa.html and the SVG image', async () => {
    const user = userEvent.setup();
    const files = captureDownloads();
    const project = await djangoProject();
    await renderApp(`/p/${project.project.id}/exportar`);

    await user.click(await screen.findByRole('radio', { name: /mapa\.html/ }));
    expect(screen.getByTitle('Prévia do mapa.html')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Baixar mapa.html' }));
    expect(await screen.findByText('mapa.html baixado')).toBeInTheDocument();
    const html = await files.at(-1)?.blob.text();
    expect(html).toContain('<!doctype html>');
    expect(html).not.toMatch(/<(input|textarea|form)\b/);

    await user.click(screen.getByRole('radio', { name: /mapa\.png/ }));
    await user.click(screen.getByRole('radio', { name: 'SVG' }));
    expect(screen.getByRole('img', { name: 'Prévia de mapa.svg' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Baixar mapa.svg' }));
    expect(await screen.findByText('mapa.svg baixado')).toBeInTheDocument();
  });

  it('keeps the options and never lets secrets out', async () => {
    const user = userEvent.setup();
    const project = await djangoProject();
    await renderApp(`/p/${project.project.id}/exportar`);
    await user.click(await screen.findByRole('radio', { name: /mapa\.mmd/ }));
    const preview = () => screen.getByRole('region', { name: 'Prévia de mapa.mmd' });
    expect(preview()).not.toHaveTextContent('Django REST Framework');

    await user.click(screen.getByRole('switch', { name: 'Incluir itens futuros' }));
    expect(preview()).toHaveTextContent('Django REST Framework (futuro)');
    expect(localStorage.getItem('prologos.exportOptions')).toContain('"futures":true');
    expect(
      screen.getByRole('switch', { name: 'Esconder valores secretos (sempre)' }),
    ).toBeDisabled();
  });

  it('shows an error with Tentar de novo when the file cannot be made', async () => {
    const user = userEvent.setup();
    Object.assign(URL, {
      createObjectURL: vi.fn(() => {
        throw new Error('blocked');
      }),
      revokeObjectURL: vi.fn(),
    });
    const project = await djangoProject();
    await renderApp(`/p/${project.project.id}/exportar`);
    await user.click(await screen.findByRole('button', { name: 'Baixar .env.example' }));
    expect(await screen.findByText('Não foi possível gerar .env.example')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
  });
});
