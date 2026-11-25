import { useNavigate } from 'react-router';
import { useMapUi } from '@/features/map/map-ui-store';

/** "Decidir no mapa": opens the map with the item selected and its details open. */
export function useGoToItem(projectId: string) {
  const navigate = useNavigate();
  return (itemId: string) => {
    const ui = useMapUi.getState();
    ui.openProject(projectId);
    ui.select({ kind: 'item', id: itemId });
    navigate(`/p/${projectId}`);
  };
}
