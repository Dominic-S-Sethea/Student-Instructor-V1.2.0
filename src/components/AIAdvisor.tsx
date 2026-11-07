import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Compass,
  ArrowRight,
  BookOpen,
  RotateCcw,
  ShieldCheck,
  Brain,
  Database,
  Award,
  ChevronDown,
  ChevronUp,
  Layers,
  FileText
} from 'lucide-react';
import { ChatMessage, StudentProfile, Mentor } from '../types';
import { AIRecommendationsView } from './ai/AIRecommendationsView';
import { AIKnowledgeSearchView } from './ai/AIKnowledgeSearchView';
import { AIMemoryProfileView } from './ai/AIMemoryProfileView';
import { PersonalEducationOSView } from './ai/PersonalEducationOSView';

interface AIAdvisorProps {
  studentProfile: StudentProfile;
  mentors: Mentor[];
  initialPrompt?: string;
  onOpenBooking: (mentor: Mentor) => void;
  onNavigateTab?: (tab: string) => void;
}

type AIAdvisorSubTab = 'education-os' | 'chat' | 'recommendations' | 'knowledge' | 'memory';

export const AIAdvisor: React.FC<AIAdvisorProps> = ({
  studentProfile,
  mentors,
  initialPrompt,
  onOpenBooking,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AIAdvisorSubTab>('education-os');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### Welcome to CDES Personal Education Intelligence
Hello **${studentProfile.name}**! I am your multi-dimensional Education Intelligence Agent. 

Unlike a standard chatbot, I synthesize your **academic history**, **virtual STEM laboratory experiments**, **behavioral grit index**, and **career curiosity** with our 128-dimensional **Cambodian RAG Knowledge Base** (covering ITC, CADT, MPTC scholarships, and MoEYS curricula).

How may I assist your educational journey today?`,
      timestamp: 'Just now',
      retrievedSources: [
        {
          id: 'doc-rag-seed',
          title: 'ITC Polytechnic Tronc Commun & Engineering Cycles',
          category: 'University Knowledge',
          source: 'ITC Academic Catalog & MoEYS Higher Education Framework',
          snippet: 'Two-year intensive polytechnic foundation covering calculus, linear algebra, physics mechanics, and algorithmic logic.',
          relevanceScore: 0.94
        }
      ],
      studentMemoryApplied: {
        learningSummarySnippet: 'Grade 12 Bac II candidate with strong mathematics and logic aptitude.',
        interestSummarySnippet: 'Robotics, Software Engineering, and AI Systems curiosity.',
        careerSummarySnippet: 'Targeting CADT or ITC engineering degree pathways.'
      },
      suggestedQuestions: [
        'How does ITC Tronc Commun work?',
        'Compare Computer Science at CADT vs ITC',
        'How to apply for MPTC Digital Skill Scholarship?',
        'Recommend an interactive STEM lab for wave optics'
      ],
    },
  ]);

  const [input, setInput] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSourcesMsgId, setExpandedSourcesMsgId] = useState<string | null>(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeSubTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isLoading, activeSubTab]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== '') {
      setActiveSubTab('chat');
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Primary call to Phase 6 AI Agent endpoint
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentProfile.id || 'usr-student-01',
          message: messageText,
          chatHistory: messages.slice(-6).map((m) => ({
            sender: m.sender === 'user' ? 'student' : 'agent',
            text: m.text,
          })),
        }),
      });

      let data: any = null;
      if (response.ok) {
        data = await response.json();
      }

      if (data && data.text) {
        const aiMessage: ChatMessage = {
          id: data.id || `agent-${Date.now()}`,
          sender: 'ai',
          text: data.text,
          timestamp: 'Just now',
          retrievedSources: data.retrievedSources,
          studentMemoryApplied: data.studentMemoryApplied,
          safetyFlags: data.safetyFlags,
          suggestedQuestions: data.suggestedQuestions,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Graceful fallback to advisor chat endpoint
        const fallbackRes = await fetch('/api/advisor/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userPrompt: messageText,
            studentProfile,
            messages: [...messages, userMessage],
          }),
        });

        const fallbackData = await fallbackRes.json();
        const fallbackMessage: ChatMessage = {
          id: `fallback-${Date.now()}`,
          sender: 'ai',
          text: fallbackData.reply || `I have evaluated your question. To excel in ${studentProfile.targetMajor || 'STEM'}, focus on solid mathematics and algorithmic problem solving.`,
          timestamp: 'Just now',
          recommendedMajors: fallbackData.recommendedMajors,
          recommendedSkills: fallbackData.recommendedSkills,
          suggestedMentors: fallbackData.suggestedMentors,
          suggestedQuestions: fallbackData.suggestedQuestions || [
            'Compare Computer Science at CADT vs ITC',
            'How to qualify for MPTC Digital Skills Scholarship?',
          ],
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `### Strategic Education Guidance
Grounded in your student profile (**${studentProfile.name}**, ${studentProfile.educationLevel}), we recommend balancing theoretical mathematical foundations with hands-on project exploration in the CDES Virtual Lab.`,
        timestamp: 'Just now',
        suggestedQuestions: [
          'Compare Computer Science at CADT vs ITC',
          'How to qualify for MPTC Digital Skills Scholarship?',
        ],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: `Dialogue refreshed. My active RAG retrieval index and your student cognitive memory remain loaded. What would you like to explore next?`,
        timestamp: 'Just now',
        suggestedQuestions: [
          'How does ITC Tronc Commun work?',
          'What are the past exam questions for MPTC scholarship?',
          'Suggest a study schedule to improve my Physics Bac II score',
        ],
      },
    ]);
  };

  // 4-step assessment state
  const [assessmentStep, setAssessmentStep] = useState(1);
  const [assessmentAnswers, setAssessmentAnswers] = useState({
    subject: 'Mathematics & Logic',
    problemStyle: 'Building digital applications & software',
    impactGoal: 'Creating innovative startups and tech systems',
    environment: 'Collaborative tech campus with project-based learning',
  });

  const handleCompleteAssessment = () => {
    setShowAssessmentModal(false);
    setActiveSubTab('chat');
    const generatedPrompt = `I just completed my Strengths Assessment:
- Favorite Focus: ${assessmentAnswers.subject}
- Preferred Problem Style: ${assessmentAnswers.problemStyle}
- Long-term Impact: ${assessmentAnswers.impactGoal}
- Preferred Campus Culture: ${assessmentAnswers.environment}

Based on this, what are the top 2 university degree programs in Cambodia (e.g. ITC vs CADT vs RUPP) that best fit my profile, and what should my preparation plan look like?`;
    handleSendMessage(generatedPrompt);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Level Navigation Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-stone-900">Personal Education Intelligence Agent</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>RAG Grounded & Safe</span>
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Multi-dimensional educational counselor bridging student memory, university data, and scholarship intelligence.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => setShowAssessmentModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-indigo-200"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>2-Min Career Assessment</span>
          </button>

          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 border border-stone-200 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('education-os')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all border ${
            activeSubTab === 'education-os'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-50 border-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Personal Education OS 2.0</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
            Active
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('chat')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all border ${
            activeSubTab === 'chat'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-50 border-stone-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Classic Q&A Chat</span>
        </button>

        <button
          onClick={() => setActiveSubTab('recommendations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all border ${
            activeSubTab === 'recommendations'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-50 border-stone-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Personalized Recommendations</span>
        </button>

        <button
          onClick={() => setActiveSubTab('knowledge')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all border ${
            activeSubTab === 'knowledge'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-50 border-stone-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Vector Knowledge Base & RAG</span>
        </button>

        <button
          onClick={() => setActiveSubTab('memory')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all border ${
            activeSubTab === 'memory'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-50 border-stone-200'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Student AI Memory & Insights</span>
        </button>
      </div>

      {/* FLAGSHIP SUB-VIEW: PERSONAL EDUCATION OPERATING SYSTEM 2.0 */}
      {activeSubTab === 'education-os' && (
        <PersonalEducationOSView
          studentId={studentProfile.id || 'usr-student-01'}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* SUB-VIEW 1: DIALOGUE */}
      {activeSubTab === 'chat' && (
        <div className="space-y-6">
          {/* Active Memory Context Indicator Ribbon */}
          <div className="bg-stone-100/90 border border-stone-200/80 rounded-xl px-4 py-2.5 text-xs text-stone-600 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-stone-800">Active Student Context:</span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 text-[11px] font-medium text-stone-700">
                {studentProfile.name} • {studentProfile.educationLevel}
              </span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 text-[11px] font-medium text-indigo-700">
                Aspiration: {studentProfile.targetCareer || 'Software & AI'}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[11px]">
              <span className="flex items-center space-x-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Growth Mindset Active</span>
              </span>
            </div>
          </div>

          {/* Explicit Beta Scope & Disclaimer Banner */}
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Beta Advisory Scope:</strong> Provides objective university information, career exploration, and educational planning. <em>Does not provide psychological diagnosis or guaranteed admission/scholarship predictions.</em>
              </span>
            </div>
            <span className="text-[10px] font-bold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full whitespace-nowrap">
              MoEYS Ethics Aligned
            </span>
          </div>

          {/* Chat Stream Window */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col h-[580px]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white ${
                      msg.sender === 'user' ? 'bg-stone-800' : 'bg-indigo-600 shadow-xs'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[90%] sm:max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-stone-900 text-white rounded-tr-none'
                        : 'bg-stone-50 text-stone-800 border border-stone-200/80 rounded-tl-none space-y-3'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
                    ) : (
                      <div className="advisor-markdown-content space-y-2 text-stone-800 leading-relaxed [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-stone-900 [&_h3]:mt-3 [&_h3]:mb-1 [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-stone-900 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_li]:text-sm [&_strong]:font-semibold [&_strong]:text-stone-900 [&_a]:text-indigo-600 [&_a]:underline [&_a]:hover:text-indigo-800 [&_hr]:my-3 [&_hr]:border-stone-200">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    )}

                    {/* RAG Knowledge Citations (if present) */}
                    {msg.retrievedSources && msg.retrievedSources.length > 0 && (
                      <div className="pt-2 border-t border-stone-200/80 space-y-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSourcesMsgId(expandedSourcesMsgId === msg.id ? null : msg.id)
                          }
                          className="flex items-center space-x-1.5 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 transition-colors"
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>
                            {msg.retrievedSources.length} Grounded RAG Knowledge Source{msg.retrievedSources.length > 1 ? 's' : ''} Referenced
                          </span>
                          {expandedSourcesMsgId === msg.id ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {expandedSourcesMsgId === msg.id && (
                          <div className="grid grid-cols-1 gap-2 pt-1 animate-fade-in">
                            {msg.retrievedSources.map((source, sIdx) => (
                              <div
                                key={sIdx}
                                className="bg-white p-3 rounded-xl border border-indigo-100 shadow-xs text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-stone-900 flex items-center space-x-1">
                                    <FileText className="w-3 h-3 text-indigo-600" />
                                    <span>{source.title}</span>
                                  </span>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                                    {source.category}
                                  </span>
                                </div>
                                <p className="text-[11px] text-stone-600 italic">"{source.snippet}"</p>
                                <p className="text-[10px] text-stone-400">
                                  Source: {source.source} {source.relevanceScore ? `• Cosine match: ${Math.round(source.relevanceScore * 100)}%` : ''}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Suggested Follow-up Questions */}
                    {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                      <div className="pt-2 space-y-1.5 border-t border-stone-200/50">
                        <span className="text-[10px] font-bold text-stone-500 block uppercase tracking-wider">
                          Suggested Inquiries:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedQuestions.map((q, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendMessage(q)}
                              className="text-left text-xs bg-white hover:bg-indigo-50 text-stone-700 hover:text-indigo-700 px-2.5 py-1 rounded-lg border border-stone-200 transition-colors flex items-center space-x-1 shadow-2xs"
                            >
                              <span>{q}</span>
                              <ArrowRight className="w-3 h-3 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white bg-indigo-600">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-stone-50 border border-stone-200/80 rounded-2xl rounded-tl-none p-4 text-xs text-stone-500 flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-200" />
                    <span className="font-medium text-stone-600">
                      Querying RAG vectors & applying student memory synthesis...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t border-stone-200 bg-stone-50/50 rounded-b-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about university admission criteria, scholarship eligibility, study techniques, or STEM labs..."
                  className="flex-1 bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-xs transition-colors flex items-center space-x-1.5 shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Senior Mentor Human Verification Strip */}
          <div className="bg-gradient-to-r from-indigo-50 via-white to-blue-50 rounded-2xl border border-indigo-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-stone-900 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Want human confirmation from a real university senior?</span>
              </h2>
              <p className="text-xs text-stone-600">
                Connect with Sokha Meng (ITC Year 4) or Vireak Rith (CADT Senior) who passed these exact entrance exams.
              </p>
            </div>
            <button
              onClick={() => onOpenBooking(mentors[0])}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
            >
              Book 1-on-1 Guidance ($0 Free)
            </button>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: RECOMMENDATIONS */}
      {activeSubTab === 'recommendations' && (
        <AIRecommendationsView
          studentId={studentProfile.id || 'usr-student-01'}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* SUB-VIEW 3: KNOWLEDGE BASE & VECTOR SEARCH */}
      {activeSubTab === 'knowledge' && <AIKnowledgeSearchView />}

      {/* SUB-VIEW 4: STUDENT AI MEMORY & COGNITIVE INSIGHTS */}
      {activeSubTab === 'memory' && (
        <AIMemoryProfileView studentId={studentProfile.id || 'usr-student-01'} />
      )}

      {/* 2-Minute Assessment Modal */}
      {showAssessmentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">2-Minute Academic Strengths Assessment</h3>
                  <p className="text-[11px] text-stone-500">Step {assessmentStep} of 4</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssessmentModal(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Subjects */}
            {assessmentStep === 1 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-stone-900">
                  Which subject area gives you the most energy in high school?
                </h4>
                <div className="space-y-2">
                  {[
                    'Mathematics & Analytical Logic (Calculus, Geometry)',
                    'Physics & Engineering Mechanics',
                    'Computer Programming & Digital Tools',
                    'Biology, Chemistry & Human Health',
                    'Business, Economics & Organization',
                  ].map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setAssessmentAnswers((prev) => ({ ...prev, subject: opt }))}
                      className={`w-full p-3 text-left text-xs rounded-xl border transition-all ${
                        assessmentAnswers.subject === opt
                          ? 'border-indigo-600 bg-indigo-50/70 font-semibold text-indigo-900'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Problem Solving Style */}
            {assessmentStep === 2 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-stone-900">
                  How do you prefer to solve challenges?
                </h4>
                <div className="space-y-2">
                  {[
                    'Building digital applications, web apps, and AI software',
                    'Designing tangible physical structures, hardware, or circuitry',
                    'Analyzing data numbers, statistics, and business trends',
                    'Diagnosing health conditions and helping patients',
                  ].map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setAssessmentAnswers((prev) => ({ ...prev, problemStyle: opt }))}
                      className={`w-full p-3 text-left text-xs rounded-xl border transition-all ${
                        assessmentAnswers.problemStyle === opt
                          ? 'border-indigo-600 bg-indigo-50/70 font-semibold text-indigo-900'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Impact Goal */}
            {assessmentStep === 3 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-stone-900">
                  What kind of career impact matters most to you?
                </h4>
                <div className="space-y-2">
                  {[
                    'High starting salary and fast international career mobility',
                    'Creating innovative tech startups that serve Southeast Asia',
                    'Scientific research and advanced master/PhD degree in France or Japan',
                    'Saving human lives and providing direct healthcare support',
                  ].map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setAssessmentAnswers((prev) => ({ ...prev, impactGoal: opt }))}
                      className={`w-full p-3 text-left text-xs rounded-xl border transition-all ${
                        assessmentAnswers.impactGoal === opt
                          ? 'border-indigo-600 bg-indigo-50/70 font-semibold text-indigo-900'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Campus Environment */}
            {assessmentStep === 4 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-stone-900">
                  What campus culture feels most motivating?
                </h4>
                <div className="space-y-2">
                  {[
                    'Rigorous engineering research with heavy math (e.g. ITC Tronc Commun)',
                    'Modern digital lab with Mac rooms and project sprints (e.g. CADT)',
                    'Comprehensive state university with broad alumni (e.g. RUPP)',
                    'Clinical hospital environment with 8-year dedication (e.g. UHS)',
                  ].map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setAssessmentAnswers((prev) => ({ ...prev, environment: opt }))}
                      className={`w-full p-3 text-left text-xs rounded-xl border transition-all ${
                        assessmentAnswers.environment === opt
                          ? 'border-indigo-600 bg-indigo-50/70 font-semibold text-indigo-900'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <button
                disabled={assessmentStep === 1}
                onClick={() => setAssessmentStep((s) => s - 1)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-30"
              >
                Back
              </button>

              {assessmentStep < 4 ? (
                <button
                  onClick={() => setAssessmentStep((s) => s + 1)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleCompleteAssessment}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Generate AI Major Match ✨
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
