import { createContext } from 'react';

/** Zone actions, shared by every zone node so their data stays stable (fast re-renders). */
export type ZoneCallbacks = {
  /** Opens the new item popover from the + button. */
  add(zoneId: string, origin: DOMRect): void;
  toggle(zoneId: string, collapsed: boolean): void;
  rename(zoneId: string): void;
  addSubzone(zoneId: string): void;
  remove(zoneId: string, name: string): void;
};

export const ZoneCallbacksContext = createContext<ZoneCallbacks | null>(null);
