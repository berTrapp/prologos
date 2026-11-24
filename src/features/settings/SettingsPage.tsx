import { Download, Upload } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace, workspaceStore } from '@/app/services';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { OptionList } from '@/components/ui/OptionList';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Switch';
import type { Backup } from '@/domain/rules/backup';
import { exportBackupFile } from '@/features/projects/backup-actions';
import { PageHeader } from '@/features/shell/PageHeader';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useNow } from '@/hooks/useNow';
import { useTheme } from '@/hooks/useTheme';
import { SUPPORTED_LANGUAGES, type Language } from '@/i18n/languages';
import { formatRelative } from '@/lib/format';
import { notify } from '@/lib/notify';
import type { ThemePreference } from '@/lib/theme';
import packageJson from '../../../package.json';
import { ImportDialog } from './ImportDialog';

function Row({
  title,
  hint,
  children,
}: {
  title: ReactNode;
  hint?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-border py-4 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-text">{title}</p>
        {hint ? <p className="text-[13px] text-muted">{hint}</p> : null}
      </div>
      {children ? <div className="flex shrink-0 flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

function Section({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="border-b border-border pb-3 text-[16px] font-semibold text-text">{title}</h2>
      {children}
    </Card>
  );
}

const IMPORT_ERRORS = {
  'not-json': 'toast.importNotJson',
  'not-a-backup': 'toast.importNotBackup',
  'newer-version': 'toast.importNewer',
  invalid: 'toast.importInvalid',
} as const;

/** Language (live), theme and "Seus dados" (RN 17, 18). */
export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const phone = useBreakpoint() === 'phone';
  const { preference, setPreference } = useTheme();
  const settings = useWorkspace((s) => s.settings);
  const fileInput = useRef<HTMLInputElement>(null);
  const now = useNow();
  const [exporting, setExporting] = useState(false);
  const [pending, setPending] = useState<{ backup: Backup; conflicts: string[] }>();

  const language = (i18n.resolvedLanguage as Language | undefined) ?? 'pt-BR';
  const languageOptions = SUPPORTED_LANGUAGES.map((lng) => ({
    value: lng,
    label: t(`languages.${lng}`),
  }));
  const themeOptions = (['system', 'light', 'dark'] as const).map((value) => ({
    value,
    label: t(`theme.${value}`),
  }));
  const changeLanguage = (lng: Language) => void i18n.changeLanguage(lng);

  const exportAll = async () => {
    setExporting(true);
    try {
      await exportBackupFile();
    } finally {
      setExporting(false);
    }
  };

  const readFile = async (file: File | undefined) => {
    if (!file) return;
    const result = await workspaceStore.getState().readBackup(await file.text());
    if (!result.ok) {
      notify.error(t('toast.importFailed'), { description: t(IMPORT_ERRORS[result.error]) });
      return;
    }
    setPending({ backup: result.backup, conflicts: result.conflicts ?? [] });
  };

  const lastBackup =
    settings.lastBackupAt === undefined
      ? t('settings.noBackup')
      : t('settings.lastBackup', {
          time: formatRelative(settings.lastBackupAt, now, i18n.language),
          count: settings.lastBackupCount ?? 0,
        });

  return (
    <>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} backTo="/" />
      <div className="flex flex-col gap-6">
        {phone ? (
          <>
            <OptionList<Language>
              label={t('settings.language')}
              value={language}
              onValueChange={changeLanguage}
              options={languageOptions}
            />
            <OptionList<ThemePreference>
              label={t('settings.theme')}
              value={preference}
              onValueChange={setPreference}
              options={themeOptions}
            />
          </>
        ) : (
          <Section title={t('settings.appearance')}>
            <Row title={t('settings.language')} hint={t('settings.languageHint')}>
              <SegmentedControl<Language>
                label={t('settings.language')}
                value={language}
                onValueChange={changeLanguage}
                options={languageOptions}
              />
            </Row>
            <Row title={t('settings.theme')} hint={t('settings.themeHint')}>
              <SegmentedControl<ThemePreference>
                label={t('settings.theme')}
                value={preference}
                onValueChange={setPreference}
                options={themeOptions}
              />
            </Row>
          </Section>
        )}

        <Section title={t('settings.data')}>
          <InlineAlert variant="warning" title={t('settings.dataWarningTitle')}>
            {t('settings.dataWarningBody')}
          </InlineAlert>
          <Row title={t('settings.backup')} hint={lastBackup}>
            <Button
              icon={<Upload />}
              onClick={() => fileInput.current?.click()}
              size={phone ? 'touch' : 'default'}
            >
              {t('settings.import')}
            </Button>
            <Button
              variant="primary"
              icon={<Download />}
              loading={exporting}
              loadingText={t('settings.exporting')}
              onClick={() => void exportAll()}
              size={phone ? 'touch' : 'default'}
            >
              {t('settings.exportAll')}
            </Button>
          </Row>
          <div className="border-t border-border pt-4">
            <Switch
              label={t('settings.reminder')}
              description={t('settings.reminderHint')}
              checked={settings.backupReminder}
              onCheckedChange={(backupReminder) =>
                void workspaceStore.getState().updateSettings({ backupReminder })
              }
            />
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              void readFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </Section>

        <Section title={t('settings.about')}>
          <Row title={t('settings.openSource')} hint={t('settings.openSourceBody')}>
            <Chip>{t('settings.license', { version: packageJson.version })}</Chip>
          </Row>
        </Section>
      </div>

      <ImportDialog
        backup={pending?.backup}
        conflicts={pending?.conflicts ?? []}
        onClose={() => setPending(undefined)}
      />
    </>
  );
}
