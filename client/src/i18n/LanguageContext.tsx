import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from './translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('tunebuddy-lang');
    return (saved as Language) || 'hr';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('tunebuddy-lang', newLang);
  };

  useEffect(() => {
    localStorage.setItem('tunebuddy-lang', lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
