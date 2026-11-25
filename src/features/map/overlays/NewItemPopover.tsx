import { ChevronDown } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Menu, MenuRadioGroup } from '@/components/ui/Menu';
import { Popover } from '@/components/ui/Popover';
import { ZoneTag } from '@/components/ui/ZoneTag';
import { suggestionsFor } from '@/domain/rules/kit-lookup';
import { useMapUi } from '../map-ui-store';
import type { MapActions } from '../useMapActions';
import type { MapModel } from '../useMapModel';

/** N or "+": name and zone, plus the kit items not on the map yet (ux-ui 13.10). */
export function NewItemPopover({ model, actions }: { model: MapModel; actions: MapActions }) {
  const { t } = useTranslation();
  const request = useMapUi((s) => s.newItem);
  const close = useMapUi((s) => s.closeNewItem);
  if (!request) return null;
  return (
    <Popover
      open
      onOpenChange={(open) => (open ? undefined : close())}
      anchorPoint={request.point}
      label={t('map.newItem.title')}
      className="w-80"
    >
      <NewItemForm
        key={`${request.point.x}:${request.point.y}`}
        model={model}
        actions={actions}
        initialZone={request.zoneId}
        onDone={close}
      />
    </Popover>
  );
}

function NewItemForm({
  model,
  actions,
  initialZone,
  onDone,
}: {
  model: MapModel;
  actions: MapActions;
  initialZone: string | undefined;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const zones = [...model.snapshot.zones].sort(
    (a, b) => Number(a.parentId !== null) - Number(b.parentId !== null) || a.order - b.order,
  );
  const [zoneId, setZoneId] = useState(initialZone ?? zones[0]?.id ?? '');
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();
  const zone = model.zoneById.get(zoneId);
  const suggestions = suggestionsFor(model.snapshot, model.kit, zone, model.language);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError(t('map.newItem.nameRequired'));
      return;
    }
    actions.addItem({ zoneId, name });
    onDone();
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-3">
      <p className="text-[14px] font-semibold text-text">{t('map.newItem.title')}</p>
      <Input
        label={t('map.newItem.name')}
        placeholder={t('map.newItem.placeholder')}
        value={name}
        maxLength={80}
        error={error}
        onChange={(event) => {
          setName(event.target.value);
          if (error) setError(undefined);
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12.5px] font-medium text-text">{t('map.newItem.zone')}</span>
        <Menu
          align="end"
          trigger={
            <Button variant="quiet" size="compact">
              {zone ? <ZoneTag zone={zone.color} label={model.zoneName(zone)} /> : null}
              <ChevronDown aria-hidden />
            </Button>
          }
        >
          <MenuRadioGroup
            value={zoneId}
            onValueChange={setZoneId}
            options={zones.map((z) => ({
              value: z.id,
              label: <ZoneTag zone={z.color} label={model.zoneName(z)} />,
            }))}
          />
        </Menu>
      </div>
      {suggestions.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-[12.5px] font-medium text-muted">{t('map.newItem.suggestions')}</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion) => (
              <Chip
                key={suggestion.kitRef}
                onClick={() => {
                  actions.addItem(
                    {
                      zoneId,
                      name: suggestion.name,
                      kitRef: suggestion.kitRef,
                      state: suggestion.state,
                      ...(suggestion.tech ? { tech: suggestion.tech } : {}),
                    },
                    true,
                  );
                  onDone();
                }}
              >
                {suggestion.name}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}
      <Button type="submit" variant="primary" className="self-end">
        {t('map.newItem.create')}
      </Button>
    </form>
  );
}
