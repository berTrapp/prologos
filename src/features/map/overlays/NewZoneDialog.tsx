import { ChevronDown } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Menu, MenuRadioGroup } from '@/components/ui/Menu';
import { ZoneTag } from '@/components/ui/ZoneTag';
import { ZONE_IDS, type ZoneColor } from '@/domain/zones';
import { useMapUi } from '../map-ui-store';
import type { MapActions } from '../useMapActions';
import type { MapModel } from '../useMapModel';

/** Z: a new zone, or a subzone from the zone menu (RN 1). */
export function NewZoneDialog({ model, actions }: { model: MapModel; actions: MapActions }) {
  const { t } = useTranslation();
  const request = useMapUi((s) => s.newZone);
  const close = useMapUi((s) => s.closeNewZone);
  const parent = request?.parentId ? model.zoneById.get(request.parentId) : undefined;
  return (
    <Dialog
      open={request !== undefined}
      onOpenChange={(open) => (open ? undefined : close())}
      title={t('map.newZone.title')}
      description={t('map.newZone.description')}
    >
      {request ? (
        <NewZoneForm
          parentName={parent ? model.zoneName(parent) : undefined}
          initialColor={parent?.color ?? 'app'}
          onCancel={close}
          onCreate={(name, color) => {
            actions.addZone({ name, color, parentId: request.parentId });
            close();
          }}
        />
      ) : null}
    </Dialog>
  );
}

function NewZoneForm({
  parentName,
  initialColor,
  onCancel,
  onCreate,
}: {
  parentName: string | undefined;
  initialColor: ZoneColor;
  onCancel: () => void;
  onCreate: (name: string, color: ZoneColor) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [color, setColor] = useState<ZoneColor>(initialColor);
  const [error, setError] = useState<string>();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError(t('map.newZone.nameRequired'));
      return;
    }
    onCreate(name, color);
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <Input
        label={t('map.newZone.name')}
        placeholder={t('map.newZone.placeholder')}
        value={name}
        maxLength={60}
        error={error}
        onChange={(event) => {
          setName(event.target.value);
          if (error) setError(undefined);
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12.5px] font-medium text-text">{t('map.newZone.color')}</span>
        <Menu
          trigger={
            <Button variant="ghost" size="compact">
              <ZoneTag zone={color} />
              <ChevronDown aria-hidden />
            </Button>
          }
        >
          <MenuRadioGroup
            value={color}
            onValueChange={setColor}
            options={ZONE_IDS.map((id) => ({ value: id, label: <ZoneTag zone={id} /> }))}
          />
        </Menu>
      </div>
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="text-[12.5px] font-medium text-text">{t('map.newZone.parent')}</span>
        <span className="text-muted">
          {parentName ? t('map.panel.subzone', { name: parentName }) : t('map.newZone.top')}
        </span>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button onClick={onCancel}>{t('ui.cancel')}</Button>
        <Button type="submit" variant="primary">
          {t('map.newZone.create')}
        </Button>
      </div>
    </form>
  );
}
