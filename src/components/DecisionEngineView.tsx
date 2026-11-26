import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type {
  ComprehensiveUniversityProfile,
  DecisionAssessmentInput,
  DecisionResultDossier,
  TabView,
} from '../types';
import { analytics } from '../utils/analytics';
import { guidanceClient } from '../services/guidanceClient';
import { useLanguage } from '../context/LanguageContext';
import { DecisionResultDossierView } from './decision/DecisionResultDossierView';
import {
  QUIZ_BUDGET_OPTIONS,
  QUIZ_CAREER_OPTIONS,
  QUIZ_INTEREST_OPTIONS,
  QUIZ_MATH_OPTIONS,
  QUIZ_STRENGTH_OPTIONS,
  QUIZ_STYLE_OPTIONS,
} from './decision/quizConfig';

interface Props {
  universities: ComprehensiveUniversityProfile[];
  onNavigateTab: (tab: TabView) => void;
  onOpenROI: (univId: string) => void;
  onOpenUniversityDetails: (univ: ComprehensiveUniversityProfile) => void;
  onStartAIChatWithPrompt?: (prompt: string) => void;
}

const STEP_TITLES_EN = ['Your Interests', 'Math Comfort', 'Study Style', 'Budget & Aid', 'Future Goal', 'Your Results'];
const STEP_TITLES_KM = ['ចំណូលចិត្ត', 'កម្រិតគណិតវិទ្យា', 'របៀបសិក្សា', 'ថវិកា និងអាហារូបករណ៍', 'គោលដៅអនាគត', 'លទ្ធផលរបស់អ្នក'];

