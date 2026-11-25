import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CoverageRing } from '@/components/ui/CoverageRing';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { checklistView, type ChecklistRow } from '@/domain/rules/checklist';
import { kitText } from '@/domain/rules/kit';
import type { View } from '@/domain/schemas/project';
import { useMapActions } from '@/features/map/useMapActions';
import { useMapModel, type MapModel } from '@/features/map/useMapModel';
import { DataNotice } from '@/features/project/DataNotice';
import { PageHeader } from '@/features/shell/PageHeader';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PrepSection } from './PrepSection';
import { useGoToItem } from './useGoToItem';
import { ZoneSection } from './ZoneSection';

/** "O que falta decidir": what is left, in order, with the next step on top (RN 5, 15). */
export function ChecklistPage() {
  const { t } = useTranslation();
  const model = useMapModel();
  const actions = useMapActions();
  const phone = useBreakpoint() === 'phone';
  const goToItem = useGoToItem(model?.snapshot.project.id ?? '');
  const view = useMemo(
    () =>
      model ? checklistView(model.snapshot, model.kit, model.snapshot.project.view) : undefined,
    [model],
  );
  if (!model || !view) return null;

  const viewControl = (
    <SegmentedControl<View>
      label={t('map.view.label')}
      value={model.snapshot.project.view}
      onValueChange={actions.setView}
      options={[
        { value: 'today', label: t('map.view.today') },
        { value: 'complete', label: t('map.view.complete') },
      ]}
      className={phone ? 'w-full [&>*]:flex-1' : undefined}
    />
  );

  // Technologies marked "Nunca usei", for the trail badge and the next step (RN 15).
  const newTechs = new Set(model.snapshot.items.filter((i) => i.newForYou).map((i) => i.tech));
  const techNames = (model.kit?.technologies ?? [])
    .filter((tech) => newTechs.has(tech.id))
    .map((tech) => kitText(tech.name, model.language));
  const techs = new Intl.ListFormat(model.language, { type: 'conjunction' }).format(techNames);
  const techCount = new Set(model.snapshot.items.filter((i) => i.newForYou).map((i) => i.tech))
    .size;

  const addToMap = (row: ChecklistRow) => {
    const source = model.kit?.items.find((i) => i.id === row.kitRef);
    const expectation = model.snapshot.checklist.find((c) => c.id === row.expectationId);
    const zoneId =
      expectation && model.zoneById.has(expectation.zoneId) ? expectation.zoneId : undefined;
    if (!source || !zoneId) return;
    actions.addItem(
      {
        zoneId,
        name: kitText(source.name, model.language),
        kitRef: source.id,
        state: source.state,
        when: source.when,
        ...(source.tech ? { tech: source.tech } : {}),
      },
      true,
    );
  };

  return (
    <>
      <PageHeader
        title={t('checklist.title')}
        subtitle={t('checklist.lead')}
        action={viewControl}
        phoneAction={<span />}
      />
      <DataNotice />
      <div className="flex flex-col gap-6">
        {phone ? viewControl : null}
        <div className="grid gap-4 desktop:grid-cols-[minmax(0,1fr)_340px]">
          <NextStepCard
            model={model}
            techs={techs}
            techCount={techCount}
            prepDone={view.prep}
            allDone={view.resolved === view.total}
            onDecide={goToItem}
          />
          <Card className="flex items-center">
            <CoverageRing
              value={view.percent}
              size={72}
              caption={t('checklist.resolved', { resolved: view.resolved, total: view.total })}
            />
          </Card>
        </div>
        {view.prep && model.kit ? (
          <PrepSection
            prep={view.prep}
            kit={model.kit}
            techs={techs}
            language={model.language}
            onToggle={actions.setPrepStep}
          />
        ) : null}
        {view.sections.map((section) => (
          <ZoneSection
            key={section.zoneId}
            section={section}
            model={model}
            actions={actions}
            onDecideOnMap={goToItem}
            onAddToMap={addToMap}
          />
        ))}
      </div>
    </>
  );
}

function NextStepCard({
  model,
  techs,
  techCount,
  prepDone,
  allDone,
  onDecide,
}: {
  model: MapModel;
  techs: string;
  techCount: number;
  prepDone: ReturnType<typeof checklistView>['prep'];
  allDone: boolean;
  onDecide: (itemId: string) => void;
}) {
  const { t } = useTranslation();
  const step = model.steps[0];
  let title = t('checklist.next.doneTitle');
  let body = t('checklist.next.doneBody');
  let itemId: string | undefined;

  if (allDone) {
    // Keeps the "Tudo resolvido" title and body.
  } else if (step?.kind === 'prepare-env' && model.kit) {
    const next = prepDone?.steps.find((s) => !s.done);
    const source = next ? model.kit.prepTrail[next.index] : undefined;
    title = source ? kitText(source.title, model.language) : t('firstStep.prepare-env');
    body = t('checklist.next.prepBody', { techs, count: techCount });
  } else if (step?.kind === 'decide') {
    const item = model.itemById.get(step.itemId);
    title = t('firstStep.decide', { name: item ? model.itemName(item) : '' });
    body = t('checklist.next.decideBody');
    itemId = step.itemId;
  } else if (step?.kind === 'choose-stack') {
    title = t('firstStep.choose-stack');
    body = t('firstStep.body.choose-stack');
  } else if (step?.kind === 'draw-flow') {
    title = t('firstStep.draw-flow');
    body = t('firstStep.body.draw-flow');
  }

  return (
    <Card variant="highlight" className="flex flex-col gap-2">
      <p className="text-[13px] font-semibold text-accent">{t('checklist.next.label')}</p>
      <p className="text-[20px] leading-snug font-semibold text-text">{title}</p>
      <p className="text-[14px] leading-relaxed text-muted">{body}</p>
      {itemId ? (
        <Button size="compact" className="mt-1 self-start" onClick={() => onDecide(itemId)}>
          {t('checklist.row.decideOnMap')}
          <ArrowRight aria-hidden />
        </Button>
      ) : null}
    </Card>
  );
}
