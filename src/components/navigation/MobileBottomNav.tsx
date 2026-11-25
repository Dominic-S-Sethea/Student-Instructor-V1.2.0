import React from 'react';
import { Award, Building2, Home, Sparkles, User } from 'lucide-react';
import type { TabView } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { PRIMARY_NAV_ITEMS } from './navConfig';

interface MobileBottomNavProps {
  currentTab: TabView;
  onSelectTab: (tab: TabView) => void;
}

function getMobileIcon(id: TabView): React.ReactNode {
  switch (id) {
    case 'dashboard':
      return <Home className="w-4 h-4" />;
    case 'scholarships':
      return <Award className="w-4 h-4" />;
    case 'university-intelligence':
      return <Building2 className="w-4 h-4" />;
    case 'advisor':
    case 'ai-advisor':
      return <Sparkles className="w-4 h-4" />;
    case 'profile':
      return <User className="w-4 h-4" />;
    default:
      return <Home className="w-4 h-4" />;
  }
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const { language } = useLanguage();
  const isKhmer = language === 'km';

  return (
    <nav
      aria-label="Mobile quick navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-1 py-1.5"
    >
      <div className="grid grid-cols-5 gap-1 max-w-lg mx-auto">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const active =
            currentTab === item.id ||
            (item.id === 'advisor' && currentTab === 'ai-advisor');
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                active
                  ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {getMobileIcon(item.id)}
              <span className="truncate max-w-full leading-tight">
                {isKhmer ? item.labelKm : item.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
