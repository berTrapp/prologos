import { create } from 'zustand';

/** What is selected on the map; the details panel shows it. */
export type MapSelection =
  | { kind: 'item'; id: string }
  | { kind: 'zone'; id: string }
  | { kind: 'edge'; id: string; connectionIds: string[] }
  | null;

/** V selecionar, C conectar (ux-ui 9). N and Z open the popover and the new zone dialog. */
export type MapTool = 'select' | 'connect';

/** Where the new item popover opens: the zone it goes in and the point it grows from. */
export type NewItemRequest = { zoneId: string | undefined; point: { x: number; y: number } };

type MapUiState = {
  selection: MapSelection;
  tool: MapTool;
  /** First end picked while connecting. */
  connectFrom: string | undefined;
  newItem: NewItemRequest | undefined;
  /** New zone dialog; parentId set for a subzone. */
  newZone: { parentId: string | null } | undefined;
  /** Zones kept by the "Tags" filter; empty means every zone. */
  zoneFilter: string[];
  activeFlowId: string | undefined;
  flowStep: number;
  playing: boolean;
  /** Steps of a flow being drawn, in order. */
  drawing: string[] | undefined;
  select(selection: MapSelection): void;
  setTool(tool: MapTool): void;
  setConnectFrom(id: string | undefined): void;
  openNewItem(zoneId: string | undefined, point: { x: number; y: number }): void;
  closeNewItem(): void;
  openNewZone(parentId: string | null): void;
  closeNewZone(): void;
  toggleZoneFilter(zoneId: string): void;
  clearZoneFilter(): void;
  setActiveFlow(flowId: string | undefined): void;
  setFlowStep(step: number): void;
  setPlaying(playing: boolean): void;
  setDrawing(steps: string[] | undefined): void;
  reset(): void;
};

const initial = {
  selection: null,
  tool: 'select' as MapTool,
  connectFrom: undefined,
  newItem: undefined,
  newZone: undefined,
  zoneFilter: [] as string[],
  activeFlowId: undefined,
  flowStep: 0,
  playing: false,
  drawing: undefined,
};

/** Session state of the map screen; what must be remembered lives in usePersistentState. */
export const useMapUi = create<MapUiState>()((set) => ({
  ...initial,
  select: (selection) => set({ selection }),
  setTool: (tool) => set({ tool, connectFrom: undefined }),
  setConnectFrom: (connectFrom) => set({ connectFrom }),
  openNewItem: (zoneId, point) => set({ newItem: { zoneId, point } }),
  closeNewItem: () => set({ newItem: undefined }),
  openNewZone: (parentId) => set({ newZone: { parentId } }),
  closeNewZone: () => set({ newZone: undefined }),
  toggleZoneFilter: (zoneId) =>
    set((state) => ({
      zoneFilter: state.zoneFilter.includes(zoneId)
        ? state.zoneFilter.filter((id) => id !== zoneId)
        : [...state.zoneFilter, zoneId],
    })),
  clearZoneFilter: () => set({ zoneFilter: [] }),
  setActiveFlow: (activeFlowId) => set({ activeFlowId, flowStep: 0, playing: false }),
  setFlowStep: (flowStep) => set({ flowStep }),
  setPlaying: (playing) => set({ playing }),
  setDrawing: (drawing) => set({ drawing, playing: false }),
  reset: () => set(initial),
}));
