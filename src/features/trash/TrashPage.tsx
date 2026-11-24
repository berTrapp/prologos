import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNow } from '@/hooks/useNow';
import { useNavigate } from 'react-router';
import { useWorkspace, workspaceStore } from '@/app/services';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { trashDaysLeft } from '@/domain/rules/trash';
import type { TrashEntry } from '@/domain/schemas/history';
import { PageHeader } from '@/features/shell/PageHeader';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { formatRelative } from '@/lib/format';
import { notify } from '@/lib/notify';
import { badgeForState } from '@/lib/status-variants';
import { cn } from '@/lib/utils';

/** Entries in their last 7 days are flagged (text says it too, never color alone). */
const SOON_DAYS = 7;

/** RN 11: 30 days to restore; emptying is the app's only confirmation (ux-ui 8). */
export function TrashPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const phone = useBreakpoint() === 'phone';
  const trash = useWorkspace((s) => s.trash);
  const projects = useWorkspace((s) => s.projects);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState<string>();
  const now = useNow();

  const origin = (entry: TrashEntry) =>
    entry.projectId === null
      ? t('trash.fromAll')
      : (projects.find((p) => p.project.id === entry.projectId)?.project.name ??
        t('trash.unknownProject'));

  const restoreEntry = async (entry: TrashEntry) => {
    setBusy(entry.id);
    try {
      const projectId = await workspaceStore.getState().restoreTrash(entry);
      if (!projectId) {
        notify.error(t('toast.restoreFailed'), { description: t('toast.restoreFailedBody') });
        return;
      }
      notify.success(t('toast.restored', { name: entry.label }), {
        action: { label: t('toast.open'), onClick: () => navigate(`/p/${projectId}`) },
      });
    } finally {
      setBusy(undefined);
    }
  };

  const empty = async () => {
    await workspaceStore.getState().emptyTrash();
    setConfirmOpen(false);
    notify.success(t('toast.trashEmptied'));
  };

  const emptyButton =
    trash.length === 0 ? null : phone ? (
      <Button
        variant="destructive"
        size="compact"
        className="inset-ring-0"
        onClick={() => setConfirmOpen(true)}
      >
        {t('trash.emptyShort')}
      </Button>
    ) : (
      <Button variant="destructive" icon={<Trash2 />} onClick={() => setConfirmOpen(true)}>
        {t('trash.empty')}
      </Button>
    );

  return (
    <>
      <PageHeader
        title={t('trash.title')}
        subtitle={t('trash.subtitle')}
        action={emptyButton}
        backTo="/"
      />
      {phone ? <p className="mb-4 text-[15px] text-muted">{t('trash.subtitleShort')}</p> : null}

      {trash.length === 0 ? (
        <div className="surface rounded-card inset-ring inset-ring-border">
          <EmptyState
            icon={<Trash2 />}
            title={t('trash.emptyTitle')}
            description={t('trash.emptyBody')}
          />
        </div>
      ) : (
        <ul
          className={cn(
            'flex flex-col',
            phone ? 'gap-3' : 'surface overflow-hidden rounded-card inset-ring inset-ring-border',
          )}
        >
          {trash.map((entry) => {
            const days = trashDaysLeft(entry, now);
            const expires =
              days === 0 ? t('trash.expiresToday') : t('trash.expires', { count: days });
            const soon = days <= SOON_DAYS;
            const badge = (
              <Badge variant={badgeForState('label', 'trashType').variant}>
                {t(`trash.kind.${entry.kind}`)}
              </Badge>
            );
            const meta = (
              <p className="truncate text-[13px] text-muted">
                {origin(entry)} ·{' '}
                {t('trash.deletedAgo', {
                  time: formatRelative(entry.deletedAt, now, i18n.language),
                })}
              </p>
            );
            const restoreButton = (
              <Button
                loading={busy === entry.id}
                onClick={() => void restoreEntry(entry)}
                size={phone ? 'touch' : 'default'}
              >
                {t('trash.restore')}
              </Button>
            );
            const expiry = (
              <span className={cn('shrink-0 text-[13px]', soon ? 'text-warning' : 'text-muted')}>
                {expires}
              </span>
            );

            return phone ? (
              <li
                key={entry.id}
                className="surface flex flex-col gap-3 rounded-card p-4 inset-ring inset-ring-border"
              >
                <div className="flex items-center justify-between gap-3">
                  {badge}
                  {expiry}
                </div>
                <div>
                  <p className="text-[17px] font-medium text-text">{entry.label}</p>
                  {meta}
                </div>
                <div>{restoreButton}</div>
              </li>
            ) : (
              <li
                key={entry.id}
                className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0"
              >
                <span className="w-24 shrink-0">{badge}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-medium text-text">{entry.label}</p>
                  {meta}
                </div>
                {expiry}
                {restoreButton}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('trash.confirmTitle')}
        description={t('trash.confirmBody', { count: trash.length })}
        footer={
          <>
            <Button onClick={() => setConfirmOpen(false)}>{t('ui.cancel')}</Button>
            <Button variant="destructive" icon={<Trash2 />} onClick={() => void empty()}>
              {t('trash.empty')}
            </Button>
          </>
        }
      />
    </>
  );
}
