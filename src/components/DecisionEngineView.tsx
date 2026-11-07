import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Award,
  DollarSign,
  Briefcase,
  BookOpen,
  Calendar,
  MessageSquare,
  HelpCircle,
  RefreshCw,
  TrendingUp,
  Scale,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  ComprehensiveUniversityProfile,
  DecisionAssessmentInput,
  DecisionResultDossier,
  TabView,
} from '../types';
import { DataConfidenceBadge } from './DataConfidenceBadge';
import { analytics } from '../utils/analytics';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  universities: ComprehensiveUniversityProfile[];
  onNavigateTab: (tab: TabView) => void;
  onOpenROI: (univId: string) => void;
  onOpenUniversityDetails: (univ: ComprehensiveUniversityProfile) => void;
  onStartAIChatWithPrompt?: (prompt: string) => void;
}

export const DecisionEngineView: React.FC<Props> = ({
  universities,
  onNavigateTab,
  onOpenROI,
  onOpenUniversityDetails,
  onStartAIChatWithPrompt,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Form State
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Technology']);
  const [mathAbility, setMathAbility] = useState<DecisionAssessmentInput['mathAbility']>('moderate_math');
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>(['Logic']);
  const [workStyle, setWorkStyle] = useState<DecisionAssessmentInput['workStyle']>('hands_on_coder');
  const [budgetTier, setBudgetTier] = useState<DecisionAssessmentInput['budgetTier']>('scholarship_dependent');
  const [careerGoal, setCareerGoal] = useState<DecisionAssessmentInput['careerGoal']>('local_tech');

  // Result Dossier
  const [dossier, setDossier] = useState<DecisionResultDossier | null>(null);

  const { t } = useLanguage();
  const stagesScroll = useDraggableScroll<HTMLDivElement>();

  const interestOptions = [
    { label: 'Technology & Software', value: 'Technology', desc: 'Coding, apps, AI, digital products' },
    { label: 'Business & Finance', value: 'Business', desc: 'Accounting, corporate management, audit' },
    { label: 'Healthcare & Medicine', value: 'Healthcare', desc: 'Patient care, biology, pharmaceuticals' },
    { label: 'Engineering & Hardware', value: 'Engineering', desc: 'Robotics, electronics, telecom, civil' },
    { label: 'Design & Visual Media', value: 'Design', desc: 'UI/UX, digital animation, creative media' },
  ];

  const strengthOptions = [
    { label: 'Logical & Algorithmic Problem Solving', value: 'Logic' },
    { label: 'Visual Creativity & User Empathy', value: 'Creativity' },
    { label: 'Attention to Fine Forensic Detail', value: 'Detail' },
    { label: 'Communication, Persuasion & Languages', value: 'Communication' },
    { label: 'Scientific Curiosity (Biology/Chemistry)', value: 'Science' },
  ];

  const handleNextStep = () => {
    analytics.track('start_decision_assessment', { step: currentStep + 1 });
    setCurrentStep((prev) => prev + 1);
  };

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);

    const payload: DecisionAssessmentInput = {
      interests: selectedInterests,
      mathAbility,
      strengths: selectedStrengths,
      workStyle,
      budgetTier,
      careerGoal,
    };

    try {
      const response = await fetch('/api/decision/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.recommendations) {
          const rec = json.recommendations;
          const resultDossier: DecisionResultDossier = {
            recommendedMajors: [
              {
                majorName: rec.topMajor,
                fitScore: mathAbility === 'hates_math' && selectedInterests.includes('Technology') ? 92 : 96,
                matchReason: rec.fitReason,
                difficultyStars: rec.topMajor.includes('ITC') || rec.topMajor.includes('MD') ? 5 : 4,
                salaryRange: '$650 - $1,400 / mo starting',
                careerPathways: ['Specialist Engineer', 'Product Lead', 'Tech Consultant'],
                alternativeIfMathIssue: rec.alternativeMajor || undefined,
              },
            ],
            recommendedUniversities: rec.recommendedUniversities,
            roiAnalysis: rec.roiAnalysis,
            actionChecklist: rec.actionChecklist,
          };

          setDossier(resultDossier);
          analytics.track('complete_decision_assessment', {
            top_major: rec.topMajor,
            alternative_major: rec.alternativeMajor,
            recommended_universities: rec.recommendedUniversities.map((u: any) => u.univAbbr),
            payback_months: rec.roiAnalysis.paybackMonths,
          });
        }
      }
    } catch (err) {
      console.error('Decision assessment error:', err);
    } finally {
      setIsEvaluating(false);
      setCurrentStep(6); // Go to results dossier
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-left">
      {/* Platform Title Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-8">
          <Compass className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Student Decision Intelligence Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Find What to Study, Where to Study, and Why
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm leading-relaxed">
            Move beyond superficial directories. Complete this 6-stage decision framework to discover which major matches your cognitive strengths, which university offers the highest ROI, and what exact steps to take next.
          </p>

          {/* Progress Indicator */}
          <div className="pt-4 flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  currentStep >= step ? 'bg-amber-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-blue-200/80 font-medium">
            <span>Stage {currentStep} of 6: {
              currentStep === 1 ? 'Self Understanding' :
              currentStep === 2 ? 'Ability & Math Calibration' :
              currentStep === 3 ? 'Learning & Work Style' :
              currentStep === 4 ? 'Financial Reality' :
              currentStep === 5 ? 'Career Ambition' : 'Your Decision Dossier'
            }</span>
            {currentStep < 6 && <span>Personalized synthesis in 2 mins</span>}
          </div>
        </div>
      </div>

      {/* Draggable Stages Navigation Bar */}
      <div className="relative flex items-center bg-white p-2 rounded-2xl border border-gray-100 shadow-xs">
        {stagesScroll.canScrollLeft && (
          <button
            type="button"
            onClick={stagesScroll.scrollLeft}
            className="absolute left-1 z-20 p-1 rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:text-indigo-600"
            aria-label="Scroll stages left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        <div
          ref={stagesScroll.ref}
          {...stagesScroll.events}
          className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 select-none w-full ${
            stagesScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          title={t('nav.dragHint', 'Drag left & right to view all stages')}
        >
          {[
            { step: 1, label: t('decision.step1', '1. Self Understanding') },
            { step: 2, label: t('decision.step2', '2. Ability Calibration') },
            { step: 3, label: t('decision.step3', '3. Learning Style') },
            { step: 4, label: t('decision.step4', '4. Financial Reality') },
            { step: 5, label: t('decision.step5', '5. Career Ambition') },
            { step: 6, label: t('decision.step6', '6. Decision Dossier') },
          ].map((s) => {
            const isCurrent = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step < currentStep || (dossier && s.step === 6)) {
                    setCurrentStep(s.step);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {stagesScroll.canScrollRight && (
          <button
            type="button"
            onClick={stagesScroll.scrollRight}
            className="absolute right-1 z-20 p-1 rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:text-indigo-600"
            aria-label="Scroll stages right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* STAGE 1: Self Understanding (Interests) */}
      {currentStep === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="space-y-1">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Stage 1: Self Understanding</div>
            <h2 className="text-xl font-bold text-gray-900">What fields naturally spark your curiosity?</h2>
            <p className="text-xs text-gray-500">Select one or more domain areas you enjoy exploring.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {interestOptions.map((opt) => {
              const isSelected = selectedInterests.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      if (selectedInterests.length > 1) {
                        setSelectedInterests(selectedInterests.filter((i) => i !== opt.value));
                      }
                    } else {
                      setSelectedInterests([...selectedInterests, opt.value]);
                    }
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900">{opt.label}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Next: Ability & Math Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: Ability Check (Crucial: How does the student feel about High-Level Math?) */}
      {currentStep === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="space-y-1">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Stage 2: Ability & Math Calibration</div>
            <h2 className="text-xl font-bold text-gray-900">How comfortable are you with advanced mathematics?</h2>
            <p className="text-xs text-gray-500">
              Honesty is critical. If you love computers but hate calculus, Computer Science may lead to burnout — but UX Design or Business Information Systems would let you excel!
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'loves_math',
                title: 'High Math Confidence (Calculus, Trigonometry & Proofs)',
                desc: 'You enjoy math puzzles, deriving equations, and feel confident for heavy calculus in Tronc Commun or Data Science.',
                tag: 'Optimal for: AI, Data Science, Telecom, Engineering',
              },
              {
                id: 'moderate_math',
                title: 'Moderate Math (Practical logic & statistics)',
                desc: 'You can handle high school math with practice, but prefer writing actual software code rather than theoretical proofs.',
                tag: 'Optimal for: Software Engineering, Full-Stack Web, Cyber Defense',
              },
              {
                id: 'hates_math',
                title: 'Dislike / Struggle with Advanced Calculus',
                desc: 'Abstract mathematical proofs drain your energy. You want to work with technology, creativity, or business without advanced calculus.',
                tag: 'Alternative Bridges: UX/UI Design, Product Management, Information Systems, CamEd Finance',
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMathAbility(item.id as any)}
                className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  mathAbility === item.id
                    ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">{item.title}</span>
                  {mathAbility === item.id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                </div>
                <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                <div className="mt-2 text-[11px] font-semibold text-indigo-700 bg-indigo-100/60 inline-block px-2.5 py-0.5 rounded-md">
                  {item.tag}
                </div>
              </button>
            ))}
          </div>

          {/* Secondary strengths */}
          <div className="pt-2 space-y-2">
            <label className="text-xs font-bold text-gray-700">Select your top natural strengths:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {strengthOptions.map((s) => {
                const isSelected = selectedStrengths.includes(s.value);
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (selectedStrengths.length > 1) {
                          setSelectedStrengths(selectedStrengths.filter((i) => i !== s.value));
                        }
                      } else {
                        setSelectedStrengths([...selectedStrengths, s.value]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isSelected ? 'bg-indigo-50 text-indigo-900 border-indigo-500' : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Next: Learning Style</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: Learning & Work Style */}
      {currentStep === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="space-y-1">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Stage 3: Learning & Work Style</div>
            <h2 className="text-xl font-bold text-gray-900">Which environment brings out your highest focus?</h2>
            <p className="text-xs text-gray-500">Different universities favor distinct learning methodologies.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: 'hands_on_coder',
                title: 'Practical Builder (70% Projects)',
                desc: 'You learn best by typing code, launching real apps, building Git repositories, and participating in hackathons.',
                schoolMatch: 'CADT, Paragon',
              },
              {
                id: 'theory_researcher',
                title: 'Deep Engineering Theory (Rigorous)',
                desc: 'You appreciate understanding first principles, thermodynamics, calculus derivations, and academic prestige.',
                schoolMatch: 'ITC (Tronc Commun), RUPP',
              },
              {
                id: 'entrepreneur_creative',
                title: 'International Corporate & Pitching',
                desc: 'You thrive in English-medium seminar discussions, case studies, business pitches, and global diplomacy.',
                schoolMatch: 'AUPP, CamEd',
              },
              {
                id: 'caring_service',
                title: 'Clinical & Patient Vocation',
                desc: 'You thrive in service of human health, disciplined hospital rounds, and saving lives through medicine.',
                schoolMatch: 'UHS',
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setWorkStyle(item.id as any)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  workStyle === item.id
                    ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900">{item.title}</span>
                    {workStyle === item.id && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                </div>
                <div className="mt-3 text-[10px] text-gray-400 font-semibold">
                  Typical fit: <span className="text-indigo-700">{item.schoolMatch}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Next: Financial Reality</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: Financial Reality */}
      {currentStep === 4 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="space-y-1">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Stage 4: Financial Reality & Budget</div>
            <h2 className="text-xl font-bold text-gray-900">What is your realistic financial expectation for tuition?</h2>
            <p className="text-xs text-gray-500">We prioritize programs with positive ROI and transparent cost structures.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'scholarship_dependent',
                title: 'Need 100% Full Scholarship with Stipend',
                desc: 'Family budget is tight. Must secure full government or university merit grants (e.g. MPTC Full Scholarship at CADT, State quota at ITC).',
                priceTag: '$0 Outlay (Target Grade A or B on Bac II)',
              },
              {
                id: 'low_under_1000',
                title: 'Accessible Budget (<$1,000 / Year)',
                desc: 'Seeking low public university tuition with high recognition and low debt.',
                priceTag: 'ITC ($700/yr) or RUPP ($600/yr)',
              },
              {
                id: 'mid_1000_3500',
                title: 'Moderate Budget ($1,200 - $3,500 / Year)',
                desc: 'Able to invest in specialized private or semi-autonomous academies with industry labs.',
                priceTag: 'CADT ($1,600/yr), CamEd ($2,400/yr), Paragon ($3,000/yr)',
              },
              {
                id: 'international_5000_plus',
                title: 'Premium International ($5,000+ / Year)',
                desc: 'Prepared to invest in US accredited dual-degrees and multinational networking.',
                priceTag: 'AUPP ($9,000/yr with University of Arizona)',
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setBudgetTier(item.id as any)}
                className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  budgetTier === item.id
                    ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">{item.title}</span>
                  {budgetTier === item.id && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                </div>
                <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                <div className="mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 inline-block px-2.5 py-0.5 rounded-md">
                  {item.priceTag}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Next: Career Ambition</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 5: Career Ambition */}
      {currentStep === 5 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="space-y-1">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Stage 5: Career Ambition</div>
            <h2 className="text-xl font-bold text-gray-900">What does your dream milestone look like 4 years from now?</h2>
            <p className="text-xs text-gray-500">We match you with programs that have proven placement in that specific trajectory.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: 'local_tech',
                title: 'High-Demand Tech Professional',
                desc: 'Joining top banking institutions (ABA, Wing) or telecom leaders (Smart Axiata) as a software or data specialist.',
              },
              {
                id: 'startup_founder',
                title: 'Tech Founder / Product Innovator',
                desc: 'Launching digital startup products, building platforms, and leveraging incubators like Techo Startup Center.',
              },
              {
                id: 'international_remote',
                title: 'Global Remote / Big Four Advisory',
                desc: 'Working for regional firms in Singapore/USA or landing corporate advisory at PwC, Deloitte, or EY.',
              },
              {
                id: 'healthcare_public',
                title: 'National Health & Hospital Service',
                desc: 'Saving lives as a certified physician, hospital specialist, or public health director.',
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCareerGoal(item.id as any)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  careerGoal === item.id
                    ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">{item.title}</span>
                  {careerGoal === item.id && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleRunEvaluation}
              disabled={isEvaluating}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-60"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Decision Intelligence...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate My Decision Dossier</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 6: Decision Dossier Output */}
      {currentStep === 6 && dossier && (
        <div className="space-y-6">
          {/* Dossier Header */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Stage 6: Personalized Decision Dossier</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mt-2">Your Strategic Academic Blueprint</h2>
                <p className="text-xs text-gray-500">Based on your cognitive strengths, math comfort level, budget, and ambitions.</p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 py-1.5 px-3 rounded-xl border border-gray-200 self-start"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recalibrate Assessment</span>
              </button>
            </div>

            {/* Recommended Major Card */}
            {dossier.recommendedMajors.map((major, idx) => (
              <div key={idx} className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 p-5 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-600 text-white">
                      Top Major Match: {major.fitScore}% Fit
                    </span>
                    <span className="text-xs text-gray-500">
                      Difficulty: {'★'.repeat(major.difficultyStars)}{'☆'.repeat(5 - major.difficultyStars)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-full">
                    {major.salaryRange}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900">{major.majorName}</h3>
                <p className="text-xs text-gray-700 leading-relaxed">{major.matchReason}</p>

                {/* Cognitive bridge warning if math is a mismatch */}
                {major.alternativeIfMathIssue && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Recommended Alternative Bridge: </span>
                      Consider <span className="font-black text-amber-950 underline">{major.alternativeIfMathIssue}</span> if you want high tech/business earnings without heavy multivariable calculus.
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Best Fit University Matches */}
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Top-Fit University Matches in Cambodia</span>
                </h4>
                <button
                  type="button"
                  onClick={() => onNavigateTab('university-intelligence')}
                  className="text-xs text-indigo-600 font-bold hover:underline"
                >
                  View Full Intelligence DB →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dossier.recommendedUniversities.map((uni) => {
                  const fullUni = universities.find((u) => u.id === uni.univId);
                  return (
                    <div
                      key={uni.univId}
                      className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-indigo-300 transition-all shadow-xs space-y-2.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-base text-gray-900">{uni.univAbbr}</span>
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            Score: {uni.profileScore}/100
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{uni.univName}</div>

                        <div className="mt-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
                          Scholarship Match: {uni.scholarshipMatch}
                        </div>

                        <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                          <span className="font-semibold text-gray-800">Why this fits: </span>
                          {uni.whyFit}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => onOpenROI(uni.univId)}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold text-center transition-colors"
                        >
                          Simulate ROI
                        </button>
                        {fullUni && (
                          <button
                            type="button"
                            onClick={() => onOpenUniversityDetails(fullUni)}
                            className="flex-1 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-bold text-center transition-colors"
                          >
                            9-Point Dossier
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial ROI Overview Banner */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <span>Financial Decision & Investment Verdict</span>
                </div>
                <p className="text-xs text-emerald-800/90">{dossier.roiAnalysis.financialVerdict}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-emerald-700 font-semibold">Payback Period</div>
                <div className="text-2xl font-black text-emerald-950">
                  {dossier.roiAnalysis.paybackMonths === 0 ? '0 Months (Full Ride)' : `${dossier.roiAnalysis.paybackMonths} Months`}
                </div>
              </div>
            </div>

            {/* Concrete Step-by-Step Action Plan */}
            <div className="space-y-3 pt-3">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Your Next Steps (Admission & Prep Checklist)</span>
              </h4>

              <div className="space-y-2">
                {dossier.actionChecklist.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                        <span className="font-bold text-gray-900">{step.title}</span>
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md self-start mt-1 sm:mt-0">
                          {step.deadline}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{step.instructions}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  if (onStartAIChatWithPrompt) {
                    onStartAIChatWithPrompt(
                      `I just completed the Student Decision Engine assessment! My top recommended major is ${dossier.recommendedMajors[0]?.majorName}. Can you give me a personalized 6-month study roadmap to pass the university entrance and scholarship exam?`
                    );
                  } else {
                    onNavigateTab('advisor');
                  }
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ask AI Advisor for Study Roadmap</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('mentors')}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Book 1-on-1 with a Senior Alumni</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
