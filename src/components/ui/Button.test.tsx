import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button (ux-ui 13.7)', () => {
  it('runs the action on click', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Salvar</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('while loading: shows the gerund, is busy and ignores clicks', async () => {
    const onClick = vi.fn();
    render(
      <Button loading loadingText="Exportando…" onClick={onClick}>
        Exportar
      </Button>,
    );
    const button = screen.getByRole('button', { name: /Exportando…/ });
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('stays focusable while loading', () => {
    render(<Button loading>Exportar</Button>);
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });
});
