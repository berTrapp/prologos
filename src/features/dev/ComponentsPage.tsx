import { Download, FolderPlus, Plus, Search, Settings, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Chip } from '@/components/ui/Chip';
import { Count } from '@/components/ui/Count';
import { CoverageRing } from '@/components/ui/CoverageRing';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { Input } from '@/components/ui/Input';
import { Kbd } from '@/components/ui/Kbd';
import { MapItem } from '@/components/ui/MapItem';
import { MapLoader } from '@/components/ui/MapLoader';
import { Panel } from '@/components/ui/Panel';
import { Popover } from '@/components/ui/Popover';
import { Progress } from '@/components/ui/Progress';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton, SkeletonZone } from '@/components/ui/Skeleton';
import { Spinner } from '@/components/ui/Spinner';
import { StatusDot } from '@/components/ui/StatusDot';
import { Steps, type Step } from '@/components/ui/Steps';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { ZoneTag } from '@/components/ui/ZoneTag';
import { ZONE_IDS } from '@/domain/zones';
import { useTheme } from '@/hooks/useTheme';
import i18n from '@/i18n';
import { devResources } from '@/i18n/dev-resources';
import { SUPPORTED_LANGUAGES, type Language } from '@/i18n/languages';
import { notify } from '@/lib/notify';
import { STATE_VARIANTS, badgeForState, type StateKind } from '@/lib/status-variants';
import type { ThemePreference } from '@/lib/theme';
import { DevRow, DevSection } from './DevSection';

for (const lng of SUPPORTED_LANGUAGES) {
  i18n.addResourceBundle(lng, 'dev', devResources[lng], true, true);
}

/** Technical samples are not translated (ux-ui 11). */
const SAMPLE = {
  command: 'php artisan migrate',
  key: 'DATABASE_URL',
  repo: 'bertrapp/api-pedidos',
};

const STEP_IDS = ['stepConnect', 'stepRead', 'stepAnalyze', 'stepBuild'] as const;

