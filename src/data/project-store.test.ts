import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeConnection, makeItem, makeSnapshot, zoneByKey } from '@/domain/fixtures';
import { AUTO_VERSION_IDLE_MS } from '@/domain/rules/history';
import type { EnvVar } from '@/domain/schemas/env';
import { MemoryProjectRepository } from './memory-repository';
import { createProjectStore } from './project-store';

let clock = 1_000;
const now = () => clock;
let ids = 0;
const createId = () => `gen-${++ids}`;

function setup() {
  const repo = new MemoryProjectRepository();
  const onSaveError = vi.fn();
  const store = createProjectStore({ repo, now, createId, saveDelay: 600, onSaveError });
  return { repo, store, onSaveError, state: () => store.getState() };
}

function project() {
  const snapshot = makeSnapshot();
  const data = zoneByKey(snapshot, 'data');
  const api = makeItem(data.id, { name: 'API' });
  const db = makeItem(data.id, { name: 'PostgreSQL' });
  return { ...snapshot, items: [api, db], connections: [makeConnection(api.id, db.id)] };
}

/** Lets pending promises (repository calls) settle under fake timers. */
const settle = () => vi.advanceTimersByTimeAsync(0);

beforeEach(() => {
  vi.useFakeTimers();
  clock = 1_000;
});
afterEach(() => vi.useRealTimers());

describe('project store: optimistic change and automatic save (ux-ui 7)', () => {
  it('applies a change at once and saves it after the debounce, without a toast', async () => {
    const { repo, store, state } = setup();
    await store.getState().create(project());

    state().change((draft) => {
      draft.project.name = 'Agenda 2';
    });
    expect(state().snapshot?.project.name).toBe('Agenda 2');
    expect((await repo.loadProject('p1'))?.project.name).toBe('Agenda de aulas');

    await vi.advanceTimersByTimeAsync(600);
    expect(state().saveStatus).toBe('saved');
    expect((await repo.loadProject('p1'))?.project.name).toBe('Agenda 2');
  });

  it('shows "Salvando…" while writing', async () => {
    const { repo, store, state } = setup();
    await store.getState().create(project());
    let release: () => void = () => undefined;
    const original = repo.saveProject.bind(repo);
    repo.saveProject = (s) =>
      new Promise<void>((resolve) => (release = () => void original(s).then(resolve)));

    state().change((draft) => {
      draft.project.goal = 'Organizar aulas';
    });
    await vi.advanceTimersByTimeAsync(600);
    expect(state().saveStatus).toBe('saving');
    release();
    await settle();
    expect(state().saveStatus).toBe('saved');
  });

  it('stamps updatedAt on every change', async () => {
    const { store, state } = setup();
    await store.getState().create(project());
    clock = 5_000;
    state().change((draft) => {
      draft.project.name = 'Outro';
    });
    expect(state().snapshot?.project.updatedAt).toBe(5_000);
  });

  it('ignores a change that changes nothing', async () => {
    const { store, state } = setup();
    await store.getState().create(project());
    state().change(() => undefined);
    expect(state().history.past).toHaveLength(0);
  });

  it('when saving fails, rolls back to the last saved state and reports it', async () => {
    const { repo, store, state, onSaveError } = setup();
    await store.getState().create(project());
    repo.failSaves = true;
    state().change((draft) => {
      draft.project.name = 'Não vai salvar';
    });
    await vi.advanceTimersByTimeAsync(600);
    expect(state().saveStatus).toBe('error');
    expect(state().snapshot?.project.name).toBe('Agenda de aulas');
    expect(onSaveError).toHaveBeenCalledOnce();
  });

  it('flush saves pending changes right away', async () => {
    const { repo, store, state } = setup();
    await store.getState().create(project());
    state().change((draft) => {
      draft.project.name = 'Saindo';
    });
    await state().flush();
    expect((await repo.loadProject('p1'))?.project.name).toBe('Saindo');
  });

  it('never stores a secret value (RN 3)', async () => {
    const { repo, store, state } = setup();
    await store.getState().create(project());
    state().change((draft) => {
      draft.envVars.push({
        id: 'e1',
        projectId: 'p1',
        key: 'APP_KEY',
        environment: 'development',
        usedIn: ['back'],
        secret: true,
        value: 'leaked',
      } as unknown as EnvVar);
    });
    await state().flush();
    expect(JSON.stringify(await repo.loadProject('p1'))).not.toContain('leaked');
  });
});

