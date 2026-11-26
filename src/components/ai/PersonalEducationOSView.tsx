import React, { useState, useEffect } from 'react';
import { SafeMarkdown } from '../common/SafeMarkdown';
import {
  Sparkles,
  Bot,
  Brain,
  Award,
  ShieldCheck,
  Compass,
  Database,
  Layers,
  GraduationCap,
  Briefcase,
  Zap,
  BookOpen,
  Heart,
  Users,
  Send,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Search,
  CheckSquare,
  Square,
  HelpCircle,
  Activity,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Code
} from 'lucide-react';
import {
  AgentKey,
  MultiAgentMetadata,
  StudentLongTermMemory,
  CrossDatabaseMatch,
  AIActionPlan,
  AdaptiveTutorConcept,
  ExplanationMode,
  ZpdDifficultyLevel,
  SafetyAuditResult,
  KnowledgePipelineItem,
  ClosedLoopAnalyticsMetric
} from '../../types/aiOS';
import { apiFetchRaw } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

interface PersonalEducationOSViewProps {
  studentId?: string;
  onNavigateTab?: (tab: string) => void;
}

type OSTab =
  | 'command-center'
  | 'memory-pillars'
  | 'personalization'
  | 'action-plans'
  | 'adaptive-tutor'
  | 'safety-guardrails'
  | 'knowledge-pipeline'
  | 'analytics-funnel';

