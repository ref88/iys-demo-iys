import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

const LanguageSwitcher = () => {
  const {
    currentLanguage,
    changeLanguage,
    availableLanguages,
    getCurrentLanguage,
  } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  const currentLang = getCurrentLanguage();

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
        aria-label='Change language'
      >
        <Globe className='w-4 h-4' />
        <span className='font-medium'>{currentLang.code.toUpperCase()}</span>
        <ChevronDown className='w-4 h-4' />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 z-10'
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
              }
            }}
            role='presentation'
            aria-hidden='true'
          />

          {/* Dropdown */}
          <div className='absolute right-0 mt-2 w-24 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20'>
            <div className='py-2'>
              {availableLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                    currentLanguage === language.code
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className='font-medium'>
                    {language.code.toUpperCase()}
                  </span>
                  {currentLanguage === language.code && (
                    <span className='ml-2'>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
