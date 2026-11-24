import { render, screen } from '@testing-library/react';
import { Search } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { IconButton } from './IconButton';
import { TooltipProvider } from './Tooltip';

describe('IconButton (ux-ui 13.7)', () => {
  it('has an accessible name from its label', () => {
    render(
      <TooltipProvider>
        <IconButton label="Buscar" icon={<Search />} />
      </TooltipProvider>,
    );
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument();
  });
});
