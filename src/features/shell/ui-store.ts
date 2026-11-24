import { create } from 'zustand';

/** Global overlays that any screen or shortcut can open. */
export const useUi = create<{
  paletteOpen: boolean;
  newProjectOpen: boolean;
  setPaletteOpen(open: boolean): void;
  setNewProjectOpen(open: boolean): void;
}>()((set) => ({
  paletteOpen: false,
  newProjectOpen: false,
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setNewProjectOpen: (newProjectOpen) => set({ newProjectOpen, paletteOpen: false }),
}));
