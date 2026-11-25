import { MousePointerClick } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui/EmptyState';
import { Panel } from '@/components/ui/Panel';
import { ZoneTag } from '@/components/ui/ZoneTag';
import { useMapUi } from '../map-ui-store';
import type { MapActions } from '../useMapActions';
import type { MapModel } from '../useMapModel';
import { EdgeDetails } from './EdgeDetails';
import { ItemDetails } from './ItemDetails';
import { ZoneDetails } from './ZoneDetails';

/** Retractable panel on the right; the collapse control sits in its own header (ux-ui 1). */
export function DetailsPanel({
  model,
  actions,
  collapsed,
  onCollapsedChange,
}: {
  model: MapModel;
  actions: MapActions;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const { t } = useTranslation();
  const selection = useMapUi((s) => s.selection);
  const item = selection?.kind === 'item' ? model.itemById.get(selection.id) : undefined;
  const zone = selection?.kind === 'zone' ? model.zoneById.get(selection.id) : undefined;
  const itemZone = item ? model.zoneById.get(item.zoneId) : undefined;

  const title = itemZone ? (
    <ZoneTag
      zone={itemZone.color}
      label={model.zoneName(itemZone)}
      className="font-normal text-muted"
    />
  ) : zone ? (
    <ZoneTag zone={zone.color} label={t('map.panel.zone')} className="font-normal text-muted" />
  ) : selection?.kind === 'edge' ? (
    t('map.panel.connection')
  ) : (
    t('map.panel.title')
  );

  return (
    <Panel
      side="right"
      width={360}
      title={title}
      label={t('map.panel.title')}
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
    >
      <div className="px-1 pt-1 pb-6">
        {item ? (
          <>
            <h2 className="mb-5 text-[20px] leading-tight font-semibold text-text">
              {model.itemName(item)}
            </h2>
            <ItemDetails
              key={`${item.id}:${item.name}`}
              item={item}
              model={model}
              actions={actions}
            />
          </>
        ) : zone ? (
          <ZoneDetails
            key={`${zone.id}:${zone.name ?? ''}`}
            zone={zone}
            model={model}
            actions={actions}
          />
        ) : selection?.kind === 'edge' ? (
          <EdgeDetails connectionIds={selection.connectionIds} model={model} actions={actions} />
        ) : (
          <EmptyState
            icon={<MousePointerClick />}
            title={t('map.panel.emptyTitle')}
            description={t('map.panel.emptyBody')}
          />
        )}
      </div>
    </Panel>
  );
}
