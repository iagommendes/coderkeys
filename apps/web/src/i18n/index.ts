import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en-US/common.json';
import enCatalog from './locales/en-US/catalog.json';
import enLesson from './locales/en-US/lesson.json';
import enSettings from './locales/en-US/settings.json';
import enDashboard from './locales/en-US/dashboard.json';

import ptCommon from './locales/pt-BR/common.json';
import ptCatalog from './locales/pt-BR/catalog.json';
import ptLesson from './locales/pt-BR/lesson.json';
import ptSettings from './locales/pt-BR/settings.json';
import ptDashboard from './locales/pt-BR/dashboard.json';

import esCommon from './locales/es-ES/common.json';
import esCatalog from './locales/es-ES/catalog.json';
import esLesson from './locales/es-ES/lesson.json';
import esSettings from './locales/es-ES/settings.json';
import esDashboard from './locales/es-ES/dashboard.json';

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
        dashboard: enDashboard,
      },
      'pt-BR': {
        common: ptCommon,
        catalog: ptCatalog,
        lesson: ptLesson,
        settings: ptSettings,
        dashboard: ptDashboard,
      },
      'es-ES': {
        common: esCommon,
        catalog: esCatalog,
        lesson: esLesson,
        settings: esSettings,
        dashboard: esDashboard,
      },
    },
    fallbackLng: 'en-US',
    supportedLngs: ['en-US', 'pt-BR', 'es-ES'],
    defaultNS: 'common',
    ns: ['common', 'catalog', 'lesson', 'settings', 'dashboard'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'coderkeys-ui-locale',
    },
  });

export default i18n;
