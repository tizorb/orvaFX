
    import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

    import enCommon from '@/locales/en/common.json';
    import enHome from '@/locales/en/home.json';
    import enAuth from '@/locales/en/auth.json';
    import enProjections from '@/locales/en/projections.json';
    import enCalculators from '@/locales/en/calculators.json';
    import enSubscription from '@/locales/en/subscription.json';
    import enProfile from '@/locales/en/profile.json';
    import enAdmin from '@/locales/en/admin.json';

    import esCommon from '@/locales/es/common.json';
    import esHome from '@/locales/es/home.json';
    import esAuth from '@/locales/es/auth.json';
    import esProjections from '@/locales/es/projections.json';
    import esCalculators from '@/locales/es/calculators.json';
    import esSubscription from '@/locales/es/subscription.json';
    import esProfile from '@/locales/es/profile.json';
    import esAdmin from '@/locales/es/admin.json';

    const LanguageContext = createContext();

    const translations = {
      en: {
        ...enCommon,
        ...enHome,
        ...enAuth,
        ...enProjections,
        ...enCalculators,
        ...enSubscription,
        ...enProfile,
        ...enAdmin,
      },
      es: {
        ...esCommon,
        ...esHome,
        ...esAuth,
        ...esProjections,
        ...esCalculators,
        ...esSubscription,
        ...esProfile,
        ...esAdmin,
      },
    };

    export const LanguageProvider = ({ children }) => {
      const [language, setLanguage] = useState(() => {
        const storedLang = localStorage.getItem('orvafx_language');
        return storedLang && translations[storedLang] ? storedLang : 'es';
      });

      useEffect(() => {
        localStorage.setItem('orvafx_language', language);
      }, [language]);

      const t = useCallback((key, params = {}) => {
        let translation = translations[language]?.[key] || translations['en']?.[key] || key;
        Object.keys(params).forEach(paramKey => {
          translation = translation.replace(`{${paramKey}}`, params[paramKey]);
        });
        return translation;
      }, [language]);

      return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
          {children}
        </LanguageContext.Provider>
      );
    };

    export const useLanguage = () => {
      const context = useContext(LanguageContext);
      if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
      }
      return context;
    };
  