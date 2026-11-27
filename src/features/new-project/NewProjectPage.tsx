import { ArrowRight, ChevronLeft, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { workspaceStore } from '@/app/services';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Logo } from '@/components/ui/Logo';
import { Sheet } from '@/components/ui/Sheet';
import { WizardStepBar, WizardStepList } from '@/components/ui/WizardSteps';
import { buildProjectFromAnswers } from '@/domain/rules/guided-start';
import { kitText } from '@/domain/rules/kit';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ExperienceStep } from './ExperienceStep';
import { GUIDED_STEPS, useGuided } from './guided-store';
import { IdeaStep } from './IdeaStep';
import { MapPreview } from './MapPreview';
import { RunsOnStep } from './RunsOnStep';
import { StackStep } from './StackStep';
import { SummaryStep } from './SummaryStep';
import { useBuildContext, useGuidedModel } from './useGuidedModel';

const STEP_VIEWS = [IdeaStep, StackStep, ExperienceStep, RunsOnStep, SummaryStep];
const LAST = GUIDED_STEPS.length - 1;

/** Guided start: five skippable steps with a live preview of the map (RN 13). */
export function NewProjectPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const phone = useBreakpoint() !== 'desktop';
  const step = useGuided((s) => s.step);
  const goTo = useGuided((s) => s.goTo);
  const reset = useGuided((s) => s.reset);
  const model = useGuidedModel();
  const context = useBuildContext();
  const [busy, setBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const StepView = STEP_VIEWS[step] ?? IdeaStep;

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [step]);

  // The draft stays in memory, so closing and coming back continues where it stopped.
  const close = () => (location.key !== 'default' ? navigate(-1) : navigate('/'));

  const create = async () => {
    setBusy(true);
    try {
      const snapshot = buildProjectFromAnswers(model.answers, model.kit, {
        ...context,
        id: crypto.randomUUID(),
        now: Date.now(),
        createId: () => crypto.randomUUID(),
      });
      const id = await workspaceStore.getState().addProject(snapshot);
      // ux-ui 14: the new project opens on screen, so no toast is needed. The draft is
      // cleared only once the map is showing, or the empty first step flashes meanwhile.
      await navigate(`/p/${id}`, { replace: true });
      reset();
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (step === LAST) void create();
    else goTo(step + 1);
  };

  const { answers, kit, counts, language } = model;
  const steps = GUIDED_STEPS.map((id, index) => ({
    id,
    label: t(`newProject.steps.${id}`),
    answer:
      index === 0
        ? answers.name.trim() || undefined
        : index === 1 && kit
          ? kitText(kit.name, language)
          : undefined,
  }));

  const primary = (
    <Button
      type="submit"
      variant="primary"
      size={phone ? 'touch' : 'default'}
      loading={busy}
      loadingText={t('newProject.creating')}
      className={phone ? 'w-full' : undefined}
    >
      {step === LAST ? t('newProject.create') : t('newProject.continue')}
      {step === LAST ? null : <ArrowRight aria-hidden />}
    </Button>
  );
  const back =
    step > 0 ? <Button onClick={() => goTo(step - 1)}>{t('newProject.back')}</Button> : null;

  if (phone) {
    return (
      <form noValidate onSubmit={submit} className="flex min-h-dvh flex-col bg-bg">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-bg/92 px-2 backdrop-blur-xl">
          {step > 0 ? (
            <IconButton
              label={t('newProject.back')}
              icon={<ChevronLeft />}
              onClick={() => goTo(step - 1)}
            />
          ) : (
            <IconButton label={t('ui.close')} icon={<X />} onClick={close} />
          )}
          <p className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold text-text">
            {t('newProject.title')}
          </p>
          {step > 0 ? (
            <IconButton label={t('ui.close')} icon={<X />} onClick={close} />
          ) : (
            <span aria-hidden className="size-11" />
          )}
        </header>
        <main
          id="content"
          className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-5 px-4 pt-4 pb-32"
        >
          <WizardStepBar
            total={GUIDED_STEPS.length}
            current={step}
            label={t('newProject.stepOf', { current: step + 1, total: GUIDED_STEPS.length })}
          />
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="surface flex min-h-12 items-center gap-3 rounded-inner px-4 text-left inset-ring inset-ring-border focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Logo size={12} />
            <span className="min-w-0 flex-1 truncate text-[15px] text-text">
              {t('newProject.preview.pill', { decided: counts.decided, pending: counts.pending })}
            </span>
            <span className="text-[14px] text-muted">{t('newProject.preview.show')}</span>
          </button>
          <StepView />
        </main>
        <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/92 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-xl">
          <div className="mx-auto max-w-[640px]">{primary}</div>
        </footer>
        <Sheet
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          title={t('newProject.preview.label')}
        >
          <MapPreview model={model} inSheet />
          <p className="mt-6 text-[13px] text-muted">{t('newProject.preview.note')}</p>
        </Sheet>
      </form>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-bg">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-6">
        <Logo size={28} />
        <span className="text-[15px] font-semibold text-text">{t('app.name')}</span>
        <span aria-hidden className="text-faint">
          /
        </span>
        <span className="text-[14px] text-muted">{t('newProject.title')}</span>
        <IconButton label={t('ui.close')} icon={<X />} onClick={close} className="ml-auto" />
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-[248px_minmax(0,1fr)_minmax(360px,420px)]">
        <aside className="border-r border-border p-4 pt-8">
          <WizardStepList
            steps={steps}
            current={step}
            reachable={LAST}
            onSelect={goTo}
            label={t('newProject.stepsLabel')}
          />
        </aside>
        <form noValidate onSubmit={submit} className="flex min-h-0 flex-col">
          <main id="content" ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[680px] px-12 py-12">
              <StepView />
            </div>
          </main>
          <footer className="flex h-[72px] shrink-0 items-center gap-3 border-t border-border px-12">
            {/* On the summary there is nothing left to skip: only create. */}
            <p className="min-w-0 flex-1 text-[13px] text-muted">
              {step === LAST ? null : t('newProject.skipHint')}
            </p>
            {back}
            {primary}
          </footer>
        </form>
        <aside className="flex min-h-0 flex-col overflow-y-auto border-l border-border p-7 pt-10">
          <MapPreview model={model} />
          <p className="mt-auto pt-8 text-[13px] leading-relaxed text-muted">
            {t('newProject.preview.note')}
          </p>
        </aside>
      </div>
    </div>
  );
}
