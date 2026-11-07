import React, { useState } from 'react';
import {
  Gamepad2,
  Sparkles,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Brain,
  Zap,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { TabView } from '../types';

interface STEMDiscoveryViewProps {
  studentName?: string;
  onNavigateTab: (tab: TabView) => void;
  onBack?: () => void;
}

interface Challenge {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  themeColor: string;
  difficulty: string;
  durationMinutes: number;
  headline: string;
  scenario: string;
  visualHelper: {
    items: string[];
    rule: string;
  };
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  compliment: string;
  stemMajorFit: string;
}

const stemChallenges: Challenge[] = [
  {
    id: 'logic-1',
    title: 'The River Crossing Robot',
    category: 'logic',
    categoryLabel: 'Logic & Deduction',
    themeColor: 'from-blue-600 to-indigo-700',
    difficulty: 'Fun & Engaging',
    durationMinutes: 2,
    headline: 'Can you help the exploration drone deliver samples safely?',
    scenario:
      'A scientist drone must transport a fragile seedling 🌱, an automated hungry caterpillar robot 🐛, and organic nutrient leaves 🍃 across an island river. The drone basket can only hold ONE item at a time. If left alone on the riverbank without the drone, the caterpillar will consume the leaves, and the seedling will get tangled by the caterpillar!',
    visualHelper: {
      items: ['🌱 Seedling', '🐛 Caterpillar Bot', '🍃 Nutrient Leaves'],
      rule: 'Danger: Caterpillar + Leaves OR Caterpillar + Seedling cannot be left alone without the drone!',
    },
    options: [
      {
        id: 'opt-1',
        text: '1. Take Caterpillar across first, return empty. 2. Take Seedling across, bring Caterpillar back. 3. Take Leaves across, return empty. 4. Take Caterpillar across last.',
        isCorrect: true,
        feedback:
          'Brilliant step-by-step logic! You recognized that the Caterpillar Bot was the key conflict item and carefully swapped it back on return.',
      },
      {
        id: 'opt-2',
        text: 'Take Seedling first, return empty, take Leaves across, then take Caterpillar last.',
        isCorrect: false,
        feedback:
          'If you take Seedling first, Caterpillar Bot and Nutrient Leaves are left together on the start bank, and the leaves get eaten!',
      },
      {
        id: 'opt-3',
        text: 'Take Nutrient Leaves first, then take Seedling, then Caterpillar.',
        isCorrect: false,
        feedback:
          'When you leave Caterpillar and Seedling alone on the bank, they interfere with each other before you return.',
      },
    ],
    compliment:
      '🌟 Outstanding deduction! You broke down the multi-trip constraint bottleneck with algorithmic poise.',
    stemMajorFit: 'Data Science, Algorithm Engineering & Discrete Math (ITC)',
  },
  {
    id: 'logic-2',
    title: 'The Smart Microgrid Switch',
    category: 'circuits',
    categoryLabel: 'Hardware & Systems',
    themeColor: 'from-amber-600 to-orange-700',
    difficulty: 'Mind Bender',
    durationMinutes: 3,
    headline: 'Route solar energy to the emergency backup lab before storm hits.',
    scenario:
      'A solar microgrid has three input sensors: Solar Irradiance (A), Battery Reserve (B), and Wind Generator (C). The emergency lab activates when: (A AND B) OR (NOT C). Currently, Solar Irradiance is ON (1), Battery Reserve is ON (1), and Wind Generator is OFF (0). Which gate combination ensures uninterrupted hospital power?',
    visualHelper: {
      items: ['☀️ Sensor A: 1 (Active)', '🔋 Sensor B: 1 (Charged)', '💨 Sensor C: 0 (Idle)'],
      rule: 'Formula: Output = (A AND B) OR (NOT C)',
    },
    options: [
      {
        id: 'c-opt-1',
        text: 'Both conditions evaluate to TRUE (1 OR 1 = 1), so the circuit conducts smoothly with redundancy.',
        isCorrect: true,
        feedback:
          'Spot on! Since A AND B = 1, and NOT C = NOT 0 = 1, the OR gate receives dual 1s and outputs power.',
      },
      {
        id: 'c-opt-2',
        text: 'The circuit fails because Wind Generator C is zero.',
        isCorrect: false,
        feedback:
          'Remember NOT C! NOT 0 inverts into 1, so the right branch actually provides power regardless.',
      },
    ],
    compliment:
      '⚡ Superb electrical logic! You visualized boolean circuits and state inversion seamlessly.',
    stemMajorFit: 'Computer Engineering & Embedded Robotics (CADT / ITC)',
  },
  {
    id: 'logic-3',
    title: 'The Sensor Anomaly Filter',
    category: 'data',
    categoryLabel: 'Data & Patterns',
    themeColor: 'from-emerald-600 to-teal-700',
    difficulty: 'Analytical',
    durationMinutes: 2,
    headline: 'Detect the corrupted transmission in a satellite telemetry array.',
    scenario:
      'A Mekong hydrology satellite transmits river water levels sampled every 15 minutes: [2.1m, 2.3m, 2.2m, 9.8m, 2.4m, 2.5m]. The AI predictive filter must identify which reading is an electrical artifact spike rather than real monsoon surge.',
    visualHelper: {
      items: ['Time 00: 2.1m', 'Time 15: 2.3m', 'Time 30: 2.2m', 'Time 45: 9.8m', 'Time 60: 2.4m'],
      rule: 'Water level rate-of-change cannot physically exceed 0.5m in a 15-minute window without extreme seismic events.',
    },
    options: [
      {
        id: 'd-opt-1',
        text: '9.8m at Time 45 is an outlier noise spike (>4x variance with instantaneous reversion to 2.4m).',
        isCorrect: true,
        feedback:
          'Sharp eye! Real physical changes follow continuous gradients; instantaneous single-frame jumps indicate sensor jitter.',
      },
      {
        id: 'd-opt-2',
        text: '2.1m is the outlier because it is the lowest value recorded.',
        isCorrect: false,
        feedback: '2.1m is within normal standard deviation of 2.3m and 2.2m.',
      },
    ],
    compliment:
      '📊 Exceptional analytical intuition! You demonstrated noise-rejection techniques used by real machine learning engineers.',
    stemMajorFit: 'Data Analytics, Machine Learning & Environmental Tech',
  },
];

export const STEMDiscoveryView: React.FC<STEMDiscoveryViewProps> = ({
  studentName = 'Student',
  onNavigateTab,
  onBack,
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(stemChallenges[0]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [solvedChallenges, setSolvedChallenges] = useState<string[]>([]);

  const handleSelectOption = (optId: string) => {
    if (submitted) return;
    setSelectedOptionId(optId);
  };

  const handleSubmit = () => {
    if (!selectedOptionId) return;
    setSubmitted(true);
    const opt = selectedChallenge.options.find((o) => o.id === selectedOptionId);
    if (opt?.isCorrect && !solvedChallenges.includes(selectedChallenge.id)) {
      setSolvedChallenges((prev) => [...prev, selectedChallenge.id]);
    }
  };

  const handleReset = () => {
    setSelectedOptionId(null);
    setSubmitted(false);
  };

  const handleSwitchChallenge = (ch: Challenge) => {
    setSelectedChallenge(ch);
    setSelectedOptionId(null);
    setSubmitted(false);
  };

  const currentOption = selectedChallenge.options.find((o) => o.id === selectedOptionId);
  const isCorrect = currentOption?.isCorrect ?? false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in-50 duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xs">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  STEM Discovery Lab
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  Interactive Quests
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Discover your natural STEM superpowers through quick, engaging problem-solving quests.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('dashboard')}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Hero Overview Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Self-Discovery Gaming</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            No Test Stress. Just Pure Analytical Fun.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Solve real-world engineering puzzles, logical deduction dilemmas, and data riddles. Our engine analyzes your problem-solving approaches to reveal your best university major matches.
          </p>

          <div className="flex items-center space-x-3 pt-2">
            <div className="flex items-center space-x-1.5 text-xs text-amber-300 font-semibold bg-white/10 px-3 py-1.5 rounded-xl">
              <Award className="w-4 h-4" />
              <span>{solvedChallenges.length} of {stemChallenges.length} Quests Solved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stemChallenges.map((ch) => {
          const isSelected = ch.id === selectedChallenge.id;
          const isSolved = solvedChallenges.includes(ch.id);
          return (
            <button
              key={ch.id}
              onClick={() => handleSwitchChallenge(ch)}
              className={`p-4 rounded-2xl border text-left transition flex items-start justify-between ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {ch.categoryLabel}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    ⏱ {ch.durationMinutes} min
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{ch.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{ch.headline}</p>
              </div>

              {isSolved && (
                <div className="shrink-0 ml-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Quest Arena */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-5 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600">
            <Brain className="w-4 h-4" />
            <span>Active Scenario: {selectedChallenge.categoryLabel}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {selectedChallenge.title}
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {selectedChallenge.scenario}
          </p>
        </div>

        {/* Visual Helper Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Puzzle State & Constraints:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedChallenge.visualHelper.items.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-600 italic">
            {selectedChallenge.visualHelper.rule}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Choose your action sequence:
          </div>
          {selectedChallenge.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let optStyle = 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50';

            if (submitted) {
              if (opt.isCorrect) {
                optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
              } else if (isSelected && !opt.isCorrect) {
                optStyle = 'border-rose-400 bg-rose-50 text-rose-950';
              } else {
                optStyle = 'border-slate-200 opacity-60';
              }
            } else if (isSelected) {
              optStyle = 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600/30 text-blue-950 font-semibold';
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={submitted}
                className={`w-full p-4 rounded-2xl border text-left transition flex items-start space-x-3 text-xs sm:text-sm ${optStyle}`}
              >
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <div className="flex-1 leading-relaxed">{opt.text}</div>
              </button>
            );
          })}
        </div>

        {/* Action button */}
        {!submitted ? (
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!selectedOptionId}
              className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition shadow-xs ${
                selectedOptionId
                  ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Submit Solution</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in-50">
            <div
              className={`p-4 rounded-2xl border space-y-2 ${
                isCorrect
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Solution Verified!</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Good Attempt! Review the feedback below:</span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">{currentOption?.feedback}</p>
              {isCorrect && (
                <div className="mt-2 pt-2 border-t border-emerald-200 text-xs font-semibold text-emerald-800">
                  {selectedChallenge.compliment}
                </div>
              )}
            </div>

            {/* University Major Recommendation Fit */}
            {isCorrect && (
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-1">
                <span className="font-bold block text-blue-800">
                  🎯 Top Major Synergy:
                </span>
                <p>{selectedChallenge.stemMajorFit}</p>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateTab('opportunities')}
                    className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center space-x-1"
                  >
                    <span>View Curriculum & Roadmaps for this major</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center space-x-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Scenario Again</span>
              </button>

              <button
                onClick={() => {
                  const currentIndex = stemChallenges.findIndex((c) => c.id === selectedChallenge.id);
                  const nextIndex = (currentIndex + 1) % stemChallenges.length;
                  handleSwitchChallenge(stemChallenges[nextIndex]);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center space-x-1.5 transition"
              >
                <span>Next Quest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
