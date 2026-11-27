import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { repository } from '@/app/services';
import i18n from '@/i18n';
import { renderApp, resetAppData } from '@/test/render-app';
import { useGuided } from './guided-store';

const realMatchMedia = window.matchMedia;

beforeEach(async () => {
  await i18n.changeLanguage('pt-BR');
  await resetAppData();
});

afterEach(() => {
  window.matchMedia = realMatchMedia;
});

const projectAt = async (pathname: string) => {
  const id = pathname.split('/')[2] ?? '';
  const snapshot = await repository.loadProject(id);
  if (!snapshot) throw new Error(`No project at ${pathname}`);
  return snapshot;
};

const heading = (name: string) => screen.findByRole('heading', { level: 1, name });

describe('guided start (RN 13, 15)', () => {
  it('still creates a project when every step is skipped', async () => {
    const user = userEvent.setup();
    const { router } = await renderApp('/novo');
    await heading('O que você vai construir?');

    for (let step = 0; step < 4; step += 1) {
      await user.click(screen.getByRole('button', { name: /Continuar/ }));
    }
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Tudo pronto para montar o mapa' }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText('Escolher a stack')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Criar projeto' }));

    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/p\//));
    const snapshot = await projectAt(router.state.location.pathname);
    expect(snapshot.project).toMatchObject({ name: 'Projeto sem nome', type: 'unknown' });
    expect(snapshot.items.map((item) => item.state)).toEqual(['pending', 'pending', 'pending']);
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Projeto sem nome' }),
      ).toBeInTheDocument(),
    );
  });

  it('builds the map from the answers, marking what is new for you', async () => {
    const user = userEvent.setup();
    const { router } = await renderApp('/novo');
    await heading('O que você vai construir?');

    // 1. Ideia: Enter moves on, like Continuar.
    await user.type(screen.getByLabelText('Nome do projeto'), 'Agenda de aulas');
    await user.click(screen.getByRole('radio', { name: /App web completo/ }));
    await user.type(screen.getByLabelText('Objetivo em uma frase'), 'Alunos marcam aulas{Enter}');

    // 2. Stack: the known stack drives the recommendation; another kit can be picked to learn.
    await heading('Com que stack?');
    await user.click(screen.getByRole('radio', { name: 'Laravel / PHP' }));
    const laravel = screen.getByRole('radio', { name: /Laravel \+ React/ });
    expect(laravel).toBeChecked();
    expect(within(laravel).getByText('Recomendado para começar')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Python \+ Django/ }));
    await user.click(screen.getByRole('button', { name: /Continuar/ }));

    // 3. Experiência: defaults from the known stack, and the equivalences from Laravel.
    await heading('Quanto você conhece cada parte?');
    const django = screen.getByRole('radiogroup', { name: 'Experiência com Django' });
    expect(within(django).getByRole('radio', { name: 'Nunca usei' })).toBeChecked();
    expect(screen.getByText('Para quem vem de Laravel / PHP')).toBeInTheDocument();
    expect(screen.getByText('Eloquent')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Continuar/ }));

    // 4. Onde roda: pick the database, leave hosting as "Ainda não sei".
    await heading('Onde o projeto vai rodar?');
    const database = screen.getByRole('radiogroup', { name: 'Banco de dados' });
    await user.click(within(database).getByRole('radio', { name: /^PostgreSQL/ }));
    await user.click(screen.getByRole('button', { name: /Continuar/ }));

    // 5. Resumo.
    await heading('Tudo pronto para montar o mapa');
    expect(screen.getByText('Preparar o ambiente')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Criar projeto' }));

    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/p\//));
    // The draft is cleared after the map opens, never before (no empty first step).
    await waitFor(() => expect(useGuided.getState().answers.name).toBe(''));
    const snapshot = await projectAt(router.state.location.pathname);
    expect(snapshot.project).toMatchObject({
      name: 'Agenda de aulas',
      goal: 'Alunos marcam aulas',
      type: 'web',
      kitId: 'django',
      knownStack: 'laravel',
    });
    const byRef = (ref: string) => snapshot.items.find((item) => item.kitRef === ref);
    expect(byRef('database')).toMatchObject({ state: 'decided', choice: 'PostgreSQL' });
    expect(byRef('hosting')?.state).toBe('pending');
    expect(snapshot.items.some((item) => item.newForYou)).toBe(true);
  });

  it('jumps back to a step from the summary and keeps the draft when closed', async () => {
    const user = userEvent.setup();
    const { router } = await renderApp('/novo');
    await user.type(await screen.findByLabelText('Nome do projeto'), 'Portfólio');
    await user.click(screen.getByRole('button', { name: /Resumo/ }));
    await heading('Tudo pronto para montar o mapa');
    await user.click(screen.getByRole('button', { name: 'Alterar Kit' }));
    await heading('Com que stack?');

    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    await router.navigate('/novo');
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Com que stack?' })).toBeInTheDocument(),
    );
  });

  it('shows one step per screen on the phone, with the preview in a sheet', async () => {
    window.matchMedia = (query: string) =>
      ({
        ...realMatchMedia(query),
        matches: query.includes('max-width: 759px'),
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as MediaQueryList;
    const user = userEvent.setup();
    await renderApp('/novo');
    await heading('O que você vai construir?');

    expect(screen.queryByRole('navigation', { name: 'Passos do novo projeto' })).toBeNull();
    expect(screen.getAllByText('Passo 1 de 5').length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: /Mapa: 0 decididos · 3 a decidir/ }));
    expect(await screen.findByRole('dialog', { name: 'Prévia do mapa' })).toBeInTheDocument();
  });
});
