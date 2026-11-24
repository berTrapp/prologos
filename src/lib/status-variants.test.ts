import { describe, expect, it } from 'vitest';
import { STATE_VARIANTS, badgeForState } from './status-variants';

describe('badgeForState (ux-ui 13.2)', () => {
  it.each([
    ['divergence', 'different', 'warning'],
    ['divergence', 'repoOnly', 'success'],
    ['divergence', 'mapOnly', 'danger'],
    ['divergence', 'newInRepo', 'info'],
    ['import', 'new', 'success'],
    ['import', 'update', 'info'],
    ['import', 'same', 'neutral'],
    ['import', 'invalid', 'danger'],
    ['import', 'conflict', 'warning'],
    ['severity', 'high', 'danger'],
    ['severity', 'medium', 'warning'],
    ['severity', 'low', 'neutral'],
    ['task', 'importing', 'info'],
    ['task', 'done', 'success'],
    ['task', 'cancelled', 'neutral'],
    ['checklist', 'decided', 'success'],
    ['checklist', 'pending', 'warning'],
    ['checklist', 'future', 'info'],
    ['checklist', 'notApplicable', 'neutral'],
    ['variable', 'secret', 'danger'],
    ['variable', 'public', 'info'],
    ['variable', 'config', 'neutral'],
    ['label', 'newForYou', 'accent'],
    ['label', 'recommended', 'accent'],
    ['label', 'note', 'info'],
    ['label', 'risk', 'danger'],
    ['label', 'future', 'planned'],
    ['label', 'trashType', 'neutral'],
  ] as const)('%s.%s → %s', (kind, state, variant) => {
    const lookup = badgeForState as (kind: string, state: string) => { variant: string };
    expect(lookup(kind, state).variant).toBe(variant);
  });

  it('covers every mapped state in the table above', () => {
    const total = Object.values(STATE_VARIANTS).reduce((n, map) => n + Object.keys(map).length, 0);
    expect(total).toBe(28);
  });

  it('shows a dot only on "Novo para você"', () => {
    expect(badgeForState('label', 'newForYou').dot).toBe(true);
    expect(badgeForState('label', 'recommended').dot).toBe(false);
    expect(badgeForState('severity', 'high').dot).toBe(false);
  });
});
