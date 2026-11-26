import { ArrowRight, Download, Lock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { DecisionRow } from '@/components/ui/DecisionRow';
import { FilePreview } from '@/components/ui/FilePreview';
import { FileTabs } from '@/components/ui/FileTabs';
import { Milestone } from '@/components/ui/Milestone';
import type { ExportOptions } from '@/domain/rules/exports/model';
import { repoFiles } from '@/domain/rules/exports/repo-files';
import { kitText } from '@/domain/rules/kit';
import { readyView, type Essential } from '@/domain/rules/ready';
import { useMapModel, type MapModel } from '@/features/map/useMapModel';
import { PageHeader } from '@/features/shell/PageHeader';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { downloadRepoZip, lineCount } from './export-files';
import { useExportInput } from './useExportInput';
import { useFileActions } from './useFileActions';

/** The repository start shows today's map and leaves planning notes out. */
const REPO_OPTIONS: ExportOptions = { futures: false, notes: false };

/** RN 16: the essential decisions, and the repository start that fills in as they close. */
export function ReadyPage() {
  const { t } = useTranslation();
  const model = useMapModel();
  const input = useExportInput(REPO_OPTIONS);
  const phone = useBreakpoint() === 'phone';
  const actions = useFileActions();
  const view = useMemo(() => (model ? readyView(model.snapshot, model.kit) : undefined), [model]);
  const files = useMemo(() => (input ? repoFiles(input) : []), [input]);
  const [selected, setSelected] = useState('README.md');
  if (!model || !input || !view) return null;

  const { project } = model.snapshot;
  const file = files.find((f) => f.path === selected) ?? files[0];
  const title = view.ready ? t('ready.titleReady') : t('ready.title');
  const lead = view.ready ? t('ready.leadReady') : t('ready.lead', { count: view.missing });
  const milestone = (
    <Milestone
      steps={[t('ready.milestone.missing', { count: view.missing }), t('ready.milestone.ready')]}
      current={view.ready ? 1 : 0}
      label={view.ready ? t('ready.statusReady') : t('ready.status', { count: view.missing })}
      className={phone ? 'w-full' : undefined}
    />
  );
  const downloadLabel = view.ready ? t('ready.download') : t('ready.downloadAnyway');
  const download = (
    <Button
      variant={view.ready ? 'primary' : 'ghost'}
      size={phone ? 'touch' : 'default'}
      icon={<Download />}
      loading={actions.busy}
      loadingText={t('ready.downloading')}
      className={phone ? 'w-full' : undefined}
      onClick={() => void actions.download('.zip', () => downloadRepoZip(input))}
    >
      {downloadLabel}
    </Button>
  );

  return (
    <>
      <PageHeader
        title={phone ? t('nav.ready') : title}
        subtitle={lead}
        action={milestone}
        phoneAction={<span />}
        backTo={`/p/${project.id}/checklist`}
      />
      {phone ? (
        <div className="mb-5 flex flex-col gap-3">
          {milestone}
          <h2 className="text-[26px] leading-tight font-semibold tracking-tight">{title}</h2>
          <p className="text-[15px] text-muted">{lead}</p>
        </div>
      ) : null}

      <div className="grid items-start gap-5 desktop:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.4fr)]">
        <Card className="flex flex-col gap-3">
          <h2 className="text-[15px] font-semibold">{t('ready.essentials')}</h2>
          <ul className="flex flex-col">
            {view.essentials.map((essential) => (
              <EssentialRow
                key={essential.key === 'runsOn' ? essential.ref : essential.key}
                essential={essential}
                model={model}
              />
            ))}
          </ul>
          <Button asChild size="compact" className="self-start">
            <Link to={`/p/${project.id}/checklist`}>
              {t('ready.openChecklist')}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </Card>

        <Card padding="none" className="flex min-w-0 flex-col overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
            <h2 className="flex items-baseline gap-2.5 text-[15px] font-semibold">
              {t('ready.repo')}
              <span className="text-[12.5px] font-normal text-muted">
                {t('ready.fileCount', { count: files.length })}
              </span>
            </h2>
            {phone ? null : download}
          </header>
          {file ? (
            <FileTabs
              label={t('ready.files')}
              files={files}
              value={file.path}
              onValueChange={setSelected}
            >
              <FilePreview
                name={file.path}
                meta={t('export.lines', { count: lineCount(file.content) })}
                content={file.content}
                label={t('export.preview', { name: file.path })}
                className="h-[320px] tablet:h-[540px]"
                action={
                  <Button size="compact" onClick={() => void actions.copy(file.content)}>
                    {t('export.copy')}
                  </Button>
                }
              />
            </FileTabs>
          ) : null}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3.5">
            <span className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
              {t('ready.commit')}
              <Chip>{t('files.commit')}</Chip>
            </span>
            <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
              <Lock aria-hidden className="size-3.5" />
              {t('ready.noSecrets')}
            </span>
          </footer>
        </Card>
      </div>
      {phone ? <div className="mt-5">{download}</div> : null}
    </>
  );
}

/** An essential decision with its label and detail in the interface language. */
function EssentialRow({ essential, model }: { essential: Essential; model: MapModel }) {
  const { t } = useTranslation();
  const { label, detail } = essentialText();
  return <DecisionRow label={label} detail={detail} resolved={essential.done} />;

  function essentialText(): { label: string; detail: string } {
    const item = 'item' in essential ? essential.item : undefined;
    switch (essential.key) {
      case 'stack':
        return {
          label: t('ready.essential.stack'),
          detail: model.kit
            ? kitText(model.kit.name, model.language)
            : essential.done && item
              ? (model.choiceName(item) ?? model.itemName(item))
              : t('ready.detail.pending'),
        };
      case 'prep':
        return {
          label: t('ready.essential.prep'),
          detail: t('ready.detail.steps', { done: essential.doneSteps, total: essential.total }),
        };
      case 'runsOn':
      case 'auth': {
        const source = model.kit?.items.find((i) => i.id === essential.ref);
        const name = item
          ? model.itemName(item)
          : source
            ? kitText(source.name, model.language)
            : essential.ref;
        const decided = item
          ? essential.key === 'auth'
            ? (model.choiceName(item) ?? name)
            : (model.choiceName(item) ?? t('ready.detail.decided'))
          : '';
        return {
          label: essential.key === 'auth' ? t('ready.essential.auth') : name,
          detail: essential.status === 'decided' ? decided : t(`ready.detail.${essential.status}`),
        };
      }
      case 'variables':
        return {
          label: t('ready.essential.variables'),
          detail:
            essential.count === 0
              ? t('ready.detail.noVariables')
              : essential.undocumented > 0
                ? t('ready.detail.undocumented', { count: essential.undocumented })
                : t('ready.detail.variables', { count: essential.count }),
        };
    }
  }
}
