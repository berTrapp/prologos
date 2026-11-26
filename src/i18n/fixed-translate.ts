import type { Translate } from '@/domain/rules/exports/model';
import i18n from './index';
import type { Language } from './languages';

/** Translation for generated files in a chosen language, apart from the interface's (RN 10, 17). */
export function fixedTranslate(language: Language): Translate {
  const t = i18n.getFixedT(language);
  return (key, values) => String(t(key as never, values as never));
}
