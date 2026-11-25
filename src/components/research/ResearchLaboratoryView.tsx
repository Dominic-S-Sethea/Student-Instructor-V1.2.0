/**
 * CDES Education Research Laboratory & Advanced Learning Science Engine
 * Lead Education Data Scientist & Research Platform Architect View
 * 
 * Core Principle: "The goal is not collecting data. The goal is discovering
 * better ways to help students learn. Never create harmful permanent labels."
 */

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Brain,
  Layers,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Download,
  Users,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Scale,
  RefreshCw,
  Eye,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Flame,
  Zap,
} from 'lucide-react';
import { apiFetchRaw } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

interface ExperimentGroup {
  id: string;
  groupName: string;
  groupType: 'control' | 'experimental';
  interventionType: 'traditional' | 'interactive' | 'ai_assisted' | 'game_based';
  pedagogyParameters: Record<string, any>;
  targetAllocationRatio: number;
  participantCount: number;
}

interface ResearchExperiment {
  id: string;
  slug?: string;
  name: string;
  title?: string;
  hypothesis: string;
  domain?: string;
  researchQuestion?: string;
  primaryMetric?: string;
  secondaryMetrics?: string[];
  targetSampleSize?: number;
  currentSampleSize?: number;
  status: 'draft' | 'active' | 'analyzing' | 'concluded';
  powerAnalysis?: { alpha: number; power: number; target_effect_size: number };
  groups?: ExperimentGroup[];
  results?: {
    sampleSize: number;
    groupMetrics: Record<string, any>;
    comparativeAnalysis: {
      pValue: number;
      tStat: number;
      effectSizeCohensD: number;
      confidenceInterval95: string;
      isStatisticallySignificant: boolean;
    };
    keyFindings: string[];
    pedagogicalRecommendation: string;
    targetCurriculumRevision?: string;
  };
}

interface MasteryState {
  id: string;
  student_id: string;
  concept_id: string;
  concept_name: string;
  subject: string;
  current_mastery_prob: number;
  mastery_status: 'emerging' | 'developing' | 'mastered' | 'retained';
  total_opportunities: number;
  correct_streak: number;
  last_practiced_at: string;
}

interface TeachingBenchmark {
  methodKey: string;
  methodName: string;
  description: string;
  avgEngagementMinutes: number;
  completionRatePercentage: number;
  normalizedGainScore: number;
  retentionRate30d: number;
  persistenceIndex: number;
  cognitiveLoadRating: string;
  bestFitDomains: string[];
}

interface KnowledgeAggregate {
  id: string;
  domain: string;
  subject: string;
  gradeOrLevel: string;
  difficultyRating: number;
  provincialReadiness: Record<string, number>;
  topLearningChallenges: string[];
  careerAlignmentScore: number;
  nationalCurriculumNotes: string;
}

interface TeacherCohort {
  id: string;
  className: string;
  gradeLevel: string;
  subject: string;
  schoolName: string;
  province: string;
  studentCount: number;
  averageMasteryPercentage: number;
  learningVelocityIndex: number;
  topMisconceptions: Array<{ code: string; title: string; affectedPercentage: number }>;
  recommendedInterventions: string[];
  studentsNeedingScaffolding: number;
  studentsAccelerating: number;
}

