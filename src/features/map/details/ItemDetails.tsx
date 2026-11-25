import { ArrowLeft, ArrowRight, ExternalLink, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { badgeForState } from '@/lib/status-variants';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChoiceCard, ChoiceGroup } from '@/components/ui/ChoiceCard';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { itemKnowledge } from '@/domain/rules/kit-lookup';
import type { Item } from '@/domain/schemas/map';
import { useMapUi } from '../map-ui-store';
import type { MapActions } from '../useMapActions';
import type { MapModel } from '../useMapModel';
import { AnnotationsSection } from './AnnotationsSection';
import { ConnectToPopover } from './ConnectToPopover';
import { DetailsSection } from './DetailsSection';

const recommendedBadge = badgeForState('label', 'recommended');

const newForYouBadge = badgeForState('label', 'newForYou');

type ItemDetailsProps = {
  item: Item;
  model: MapModel;
  actions: MapActions;
  /** Phone: read and decide only (options, Atual/Futuro), never full editing (ux-ui 12). */
  compact?: boolean;
};

/** Everything about one item: name, when, status, knowledge, options, connections, notes. */
export function ItemDetails({ item, model, actions, compact = false }: ItemDetailsProps) {
  const { t } = useTranslation();
  const select = useMapUi((s) => s.select);
  const name = model.itemName(item);
  const [draft, setDraft] = useState(name);
  const knowledge = itemKnowledge(item, model.kit, model.knownKit, model.language);
  const chosen = item.state === 'decided' ? model.choiceName(item) : undefined;
  const chosenIndex = knowledge.options.findIndex((o) => o.name === chosen);
  const hasKnowledge = Boolean(knowledge.what ?? knowledge.why ?? knowledge.docs);
  const links = [
    ...model.snapshot.connections
      .filter((c) => c.to === item.id)
      .map((c) => ({ c, other: c.from, incoming: true })),
    ...model.snapshot.connections
      .filter((c) => c.from === item.id)
      .map((c) => ({ c, other: c.to, incoming: false })),
  ];

  const commitName = () => {
    if (draft.trim() && draft.trim() !== name) actions.updateItem(item.id, { name: draft });
    else setDraft(name);
  };

  return (
    <div className="flex flex-col gap-6">
      {compact ? null : (
        <Input
          label={t('map.panel.name')}
          value={draft}
          maxLength={80}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitName}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
            if (event.key === 'Escape') setDraft(name);
          }}
        />
      )}

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-medium text-text">{t('map.panel.when')}</span>
          <SegmentedControl<Item['when']>
            label={t('map.panel.when')}
            value={item.when}
            onValueChange={(when) => actions.updateItem(item.id, { when })}
            options={[
              { value: 'now', label: t('map.panel.now') },
              { value: 'later', label: t('map.panel.later') },
            ]}
            className={compact ? 'w-full [&>*]:flex-1' : undefined}
          />
        </div>
        {compact ? null : (
          <div className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-medium text-text">{t('map.panel.state')}</span>
            <SegmentedControl<Item['state']>
              label={t('map.panel.state')}
              value={item.state}
              onValueChange={(state) => actions.updateItem(item.id, { state })}
              options={[
                { value: 'decided', label: t('map.panel.decided') },
                { value: 'pending', label: t('map.panel.pending') },
              ]}
            />
          </div>
        )}
      </div>

      {knowledge.options.length > 0 ? (
        <DetailsSection title={t('map.panel.options')} hint={t('map.panel.optionsLead')}>
          <ChoiceGroup<string>
            label={<span className="sr-only">{t('map.panel.options')}</span>}
            value={chosenIndex >= 0 ? String(chosenIndex) : undefined}
            columns={1}
            onValueChange={(value) => {
              const option = knowledge.options[Number(value)];
              if (option) actions.chooseOption(item.id, option.name, name);
            }}
          >
            {knowledge.options.map((option) => (
              <ChoiceCard
                key={option.index}
                value={String(option.index)}
                title={option.name}
                description={option.why}
                badge={
                  option.recommended ? (
                    <Badge {...recommendedBadge}>{t('newProject.stack.recommended')}</Badge>
                  ) : undefined
                }
              />
            ))}
          </ChoiceGroup>
        </DetailsSection>
      ) : null}

      {hasKnowledge ? (
        <Card variant={item.newForYou ? 'highlight' : 'inner'} padding="compact">
          <div className="flex flex-col gap-3 text-[13.5px] leading-relaxed">
            {item.newForYou ? (
              <Badge {...newForYouBadge} className="self-start">
                {t('ui.newForYou')}
              </Badge>
            ) : null}
            {knowledge.what ? (
              <p>
                <span className="font-semibold text-text">{t('map.panel.what')}</span>
                <span className="block text-muted">{knowledge.what}</span>
              </p>
            ) : null}
            {knowledge.why ? (
              <p>
                <span className="font-semibold text-text">{t('map.panel.why')}</span>
                <span className="block text-muted">{knowledge.why}</span>
              </p>
            ) : null}
            {knowledge.equivalent && model.knownKit ? (
              <p className="flex flex-wrap items-center gap-2 text-muted">
                {t('map.panel.equivalent', {
                  stack: t(`newProject.stack.stacks.${model.knownKit.knownStack ?? 'none'}`),
                })}
                <Chip>{knowledge.equivalent.value}</Chip>
              </p>
            ) : null}
            {knowledge.docs ? (
              <Button asChild variant="quiet" size="compact" className="self-start text-accent">
                <a href={knowledge.docs} target="_blank" rel="noreferrer noopener">
                  {t('map.panel.docs')}
                  <ExternalLink aria-hidden />
                </a>
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

      {compact ? null : (
        <DetailsSection title={t('map.panel.connections')}>
          {links.length === 0 ? (
            <p className="text-[13px] text-muted">{t('map.panel.noConnections')}</p>
          ) : (
            <ul className="flex flex-col">
              {links.map(({ c, other, incoming }) => {
                const target = model.itemById.get(other);
                if (!target) return null;
                const otherName = model.itemName(target);
                return (
                  <li key={c.id} className="flex min-h-9 items-center gap-2">
                    {incoming ? (
                      <ArrowLeft aria-hidden className="size-3.5 shrink-0 text-faint" />
                    ) : (
                      <ArrowRight aria-hidden className="size-3.5 shrink-0 text-faint" />
                    )}
                    <Button
                      variant="quiet"
                      size="compact"
                      className="min-w-0 justify-start px-1.5"
                      aria-label={t('map.panel.openItem', { name: otherName })}
                      onClick={() => select({ kind: 'item', id: target.id })}
                    >
                      <span className="truncate">{otherName}</span>
                    </Button>
                    {c.type ? (
                      <span className="ml-auto shrink-0 font-mono text-[11.5px] text-faint">
                        {t(`map.connectionTypes.${c.type}`)}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
          <ConnectToPopover item={item} model={model} actions={actions} />
        </DetailsSection>
      )}

      <AnnotationsSection item={item} model={model} actions={actions} readOnly={compact} />

      {compact ? null : (
        <div className="flex justify-end border-t border-border pt-4">
          <Button
            variant="destructive"
            icon={<Trash2 />}
            onClick={() => void actions.removeItem(item.id, name)}
          >
            {t('map.panel.delete')}
          </Button>
        </div>
      )}
    </div>
  );
}
