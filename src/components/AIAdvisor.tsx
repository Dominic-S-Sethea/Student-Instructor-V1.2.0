import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  Bot,
  Brain,
  Database,
  Layers,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { ChatMessage, Mentor, StudentProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { guidanceClient } from '../services/guidanceClient';
import { AdvisorMessageBubble } from './ai/AdvisorMessageBubble';
import { AIRecommendationsView } from './ai/AIRecommendationsView';
import { AIKnowledgeSearchView } from './ai/AIKnowledgeSearchView';
import { AIMemoryProfileView } from './ai/AIMemoryProfileView';
import { PersonalEducationOSView } from './ai/PersonalEducationOSView';
import { GrowthMemoryPanel } from './ai/GrowthMemoryPanel';

interface AIAdvisorProps {
  studentProfile: StudentProfile;
  mentors: Mentor[];
  initialPrompt?: string;
  onOpenBooking: (mentor: Mentor) => void;
  onNavigateTab?: (tab: string) => void;
}

type AIAdvisorSubTab = 'chat' | 'growth-memory' | 'recommendations' | 'education-os' | 'knowledge' | 'memory';

const STARTER_CHIPS = [
  'Compare Computer Science at CADT vs ITC',
  'How should I prepare for Bac II to win a scholarship?',
  'Which major fits someone who likes tech and design?',
  'Explain fully funded scholarships open to Cambodian students',
];

export const AIAdvisor: React.FC<AIAdvisorProps> = ({
  studentProfile,
  mentors,
  initialPrompt,
  onOpenBooking,
  onNavigateTab,
}) => {
  const { authenticated, user, profile: authProfile } = useAuth();
  const displayName = authenticated
    ? authProfile?.name || user?.email?.split('@')[0] || 'Scholar'
    : 'there';

  const [activeSubTab, setActiveSubTab] = useState<AIAdvisorSubTab>('chat');
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [advisorMode, setAdvisorMode] = useState<'ready' | 'live' | 'offline'>('ready');
  const [expandedSourcesMsgId, setExpandedSourcesMsgId] = useState<string | null>(null);
  const [input, setInput] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### Welcome to Study Advisor
Hello **${displayName}**! Ask me anything about choosing a major, comparing Cambodian universities (like ITC, CADT, RUPP, or UHS), preparing for Bac II, or planning scholarship applications.

What would you like to figure out today?`,
      timestamp: 'Just now',
      suggestedQuestions: STARTER_CHIPS,
    },
  ]);

  useEffect(() => {
    if (activeSubTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeSubTab]);

  const handleSendMessage = async (textToSend?: string): Promise<void> => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: 'Just now',
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput('');
    setIsLoading(true);

    try {
      const advisorData = await guidanceClient.chat({
        userPrompt: messageText,
        studentProfile,
        messages: nextHistory.map((m) => ({
          sender: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        })),
      });

      setAdvisorMode(advisorData.mode === 'deterministic_offline' ? 'offline' : 'live');
      const modeNote =
        advisorData.mode === 'deterministic_offline'
          ? '\n\n*Mode: Offline guidance mode (planning estimate — verify deadlines directly on official portals)*'
          : '';

      const aiMessage: ChatMessage = {
        id: `advisor-${Date.now()}`,
        sender: 'ai',
        text: `${advisorData.reply}${modeNote}`,
        timestamp: 'Just now',
        recommendedMajors: advisorData.recommendedMajors,
        recommendedSkills: advisorData.recommendedSkills,
        suggestedMentors: advisorData.suggestedMentors,
        suggestedQuestions: advisorData.suggestedQuestions,
        retrievedSources: advisorData.retrievedSources?.map((src) => ({
          ...src,
          snippet: src.source,
        })),
        webSources: advisorData.webSources,
        toolsUsed: advisorData.toolsUsed,
        memoryUpdates: advisorData.memoryUpdates,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Guidance provider unavailable.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `Unable to complete Study Advisor request: ${errMsg}`,
          timestamp: 'Just now',
          safetyFlags: ['provider_error'],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== '') {
      setActiveSubTab('chat');
      void handleSendMessage(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const handleResetChat = (): void => {
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        sender: 'ai',
        text: `Fresh conversation started for **${displayName}**. What major, university, or scholarship question can I help with next?`,
        timestamp: 'Just now',
        suggestedQuestions: STARTER_CHIPS,
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-12">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Study Advisor</h1>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  advisorMode === 'live'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : advisorMode === 'offline'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                }`}
              >
                {advisorMode === 'live'
                  ? 'Gemini 4 + MCP + Web Search'
                  : advisorMode === 'offline'
                    ? 'Offline Guidance Mode'
                    : 'Study Advisor + Memory'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Friendly answers on Cambodian university majors, Bac II prep, and scholarships.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setShowAdvancedTools((prev) => !prev)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showAdvancedTools ? 'Hide Advanced Tools' : 'Advanced Tools'}</span>
          </button>
          <button
            type="button"
            onClick={handleResetChat}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
            title="New conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('chat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer shrink-0 ${
            activeSubTab === 'chat'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Study Chat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('growth-memory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer shrink-0 ${
            activeSubTab === 'growth-memory'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>My Growth Memory</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('recommendations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer shrink-0 ${
            activeSubTab === 'recommendations'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Recommendations</span>
        </button>

        {showAdvancedTools && (
          <>
            <button
              type="button"
              onClick={() => setActiveSubTab('education-os')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer shrink-0 ${
                activeSubTab === 'education-os'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Personal Education OS</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('knowledge')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer shrink-0 ${
                activeSubTab === 'knowledge'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Knowledge Search</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('memory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer shrink-0 ${
                activeSubTab === 'memory'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>AI Memory</span>
            </button>
          </>
        )}
      </div>

      {activeSubTab === 'chat' && (
        <div className="space-y-4">
          <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 rounded-2xl px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Study Planning Aid:</strong> Answers help you explore majors and scholarships; always double-check official admission and deadline rules on university websites.
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[540px]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {messages.map((msg) => (
                <AdvisorMessageBubble
                  key={msg.id}
                  message={msg}
                  isSourcesExpanded={expandedSourcesMsgId === msg.id}
                  onToggleSources={() =>
                    setExpandedSourcesMsgId(expandedSourcesMsgId === msg.id ? null : msg.id)
                  }
                  onSelectQuestion={(q) => void handleSendMessage(q)}
                />
              ))}
              {isLoading && (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic px-2">
                  Study Advisor is thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendMessage();
              }}
              className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a university, major, Bac II study tip, or scholarship..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {mentors.length > 0 && (
            <div className="bg-blue-50/70 dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Want advice from a university senior?
                </span>
                <span className="block mt-0.5">
                  Book a free 1-on-1 Q&amp;A session with seniors from ITC, CADT, and RUPP.
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpenBooking(mentors[0])}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 cursor-pointer"
              >
                Meet a Senior Mentor
              </button>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'growth-memory' && <GrowthMemoryPanel onNavigateTab={onNavigateTab} />}
      {activeSubTab === 'recommendations' && (
        <AIRecommendationsView
          studentId={user?.id || studentProfile.id || 'usr-student-01'}
          onNavigateTab={onNavigateTab}
        />
      )}
      {activeSubTab === 'education-os' && (
        <PersonalEducationOSView
          studentId={user?.id || studentProfile.id || 'usr-student-01'}
          onNavigateTab={onNavigateTab}
        />
      )}
      {activeSubTab === 'knowledge' && <AIKnowledgeSearchView />}
      {activeSubTab === 'memory' && (
        <AIMemoryProfileView studentId={user?.id || studentProfile.id || 'usr-student-01'} />
      )}
    </div>
  );
};
