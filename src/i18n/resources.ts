import enCommon from './locales/en/common.json';
import esCommon from './locales/es/common.json';
import ptBRCommon from './locales/pt-BR/common.json';
import type { Language } from './languages';

export const resources = {
  'pt-BR': { common: ptBRCommon },
  en: { common: enCommon },
  es: { common: esCommon },
} satisfies Record<Language, Record<string, unknown>>;

export const defaultNS = 'common';
