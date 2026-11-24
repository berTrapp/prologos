import { describe, expect, it } from 'vitest';
import { toastDuration } from './toast-timing';

describe('toastDuration (ux-ui 13.12)', () => {
  it('keeps success for 4 s, or 6 s with an action', () => {
    expect(toastDuration('success', false)).toBe(4000);
    expect(toastDuration('success', true)).toBe(6000);
    expect(toastDuration('warning', true)).toBe(6000);
  });

  it('keeps errors and loading until resolved', () => {
    expect(toastDuration('error', false)).toBe(Infinity);
    expect(toastDuration('error', true)).toBe(Infinity);
    expect(toastDuration('loading', false)).toBe(Infinity);
  });
});