const StepFooter: React.FC<{
  isKhmer: boolean;
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
}> = ({ isKhmer, onBack, onNext, nextLabel }) => (
  <div className={`flex ${onBack ? 'justify-between' : 'justify-end'} pt-4 border-t border-slate-100 dark:border-slate-800`}>
    {onBack && (
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
        <ArrowLeft className="w-4 h-4" />
        <span>{isKhmer ? 'ត្រឡប់' : 'Back'}</span>
      </button>
    )}
    <button type="button" onClick={onNext} className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm cursor-pointer">
      <span>{nextLabel}</span>
      <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

export const DecisionEngineView: React.FC<Props> = ({
  universities,
  onNavigateTab,
  onOpenROI,
  onOpenUniversityDetails,
  onStartAIChatWithPrompt,
}) => {
  const { language } = useLanguage();
  const isKhmer = language === 'km';
  const stepTitles = isKhmer ? STEP_TITLES_KM : STEP_TITLES_EN;

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Technology']);
  const [mathAbility, setMathAbility] = useState<DecisionAssessmentInput['mathAbility']>('moderate_math');
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>(['Logic']);
  const [workStyle, setWorkStyle] = useState<DecisionAssessmentInput['workStyle']>('hands_on_coder');
  const [budgetTier, setBudgetTier] = useState<DecisionAssessmentInput['budgetTier']>('scholarship_dependent');
  const [careerGoal, setCareerGoal] = useState<DecisionAssessmentInput['careerGoal']>('local_tech');
  const [dossier, setDossier] = useState<DecisionResultDossier | null>(null);

  const toggleMulti = (current: string[], setFn: (v: string[]) => void, value: string): void => {
    if (current.includes(value)) {
      if (current.length > 1) setFn(current.filter((i) => i !== value));
    } else {
      setFn([...current, value]);
    }
  };

  const handleNextStep = (): void => {
    analytics.track('start_decision_assessment', { step: currentStep + 1 });
    setCurrentStep((prev) => prev + 1);
  };

  const handleRunEvaluation = async (): Promise<void> => {
    setIsEvaluating(true);
    setEvalError(null);
    try {
      const json = await guidanceClient.evaluateDecision({
        interests: selectedInterests,
        mathAbility,
        strengths: selectedStrengths,
        budgetTier,
        workStyle,
        careerGoal,
      });
      if (!json.success || !json.recommendations) {
        throw new Error('Unable to generate major recommendations. Please try again.');
      }
      const rec = json.recommendations;
      const topScore = rec.recommendedUniversities[0]?.profileScore ?? 90;
      const estMonthly = rec.roiAnalysis.projectedMonthlySalaryUSD;
      const salaryLabel =
        estMonthly > 0
          ? `~$${estMonthly.toLocaleString()} / mo`
          : 'Not specified (verify current market survey)';

      setDossier({
        recommendedMajors: [
          {
            majorName: rec.topMajor,
            fitScore: topScore,
            matchReason: `${rec.fitReason} (Planning estimate only)`,
            difficultyStars: rec.topMajor.includes('ITC') || rec.topMajor.includes('MD') ? 5 : 4,
            salaryRange: salaryLabel,
            careerPathways: ['Specialist Track', 'Applied Industry Role', 'Further Study / Fellowship'],
            alternativeIfMathIssue: rec.alternativeMajor || undefined,
          },
        ],
        recommendedUniversities: rec.recommendedUniversities,
        roiAnalysis: rec.roiAnalysis,
        actionChecklist: rec.actionChecklist,
      });
      analytics.track('complete_decision_assessment', {
        top_major: rec.topMajor,
        alternative_major: rec.alternativeMajor,
        recommended_universities: rec.recommendedUniversities.map((u) => u.univAbbr),
        payback_months: rec.roiAnalysis.paybackMonths,
      });
      setCurrentStep(6);
    } catch (err) {
      setEvalError(
        err instanceof Error ? err.message : 'Unable to evaluate major fit right now. Please try again.'
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-blue-950/30 dark:border-slate-800 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5 text-amber-300" />
          <span>{isKhmer ? 'តេស្តស្វែងរកជំនាញសិក្សា ២ នាទី' : '2-Minute Major Fit Quiz'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {isKhmer ? 'ស្វែងរកមុខជំនាញ និងសាកលវិទ្យាល័យដែលសាកសមនឹងអ្នក' : 'Find What to Study, Where to Study, and Why'}
        </h1>
        <p className="text-blue-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
          {isKhmer
            ? 'ឆ្លើយសំណួរ ៥ ជំហានអំពីចំណូលចិត្ត គណិតវិទ្យា របៀបសិក្សា និងថវិកា ដើម្បីទទួលបានការណែនាំបឋម។'
            : 'Answer 5 quick questions about your interests, math comfort, learning style, and budget to match with university majors.'}
        </p>
        <div className="pt-2 flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className={`h-2 flex-1 rounded-full transition-all duration-300 ${currentStep >= step ? 'bg-amber-400' : 'bg-white/20'}`} />
          ))}
        </div>
        <div className="flex justify-between text-xs text-blue-100 font-medium">
          <span>
            {currentStep <= 5
              ? isKhmer ? `ជំហាន ${currentStep} នៃ 5៖ ${stepTitles[currentStep - 1]}` : `Step ${currentStep} of 5: ${stepTitles[currentStep - 1]}`
              : isKhmer ? 'បានបញ្ចប់តេស្ត' : 'Quiz Complete'}
          </span>
          {currentStep <= 5 && <span>{isKhmer ? '~២ នាទី' : '~2 minutes'}</span>}
        </div>
      </div>

      {evalError && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-200">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{evalError}</span>
          </div>
          <button type="button" onClick={() => void handleRunEvaluation()} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer">
            {isKhmer ? 'ព្យាយាមម្តងទៀត' : 'Try Again'}
          </button>
        </div>
      )}

      {currentStep === 1 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isKhmer ? 'តើមុខវិជ្ជាណាដែលអ្នកចូលចិត្តស្វែងយល់?' : 'What subjects naturally spark your curiosity?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isKhmer ? 'ជ្រើសរើសមួយ ឬច្រើនផ្នែក។' : 'Tap one or more areas you enjoy exploring.'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUIZ_INTEREST_OPTIONS.map((opt) => {
              const isSelected = selectedInterests.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleMulti(selectedInterests, setSelectedInterests, opt.value)}
                  className={`min-h-[68px] p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 ring-1 ring-blue-600'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{opt.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</p>
                </button>
              );
            })}
          </div>
          <StepFooter isKhmer={isKhmer} onNext={handleNextStep} nextLabel={isKhmer ? 'បន្ទាប់៖ គណិតវិទ្យា' : 'Next: Math Comfort'} />
        </div>
      )}

      {currentStep === 2 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isKhmer ? 'តើអ្នកមានភាពងាយស្រួលកម្រិតណាជាមួយគណិតវិទ្យា?' : 'How comfortable are you with advanced math?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isKhmer ? 'មានអាជីពល្អៗជាច្រើនទាំងប្រើ និងមិនប្រើគណិតវិទ្យាជ្រៅ។' : 'Great tech and business careers exist both with and without heavy calculus.'}
            </p>
          </div>
          <div className="space-y-3">
            {QUIZ_MATH_OPTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMathAbility(item.id)}
                className={`w-full min-h-[68px] p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  mathAbility === item.id ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 ring-1 ring-blue-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.title}</span>
                  {mathAbility === item.id && <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{item.desc}</p>
                <div className="mt-2 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/60 inline-block px-2.5 py-0.5 rounded-md">{item.tag}</div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {QUIZ_STRENGTH_OPTIONS.map((s) => {
              const isSelected = selectedStrengths.includes(s.value);
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleMulti(selectedStrengths, setSelectedStrengths, s.value)}
                  className={`min-h-[44px] p-2.5 rounded-xl border text-left text-xs font-semibold cursor-pointer ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-500' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}{s.label}
                </button>
              );
            })}
          </div>
          <StepFooter isKhmer={isKhmer} onBack={() => setCurrentStep(1)} onNext={handleNextStep} nextLabel={isKhmer ? 'បន្ទាប់៖ របៀបសិក្សា' : 'Next: Study Style'} />
        </div>
      )}

      {currentStep === 3 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{isKhmer ? 'តើអ្នករៀនបានល្អបំផុតតាមរបៀបណា?' : 'How do you learn best?'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUIZ_STYLE_OPTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setWorkStyle(item.id)}
                className={`min-h-[84px] p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  workStyle === item.id ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 ring-1 ring-blue-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.title}</span>
                    {workStyle === item.id && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{item.desc}</p>
                </div>
                <div className="mt-2 text-[11px] font-semibold text-blue-700 dark:text-blue-300">Typical fit: {item.match}</div>
              </button>
            ))}
          </div>
          <StepFooter isKhmer={isKhmer} onBack={() => setCurrentStep(2)} onNext={handleNextStep} nextLabel={isKhmer ? 'បន្ទាប់៖ ថវិកា' : 'Next: Budget & Aid'} />
        </div>
      )}

      {currentStep === 4 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{isKhmer ? 'តើថវិកាថ្លៃសិក្សាប្រចាំឆ្នាំរបស់អ្នកប្រមាណប៉ុន្មាន?' : 'What is your annual tuition budget?'}</h2>
          <div className="space-y-3">
            {QUIZ_BUDGET_OPTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setBudgetTier(item.id)}
                className={`w-full min-h-[64px] p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  budgetTier === item.id ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/50 ring-1 ring-emerald-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.title}</span>
                  {budgetTier === item.id && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{item.desc}</p>
                <span className="mt-2 inline-block text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-md">{item.tag}</span>
              </button>
            ))}
          </div>
          <StepFooter isKhmer={isKhmer} onBack={() => setCurrentStep(3)} onNext={handleNextStep} nextLabel={isKhmer ? 'បន្ទាប់៖ គោលដៅអនាគត' : 'Next: Future Goal'} />
        </div>
      )}

      {currentStep === 5 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{isKhmer ? 'តើអ្នកចង់ឃើញខ្លួនឯងធ្វើការបែបណាក្រោយបញ្ចប់ការសិក្សា?' : 'Where do you picture yourself after graduation?'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUIZ_CAREER_OPTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCareerGoal(item.id)}
                className={`min-h-[80px] p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  careerGoal === item.id ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 ring-1 ring-blue-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.title}</span>
                  {careerGoal === item.id && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{item.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setCurrentStep(4)} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>{isKhmer ? 'ត្រឡប់' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={() => void handleRunEvaluation()}
              disabled={isEvaluating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm cursor-pointer disabled:opacity-60"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isKhmer ? 'កំពុងគណនា...' : 'Calculating Your Match...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isKhmer ? 'មើលលទ្ធផលជំនាញ' : 'See My Major Matches'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {currentStep === 6 && dossier && (
        <DecisionResultDossierView
          dossier={dossier}
          universities={universities}
          onRecalibrate={() => setCurrentStep(1)}
          onOpenROI={onOpenROI}
          onOpenUniversityDetails={onOpenUniversityDetails}
          onNavigateTab={onNavigateTab}
          onStartAIChatWithPrompt={onStartAIChatWithPrompt}
        />
      )}
    </div>
  );
};
