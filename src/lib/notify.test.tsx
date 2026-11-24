import { beforeEach, describe, expect, it, vi } from 'vitest';

const custom = vi.fn();
const dismiss = vi.fn();
vi.mock('sonner', () => ({ toast: { custom, dismiss } }));

const { notify } = await import('./notify');

describe('notify (ux-ui 13.12)', () => {
  beforeEach(() => {
    custom.mockClear();
    dismiss.mockClear();
  });

  it('uses the durations of the spec', () => {
    notify.success('Copiado');
    notify.success('Item removido', { action: { label: 'Desfazer', onClick: () => undefined } });
    notify.error('Não foi possível salvar');
    expect(custom.mock.calls.map(([, options]) => options.duration)).toEqual([
      4000,
      6000,
      Infinity,
    ]);
  });

  it('turns a loading toast into success in the same place', () => {
    const id = notify.loading('Abrindo PR…');
    notify.success('PR aberto', { id });
    const ids = custom.mock.calls.map(([, options]) => options.id);
    expect(ids).toEqual([id, id]);
  });

  it('Esc closes the newest toast first', () => {
    notify.dismiss();
    const first = notify.success('Primeiro');
    const second = notify.success('Segundo');
    expect(notify.dismissNewest()).toBe(true);
    expect(dismiss).toHaveBeenLastCalledWith(second);
    expect(notify.dismissNewest()).toBe(true);
    expect(dismiss).toHaveBeenLastCalledWith(first);
  });
});
