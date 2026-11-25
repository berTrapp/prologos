import { ArrowRight, ChevronDown, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Menu, MenuRadioGroup } from '@/components/ui/Menu';
import { CONNECTION_TYPES, type ConnectionType } from '@/domain/schemas/map';
import { useMapUi } from '../map-ui-store';
import type { MapActions } from '../useMapActions';
import type { MapModel } from '../useMapModel';

const NO_TYPE = 'none';

/** One connection: its ends, its optional type and delete; a grouped edge only explains itself. */
export function EdgeDetails({
  connectionIds,
  model,
  actions,
}: {
  connectionIds: string[];
  model: MapModel;
  actions: MapActions;
}) {
  const { t } = useTranslation();
  const select = useMapUi((s) => s.select);
  const connections = model.snapshot.connections.filter((c) => connectionIds.includes(c.id));
  const first = connections[0];
  if (!first) return null;

  const endName = (id: string) => {
    const item = model.itemById.get(id);
    if (item) return model.itemName(item);
    const zone = model.zoneById.get(id);
    return zone ? model.zoneName(zone) : '';
  };

  if (connections.length > 1) {
    const edge = model.edges.find((e) => e.connectionIds.includes(first.id));
    return (
      <p className="text-[13.5px] leading-relaxed text-muted">
        {t('map.panel.grouped', {
          count: connections.length,
          from: endName(edge?.source ?? first.from),
          to: endName(edge?.target ?? first.to),
        })}
      </p>
    );
  }

  const label = `${endName(first.from)} → ${endName(first.to)}`;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-1.5 text-[14px] text-text">
        <Button
          variant="quiet"
          size="compact"
          className="px-1.5"
          onClick={() => select({ kind: 'item', id: first.from })}
        >
          {endName(first.from)}
        </Button>
        <ArrowRight aria-hidden className="size-4 text-faint" />
        <Button
          variant="quiet"
          size="compact"
          className="px-1.5"
          onClick={() => select({ kind: 'item', id: first.to })}
        >
          {endName(first.to)}
        </Button>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12.5px] font-medium text-text">{t('map.panel.type')}</span>
        <Menu
          trigger={
            <Button size="compact">
              {first.type ? t(`map.connectionTypes.${first.type}`) : t('map.panel.noType')}
              <ChevronDown aria-hidden />
            </Button>
          }
        >
          <MenuRadioGroup<ConnectionType | typeof NO_TYPE>
            value={first.type ?? NO_TYPE}
            onValueChange={(value) =>
              actions.setConnectionType(first.id, value === NO_TYPE ? undefined : value)
            }
            options={[
              { value: NO_TYPE, label: t('map.panel.noType') },
              ...CONNECTION_TYPES.map((type) => ({
                value: type,
                label: t(`map.connectionTypes.${type}`),
              })),
            ]}
          />
        </Menu>
      </div>
      <div className="flex justify-end border-t border-border pt-4">
        <Button
          variant="destructive"
          icon={<Trash2 />}
          onClick={() => void actions.removeConnection(first.id, label)}
        >
          {t('map.panel.delete')}
        </Button>
      </div>
    </div>
  );
}
