import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: {
        'app.title': string;
        'app.welcome': string;
        'nav.home': string;
        'nav.forms': string;
        'nav.newForm': string;
        'nav.settings': string;
        'settings.appearance': string;
        'settings.language': string;
        'settings.advanced': string;
        'settings.theme': string;
        'settings.selectTheme': string;
        'settings.lightTheme': string;
        'settings.darkTheme': string;
        'settings.systemTheme': string;
        'settings.behavior': string;
        'settings.autoSave': string;
        'settings.selectLanguage': string;
        'common.save': string;
        'settings.reset': string;
        'common.seconds': string;
      };
    };
  }
}

const resources = {
  ar: {
    translation: {
      'app.title': 'نظام التفتيش',
      'app.welcome': 'مرحباً بكم في نظام التفتيش للدفاع المدني',
      'nav.home': 'الرئيسية',
      'nav.forms': 'النماذج',
      'nav.newForm': 'نموذج جديد',
      'nav.settings': 'الإعدادات',
      'settings.appearance': 'المظهر',
      'settings.language': 'اللغة',
      'settings.advanced': 'إعدادات متقدمة',
      'settings.theme': 'السمة',
      'settings.selectTheme': 'اختر السمة',
      'settings.lightTheme': 'فاتح',
      'settings.darkTheme': 'داكن',
      'settings.systemTheme': 'حسب النظام',
      'settings.behavior': 'السلوك',
      'settings.autoSave': 'حفظ تلقائي',
      'settings.selectLanguage': 'اختر اللغة',
      'common.save': 'حفظ',
      'settings.reset': 'استعادة الإعدادات الافتراضية',
      'common.seconds': 'ثواني'
    }
  },
  en: {
    translation: {
      'app.title': 'Inspection System',
      'app.welcome': 'Welcome to the Civil Defense Inspection System',
      'nav.home': 'Home',
      'nav.forms': 'Forms',
      'nav.newForm': 'New Form',
      'nav.settings': 'Settings',
      'settings.appearance': 'Appearance',
      'settings.language': 'Language',
      'settings.advanced': 'Advanced',
      'settings.theme': 'Theme',
      'settings.selectTheme': 'Select Theme',
      'settings.lightTheme': 'Light',
      'settings.darkTheme': 'Dark',
      'settings.systemTheme': 'System',
      'settings.behavior': 'Behavior',
      'settings.autoSave': 'Auto Save',
      'settings.selectLanguage': 'Select Language',
      'common.save': 'Save',
      'settings.reset': 'Reset to Defaults',
      'common.seconds': 'seconds'
    }
  }
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar',
    fallbackLng: 'en',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 