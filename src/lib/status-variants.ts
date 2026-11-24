/** Badge variants (ux-ui 13.2). */
export const BADGE_VARIANTS = [
  'neutral',
  'success',
  'warning',
  'danger',
  'info',
  'accent',
  'planned',
] as const;
export type BadgeVariant = (typeof BADGE_VARIANTS)[number];

/** Fixed state → color mapping (ux-ui 13.2). Screens never pick a badge color themselves. */
export const STATE_VARIANTS = {
  divergence: { different: 'warning', repoOnly: 'success', mapOnly: 'danger', newInRepo: 'info' },
  import: {
    new: 'success',
    update: 'info',
    same: 'neutral',
    invalid: 'danger',
    conflict: 'warning',
  },
  severity: { high: 'danger', medium: 'warning', low: 'neutral' },
  task: { importing: 'info', done: 'success', cancelled: 'neutral' },
  checklist: { decided: 'success', pending: 'warning', future: 'info', notApplicable: 'neutral' },
  variable: { secret: 'danger', public: 'info', config: 'neutral' },
  label: {
    newForYou: 'accent',
    recommended: 'accent',
    note: 'info',
    risk: 'danger',
    future: 'planned',
    trashType: 'neutral',
  },
} as const satisfies Record<string, Record<string, BadgeVariant>>;

export type StateKind = keyof typeof STATE_VARIANTS;
export type StateOf<K extends StateKind> = keyof (typeof STATE_VARIANTS)[K];

/** States that always show the 6 px dot. */
const WITH_DOT: ReadonlySet<string> = new Set(['label.newForYou']);

export function badgeForState<K extends StateKind>(
  kind: K,
  state: StateOf<K>,
): { variant: BadgeVariant; dot: boolean } {
  const variants = STATE_VARIANTS[kind] as Record<StateOf<K>, BadgeVariant>;
  return { variant: variants[state], dot: WITH_DOT.has(`${kind}.${String(state)}`) };
}
