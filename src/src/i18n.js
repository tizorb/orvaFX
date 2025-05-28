import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importa tu archivo de traducción
import adminES from './locales/es/admin.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        admin: adminES,
      },
    },
    lng: 'es', // Idioma inicial
    fallbackLng: 'es',
    ns: ['admin'],
    defaultNS: 'admin',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
