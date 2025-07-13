import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getTranslation,
  getAvailableLanguages,
} from '../utils/translations.js';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Initialize from localStorage or default to Dutch
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('tako-language');
    return saved || 'nl';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('tako-language', currentLanguage);
  }, [currentLanguage]);

  // Translation function
  const t = (key) => getTranslation(key, currentLanguage);

  // Change language
  const changeLanguage = (languageCode) => {
    if (['nl', 'en'].includes(languageCode)) {
      setCurrentLanguage(languageCode);
    }
  };

  // Get available languages
  const availableLanguages = getAvailableLanguages();

  // Get current language info
  const getCurrentLanguage = () => {
    return (
      availableLanguages.find((lang) => lang.code === currentLanguage) ||
      availableLanguages[0]
    );
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages,
    getCurrentLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
