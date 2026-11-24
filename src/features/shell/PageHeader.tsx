import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { IconButton } from '@/components/ui/IconButton';
import { useBreakpoint } from '@/hooks/useBreakpoint';

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** The screen's main action, top right (ux-ui 1). */
  action?: ReactNode;
  /** Compact action for the phone header (ghost text). */
  phoneAction?: ReactNode;
  /** Where Voltar goes on the phone when there is no history. */
  backTo?: string;
};

/** Page title; on the phone it becomes a bar with Voltar at the top left (ux-ui 12). */
export function PageHeader({
  title,
  subtitle,
  action,
  phoneAction,
  backTo = '/',
}: PageHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const phone = useBreakpoint() === 'phone';

  if (phone) {
    return (
      <header className="sticky top-0 z-20 -mx-4 mb-4 flex h-14 items-center gap-2 border-b border-border bg-bg/92 px-2 backdrop-blur-xl">
        <IconButton
          label={t('nav.back')}
          icon={<ChevronLeft />}
          onClick={() => (location.key !== 'default' ? navigate(-1) : navigate(backTo))}
        />
        <h1 className="min-w-0 flex-1 truncate text-[18px] font-semibold text-text">{title}</h1>
        {phoneAction ?? action}
      </header>
    );
  }

  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="flex min-w-0 flex-col gap-2">
        <h1 className="text-[32px] leading-tight font-semibold tracking-tight text-text">
          {title}
        </h1>
        {subtitle ? <p className="max-w-2xl text-[15px] text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}
