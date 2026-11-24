import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatCount } from '@/lib/format-count';
import { Count } from './Count';

describe('Count (ux-ui 13.3)', () => {
  it('is hidden at zero or below', () => {
    const { container } = render(<Count value={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the number', () => {
    render(<Count value={7} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('caps at 99+', () => {
    expect(formatCount(99)).toBe('99');
    expect(formatCount(100)).toBe('99+');
  });
});