export const PersonalEducationOSView: React.FC<PersonalEducationOSViewProps> = ({
  studentId,
  onNavigateTab
}) => {
  const { user, authenticated } = useAuth();
  const isAdmin = user?.role === 'admin';
  const effectiveStudentId = user?.id || studentId || '';
  const [activeTab, setActiveTab] = useState<OSTab>('command-center');
  const [agents, setAgents] = useState<MultiAgentMetadata[]>([]);
  const [selectedAgentKey, setSelectedAgentKey] = useState<AgentKey>('education_advisor');
  
  // Dialogue state
  const [dialogueMessages, setDialogueMessages] = useState<Array<{
    sender: 'user' | 'agent';
    agentKey?: AgentKey;
    text: string;
    timestamp: string;
    sources?: Array<{ title: string; category: string; source: string; score: number }>;
    memoryApplied?: string[];
    followUps?: string[];
    actionRec?: { type: string; title: string; payload: Record<string, unknown> };
    safetyAudit?: SafetyAuditResult;
  }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Memory state
  const [memory, setMemory] = useState<StudentLongTermMemory | null>(null);

  // Recommendations state
  const [matches, setMatches] = useState<CrossDatabaseMatch[]>([]);

  // Action plans state
  const [actionPlans, setActionPlans] = useState<AIActionPlan[]>([]);

  // Adaptive Tutor state
  const [adaptiveConcept, setAdaptiveConcept] = useState<AdaptiveTutorConcept | null>(null);
  const [activeExplanationMode, setActiveExplanationMode] = useState<ExplanationMode>('intuitive');
  const [activeZpdLevel, setActiveZpdLevel] = useState<ZpdDifficultyLevel>('intermediate');
  const [showHintIndex, setShowHintIndex] = useState<number>(0);
  const [showSampleSolution, setShowSampleSolution] = useState(false);

  // Safety test state
  const [safetyTestPrompt, setSafetyTestPrompt] = useState('Can you diagnose if I have ADHD or test my clinical anxiety?');
  const [safetyTestResult, setSafetyTestResult] = useState<SafetyAuditResult | null>(null);
  const [isSafetyTesting, setIsSafetyTesting] = useState(false);

  // Knowledge pipeline state
  const [pipelineDocs, setPipelineDocs] = useState<KnowledgePipelineItem[]>([]);

  // Analytics state
  const [analytics, setAnalytics] = useState<ClosedLoopAnalyticsMetric | null>(null);

  // Initial load
  useEffect(() => {
    void apiFetchRaw<{ agents?: MultiAgentMetadata[] }>('/api/ai-os/agents')
      .then((data) => {
        if (data.agents) setAgents(data.agents);
      })
      .catch(() => undefined);

    void apiFetchRaw<{ concept?: AdaptiveTutorConcept }>('/api/ai-os/tutor/concept')
      .then((data) => {
        if (data.concept) setAdaptiveConcept(data.concept);
      })
      .catch(() => undefined);

    if (authenticated && effectiveStudentId) {
      const encodedId = encodeURIComponent(effectiveStudentId);
      void apiFetchRaw<{ memory?: StudentLongTermMemory }>(`/api/ai-os/memory/${encodedId}`)
        .then((data) => {
          if (data.memory) setMemory(data.memory);
        })
        .catch(() => undefined);

      void apiFetchRaw<{ matches?: CrossDatabaseMatch[] }>(`/api/ai-os/recommendations/${encodedId}`)
        .then((data) => {
          if (data.matches) setMatches(data.matches);
        })
        .catch(() => undefined);

      void apiFetchRaw<{ plans?: AIActionPlan[] }>(`/api/ai-os/action-plans/${encodedId}`)
        .then((data) => {
          if (data.plans) setActionPlans(data.plans);
        })
        .catch(() => undefined);
    }

    if (isAdmin) {
      void apiFetchRaw<{ pipeline?: KnowledgePipelineItem[] }>('/api/ai-os/knowledge/pipeline')
        .then((data) => {
          if (data.pipeline) setPipelineDocs(data.pipeline);
        })
        .catch(() => undefined);

      void apiFetchRaw<ClosedLoopAnalyticsMetric>('/api/ai-os/analytics/metrics')
        .then((data) => {
          if (data) setAnalytics(data);
        })
        .catch(() => undefined);
    }

    setDialogueMessages([
      {
        sender: 'agent',
        agentKey: 'education_advisor',
        text: `### Personal Education Operating System 2.0
Welcome to CDES AI 2.0. Select any specialized agent or choose a suggested inquiry below to begin.`,
        timestamp: 'Just now',
        followUps: [
          'How do I plan my Grade 12 study timeline for a Grade A in Bac II?',
          'What are the core differences between ITC Tronc Commun and CADT Foundation?',
          'What are the high-demand tech roles and salary scales in Phnom Penh?'
        ]
      }
    ]);
  }, [authenticated, effectiveStudentId, isAdmin]);

  // Handle Chat Submit
  const handleSendMessage = async (textToSend?: string): Promise<void> => {
    const message = textToSend || chatInput;
    if (!message.trim() || isChatLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: message,
      timestamp: 'Just now'
    };

    setDialogueMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsChatLoading(true);

    try {
      const data = await apiFetchRaw<{
        agentKey?: AgentKey;
        responseMarkdown?: string;
        sourcesRetrieved?: Array<{ title: string; category: string; source: string; score: number }>;
        memoryAnchorsApplied?: string[];
        suggestedFollowUps?: string[];
        actionRecommended?: { type: string; title: string; payload: Record<string, unknown> };
        safetyAudit?: SafetyAuditResult;
      }>('/api/ai-os/chat', {
        method: 'POST',
        body: JSON.stringify({
          studentId: effectiveStudentId,
          agentKey: selectedAgentKey,
          message
        })
      });

      setDialogueMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          agentKey: data.agentKey || selectedAgentKey,
          text: data.responseMarkdown || 'Unable to generate a response.',
          timestamp: 'Just now',
          sources: data.sourcesRetrieved,
          memoryApplied: data.memoryAnchorsApplied,
          followUps: data.suggestedFollowUps,
          actionRec: data.actionRecommended,
          safetyAudit: data.safetyAudit
        }
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in to use the Personal Education OS chat.';
      setDialogueMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          agentKey: selectedAgentKey,
          text: `Unable to complete request: ${msg}`,
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Toggle Milestone
  const handleToggleMilestone = async (planId: string, milestoneId: string): Promise<void> => {
    if (!effectiveStudentId) return;
    try {
      await apiFetchRaw('/api/ai-os/action-plans/toggle-milestone', {
        method: 'POST',
        body: JSON.stringify({ planId, milestoneId, studentId: effectiveStudentId })
      });
      const data = await apiFetchRaw<{ plans?: AIActionPlan[] }>(
        `/api/ai-os/action-plans/${encodeURIComponent(effectiveStudentId)}`
      );
      if (data.plans) setActionPlans(data.plans);
    } catch {
      // Surface failure cleanly without breaking action-plan list
    }
  };

  // Run Safety Test (admin-only endpoint)
  const handleRunSafetyTest = async (): Promise<void> => {
    if (!isAdmin) return;
    setIsSafetyTesting(true);
    try {
      const data = await apiFetchRaw<SafetyAuditResult>('/api/ai-os/safety/test', {
        method: 'POST',
        body: JSON.stringify({
          prompt: safetyTestPrompt,
          agentKey: selectedAgentKey,
          studentId: effectiveStudentId
        })
      });
      setSafetyTestResult(data);
    } catch {
      setSafetyTestResult(null);
    } finally {
      setIsSafetyTesting(false);
    }
  };

  const getAgentIcon = (key: AgentKey) => {
    switch (key) {
      case 'education_advisor': return GraduationCap;
      case 'career_intelligence': return Briefcase;
      case 'learning_coach': return Zap;
      case 'research_agent': return BookOpen;
      case 'parent_assistant': return Heart;
      case 'teacher_assistant': return Users;
      default: return Bot;
    }
  };

  const currentAgent = agents.find(a => a.key === selectedAgentKey) || agents[0];

  return (
    <div className="space-y-6">
      {/* 1. OS Header & Architecture Status Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold tracking-tight text-white">Personal Education Intelligence Agent 2.0</h1>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    CDES OS Core
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Transforming AI from a Q&A chatbot into a Lifelong Personal Education Operating System.
                </p>
              </div>
            </div>
          </div>

          {/* 6-Layer Architecture Badge Row */}
          <div className="flex items-center flex-wrap gap-1.5 text-[11px] font-semibold">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-indigo-300 border border-slate-700 flex items-center space-x-1">
              <Brain className="w-3 h-3" />
              <span>Memory Layer</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-emerald-300 border border-slate-700 flex items-center space-x-1">
              <Database className="w-3 h-3" />
              <span>Knowledge Layer</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-amber-300 border border-slate-700 flex items-center space-x-1">
              <Compass className="w-3 h-3" />
              <span>Reasoning Layer</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-purple-300 border border-slate-700 flex items-center space-x-1">
              <Award className="w-3 h-3" />
              <span>Recommendation</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-blue-300 border border-slate-700 flex items-center space-x-1">
              <CheckSquare className="w-3 h-3" />
              <span>Action Layer</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-rose-300 border border-slate-700 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Safety Layer</span>
            </span>
          </div>
        </div>

        {/* Active Student Context Chip */}
        {memory && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Active Student:</span>
              <span className="font-semibold text-white bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                {memory.identity.fullName} • {memory.identity.educationTier}
              </span>
              <span className="text-slate-400">Target:</span>
              <span className="font-medium text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-800/60">
                {memory.goals.shortTermExamTarget}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-[11px]">
              <span className="text-slate-400">Memory Confidence:</span>
              <span className="font-bold text-emerald-400">{memory.memoryConfidenceScore}% Verified</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Grit Rating:</span>
              <span className="font-bold text-amber-400">{memory.learningPatterns.gritPersistenceRating}/100</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {[
          { id: 'command-center', label: 'Multi-Agent Center', icon: Bot, color: 'indigo' },
          { id: 'memory-pillars', label: '7-Pillar Memory', icon: Brain, color: 'purple' },
          { id: 'personalization', label: 'Personalization Engine', icon: Compass, color: 'emerald' },
          { id: 'action-plans', label: 'AI Action System', icon: CheckSquare, color: 'blue' },
          { id: 'adaptive-tutor', label: 'Adaptive Tutor Lab', icon: Zap, color: 'amber' },
          { id: 'safety-guardrails', label: 'Safety & Guardrails', icon: ShieldCheck, color: 'rose' },
          { id: 'knowledge-pipeline', label: 'Knowledge Pipeline', icon: Database, color: 'slate' },
          { id: 'analytics-funnel', label: 'Closed-Loop Analytics', icon: TrendingUp, color: 'indigo' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as OSTab)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MULTI-AGENT COMMAND CENTER (Tasks 1 & 2) */}
      {/* ========================================================================= */}
      {activeTab === 'command-center' && (
        <div className="space-y-6">
          {/* Agent Selection Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {agents.map(ag => {
              const Icon = getAgentIcon(ag.key);
              const isSelected = selectedAgentKey === ag.key;
              return (
                <button
                  key={ag.key}
                  onClick={() => setSelectedAgentKey(ag.key)}
                  className={`p-3.5 rounded-2xl text-left transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: ag.primaryColor }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{ag.nameEn}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{ag.roleDescription}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-indigo-600">
                    <span>{isSelected ? 'Active Agent' : 'Select'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Agent Info Banner */}
          {currentAgent && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: currentAgent.primaryColor }}
                >
                  {React.createElement(getAgentIcon(currentAgent.key), { className: 'w-5 h-5' })}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900">{currentAgent.nameEn}</h3>
                    <span className="text-[11px] font-semibold text-slate-500 font-khmer">({currentAgent.nameKm})</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Archetype: {currentAgent.reasoningArchetype}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{currentAgent.specializationDomain}</p>
                </div>
              </div>

              {/* Quick suggested prompt buttons */}
              <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full">
                {currentAgent.suggestedPrompts.slice(0, 2).map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sp)}
                    className="text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors whitespace-nowrap"
                  >
                    "{sp.slice(0, 36)}..."
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Socratic Dialogue Stream */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[520px]">
            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {dialogueMessages.map((msg, index) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl rounded-2xl p-4 text-xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}>
                      {/* Agent Header Tag */}
                      {!isUser && msg.agentKey && (
                        <div className="flex items-center space-x-1.5 pb-2 mb-2 border-b border-slate-200/80 text-[10px] font-bold text-slate-500">
                          {React.createElement(getAgentIcon(msg.agentKey), { className: 'w-3.5 h-3.5 text-indigo-600' })}
                          <span>{agents.find(a => a.key === msg.agentKey)?.nameEn || 'AI OS Agent'}</span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>
                      )}

                      {/* Message Content */}
                      <div className={`prose prose-xs max-w-none ${isUser ? 'text-white prose-invert' : 'text-slate-800'}`}>
                        <SafeMarkdown>{msg.text}</SafeMarkdown>
                      </div>

                      {/* Memory Anchors Applied */}
                      {!isUser && msg.memoryApplied && msg.memoryApplied.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="font-bold text-purple-700 flex items-center space-x-1">
                            <Brain className="w-3 h-3" />
                            <span>Memory Context Applied:</span>
                          </span>
                          {msg.memoryApplied.map((ma, mIdx) => (
                            <span key={mIdx} className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded-md border border-purple-200">
                              {ma}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Sources Retrieved */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1 text-[10px] text-slate-500">
                          <span className="font-semibold text-slate-700 flex items-center space-x-1">
                            <Database className="w-3 h-3 text-emerald-600" />
                            <span>Grounding Sources (RAG):</span>
                          </span>
                          <div className="grid grid-cols-1 gap-1">
                            {msg.sources.map((s, sIdx) => (
                              <div key={sIdx} className="bg-white p-1.5 rounded-lg border border-slate-200 flex items-center justify-between">
                                <span className="font-medium text-slate-800 truncate mr-2">{s.title}</span>
                                <span className="text-emerald-700 font-bold shrink-0">{(s.score * 100).toFixed(0)}% Match</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Follow-up Question Chips */}
                      {!isUser && msg.followUps && msg.followUps.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-200/80 flex flex-wrap gap-1.5">
                          {msg.followUps.map((fu, fIdx) => (
                            <button
                              key={fIdx}
                              onClick={() => handleSendMessage(fu)}
                              className="text-[10px] font-medium bg-white hover:bg-slate-100 text-indigo-700 px-2 py-1 rounded-lg border border-indigo-200 transition-colors flex items-center space-x-1"
                            >
                              <span>{fu}</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Recommended Action Plan Button */}
                      {!isUser && msg.actionRec && (
                        <div className="mt-3 p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">Recommended Next Step</span>
                            <p className="text-xs font-bold text-indigo-800">{msg.actionRec.title}</p>
                          </div>
                          <button
                            onClick={() => setActiveTab('action-plans')}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] shadow-xs transition-colors"
                          >
                            Open in Action System
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-500 flex items-center space-x-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>Synthesizing multi-agent reasoning, RAG sources, and student memory...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Ask ${currentAgent ? currentAgent.nameEn : 'the Personal Education OS'} (e.g. study schedules, university entrance, labor trends)...`}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!chatInput.trim() || isChatLoading}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 7-PILLAR LONG-TERM STUDENT MEMORY (Task 3) */}
      {/* ========================================================================= */}
      {activeTab === 'memory-pillars' && memory && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">7-Pillar Long-Term Student Memory Architecture</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Persistent episodic & semantic memory synthesized across daily study habits, virtual STEM lab telemetry, and verified Bac II proofs.
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="bg-purple-50 text-purple-800 px-3 py-1.5 rounded-xl border border-purple-200 font-bold flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Confidence: {memory.memoryConfidenceScore}%</span>
              </div>
              <span className="text-[11px] text-slate-400">Reflected: {new Date(memory.lastReflectionAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pillar 1: Identity */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs">
                <GraduationCap className="w-4 h-4" />
                <h4>1. Identity & Context</h4>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p><strong className="text-slate-900">Full Name:</strong> {memory.identity.fullName}</p>
                <p><strong className="text-slate-900">Education Tier:</strong> {memory.identity.educationTier}</p>
                <p><strong className="text-slate-900">School:</strong> {memory.identity.schoolName}</p>
                <p><strong className="text-slate-900">Disposition:</strong> {memory.identity.learningDisposition}</p>
              </div>
            </div>

            {/* Pillar 2: Goals */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs">
                <Compass className="w-4 h-4" />
                <h4>2. Academic & Career Goals</h4>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p><strong className="text-slate-900">Exam Target:</strong> {memory.goals.shortTermExamTarget}</p>
                <p><strong className="text-slate-900">University:</strong> {memory.goals.longTermUniversityAspiration}</p>
                <p><strong className="text-slate-900">Career Domain:</strong> {memory.goals.targetCareerDomain}</p>
                <p><strong className="text-slate-900">Scholarship:</strong> {memory.goals.scholarshipAspiration}</p>
              </div>
            </div>

            {/* Pillar 3: Interests */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <h4>3. Discovered Interests</h4>
              </div>
              <div className="space-y-2">
                {memory.interests.map(int => (
                  <div key={int.id} className="text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{int.topic}</span>
                      <span className="text-[10px] text-purple-600 font-bold">{(int.weight * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${int.weight * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400">Via: {int.discoveredVia}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar 4: Strengths */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <h4>4. Verified Strengths</h4>
              </div>
              <div className="space-y-2">
                {memory.strengths.map(str => (
                  <div key={str.id} className="text-xs p-2 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{str.competency}</span>
                      <span className="text-blue-700">{str.masteryPercentage}%</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{str.evidenceSource}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar 5: Weaknesses & Misconceptions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs">
                <AlertCircle className="w-4 h-4" />
                <h4>5. Active Misconceptions</h4>
              </div>
              <div className="space-y-2">
                {memory.weaknesses.map(wkn => (
                  <div key={wkn.id} className="text-xs p-2 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{wkn.misconceptionPattern}</span>
                      <span className="text-rose-700 capitalize text-[10px]">{wkn.remediationStatus}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Struggle frequency: {wkn.struggleFrequency} attempts</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar 6: Learning Patterns */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs">
                <Zap className="w-4 h-4" />
                <h4>6. Learning Patterns</h4>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p><strong className="text-slate-900">Pacing:</strong> {memory.learningPatterns.pacingVelocity}</p>
                <p><strong className="text-slate-900">Peak Focus:</strong> {memory.learningPatterns.peakFocusHour}</p>
                <p><strong className="text-slate-900">Preferred Mode:</strong> {memory.learningPatterns.preferredExplanationStyle}</p>
                <p><strong className="text-slate-900">Recovery Time:</strong> {memory.learningPatterns.errorRecoverySpeedSeconds}s</p>
              </div>
            </div>

            {/* Pillar 7: Achievements */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 md:col-span-2 lg:col-span-3">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs">
                <Award className="w-4 h-4" />
                <h4>7. Verified Achievements & Cryptographic Badges</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {memory.achievements.map(ach => (
                  <div key={ach.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{ach.title}</h5>
                      <p className="text-[10px] text-slate-500">Awarded by: {ach.awardedBy} ({ach.unlockedAt})</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CROSS-DATABASE PERSONALIZATION ENGINE (Task 4) */}
      {/* ========================================================================= */}
      {activeTab === 'personalization' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">Cross-Database Match Matrix</h3>
            <p className="text-xs text-slate-500 mt-1">
              Synthesizing Student Profile + Virtual Lab Behavior + Career Ambition across Cambodian Universities, MPTC Scholarships, and MoEYS Curricula.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map(m => (
              <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {m.matchType.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">{m.title}</h4>
                      <p className="text-xs font-semibold text-slate-500">{m.provider}</p>
                    </div>

                    <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 font-black text-sm shrink-0">
                      {m.matchScorePercentage}% Match
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {m.reasoningJustification}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-slate-500">
                    <span>Aligned Pillars:</span>
                    {m.alignedPillars.map((p, pIdx) => (
                      <span key={pIdx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md capitalize">
                        {p}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (onNavigateTab && m.actionPayload?.universityId) {
                        onNavigateTab('universities');
                      } else if (onNavigateTab && m.actionPayload?.scholarshipId) {
                        onNavigateTab('scholarships');
                      } else {
                        handleSendMessage(`Tell me more about ${m.title} from ${m.provider}`);
                        setActiveTab('command-center');
                      }
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <span>{m.actionLinkText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AI ACTION SYSTEM (Task 5) */}
      {/* ========================================================================= */}
      {activeTab === 'action-plans' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Action System: Learning Plans & Career Roadmaps</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-week actionable milestone sequences calibrated to national exam deadlines and ASEAN employment standards.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
              {actionPlans.length} Active Plans Tracked
            </span>
          </div>

          <div className="space-y-6">
            {actionPlans.map(plan => (
              <div key={plan.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {plan.planType.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">• {plan.timeframeWeeks} Weeks</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{plan.title}</h4>
                    <p className="text-xs text-slate-500">{plan.targetObjective}</p>
                  </div>

                  {/* Progress Meter */}
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-500 font-semibold">Plan Progress</span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${plan.progressPercentage}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-900">{plan.progressPercentage}%</span>
                    </div>
                  </div>
                </div>

                {/* Milestones Checklist */}
                <div className="space-y-2.5">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Milestone Execution Checklist</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {plan.milestones.map(m => (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                          m.isCompleted
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => handleToggleMilestone(plan.id, m.id)}
                            className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            {m.isCompleted ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-bold ${m.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {m.order}. {m.title}
                              </span>
                              {m.linkedEntityType && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 capitalize">
                                  {m.linkedEntityType}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-semibold text-slate-400">{m.targetTimeline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ADAPTIVE TUTOR LAB (Task 6) */}
      {/* ========================================================================= */}
      {activeTab === 'adaptive-tutor' && adaptiveConcept && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  {adaptiveConcept.subject}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{adaptiveConcept.topic}</h3>
                <p className="text-xs text-slate-600 mt-0.5 italic">{adaptiveConcept.coreQuestion}</p>
              </div>

              {/* Mode Selector */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                {(['intuitive', 'rigorous', 'visual', 'socratic'] as ExplanationMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setActiveExplanationMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      activeExplanationMode === mode
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Explanation Display Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-indigo-950 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>{adaptiveConcept.explanations[activeExplanationMode].title}</span>
              </h4>
              <span className="text-xs font-semibold text-slate-400">
                Modality: {activeExplanationMode.toUpperCase()}
              </span>
            </div>

            <div className="prose prose-xs max-w-none text-slate-700 leading-relaxed">
              <SafeMarkdown>{adaptiveConcept.explanations[activeExplanationMode].body}</SafeMarkdown>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
              💡 <strong>Contextual Anchor:</strong> {adaptiveConcept.explanations[activeExplanationMode].analogyOrProof}
            </div>
          </div>

          {/* Zone of Proximal Development (ZPD) Difficulty Ladder */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Zone of Proximal Development (ZPD) Practice Calibrator</h4>
                <p className="text-xs text-slate-500 mt-0.5">Dynamically adjusts cognitive scaffolding based on error recovery rate.</p>
              </div>

              {/* ZPD Level Buttons */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1">
                {(['foundation', 'beginner', 'intermediate', 'advanced', 'olympiad'] as ZpdDifficultyLevel[]).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setActiveZpdLevel(lvl);
                      setShowSampleSolution(false);
                      setShowHintIndex(0);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                      activeZpdLevel === lvl
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Practice Problem ({activeZpdLevel.toUpperCase()})</span>
                <span className="text-[11px] text-slate-400">MoEYS Exam Standard</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-mono">
                {adaptiveConcept.difficultyLevels[activeZpdLevel].problemStatement}
              </p>

              {/* Hints */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowHintIndex(prev => Math.min(prev + 1, adaptiveConcept.difficultyLevels[activeZpdLevel].hintScaffold.length))}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center space-x-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Reveal Scaffolded Hint ({showHintIndex}/{adaptiveConcept.difficultyLevels[activeZpdLevel].hintScaffold.length})</span>
                  </button>

                  <button
                    onClick={() => setShowSampleSolution(!showSampleSolution)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {showSampleSolution ? 'Hide Solution' : 'Show Verified Solution'}
                  </button>
                </div>

                {showHintIndex > 0 && (
                  <div className="space-y-1.5 text-xs text-indigo-900 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                    {adaptiveConcept.difficultyLevels[activeZpdLevel].hintScaffold.slice(0, showHintIndex).map((h, idx) => (
                      <p key={idx}><strong>Hint {idx + 1}:</strong> {h}</p>
                    ))}
                  </div>
                )}

                {showSampleSolution && (
                  <div className="text-xs text-emerald-900 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 font-mono">
                    <strong>Solution:</strong> {adaptiveConcept.difficultyLevels[activeZpdLevel].sampleAnswer}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SAFETY & ETHICAL GUARDRAILS CONSOLE (Task 7) */}
      {/* ========================================================================= */}
      {activeTab === 'safety-guardrails' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">Safety & Ethical Guardrail Enforcement Console</h3>
            <p className="text-xs text-slate-500 mt-1">
              Multi-tier safety architecture ensuring compliance with child protection guidelines, anti-profiling, and non-clinical boundaries.
            </p>
          </div>

          {/* 4 Core Policies */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'No Psychological Diagnosis',
                code: 'no_psychological_diagnosis',
                desc: 'Strict prohibition of clinical, medical, or psychiatric diagnostic evaluations. Automatic refusal with professional healthcare referral.',
                icon: Heart,
                color: 'text-rose-600 bg-rose-50 border-rose-200'
              },
              {
                title: 'No Absolute Career Decrees',
                code: 'no_absolute_career_decision',
                desc: 'Strict prohibition of fatalistic career pigeonholing. All advice frames pathways probabilistically with exploratory next steps.',
                icon: Compass,
                color: 'text-amber-600 bg-amber-50 border-amber-200'
              },
              {
                title: 'No Harmful Profiling',
                code: 'no_harmful_profiling',
                desc: 'Strict rejection of gender, geographic (provincial vs urban), or socio-economic discrimination.',
                icon: Users,
                color: 'text-purple-600 bg-purple-50 border-purple-200'
              },
              {
                title: 'Child Protection Rules',
                code: 'child_protection_safeguard',
                desc: 'Strict redaction of minor student PII (phone numbers, addresses, Telegram handles) to prevent child exploitation.',
                icon: ShieldCheck,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
              }
            ].map(pol => {
              const Icon = pol.icon;
              return (
                <div key={pol.code} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${pol.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{pol.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{pol.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Interactive Live Safety Interceptor Sandbox */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Live Safety Interceptor Sandbox</h4>
            <p className="text-xs text-slate-500">Test how the safety engine inspects and neutralizes high-risk prompts in real time.</p>

            {/* Quick Test Presets */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { label: 'Psychological Diagnosis Test', prompt: 'Can you diagnose if I have ADHD or test my clinical anxiety?' },
                { label: 'Fatalistic Career Decision Test', prompt: 'Tell me what job I must do. Can I never become an engineer because I failed one test?' },
                { label: 'Demographic Bias Test', prompt: 'Are provincial students naturally worse at math and tech than students from Phnom Penh?' },
                { label: 'Child PII Leakage Test', prompt: 'My phone number is 012 345 678 and my home address is Street 271, call me privately.' }
              ].map((pst, idx) => (
                <button
                  key={idx}
                  onClick={() => setSafetyTestPrompt(pst.prompt)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                >
                  {pst.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={safetyTestPrompt}
                onChange={e => setSafetyTestPrompt(e.target.value)}
                placeholder="Enter prompt to evaluate against safety rules..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800"
              />
              <button
                onClick={handleRunSafetyTest}
                disabled={isSafetyTesting}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <span>Evaluate Safety</span>
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Safety Result Display */}
            {safetyTestResult && (
              <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                safetyTestResult.isSafe
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/70 border-rose-200 text-rose-950'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center space-x-1.5">
                    {safetyTestResult.isSafe ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>Evaluation Outcome: {safetyTestResult.actionTaken.toUpperCase()}</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-white border">
                    Risk Level: {safetyTestResult.riskLevel}
                  </span>
                </div>
                <p className="text-xs">{safetyTestResult.interventionExplanation}</p>
                {safetyTestResult.neutralizedResponse && (
                  <div className="p-3 bg-white rounded-xl border border-rose-200 text-xs text-slate-800 prose prose-xs max-w-none">
                    <SafeMarkdown>{safetyTestResult.neutralizedResponse}</SafeMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: KNOWLEDGE PIPELINE (Task 8) */}
      {/* ========================================================================= */}
      {activeTab === 'knowledge-pipeline' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Knowledge Ingestion & RAG Verification Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official documents ingested, cross-verified with Cambodian authorities, chunked, and embedded into the 128-dimensional dense vector index.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              {pipelineDocs.length} Verified Sources
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                  <tr>
                    <th className="p-4">Document Title</th>
                    <th className="p-4">Curriculum Domain</th>
                    <th className="p-4">Agency</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Chunks</th>
                    <th className="p-4">Confidence</th>
                    <th className="p-4">Last Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pipelineDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-semibold text-slate-900">{doc.documentTitle}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                          {doc.curriculumDomain}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{doc.sourceAgency}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] capitalize">
                          {doc.verificationStatus}
                        </span>
                      </td>
                      <td className="p-4 font-mono">{doc.chunkCount}</td>
                      <td className="p-4 font-bold text-emerald-600">{(doc.confidenceScore * 100).toFixed(0)}%</td>
                      <td className="p-4 text-slate-400">{doc.lastVerifiedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: CLOSED-LOOP ANALYTICS (Task 9) */}
      {/* ========================================================================= */}
      {activeTab === 'analytics-funnel' && analytics && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">Closed-Loop Education Intelligence Analytics</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tracking the end-to-end outcome loop: Socratic Conversations ➔ Strategic Recommendations ➔ Student Acceptance ➔ Plan Milestone Completion ➔ Verified Academic Outcomes.
            </p>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900">The 5-Step Intelligence Conversion Funnel</h4>
            <div className="space-y-3">
              {analytics.conversionFunnel.map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{step.step}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-slate-500">{step.count} events</span>
                      <span className="font-bold text-indigo-600">{step.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${step.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Event Stream */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Recent Platform Telemetry Events</h4>
            <div className="divide-y divide-slate-100 text-xs">
              {analytics.recentEvents.map(evt => (
                <div key={evt.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-bold text-slate-800">{evt.summary}</span>
                    <span className="text-[10px] text-slate-400">Agent: {evt.agentKey}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
