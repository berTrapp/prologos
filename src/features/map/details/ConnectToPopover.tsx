import { Command } from 'cmdk';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Popover } from '@/components/ui/Popover';
import { ZoneTag } from '@/components/ui/ZoneTag';
import { canConnect } from '@/domain/rules/map';
import type { Item } from '@/domain/schemas/map';
import type { MapActions } from '../useMapActions';
import type { MapModel } from '../useMapModel';

/** "Conectar a…": search an item and link this one to it (RN 1). */
export function ConnectToPopover({
  item,
  model,
  actions,
}: {
  item: Item;
  model: MapModel;
  actions: MapActions;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const targets = model.snapshot.items.filter((other) =>
    canConnect(model.snapshot, item.id, other.id),
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      className="w-80 p-0"
      trigger={
        <Button size="compact" icon={<Plus />} className="self-start">
          {t('map.panel.connectTo')}
        </Button>
      }
    >
      <Command label={t('map.panel.connectTo')} loop>
        <Command.Input
          placeholder={t('map.panel.connectSearch')}
          className="h-11 w-full border-b border-border bg-transparent px-3 text-[13.5px] text-text outline-none placeholder:text-faint pointer-coarse:text-[16px]"
        />
        <Command.List className="max-h-64 overflow-y-auto p-1">
          <Command.Empty className="px-3 py-6 text-center text-[13px] text-muted">
            {t('map.panel.connectEmpty')}
          </Command.Empty>
          {targets.map((target) => {
            const zone = model.zoneById.get(target.zoneId);
            const name = model.itemName(target);
            return (
              <Command.Item
                key={target.id}
                value={`${name} ${target.id}`}
                onSelect={() => {
                  actions.connect(item.id, target.id);
                  setOpen(false);
                }}
                className="flex h-9 cursor-default items-center gap-3 rounded-track px-2.5 text-[13px] text-text select-none data-[selected=true]:bg-fill-strong pointer-coarse:h-11"
              >
                <span className="min-w-0 flex-1 truncate">{name}</span>
                {zone ? (
                  <ZoneTag
                    zone={zone.color}
                    label={model.zoneName(zone)}
                    className="text-[11.5px] text-muted"
                  />
                ) : null}
              </Command.Item>
            );
          })}
        </Command.List>
      </Command>
    </Popover>
  );
}
