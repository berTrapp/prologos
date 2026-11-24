export const SUPPORTED_LANGUAGES = ['pt-BR', 'en', 'es'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'pt-BR';

/** Maps a browser language tag to a supported language, falling back to pt-BR (RN 17). */
export function resolveLanguage(tag: string | undefined | null): Language {
  const base = tag?.toLowerCase().split(/[-_]/)[0];
  if (base === 'pt') return 'pt-BR';
  if (base === 'en') return 'en';
  if (base === 'es') return 'es';
  return DEFAULT_LANGUAGE;
}
