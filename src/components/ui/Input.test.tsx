import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input (ux-ui 13.11)', () => {
  it('always has a visible label tied to the field', () => {
    render(<Input label="Nome do projeto" />);
    expect(screen.getByLabelText('Nome do projeto')).toBeInTheDocument();
  });

  it('marks errors in the field and describes them, not by color alone', () => {
    render(<Input label="Chave" error="Use letras maiúsculas." />);
    const field = screen.getByLabelText('Chave');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('Use letras maiúsculas.');
  });
});
