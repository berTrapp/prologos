/** Counts above 99 show "99+" (ux-ui 13.3). */
export function formatCount(value: number) {
  return value > 99 ? '99+' : String(value);
}
