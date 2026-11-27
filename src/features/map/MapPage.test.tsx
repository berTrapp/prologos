import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { projectStore, repository, workspaceStore } from '@/app/services';
import { KITS, findKit } from '@/content/kits';
import {
  EMPTY_ANSWERS,
  buildProjectFromAnswers,
  type GuidedAnswers,
} from '@/domain/rules/guided-start';
import i18n from '@/i18n';
import { notify } from '@/lib/notify';
import { renderApp, resetAppData } from '@/test/render-app';

const realMatchMedia = window.matchMedia;

beforeEach(async () => {
  notify.dismiss();
  await i18n.changeLanguage('pt-BR');
  await resetAppData();
});

afterEach(() => {
  window.matchMedia = realMatchMedia;
});

let counter = 0;
async function djangoProject(answers: Partial<GuidedAnswers> = {}) {
  const snapshot = buildProjectFromAnswers(
    { ...EMPTY_ANSWERS, name: 'Agenda de aulas', type: 'web', knownStack: 'laravel', ...answers },
    findKit('django'),
    {
      id: `p-${++counter}`,
      now: Date.now(),
      createId: () => `id-${++counter}`,
      language: 'pt-BR',
      unnamed: 'Projeto sem nome',
      noKitNames: { stack: 'Stack', database: 'Banco de dados', hosting: 'Hospedagem' },
      kits: KITS,
    },
  );
  await workspaceStore.getState().addProject(snapshot);
  return snapshot;
}

/** Desfazer of a toast, not the toolbar's. */
const undoIn = (text: HTMLElement) => {
  const toast = text.closest('li');
  if (!toast) throw new Error('toast');
  return within(toast).getByRole('button', { name: 'Desfazer' });
};

const saved = async (id: string) => {
  await projectStore.getState().flush();
  const snapshot = await repository.loadProject(id);
  if (!snapshot) throw new Error('project');
  return snapshot;
};

