import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Clock,
  Award,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  X,
  Layers,
  Flame,
} from 'lucide-react';
import { StudentAIEducationProfile } from '../../../server/types/learningTypes';
import { learningClient } from '../../services/learningClient';

interface AIEducationProfileModalProps {
  studentId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectRecommendedAction?: (actionId: string, actionType: string) => void;
}

export const AIEducationProfileModal: React.FC<AIEducationProfileModalProps> = ({
  studentId = 'usr-student-01',
  isOpen,
  onClose,
  onSelectRecommendedAction,
}) => {
  const [profile, setProfile] = useState<StudentAIEducationProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      learningClient
        .getStudentAIProfile(studentId)
        .then((data) => setProfile(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  AI Cognitive Preparation Engine
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                Student Intelligence & Learning Pattern Analytics
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
          {loading || !profile ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : (
            <>
              {/* Top Overview Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[11px] font-medium text-slate-500 block">Avg Accuracy</span>
                  <span className="text-lg sm:text-xl font-bold text-indigo-600 mt-1 block">
                    {profile.overall_progress.average_quiz_score}%
                  </span>
                  <span className="text-[10px] text-slate-400">Diagnostic verified</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[11px] font-medium text-slate-500 block">Grit & Persistence</span>
                  <span className="text-lg sm:text-xl font-bold text-emerald-600 mt-1 block flex items-center space-x-1">
                    <Flame className="w-4 h-4" />
                    <span>{profile.overall_progress.grit_persistence_rating} / 100</span>
                  </span>
                  <span className="text-[10px] text-slate-400">High problem resilience</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[11px] font-medium text-slate-500 block">Virtual Labs</span>
                  <span className="text-lg sm:text-xl font-bold text-purple-600 mt-1 block">
                    {profile.overall_progress.total_experiments_completed} Completed
                  </span>
                  <span className="text-[10px] text-slate-400">Empirical protocols</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[11px] font-medium text-slate-500 block">STEM Activities</span>
                  <span className="text-lg sm:text-xl font-bold text-blue-600 mt-1 block">
                    {profile.overall_progress.total_activities_completed} Mastered
                  </span>
                  <span className="text-[10px] text-slate-400">Puzzles & challenges</span>
                </div>
              </div>

              {/* Recommended Next Action Card */}
              {profile.recommended_next_action && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        AI Recommended Next Step
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {profile.recommended_next_action.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {profile.recommended_next_action.rationale}
                      </p>
                    </div>
                  </div>

                  {onSelectRecommendedAction && (
                    <button
                      onClick={() =>
                        onSelectRecommendedAction(
                          profile.recommended_next_action.id,
                          profile.recommended_next_action.type
                        )
                      }
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center space-x-1"
                    >
                      <span>Launch Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Cognitive Strengths & Remediation Needs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Demonstrated Strengths</span>
                  </h4>
                  <div className="space-y-2">
                    {profile.strengths.map((s, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-100 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{s.subject}</span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            {s.score}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{s.evidence}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remediation Needs */}
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Targeted Remediation Areas</span>
                  </h4>
                  <div className="space-y-2">
                    {profile.weaknesses.map((w, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-amber-100 text-xs">
                        <span className="font-bold text-slate-900 block">{w.subject}</span>
                        <p className="text-[11px] text-slate-600 mt-0.5">{w.remediation_focus}</p>
                        <span className="text-[10px] font-semibold text-amber-700 mt-1 inline-block">
                          Hint Dependency: {w.hint_dependency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interest Affinity Clusters */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Student Interest & Topic Affinity Clusters</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interest_patterns.map((p, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center space-x-2"
                    >
                      <span className="font-medium text-slate-800">{p.category}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          p.affinity_level === 'High'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {p.affinity_level} Affinity
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