/** Every UI component in every state, in both themes (phase 1). Dev only. */
export function ComponentsPage() {
  const { t } = useTranslation('dev');
  const { t: tc, i18n: i18nInstance } = useTranslation();
  const { preference, setPreference } = useTheme();

  const [view, setView] = useState<'today' | 'complete'>('today');
  const [layout, setLayout] = useState<'zones' | 'map'>('zones');
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [decided, setDecided] = useState(true);
  const [pending, setPending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [selectedItem, setSelectedItem] = useState(true);
  const [chips, setChips] = useState(['React', 'Laravel', 'PostgreSQL']);
  const [filter, setFilter] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (step >= STEP_IDS.length) return;
    const timer = window.setTimeout(() => setStep((s) => s + 1), 1600);
    return () => window.clearTimeout(timer);
  }, [step]);

  const steps: Step[] = STEP_IDS.map((id, index) => ({
    id,
    label: t(`loading.${id}`),
    detail: index === 1 && step === 1 ? '12/18' : undefined,
    status: index < step ? 'done' : index === step ? 'current' : 'upcoming',
  }));

  const startLoading = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1800);
  };

  const openPr = () => {
    const id = notify.loading(t('toasts.prLoading'));
    window.setTimeout(() => {
      notify.success(t('toasts.prDone'), {
        id,
        action: { label: t('toasts.seeOnGithub'), onClick: () => undefined },
      });
    }, 2200);
  };

  const badgeKinds = Object.keys(STATE_VARIANTS) as StateKind[];

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 py-10 sm:px-8 sm:py-14">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-xl flex-col gap-2">
            <h1 className="text-[28px] font-semibold tracking-tight text-text">{t('title')}</h1>
            <p className="text-[14px] text-muted">{t('subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <SegmentedControl<ThemePreference>
              label={tc('theme.label')}
              value={preference}
              onValueChange={setPreference}
              options={[
                { value: 'system', label: tc('theme.system') },
                { value: 'light', label: tc('theme.light') },
                { value: 'dark', label: tc('theme.dark') },
              ]}
            />
            <SegmentedControl<Language>
              label={tc('languages.label')}
              value={(i18nInstance.resolvedLanguage as Language | undefined) ?? 'pt-BR'}
              onValueChange={(lng) => void i18nInstance.changeLanguage(lng)}
              options={SUPPORTED_LANGUAGES.map((lng) => ({
                value: lng,
                label: tc(`languages.${lng}`),
              }))}
            />
          </div>
        </header>

        <DevSection index={1} title={t('sections.buttons')}>
          <Card className="flex flex-col gap-5">
            <DevRow label={t('buttons.clickToLoad')}>
              <Button
                variant="primary"
                icon={<Download />}
                loading={loading}
                loadingText={t('buttons.exporting')}
                onClick={startLoading}
              >
                {t('buttons.export')}
              </Button>
              <Button icon={<FolderPlus />}>{t('buttons.newProject')}</Button>
              <Button>{t('buttons.cancel')}</Button>
              <Button variant="destructive" icon={<Trash2 />}>
                {t('buttons.delete')}
              </Button>
              <Button disabled>{t('buttons.disabled')}</Button>
            </DevRow>
            <DevRow>
              <Button size="compact">{t('buttons.compact')}</Button>
              <Button size="compact" loading loadingText={t('buttons.exporting')}>
                {t('buttons.export')}
              </Button>
              <IconButton
                label={t('buttons.search')}
                shortcut={tc('keys.palette')}
                icon={<Search />}
              />
              <IconButton label={t('buttons.settings')} icon={<Settings />} />
              <IconButton label={t('buttons.newProject')} variant="ghost" icon={<Plus />} />
            </DevRow>
          </Card>
        </DevSection>

        <DevSection index={2} title={t('sections.segmented')}>
          <Card className="flex flex-wrap gap-4">
            <SegmentedControl
              label={t('segmented.label')}
              value={view}
              onValueChange={setView}
              options={[
                { value: 'today', label: t('segmented.today') },
                { value: 'complete', label: t('segmented.complete') },
              ]}
            />
            <SegmentedControl
              label={t('segmented.label')}
              value={layout}
              onValueChange={setLayout}
              options={[
                { value: 'zones', label: t('segmented.zones') },
                { value: 'map', label: t('segmented.map') },
              ]}
            />
          </Card>
        </DevSection>

        <DevSection index={3} title={t('sections.badges')}>
          <Card className="grid gap-5 sm:grid-cols-2">
            {badgeKinds.map((kind) => (
              <DevRow key={kind} label={kind}>
                {Object.keys(STATE_VARIANTS[kind]).map((state) => {
                  const lookup = badgeForState as (
                    k: string,
                    s: string,
                  ) => ReturnType<typeof badgeForState>;
                  const { variant, dot } = lookup(kind, state);
                  return (
                    <Badge key={state} variant={variant} dot={dot}>
                      {tc(`status.${kind}.${state}` as 'status.label.note')}
                    </Badge>
                  );
                })}
              </DevRow>
            ))}
          </Card>
        </DevSection>

        <DevSection index={4} title={t('sections.markers')}>
          <Card className="grid gap-6 sm:grid-cols-2">
            <DevRow label={t('markers.count')}>
              {[3, 12, 120].map((value) => (
                <Count
                  key={value}
                  value={value}
                  aria-label={t('markers.pending', { count: value })}
                />
              ))}
            </DevRow>
            <DevRow label={t('markers.statusDot')}>
              <StatusDot tone="info">{tc('status.project.developing')}</StatusDot>
              <StatusDot tone="warning">{tc('status.project.planning')}</StatusDot>
              <StatusDot tone="neutral">{tc('status.project.paused')}</StatusDot>
            </DevRow>
            <DevRow label={t('markers.chip')}>
              {chips.map((chip) => (
                <Chip
                  key={chip}
                  onRemove={() => setChips((list) => list.filter((c) => c !== chip))}
                >
                  {chip}
                </Chip>
              ))}
              <Chip>{SAMPLE.key}</Chip>
              <Chip onClick={() => setFilter((f) => !f)} pressed={filter}>
                {SAMPLE.command}
              </Chip>
            </DevRow>
            <DevRow label={t('markers.kbd')}>
              <span className="flex items-center gap-2 text-[13px] text-muted">
                {t('markers.openPalette')} <Kbd>{tc('keys.palette')}</Kbd>
              </span>
              <Kbd>{tc('keys.escape')}</Kbd>
            </DevRow>
            <div className="sm:col-span-2">
              <DevRow label={t('markers.zoneTag')}>
                {ZONE_IDS.map((zone) => (
                  <ZoneTag key={zone} zone={zone} />
                ))}
              </DevRow>
            </div>
          </Card>
        </DevSection>

        <DevSection index={5} title={t('sections.fields')}>
          <Card className="grid gap-5 sm:grid-cols-2">
            <Input
              label={t('fields.name')}
              placeholder={t('fields.namePlaceholder')}
              hint={t('fields.nameHint')}
            />
            <Input
              label={t('fields.key')}
              mono
              defaultValue="database-url"
              error={t('fields.keyError')}
            />
            <Textarea label={t('fields.notes')} placeholder={t('fields.notesPlaceholder')} />
            <div className="flex flex-col gap-5">
              <Textarea
                label={t('fields.env')}
                mono
                rows={2}
                defaultValue={'APP_NAME=agenda\nAPP_DEBUG=true'}
              />
              <Input label={t('fields.disabled')} disabled defaultValue="prologos" />
            </div>
          </Card>
        </DevSection>

        <DevSection index={6} title={t('sections.toggles')}>
          <Card className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
            <div className="flex flex-col">
              <Switch
                label={t('toggles.secret')}
                description={t('toggles.secretDescription')}
                checked={secret}
                onCheckedChange={setSecret}
              />
              <Switch label={t('toggles.reduced')} checked={reduced} onCheckedChange={setReduced} />
              <Switch
                label={t('fields.disabled')}
                checked={false}
                onCheckedChange={() => undefined}
                disabled
              />
            </div>
            <div className="flex flex-col">
              <Checkbox
                label={t('toggles.decided')}
                checked={decided}
                onCheckedChange={setDecided}
              />
              <Checkbox
                label={t('toggles.pending')}
                checked={pending}
                onCheckedChange={setPending}
              />
              <Checkbox
                label={t('toggles.partial')}
                checked="indeterminate"
                onCheckedChange={() => undefined}
              />
            </div>
          </Card>
        </DevSection>

        <DevSection index={7} title={t('sections.cards')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader title={t('cards.defaultTitle')} label={t('cards.label')} />
              <p className="mb-4 text-[13px] text-muted">{t('cards.defaultBody')}</p>
              <Card variant="inner" padding="compact">
                <CardHeader title={t('cards.innerTitle')} className="mb-1" />
                <p className="text-[13px] text-muted">{t('cards.innerBody')}</p>
              </Card>
            </Card>
            <div className="flex flex-col gap-4">
              <Card variant="highlight">
                <CardHeader title={t('cards.highlightTitle')} />
                <p className="text-[13px] text-text">{t('cards.highlightBody')}</p>
              </Card>
              <Card onSelect={() => undefined}>
                <CardHeader title={t('cards.clickableTitle')} />
                <p className="text-[13px] text-muted">{t('cards.clickableBody')}</p>
              </Card>
            </div>
          </div>
        </DevSection>

        <DevSection index={8} title={t('sections.overlays')}>
          <Card className="flex flex-wrap gap-3">
            <Button onClick={() => setDialogOpen(true)}>{t('overlays.openDialog')}</Button>
            <Button onClick={() => setSheetOpen(true)}>{t('overlays.openSheet')}</Button>
            <Popover trigger={<Button>{t('overlays.openPopover')}</Button>}>
              <p className="text-[13.5px] font-semibold text-text">{t('overlays.popoverTitle')}</p>
              <p className="mt-1 text-[12.5px] text-muted">{t('overlays.popoverBody')}</p>
            </Popover>
          </Card>
          <Dialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title={t('overlays.dialogTitle')}
            description={t('overlays.dialogBody')}
            footer={
              <>
                <Button onClick={() => setDialogOpen(false)}>{t('buttons.cancel')}</Button>
                <Button variant="destructive" onClick={() => setDialogOpen(false)}>
                  {t('overlays.dialogConfirm')}
                </Button>
              </>
            }
          />
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen} title={t('overlays.sheetTitle')}>
            <div className="flex flex-col gap-4">
              <p className="text-[13.5px] text-muted">{t('overlays.sheetBody')}</p>
              <div className="flex gap-2">
                <Badge variant="success">{tc('status.checklist.decided')}</Badge>
                <ZoneTag zone="data" />
              </div>
            </div>
          </Sheet>
        </DevSection>

        <DevSection index={9} title={t('sections.panel')}>
          <div className="flex h-72 overflow-hidden rounded-card inset-ring inset-ring-border">
            <Panel
              title={t('panel.title')}
              collapsed={panelCollapsed}
              onCollapsedChange={setPanelCollapsed}
            >
              <p className="px-1 text-[13px] text-muted">{t('panel.body')}</p>
            </Panel>
            <div className="surface flex-1" />
          </div>
        </DevSection>

        <DevSection index={10} title={t('sections.alerts')}>
          <div className="flex flex-col gap-3">
            <InlineAlert
              variant="warning"
              title={t('alerts.backupTitle')}
              actions={
                <>
                  <Button size="compact">{t('alerts.later')}</Button>
                  <Button size="compact" icon={<Download />}>
                    {t('alerts.exportNow')}
                  </Button>
                </>
              }
            >
              {t('alerts.backupBody')}
            </InlineAlert>
            <InlineAlert variant="danger" title={t('alerts.secretTitle')}>
              {t('alerts.secretBody')}
            </InlineAlert>
            <InlineAlert
              variant="info"
              actions={<Button size="compact">{t('alerts.gotIt')}</Button>}
            >
              {t('alerts.dataBody')}
            </InlineAlert>
          </div>
        </DevSection>

        <DevSection index={11} title={t('sections.empty')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card padding="none">
              <EmptyState
                icon={<Plus />}
                title={t('empty.title')}
                description={t('empty.body')}
                actions={<Button>{t('buttons.newProject')}</Button>}
              />
            </Card>
            <Card padding="none">
              <EmptyState
                variant="error"
                title={t('empty.errorTitle')}
                description={t('empty.errorBody')}
                actions={
                  <>
                    <Button>{t('empty.importBackup')}</Button>
                    <Button>{t('empty.retry')}</Button>
                  </>
                }
              />
            </Card>
          </div>
        </DevSection>

        <DevSection index={12} title={t('sections.mapItems')}>
          <Card className="flex flex-wrap gap-4 bg-fill-subtle">
            <MapItem zone="data" status="decided" name={t('mapItems.decided')} />
            <MapItem zone="infrastructure" status="pending" name={t('mapItems.pending')} />
            <MapItem zone="data" status="future" name={t('mapItems.future')} />
            <MapItem zone="interface" status="decided" isNew name={t('mapItems.new')} />
            <MapItem
              zone="application"
              status="decided"
              selected={selectedItem}
              onSelect={() => setSelectedItem((s) => !s)}
              name={t('mapItems.selected')}
            />
          </Card>
        </DevSection>

        <DevSection index={13} title={t('sections.toasts')}>
          <Card className="flex flex-wrap gap-3">
            <Button
              onClick={() =>
                notify.success(t('toasts.createdTitle'), {
                  action: { label: t('toasts.open'), onClick: () => undefined },
                })
              }
            >
              {t('toasts.created')}
            </Button>
            <Button
              onClick={() =>
                notify.success(t('toasts.removedTitle'), {
                  action: { label: t('toasts.undo'), onClick: () => undefined },
                })
              }
            >
              {t('toasts.removed')}
            </Button>
            <Button onClick={() => notify.success(t('toasts.copiedTitle'))}>
              {t('toasts.copied')}
            </Button>
            <Button
              onClick={() =>
                notify.warning(t('toasts.divergenceTitle'), {
                  action: { label: t('toasts.review'), onClick: () => undefined },
                })
              }
            >
              {t('toasts.divergence')}
            </Button>
            <Button
              onClick={() =>
                notify.error(t('toasts.saveErrorTitle'), {
                  description: t('toasts.saveErrorBody'),
                  action: { label: t('toasts.tryAgain'), onClick: () => undefined },
                })
              }
            >
              {t('toasts.saveError')}
            </Button>
            <Button onClick={openPr}>{t('toasts.pr')}</Button>
          </Card>
        </DevSection>

        <DevSection index={14} title={t('sections.loading')}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="flex flex-col gap-6">
              <DevRow label={t('loading.spinner')}>
                <Spinner announce />
                <span className="text-muted">
                  <Spinner />
                </span>
              </DevRow>
              <DevRow label={t('loading.progress')}>
                <Progress value={66} />
              </DevRow>
              <DevRow label={t('loading.ring')}>
                <CoverageRing value={72} />
              </DevRow>
            </Card>
            <Card className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[12.5px] text-text">{SAMPLE.repo}</span>
                <Badge variant={step >= STEP_IDS.length ? 'success' : 'info'}>
                  {step >= STEP_IDS.length ? tc('status.task.done') : tc('status.task.importing')}
                </Badge>
              </div>
              <Steps
                steps={steps}
                progress={Math.min(100, (step / STEP_IDS.length) * 100)}
                context={t('loading.stepsContext')}
                onCancel={() => setStep(1)}
              />
            </Card>
          </div>
        </DevSection>

        <DevSection index={15} title={t('sections.mapLoader')}>
          <Card className="flex min-h-72 flex-col items-center justify-center gap-6">
            <MapLoader delay={0} reducedMotion={reduced || undefined} />
            <Switch
              className="w-56"
              label={t('toggles.reduced')}
              checked={reduced}
              onCheckedChange={setReduced}
            />
          </Card>
        </DevSection>

        <DevSection index={16} title={t('sections.skeleton')}>
          <Card padding="none" className="flex h-80 overflow-hidden">
            <div className="hidden w-48 shrink-0 flex-col gap-3 border-r border-border p-4 sm:flex">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <Skeleton className="h-5 w-40" />
              <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
                {ZONE_IDS.slice(0, 8).map((zone) => (
                  <SkeletonZone key={zone} zone={zone} className="flex flex-col gap-2">
                    <Skeleton className="h-2.5 w-12" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-2/3" />
                  </SkeletonZone>
                ))}
              </div>
            </div>
          </Card>
        </DevSection>
      </div>
    </div>
  );
}
