import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Award,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Bookmark,
  Compass,
  Users,
  Plus,
  Calendar,
  BookOpen,
  MessageSquare,
  Building2,
} from 'lucide-react';
import {
  StudentProfile,
  Mentor,
  OpportunityItem,
  StudentMeetup,
  UniversityMajorInsight,
  TabView,
} from '../types';
import { useLanguage } from '../context/LanguageContext';

interface StudentDashboardProps {
  studentProfile: StudentProfile;
  mentors: Mentor[];
  opportunities: OpportunityItem[];
  events?: Array<{
    id: string;
    title: string;
    category: string;
    date: string;
    hostName: string;
    description?: string;
  }>;
  communityPosts?: Array<{
    id: string;
    title: string;
    category: string;
    authorName: string;
    commentsCount: number;
  }>;
  meetups?: StudentMeetup[];
  majorInsights?: UniversityMajorInsight[];
  onNavigateTab?: (tab: TabView) => void;
  onNavigate?: (tab: TabView) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  onSelectMentor?: (mentor: Mentor) => void;
  onOpenBooking?: (mentor: Mentor) => void;
  onSelectOpportunity?: (opp: any) => void;
  onOpenMajorInsight?: (major: any) => void;
  onSelectEvent?: (event: any) => void;
  onSelectPrompt?: (promptText: string) => void;
  onStartAIChatWithPrompt?: (prompt: string) => void;
  onToggleSaveMentor?: (mentorId: string) => void;
  onToggleSaveOpportunity?: (oppId: string) => void;
  onOpenMeetup?: (meetup: StudentMeetup) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  studentProfile,
  mentors = [],
  opportunities = [],
  events: propEvents,
  communityPosts: propCommunityPosts,
  meetups = [],
  onNavigateTab,
  onNavigate,
  onBack,
  canGoBack = false,
  onSelectMentor,
  onOpenBooking,
  onSelectOpportunity,
  onSelectEvent,
  onSelectPrompt,
  onStartAIChatWithPrompt,
  onToggleSaveMentor,
  onToggleSaveOpportunity,
}) => {
  const { t, language } = useLanguage();
  const isKhmer = language === 'km';
  const [aiQuestion, setAiQuestion] = useState('');

  const navigate = (tab: TabView) => {
    if (onNavigate) onNavigate(tab);
    else if (onNavigateTab) onNavigateTab(tab);
  };

  const handleSelectMentor = (mentor: Mentor) => {
    if (onSelectMentor) onSelectMentor(mentor);
    else if (onOpenBooking) onOpenBooking(mentor);
  };

  const handleStartAIChat = (prompt: string) => {
    if (onStartAIChatWithPrompt) onStartAIChatWithPrompt(prompt);
    else if (onSelectPrompt) onSelectPrompt(prompt);
    else navigate('advisor');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dash.goodMorning', 'Good morning');
    if (hour < 18) return t('dash.goodAfternoon', 'Good afternoon');
    return t('dash.goodEvening', 'Good evening');
  };

  // Matched mentors based on student interests
  const matchedMentors = [
    {
      mentor: mentors.find((m) => m.id === 'men-001' || m.id === 'mentor-1') || mentors[0],
      matchPercentage: 96,
      matchReason: isKhmer
        ? 'ត្រូវគ្នានឹងចំណាប់អារម្មណ៍របស់អ្នកលើគណិតវិទ្យាកម្រិតខ្ពស់ Python និងប្រព័ន្ធ AI ព្យាករណ៍។'
        : 'Matches your interests in Advanced Mathematics, Python, and Predictive AI modeling.',
    },
    {
      mentor: mentors.find((m) => m.id === 'men-002' || m.id === 'mentor-2') || mentors[1] || mentors[0],
      matchPercentage: 92,
      matchReason: isKhmer
        ? 'ត្រូវគ្នានឹងចំណង់ចំណូលចិត្តលើប្រព័ន្ធសូហ្វវែរ មូលដ្ឋានគ្រឹះកូដ និងវិស្វកម្មនៅតិចណូ (ITC)។'
        : 'Matches your curiosity in Software Systems, Coding fundamentals, and ITC Engineering.',
    },
    {
      mentor: mentors.find((m) => m.id === 'men-003' || m.id === 'mentor-3') || mentors[2] || mentors[0],
      matchPercentage: 88,
      matchReason: isKhmer
        ? 'ត្រូវគ្នានឹងចំណាប់អារម្មណ៍លើរ៉ូបូត ការដោះស្រាយបញ្ហា និងអាហារូបករណ៍ STEM នៅអាស៊ី។'
        : 'Matches your interest in Robotics, Problem Solving, and Asian STEM scholarships.',
    },
  ].filter((item) => !!item.mentor);

  const recommendedMajors = [
    {
      title: isKhmer ? 'វិទ្យាសាស្ត្រទិន្នន័យ និង AI (Data Science & AI)' : 'Data Science & AI',
      category: isKhmer ? 'គណិតវិទ្យា & វិទ្យាសាស្ត្រកុំព្យូទ័រ' : 'Mathematics & Computer Science',
      salary: '$1,200 - $3,800/mo',
      growth: '+32% Growth',
      reason: isKhmer
        ? 'ត្រូវគ្នានឹងសមត្ថភាពវិភាគគណិតវិទ្យា និងការដោះស្រាយបញ្ហារបស់អ្នក។'
        : 'Direct fit for your analytical math curiosity and problem solving.',
      oppId: 'opp-1',
    },
    {
      title: isKhmer ? 'វិស្វកម្មសូហ្វវែរ (Software Engineering)' : 'Software Engineering',
      category: isKhmer ? 'ប្រព័ន្ធបច្ចេកវិទ្យា & Cloud Computing' : 'Systems & Cloud Computing',
      salary: '$1,000 - $3,500/mo',
      growth: '+26% Growth',
      reason: isKhmer
        ? 'មូលដ្ឋានគ្រឹះរឹងមាំសម្រាប់គេហទំព័រ កម្មវិធីទូរស័ព្ទ និងប្រព័ន្ធឌីជីថលស្ថាប័ន។'
        : 'Versatile foundation for web, mobile, and digital enterprise systems.',
      oppId: 'opp-2',
    },
    {
      title: isKhmer ? 'រ៉ូបូត និងប្រព័ន្ធស្វ័យប្រវត្តិកម្ម' : 'Robotics & Autonomous Systems',
      category: isKhmer ? 'ផ្នែករឹង & បញ្ញាសិប្បនិម្មិតបង្កប់' : 'Hardware & Embedded AI',
      salary: '$1,400 - $3,200/mo',
      growth: '+28% Growth',
      reason: isKhmer
        ? 'រួមបញ្ចូលរូបវិទ្យា ឧបករណ៍បញ្ជាអេឡិចត្រូនិក និងក្បួនដោះស្រាយឆ្លាតវៃ។'
        : 'Integrates physics, hardware controllers, and intelligent algorithms.',
      oppId: 'opp-5',
    },
  ];

  const popularQuestions = [
    t('dash.q1', "Should I choose Computer Science or Data Science for my bachelor's?"),
    t('dash.q2', 'What math topics should I master in Grade 12 for AI scholarships?'),
    isKhmer
      ? 'តើថ្ងៃធ្វើការធម្មតារបស់វិស្វករសូហ្វវែរនៅ Grab មានសភាពដូចម្តេច?'
      : 'What does a typical day look like for a software engineer at Grab?',
    isKhmer
      ? 'តើខ្ញុំត្រូវត្រៀមខ្លួនបែបណាសម្រាប់ការប្រឡងអាហារូបករណ៍ឌីជីថល MPTC?'
      : 'How do I prepare for the MPTC digital scholarship exam?',
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiQuestion.trim()) {
      handleStartAIChat(aiQuestion);
      setAiQuestion('');
    }
  };

  const savedMentorsList = mentors.filter((m) =>
    studentProfile?.savedMentorIds?.includes(m.id)
  );
  const savedOpportunitiesList = opportunities.filter((o) =>
    studentProfile?.savedOpportunityIds?.includes(o.id)
  );

  const fallbackEvents = [
    {
      id: 'eve-001',
      title: 'Ask a Senior Software Engineer: From ITC to Grab',
      category: 'Virtual AMA',
      date: 'Saturday, Sep 6, 2026',
      hostName: 'Dr. Sok Dara',
    },
    {
      id: 'eve-002',
      title: 'MPTC Digital Scholarship Exam Breakdown & Tips',
      category: 'Scholarship Prep',
      date: 'Wednesday, Sep 10, 2026',
      hostName: 'Chantha Srey',
    },
  ];

  const fallbackCommunity = [
    {
      id: 'post-1',
      title: 'ITC vs CADT for Computer Science: Which has better curriculum?',
      category: 'University Choice',
      authorName: 'Sovann Meas',
      commentsCount: 14,
    },
    {
      id: 'post-2',
      title: 'How I passed Tronc Commun Calculus 1 with Grade A',
      category: 'Foundation Year',
      authorName: 'Vannak Sam',
      commentsCount: 8,
    },
  ];

  const displayEvents = propEvents && propEvents.length > 0 ? propEvents : fallbackEvents;
  const displayCommunity =
    propCommunityPosts && propCommunityPosts.length > 0 ? propCommunityPosts : fallbackCommunity;

  const totalInterests = studentProfile.explorationProgress.totalInterestsCount || 10;
  const eventsCount = studentProfile.explorationProgress.eventsAttended || 1;

  // Senior alumni cards
  const seniorAlumni = [
    {
      id: 'mentor-itc-1',
      name: 'Sophea Rith',
      title: isKhmer ? 'និស្សិតឆ្នាំទី៤ • វិទ្យាសាស្ត្រទិន្នន័យ ITC' : 'Year 4 Senior • ITC Data Science',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      quote: isKhmer
        ? '"សួរខ្ញុំបានគ្រប់យ៉ាងអំពីការប្រឡងចូលគណិតវិទ្យា ITC ឆ្នាំត្រៀម Tronc Commun និងគម្រោង AI!"'
        : '"Ask me anything about ITC entrance math exam, Tronc Commun Year 1 & 2, and AI projects!"',
      actionText: isKhmer ? 'មើលមគ្គុទ្ទេសក៍ជំនាញ ITC & ជជែក' : 'View ITC Major Guide & Chat',
      targetMentorId: 'men-001',
    },
    {
      id: 'mentor-cadt-1',
      name: 'Panha Vath',
      title: isKhmer ? 'និស្សិតឆ្នាំទី៤ • វិស្វកម្មសូហ្វវែរ CADT' : 'Year 4 Senior • CADT Software',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
      quote: isKhmer
        ? '"វិធីត្រៀមប្រឡងយកអាហារូបករណ៍ពេញថ្លៃ MPTC និងការចូលរួមប្រកួត Hackathon នៅឆមាសទី១។"'
        : '"How to prepare for the MPTC full scholarship exam and hackathons in your first semester."',
      actionText: isKhmer ? 'មើលមគ្គុទ្ទេសក៍ CADT & ជជែក' : 'View CADT Guide & Chat',
      targetMentorId: 'men-002',
    },
    {
      id: 'mentor-rupp-1',
      name: 'Bopha Samnang',
      title: isKhmer ? 'និស្សិតឆ្នាំទី៤ • វិទ្យាសាស្ត្រកុំព្យូទ័រ RUPP' : 'Year 4 Senior • RUPP CS',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      quote: isKhmer
        ? '"តុល្យភាពរវាងម៉ោងសិក្សា ការចុះកម្មសិក្សានៅក្រុមហ៊ុន Fintech និងការបង្កើតគេហទំព័រផ្ទាល់ខ្លួន។"'
        : '"Balancing study shifts, internships at fintech firms, and building portfolio web projects."',
      actionText: isKhmer ? 'មើលមគ្គុទ្ទេសក៍ RUPP & ជជែក' : 'View RUPP Guide & Chat',
      targetMentorId: 'men-003',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button if available */}
      {canGoBack && onBack && (
        <div className="flex items-center">
          <button
            onClick={onBack}
            id="dashboard-back-btn"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 shadow-2xs transition"
            title={t('dash.back', 'Back')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('dash.back', 'Back')}</span>
          </button>
        </div>
      )}

      {/* 1. Hero Student Guidance Engine Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('dash.heroBadge', 'AI Student Career Guidance Engine')}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            {getGreeting()}, {studentProfile.name.split(' ')[0]}!
          </h1>

          <p className="text-slate-300 text-sm sm:text-base">
            {t('dash.heroIntro', "Let's explore your future. Based on your interests in")}{' '}
            <span className="text-blue-300 font-semibold">
              {studentProfile.interests.slice(0, 3).join(', ')}
            </span>
            , {t('dash.heroPrep', "we’ve prepared personalized mentors, majors, and events for you.")}
          </p>

          <form onSubmit={handleFormSubmit} className="pt-2 flex items-center space-x-2">
            <div className="relative flex-1">
              <Sparkles className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder={t('dash.askAiPlaceholder', 'Ask the AI Advisor anything about majors, scholarships, or careers...')}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/90 text-sm text-white placeholder-slate-400 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-400 transition"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm flex items-center space-x-1.5 transition shrink-0 cursor-pointer"
            >
              <span>{t('dash.askAiBtn', 'Ask AI')}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400">{t('dash.popularQuestions', 'Popular questions:')}</span>
            {popularQuestions.slice(0, 2).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleStartAIChat(q)}
                className="text-[11px] text-slate-300 bg-slate-800/80 hover:bg-slate-700/90 px-2.5 py-1 rounded-lg border border-slate-700 text-left truncate max-w-xs transition cursor-pointer"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        <div className="absolute right-0 bottom-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 1.5 Student Decision Intelligence Hub */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 text-left">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('dash.heroBadge', 'Student Decision Intelligence System')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {t('dash.decisionPromptTitle', 'Not sure what to study or which university to pick?')}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            {t('dash.decisionPromptDesc', 'Move beyond static directory brochures. Complete our 6-stage cognitive fit assessment to evaluate majors, simulate 4-year tuition ROI, and compare top Cambodian universities side-by-side.')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('decision-engine')}
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-slate-950" />
            <span>{t('dash.launchEngine', 'Launch Decision Engine')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate('university-intelligence')}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-blue-300" />
            <span>{t('dash.compareMatrix', 'University Comparison Matrix')}</span>
          </button>
        </div>
      </div>

      {/* 1.6 Cambodia Scholarship Intelligence Platform (CSIP) Quick Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 text-left border border-emerald-800/40">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('dash.csipBadge', 'Scholarship Search Engine (CSIP)')}</span>
            <span className="text-[10px] bg-emerald-400/30 text-white px-1.5 py-0.2 rounded font-mono">{t('dash.verifiedBadge', '100% Verified')}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">
            {t('dash.csipTitle', 'Looking for Verified Global & Domestic Scholarships?')}
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            {t('dash.csipDesc', 'Search fully funded global opportunities (Chevening, Fulbright, Australia Awards, CADT MPTC, MEXT, GKS) with live deadline reminders, GPA limits, and verified grants.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate('scholarships')}
            className="px-5 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Award className="w-4 h-4 text-slate-950" />
            <span>{t('dash.searchScholarships', 'Search Scholarships')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1.7 Avatar World MVP Banner (Preserved in platform code for further development; hidden from user UI) */}
      {/*
      <div className="bg-gradient-to-r from-violet-950 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 text-left border border-indigo-700/40">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-400/20 text-violet-300 text-xs font-bold border border-violet-400/30">
            <Sparkles className="w-3.5 h-3.5 text-violet-300" />
            <span>Digital Education Identity • Avatar World MVP</span>
            <span className="text-[10px] bg-violet-500/30 text-white px-1.5 py-0.2 rounded font-mono">Personal Room</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">
            Step into Your Personal Digital Study Sanctuary
          </h3>
          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
            Customize your Cambodian student avatar, arrange your 2D study desk and scientific apparatus, mount earned MoEYS academic trophies on your wall, and explore the Central Hallway.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate('avatar-world')}
            className="px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Enter Avatar Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      */}

      {/* 2. Your Future Exploration Progress */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">{t('dash.progressTitle', 'Your Future Exploration Progress')}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('dash.progressSubtitle', 'Keep exploring majors, asking AI questions, and connecting with mentors to unlock badges.')}
            </p>
          </div>
          <button
            onClick={() => navigate('profile')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center cursor-pointer"
          >
            <span>{t('dash.viewMap', 'View Interest & Career Map')}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{t('dash.profileComplete', 'Profile Complete')}</span>
              <span className="font-bold text-slate-800">
                {studentProfile.explorationProgress.profileCompleted}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${studentProfile.explorationProgress.profileCompleted}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{t('dash.interestsExplored', 'Interests Explored')}</span>
              <span className="font-bold text-slate-800">
                {studentProfile.explorationProgress.interestsExplored} / {totalInterests}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${(studentProfile.explorationProgress.interestsExplored / totalInterests) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{t('dash.mentorsContacted', 'Mentors Contacted')}</span>
              <span className="font-bold text-slate-800">
                {studentProfile.explorationProgress.mentorsContacted} {isKhmer ? 'រូប' : 'Mentors'}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, studentProfile.explorationProgress.mentorsContacted * 50)}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{t('dash.eventsAttended', 'Events Attended')}</span>
              <span className="font-bold text-slate-800">{eventsCount} {isKhmer ? 'កម្មវិធី' : 'Event'}</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, eventsCount * 33)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-1 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            {t('dash.earnedBadges', 'Earned Badges:')}
          </span>
          {studentProfile.badges.map((b) => {
            const isEarned = b.earned ?? b.isUnlocked;
            return (
              <div
                key={b.id}
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${
                  isEarned
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                }`}
                title={b.description}
              >
                <Award className={`w-3.5 h-3.5 ${isEarned ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>{b.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. STEM Discovery Gaming Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider text-amber-300">
            <Compass className="w-3.5 h-3.5" />
            <span>{t('dash.stemBadge', 'Discover Yourself — STEM Gaming')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('dash.stemTitle', 'Play Short Challenges & Discover Your STEM Superpowers')}
          </h2>
          <p className="text-blue-100 text-sm font-medium leading-relaxed">
            {t('dash.stemDesc', 'No boring exams or school tests! Solve river-crossing drone puzzles, decode circuit patterns, and get encouraging behavioral compliments.')}
          </p>
        </div>

        <button
          onClick={() => navigate('stem-discovery')}
          id="dashboard-launch-stem-game-btn"
          className="relative z-10 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-blue-700 font-extrabold text-sm shadow-lg transition-all flex items-center gap-2 shrink-0 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>{t('dash.playStem', 'Play STEM Challenges')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4. University Transition Hub (ITC, CADT, RUPP Seniors) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[11px] font-bold border border-blue-400/30">
                {t('dash.transHubBadge', '🎓 University Transition Hub')}
              </span>
              <span className="text-xs text-blue-200 font-semibold">{t('dash.transHubTag', 'High School Graduate Support')}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              {t('dash.transHubTitle', 'Talk with Senior Students from ITC, CADT, and RUPP')}
            </h2>
            <p className="text-xs text-blue-100/80 max-w-2xl leading-relaxed">
              {t('dash.transHubDesc', 'Curious about Data Science at ITC, Software Engineering at CADT, or CS at RUPP? Ask current Year 4 seniors about entrance exams and coursework.')}
            </p>
          </div>

          <button
            onClick={() => navigate('alumni')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 shrink-0 cursor-pointer"
          >
            <span>{t('dash.exploreSeniors', 'Explore All Seniors & Alumni')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {seniorAlumni.map((senior) => {
            const target = mentors.find((m) => m.id === senior.targetMentorId) || mentors[0];
            return (
              <div
                key={senior.id}
                onClick={() => {
                  if (target) handleSelectMentor(target);
                  else navigate('alumni');
                }}
                className="bg-white/10 hover:bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/10 cursor-pointer transition space-y-2 group"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={senior.image}
                    alt={senior.name}
                    className="w-11 h-11 rounded-xl object-cover border border-white/20 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-white text-xs block group-hover:text-blue-300 transition truncate">
                      {senior.name}
                    </span>
                    <span className="text-[11px] text-blue-200 block truncate">{senior.title}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-200 line-clamp-2">{senior.quote}</p>
                <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                  <span>{senior.actionText}</span> →
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Two-Column Layout */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Recommended Mentors & Majors */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Matched Mentors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">{t('dash.recMentorsTitle', 'Recommended Mentors for You')}</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('dash.recMentorsSubtitle', 'Matched deterministically against your interests in Mathematics, Coding, and Robotics.')}
                </p>
              </div>
              <button
                onClick={() => navigate('mentors')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center cursor-pointer"
              >
                <span>{t('dash.browseAllMentors', 'Browse All Mentors')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {matchedMentors.map(({ mentor, matchPercentage, matchReason }) => {
                const isSaved = studentProfile?.savedMentorIds?.includes(mentor.id);
                return (
                  <div
                    key={mentor.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                          {matchPercentage}% {t('dash.matchBadge', 'Match')}
                        </span>
                        <button
                          onClick={() => onToggleSaveMentor && onToggleSaveMentor(mentor.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isSaved
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                          title={isSaved ? (isKhmer ? 'បានរក្សាទុកក្នុងប្រវត្តិរូប' : 'Saved in Profile') : (isKhmer ? 'រក្សាទុកអ្នកណែនាំ' : 'Save Mentor')}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
                        </button>
                      </div>

                      <div className="flex items-start space-x-3 mb-3">
                        <img
                          src={mentor.avatar}
                          alt={mentor.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <h3 className="font-bold text-slate-900 text-sm truncate">{mentor.name}</h3>
                            {mentor.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 truncate">{mentor.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{mentor.university}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50/60 rounded-xl p-2.5 text-xs text-blue-900 border border-blue-100 mb-3">
                        <p className="line-clamp-2">
                          <strong className="font-semibold">{t('dash.whyMatched', 'Why Matched:')}</strong> {matchReason}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {mentor.expertiseTags?.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleSelectMentor(mentor)}
                        className="py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-center cursor-pointer"
                      >
                        {t('dash.viewProfile', 'View Profile')}
                      </button>
                      <button
                        onClick={() => {
                          handleSelectMentor(mentor);
                        }}
                        className="py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition text-center flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{t('dash.comments', 'Comments')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended University Majors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Compass className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-slate-900">{t('dash.recMajorsTitle', 'Recommended University Majors')}</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('dash.recMajorsSubtitle', 'Academic pathways that align directly with your strengths.')}
                </p>
              </div>
              <button
                onClick={() => navigate('opportunities')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center cursor-pointer"
              >
                <span>{t('dash.exploreAllOpportunities', 'Explore All Opportunities')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recommendedMajors.map((major, mIdx) => (
                <div
                  key={mIdx}
                  className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900">{major.title}</span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {major.growth}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{major.category}</p>
                    <p className="text-xs text-slate-600">{major.reason}</p>
                  </div>

                  <div className="flex items-center space-x-2 sm:flex-col sm:items-end sm:space-x-0 sm:space-y-1 shrink-0">
                    <span className="text-xs font-bold text-slate-800">{major.salary}</span>
                    <button
                      onClick={() => {
                        if (onSelectOpportunity) onSelectOpportunity(major);
                        navigate('opportunities');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
                    >
                      {t('dash.viewRoadmap', 'View Roadmap')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Circles, Talks, Community, Bookmarks */}
        <div className="lg:col-span-4 space-y-6">
          {/* Student Study Circles */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/30 text-indigo-200">
                  <Users className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-white text-sm">{t('dash.studyCirclesTitle', 'Student Study Circles')}</h3>
                  <span className="text-[10px] text-indigo-200 block">{t('dash.studyCirclesSubtitle', 'Exam Reviews & Peer Groups')}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('meetups')}
                className="text-xs text-indigo-300 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>{t('dash.viewAll', 'View All')}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div
              onClick={() => navigate('meetups')}
              className="p-3 bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 cursor-pointer transition space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
                  {t('dash.examReview', '📝 Exam Review')}
                </span>
                <span className="text-slate-300 text-[10px]">{isKhmer ? 'ថ្ងៃអាទិត្យ ម៉ោង ២:០០ រសៀល' : 'Sunday 2:00 PM'}</span>
              </div>
              <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                {t('dash.circleTitle1', 'Bac II Math & Calculus Past Paper Sprint')}
              </h4>
              <p className="text-[11px] text-indigo-200/90 line-clamp-1">
                {t('dash.circleLoc1', '📍 National Library • 6/8 Students Joined')}
              </p>
            </div>

            <button
              onClick={() => navigate('meetups')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('dash.createJoinMeetup', 'Create / Join Student Meetup')}</span>
            </button>
          </div>

          {/* Upcoming Conferences & Live Talks */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">{t('dash.upcomingConferencesTitle', 'Upcoming Conferences & Live Talks')}</h3>
              </div>
              <button
                onClick={() => navigate('events')}
                className="text-xs text-emerald-600 font-semibold hover:underline cursor-pointer"
              >
                {t('dash.browseAll', 'Browse All')}
              </button>
            </div>

            {displayEvents.slice(0, 2).map((ev) => (
              <div
                key={ev.id}
                onClick={() => {
                  if (onSelectEvent) onSelectEvent(ev);
                  else navigate('events');
                }}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {ev.category}
                  </span>
                  <span className="text-slate-500 font-medium">{ev.date.split(',')[0]}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                  {ev.title}
                </h4>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                  <span>{isKhmer ? 'ម្ចាស់កម្មវិធី' : 'Host'}: {ev.hostName}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Community Discussions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">{t('dash.communityDiscussionsTitle', 'Community Discussions')}</h3>
              </div>
              <button
                onClick={() => navigate('community')}
                className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                {t('dash.joinForum', 'Join Forum')}
              </button>
            </div>

            <div className="space-y-3">
              {displayCommunity.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate('community')}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition cursor-pointer space-y-1.5"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    {post.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                    {post.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{isKhmer ? 'ដោយ' : 'By'} {post.authorName}</span>
                    <span>{post.commentsCount} {isKhmer ? 'ចម្លើយ' : 'replies'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Bookmarks */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Bookmark className="w-4 h-4 text-slate-700 fill-slate-700" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  {t('dash.savedBookmarks', 'Saved Bookmarks')} ({savedMentorsList.length + savedOpportunitiesList.length})
                </h3>
              </div>
              <button
                onClick={() => navigate('profile')}
                className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                {t('dash.manage', 'Manage')}
              </button>
            </div>

            <div className="space-y-2">
              {savedMentorsList.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleSelectMentor(m)}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs cursor-pointer hover:bg-blue-50/50"
                >
                  <span className="font-medium text-slate-800 truncate">{m.name}</span>
                  <span className="text-[10px] text-blue-600 font-semibold shrink-0">{t('dash.mentorLabel', 'Mentor')}</span>
                </div>
              ))}

              {savedOpportunitiesList.map((o) => (
                <div
                  key={o.id}
                  onClick={() => navigate('opportunities')}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs cursor-pointer hover:bg-indigo-50/50"
                >
                  <span className="font-medium text-slate-800 truncate">{o.title}</span>
                  <span className="text-[10px] text-indigo-600 font-semibold shrink-0">
                    {t('dash.majorGrantLabel', 'Major / Grant')}
                  </span>
                </div>
              ))}

              {savedMentorsList.length === 0 && savedOpportunitiesList.length === 0 && (
                <p className="text-xs text-slate-400 py-1 italic">{t('dash.noSavedItems', 'No saved items yet.')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
