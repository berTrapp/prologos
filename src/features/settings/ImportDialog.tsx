import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { workspaceStore } from '@/app/services';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { ImportChoice } from '@/data/workspace-store';
import type { Backup } from '@/domain/rules/backup';
import { notify } from '@/lib/notify';

type ImportDialogProps = {
  backup: Backup | undefined;
  conflicts: string[];
  onClose: () => void;
};

/** RN 18: import restores without deleting; each existing project asks to replace or copy. */
export function ImportDialog({ backup, conflicts, onClose }: ImportDialogProps) {
  const { t } = useTranslation();
  const [choices, setChoices] = useState<Record<string, ImportChoice>>({});
  const [busy, setBusy] = useState(false);
  const count = backup?.projects.length ?? 0;

  const confirm = async () => {
    if (!backup) return;
    setBusy(true);
    try {
      const all = Object.fromEntries(conflicts.map((id) => [id, choices[id] ?? 'copy'])) as Record<
        string,
        ImportChoice
      >;
      const imported = await workspaceStore
        .getState()
        .importBackup(backup, all, (name) => t('importDialog.copyName', { name }));
      notify.success(t('toast.imported', { count: imported }));
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={backup !== undefined}
      onOpenChange={(open) => (open ? undefined : onClose())}
      title={t('importDialog.title')}
      description={t('importDialog.body', { count })}
      footer={
        <>
          <Button onClick={onClose}>{t('ui.cancel')}</Button>
          <Button
            variant="primary"
            loading={busy}
            loadingText={t('settings.importing')}
            onClick={() => void confirm()}
          >
            {t('importDialog.confirm')}
          </Button>
        </>
      }
    >
      {conflicts.length > 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-muted">{t('importDialog.conflicts')}</p>
          <ul className="flex flex-col gap-2">
            {conflicts.map((id) => {
              const name = backup?.projects.find((p) => p.project.id === id)?.project.name ?? id;
              return (
                <li
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-inner bg-fill-subtle p-3 inset-ring inset-ring-border"
                >
                  <span className="min-w-0 truncate text-[13.5px] font-medium text-text">
                    {name}
                  </span>
                  <SegmentedControl<ImportChoice>
                    label={t('importDialog.choiceLabel', { name })}
                    value={choices[id] ?? 'copy'}
                    onValueChange={(choice) =>
                      setChoices((current) => ({ ...current, [id]: choice }))
                    }
                    options={[
                      { value: 'copy', label: t('importDialog.copy') },
                      { value: 'replace', label: t('importDialog.replace') },
                    ]}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </Dialog>
  );
}
