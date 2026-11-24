import {
  THEME_STORAGE_KEY,
  parseThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from './theme';

type Snapshot = { preference: ThemePreference; resolved: ResolvedTheme };

const media = () => window.matchMedia('(prefers-color-scheme: dark)');
const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  try {
    return parseThemePreference(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return 'system';
  }
}

function compute(preference: ThemePreference): Snapshot {
  return { preference, resolved: resolveTheme(preference, media().matches) };
}

let snapshot: Snapshot = compute(readPreference());

function apply() {
  document.documentElement.dataset.theme = snapshot.resolved;
  listeners.forEach((listener) => listener());
}

export const themeStore = {
  getSnapshot: () => snapshot,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setPreference(preference: ThemePreference) {
    try {
      if (preference === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // Storage unavailable (private mode): the choice lasts for this session only.
    }
    snapshot = compute(preference);
    apply();
  },
};

media().addEventListener('change', () => {
  if (snapshot.preference !== 'system') return;
  snapshot = compute('system');
  apply();
});

apply();
