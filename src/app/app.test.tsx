import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { workspaceStore } from '@/app/services';
import i18n from '@/i18n';
import { notify } from '@/lib/notify';
import { renderApp, resetAppData } from '@/test/render-app';

beforeEach(async () => {
  notify.dismiss();
  await i18n.changeLanguage('pt-BR');
  await resetAppData();
});

const create = (name: string) => workspaceStore.getState().createProject({ name, type: 'web' });

describe('home (RN 4, 18)', () => {
  it('invites to create the first project and creates it with the keyboard', async () => {
    const user = userEvent.setup();
    const { router } = await renderApp('/');
    expect(await screen.findByText('Comece o primeiro projeto')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Novo projeto' }));
    const dialog = await screen.findByRole('dialog', { name: 'Novo projeto' });
    expect(within(dialog).getByLabelText('Nome do projeto')).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(within(dialog).getByText('Dê um nome ao projeto.')).toBeInTheDocument();

    await user.keyboard('Agenda de aulas{Enter}');
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/p\//));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Agenda de aulas' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Checklist' })).toBeInTheDocument();
  });

  it('changes status from the card menu, with Desfazer in the toast', async () => {
    const user = userEvent.setup();
    await create('Agenda de aulas');
    await renderApp('/');

    await user.click(await screen.findByRole('button', { name: 'Ações de Agenda de aulas' }));
    await user.click(await screen.findByRole('menuitemradio', { name: 'Pausado' }));
    expect(await screen.findByText('Status: Pausado')).toBeInTheDocument();
    await waitFor(() =>
      expect(workspaceStore.getState().projects[0]?.project.status).toBe('paused'),
    );

    await user.click(screen.getByRole('button', { name: 'Desfazer' }));
    await waitFor(() =>
      expect(workspaceStore.getState().projects[0]?.project.status).toBe('planning'),
    );
  });

  it('archives a project out of the main list and shows it under "Ver arquivados"', async () => {
    const user = userEvent.setup();
    await create('Portfólio');
    await create('Agenda de aulas');
    await renderApp('/');

    await user.click(await screen.findByRole('button', { name: 'Ações de Portfólio' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Arquivar' }));
    expect(await screen.findByText('Projeto arquivado')).toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: 'Ver arquivados (1)' }));
    expect(screen.getByRole('heading', { name: 'Arquivados' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Portfólio' })).toBeInTheDocument();
  });

  it('shows the backup reminder and "Lembrar depois" hides it', async () => {
    const user = userEvent.setup();
    await create('Agenda de aulas');
    await renderApp('/');
    expect(await screen.findByText('Você ainda não fez backup')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Lembrar depois' }));
    await waitFor(() =>
      expect(screen.queryByText('Você ainda não fez backup')).not.toBeInTheDocument(),
    );
  });
});

describe('trash (RN 11)', () => {
  it('moving to the trash offers Desfazer; the trash restores it whole', async () => {
    const user = userEvent.setup();
    await create('Agenda de aulas');
    const { router } = await renderApp('/');

    await user.click(await screen.findByRole('button', { name: 'Ações de Agenda de aulas' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Mover para a lixeira' }));
    expect(await screen.findByText('Projeto movido para a lixeira')).toBeInTheDocument();
    await waitFor(() => expect(workspaceStore.getState().projects).toHaveLength(0));

    await router.navigate('/lixeira');
    expect(await screen.findByRole('heading', { level: 1, name: 'Lixeira' })).toBeInTheDocument();
    expect(screen.getByText('Some em 30 dias')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Restaurar' }));
    expect(await screen.findByText('Agenda de aulas restaurado')).toBeInTheDocument();
    await waitFor(() => expect(workspaceStore.getState().projects).toHaveLength(1));
    expect(screen.getByText('A lixeira está vazia')).toBeInTheDocument();
  });

  it('emptying asks for confirmation, the only one in the app', async () => {
    const user = userEvent.setup();
    const id = await create('Agenda de aulas');
    await workspaceStore.getState().moveProjectToTrash(id);
    await renderApp('/lixeira');

    await user.click(await screen.findByRole('button', { name: 'Esvaziar lixeira' }));
    const dialog = await screen.findByRole('dialog', { name: 'Esvaziar a lixeira' });
    expect(within(dialog).getByText(/1 item será apagado de vez/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Esvaziar lixeira' }));
    expect(await screen.findByText('Lixeira esvaziada')).toBeInTheDocument();
    expect(workspaceStore.getState().trash).toHaveLength(0);
  });
});

describe('settings (RN 17, 18)', () => {
  it('switches language live', async () => {
    const user = userEvent.setup();
    await renderApp('/configuracoes');
    await user.click(await screen.findByRole('radio', { name: 'English' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
    await i18n.changeLanguage('pt-BR');
  });

  it('exports every project as prologos.json and records the backup', async () => {
    const user = userEvent.setup();
    await create('Agenda de aulas');
    const createObjectURL = vi.fn(() => 'blob:backup');
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    await renderApp('/configuracoes');
    expect(
      await screen.findByText('Seus projetos ficam salvos só neste navegador'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Exportar tudo' }));

    expect(await screen.findByText('Backup salvo · 1 projeto')).toBeInTheDocument();
    expect(click).toHaveBeenCalled();
    expect(workspaceStore.getState().settings.lastBackupCount).toBe(1);
    click.mockRestore();
  });

  it('turns the backup reminder off', async () => {
    const user = userEvent.setup();
    await renderApp('/configuracoes');
    await user.click(await screen.findByRole('switch', { name: /Lembrar de fazer backup/ }));
    await waitFor(() => expect(workspaceStore.getState().settings.backupReminder).toBe(false));
  });
});

describe('navigation (ux-ui 1, 9, 10)', () => {
  it('Ctrl K opens the palette and goes to a page', async () => {
    const user = userEvent.setup();
    const { router } = await renderApp('/');
    await screen.findByText('Comece o primeiro projeto');
    await user.keyboard('{Control>}k{/Control}');
    const palette = await screen.findByRole('dialog', { name: 'Paleta de comandos' });
    await user.type(within(palette).getByRole('combobox'), 'config');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(router.state.location.pathname).toBe('/configuracoes'));
  });

  it('the sidebar collapses from its top and remembers it', async () => {
    const user = userEvent.setup();
    await renderApp('/configuracoes');
    await user.click(await screen.findByRole('button', { name: 'Recolher' }));
    expect(screen.getByRole('button', { name: 'Expandir' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(localStorage.getItem('prologos.sidebarCollapsed')).toBe('true');
  });

  it('an unknown project says so and points to the trash', async () => {
    await renderApp('/p/nao-existe');
    expect(await screen.findByText('Projeto não encontrado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver lixeira' })).toHaveAttribute('href', '/lixeira');
  });
});
