import { useTranslation } from 'react-i18next';

/** Placeholder until phase 3 builds the real home. */
export function HomeRoute() {
  const { t } = useTranslation();
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-2 px-6">
      <h1 className="text-[28px] font-semibold tracking-tight text-text">{t('app.name')}</h1>
      <p className="text-[15px] text-muted">{t('app.tagline')}</p>
    </main>
  );
}
