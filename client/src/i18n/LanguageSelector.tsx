import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { Language } from './translations';

const languages = [
  { code: 'hr' as Language, name: 'Hrvatski', flag: 'https://flagcdn.com/w40/hr.png' },
  { code: 'en' as Language, name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
];

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 hover:bg-slate-800 transition cursor-pointer"
      >
        <img src={currentLang.flag} alt={currentLang.name} className="w-5 h-4 object-cover rounded-sm" />
        <span>{currentLang.name}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden min-w-full">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                setLang(language.code);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-slate-800 transition ${
                lang === language.code ? 'bg-slate-800 text-lagoon' : 'text-slate-100'
              }`}
            >
              <img src={language.flag} alt={language.name} className="w-5 h-4 object-cover rounded-sm" />
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
