import enDev from './locales/en/dev.json';
import esDev from './locales/es/dev.json';
import ptBRDev from './locales/pt-BR/dev.json';
import type { Language } from './languages';

/** Texts of the dev-only pages; loaded by those pages so they never reach the public build. */
export const devResources = {
  'pt-BR': ptBRDev,
  en: enDev,
  es: esDev,
} satisfies Record<Language, unknown>;
