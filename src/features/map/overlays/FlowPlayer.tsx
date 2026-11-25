import { Panel } from '@xyflow/react';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Menu, MenuItem, MenuSeparator } from '@/components/ui/Menu';
import { WizardStepBar } from '@/components/ui/WizardSteps';
import { flowSegments } from '@/domain/rules/view';
import { fieldClasses } from '@/lib/field-classes';
import { cn } from '@/lib/utils';
import { useMapUi } from '../map-ui-store';
import type { MapActions } from '../useMapActions';
import type { MapModel } from '../useMapModel';

const STEP_MS = 1800;

/** Flows at the bottom of the map: pick one, play it stretch by stretch, or draw a new one. */
export function FlowPlayer({
  model,
  actions,
  editable,
}: {
  model: MapModel;
  actions: MapActions;
  editable: boolean;
}) {
  const { t } = useTranslation();
  const ui = useMapUi();
  const { flows } = model.snapshot;
  const active = flows.find((flow) => flow.id === ui.activeFlowId);
  const [renaming, setRenaming] = useState(false);

  // Playing advances one stretch at a time and stops at the end.
  useEffect(() => {
    if (!ui.playing || !active) return;
    const timer = window.setInterval(() => {
      const { flowStep, setFlowStep, setPlaying } = useMapUi.getState();
      if (flowStep >= active.steps.length - 1) setPlaying(false);
      else setFlowStep(flowStep + 1);
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, [ui.playing, active]);

  if (ui.drawing) return <FlowDrawer actions={actions} />;
  if (flows.length === 0 && !editable) return null;

  const segments = active ? flowSegments(active, model.snapshot, model.snapshot.project.view) : [];
  const segment = segments[ui.flowStep];
  const connection = model.snapshot.connections.find((c) => c.id === segment?.connectionId);
  const endName = (id: string) => {
    const item = model.itemById.get(id);
    return item ? model.itemName(item) : '';
  };
  const stepText =
    !segment || segment.look === 'gap' || !connection
      ? t('map.flows.gap')
      : `${endName(connection.from)} → ${endName(connection.to)}${
          connection.type ? ` · ${t(`map.connectionTypes.${connection.type}`)}` : ''
        }`;

  return (
    <Panel position="bottom-center" className="mb-4!">
      <div className="surface-raised flex w-[min(560px,calc(100vw-560px))] min-w-[400px] flex-col gap-3 rounded-card p-3 inset-ring inset-ring-stroke-strong">
        <div className="flex items-center gap-1.5">
          <div
            role="group"
            aria-label={t('map.flows.label')}
            className="flex min-w-0 flex-1 gap-1 overflow-x-auto"
          >
            {flows.length === 0 ? (
              <span className="px-2 text-[13px] text-muted">{t('map.flows.none')}</span>
            ) : null}
            {flows.map((flow) =>
              renaming && flow.id === active?.id ? (
                <RenameField
                  key={flow.id}
                  initial={flow.name}
                  onDone={(name) => {
                    if (name) actions.renameFlow(flow.id, name);
                    setRenaming(false);
                  }}
                />
              ) : (
                <Button
                  key={flow.id}
                  variant="quiet"
                  size="compact"
                  aria-pressed={flow.id === active?.id}
                  className={cn(flow.id === active?.id && 'bg-fill-active text-text')}
                  onClick={() => ui.setActiveFlow(flow.id === active?.id ? undefined : flow.id)}
                >
                  {flow.name}
                </Button>
              ),
            )}
          </div>
          {editable && active ? (
            <Menu
              trigger={
                <IconButton
                  label={t('map.flows.menu', { name: active.name })}
                  icon={<MoreHorizontal />}
                />
              }
            >
              <MenuItem icon={<Pencil />} onSelect={() => setRenaming(true)}>
                {t('map.flows.rename')}
              </MenuItem>
              <MenuSeparator />
              <MenuItem
                icon={<Trash2 />}
                destructive
                onSelect={() => {
                  ui.setActiveFlow(undefined);
                  actions.removeFlow(active.id);
                }}
              >
                {t('map.flows.delete')}
              </MenuItem>
            </Menu>
          ) : null}
          {editable ? (
            <IconButton
              label={t('map.flows.new')}
              icon={<Plus />}
              onClick={() => ui.setDrawing([])}
            />
          ) : null}
        </div>
        {active ? (
          <>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[12px] text-muted tabular-nums">
                {t('map.flows.step', { current: ui.flowStep + 1, total: active.steps.length })}
              </span>
              <p
                aria-live="polite"
                className={cn(
                  'min-w-0 flex-1 truncate text-[14px] font-medium',
                  segment?.look === 'gap' ? 'text-warning' : 'text-text',
                )}
              >
                {stepText}
              </p>
              <IconButton
                label={t('map.flows.prev')}
                icon={<ChevronLeft />}
                disabled={ui.flowStep === 0}
                onClick={() => ui.setFlowStep(ui.flowStep - 1)}
              />
              <IconButton
                label={ui.playing ? t('map.flows.pause') : t('map.flows.play')}
                icon={ui.playing ? <Pause /> : <Play />}
                variant="ghost"
                onClick={() => {
                  if (!ui.playing && ui.flowStep >= active.steps.length - 1) ui.setFlowStep(0);
                  ui.setPlaying(!ui.playing);
                }}
              />
              <IconButton
                label={t('map.flows.next')}
                icon={<ChevronRight />}
                disabled={ui.flowStep >= active.steps.length - 1}
                onClick={() => ui.setFlowStep(ui.flowStep + 1)}
              />
            </div>
            <WizardStepBar
              total={active.steps.length}
              current={ui.flowStep}
              label={t('map.flows.step', { current: ui.flowStep + 1, total: active.steps.length })}
            />
          </>
        ) : null}
      </div>
    </Panel>
  );
}

function RenameField({ initial, onDone }: { initial: string; onDone: (name: string) => void }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initial);
  useEffect(() => {
    ref.current?.select();
  }, []);
  return (
    <input
      ref={ref}
      aria-label={t('map.flows.name')}
      value={value}
      maxLength={80}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => onDone(value.trim())}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onDone(value.trim());
        if (event.key === 'Escape') onDone('');
      }}
      className={cn(fieldClasses, 'h-8 w-40 rounded-control px-2.5 text-[13px]')}
    />
  );
}

