import 'i18next';
import type ptBRCommon from './locales/pt-BR/common.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: { common: typeof ptBRCommon };
  }
}
