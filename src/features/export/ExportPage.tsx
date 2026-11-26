import {
  ArrowRight,
  Box,
  Braces,
  Download,
  FileText,
  Globe,
  Image as ImageIcon,
  KeyRound,
  Workflow,
} from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChoiceCard, ChoiceGroup } from '@/components/ui/ChoiceCard';
import { FilePreview } from '@/components/ui/FilePreview';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Switch';
import type { ExportOptions } from '@/domain/rules/exports/model';
import { useMapModel } from '@/features/map/useMapModel';
import { PageHeader } from '@/features/shell/PageHeader';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useTheme } from '@/hooks/useTheme';
import {
  PALETTES,
  availableFormats,
  downloadFormat,
  fileName,
  formatText,
  imageSvg,
  lineCount,
  type ExportFormat,
  type ImageType,
} from './export-files';
import { useExportInput } from './useExportInput';
import { useFileActions } from './useFileActions';

/** Icon of each format, in the color of the zone it comes from (ux-ui 13.20). */
const ICONS: Record<ExportFormat, ReactNode> = {
  env: <KeyRound className="text-zone-env" />,
  compose: <Box className="text-zone-infra" />,
  readme: <FileText className="text-zone-ui" />,
  mermaid: <Workflow className="text-zone-data" />,
  image: <ImageIcon className="text-zone-method" />,
  html: <Globe className="text-zone-app" />,
  json: <Braces className="text-zone-tools" />,
};

const DEFAULT_OPTIONS: ExportOptions = { futures: false, notes: true };

/** RN 10, 19: every export of the project, with a preview; secrets never leave. */
export function ExportPage() {
  const { t } = useTranslation();
  const model = useMapModel();
  const phone = useBreakpoint() === 'phone';
  const { resolved } = useTheme();
  const actions = useFileActions();
  const [options, setOptions] = usePersistentState<ExportOptions>(
    'prologos.exportOptions',
    DEFAULT_OPTIONS,
  );
  const [picked, setPicked] = usePersistentState<ExportFormat>('prologos.exportFormat', 'env');
  const [image, setImage] = usePersistentState<ImageType>('prologos.exportImage', 'png');
  const input = useExportInput(options);
  const formats = useMemo(() => (input ? availableFormats(input) : []), [input]);
  const format = formats.includes(picked) ? picked : 'env';
  const palette = PALETTES[resolved];
  const text = useMemo(
    () => (input ? formatText(format, input, palette) : ''),
    [format, input, palette],
  );
  if (!model || !input) return null;

  const name = fileName(format, image);
  const size = format === 'image' ? imageSvg(input, palette) : undefined;
  const meta = size
    ? t('export.size', { width: size.width, height: size.height })
    : t('export.lines', { count: lineCount(text) });
  const setOption = (key: keyof ExportOptions) => (checked: boolean) =>
    setOptions({ ...options, [key]: checked });

  const readyLink = (
    <Button asChild>
      <Link to={`/p/${model.snapshot.project.id}/pronto`}>
        {t('export.readyLink')}
        <ArrowRight aria-hidden />
      </Link>
    </Button>
  );

  return (
    <>
      <PageHeader
        title={t('export.title')}
        subtitle={t('export.lead')}
        action={readyLink}
        phoneAction={<span />}
        backTo={`/p/${model.snapshot.project.id}`}
      />
      <div className="grid items-start gap-5 desktop:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-4">
          <ChoiceGroup<ExportFormat>
            label={t('export.formats')}
            value={format}
            onValueChange={setPicked}
            columns={1}
          >
            {formats.map((option) => (
              <ChoiceCard
                key={option}
                value={option}
                icon={ICONS[option]}
                title={fileName(option, image)}
                description={t(`export.format.${option}`)}
              />
            ))}
          </ChoiceGroup>
          <Card className="flex flex-col gap-1">
            <h2 className="pb-1 font-mono text-[11.5px] tracking-[0.14em] text-faint uppercase">
              {t('export.options')}
            </h2>
            <Switch
              label={t('export.futures')}
              checked={options.futures}
              onCheckedChange={setOption('futures')}
            />
            <Switch
              label={t('export.notes')}
              checked={options.notes}
              onCheckedChange={setOption('notes')}
            />
            <Switch
              label={t('export.hideSecrets')}
              checked
              disabled
              onCheckedChange={() => undefined}
            />
          </Card>
          {phone ? readyLink : null}
        </div>

        <Card padding="none" className="flex min-w-0 flex-col overflow-hidden">
          {format === 'image' || format === 'html' ? (
            <div className="flex min-h-0 flex-col">
              <div className="flex min-h-12 items-center gap-3 border-b border-border px-5">
                <span className="min-w-0 truncate font-mono text-[13px] text-text">{name}</span>
                <span className="shrink-0 font-mono text-[12px] text-faint">{meta}</span>
                {format === 'image' ? (
                  <SegmentedControl<ImageType>
                    label={t('export.imageFormat')}
                    value={image}
                    onValueChange={setImage}
                    options={[
                      { value: 'png', label: 'PNG' },
                      { value: 'svg', label: 'SVG' },
                    ]}
                    className="ml-auto"
                  />
                ) : null}
              </div>
              {format === 'image' ? (
                <ImagePreview svg={text} label={t('export.preview', { name })} />
              ) : (
                <iframe
                  title={t('export.htmlPreview')}
                  srcDoc={text}
                  sandbox="allow-scripts"
                  className="h-[360px] w-full border-0 bg-bg tablet:h-[540px]"
                />
              )}
            </div>
          ) : (
            <FilePreview
              name={name}
              meta={meta}
              content={text}
              label={t('export.preview', { name })}
              className="h-[360px] tablet:h-[540px]"
              action={
                <Button size="compact" onClick={() => void actions.copy(text)}>
                  {t('export.copy')}
                </Button>
              }
            />
          )}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3.5">
            <span className="text-[12.5px] text-muted">{t('export.generatedNote')}</span>
            <Button
              variant="primary"
              size={phone ? 'touch' : 'default'}
              icon={<Download />}
              loading={actions.busy}
              loadingText={t('export.downloading')}
              className={phone ? 'w-full' : undefined}
              onClick={() =>
                void actions.download(name, () => downloadFormat(format, input, palette, image))
              }
            >
              {t('export.download', { name })}
            </Button>
          </footer>
        </Card>
      </div>
    </>
  );
}

/** The map image as the file will look, scaled to the preview. */
function ImagePreview({ svg, label }: { svg: string; label: string }) {
  return (
    <div className="grid h-[360px] place-items-center overflow-auto bg-textarea p-4 tablet:h-[540px]">
      <img
        src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
        alt={label}
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}
