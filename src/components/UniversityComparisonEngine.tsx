import React, { useState, useEffect } from 'react';
import {
  Scale,
  CheckCircle2,
  XCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ComprehensiveUniversityProfile } from '../types';
import { DataConfidenceBadge } from './DataConfidenceBadge';
import { analytics } from '../utils/analytics';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  universities: ComprehensiveUniversityProfile[];
  initialSelectedIds?: string[];
  onOpenROI?: (univId: string) => void;
  onOpenUniversityDetails?: (univ: ComprehensiveUniversityProfile) => void;
}

export const UniversityComparisonEngine: React.FC<Props> = ({
  universities,
  initialSelectedIds = ['univ-cadt', 'univ-itc', 'univ-rupp'],
  onOpenROI,
  onOpenUniversityDetails,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const { t } = useLanguage();
  const matrixScroll = useDraggableScroll<HTMLDivElement>();
  const selectorScroll = useDraggableScroll<HTMLDivElement>();

  useEffect(() => {
    analytics.track('compare_university', {
      universities_compared: selectedIds,
      count: selectedIds.length,
    });
  }, [selectedIds]);

  const selectedUnis = selectedIds
    .map((id) => universities.find((u) => u.id === id))
    .filter((u): u is ComprehensiveUniversityProfile => !!u);

  const handleToggleAdd = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds([selectedIds[1], selectedIds[2], id]);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {t('matrix.title', 'University Decision Comparison Matrix')}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('matrix.subtitle', 'Direct side-by-side evaluation across profile score weights, tuition, curriculum style, and graduate ROI')}
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Comparing <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedUnis.length}</span> of max 3 institutions
          </div>
        </div>

        <div className="relative pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mr-2 shrink-0">
            {t('matrix.selectToCompare', 'Select to Compare:')}
          </span>
          <div
            ref={selectorScroll.ref}
            {...selectorScroll.events}
            className={`flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 select-none w-full ${
              selectorScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            title={t('nav.dragHint', 'Drag left & right to view all options')}
          >
            {universities.map((u) => {
              const isSelected = selectedIds.includes(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleToggleAdd(u.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{u.abbr}</span>
                  {isSelected ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative">
        {matrixScroll.canScrollLeft && (
          <button
            type="button"
            onClick={matrixScroll.scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 transition cursor-pointer"
            aria-label="Scroll matrix left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div
          ref={matrixScroll.ref}
          {...matrixScroll.events}
          className={`overflow-x-auto no-scrollbar scroll-smooth pb-4 select-none ${
            matrixScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          title={t('nav.dragHint', 'Drag left & right to view all comparison columns')}
        >
          <div className="min-w-[760px] grid grid-cols-4 gap-4">
            <div className="col-span-1 space-y-4 pt-20 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="h-16 flex items-center border-b border-slate-100 dark:border-slate-800">{t('matrix.dataReliability', 'Data Reliability')}</div>
              <div className="h-20 flex items-center border-b border-slate-100 dark:border-slate-800">{t('matrix.overallScore', 'Overall Profile Score')}</div>
              <div className="h-20 flex items-center border-b border-slate-100 dark:border-slate-800">{t('matrix.scoreBreakdown', 'Score Breakdown (30/20/20/30)')}</div>
              <div className="h-18 flex items-center border-b border-slate-100 dark:border-slate-800">{t('matrix.tuition', 'Annual & Total Tuition')}</div>
              <div className="h-18 flex items-center border-b border-slate-100 dark:border-slate-800">{t('matrix.curriculumModel', 'Curriculum Model')}</div>
              <div className="h-16 flex items-center border-b border-slate-100 dark:border-slate-800">{t('matrix.theoryPractice', 'Theory vs Real Practice')}</div>
              <div className="h-18 flex items-center border-b border-slate-100 dark:border-slate-800">{t('matrix.salaryPlacement', 'Starting Salary & 6mo Placement')}</div>
              <div className="h-20 flex items-center border-b border-slate-100 dark:border-slate-800">{t('matrix.scholarships', 'Full Scholarships Available')}</div>
              <div className="h-28 flex items-center border-b border-slate-100 dark:border-slate-800">{t('matrix.bestFitFor', 'Best Fit For')}</div>
              <div className="h-24 flex items-center border-b border-slate-100 dark:border-slate-800">{t('matrix.notRecommended', 'Not Recommended For')}</div>
              <div className="h-14 flex items-center">{t('matrix.decisionActions', 'Decision Actions')}</div>
            </div>

            {selectedUnis.map((univ) => (
              <div
                key={univ.id}
                className="col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="h-16 flex flex-col justify-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-900 dark:text-slate-100">{univ.abbr}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {univ.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate" title={univ.name}>
                    {univ.name}
                  </div>
                </div>

                <div className="h-16 flex items-center border-b border-slate-100 dark:border-slate-800">
                  <DataConfidenceBadge confidence={univ.dataConfidence} showDetailsButton={false} />
                </div>

                <div className="h-20 flex flex-col justify-center border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{univ.profileScore.overall}</span>
                    <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${univ.profileScore.overall}%` }} />
                  </div>
                </div>

                <div className="h-20 flex flex-col justify-center text-[11px] space-y-1 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Academic (30%):</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{univ.profileScore.academicReputation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Industry (20%):</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{univ.profileScore.industryConnection}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Facilities (20%):</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{univ.profileScore.facilities}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Graduate Outcome (30%):</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{univ.profileScore.graduateOutcome}</span>
                  </div>
                </div>

                <div className="h-18 flex flex-col justify-center border-b border-slate-100 dark:border-slate-800">
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    ${univ.annualTuitionUSD.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ yr</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Degree Total: <span className="font-bold text-slate-800 dark:text-slate-200">${univ.totalDegreeCostUSD.toLocaleString()}</span>
                  </div>
                </div>

                <div className="h-18 flex items-center border-b border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-tight">
                  {univ.curriculumHighlight}
                </div>

                <div className="h-16 flex items-center border-b border-slate-100 dark:border-slate-800 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/40 p-2 rounded-xl">
                  {univ.theoryVsPracticeRatio}
                </div>

                <div className="h-18 flex flex-col justify-center border-b border-slate-100 dark:border-slate-800">
                  <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {univ.averageGraduateSalaryMonthlyUSD > 0 ? `$${univ.averageGraduateSalaryMonthlyUSD}/mo est.` : 'Not specified'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {univ.employmentRate6Months > 0 ? (
                      <>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{univ.employmentRate6Months}%</span> est. 6-mo placement
                      </>
                    ) : (
                      'Placement not specified'
                    )}
                  </div>
                </div>

                <div className="h-20 flex flex-col justify-center border-b border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {univ.scholarships.hasFullScholarship ? '✓ Full Scholarships Available' : 'Partial Aid'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {univ.scholarships.scholarshipNames[0] || 'Verify current scholarship cycle'}
                  </span>
                </div>

                <div className="h-28 flex flex-col justify-center border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  {univ.studentFit.bestFor.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="h-24 flex flex-col justify-center border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-1.5 bg-rose-50/60 dark:bg-rose-950/40 p-2 rounded-xl border border-rose-100 dark:border-rose-900">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-3 text-rose-900 dark:text-rose-200">{univ.studentFit.notRecommendedFor[0]}</span>
                  </div>
                </div>

                <div className="h-14 flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenROI?.(univ.id)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold transition-colors text-center cursor-pointer"
                  >
                    Calc ROI
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenUniversityDetails?.(univ)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-[11px] font-bold transition-colors text-center cursor-pointer"
                  >
                    Full Dossier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {matrixScroll.canScrollRight && (
          <button
            type="button"
            onClick={matrixScroll.scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 transition cursor-pointer"
            aria-label="Scroll matrix right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
