/** Undo history (ux-ui 8): 100 steps per project, in memory only. */
export const UNDO_LIMIT = 100;

export type UndoStack<T> = { past: T[]; future: T[] };

export function emptyUndo<T>(): UndoStack<T> {
  return { past: [], future: [] };
}

/** A new change clears the redo branch and drops the oldest step past the limit. */
export function pushUndo<T>(stack: UndoStack<T>, entry: T, limit = UNDO_LIMIT): UndoStack<T> {
  const past = [...stack.past, entry];
  return { past: past.length > limit ? past.slice(past.length - limit) : past, future: [] };
}

export function takeUndo<T>(stack: UndoStack<T>): { entry: T; stack: UndoStack<T> } | undefined {
  const entry = stack.past.at(-1);
  if (entry === undefined) return undefined;
  return { entry, stack: { past: stack.past.slice(0, -1), future: [entry, ...stack.future] } };
}

export function takeRedo<T>(stack: UndoStack<T>): { entry: T; stack: UndoStack<T> } | undefined {
  const [entry, ...future] = stack.future;
  if (entry === undefined) return undefined;
  return { entry, stack: { past: [...stack.past, entry], future } };
}
