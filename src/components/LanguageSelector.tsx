import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

interface LanguageSelectorProps {
  variant?: 'nav' | 'mobile';
  placement?: 'down' | 'up';
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'nav',
  placement = 'down',
  compact = false,
}) => {
  const { language } = useLanguage();
  const { updateSettings } = useSettings();
  const setLanguage = (lang: Language): void => {
    updateSettings({ language: lang });
  };
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: Array<{ code: Language; label: string; nativeName: string }> = [
    { code: 'en', label: 'English', nativeName: 'English' },
    { code: 'km', label: 'Khmer', nativeName: 'ភាសាខ្មែរ' },
  ];

  const current = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (variant === 'mobile') {
    return (
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        {languages.map((item) => {
          const isActive = language === item.code;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setLanguage(item.code)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
              <span>{item.nativeName}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const popoverPosition =
    placement === 'up'
      ? compact
        ? 'left-full bottom-0 ml-2'
        : 'left-0 bottom-full mb-2'
      : 'right-0 mt-2';

  return (
    <div className={`relative ${compact ? 'shrink-0' : 'flex-1 min-w-0'}`} ref={dropdownRef}>
      <button
        id="language-selector-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`flex items-center justify-center gap-1 ${
          compact ? 'w-10 h-10 p-0' : 'w-full px-2 py-2'
        } rounded-xl text-xs font-bold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900 ${
          isOpen
            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200'
            : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
        }`}
        title="Select Language / ជ្រើសរើសភាសា"
        aria-label="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        {!compact && (
          <>
            <span className="tracking-tight whitespace-nowrap truncate">{current.nativeName}</span>
            <ChevronDown
              className={`w-3 h-3 text-slate-400 transition-transform duration-200 shrink-0 ${
                isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
              }`}
            />
          </>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute ${popoverPosition} w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50`}
        >
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Language / ភាសា
          </div>
          {languages.map((item) => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLanguage(item.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <div className="font-bold leading-none">{item.nativeName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      {item.label}
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
