import React from 'react';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Compass,
  MessageSquare,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import type {
  ComprehensiveUniversityProfile,
  DecisionResultDossier,
  TabView,
} from '../../types';

interface DecisionResultDossierViewProps {
  dossier: DecisionResultDossier;
  universities: ComprehensiveUniversityProfile[];
  onRecalibrate: () => void;
  onNavigateTab: (tab: TabView) => void;
  onOpenROI: (univId: string) => void;
  onOpenUniversityDetails: (univ: ComprehensiveUniversityProfile) => void;
  onStartAIChatWithPrompt?: (prompt: string) => void;
}

export const DecisionResultDossierView: React.FC<DecisionResultDossierViewProps> = ({
  dossier,
  universities,
  onRecalibrate,
  onNavigateTab,
  onOpenROI,
  onOpenUniversityDetails,
  onStartAIChatWithPrompt,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Your Major Fit Summary</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
              Recommended Study Path
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Matched to your interests, math comfort level, budget, and study style.
            </p>
          </div>
          <button
            type="button"
            onClick={onRecalibrate}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 self-start cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake Quiz</span>
          </button>
        </div>

        {/* Recommended Major Card */}
        {dossier.recommendedMajors.map((major, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 dark:from-blue-950/40 dark:to-slate-900 p-5 rounded-2xl border border-blue-100 dark:border-blue-900 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white">
                  Top Match: {major.fitScore}% Fit
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Study intensity: {'★'.repeat(major.difficultyStars)}{'☆'.repeat(5 - major.difficultyStars)}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full self-start sm:self-auto">
                Planning Estimate • {major.salaryRange}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{major.majorName}</h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {major.matchReason}
            </p>

            {major.alternativeIfMathIssue && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Alternative Path: </span>
                  Consider <span className="font-extrabold underline">{major.alternativeIfMathIssue}</span> if you want strong tech or business careers without heavy calculus.
                </div>
              </div>
            )}
          </div>
        ))}

        {/* University Matches */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Matching Cambodian Universities</span>
            </h4>
            <button
              type="button"
              onClick={() => onNavigateTab('university-intelligence')}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              View All Universities →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dossier.recommendedUniversities.map((uni) => {
              const fullUni = universities.find((u) => u.id === uni.univId);
              return (
                <div
                  key={uni.univId}
                  className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all shadow-xs space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base text-slate-900 dark:text-slate-100">{uni.univAbbr}</span>
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                        Score: {uni.profileScore}/100
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{uni.univName}</div>

                    <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
                      Scholarship Match: {uni.scholarshipMatch}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Why this fits: </span>
                      {uni.whyFit}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => onOpenROI(uni.univId)}
                      className="flex-1 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center transition-colors cursor-pointer"
                    >
                      Tuition ROI
                    </button>
                    {fullUni && (
                      <button
                        type="button"
                        onClick={() => onOpenUniversityDetails(fullUni)}
                        className="flex-1 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-xs font-bold text-center transition-colors cursor-pointer"
                      >
                        University Info
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial ROI Planning Estimate Banner */}
        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Tuition &amp; Payback Planning Estimate</span>
            </div>
            <p className="text-xs text-emerald-800/90 dark:text-emerald-300">{dossier.roiAnalysis.financialVerdict}</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              Heuristic planning estimate — verify current tuition and scholarship terms with each university.
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Est. Payback Period</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100">
              {dossier.roiAnalysis.paybackMonths === 0
                ? '0 Months (Full Aid)'
                : `${dossier.roiAnalysis.paybackMonths} Months`}
            </div>
          </div>
        </div>

        {/* Action Checklist */}
        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Your Next Steps</span>
          </h4>

          <div className="space-y-2">
            {dossier.actionChecklist.map((step) => (
              <div
                key={step.stepNumber}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {step.stepNumber}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{step.title}</span>
                    <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md self-start sm:self-auto">
                      {step.deadline}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{step.instructions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              if (onStartAIChatWithPrompt) {
                onStartAIChatWithPrompt(
                  `I completed the Major Fit Quiz! My top recommended major is ${dossier.recommendedMajors[0]?.majorName}. Can you suggest a 6-month study roadmap for university entrance and scholarships?`
                );
              } else {
                onNavigateTab('advisor');
              }
            }}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask Study Advisor for Roadmap</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('mentors')}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Talk to a Senior Mentor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
