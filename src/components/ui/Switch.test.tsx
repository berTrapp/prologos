import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox';
import { Switch } from './Switch';

describe('Switch (ux-ui 13.11)', () => {
  it('is a switch named by its label, toggled by clicking the label', async () => {
    const onChange = vi.fn();
    render(<Switch label="Marcar como segredo" checked={false} onCheckedChange={onChange} />);
    const control = screen.getByRole('switch', { name: 'Marcar como segredo' });
    expect(control).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(screen.getByText('Marcar como segredo'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles with the keyboard', async () => {
    const onChange = vi.fn();
    render(<Switch label="Movimento reduzido" checked onCheckedChange={onChange} />);
    screen.getByRole('switch').focus();
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith(false);
  });
});

describe('Checkbox (ux-ui 13.11)', () => {
  it('is named by its label and reports the new value', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Hospedagem" checked={false} onCheckedChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Hospedagem' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
