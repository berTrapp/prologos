import { ChevronDown, FolderPlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Menu, MenuRadioGroup } from '@/components/ui/Menu';
import { ZoneTag } from '@/components/ui/ZoneTag';
import { canCreateSubzone } from '@/domain/rules/map';
import type { Zone } from '@/domain/schemas/map';
import { ZONE_IDS } from '@/domain/zones';
import { useMapUi } from '../map-ui-store';
import type { MapActions } from '../useMapActions';
import type { MapModel } from '../useMapModel';

/** A zone or subzone: name, color, a subzone, delete (RN 1). */
export function ZoneDetails({
  zone,
  model,
  actions,
}: {
  zone: Zone;
  model: MapModel;
  actions: MapActions;
}) {
  const { t } = useTranslation();
  const openNewZone = useMapUi((s) => s.openNewZone);
  const name = model.zoneName(zone);
  const [draft, setDraft] = useState(name);
  const count = model.layout.zones.find((z) => z.id === zone.id)?.count ?? 0;
  const parent = zone.parentId ? model.zoneById.get(zone.parentId) : undefined;

  const commit = () => {
    if (draft.trim() && draft.trim() !== name) actions.updateZone(zone.id, { name: draft });
    else setDraft(name);
  };

  return (
    <div className="flex flex-col gap-6">
      <Input
        label={t('map.panel.name')}
        value={draft}
        maxLength={60}
        hint={
          parent
            ? t('map.panel.subzone', { name: model.zoneName(parent) })
            : t('map.panel.itemsIn', { count })
        }
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
          if (event.key === 'Escape') setDraft(name);
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12.5px] font-medium text-text">{t('map.panel.color')}</span>
        <Menu
          trigger={
            <Button size="compact">
              <ZoneTag zone={zone.color} />
              <ChevronDown aria-hidden />
            </Button>
          }
        >
          <MenuRadioGroup
            value={zone.color}
            onValueChange={(color) => actions.updateZone(zone.id, { color })}
            options={ZONE_IDS.map((id) => ({ value: id, label: <ZoneTag zone={id} /> }))}
          />
        </Menu>
      </div>
      {canCreateSubzone(model.snapshot.zones, zone.id) ? (
        <Button
          size="compact"
          icon={<FolderPlus />}
          className="self-start"
          onClick={() => openNewZone(zone.id)}
        >
          {t('map.zone.addSub')}
        </Button>
      ) : null}
      <div className="flex justify-end border-t border-border pt-4">
        <Button
          variant="destructive"
          icon={<Trash2 />}
          onClick={() => void actions.removeZone(zone.id, name)}
        >
          {t('map.zone.delete')}
        </Button>
      </div>
    </div>
  );
}
