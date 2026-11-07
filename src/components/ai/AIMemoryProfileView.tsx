import React, { useState, useEffect } from 'react';
import {
  Brain,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Award,
  TrendingUp,
  Target,
  Compass,
  CheckCircle2,
  Lock,
  HeartHandshake,
  AlertCircle
} from 'lucide-react';
import { ClientStudentInsight } from '../../types';

interface AIMemoryProfileViewProps {
  studentId: string;
}

export const AIMemoryProfileView: React.FC<AIMemoryProfileViewProps> = ({ studentId }) => {
  const [insight, setInsight] = useState<ClientStudentInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const fetchInsight = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ai/student-insight?studentId=${encodeURIComponent(studentId)}`);
      const data = await res.json();
      if (data && data.memory) {
        setInsight(data);
      }
    } catch (err) {
      console.error('Failed to load student insight:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [studentId]);

  const handleSyncMemory = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/ai/memory/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
      const data = await res.json();
      if (data.success) {
        setSyncToast('Student AI Memory successfully re-synthesized from multi-source platform events!');
        fetchInsight();
        setTimeout(() => setSyncToast(null), 3500);
      }
    } catch (err) {
      console.error('Failed to sync memory:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {syncToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncToast}</span>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">Student AI Long-Term Memory & Cognitive State</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Persisted intelligence layer that enables personalized educational counseling without foundation model re-training.
          </p>
        </div>

        <button
          onClick={handleSyncMemory}
          disabled={isSyncing || isLoading}
          className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center space-x-2 transition-colors border border-purple-200 disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync & Re-synthesize Memory</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
          <p className="text-sm">Fetching Student AI Memory synthesize layer...</p>
        </div>
      ) : insight ? (
        <div className="space-y-6">
          {/* Cognitive Performance Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span>Engagement Index</span>
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-stone-900">
                {insight.cognitiveProfile.engagementScore}<span className="text-xs font-normal text-stone-400">/100</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                Active in STEM labs & daily challenges
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span>Cognitive Persistence (Grit)</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-stone-900">
                {insight.cognitiveProfile.persistenceScore}<span className="text-xs font-normal text-stone-400">/100</span>
              </div>
              <p className="text-[11px] text-purple-600 font-medium mt-1">
                High resilience through multi-trial failure
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span>Problem Solving Velocity</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-stone-900">
                {insight.cognitiveProfile.problemSolvingScore}<span className="text-xs font-normal text-stone-400">/100</span>
              </div>
              <p className="text-[11px] text-amber-600 font-medium mt-1">
                Accelerated logic & binary reasoning
              </p>
            </div>
          </div>

          {/* 5 AI Memory Pillars */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>The 5 Synthesized AI Memory Dimensions</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Pillar 1: Learning History */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-indigo-900 block mb-1.5 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                  <span>1. Learning History & Academic Diagnostics</span>
                </span>
                <p className="text-stone-700 leading-relaxed">
                  {insight.memory.learning_summary}
                </p>
              </div>

              {/* Pillar 2: Interests */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-purple-900 block mb-1.5 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                  <span>2. Curiosity Vectors & Technical Interests</span>
                </span>
                <p className="text-stone-700 leading-relaxed">
                  {insight.memory.interest_summary}
                </p>
              </div>

              {/* Pillar 3: Career Goals */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-blue-900 block mb-1.5 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  <span>3. Career Aspirations & Target Institutions</span>
                </span>
                <p className="text-stone-700 leading-relaxed">
                  {insight.memory.career_summary}
                </p>
              </div>

              {/* Pillar 4: Behavior Patterns */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-amber-900 block mb-1.5 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
                  <span>4. Behavioral Patterns & Grit Index</span>
                </span>
                <p className="text-stone-700 leading-relaxed">
                  {insight.memory.behavior_summary}
                </p>
              </div>

              {/* Pillar 5: Conversation Summary */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 md:col-span-2">
                <span className="font-bold text-stone-900 block mb-1.5 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  <span>5. Accumulated Dialogue & Counseling Themes</span>
                </span>
                <p className="text-stone-700 leading-relaxed">
                  {insight.memory.conversation_summary}
                </p>
              </div>
            </div>
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Strengths</span>
              </h4>
              <ul className="space-y-2 text-xs text-stone-700">
                {insight.keyStrengths.map((str, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span>Reinforcement & Growth Areas</span>
              </h4>
              <ul className="space-y-2 text-xs text-stone-700">
                {insight.growthAreas.map((gro, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{gro}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Safety Safeguards Banner (Task 6) */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center space-x-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h4 className="font-bold text-emerald-950 text-sm">
                CDES Pedagogical Safety & Minor Protection Framework
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
              <div className="p-3 bg-white rounded-xl border border-emerald-200/80">
                <div className="font-bold text-emerald-900 flex items-center space-x-1.5 mb-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Minor Privacy Shield</span>
                </div>
                <p className="text-stone-600">
                  Phone numbers, emails, and student PII are masked by default across all AI exchanges.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200/80">
                <div className="font-bold text-emerald-900 flex items-center space-x-1.5 mb-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero Clinical Diagnosis</span>
                </div>
                <p className="text-stone-600">
                  Strictly prohibits psychiatric labeling. Automatically redirects to counselors and supportive stress management.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200/80">
                <div className="font-bold text-emerald-900 flex items-center space-x-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Growth Mindset Language</span>
                </div>
                <p className="text-stone-600">
                  Filters permanent negative labels like "bad at math"; emphasizes procedural effort and incremental mastery.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200/80">
                <div className="font-bold text-emerald-900 flex items-center space-x-1.5 mb-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Non-Coercive Agency</span>
                </div>
                <p className="text-stone-600">
                  Replaces coercive commands with structured options, reflection questions, and autonomous student choice.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
