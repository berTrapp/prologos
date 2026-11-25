import {
  ClipboardCheck,
  FolderOpen,
  KeyRound,
  Map,
  Plus,
  Search,
  Settings,
  Trash2,
} from 'lucide-react';
import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Kbd } from '@/components/ui/Kbd';
import { Logo } from '@/components/ui/Logo';
import { Panel } from '@/components/ui/Panel';
import { Tooltip } from '@/components/ui/Tooltip';
import type { Project } from '@/domain/schemas/project';
import { cn } from '@/lib/utils';
import { NavLinkItem } from './NavLinkItem';
import { ProjectSwitcher } from './ProjectSwitcher';
import { SaveIndicator } from './SaveIndicator';
import { useUi } from './ui-store';

// The share needs the kits, which load only with a project open (ux-ui 15).
const ChecklistPercent = lazy(async () => ({
  default: (await import('@/features/checklist/ChecklistPercent')).ChecklistPercent,
}));

type SidebarProps = {
  project: Project | undefined;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

/** Collapsible sidebar; its collapse button sits at the top, next to the logo (ux-ui 1, 13.10). */
export function Sidebar({ project, collapsed, onCollapsedChange }: SidebarProps) {
  const { t } = useTranslation();
  const openPalette = useUi((s) => s.setPaletteOpen);

  const nav = (
    <nav aria-label={t('nav.label')} className="flex h-full flex-col gap-4">
      <ProjectSwitcher project={project} collapsed={collapsed} />

      {project ? (
        <div className="flex flex-col gap-0.5">
          {collapsed ? null : (
            <p className="px-2.5 pb-1 font-mono text-[11px] tracking-wider text-faint uppercase">
              {t('nav.project')}
            </p>
          )}
          <NavLinkItem
            to={`/p/${project.id}`}
            end
            icon={<Map />}
            label={t('nav.map')}
            collapsed={collapsed}
          />
          <NavLinkItem
            to={`/p/${project.id}/checklist`}
            icon={<ClipboardCheck />}
            label={t('nav.checklist')}
            collapsed={collapsed}
            meta={
              <Suspense fallback={null}>
                <ChecklistPercent projectId={project.id} />
              </Suspense>
            }
          />
          <NavLinkItem
            to={`/p/${project.id}/variaveis`}
            icon={<KeyRound />}
            label={t('nav.variables')}
            collapsed={collapsed}
          />
        </div>
      ) : null}

      <div className={cn('flex flex-col gap-0.5', project && 'border-t border-border pt-4')}>
        <NavLinkItem
          to="/"
          end
          icon={<FolderOpen />}
          label={t('nav.allProjects')}
          collapsed={collapsed}
        />
        <NavLinkItem to="/novo" icon={<Plus />} label={t('nav.newProject')} collapsed={collapsed} />
        <NavLinkItem to="/lixeira" icon={<Trash2 />} label={t('nav.trash')} collapsed={collapsed} />
        <NavLinkItem
          to="/configuracoes"
          icon={<Settings />}
          label={t('nav.settings')}
          collapsed={collapsed}
        />
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <Tooltip
          content={t('nav.search')}
          shortcut={collapsed ? t('keys.palette') : undefined}
          side="right"
        >
          <button
            type="button"
            onClick={() => openPalette(true)}
            aria-label={t('nav.search')}
            className={cn(
              'flex h-9 w-full items-center gap-3 rounded-track px-2.5 text-[13px] text-muted inset-ring inset-ring-border',
              'hover:bg-fill hover:text-text focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-4',
              collapsed && 'justify-center px-0 inset-ring-0',
            )}
          >
            <Search aria-hidden />
            {collapsed ? null : (
              <>
                <span className="flex-1 text-left">{t('nav.search')}</span>
                <Kbd>{t('keys.palette')}</Kbd>
              </>
            )}
          </button>
        </Tooltip>
        <div className="px-2.5">
          <SaveIndicator compact={collapsed} />
        </div>
      </div>
    </nav>
  );

  return (
    <Panel
      title={
        <span className="flex items-center gap-2.5 text-[15px] font-semibold text-text">
          <Logo />
          {t('app.name')}
        </span>
      }
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      width={248}
      rail={nav}
    >
      {nav}
    </Panel>
  );
}
