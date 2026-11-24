import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, resolveLanguage } from './languages';
import { defaultNS, resources } from './resources';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    // A key missing in en or es falls back to pt-BR (RN 17).
    fallbackLng: DEFAULT_LANGUAGE,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'prologos.language',
      caches: ['localStorage'],
      convertDetectedLanguage: resolveLanguage,
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  });

const syncDocumentLanguage = (lng: string) => {
  document.documentElement.lang = lng;
};
syncDocumentLanguage(i18n.resolvedLanguage ?? DEFAULT_LANGUAGE);
i18n.on('languageChanged', syncDocumentLanguage);

export default i18n;
