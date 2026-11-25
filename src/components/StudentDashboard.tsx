import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  Circle,
  Compass,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';
import type {
  Mentor,
  OpportunityItem,
  StudentMeetup,
  StudentProfile,
  TabView,
  UniversityMajorInsight,
} from '../types';
import type { ScholarshipItem } from '../types/scholarship';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { scholarshipClient } from '../services/scholarshipClient';
import { savedScholarshipClient } from '../services/savedScholarshipClient';
import { readSavedScholarshipIds, writeSavedScholarshipIds } from '../utils/savedScholarships';
import { UpcomingDeadlinesStrip } from './dashboard/UpcomingDeadlinesStrip';

interface StudentDashboardProps {
  studentProfile: StudentProfile;
  mentors: Mentor[];
  opportunities: OpportunityItem[];
  meetups?: StudentMeetup[];
  majorInsights?: UniversityMajorInsight[];
  onNavigateTab?: (tab: TabView) => void;
  onNavigate?: (tab: TabView) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  onSelectMentor?: (mentor: Mentor) => void;
  onOpenBooking?: (mentor: Mentor) => void;
  onOpenMajorInsight?: (major: UniversityMajorInsight) => void;
  onSelectPrompt?: (promptText: string) => void;
  onStartAIChatWithPrompt?: (prompt: string) => void;
  onToggleSaveMentor?: (mentorId: string) => void;
  onToggleSaveOpportunity?: (oppId: string) => void;
  onOpenMeetup?: (meetup: StudentMeetup) => void;
  onOpenAuthModal?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateTab,
  onNavigate,
  onSelectPrompt,
  onStartAIChatWithPrompt,
  onOpenAuthModal,
}) => {
  const { language } = useLanguage();
  const isKhmer = language === 'km';
  const { authenticated, user, profile: authProfile } = useAuth();
  const scopeId = authenticated ? user?.id ?? null : null;

  const [aiQuestion, setAiQuestion] = useState('');
  const [liveScholarships, setLiveScholarships] = useState<ScholarshipItem[]>([]);
  const [totalScholarships, setTotalScholarships] = useState<number>(0);
  const [loadingScholarships, setLoadingScholarships] = useState(true);
  const [scholarshipError, setScholarshipError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number>(() => readSavedScholarshipIds(scopeId).length);

  const navigate = (tab: TabView): void => {
    if (onNavigate) onNavigate(tab);
    else if (onNavigateTab) onNavigateTab(tab);
  };

  const handleStartAIChat = (prompt: string): void => {
    const clean = prompt.trim();
    if (!clean) return;
    if (onStartAIChatWithPrompt) onStartAIChatWithPrompt(clean);
    else if (onSelectPrompt) onSelectPrompt(clean);
    else navigate('advisor');
  };

  const loadUpcomingDeadlines = useCallback(async () => {
    setLoadingScholarships(true);
    setScholarshipError(null);
    try {
      const res = await scholarshipClient.list({
        sortBy: 'deadline_approaching',
        onlyVerified: true,
      });
      const items = Array.isArray(res.scholarships) ? res.scholarships : [];
      setTotalScholarships(res.totalCount || items.length);
      setLiveScholarships(items);
    } catch (err) {
      setScholarshipError(
        err instanceof Error ? err.message : 'Unable to load upcoming scholarship deadlines.'
      );
    } finally {
      setLoadingScholarships(false);
    }
  }, []);

  useEffect(() => {
    void loadUpcomingDeadlines();
  }, [loadUpcomingDeadlines]);

  useEffect(() => {
    if (!scopeId) {
      setSavedCount(readSavedScholarshipIds(null).length);
      return;
    }
    let active = true;
    savedScholarshipClient
      .list()
      .then((rows) => {
        if (!active) return;
        const ids = rows.map((r) => r.scholarshipId);
        writeSavedScholarshipIds(scopeId, ids);
        setSavedCount(ids.length);
      })
      .catch(() => {
        if (active) setSavedCount(readSavedScholarshipIds(scopeId).length);
      });
    return () => {
      active = false;
    };
  }, [scopeId]);

  const upcomingStrip = useMemo(() => {
    const open = liveScholarships.filter((s) => s.deadlineStatus !== 'expired');
    return (open.length > 0 ? open : liveScholarships).slice(0, 4);
  }, [liveScholarships]);

  const greetingName = authenticated
    ? authProfile?.name || user?.email?.split('@')[0] || 'Scholar'
    : null;

  const hasSchoolOrMajor = Boolean(
    authenticated && (authProfile?.school?.trim() || authProfile?.major?.trim())
  );

  const readyCount = [authenticated, hasSchoolOrMajor, savedCount > 0].filter(Boolean).length;

  const quickPrompts = isKhmer
    ? [
        'ប្រៀបធៀប Computer Science នៅ CADT និង ITC',
        'តើគួរត្រៀមអ្វីខ្លះសម្រាប់អាហារូបករណ៍?',
        'ជំនាញណាដែលត្រូវនឹងសិស្សចូលចិត្តបច្ចេកវិទ្យា?',
      ]
    : [
        'Compare Computer Science at CADT vs ITC',
        'How should I prepare for Bac II & scholarships?',
        'What majors fit someone who likes design and coding?',
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* 1. Calm Academic Welcome Card */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-blue-50/40 to-emerald-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              {isKhmer ? 'ទីធ្លាសិក្សា និងរៀបចំផែនការសិក្សា' : 'Your Calm Study & Scholarship Guide'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
            {greetingName
              ? isKhmer
                ? `សួស្តី ${greetingName} — តោះរៀបចំជំហានសិក្សាបន្ទាប់របស់អ្នក`
                : `Welcome back, ${greetingName} — let’s plan your next study step`
              : isKhmer
                ? 'ស្វែងរកអាហារូបករណ៍ មុខជំនាញ និងសាកលវិទ្យាល័យដោយទំនុកចិត្ត'
                : 'Explore verified scholarships, majors, and universities with clarity'}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {isKhmer
              ? 'ប្រៀបធៀបកម្មវិធីសិក្សា តាមដានកាលបរិច្ឆេទអាហារូបករណ៍ពិតប្រាកដ និងគ្រប់គ្រងព័ត៌មានសិក្សារបស់អ្នកដោយឯកជនភាពពេញលេញ។'
              : 'No confusing jargon or fake estimates. Compare university costs, track real scholarship deadlines, and keep your education profile private by default.'}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartAIChat(aiQuestion);
            }}
            className="flex flex-col sm:flex-row gap-2.5 pt-1"
          >
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder={
                isKhmer
                  ? 'សួរទីប្រឹក្សាសិក្សាអំពីជំនាញ ការប្រឡង ឬអាហារូបករណ៍...'
                  : 'Ask the Study Advisor about majors, Bac II prep, or scholarships...'
              }
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!aiQuestion.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isKhmer ? 'សួរទីប្រឹក្សា' : 'Ask Advisor'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isKhmer ? 'សាកសួរ៖' : 'Try asking:'}
            </span>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleStartAIChat(prompt)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Three Clear Student Goal Cards */}
      <section aria-label="Student goals" className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {loadingScholarships
                  ? isKhmer ? 'កំពុងផ្ទុក...' : 'Loading...'
                  : `${totalScholarships} ${isKhmer ? 'កម្មវិធី' : 'verified grants'}`}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isKhmer ? 'ស្វែងរកអាហារូបករណ៍' : 'Explore Verified Scholarships'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {isKhmer
                ? 'មើលអាហារូបករណ៍ក្នុងស្រុក និងអន្តរជាតិ រួមទាំងបញ្ជីសាកលវិទ្យាល័យឈានមុខទាំង ១០០ ទូទាំងពិភពលោក។'
                : 'Browse verified Cambodian and international scholarships plus the Top 100 global university fellowships directory.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('scholarships')}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>{isKhmer ? 'បើកបញ្ជីអាហារូបករណ៍' : 'Open Scholarships'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {isKhmer ? '២ នាទី • ៥ ជំហាន' : '2 min • 5 steps'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isKhmer ? 'តេស្តស្វែងរកជំនាញសិក្សា' : '2-Minute Major Fit Quiz'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {isKhmer
                ? 'ឆ្លើយសំណួរងាយៗ ៥ ជំហាន ដើម្បីដឹងថាជំនាញ និងសាកលវិទ្យាល័យណាត្រូវនឹងចំណូលចិត្ត និងថវិការបស់អ្នក។'
                : 'Answer 5 quick questions about your interests, math comfort, and budget to see majors and local universities that fit.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('decision-engine')}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>{isKhmer ? 'ចាប់ផ្តើមធ្វើតេស្ត' : 'Start Major Fit Quiz'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {isKhmer ? `${readyCount}/3 រួចរាល់` : `${readyCount}/3 ready`}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isKhmer ? 'រៀបចំប្រវត្តិសិក្សាផ្ទាល់ខ្លួន' : 'Build Your Study Profile'}
            </h2>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                {authenticated ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <Circle className="w-4 h-4 text-slate-400 shrink-0" />}
                <span>{isKhmer ? 'ចូលគណនីផ្ទាល់ខ្លួនដោយសុវត្ថិភាព' : 'Create or sign in to your private account'}</span>
              </li>
              <li className="flex items-center gap-2">
                {hasSchoolOrMajor ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <Circle className="w-4 h-4 text-slate-400 shrink-0" />}
                <span>{isKhmer ? 'បន្ថែមថ្នាក់រៀន សាលា និងមុខជំនាញគោលដៅ' : 'Add your grade, school, and target major'}</span>
              </li>
              <li className="flex items-center gap-2">
                {savedCount > 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <Circle className="w-4 h-4 text-slate-400 shrink-0" />}
                <span>{isKhmer ? 'រក្សាទុកអាហារូបករណ៍ដែលអ្នកចាប់អារម្មណ៍' : 'Bookmark scholarships to track deadlines'}</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => (!authenticated && onOpenAuthModal ? onOpenAuthModal() : navigate('profile'))}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>
              {authenticated
                ? isKhmer ? 'គ្រប់គ្រងប្រវត្តិរូប' : 'Open My Profile'
                : isKhmer ? 'ចូលឬបង្កើតគណនី' : 'Sign In / Create Account'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. Live Upcoming Scholarship Deadlines Strip */}
      <UpcomingDeadlinesStrip
        isKhmer={isKhmer}
        scholarships={upcomingStrip}
        loading={loadingScholarships}
        error={scholarshipError}
        onRetry={() => void loadUpcomingDeadlines()}
        onBrowseScholarships={() => navigate('scholarships')}
      />

      {/* 4. Secondary Quick Study Spaces Row */}
      <section aria-label="Quick study spaces" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            tab: 'university-intelligence' as TabView,
            icon: <Building2 className="w-5 h-5" />,
            box: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
            hover: 'hover:border-blue-400 dark:hover:border-blue-500',
            title: isKhmer ? 'ប្រៀបធៀបសាកលវិទ្យាល័យ' : 'Compare Universities',
            desc: isKhmer ? 'ថ្លៃសិក្សា និងកម្មវិធីសិក្សាកម្ពុជា' : 'Tuition, majors & Year 1–4 courses',
          },
          {
            tab: 'stem-discovery' as TabView,
            icon: <Sparkles className="w-5 h-5" />,
            box: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
            hover: 'hover:border-emerald-400 dark:hover:border-emerald-500',
            title: isKhmer ? 'ល្បែងសិក្សា STEM' : 'STEM Discovery Lab',
            desc: isKhmer ? 'សាកល្បងល្បែងឡូហ្ស៊ីក និងវិទ្យាសាស្ត្រ' : 'No-stress logic and circuit puzzles',
          },
          {
            tab: 'mentors' as TabView,
            icon: <Users className="w-5 h-5" />,
            box: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
            hover: 'hover:border-amber-400 dark:hover:border-amber-500',
            title: isKhmer ? 'រៀមច្បងណែនាំ និងក្រុមសិក្សា' : 'Mentors & Study Circles',
            desc: isKhmer ? 'ជួបជាមួយរៀមច្បង ITC, CADT និង RUPP' : 'Talk with seniors from local campuses',
          },
        ].map((item) => (
          <button
            key={item.tab}
            type="button"
            onClick={() => navigate(item.tab)}
            className={`text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${item.hover} p-4 transition-colors cursor-pointer flex items-center gap-3.5`}
          >
            <div className={`w-10 h-10 rounded-xl ${item.box} flex items-center justify-center shrink-0`}>
              {item.icon}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</div>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
};