/** Drawing a flow: click the connections in order, name it, save (RN 1). */
function FlowDrawer({ actions }: { actions: MapActions }) {
  const { t } = useTranslation();
  const steps = useMapUi((s) => s.drawing) ?? [];
  const setDrawing = useMapUi((s) => s.setDrawing);
  const setActiveFlow = useMapUi((s) => s.setActiveFlow);
  const [name, setName] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || steps.length === 0) return;
    const id = actions.addFlow(name, steps);
    setDrawing(undefined);
    setActiveFlow(id);
  };

  return (
    <Panel position="bottom-center" className="mb-4!">
      <form
        noValidate
        onSubmit={submit}
        className="surface-raised flex w-[min(560px,calc(100vw-560px))] min-w-[400px] flex-col gap-3 rounded-card p-3 inset-ring inset-ring-accent/30"
      >
        <p
          role="status"
          className="flex items-center justify-between gap-3 text-[13.5px] text-text"
        >
          {t('map.flows.drawing')}
          <span className="font-mono text-[12px] text-muted">
            {t('map.flows.drawingCount', { count: steps.length })}
          </span>
        </p>
        <div className="flex items-center gap-2">
          <input
            aria-label={t('map.flows.name')}
            placeholder={t('map.flows.namePlaceholder')}
            value={name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            className={cn(fieldClasses, 'h-9 flex-1 rounded-control px-3 text-[13px]')}
          />
          <Button onClick={() => setDrawing(undefined)}>{t('map.flows.cancel')}</Button>
          <Button type="submit" disabled={!name.trim() || steps.length === 0}>
            {t('map.flows.save')}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
