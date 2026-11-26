import React from 'react';
import type { TabView } from '../../types';

interface AppFooterProps {
  onOpenPatchNotes: () => void;
  onNavigateTab: (tab: TabView) => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({ onOpenPatchNotes, onNavigateTab }) => (
  <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 pb-24 lg:pb-5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
        <span className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">Student Instructor</span>
        <span aria-hidden="true">•</span>
        <button
          type="button"
          onClick={onOpenPatchNotes}
          className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer whitespace-nowrap"
        >
          Release Notes
        </button>
        <span aria-hidden="true">•</span>
        <span>Scholarships, University Guides &amp; Student Mentorship</span>
      </div>
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
        <span className="whitespace-nowrap">ITC • CADT • RUPP • UHS Curricula Grounded</span>
        <span aria-hidden="true">•</span>
        <button
          type="button"
          onClick={() => onNavigateTab('settings')}
          className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-semibold cursor-pointer whitespace-nowrap"
        >
          Settings
        </button>
        <span aria-hidden="true">•</span>
        <button
          type="button"
          onClick={() => onNavigateTab('dashboard')}
          className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer whitespace-nowrap"
        >
          Student Home
        </button>
      </div>
    </div>
  </footer>
);
