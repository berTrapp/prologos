import { Moon, Search, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { IconButton } from '@/components/ui/IconButton';
import { Kbd } from '@/components/ui/Kbd';
import { Logo } from '@/components/ui/Logo';
import { useUi } from '@/features/shell/ui-store';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useTheme } from '@/hooks/useTheme';

/** Home top bar (inicio.png): logo, search with Ctrl K and the theme switch. */
export function HomeTopBar() {
  const { t } = useTranslation();
  const openPalette = useUi((s) => s.setPaletteOpen);
  const { resolved, setPreference } = useTheme();
  const phone = useBreakpoint() === 'phone';

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/92 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:h-15 sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-control text-[15px] font-semibold text-text focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Logo />
          {t('app.name')}
        </Link>
        <div className="flex-1" />
        {phone ? (
          <IconButton label={t('nav.search')} icon={<Search />} onClick={() => openPalette(true)} />
        ) : (
          <button
            type="button"
            onClick={() => openPalette(true)}
            className="flex h-9 w-72 items-center gap-2.5 rounded-control bg-fill-subtle px-3 text-[13px] text-muted inset-ring inset-ring-stroke hover:bg-fill focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Search aria-hidden className="size-4" />
            <span className="flex-1 text-left">{t('nav.search')}</span>
            <Kbd>{t('keys.palette')}</Kbd>
          </button>
        )}
        <IconButton
          label={
            resolved === 'dark'
              ? t('palette.theme', { name: t('theme.light') })
              : t('palette.theme', { name: t('theme.dark') })
          }
          icon={resolved === 'dark' ? <Sun /> : <Moon />}
          onClick={() => setPreference(resolved === 'dark' ? 'light' : 'dark')}
        />
      </div>
    </header>
  );
}
