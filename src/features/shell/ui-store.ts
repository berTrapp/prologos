import { create } from 'zustand';

/** Global overlays that any screen or shortcut can open. */
export const useUi = create<{
  paletteOpen: boolean;
  setPaletteOpen(open: boolean): void;
}>()((set) => ({
  paletteOpen: false,
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
}));
