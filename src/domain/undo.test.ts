import { describe, expect, it } from 'vitest';
import { UNDO_LIMIT, emptyUndo, pushUndo, takeRedo, takeUndo } from './undo';

describe('undo stack (ux-ui 8)', () => {
  it('undoes and redoes in order', () => {
    let stack = pushUndo(pushUndo(emptyUndo<number>(), 1), 2);
    const first = takeUndo(stack);
    expect(first?.entry).toBe(2);
    if (!first) throw new Error('expected an undo step');
    stack = first.stack;
    const redo = takeRedo(stack);
    expect(redo?.entry).toBe(2);
    expect(redo?.stack).toEqual({ past: [1, 2], future: [] });
  });

  it('a new change clears redo', () => {
    const undone = takeUndo(pushUndo(emptyUndo<number>(), 1));
    expect(undone && pushUndo(undone.stack, 3)).toEqual({ past: [3], future: [] });
  });

  it('keeps at most 100 steps, dropping the oldest', () => {
    let stack = emptyUndo<number>();
    for (let i = 0; i < UNDO_LIMIT + 5; i++) stack = pushUndo(stack, i);
    expect(UNDO_LIMIT).toBe(100);
    expect(stack.past).toHaveLength(100);
    expect(stack.past[0]).toBe(5);
  });

  it('nothing to undo or redo returns undefined', () => {
    expect(takeUndo(emptyUndo())).toBeUndefined();
    expect(takeRedo(emptyUndo())).toBeUndefined();
  });
});
