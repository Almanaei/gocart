import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import arTranslations from './ar.json';

const resources = {
  ar: {
    translation: arTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // اللغة الافتراضية
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    },
    // خيارات RTL
    dir: 'rtl',
    // خيارات التنسيق
    keySeparator: '.',
    nsSeparator: ':',
  });

export default i18n; 