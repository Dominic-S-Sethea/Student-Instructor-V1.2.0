import React from 'react';
import type { TabView } from '../../types';
import { LanguageSelector } from '../LanguageSelector';
import { ADMIN_NAV_ITEMS, EXPLORE_NAV_ITEMS } from './navConfig';

interface TopNavMobileDrawerProps {
  currentTab: TabView;
  isKhmer: boolean;
  isAdmin: boolean;
  onNavigate: (tab: TabView) => void;
}

export const TopNavMobileDrawer: React.FC<TopNavMobileDrawerProps> = ({
  currentTab,
  isKhmer,
  isAdmin,
  onNavigate,
}) => (
  <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
    <LanguageSelector variant="mobile" />

    <div className="space-y-1">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
        {isKhmer ? 'ឧបករណ៍ស្វែងយល់បន្ថែម' : 'Explore Study Tools'}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {EXPLORE_NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`text-left px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              currentTab === item.id
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {isKhmer ? item.labelKm : item.labelEn}
          </button>
        ))}
      </div>
    </div>

    {isAdmin && (
      <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 px-1">
          Admin Internal Views
        </div>
        {ADMIN_NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className="w-full text-left px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-bold cursor-pointer"
          >
            {item.labelEn}
          </button>
        ))}
      </div>
    )}
  </div>
);
