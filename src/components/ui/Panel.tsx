import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { IconButton } from './IconButton';

type PanelProps = {
  title: ReactNode;
  /** Which side of the content the panel sits on; the border goes on the opposite edge. */
  side?: 'left' | 'right';
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  /** Fixed width when expanded, in px. */
  width?: number;
  /** Content of the 56 px rail shown while collapsed. */
  rail?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Side panel with the collapse control in its own header, never in the footer (ux-ui 1, 13.10). */
export function Panel({
  title,
  side = 'left',
  collapsed,
  onCollapsedChange,
  width = 264,
  rail,
  actions,
  children,
  className,
}: PanelProps) {
  const { t } = useTranslation();
  const CollapseIcon = side === 'left' ? PanelLeftClose : PanelRightClose;
  const ExpandIcon = side === 'left' ? PanelLeftOpen : PanelRightOpen;

  return (
    <aside
      style={{ width: collapsed ? 56 : width }}
      className={cn(
        'flex h-full shrink-0 flex-col overflow-hidden bg-bg transition-[width] duration-(--duration-base) ease-(--ease-out)',
        side === 'left' ? 'border-r border-border' : 'border-l border-border',
        className,
      )}
    >
      <header
        className={cn(
          'flex h-14 shrink-0 items-center gap-2 px-3',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {collapsed ? null : (
          <div className="min-w-0 truncate pl-1 text-[13.5px] font-semibold text-text">{title}</div>
        )}
        <div className="flex items-center gap-1">
          {collapsed ? null : actions}
          <IconButton
            label={collapsed ? t('ui.expand') : t('ui.collapse')}
            icon={collapsed ? <ExpandIcon /> : <CollapseIcon />}
            tooltipSide={side === 'left' ? 'right' : 'left'}
            aria-expanded={!collapsed}
            onClick={() => onCollapsedChange(!collapsed)}
          />
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">{collapsed ? rail : children}</div>
    </aside>
  );
}
