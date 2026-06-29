import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en-US/common.json';
import enCatalog from './locales/en-US/catalog.json';
import enLesson from './locales/en-US/lesson.json';
import enSettings from './locales/en-US/settings.json';

import ptCommon from './locales/pt-BR/common.json';
import ptCatalog from './locales/pt-BR/catalog.json';
import ptLesson from './locales/pt-BR/lesson.json';
import ptSettings from './locales/pt-BR/settings.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'en-US': {
        common: enCommon,
        catalog: enCatalog,
        lesson: enLesson,
        settings: enSettings,
      },
      'pt-BR': {
        common: ptCommon,
        catalog: ptCatalog,
        lesson: ptLesson,
        settings: ptSettings,
      },
    },
    fallbackLng: 'en-US',
    supportedLngs: ['en-US', 'pt-BR'],
    defaultNS: 'common',
    ns: ['common', 'catalog', 'lesson', 'settings'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'coderkeys-ui-locale',
    },
  });

export default i18n;
