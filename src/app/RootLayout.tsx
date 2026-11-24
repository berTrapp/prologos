import { Outlet } from 'react-router';
import { NewProjectDialog } from '@/features/projects/NewProjectDialog';
import { CommandPalette } from '@/features/shell/CommandPalette';

/** Overlays available on every screen: Ctrl K and Novo projeto. */
export function RootLayout() {
  return (
    <>
      <Outlet />
      <CommandPalette />
      <NewProjectDialog />
    </>
  );
}
