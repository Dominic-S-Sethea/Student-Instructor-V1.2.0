import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  Award,
  Sparkles,
  Layers,
  FlaskConical,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import {
  LearningPath,
  LearningPathStep,
  StudentLearningPath,
} from '../../../shared/types/learningTypes';
import { learningClient, RoadmapWithStatus } from '../../services/learningClient';
import { useAuth } from '../../context/AuthContext';

interface LearningPathsViewProps {
  studentId?: string;
  onOpenExperiment?: (id: string) => void;
  onOpenContent?: (id: string) => void;
  onRewardEarned?: (points: number, message: string) => void;
}

export const LearningPathsView: React.FC<LearningPathsViewProps> = ({
  studentId: propStudentId,
  onOpenExperiment,
  onOpenContent,
  onRewardEarned,
}) => {
  const { user } = useAuth();
  const studentId = user?.id || propStudentId || '';
  const [roadmaps, setRoadmaps] = useState<RoadmapWithStatus[]>([]);
  const [expandedPathId, setExpandedPathId] = useState<string | null>('path-ai-engineer');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchRoadmaps = async (): Promise<void> => {
    try {
      setLoading(true);
      setActionError(null);
      const data = await learningClient.getRoadmaps(studentId);
      setRoadmaps(data);
      if (data.length > 0 && !expandedPathId) {
        setExpandedPathId(data[0].id);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to load learning roadmaps.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRoadmaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const handleEnroll = async (pathId: string): Promise<void> => {
    try {
      setActionError(null);
      const res = await learningClient.enrollRoadmap(pathId, studentId);
      if (res) {
        await fetchRoadmaps();
        if (onRewardEarned) {
          onRewardEarned(15, 'Enrolled in new STEM Learning Roadmap!');
        }
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Sign in to enroll in learning roadmaps.');
    }
  };

  const handleAdvanceStep = async (pathId: string, currentStep: number): Promise<void> => {
    try {
      setActionError(null);
      const res = await learningClient.advanceRoadmap(pathId, currentStep, studentId);
      if (res) {
        await fetchRoadmaps();
        if (onRewardEarned) {
          onRewardEarned(35, `Completed stage ${currentStep} of your learning roadmap!`);
        }
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to advance learning step.');
    }
  };

  return (
    <div className="space-y-6">
      {actionError && (
        <div role="alert" className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-xs font-medium text-red-700 dark:text-red-300">
          {actionError}
        </div>
      )}
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-900/40">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-400/30 mb-3 font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Structured STEM Roadmaps • ផែនទីបង្ហាញផ្លូវអប់រំ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Curated Educational & Career Pathways
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Follow rigorous sequential roadmaps from foundational MoEYS STEM competencies to university engineering readiness and emerging Industry 4.0 careers.
          </p>
        </div>
      </div>

      {/* Roadmaps List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="space-y-5">
          {roadmaps.map((path) => {
            const isExpanded = expandedPathId === path.id;
            const isEnrolled = Boolean(path.is_enrolled);
            const progress = path.progress_percentage || 0;
            const currentStepOrder =
              typeof path.current_step_order === 'number'
                ? path.current_step_order
                : typeof path.current_step === 'number'
                  ? path.current_step
                  : path.current_step?.step_order ?? 1;

            return (
              <div
                key={path.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                {/* Pathway Card Header */}
                <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100">
                  <div className="flex items-start space-x-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-xs"
                      style={{ backgroundColor: path.color || '#4f46e5' }}
                    >
                      <Compass className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          {path.target_career}
                        </span>
                        <span className="text-xs text-slate-500 capitalize">
                          {path.difficulty} • {path.estimated_weeks} Weeks
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {path.title}
                      </h3>
                      {path.title_km && (
                        <p className="text-xs text-slate-500 font-medium">{path.title_km}</p>
                      )}
                      <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                        {path.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Progress */}
                  <div className="flex flex-col sm:flex-row items-end md:items-center gap-3 shrink-0 w-full md:w-auto justify-between md:justify-end">
                    {isEnrolled ? (
                      <div className="w-full sm:w-44 text-right">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 font-medium">Progress</span>
                          <span className="text-indigo-700 font-bold">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => void handleEnroll(path.id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        Enroll in Roadmap
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedPathId(isExpanded ? null : path.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Stepper Breakdown */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50/70 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Sequential Milestones & Syllabus Stages</span>
                    </h4>

                    <div className="space-y-3">
                      {(path.steps || []).map((step, idx) => {
                        const isStepDone = isEnrolled && step.step_order < currentStepOrder;
                        const isStepCurrent = isEnrolled && step.step_order === currentStepOrder;
                        const isStepLocked = isEnrolled ? step.step_order > currentStepOrder : idx > 0;

                        return (
                          <div
                            key={step.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isStepCurrent
                                ? 'bg-white border-indigo-400 shadow-xs ring-1 ring-indigo-500/20'
                                : isStepDone
                                ? 'bg-white border-emerald-200'
                                : 'bg-slate-100/70 border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                                  isStepDone
                                    ? 'bg-emerald-600 text-white'
                                    : isStepCurrent
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                {isStepDone ? <CheckCircle2 className="w-4 h-4" /> : step.step_order}
                              </div>

                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                    {step.step_type}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-500">
                                    {step.subject}
                                  </span>
                                </div>
                                <h5 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                                  {step.title}
                                </h5>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                  {step.description}
                                </p>
                              </div>
                            </div>

                            {/* Step Action Button */}
                            <div className="shrink-0 flex items-center space-x-2 justify-end">
                              {isStepCurrent && (
                                <button
                                  onClick={() => handleAdvanceStep(path.id, step.step_order)}
                                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
                                >
                                  <span>Complete Step</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {isStepDone && (
                                <span className="text-xs font-semibold text-emerald-700 flex items-center space-x-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Mastered</span>
                                </span>
                              )}
                              {isStepLocked && (
                                <span className="text-xs text-slate-400 flex items-center space-x-1">
                                  <Lock className="w-3 h-3" />
                                  <span>Locked</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
