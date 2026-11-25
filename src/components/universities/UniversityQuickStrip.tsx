import React from 'react';
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ComprehensiveUniversityProfile } from '../../types';
import { useDraggableScroll } from '../../hooks/useDraggableScroll';

interface UniversityQuickStripProps {
  universities: ComprehensiveUniversityProfile[];
  selectedId?: string | null;
  onSelect: (univ: ComprehensiveUniversityProfile) => void;
}

export const UniversityQuickStrip: React.FC<UniversityQuickStripProps> = ({
  universities,
  selectedId,
  onSelect,
}) => {
  const scroll = useDraggableScroll<HTMLDivElement>();

  return (
    <div className="sticky top-16 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Click any university to open campus details, majors &amp; admission dates:
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold hidden md:inline shrink-0">
          {universities.length} Universities
        </span>
      </div>

      <div className="relative flex items-center">
        {scroll.canScrollLeft && (
          <button
            type="button"
            onClick={scroll.scrollLeft}
            className="absolute left-0 z-30 p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
            aria-label="Scroll universities left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        <div
          ref={scroll.ref}
          {...scroll.events}
          className={`flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 select-none w-full ${
            scroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          title="Click or drag to view and select any university"
        >
          {universities.map((u) => {
            const isSelected = selectedId === u.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => onSelect(u)}
                className={`group flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all shrink-0 cursor-pointer shadow-2xs hover:shadow-md hover:border-indigo-500 hover:-translate-y-0.5 ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80'
                }`}
              >
                <img
                  src={u.coverImage || u.logo}
                  alt={u.abbr}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {u.abbr}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                        u.type === 'Public'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      {u.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[130px]">
                    {u.name.split('(')[0].trim()}
                  </div>
                </div>
                <div className="bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0">
                  {u.profileScore.overall}
                </div>
              </button>
            );
          })}
        </div>

        {scroll.canScrollRight && (
          <button
            type="button"
            onClick={scroll.scrollRight}
            className="absolute right-0 z-30 p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
            aria-label="Scroll universities right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
