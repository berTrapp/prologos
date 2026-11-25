import { ArrowRight, Check, Plus, RotateCcw } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Popover } from '@/components/ui/Popover';
import { ZoneTag } from '@/components/ui/ZoneTag';
import type { ChecklistRow, ChecklistSection } from '@/domain/rules/checklist';
import { isResolved } from '@/domain/rules/checklist';
import { kitText } from '@/domain/rules/kit';
import { badgeForState } from '@/lib/status-variants';
import { cn } from '@/lib/utils';
import type { MapActions } from '@/features/map/useMapActions';
import type { MapModel } from '@/features/map/useMapModel';

const statusBadge = {
  decided: badgeForState('checklist', 'decided'),
  pending: badgeForState('checklist', 'pending'),
  notApplicable: badgeForState('checklist', 'notApplicable'),
  missing: badgeForState('checklist', 'missing'),
  future: badgeForState('checklist', 'future'),
};

type ZoneSectionProps = {
  section: ChecklistSection;
  model: MapModel;
  actions: MapActions;
  onDecideOnMap: (itemId: string) => void;
  onAddToMap: (row: ChecklistRow) => void;
};

/** One zone of "O que falta decidir": pending first, then what is resolved (RN 5). */
export function ZoneSection({
  section,
  model,
  actions,
  onDecideOnMap,
  onAddToMap,
}: ZoneSectionProps) {
  const { t } = useTranslation();
  const zone = model.zoneById.get(section.zoneId);
  if (!zone) return null;

  const rowName = (row: ChecklistRow) => {
    const item = row.itemId ? model.itemById.get(row.itemId) : undefined;
    if (item) return model.itemName(item);
    const source = model.kit?.items.find((i) => i.id === row.kitRef);
    return source ? kitText(source.name, model.language) : '';
  };

  return (
    <Card padding="none">
      <header className="flex items-center justify-between gap-3 px-6 pt-5 pb-3">
        <h2 className="text-[15px] font-semibold">
          <ZoneTag
            zone={zone.color}
            label={model.zoneName(zone)}
            className="text-[15px] font-semibold"
          />
        </h2>
        <span className="text-[13px] text-muted">
          {section.pending > 0
            ? t('checklist.zone.pending', { count: section.pending })
            : t('checklist.zone.done')}
        </span>
      </header>
      <ul className="flex flex-col">
        {section.rows.map((row) => (
          <Row
            key={row.key}
            row={row}
            name={rowName(row)}
            actions={actions}
            onDecideOnMap={onDecideOnMap}
            onAddToMap={onAddToMap}
          />
        ))}
      </ul>
    </Card>
  );
}

function Row({
  row,
  name,
  actions,
  onDecideOnMap,
  onAddToMap,
}: {
  row: ChecklistRow;
  name: string;
  actions: MapActions;
  onDecideOnMap: (itemId: string) => void;
  onAddToMap: (row: ChecklistRow) => void;
}) {
  const { t } = useTranslation();
  const resolved = isResolved(row.status);
  const canToggle =
    row.itemId !== undefined && (row.status === 'decided' || row.status === 'pending');

  return (
    <li className="flex flex-col gap-3 border-t border-border px-6 py-3.5 tablet:flex-row tablet:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {canToggle && row.itemId ? (
          <button
            type="button"
            aria-label={
              row.status === 'decided'
                ? t('checklist.row.markPending', { name })
                : t('checklist.row.markDecided', { name })
            }
            aria-pressed={row.status === 'decided'}
            onClick={() =>
              actions.updateItem(row.itemId ?? '', {
                state: row.status === 'decided' ? 'pending' : 'decided',
              })
            }
            className="grid size-8 shrink-0 place-items-center rounded-full pointer-coarse:size-11 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <StatusCircle resolved={resolved} />
          </button>
        ) : (
          <span className="grid size-8 shrink-0 place-items-center pointer-coarse:size-11">
            <StatusCircle resolved={resolved} />
          </span>
        )}
        <div className="flex min-w-0 flex-col">
          <span className={cn('truncate text-[14.5px]', resolved ? 'text-muted' : 'text-text')}>
            {name}
          </span>
          {row.reason ? (
            <span className="truncate text-[12.5px] text-faint">
              {t('checklist.row.reason', { reason: row.reason })}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 pl-11 tablet:justify-end tablet:pl-0">
        {row.future ? <Badge {...statusBadge.future}>{t('status.checklist.future')}</Badge> : null}
        <Badge {...statusBadge[row.status]}>{t(`status.checklist.${row.status}`)}</Badge>
        {row.status === 'notApplicable' && row.expectationId ? (
          <Button
            size="compact"
            icon={<RotateCcw />}
            onClick={() => actions.setNotApplicable(row.expectationId ?? '', undefined, name)}
          >
            {t('checklist.row.reconsider')}
          </Button>
        ) : null}
        {!resolved && row.expectationId ? (
          <NotApplicableButton
            name={name}
            onMark={(reason) => actions.setNotApplicable(row.expectationId ?? '', reason, name)}
          />
        ) : null}
        {row.status === 'missing' ? (
          <Button size="compact" icon={<Plus />} onClick={() => onAddToMap(row)}>
            {t('checklist.row.addToMap')}
          </Button>
        ) : null}
        {row.status === 'pending' && row.itemId ? (
          <Button size="compact" onClick={() => onDecideOnMap(row.itemId ?? '')}>
            {t('checklist.row.decideOnMap')}
            <ArrowRight aria-hidden />
          </Button>
        ) : null}
      </div>
    </li>
  );
}

/** Resolved: a filled check; open: an empty ring. The shape changes, not only the color. */
function StatusCircle({ resolved }: { resolved: boolean }) {
  return resolved ? (
    <span
      aria-hidden
      className="grid size-[18px] place-items-center rounded-full bg-success text-bg"
    >
      <Check className="size-3" strokeWidth={3} />
    </span>
  ) : (
    <span
      aria-hidden
      className="size-[18px] rounded-full inset-ring-[1.5px] inset-ring-stroke-strong"
    />
  );
}

/** RN 5: "Não se aplica" asks a short reason (140 characters at most). */
function NotApplicableButton({ name, onMark }: { name: string; onMark: (reason: string) => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string>();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!reason.trim()) {
      setError(t('checklist.row.reasonRequired'));
      return;
    }
    onMark(reason);
    setOpen(false);
    setReason('');
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      trigger={<Button size="compact">{t('checklist.row.notApplicable')}</Button>}
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-3">
        <p className="text-[14px] font-semibold text-text">
          {t('checklist.row.naTitle', { name })}
        </p>
        <Input
          label={t('checklist.row.reasonLabel')}
          placeholder={t('checklist.row.reasonPlaceholder')}
          value={reason}
          maxLength={140}
          error={error}
          onChange={(event) => {
            setReason(event.target.value);
            if (error) setError(undefined);
          }}
        />
        <div className="flex justify-end gap-2">
          <Button size="compact" onClick={() => setOpen(false)}>
            {t('ui.cancel')}
          </Button>
          <Button size="compact" type="submit">
            {t('checklist.row.save')}
          </Button>
        </div>
      </form>
    </Popover>
  );
}
