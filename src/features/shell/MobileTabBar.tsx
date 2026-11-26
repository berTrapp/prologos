import { ClipboardCheck, Ellipsis, KeyRound, Map } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router';
import { cn } from '@/lib/utils';

function Tab({
  to,
  icon,
  label,
  end,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] text-muted',
          'focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring [&_svg]:size-5',
          // ux-ui 12: the active tab has a stronger icon and bold text, not only color.
          isActive && 'font-bold text-text [&_svg]:stroke-[2.25]',
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

/** Phone navigation at the bottom, within thumb reach (ux-ui 12). */
export function MobileTabBar({ projectId, onMore }: { projectId: string; onMore: () => void }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const inMore =
    pathname === '/lixeira' ||
    pathname === '/configuracoes' ||
    pathname.endsWith('/exportar') ||
    pathname.endsWith('/pronto');

  return (
    <nav
      aria-label={t('nav.tabs')}
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-bg/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <Tab to={`/p/${projectId}`} end icon={<Map aria-hidden />} label={t('nav.map')} />
      <Tab
        to={`/p/${projectId}/checklist`}
        icon={<ClipboardCheck aria-hidden />}
        label={t('nav.checklist')}
      />
      <Tab
        to={`/p/${projectId}/variaveis`}
        icon={<KeyRound aria-hidden />}
        label={t('nav.variables')}
      />
      <button
        type="button"
        onClick={onMore}
        aria-haspopup="dialog"
        className={cn(
          'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] text-muted',
          'focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring [&_svg]:size-5',
          inMore && 'font-bold text-text [&_svg]:stroke-[2.25]',
        )}
      >
        <Ellipsis aria-hidden />
        {t('nav.more')}
      </button>
    </nav>
  );
}