describe('project store: undo (ux-ui 8)', () => {
  it('undoes and redoes changes', async () => {
    const { store, state } = setup();
    await store.getState().create(project());
    state().change((draft) => {
      draft.project.name = 'Um';
    });
    state().change((draft) => {
      draft.project.name = 'Dois';
    });
    state().undo();
    expect(state().snapshot?.project.name).toBe('Um');
    state().undo();
    expect(state().snapshot?.project.name).toBe('Agenda de aulas');
    state().redo();
    expect(state().snapshot?.project.name).toBe('Um');
  });

  it('undo with nothing to undo does nothing', async () => {
    const { store, state } = setup();
    state().undo();
    state().redo();
    await store.getState().create(project());
    state().undo();
    expect(state().snapshot?.project.name).toBe('Agenda de aulas');
  });

  it('the undone state is saved too', async () => {
    const { repo, store, state } = setup();
    await store.getState().create(project());
    state().change((draft) => {
      draft.project.name = 'Um';
    });
    await state().flush();
    state().undo();
    await state().flush();
    expect((await repo.loadProject('p1'))?.project.name).toBe('Agenda de aulas');
  });
});

describe('project store: trash (RN 1, 11)', () => {
  it('moves a zone to the trash with its items, and Desfazer brings everything back', async () => {
    const { repo, store, state } = setup();
    const snapshot = project();
    await store.getState().create(snapshot);
    const data = zoneByKey(snapshot, 'data');

    const entry = await state().moveToTrash('zone', data.id, 'Dados');
    expect(entry?.payload.items).toHaveLength(2);
    expect(state().snapshot?.items).toHaveLength(0);
    expect(await repo.listTrash()).toHaveLength(1);

    if (!entry) throw new Error('expected a trash entry');
    expect(await state().restoreFromTrash(entry)).toEqual([]);
    expect(state().snapshot?.items).toHaveLength(2);
    expect(state().snapshot?.connections).toHaveLength(1);
    expect(await repo.listTrash()).toHaveLength(0);
  });

  it('undo of a deletion also takes the entry out of the trash; redo puts it back', async () => {
    const { repo, store, state } = setup();
    const snapshot = project();
    await store.getState().create(snapshot);
    const item = snapshot.items[0];
    if (!item) throw new Error('fixture');

    await state().moveToTrash('item', item.id, 'API');
    state().undo();
    await settle();
    expect(state().snapshot?.items).toHaveLength(2);
    expect(await repo.listTrash()).toHaveLength(0);

    state().redo();
    await settle();
    expect(state().snapshot?.items).toHaveLength(1);
    expect(await repo.listTrash()).toHaveLength(1);
  });

  it('ignores trash actions without an open project or from another project', async () => {
    const { store, state } = setup();
    expect(await state().moveToTrash('item', 'x', 'X')).toBeUndefined();
    await store.getState().create(project());
    const foreign = {
      id: 't',
      projectId: 'other',
      kind: 'item' as const,
      label: 'X',
      deletedAt: 0,
      payload: {},
    };
    expect(await state().restoreFromTrash(foreign)).toEqual([]);
  });
});

describe('project store: automatic version (RN 8)', () => {
  it('writes a version after 30 min without changes', async () => {
    const { repo, store, state } = setup();
    await store.getState().create(project());
    state().change((draft) => {
      draft.project.name = 'Sessão';
    });
    clock += AUTO_VERSION_IDLE_MS;
    await vi.advanceTimersByTimeAsync(AUTO_VERSION_IDLE_MS);
    const versions = await repo.listVersions('p1');
    expect(versions).toHaveLength(1);
    expect(versions[0]?.kind).toBe('auto');
    expect(versions[0]?.snapshot.project.name).toBe('Sessão');
  });

  it('a new change restarts the 30 min', async () => {
    const { repo, store, state } = setup();
    await store.getState().create(project());
    state().change((draft) => {
      draft.project.name = 'A';
    });
    await vi.advanceTimersByTimeAsync(AUTO_VERSION_IDLE_MS - 1000);
    clock += AUTO_VERSION_IDLE_MS - 1000;
    state().change((draft) => {
      draft.project.name = 'B';
    });
    await vi.advanceTimersByTimeAsync(1000);
    expect(await repo.listVersions('p1')).toHaveLength(0);
  });

  it('on opening, writes the version of a session that ended with the tab closed', async () => {
    const { repo, store } = setup();
    const snapshot = project();
    await repo.saveProject({ ...snapshot, project: { ...snapshot.project, updatedAt: 0 } });
    clock = AUTO_VERSION_IDLE_MS + 1;
    expect(await store.getState().open('p1')).toBe(true);
    expect(await repo.listVersions('p1')).toHaveLength(1);

    await store.getState().open('p1');
    expect(await repo.listVersions('p1')).toHaveLength(1);
  });

  it('opening an unknown project returns false', async () => {
    const { store } = setup();
    expect(await store.getState().open('nope')).toBe(false);
  });

  it('closing saves pending changes and clears the state', async () => {
    const { repo, store, state } = setup();
    await store.getState().create(project());
    state().change((draft) => {
      draft.project.name = 'Fechando';
    });
    await state().close();
    expect(state().snapshot).toBeNull();
    expect((await repo.loadProject('p1'))?.project.name).toBe('Fechando');
  });
});
