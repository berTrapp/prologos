import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

type NavLinkItemProps = {
  /** A destination makes it a link; an action without one makes it a button (ux-ui 9). */
  to?: string;
  onClick?: () => void;
  icon: ReactNode;
  label: string;
  collapsed: boolean;
  end?: boolean;
  /** Short value on the right ("79%"), hidden when collapsed. */
  meta?: ReactNode;
};

/** Sidebar link: real anchor, active state with weight and background, not color alone (ux-ui 9, 12). */
const base = (collapsed: boolean, active = false) =>
  cn(
    'flex h-9 w-full items-center gap-3 rounded-track px-2.5 text-left text-[13.5px] text-muted transition-colors duration-(--duration-fast)',
    'hover:bg-fill hover:text-text focus-visible:outline-2 focus-visible:outline-ring',
    'pointer-coarse:h-11 [&_svg]:size-4 [&_svg]:shrink-0',
    collapsed && 'justify-center px-0',
    active && 'bg-fill-active font-medium text-text shadow-segment',
  );

export function NavLinkItem({ to, onClick, icon, label, collapsed, end, meta }: NavLinkItemProps) {
  const content = (
    <>
      {icon}
      {collapsed ? null : <span className="truncate">{label}</span>}
      {collapsed || !meta ? null : (
        <span className="ml-auto shrink-0 text-[12px] font-normal text-faint tabular-nums">
          {meta}
        </span>
      )}
    </>
  );
  const link =
    to === undefined ? (
      <button
        type="button"
        onClick={onClick}
        aria-label={collapsed ? label : undefined}
        className={base(collapsed)}
      >
        {content}
      </button>
    ) : (
      <NavLink
        to={to}
        end={end}
        aria-label={collapsed ? label : undefined}
        className={({ isActive }) => base(collapsed, isActive)}
      >
        {content}
      </NavLink>
    );
  return collapsed ? (
    <Tooltip content={label} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  );
}