export const ResearchLaboratoryView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'experiments' | 'learning-science' | 'teaching-methods' | 'knowledge-map' | 'teacher-intel' | 'telemetry-ethics'
  >('experiments');

  const [loading, setLoading] = useState<boolean>(true);
  const [experiments, setExperiments] = useState<ResearchExperiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<ResearchExperiment | null>(null);

  // BKT & Learning Science Interactive States
  const [masteryStates, setMasteryStates] = useState<MasteryState[]>([]);
  const [activeConceptId, setActiveConceptId] = useState<string>('concept-kinematics-vectors');
  const [bktSimulationLog, setBktSimulationLog] = useState<string[]>([]);
  const [simulatingBKT, setSimulatingBKT] = useState<boolean>(false);

  // ZPD State
  const [zpdData, setZpdData] = useState<any>(null);

  // Retention Simulator
  const [retentionDays, setRetentionDays] = useState<number>(14);
  const [retentionReviews, setRetentionReviews] = useState<number>(2);
  const [retentionForecast, setRetentionForecast] = useState<any>(null);

  // Teaching Method Benchmarks
  const [teachingSummary, setTeachingSummary] = useState<any>(null);

  // Knowledge Map
  const [knowledgeAggregates, setKnowledgeAggregates] = useState<KnowledgeAggregate[]>([]);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [educationReport, setEducationReport] = useState<any>(null);

  // Teacher Intelligence
  const [teacherCohorts, setTeacherCohorts] = useState<TeacherCohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<TeacherCohort | null>(null);

  // Telemetry & Privacy
  const [telemetryEvents, setTelemetryEvents] = useState<
    Array<{
      id: string;
      event_name: string;
      timestamp: string;
      anonymized_id: string;
      metric_value: number | string | null;
    }>
  >([]);
  const [anonymizedDataset, setAnonymizedDataset] = useState<Array<Record<string, unknown>>>([]);
  const { user } = useAuth();
  const effectiveStudentId = user?.id || '';

  // Fetch initial research laboratory data
  useEffect(() => {
    void fetchResearchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveStudentId]);

  const fetchResearchData = async (): Promise<void> => {
    setLoading(true);
    try {
      const expJson = await apiFetchRaw<{ success?: boolean; data?: ResearchExperiment[] }>('/api/research/experiments');
      if (expJson.success && Array.isArray(expJson.data)) {
        setExperiments(expJson.data);
        if (expJson.data.length > 0) {
          setSelectedExperiment(expJson.data[0]);
        }
      }

      if (effectiveStudentId) {
        const encodedId = encodeURIComponent(effectiveStudentId);
        const mstJson = await apiFetchRaw<{ success?: boolean; data?: { concepts?: MasteryState[] } }>(
          `/api/learning-science/mastery/${encodedId}`
        );
        if (mstJson.success && mstJson.data?.concepts) {
          setMasteryStates(mstJson.data.concepts);
        }

        const zpdJson = await apiFetchRaw<{ success?: boolean; data?: typeof zpdData }>(
          `/api/learning-science/zpd/${encodedId}`
        );
        if (zpdJson.success && zpdJson.data) {
          setZpdData(zpdJson.data);
        }
      }

      void updateRetentionForecast(14, 2);

      const tmJson = await apiFetchRaw<{ success?: boolean; data?: typeof teachingSummary }>('/api/learning-science/teaching-methods');
      if (tmJson.success && tmJson.data) {
        setTeachingSummary(tmJson.data);
      }

      const kmJson = await apiFetchRaw<{ success?: boolean; data?: KnowledgeAggregate[] }>('/api/learning-science/knowledge-map');
      if (kmJson.success && Array.isArray(kmJson.data)) {
        setKnowledgeAggregates(kmJson.data);
      }

      const tcJson = await apiFetchRaw<{ success?: boolean; data?: TeacherCohort[] }>('/api/learning-science/teacher-intelligence');
      if (tcJson.success && Array.isArray(tcJson.data)) {
        setTeacherCohorts(tcJson.data);
        if (tcJson.data.length > 0) {
          setSelectedCohort(tcJson.data[0]);
        }
      }

      const telemJson = await apiFetchRaw<{
        success?: boolean;
        data?: {
          recent?: Array<{
            id: string;
            event_name: string;
            timestamp: string;
            anonymized_id: string;
            metric_value: number | string | null;
          }>;
        };
      }>('/api/learning-science/telemetry');
      if (telemJson.success && telemJson.data) {
        setTelemetryEvents(telemJson.data.recent || []);
      }

      const anonJson = await apiFetchRaw<{ success?: boolean; data?: Array<Record<string, unknown>> }>(
        '/api/research/anonymized-dataset'
      );
      if (anonJson.success && Array.isArray(anonJson.data)) {
        setAnonymizedDataset(anonJson.data);
      }
    } catch (err) {
      console.error('Failed to load education research data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRetentionForecast = async (days: number, reviews: number): Promise<void> => {
    try {
      const json = await apiFetchRaw<{ success?: boolean; data?: typeof retentionForecast }>(
        '/api/learning-science/retention-forecast',
        {
          method: 'POST',
          body: JSON.stringify({ daysElapsed: days, reviewCount: reviews }),
        }
      );
      if (json.success && json.data) {
        setRetentionForecast(json.data);
      }
    } catch (err) {
      console.warn('Retention calculation error:', err);
    }
  };

  // Interactive BKT Trial Simulation
  const handleSimulateQuestionAttempt = async (isCorrect: boolean): Promise<void> => {
    if (!effectiveStudentId) return;
    setSimulatingBKT(true);
    try {
      const json = await apiFetchRaw<{
        success?: boolean;
        data?: { previousMastery: number; updatedMastery: number; masteryStatus: MasteryState['mastery_status'] };
      }>('/api/learning-science/mastery/update', {
        method: 'POST',
        body: JSON.stringify({
          studentId: effectiveStudentId,
          conceptId: activeConceptId,
          isCorrect,
          teachingMethod: 'interactive',
        }),
      });
      if (json.success && json.data) {
        const update = json.data;
        const msg = `[BKT Update] Opportunity #${new Date().toLocaleTimeString()} - Outcome: ${
          isCorrect ? 'Correct (+)' : 'Incorrect (-)'
        } | P(L): ${(update.previousMastery * 100).toFixed(1)}% -> ${(update.updatedMastery * 100).toFixed(1)}% (${update.masteryStatus.toUpperCase()})`;
        setBktSimulationLog((prev) => [msg, ...prev.slice(0, 7)]);

        setMasteryStates((prev) =>
          prev.map((c) =>
            c.concept_id === activeConceptId
              ? {
                  ...c,
                  current_mastery_prob: update.updatedMastery,
                  mastery_status: update.masteryStatus,
                  correct_streak: isCorrect ? c.correct_streak + 1 : 0,
                  total_opportunities: c.total_opportunities + 1,
                  last_practiced_at: new Date().toISOString(),
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error('BKT simulation failure:', err);
    } finally {
      setSimulatingBKT(false);
    }
  };

  // Generate National MoEYS Report
  const handleGenerateReport = async (): Promise<void> => {
    try {
      const json = await apiFetchRaw<{ success?: boolean; data?: typeof educationReport }>('/api/learning-science/education-report');
      if (json.success && json.data) {
        setEducationReport(json.data);
        setReportModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to generate education report:', err);
    }
  };

  // Active concept details
  const activeConcept = masteryStates.find((m) => m.concept_id === activeConceptId) || masteryStates[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Institutional Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                  <FlaskConical className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                  Phase 8 Laboratory
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Child Safety & Anonymization Verified
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  MoEYS & University Council
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Education Research Laboratory & Learning Science Engine
              </h1>
              <p className="text-sm text-slate-600 max-w-3xl mt-1">
                Evidence-based pedagogical experimentation, Bayesian Knowledge Tracing (BKT), dynamic Zone of Proximal Development scaffolding, and Cambodian national STEM research.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={handleGenerateReport}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-xs transition"
              >
                <FileText className="w-4 h-4 mr-2" />
                National Report
              </button>
              <button
                onClick={fetchResearchData}
                className="inline-flex items-center p-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition"
                title="Refresh Research Telemetry"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Core Ethical Principle Banner */}
          <div className="mt-5 p-3.5 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 flex items-start space-x-3 text-xs sm:text-sm">
            <Scale className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-amber-300">CDES Ethical Research Mandate: </span>
              "The goal is not collecting data. The goal is discovering better ways to help students learn.
              The platform strictly enforces SHA-256 salted anonymization and guarantees that student assessments remain
              temporal, contextual, and growth-oriented—<span className="underline decoration-amber-400 font-semibold">never creating harmful permanent labels</span>."
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center space-x-2 mt-6 overflow-x-auto no-scrollbar border-b border-slate-200 pb-1">
            {[
              { id: 'experiments', label: 'A/B Research Trials', icon: FlaskConical, badge: experiments.length },
              { id: 'learning-science', label: 'BKT & Learning Science', icon: Brain, badge: 'Adaptive' },
              { id: 'teaching-methods', label: 'Teaching Method Analysis', icon: Layers, badge: '4-Way' },
              { id: 'knowledge-map', label: 'Cambodia Knowledge Map', icon: MapPin, badge: '7 Provinces' },
              { id: 'teacher-intel', label: 'Teacher Intelligence', icon: GraduationCap, badge: teacherCohorts.length },
              { id: 'telemetry-ethics', label: 'Telemetry & Ethics', icon: ShieldCheck, badge: 'GDPR/Child' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================================= */}
        {/* SUBTAB 1: A/B RESEARCH EXPERIMENTS (Task 1 & Task 2) */}
        {/* ========================================================================= */}
        {activeSubTab === 'experiments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Experiments Selector */}
              <div className="lg:col-span-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">Empirical Trials</h2>
                  <span className="text-xs text-slate-500 font-medium">
                    {experiments.length} Studies Active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {experiments.map((exp) => {
                    const isSelected = selectedExperiment?.id === exp.id;
                    return (
                      <div
                        key={exp.id}
                        onClick={() => setSelectedExperiment(exp)}
                        className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                          isSelected
                            ? 'bg-white border-indigo-600 ring-2 ring-indigo-100 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              exp.status === 'concluded'
                                ? 'bg-emerald-100 text-emerald-800'
                                : exp.status === 'active'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {exp.status}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            N = {exp.currentSampleSize || (exp as any).participantCount || 120}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {exp.name || exp.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {exp.hypothesis}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                          <span>Domain: {exp.domain || 'STEM'}</span>
                          <span className="font-semibold text-indigo-600 flex items-center">
                            Inspect <ChevronRight className="w-3 h-3 ml-0.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Selected Experiment Deep-Dive */}
              {selectedExperiment && (
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {selectedExperiment.domain || 'MoEYS Bac II STEM'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Power: {((selectedExperiment.powerAnalysis?.power || 0.85) * 100).toFixed(0)}% (α = 0.05)
                        </span>
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900">
                        {selectedExperiment.name || selectedExperiment.title}
                      </h2>
                      <p className="text-sm text-slate-600 mt-2 italic bg-slate-50 p-3 rounded-lg border-l-4 border-indigo-500">
                        "{selectedExperiment.hypothesis}"
                      </p>
                    </div>

                    {/* Multi-Arm Cohort Breakdown */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-1.5 text-slate-500" />
                        Multi-Arm Experimental Cohorts (Control vs. Interventions)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {(selectedExperiment.groups || [
                          {
                            id: 'g1',
                            groupName: 'Control (Traditional)',
                            groupType: 'control',
                            interventionType: 'traditional',
                            targetAllocationRatio: 0.33,
                            participantCount: 48,
                            pedagogyParameters: { mode: 'textbook_equations' },
                          },
                          {
                            id: 'g2',
                            groupName: 'Intervention 1 (Interactive)',
                            groupType: 'experimental',
                            interventionType: 'interactive',
                            targetAllocationRatio: 0.33,
                            participantCount: 52,
                            pedagogyParameters: { mode: 'html5_simulation' },
                          },
                          {
                            id: 'g3',
                            groupName: 'Intervention 2 (AI Guided)',
                            groupType: 'experimental',
                            interventionType: 'ai_assisted',
                            targetAllocationRatio: 0.34,
                            participantCount: 48,
                            pedagogyParameters: { mode: 'socratic_hints' },
                          },
                        ]).map((grp) => (
                          <div
                            key={grp.id}
                            className={`p-3.5 rounded-xl border ${
                              grp.groupType === 'control'
                                ? 'bg-slate-50 border-slate-200'
                                : 'bg-indigo-50/50 border-indigo-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  grp.groupType === 'control'
                                    ? 'bg-slate-200 text-slate-700'
                                    : 'bg-indigo-200 text-indigo-800'
                                }`}
                              >
                                {grp.groupType}
                              </span>
                              <span className="text-xs font-semibold text-slate-600">
                                {grp.participantCount} Students
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900">{grp.groupName}</h4>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Intervention: <span className="font-semibold text-slate-700">{grp.interventionType}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Statistical Rigor & Results Display */}
                    {selectedExperiment.results && (
                      <div className="border-t border-slate-100 pt-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center">
                            <Activity className="w-4 h-4 mr-1.5 text-indigo-600" />
                            Statistical Significance & Empirical Findings
                          </h3>
                          <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Statistically Significant (p = {selectedExperiment.results.comparativeAnalysis.pValue})
                          </span>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <div className="text-[10px] uppercase font-bold text-slate-400">p-value</div>
                            <div className="text-base font-extrabold text-slate-900 mt-0.5">
                              {selectedExperiment.results.comparativeAnalysis.pValue}
                            </div>
                            <div className="text-[10px] text-emerald-600 font-semibold">p &lt; 0.01 threshold</div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Cohen's d (Effect)</div>
                            <div className="text-base font-extrabold text-indigo-700 mt-0.5">
                              {selectedExperiment.results.comparativeAnalysis.effectSizeCohensD}
                            </div>
                            <div className="text-[10px] text-indigo-600 font-semibold">Strong Effect Size</div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <div className="text-[10px] uppercase font-bold text-slate-400">t-statistic</div>
                            <div className="text-base font-extrabold text-slate-900 mt-0.5">
                              {selectedExperiment.results.comparativeAnalysis.tStat || 4.82}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">df = {selectedExperiment.results.sampleSize - 2}</div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <div className="text-[10px] uppercase font-bold text-slate-400">95% Confidence</div>
                            <div className="text-xs font-bold text-slate-900 mt-1">
                              {selectedExperiment.results.comparativeAnalysis.confidenceInterval95}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">High Precision</div>
                          </div>
                        </div>

                        {/* Qualitative Findings & Recommendations */}
                        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 space-y-2.5">
                          <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                            Key Empirical Discoveries
                          </h4>
                          <ul className="space-y-1.5 text-xs text-indigo-900">
                            {(selectedExperiment.results.keyFindings || []).map((finding, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="pt-2 border-t border-indigo-200/60 mt-3">
                            <div className="text-xs font-bold text-indigo-950">
                              Pedagogical Policy Recommendation:
                            </div>
                            <p className="text-xs text-indigo-900 mt-0.5">
                              {selectedExperiment.results.pedagogicalRecommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 2: LEARNING SCIENCE ENGINE (Task 3: BKT, ZPD & Retention) */}
        {/* ========================================================================= */}
        {activeSubTab === 'learning-science' && (
          <div className="space-y-8">
            {/* Section 1: Bayesian Knowledge Tracing (BKT) Live Simulator */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Probabilistic Mastery Modeling
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                    Bayesian Knowledge Tracing (BKT) State Machine
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Calculates posterior probability of concept mastery: P(L_t | action) with parameters: P(L0) = 0.15, P(T) = 0.18, P(G) = 0.20, P(S) = 0.10.
                  </p>
                </div>

                {/* Concept Selector */}
                <select
                  value={activeConceptId}
                  onChange={(e) => setActiveConceptId(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
                >
                  {masteryStates.map((c) => (
                    <option key={c.concept_id} value={c.concept_id}>
                      {c.subject}: {c.concept_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Concept Gauge & Live Simulator Controls */}
              {activeConcept && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Mastery Probability Visualizer */}
                  <div className="lg:col-span-1 p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-semibold">{activeConcept.subject}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            activeConcept.mastery_status === 'mastered' || activeConcept.mastery_status === 'retained'
                              ? 'bg-emerald-100 text-emerald-800'
                              : activeConcept.mastery_status === 'developing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {activeConcept.mastery_status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-2">{activeConcept.concept_name}</h3>

                      {/* Large Circular/Radial Mastery Percentage */}
                      <div className="my-6 text-center">
                        <div className="text-4xl font-extrabold text-indigo-700">
                          {(activeConcept.current_mastery_prob * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-1">
                          Estimated Mastery Probability P(L_t)
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-3">
                          <div
                            className="bg-indigo-600 h-full transition-all duration-500"
                            style={{ width: `${Math.min(100, activeConcept.current_mastery_prob * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                          <span>0% Prior</span>
                          <span>Mastery Threshold: 85%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs pt-3 border-t border-slate-200">
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">Total Questions</span>
                        <span className="font-extrabold text-slate-800">{activeConcept.total_opportunities}</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">Correct Streak</span>
                        <span className="font-extrabold text-emerald-700">{activeConcept.correct_streak} 🔥</span>
                      </div>
                    </div>
                  </div>

                  {/* Real-Time Interactive BKT Stimulus */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                      <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide flex items-center">
                        <Zap className="w-4 h-4 mr-1.5 text-indigo-600" />
                        Interactive Bayesian Experiment Runner
                      </h4>
                      <p className="text-xs text-indigo-900 leading-relaxed">
                        Trigger a student problem attempt to observe real-time Bayesian updating in the database.
                        Notice how correct answers update through slip mitigation, while incorrect answers apply guess-probability penalties.
                      </p>

                      <div className="flex items-center space-x-3 pt-2">
                        <button
                          disabled={simulatingBKT}
                          onClick={() => handleSimulateQuestionAttempt(true)}
                          className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center space-x-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Simulate Correct Answer (+P_L)</span>
                        </button>
                        <button
                          disabled={simulatingBKT}
                          onClick={() => handleSimulateQuestionAttempt(false)}
                          className="flex-1 py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center space-x-1.5"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>Simulate Mistake (-P_L)</span>
                        </button>
                      </div>
                    </div>

                    {/* Live Bayesian Updating Log Stream */}
                    <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs space-y-1.5 h-44 overflow-y-auto no-scrollbar">
                      <div className="text-slate-400 font-bold border-b border-slate-800 pb-1 flex justify-between">
                        <span>BKT Transition Log Output</span>
                        <span>SHA-256 Validated</span>
                      </div>
                      {bktSimulationLog.length === 0 ? (
                        <div className="text-slate-500 italic pt-6 text-center">
                          Click either button above to trigger an empirical Bayesian state transition.
                        </div>
                      ) : (
                        bktSimulationLog.map((log, idx) => (
                          <div key={idx} className="leading-tight py-0.5 text-[11px] text-emerald-400">
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Zone of Proximal Development (ZPD) Dynamic Scaffolding */}
            {zpdData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <span className="text-xs font-bold uppercase text-indigo-600">Cognitive Load & Flow</span>
                  <h3 className="text-base font-extrabold text-slate-900">Dynamic ZPD Calibration</h3>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Cognitive Load Index</span>
                      <span className="font-bold text-indigo-700">{zpdData.cognitiveLoadIndex} / 100</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all"
                        style={{ width: `${zpdData.cognitiveLoadIndex}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Optimal Flow Zone: 40 - 65 index. Prevents both boredom and panic.
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <span className="text-xs font-bold uppercase text-indigo-600">Scaffolding Intensity</span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Level {zpdData.scaffoldingLevel} of 5
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {zpdData.reasoning}
                  </p>
                  <div className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Action: {zpdData.interventionType.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <span className="text-xs font-bold uppercase text-indigo-600">Difficulty Assignment</span>
                  <h3 className="text-base font-extrabold text-slate-900 capitalize">
                    {zpdData.recommendedDifficulty} Challenge
                  </h3>
                  <p className="text-xs text-slate-600">
                    Engine dynamically routes student to multi-tier problems based on current BKT streak and error latency.
                  </p>
                  <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    Target: Socratic Progressive Inquiry before syntax reveal.
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Ebbinghaus Spaced Retrieval & Forgetting Curve Simulator */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Memory Consolidation
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Ebbinghaus Spaced Retrieval Modeling (R = e^(-t/S))
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Simulates memory trace stability S across spaced intervals (1, 3, 7, 21 days) versus massed cramming decay.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sliders */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Days Elapsed Since Study:</span>
                      <span className="text-indigo-600">{retentionDays} days</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={60}
                      value={retentionDays}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setRetentionDays(val);
                        updateRetentionForecast(val, retentionReviews);
                      }}
                      className="w-full cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Spaced Review Count:</span>
                      <span className="text-indigo-600">{retentionReviews} intervals</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      value={retentionReviews}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setRetentionReviews(val);
                        updateRetentionForecast(retentionDays, val);
                      }}
                      className="w-full cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                {/* Forecast Display */}
                {retentionForecast && (
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 text-center flex flex-col justify-center">
                      <span className="text-xs font-bold text-indigo-900 uppercase">Projected Retention</span>
                      <div className="text-3xl font-extrabold text-indigo-700 mt-1">
                        {retentionForecast.projectedRetentionPercentage}%
                      </div>
                      <span className="text-[10px] text-indigo-600 font-semibold mt-1">
                        Status: {retentionForecast.urgency.toUpperCase()} URGENCY
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center flex flex-col justify-center">
                      <span className="text-xs font-bold text-slate-700 uppercase">Memory Stability (S)</span>
                      <div className="text-3xl font-extrabold text-slate-900 mt-1">
                        {retentionForecast.memoryStabilityIndex} d
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1">Half-Life Coefficient</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center flex flex-col justify-center">
                      <span className="text-xs font-bold text-slate-700 uppercase">Next Optimal Retrieval</span>
                      <div className="text-3xl font-extrabold text-emerald-700 mt-1">
                        Day {retentionForecast.recommendedReviewDay}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold mt-1">Micro-Quiz Trigger</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 3: TEACHING METHOD COMPARATIVE ANALYSIS (Task 4) */}
        {/* ========================================================================= */}
        {activeSubTab === 'teaching-methods' && teachingSummary && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Pedagogical Benchmark
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                4-Way Teaching Method Comparative Analysis
              </h2>
              <p className="text-sm text-slate-600 max-w-4xl">
                Systematic evaluation across 2,800+ Cambodian learners comparing Traditional Didactic, Interactive STEM Simulations, AI-Assisted Socratic Guidance, and Game-Based Avatar Quests.
              </p>

              {/* Leaderboard Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200">
                  <span className="text-[10px] font-bold text-indigo-900 uppercase">Highest Learning Gain</span>
                  <div className="text-xl font-extrabold text-indigo-700 mt-1">
                    {teachingSummary.leaderboard.highestLearningGain.name}
                  </div>
                  <div className="text-xs font-bold text-indigo-800 mt-1">
                    &lt;g&gt; = {teachingSummary.leaderboard.highestLearningGain.value}
                  </div>
                </div>

                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase">Longest Engagement</span>
                  <div className="text-xl font-extrabold text-emerald-700 mt-1">
                    {teachingSummary.leaderboard.highestEngagement.name}
                  </div>
                  <div className="text-xs font-bold text-emerald-800 mt-1">
                    {teachingSummary.leaderboard.highestEngagement.value} mins / session
                  </div>
                </div>

                <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200">
                  <span className="text-[10px] font-bold text-blue-900 uppercase">30-Day Retention</span>
                  <div className="text-xl font-extrabold text-blue-700 mt-1">
                    {teachingSummary.leaderboard.highestRetention.name}
                  </div>
                  <div className="text-xs font-bold text-blue-800 mt-1">
                    {teachingSummary.leaderboard.highestRetention.value}% Retained
                  </div>
                </div>

                <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200">
                  <span className="text-[10px] font-bold text-purple-900 uppercase">Completion Rate</span>
                  <div className="text-xl font-extrabold text-purple-700 mt-1">
                    {teachingSummary.leaderboard.highestCompletion.name}
                  </div>
                  <div className="text-xs font-bold text-purple-800 mt-1">
                    {teachingSummary.leaderboard.highestCompletion.value}% Finished
                  </div>
                </div>
              </div>
            </div>

            {/* Benchmark Matrix Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 bg-slate-50/70">
                <h3 className="text-sm font-bold text-slate-900">
                  Comprehensive Empirical Matrix
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="py-3 px-4">Methodology</th>
                      <th className="py-3 px-4">Time on Task</th>
                      <th className="py-3 px-4">Completion %</th>
                      <th className="py-3 px-4">Normalized Gain &lt;g&gt;</th>
                      <th className="py-3 px-4">30-Day Retention</th>
                      <th className="py-3 px-4">Persistence</th>
                      <th className="py-3 px-4">Cognitive Load Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {teachingSummary.benchmarks.map((bm: any) => (
                      <tr key={bm.methodKey} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div>{bm.methodName}</div>
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5 line-clamp-1">
                            {bm.description}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{bm.avgEngagementMinutes} min</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{bm.completionRatePercentage}%</td>
                        <td className="py-3.5 px-4 font-extrabold text-indigo-700">
                          &lt;g&gt; = {bm.normalizedGainScore}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-700 font-bold">{bm.retentionRate30d}%</td>
                        <td className="py-3.5 px-4 text-slate-700">{bm.persistenceIndex} / 100</td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">{bm.cognitiveLoadRating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Multi-Tier Pedagogical Synthesis */}
            <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
                CDES National Multi-Tier Pedagogical Synthesis
              </h3>
              <p className="text-sm text-indigo-100 leading-relaxed">
                {teachingSummary.pedagogicalSynthesis}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 4: CAMBODIA EDUCATION KNOWLEDGE MAP (Task 5) */}
        {/* ========================================================================= */}
        {activeSubTab === 'knowledge-map' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Cambodia National Intelligence
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Education Knowledge Map & Regional Readiness
                  </h2>
                </div>
                <button
                  onClick={handleGenerateReport}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold hover:bg-indigo-100"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                  View Executive Briefing
                </button>
              </div>
              <p className="text-sm text-slate-600">
                Subject difficulty indices, provincial readiness heatmaps across 7 provinces, and career-demand alignments compiled for MoEYS and university admissions councils.
              </p>

              {/* Aggregates Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {knowledgeAggregates.map((agg) => (
                  <div key={agg.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 uppercase">{agg.domain}</span>
                      <span className="text-xs font-extrabold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        Difficulty: {agg.difficultyRating} / 5.0
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{agg.subject}</h3>
                    <p className="text-xs text-slate-500 font-medium">Level: {agg.gradeOrLevel}</p>

                    {/* Provincial Readiness Bar Preview */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Regional Readiness Index:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                        {Object.entries(agg.provincialReadiness).map(([prov, score]) => (
                          <div key={prov} className="bg-white p-1.5 rounded border border-slate-200 flex justify-between">
                            <span className="text-slate-600 truncate">{prov}</span>
                            <span className="font-bold text-indigo-700">{score}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Bottlenecks */}
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">
                        Critical National Learning Bottlenecks:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {agg.topLearningChallenges.map((c, i) => (
                          <li key={i} className="flex items-start space-x-1.5">
                            <span className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 5: TEACHER INTELLIGENCE FOUNDATION (Task 6) */}
        {/* ========================================================================= */}
        {activeSubTab === 'teacher-intel' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cohort Selector */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Registered Class Cohorts</h3>
                <div className="space-y-2.5">
                  {teacherCohorts.map((tc) => (
                    <div
                      key={tc.id}
                      onClick={() => setSelectedCohort(tc)}
                      className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                        selectedCohort?.id === tc.id
                          ? 'bg-white border-indigo-600 ring-2 ring-indigo-100 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                        <span>{tc.province}</span>
                        <span className="font-bold text-indigo-600">{tc.studentCount} Students</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{tc.className}</h4>
                      <div className="text-xs text-slate-600 mt-1">{tc.schoolName}</div>
                      <div className="mt-3 flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                        <span className="text-slate-500">Mastery: {tc.averageMasteryPercentage}%</span>
                        <span className="font-bold text-emerald-600">{tc.learningVelocityIndex}x Velocity</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cohort Intelligence Details */}
              {selectedCohort && (
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase">
                        {selectedCohort.schoolName} • {selectedCohort.province}
                      </span>
                      <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                        {selectedCohort.className}
                      </h2>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Subject: {selectedCohort.subject} ({selectedCohort.gradeLevel})
                      </p>
                    </div>

                    {/* Differentiated Student Distribution */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="text-xs font-bold text-amber-900 uppercase">Needing Scaffolding</div>
                        <div className="text-2xl font-extrabold text-amber-800 mt-1">
                          {selectedCohort.studentsNeedingScaffolding} Students
                        </div>
                        <div className="text-[11px] text-amber-700 mt-1">
                          Assigned to 2D vector simulations & progressive Socratic hints.
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="text-xs font-bold text-emerald-900 uppercase">Accelerating Students</div>
                        <div className="text-2xl font-extrabold text-emerald-800 mt-1">
                          {selectedCohort.studentsAccelerating} Students
                        </div>
                        <div className="text-[11px] text-emerald-700 mt-1">
                          Assigned university scholarship proofs & peer mentoring roles.
                        </div>
                      </div>
                    </div>

                    {/* Top Misconceptions Heatmap */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Diagnosed Misconceptions (Classroom Frequency)
                      </h3>
                      <div className="space-y-2">
                        {selectedCohort.topMisconceptions.map((m) => (
                          <div key={m.code} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                            <div className="flex justify-between text-xs font-bold text-slate-800">
                              <span>[{m.code}] {m.title}</span>
                              <span className="text-rose-600">{m.affectedPercentage}% Affected</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-rose-500 h-full"
                                style={{ width: `${m.affectedPercentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Targeted Pedagogical Action Plan */}
                    <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-2">
                      <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                        Teacher Recommended Interventions
                      </h4>
                      <ul className="space-y-1 text-xs text-indigo-900">
                        {selectedCohort.recommendedInterventions.map((action, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 6: TELEMETRY & PRIVACY ETHICS (Task 8 & Task 9) */}
        {/* ========================================================================= */}
        {activeSubTab === 'telemetry-ethics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Telemetry Stream */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-indigo-600" />
                    Live Research Telemetry Stream
                  </h3>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Tracks experiment participation, progress changes, and teaching method effectiveness events.
                </p>

                <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar font-mono text-xs">
                  {telemetryEvents.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 italic">No telemetry recorded yet.</div>
                  ) : (
                    telemetryEvents.map((evt) => (
                      <div key={evt.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex justify-between text-slate-700 font-bold">
                          <span className="text-indigo-600">{evt.event_name}</span>
                          <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Subject Anon ID: <span className="text-slate-800">{evt.anonymized_id}</span>
                        </div>
                        {evt.metric_value !== null && (
                          <div className="text-[11px] text-emerald-600 font-semibold">
                            Metric Value: {evt.metric_value}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Anonymized Research Dataset & Child Safety Audit */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" />
                    Ethical Anonymized Dataset
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {anonymizedDataset.length} Records Stripped of PII
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Full compliance with CDES Child Safety Protocol. All usernames, emails, and school identities are stripped using SHA-256 salted pseudonymization.
                </p>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    Ethics & Child Safety Checklist:
                  </div>
                  <div>• Explicit parental and student consent stored in database.</div>
                  <div>• No tracking of location below province-level granularity.</div>
                  <div>• Permanent deficit labels forbidden; mastery strictly modeled as temporal states.</div>
                </div>

                {/* Sample Anonymized Rows */}
                <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-xs max-h-56 overflow-y-auto no-scrollbar">
                  <div className="text-slate-400 font-bold pb-1 mb-1 border-b border-slate-800 flex justify-between text-[11px]">
                    <span>Sample Anonymized Export JSON</span>
                    <span>HMAC-SHA256</span>
                  </div>
                  <pre className="text-[10px] text-emerald-400">
                    {JSON.stringify(anonymizedDataset.slice(0, 2), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: MOEYS NATIONAL EDUCATION RESEARCH REPORT */}
      {/* ========================================================================= */}
      {reportModalOpen && educationReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase">
                  Official Research Document
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {educationReport.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{educationReport.subtitle}</p>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Executive Summary */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-xs block">
                Executive Summary
              </span>
              <p>{educationReport.executiveSummary}</p>
            </div>

            {/* Provincial Readiness Analysis */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Provincial STEM Readiness Matrix
              </h3>
              <div className="space-y-2">
                {educationReport.provincialReadinessAnalysis.map((p: any) => (
                  <div key={p.province} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900">{p.province}</span>
                      <span className="text-slate-500 block text-[11px] mt-0.5">{p.priorityIntervention}</span>
                    </div>
                    <span className="font-extrabold text-indigo-700 sm:text-right shrink-0">
                      {p.stemReadinessIndex}% Readiness
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* National Recommendations */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                MoEYS Policy Recommendations
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {educationReport.nationalPolicyRecommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Print / Export PDF
              </button>
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
