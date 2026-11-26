import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Layers,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { ChatMessage, Mentor, StudentProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { guidanceClient } from '../services/guidanceClient';
import { AdvisorMessageBubble } from './ai/AdvisorMessageBubble';
import { AdvisorSubTabs, type AIAdvisorSubTab } from './ai/AdvisorSubTabs';
import { AIRecommendationsView } from './ai/AIRecommendationsView';
import { AIKnowledgeSearchView } from './ai/AIKnowledgeSearchView';
import { AIMemoryProfileView } from './ai/AIMemoryProfileView';
import { PersonalEducationOSView } from './ai/PersonalEducationOSView';
import { GrowthMemoryPanel } from './ai/GrowthMemoryPanel';

interface AIAdvisorProps {
  studentProfile: StudentProfile;
  mentors: Mentor[];
  initialPrompt?: string;
  onConsumeInitialPrompt?: () => void;
  onOpenBooking: (mentor: Mentor) => void;
  onNavigateTab?: (tab: string) => void;
  externalSubTab?: AIAdvisorSubTab;
  externalSubTabNonce?: number;
}

const STARTER_CHIPS_EN = [
  'Compare Computer Science at CADT vs ITC',
  'How should I prepare for Bac II to win a scholarship?',
  'Which major fits someone who likes tech and design?',
  'Explain fully funded scholarships open to Cambodian students',
];

const STARTER_CHIPS_KM = [
  'ប្រៀបធៀបជំនាញ Computer Science នៅ CADT និង ITC',
  'តើគួរត្រៀមប្រឡង Bac II យ៉ាងណាដើម្បីឈ្នះអាហារូបករណ៍?',
  'ជំនាញណាដែលត្រូវនឹងសិស្សចូលចិត្តបច្ចេកវិទ្យា និងឌីហ្សាញ?',
  'ពន្យល់អំពីអាហារូបករណ៍ពេញលេញសម្រាប់សិស្សកម្ពុជា',
];

const MAX_HISTORY_MESSAGES = 28;
const MAX_MESSAGE_CHARS = 3800;

export const AIAdvisor: React.FC<AIAdvisorProps> = ({
  mentors,
  initialPrompt,
  onConsumeInitialPrompt,
  onOpenBooking,
  onNavigateTab,
  externalSubTab,
  externalSubTabNonce,
}) => {
  const { authenticated, user, profile: authProfile } = useAuth();
  const { language } = useLanguage();
  const isKhmer = language === 'km';
  const isAdmin = user?.role === 'admin';
  const starterChips = isKhmer ? STARTER_CHIPS_KM : STARTER_CHIPS_EN;
  const displayName = authenticated
    ? authProfile?.name || user?.email?.split('@')[0] || (isKhmer ? 'សិស្ស' : 'Scholar')
    : isKhmer ? 'អ្នក' : 'there';

  const [activeSubTab, setActiveSubTab] = useState<AIAdvisorSubTab>(externalSubTab || 'chat');
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [advisorMode, setAdvisorMode] = useState<'ready' | 'live' | 'offline'>('ready');
  const [expandedSourcesMsgId, setExpandedSourcesMsgId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (externalSubTab && externalSubTabNonce) {
      setActiveSubTab(externalSubTab);
    }
  }, [externalSubTab, externalSubTabNonce]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: isKhmer
        ? `### សូមស្វាគមន៍មកកាន់ទីប្រឹក្សាសិក្សា\nសួស្តី **${displayName}**! សួរខ្ញុំអំពីការជ្រើសរើសមុខជំនាញ ការប្រៀបធៀបសាកលវិទ្យាល័យ (ITC, CADT, RUPP, UHS) ការត្រៀម Bac II ឬអាហារូបករណ៍។`
        : `### Welcome to Study Advisor\nHello **${displayName}**! Ask me anything about choosing a major, comparing Cambodian universities (like ITC, CADT, RUPP, or UHS), preparing for Bac II, or planning scholarship applications.\n\nWhat would you like to figure out today?`,
      timestamp: 'Just now',
      suggestedQuestions: starterChips,
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

    const boundedMessages = nextHistory.slice(-MAX_HISTORY_MESSAGES).map((m) => ({
      sender: m.sender === 'user' ? 'user' : 'model',
      text: m.text.slice(0, MAX_MESSAGE_CHARS),
    }));

    const verifiedStudentContext = authenticated && authProfile
      ? {
          name: authProfile.name || undefined,
          educationLevel: authProfile.education_level || undefined,
          favoriteSubjects: Array.isArray(authProfile.favorite_subjects) ? authProfile.favorite_subjects : undefined,
          targetMajor: authProfile.major || undefined,
        }
      : undefined;

    try {
      const advisorData = await guidanceClient.chat({
        userPrompt: messageText.slice(0, MAX_MESSAGE_CHARS),
        studentProfile: verifiedStudentContext,
        messages: boundedMessages,
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
      const promptToRun = initialPrompt;
      onConsumeInitialPrompt?.();
      void handleSendMessage(promptToRun);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const handleResetChat = (): void => {
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        sender: 'ai',
        text: isKhmer
          ? `ការសន្ទនាថ្មីបានចាប់ផ្តើមសម្រាប់ **${displayName}**។ តើអ្នកចង់សួរអំពីជំនាញ សាកលវិទ្យាល័យ ឬអាហារូបករណ៍អ្វី?`
          : `Fresh conversation started for **${displayName}**. What major, university, or scholarship question can I help with next?`,
        timestamp: 'Just now',
        suggestedQuestions: starterChips,
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
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {isKhmer ? 'ទីប្រឹក្សាសិក្សា' : 'Study Advisor'}
              </h1>
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
                    ? isKhmer ? 'របៀបណែនាំក្រៅបណ្តាញ' : 'Offline Guidance Mode'
                    : isKhmer ? 'ទីប្រឹក្សាសិក្សា + ការចងចាំ' : 'Study Advisor + Memory'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isKhmer
                ? 'ចម្លើយងាយយល់អំពីជំនាញសាកលវិទ្យាល័យ ការត្រៀម Bac II និងអាហារូបករណ៍។'
                : 'Friendly answers on Cambodian university majors, Bac II prep, and scholarships.'}
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
            <span>
              {showAdvancedTools
                ? isKhmer ? 'លាក់ឧបករណ៍បន្ថែម' : 'Hide Advanced Tools'
                : isKhmer ? 'ឧបករណ៍បន្ថែម' : 'Advanced Tools'}
            </span>
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

      <AdvisorSubTabs
        activeSubTab={activeSubTab}
        onSelectSubTab={setActiveSubTab}
        showAdvancedTools={showAdvancedTools}
        isKhmer={isKhmer}
        isAdmin={isAdmin}
        authenticated={authenticated}
      />

      {activeSubTab === 'chat' && (
        <div className="space-y-4">
          <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 rounded-2xl px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <span>
              <strong>{isKhmer ? 'ជំនួយរៀបចំផែនការសិក្សា៖' : 'Study Planning Aid:'}</strong>{' '}
              {isKhmer
                ? 'ចម្លើយជួយអ្នកស្វែងយល់អំពីជំនាញ និងអាហារូបករណ៍ — សូមផ្ទៀងផ្ទាត់កាលបរិច្ឆេទ និងលក្ខខណ្ឌលើគេហទំព័រផ្លូវការជានិច្ច។'
                : 'Answers help you explore majors and scholarships; always double-check official admission and deadline rules on university websites.'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[540px]">
            <div
              role="log"
              aria-live="polite"
              aria-relevant="additions text"
              aria-label={isKhmer ? 'ប្រវត្តិសន្ទនាទីប្រឹក្សាសិក្សា' : 'Study Advisor conversation'}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
            >
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
                  {isKhmer ? 'ទីប្រឹក្សាសិក្សាកំពុងគិត...' : 'Study Advisor is thinking...'}
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
                aria-label={isKhmer ? 'សួរទីប្រឹក្សាសិក្សា' : 'Ask the Study Advisor'}
                placeholder={
                  isKhmer
                    ? 'សួរអំពីសាកលវិទ្យាល័យ មុខជំនាញ ការត្រៀម Bac II ឬអាហារូបករណ៍...'
                    : 'Ask about a university, major, Bac II study tip, or scholarship...'
                }
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isKhmer ? 'ផ្ញើ' : 'Send'}</span>
              </button>
            </form>
          </div>

          {mentors.length > 0 && (
            <div className="bg-blue-50/70 dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {isKhmer ? 'ចង់បានដំបូន្មានពីរៀមច្បងសាកលវិទ្យាល័យ?' : 'Want advice from a university senior?'}
                </span>
                <span className="block mt-0.5">
                  {isKhmer
                    ? 'កក់ការជជែកសំណួរ-ចម្លើយដោយឥតគិតថ្លៃជាមួយរៀមច្បងពី ITC, CADT និង RUPP។'
                    : 'Book a free 1-on-1 Q&A session with seniors from ITC, CADT, and RUPP.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpenBooking(mentors[0])}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 cursor-pointer"
              >
                {isKhmer ? 'ជួបរៀមច្បងណែនាំ' : 'Meet a Senior Mentor'}
              </button>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'growth-memory' && <GrowthMemoryPanel onNavigateTab={onNavigateTab} />}
      {activeSubTab === 'recommendations' && authenticated && user?.id && (
        <AIRecommendationsView studentId={user.id} onNavigateTab={onNavigateTab} />
      )}
      {activeSubTab === 'recommendations' && !authenticated && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-600 dark:text-slate-300">
          {isKhmer ? 'សូមចូលគណនីដើម្បីមើលការណែនាំផ្ទាល់ខ្លួនរបស់អ្នក។' : 'Sign in to view personalized recommendations.'}
        </div>
      )}
      {activeSubTab === 'education-os' && isAdmin && user?.id && (
        <PersonalEducationOSView studentId={user.id} onNavigateTab={onNavigateTab} />
      )}
      {activeSubTab === 'knowledge' && <AIKnowledgeSearchView />}
      {activeSubTab === 'memory' && authenticated && user?.id && (
        <AIMemoryProfileView studentId={user.id} />
      )}
    </div>
  );
};
