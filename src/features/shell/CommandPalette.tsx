import { Command, useCommandState } from 'cmdk';
import {
  Download,
  House,
  Languages,
  Monitor,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Trash2,
} from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useWorkspace } from '@/app/services';
import { Kbd } from '@/components/ui/Kbd';
import { isInMainList } from '@/domain/rules/project';
import { exportBackupFile } from '@/features/projects/backup-actions';
import { useTheme } from '@/hooks/useTheme';
import { SUPPORTED_LANGUAGES } from '@/i18n/languages';
import { cn } from '@/lib/utils';
import { ProjectTile } from './ProjectSwitcher';
import { useUi } from './ui-store';

function Item({
  icon,
  label,
  hint,
  keywords,
  onSelect,
}: {
  icon: ReactNode;
  label: string;
  hint?: string;
  keywords?: string[];
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={label}
      keywords={keywords}
      onSelect={onSelect}
      className={cn(
        'flex h-10 cursor-default items-center gap-3 rounded-track px-2.5 text-[13.5px] text-text select-none',
        'pointer-coarse:h-12 data-[selected=true]:bg-fill-strong data-[selected=true]:inset-ring data-[selected=true]:inset-ring-border',
        '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted',
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {hint ? <span className="shrink-0 text-[12px] text-faint">{hint}</span> : null}
    </Command.Item>
  );
}

function Footer() {
  const { t } = useTranslation();
  const count = useCommandState((state) => state.filtered.count);
  return (
    <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[12px] text-muted">
      <span className="flex items-center gap-1.5">
        <Kbd>↑↓</Kbd>
        {t('palette.navigate')}
      </span>
      <span className="flex items-center gap-1.5">
        <Kbd>↵</Kbd>
        {t('palette.open')}
      </span>
      <span className="ml-auto">{t('palette.results', { count })}</span>
    </div>
  );
}

function Empty() {
  const { t } = useTranslation();
  const query = useCommandState((state) => state.search);
  return (
    <Command.Empty className="px-3 py-8 text-center text-[13.5px] text-muted">
      {t('palette.noResults', { query })}
    </Command.Empty>
  );
}

const groupClasses =
  '[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-faint [&_[cmdk-group-heading]]:uppercase';

/** Ctrl K, on every screen (ux-ui 9). Only what already exists is listed (ux-ui 12). */
export function CommandPalette() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const open = useUi((s) => s.paletteOpen);
  const setOpen = useUi((s) => s.setPaletteOpen);
  const openNewProject = useUi((s) => s.setNewProjectOpen);
  const projects = useWorkspace((s) => s.projects);
  const { setPreference } = useTheme();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(!useUi.getState().paletteOpen);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [setOpen]);

  const run = (action: () => void) => () => {
    setOpen(false);
    setSearch('');
    action();
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch('');
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-scrim data-[state=closed]:animate-[fade-out_var(--duration-fast)_ease-in] data-[state=open]:animate-[fade-in_var(--duration-base)_var(--ease-out)]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'surface-raised fixed top-[12dvh] left-1/2 z-50 flex max-h-[76dvh] w-[calc(100vw-24px)] max-w-[640px] -translate-x-1/2 flex-col overflow-hidden rounded-sheet inset-ring inset-ring-stroke-strong',
            'data-[state=closed]:animate-[popover-out_var(--duration-fast)_ease-in] data-[state=open]:animate-[popover-in_var(--duration-base)_var(--ease-out)]',
          )}
        >
          <DialogPrimitive.Title className="sr-only">{t('palette.label')}</DialogPrimitive.Title>
          <Command label={t('palette.label')} loop className="flex min-h-0 flex-col">
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search aria-hidden className="size-4 shrink-0 text-muted" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder={t('palette.placeholder')}
                className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-text outline-none placeholder:text-faint pointer-coarse:text-[16px]"
              />
              <Kbd>{t('keys.escape')}</Kbd>
            </div>
            <Command.List className="min-h-0 overflow-y-auto px-2 pb-2">
              <Empty />
              {projects.length > 0 ? (
                <Command.Group heading={t('palette.projects')} className={groupClasses}>
                  {projects
                    .filter((s) => isInMainList(s.project))
                    .map(({ project }) => (
                      <Item
                        key={project.id}
                        icon={<ProjectTile project={project} size="xs" />}
                        label={project.name}
                        hint={t(`status.project.${project.status}`)}
                        keywords={[t('palette.projectHint')]}
                        onSelect={run(() => navigate(`/p/${project.id}`))}
                      />
                    ))}
                </Command.Group>
              ) : null}
              <Command.Group heading={t('palette.navigation')} className={groupClasses}>
                <Item
                  icon={<House />}
                  label={t('palette.goHome')}
                  hint={t('palette.navHint')}
                  onSelect={run(() => navigate('/'))}
                />
                <Item
                  icon={<Trash2 />}
                  label={t('palette.goTrash')}
                  hint={t('palette.navHint')}
                  onSelect={run(() => navigate('/lixeira'))}
                />
                <Item
                  icon={<Settings />}
                  label={t('palette.goSettings')}
                  hint={t('palette.navHint')}
                  onSelect={run(() => navigate('/configuracoes'))}
                />
              </Command.Group>
              <Command.Group heading={t('palette.actions')} className={groupClasses}>
                <Item
                  icon={<Plus />}
                  label={t('palette.newProject')}
                  hint={t('palette.actionHint')}
                  onSelect={run(() => openNewProject(true))}
                />
                <Item
                  icon={<Download />}
                  label={t('palette.exportBackup')}
                  hint={t('palette.actionHint')}
                  onSelect={run(() => void exportBackupFile())}
                />
                <Item
                  icon={<Monitor />}
                  label={t('palette.theme', { name: t('theme.system') })}
                  onSelect={run(() => setPreference('system'))}
                />
                <Item
                  icon={<Sun />}
                  label={t('palette.theme', { name: t('theme.light') })}
                  onSelect={run(() => setPreference('light'))}
                />
                <Item
                  icon={<Moon />}
                  label={t('palette.theme', { name: t('theme.dark') })}
                  onSelect={run(() => setPreference('dark'))}
                />
                {SUPPORTED_LANGUAGES.map((lng) => (
                  <Item
                    key={lng}
                    icon={<Languages />}
                    label={t('palette.language', { name: t(`languages.${lng}`) })}
                    onSelect={run(() => void i18n.changeLanguage(lng))}
                  />
                ))}
              </Command.Group>
            </Command.List>
            <Footer />
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
