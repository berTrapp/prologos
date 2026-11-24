import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from './SegmentedControl';

const options = [
  { value: 'today', label: 'Hoje' },
  { value: 'complete', label: 'Completo' },
] as const;

describe('SegmentedControl (ux-ui 13.8)', () => {
  it('switches to another option', async () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl label="Vista" value="today" onValueChange={onChange} options={options} />,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Completo' }));
    expect(onChange).toHaveBeenCalledWith('complete');
  });

  it('never deselects the active option', async () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl label="Vista" value="today" onValueChange={onChange} options={options} />,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Hoje' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
