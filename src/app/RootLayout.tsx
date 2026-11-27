import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { CommandPalette } from '@/features/shell/CommandPalette';
import { preloadPages } from './pages';

/** Overlays available on every screen: Ctrl K. */
export function RootLayout() {
  // After the first screen is up, the others load in the background (not in tests).
  useEffect(() => {
    if (import.meta.env.MODE === 'test') return;
    const idle = window.requestIdleCallback ?? ((run: () => void) => window.setTimeout(run, 1500));
    idle(() => preloadPages());
  }, []);

  return (
    <>
      <Outlet />
      <CommandPalette />
    </>
  );
}
