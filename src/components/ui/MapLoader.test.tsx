import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MapLoader } from './MapLoader';

describe('MapLoader (ux-ui 13.14, 15)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows nothing during the first 400 ms', () => {
    render(<MapLoader />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(400));
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('changes the phrase every 2 s', () => {
    render(<MapLoader delay={0} />);
    expect(screen.getByText('Escrevendo o prólogo…')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText('Ligando os pontos…')).toBeInTheDocument();
  });

  it('keeps the points still with reduced motion; only the phrase changes', () => {
    const { container } = render(<MapLoader delay={0} reducedMotion />);
    expect(container.querySelector('.map-loader-dot, .map-loader-line')).toBeNull();
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText('Ligando os pontos…')).toBeInTheDocument();
  });
});
