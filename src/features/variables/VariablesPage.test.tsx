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
async function laravelProject(withVars = true) {
  const snapshot = buildProjectFromAnswers(
    { ...EMPTY_ANSWERS, name: 'API de pedidos', type: 'web', knownStack: 'laravel' },
    findKit('laravel-react'),
    {
      id: `v-${++counter}`,
      now: Date.now(),
      createId: () => `vid-${++counter}`,
      language: 'pt-BR',
      unnamed: 'Projeto sem nome',
      noKitNames: { stack: 'Stack', database: 'Banco de dados', hosting: 'Hospedagem' },
      kits: KITS,
    },
  );
  if (!withVars) snapshot.envVars = [];
  await workspaceStore.getState().addProject(snapshot);
  return snapshot;
}

const saved = async (id: string) => {
  await projectStore.getState().flush();
  const snapshot = await repository.loadProject(id);
  if (!snapshot) throw new Error('project');
  return snapshot;
};

const page = (name: string) => screen.findByRole('heading', { level: 1, name });

describe('variables (RN 3)', () => {
  it('lists the kit variables by environment, with type and how to get them', async () => {
    const project = await laravelProject();
    await renderApp(`/p/${project.project.id}/variaveis`);
    await page('Variáveis de ambiente');
    const row = screen.getByRole('button', { name: 'Editar APP_KEY' }).closest('tr');
    if (!row) throw new Error('row');
    expect(within(row).getByText('Segredo')).toBeInTheDocument();
    expect(within(row).getByText('php artisan key:generate')).toBeInTheDocument();
    // Where it is used, in words: never the raw "back".
    expect(within(row).getByText('Back-end')).toBeInTheDocument();
    expect(within(row).queryByText('back')).not.toBeInTheDocument();
    expect(screen.getByText(/9 variáveis · 2 segredos/)).toBeInTheDocument();
    expect(screen.getByText(/Variáveis públicas \(VITE_\)/)).toBeInTheDocument();
  });

  it('adds the kit variables to a project that has none', async () => {
    const user = userEvent.setup();
    const project = await laravelProject(false);
    await renderApp(`/p/${project.project.id}/variaveis`);
    await user.click(await screen.findByRole('button', { name: 'Adicionar as variáveis do kit' }));
    await waitFor(async () => expect((await saved(project.project.id)).envVars).toHaveLength(27));
  });

  it('adds a variable, marks it secret and the stored value goes away', async () => {
    const user = userEvent.setup();
    const project = await laravelProject();
    await renderApp(`/p/${project.project.id}/variaveis`);
    await page('Variáveis de ambiente');

    await user.click(screen.getByRole('button', { name: 'Adicionar variável' }));
    const dialog = await screen.findByRole('dialog', { name: 'Nova variável' });
    await user.type(within(dialog).getByLabelText('Chave'), 'session_driver');
    await user.type(within(dialog).getByLabelText(/Valor de exemplo/), 'file');
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar' }));
    await waitFor(async () => {
      const added = (await saved(project.project.id)).envVars.find(
        (v) => v.key === 'SESSION_DRIVER',
      );
      expect(added).toMatchObject({ secret: false, value: 'file', environment: 'development' });
    });

    await user.click(
      await screen.findByRole('button', { name: 'Marcar SESSION_DRIVER como segredo' }),
    );
    expect(await screen.findByText('SESSION_DRIVER agora é segredo')).toBeInTheDocument();
    expect(screen.getByText('O valor guardado foi apagado.')).toBeInTheDocument();
    await waitFor(async () => {
      const secret = (await saved(project.project.id)).envVars.find(
        (v) => v.key === 'SESSION_DRIVER',
      );
      expect(secret?.secret).toBe(true);
      expect(secret).not.toHaveProperty('value');
    });
  });

  it('deletes a variable to the trash and Desfazer brings it back', async () => {
    const user = userEvent.setup();
    const project = await laravelProject();
    await renderApp(`/p/${project.project.id}/variaveis`);
    await user.click(await screen.findByRole('button', { name: 'Editar APP_URL' }));
    const dialog = await screen.findByRole('dialog', { name: 'Editar variável' });
    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));
    const toast = await screen.findByText('Variável removida');
    const count = async () =>
      (await saved(project.project.id)).envVars.filter((v) => v.key === 'APP_URL').length;
    await waitFor(async () => expect(await count()).toBe(2));
    const li = toast.closest('li');
    if (!li) throw new Error('toast');
    await user.click(within(li).getByRole('button', { name: 'Desfazer' }));
    await waitFor(async () => expect(await count()).toBe(3));
  });

  it('adds an environment', async () => {
    const user = userEvent.setup();
    const project = await laravelProject();
    await renderApp(`/p/${project.project.id}/variaveis`);
    await user.click(await screen.findByRole('button', { name: 'Ambiente' }));
    const dialog = await screen.findByRole('dialog', { name: 'Novo ambiente' });
    await user.type(within(dialog).getByLabelText('Nome'), 'Preview{Enter}');
    expect(await screen.findByRole('radio', { name: 'Preview' })).toBeInTheDocument();
    await waitFor(async () =>
      expect((await saved(project.project.id)).project.environments).toContain('Preview'),
    );
  });
});

describe('importing a .env (RN 3)', () => {
  it('previews, warns and adds only keys, never values', async () => {
    const user = userEvent.setup();
    const project = await laravelProject();
    const { router } = await renderApp(`/p/${project.project.id}/variaveis/importar`);
    await page('Importar .env');

    await user.click(screen.getByLabelText('Conteúdo do .env'));
    await user.paste(
      [
        '# frontend',
        'VITE_SENTRY_DSN=https://public@o0.ingest.sentry.io/1',
        'STRIPE_SECRET=sk_test_not_a_real_key',
        'SENTRY_ORG=agenda',
        'VITE_API_URL=http://localhost:8000/api',
        'not valid',
      ].join('\n'),
    );

    expect(screen.getByText('3 novas')).toBeInTheDocument();
    expect(screen.getByText(/Parece um segredo/)).toBeInTheDocument();
    expect(screen.getAllByText(/Sem o prefixo VITE_/)).toHaveLength(2);
    expect(screen.getByRole('checkbox', { name: 'Incluir STRIPE_SECRET' })).not.toBeChecked();
    expect(screen.getByText('Inválida')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Adicionar 2 variáveis' }));
    expect(await screen.findByText('2 variáveis importadas · 3 ignoradas')).toBeInTheDocument();
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(`/p/${project.project.id}/variaveis`),
    );

    const stored = (await saved(project.project.id)).envVars;
    expect(stored.find((v) => v.key === 'SENTRY_ORG')).toMatchObject({
      usedIn: ['front'],
      secret: false,
    });
    expect(stored.some((v) => v.key === 'STRIPE_SECRET')).toBe(false);
    const raw = JSON.stringify(stored);
    expect(raw).not.toContain('agenda');
    expect(raw).not.toContain('sk_test_not_a_real_key');
  });
});
