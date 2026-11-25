import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { projectStore, repository, workspaceStore } from '@/app/services';
import { KITS, findKit } from '@/content/kits';
import { EMPTY_ANSWERS, buildProjectFromAnswers } from '@/domain/rules/guided-start';
import i18n from '@/i18n';
import { notify } from '@/lib/notify';
import { renderApp, resetAppData } from '@/test/render-app';

beforeEach(async () => {
  notify.dismiss();
  await i18n.changeLanguage('pt-BR');
  await resetAppData();
});

let counter = 0;
async function djangoProject(knownStack: 'django' | 'none') {
  const snapshot = buildProjectFromAnswers(
    { ...EMPTY_ANSWERS, name: 'Agenda de aulas', type: 'web', knownStack },
    findKit('django'),
    {
      id: `c-${++counter}`,
      now: Date.now(),
      createId: () => `cid-${++counter}`,
      language: 'pt-BR',
      unnamed: 'Projeto sem nome',
      noKitNames: { stack: 'Stack', database: 'Banco de dados', hosting: 'Hospedagem' },
      kits: KITS,
    },
  );
  await workspaceStore.getState().addProject(snapshot);
  return snapshot;
}

const saved = async (id: string) => {
  await projectStore.getState().flush();
  const snapshot = await repository.loadProject(id);
  if (!snapshot) throw new Error('project');
  return snapshot;
};

const row = (name: string) => {
  const label = screen.getByText(name, { selector: 'span' });
  const li = label.closest('li');
  if (!li) throw new Error(name);
  return li;
};

describe('checklist (RN 5, 15)', () => {
  it('shows the next step, the share resolved and the zones in order', async () => {
    const project = await djangoProject('django');
    await renderApp(`/p/${project.project.id}/checklist`);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'O que falta decidir' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Decidir: Banco de dados')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /de cobertura/ })).toBeInTheDocument();
    expect(screen.getByText(/de \d+ resolvidos/)).toBeInTheDocument();
    const zones = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(zones.slice(0, 3)).toEqual(['Dados', 'Infraestrutura', 'Segurança']);
    expect(screen.queryByText('Preparar o ambiente')).toBeNull();
  });

  it('marks a step of "Preparar o ambiente" and the next step moves on', async () => {
    const user = userEvent.setup();
    const project = await djangoProject('none');
    await renderApp(`/p/${project.project.id}/checklist`);
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Preparar o ambiente' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Instalar o Python', { selector: 'p' })).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Instalar o Python' }));
    expect(
      await screen.findByText('Criar e ativar o ambiente virtual', { selector: 'p' }),
    ).toBeInTheDocument();
    await waitFor(async () =>
      expect((await saved(project.project.id)).project.prepDone).toEqual([0]),
    );
  });

  it('marking in the checklist reflects on the map, and the map on the checklist', async () => {
    const user = userEvent.setup();
    const project = await djangoProject('django');
    const { router } = await renderApp(`/p/${project.project.id}/checklist`);
    await screen.findByRole('heading', { level: 1, name: 'O que falta decidir' });

    await user.click(
      within(row('Hospedagem')).getByRole('button', { name: 'Marcar Hospedagem como decidido' }),
    );
    await waitFor(async () => {
      const item = (await saved(project.project.id)).items.find((i) => i.kitRef === 'hosting');
      expect(item?.state).toBe('decided');
    });

    // Deciding on the map shows up in the checklist.
    await user.click(
      within(row('Banco de dados')).getByRole('button', { name: /Decidir no mapa/ }),
    );
    await waitFor(() => expect(router.state.location.pathname).toBe(`/p/${project.project.id}`));
    // The map loads its own chunk; under a loaded CI machine it can take a few seconds.
    const panel = await screen.findByRole('complementary', { name: 'Detalhes' }, { timeout: 8000 });
    await user.click(within(panel).getByRole('radio', { name: /^PostgreSQL/ }));
    await router.navigate(`/p/${project.project.id}/checklist`);
    await screen.findByRole(
      'heading',
      { level: 1, name: 'O que falta decidir' },
      { timeout: 8000 },
    );
    expect(within(row('Banco de dados')).getByText('Decidido')).toBeInTheDocument();
  });

  it('"Não se aplica" asks a reason, shows on the map and comes back with Desfazer', async () => {
    const user = userEvent.setup();
    const project = await djangoProject('django');
    await renderApp(`/p/${project.project.id}/checklist`);
    await screen.findByRole('heading', { level: 1, name: 'O que falta decidir' });

    await user.click(within(row('Backup')).getByRole('button', { name: 'Não se aplica' }));
    const popover = await screen.findByRole('dialog');
    await user.click(within(popover).getByRole('button', { name: 'Marcar' }));
    expect(within(popover).getByText('Escreva um motivo curto.')).toBeInTheDocument();
    await user.type(
      within(popover).getByLabelText('Por que não se aplica'),
      'Sem dados reais{Enter}',
    );

    const toast = await screen.findByText('Backup: não se aplica');
    expect(within(row('Backup')).getByText('Motivo: Sem dados reais')).toBeInTheDocument();
    await waitFor(async () => {
      const expectation = (await saved(project.project.id)).checklist.find(
        (c) => c.itemRef === 'backup',
      );
      expect(expectation?.notApplicable).toEqual({ reason: 'Sem dados reais' });
    });

    const li = toast.closest('li');
    if (!li) throw new Error('toast');
    await user.click(within(li).getByRole('button', { name: 'Desfazer' }));
    await waitFor(async () => {
      const expectation = (await saved(project.project.id)).checklist.find(
        (c) => c.itemRef === 'backup',
      );
      expect(expectation?.notApplicable).toBeUndefined();
    });
  });

  it('offers to add back an expected item that left the map', async () => {
    const user = userEvent.setup();
    const project = await djangoProject('django');
    const https = project.items.find((i) => i.kitRef === 'https');
    if (!https) throw new Error('https');
    await renderApp(`/p/${project.project.id}/checklist`);
    await screen.findByRole('heading', { level: 1, name: 'O que falta decidir' });
    await projectStore.getState().moveToTrash('item', https.id, 'HTTPS');

    await user.click(
      await within(row('HTTPS')).findByRole('button', { name: 'Adicionar ao mapa' }),
    );
    await waitFor(async () =>
      expect((await saved(project.project.id)).items.some((i) => i.kitRef === 'https')).toBe(true),
    );
  });

  it('shows the share next to "Checklist" in the sidebar', async () => {
    const project = await djangoProject('django');
    await renderApp(`/p/${project.project.id}/checklist`);
    expect(await screen.findByText(/^\d+% resolvido$/)).toBeInTheDocument();
  });
});
