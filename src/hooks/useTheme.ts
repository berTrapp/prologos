import { useSyncExternalStore } from 'react';
import { themeStore } from '@/lib/theme-store';

export function useTheme() {
  const { preference, resolved } = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
  );
  return { preference, resolved, setPreference: themeStore.setPreference };
}
