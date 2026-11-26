import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { ComprehensiveUniversityProfile } from '../../types';
import { DataConfidenceBadge } from '../DataConfidenceBadge';
import { hasActiveTextSelection } from '../../utils/textSelectionGuard';

interface UniversityCatalogCardProps {
  univ: ComprehensiveUniversityProfile;
  onOpenDossier: (univ: ComprehensiveUniversityProfile) => void;
  onOpenROI: (univId: string) => void;
}

export const UniversityCatalogCard: React.FC<UniversityCatalogCardProps> = React.memo(({
  univ,
  onOpenDossier,
  onOpenROI,
}) => (
  <div
    onClick={() => {
      if (hasActiveTextSelection()) return;
      onOpenDossier(univ);
    }}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpenDossier(univ);
      }
    }}
    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-xs hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col justify-between group cursor-pointer"
  >
    <div>
      <div className="h-36 bg-slate-900 relative overflow-hidden">
        <img
          src={univ.coverImage}
          alt={univ.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-gray-900 backdrop-blur-xs shadow-xs">
            {univ.type}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-600/90 text-white backdrop-blur-xs shadow-xs group-hover:bg-indigo-500 transition-colors flex items-center gap-1">
            <span>Click to view details</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <span className="text-xl font-black text-white">{univ.abbr}</span>
            {univ.khmerName && (
              <div className="text-[11px] text-gray-200 font-medium truncate max-w-[200px]">{univ.khmerName}</div>
            )}
          </div>
          <div className="bg-indigo-600 text-white px-2.5 py-1 rounded-xl text-center shadow-xs">
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Score</div>
            <div className="text-base font-black leading-none">{univ.profileScore.overall}</div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-3.5">
        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate" title={univ.name}>
          {univ.name}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <DataConfidenceBadge confidence={univ.dataConfidence} />
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {univ.accreditation.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Annual Tuition</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              ${univ.annualTuitionUSD.toLocaleString()}{' '}
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">/ yr</span>
            </div>
          </div>
          <div className="bg-emerald-50/70 dark:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Est. Starting Pay</div>
            <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">
              {univ.averageGraduateSalaryMonthlyUSD > 0 ? `$${univ.averageGraduateSalaryMonthlyUSD}/mo` : 'Not specified'}
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed bg-blue-50/40 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-100/60 dark:border-blue-900">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Focus: </span>
          {univ.curriculumHighlight}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Featured Majors:</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:underline">
              {univ.programs?.length || univ.majors.length} Programs →
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {univ.majors.slice(0, 4).map((m) => (
              <span key={m.id} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-medium">
                {m.name.split('(')[0].trim()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="p-5 pt-3 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 mt-2">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenROI(univ.id);
        }}
        className="flex-1 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center transition-colors cursor-pointer"
      >
        Simulate ROI
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDossier(univ);
        }}
        className="flex-1 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-bold text-center transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
      >
        <span>Full Profile</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
));

UniversityCatalogCard.displayName = 'UniversityCatalogCard';
