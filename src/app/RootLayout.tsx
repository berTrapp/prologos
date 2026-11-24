import { Outlet } from 'react-router';
import { CommandPalette } from '@/features/shell/CommandPalette';

/** Overlays available on every screen: Ctrl K. */
export function RootLayout() {
  return (
    <>
      <Outlet />
      <CommandPalette />
    </>
  );
}
