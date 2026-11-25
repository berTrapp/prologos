import { Check, Plus, StickyNote, TriangleAlert, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Textarea } from '@/components/ui/Textarea';
import { SEVERITIES, type Severity } from '@/domain/schemas/notes';
import type { Item } from '@/domain/schemas/map';
import { badgeForState } from '@/lib/status-variants';
import type { MapActions } from '../useMapActions';
import type { MapModel } from '../useMapModel';
import { DetailsSection } from './DetailsSection';

type Kind = 'note' | 'risk';

const severityBadge = Object.fromEntries(
  SEVERITIES.map((severity) => [severity, badgeForState('severity', severity)]),
) as Record<Severity, ReturnType<typeof badgeForState>>;

/** RN 9: notes and risks pinned to the item; a resolved risk leaves the map. */
export function AnnotationsSection({
  item,
  model,
  actions,
  readOnly,
}: {
  item: Item;
  model: MapModel;
  actions: MapActions;
  readOnly: boolean;
}) {
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<Kind>('note');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [text, setText] = useState('');
  const annotations = model.annotations.get(item.id);
  const notes = annotations?.notes ?? [];
  const risks = annotations?.risks ?? [];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    if (kind === 'note') actions.addNote(item.id, text);
    else actions.addRisk(item.id, text, severity);
    setText('');
    setAdding(false);
  };

  if (readOnly && notes.length + risks.length === 0) return null;

  return (
    <DetailsSection title={t('map.panel.annotations')}>
      <ul className="flex flex-col gap-2">
        {risks.map((risk) => (
          <li
            key={risk.id}
            className="flex items-start gap-2.5 rounded-inner bg-fill-subtle p-3 inset-ring inset-ring-border"
          >
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Badge {...severityBadge[risk.severity]} className="self-start">
                {t('map.panel.risk')} · {t(`map.panel.severities.${risk.severity}`)}
              </Badge>
              <p className="text-[13px] leading-snug text-text">{risk.text}</p>
            </div>
            {readOnly ? null : (
              <div className="flex shrink-0 gap-0.5">
                <IconButton
                  label={t('map.panel.resolve')}
                  icon={<Check />}
                  onClick={() => actions.resolveRisk(risk.id)}
                />
                <IconButton
                  label={t('map.panel.removeRisk')}
                  icon={<X />}
                  onClick={() => actions.removeRisk(risk.id)}
                />
              </div>
            )}
          </li>
        ))}
        {notes.map((note) => (
          <li
            key={note.id}
            className="flex items-start gap-2.5 rounded-inner bg-fill-subtle p-3 inset-ring inset-ring-border"
          >
            <StickyNote aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
            <p className="min-w-0 flex-1 text-[13px] leading-snug whitespace-pre-wrap text-text">
              {note.text}
            </p>
            {readOnly ? null : (
              <IconButton
                label={t('map.panel.removeNote')}
                icon={<X />}
                onClick={() => actions.removeNote(note.id)}
              />
            )}
          </li>
        ))}
      </ul>
      {readOnly ? null : adding ? (
        <form noValidate onSubmit={submit} className="flex flex-col gap-3">
          <SegmentedControl<Kind>
            label={t('map.panel.kind')}
            value={kind}
            onValueChange={setKind}
            options={[
              { value: 'note', label: t('map.panel.note') },
              { value: 'risk', label: t('map.panel.risk') },
            ]}
            className="self-start"
          />
          <Textarea
            label={kind === 'note' ? t('map.panel.note') : t('map.panel.risk')}
            placeholder={
              kind === 'note' ? t('map.panel.notePlaceholder') : t('map.panel.riskPlaceholder')
            }
            rows={3}
            maxLength={kind === 'note' ? 2000 : 500}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          {kind === 'risk' ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-text">{t('map.panel.severity')}</span>
              <SegmentedControl<Severity>
                label={t('map.panel.severity')}
                value={severity}
                onValueChange={setSeverity}
                options={SEVERITIES.map((value) => ({
                  value,
                  label: t(`map.panel.severities.${value}`),
                }))}
                className="self-start"
              />
            </div>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button size="compact" onClick={() => setAdding(false)}>
              {t('ui.cancel')}
            </Button>
            <Button size="compact" type="submit" disabled={!text.trim()}>
              {t('map.panel.add')}
            </Button>
          </div>
        </form>
      ) : (
        <Button
          size="compact"
          icon={<Plus />}
          className="self-start"
          onClick={() => setAdding(true)}
        >
          {t('map.panel.addAnnotation')}
        </Button>
      )}
    </DetailsSection>
  );
}