describe('map (RN 1, 2, 13, 15)', () => {
  it('opens with the zones, the items and the next step', async () => {
    const project = await djangoProject();
    await renderApp(`/p/${project.project.id}`);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Agenda de aulas' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Python + Django')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /Próximo passo.*Preparar o ambiente, depois escolher: Banco de dados e Hospedagem/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recolher Dados' })).toBeInTheDocument();
  });

  it('takes the person to the trail when it is all that is left', async () => {
    const user = userEvent.setup();
    const project = await djangoProject({ runsOn: { database: 0, hosting: 0 } });
    const { router } = await renderApp(`/p/${project.project.id}`);
    const bar = await screen.findByRole('button', { name: /Próximo passo/ });
    expect(bar).toHaveTextContent('Preparar o ambiente');
    // Backup is still pending, and the trail counts as one more.
    expect(bar).toHaveTextContent('2 pendências');
    await user.click(bar);
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(`/p/${project.project.id}/checklist`),
    );
  });

  it('explains a new item and decides a pending one, with Desfazer', async () => {
    const user = userEvent.setup();
    const project = await djangoProject();
    await renderApp(`/p/${project.project.id}`);

    // The next step bar takes the person to the first item to decide.
    await user.click(await screen.findByRole('button', { name: /Próximo passo/ }));
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Banco de dados' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /^PostgreSQL/ }));
    const toast = await screen.findByText('Banco de dados: PostgreSQL');
    const id = project.project.id;
    await waitFor(async () => {
      const item = (await saved(id)).items.find((i) => i.kitRef === 'database');
      expect(item).toMatchObject({ state: 'decided', choice: 'PostgreSQL' });
    });

    await user.click(undoIn(toast));
    await waitFor(async () => {
      const item = (await saved(id)).items.find((i) => i.kitRef === 'database');
      expect(item?.state).toBe('pending');
      expect(item?.choice).toBeUndefined();
    });
  });

  it('shows what it is, why it is there and the equivalent in the known stack', async () => {
    const user = userEvent.setup();
    const project = await djangoProject();
    const orm = project.items.find((i) => i.kitRef === 'orm');
    if (!orm) throw new Error('orm');
    await renderApp(`/p/${project.project.id}`);
    await screen.findByRole('heading', { level: 1, name: 'Agenda de aulas' });

    const { useMapUi } = await import('./map-ui-store');
    useMapUi.getState().select({ kind: 'item', id: orm.id });
    const panel = await screen.findByRole('complementary', { name: 'Detalhes' });
    expect(await within(panel).findByText('Novo para você')).toBeInTheDocument();
    expect(within(panel).getByText('O que é')).toBeInTheDocument();
    expect(within(panel).getByText('Por que está aqui')).toBeInTheDocument();
    expect(within(panel).getByText('No Laravel / PHP, o equivalente é')).toBeInTheDocument();
    expect(within(panel).getByText('Eloquent')).toBeInTheDocument();
    expect(within(panel).getByRole('link', { name: /Documentação oficial/ })).toHaveAttribute(
      'href',
      'https://docs.djangoproject.com/en/stable/topics/db/',
    );
    await user.click(within(panel).getByRole('radio', { name: 'Futuro' }));
    await waitFor(async () =>
      expect((await saved(project.project.id)).items.find((i) => i.id === orm.id)?.when).toBe(
        'later',
      ),
    );
  });

  it('deletes an item to the trash and Desfazer brings it back', async () => {
    const user = userEvent.setup();
    const project = await djangoProject();
    const htmx = project.items.find((i) => i.kitRef === 'htmx');
    if (!htmx) throw new Error('htmx');
    await renderApp(`/p/${project.project.id}`);
    await screen.findByRole('heading', { level: 1, name: 'Agenda de aulas' });
    const { useMapUi } = await import('./map-ui-store');
    useMapUi.getState().select({ kind: 'item', id: htmx.id });

    await user.click(await screen.findByRole('button', { name: 'Excluir' }));
    const toast = await screen.findByText('Item removido');
    await waitFor(async () =>
      expect((await saved(project.project.id)).items.some((i) => i.id === htmx.id)).toBe(false),
    );
    expect(await repository.listTrash()).toHaveLength(1);

    await user.click(undoIn(toast));
    await waitFor(async () =>
      expect((await saved(project.project.id)).items.some((i) => i.id === htmx.id)).toBe(true),
    );
  });

  it('remembers a collapsed zone', async () => {
    const user = userEvent.setup();
    const project = await djangoProject();
    await renderApp(`/p/${project.project.id}`);
    await user.click(await screen.findByRole('button', { name: 'Recolher Dados' }));
    expect(await screen.findByRole('button', { name: 'Expandir Dados' })).toBeInTheDocument();
    await waitFor(async () => {
      const zone = (await saved(project.project.id)).zones.find((z) => z.key === 'data');
      expect(zone?.collapsed).toBe(true);
    });
  });

  it('adds an item with N, from a kit suggestion or by name', async () => {
    const user = userEvent.setup();
    const project = await djangoProject();
    await renderApp(`/p/${project.project.id}`);
    await screen.findByRole('heading', { level: 1, name: 'Agenda de aulas' });

    await user.keyboard('n');
    const popover = await screen.findByRole('dialog', { name: 'Novo item' });
    await user.type(within(popover).getByLabelText('Nome'), 'Redis{Enter}');
    await waitFor(async () =>
      expect((await saved(project.project.id)).items.some((i) => i.name === 'Redis')).toBe(true),
    );
  });

  it('undoes and redoes with the keyboard', async () => {
    const user = userEvent.setup();
    const project = await djangoProject();
    await renderApp(`/p/${project.project.id}`);
    await user.click(await screen.findByRole('button', { name: 'Recolher Dados' }));
    await screen.findByRole('button', { name: 'Expandir Dados' });
    await user.keyboard('{Control>}z{/Control}');
    expect(await screen.findByRole('button', { name: 'Recolher Dados' })).toBeInTheDocument();
    await user.keyboard('{Control>}{Shift>}z{/Shift}{/Control}');
    expect(await screen.findByRole('button', { name: 'Expandir Dados' })).toBeInTheDocument();
  });

  it('on the phone, lists zones and opens an item in a sheet to decide', async () => {
    window.matchMedia = (query: string) =>
      ({
        ...realMatchMedia(query),
        matches: query.includes('max-width: 759px'),
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as MediaQueryList;
    const user = userEvent.setup();
    const project = await djangoProject();
    await renderApp(`/p/${project.project.id}`);

    await user.click(await screen.findByRole('button', { name: /^Dados/ }));
    await user.click(await screen.findByRole('button', { name: /^Banco de dados/ }));
    const sheet = await screen.findByRole('dialog', { name: 'Banco de dados' });
    expect(within(sheet).queryByLabelText('Nome')).toBeNull();
    await user.click(within(sheet).getByRole('radio', { name: /^SQLite/ }));
    await waitFor(async () => {
      const item = (await saved(project.project.id)).items.find((i) => i.kitRef === 'database');
      expect(item?.choice).toBe('SQLite');
    });
  });
});
