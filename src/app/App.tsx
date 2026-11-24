import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from '@/components/ui/Toaster';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { router } from './router';
import { requestPersistentStorage, useWorkspace, workspaceStore } from './services';

export function App() {
  const ready = useWorkspace((s) => s.ready);

  useEffect(() => {
    // RN 11: expired trash goes on start; RN 18: ask the browser to keep our data.
    void workspaceStore.getState().init();
    void requestPersistentStorage();
  }, []);

  // ux-ui 15: local data loads in well under 0.4 s, so nothing is shown meanwhile.
  if (!ready) return null;

  return (
    <TooltipProvider>
      <RouterProvider router={router} />
      <Toaster />
    </TooltipProvider>
  );
}
