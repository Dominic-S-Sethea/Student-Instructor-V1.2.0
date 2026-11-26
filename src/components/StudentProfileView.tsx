import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  Bookmark,
  GraduationCap,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  Video,
} from 'lucide-react';
import type { Mentor, OpportunityItem, StudentProfile, TabView } from '../types';
import type { ScholarshipItem } from '../types/scholarship';
import { StudentEducationAndPrivacyPanel } from './StudentEducationAndPrivacyPanel';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSavedScholarshipsContext } from '../context/SavedScholarshipsContext';
import { scholarshipClient } from '../services/scholarshipClient';
import { getSafeHttpUrl } from '../utils/safeUrl';

interface StudentProfileViewProps {
  studentProfile: StudentProfile;
  mentors: Mentor[];
  opportunities: OpportunityItem[];
  onUpdateInterests: (interests: string[]) => void;
  onCancelBooking: (bookingId: string) => void;
  onOpenBooking: (mentor: Mentor) => void;
  onOpenAuthModal?: () => void;
  onNavigateTab?: (tab: TabView) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  studentProfile,
  onCancelBooking,
  onOpenAuthModal,
  onNavigateTab,
}) => {
  const { authenticated, user, profile: authProfile } = useAuth();
  const { language } = useLanguage();
  const isKhmer = language === 'km';
  const { savedIds, hydratedItems } = useSavedScholarshipsContext();
  const [fallbackCatalog, setFallbackCatalog] = useState<ScholarshipItem[]>([]);

  useEffect(() => {
    if (!authenticated || savedIds.length === 0 || hydratedItems.length >= savedIds.length) {
      setFallbackCatalog([]);
      return;
    }
    let active = true;
    scholarshipClient
      .list()
      .then((res) => {
        if (!active) return;
        setFallbackCatalog((res.scholarships || []).filter((s) => savedIds.includes(s.id)));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [authenticated, savedIds, hydratedItems.length]);

  const savedCatalog = hydratedItems.length > 0 ? hydratedItems : fallbackCatalog;

  if (!authenticated) {
    return (
      <div className="max-w-3xl mx-auto pb-12 space-y-6">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xs space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {isKhmer ? 'ទីធ្លាសិក្សាផ្ទាល់ខ្លួនរបស់អ្នកកំពុងរង់ចាំ' : 'Your private study space awaits'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {isKhmer
                ? 'បង្កើតគណនីឥតគិតថ្លៃដើម្បីរក្សាទុកប្រវត្តិសិក្សា តាមដានអាហារូបករណ៍ និងគ្រប់គ្រងឯកជនភាពរបស់អ្នកដោយសុវត្ថិភាព។'
                : 'Sign in or create a free student account to save your education timeline, manage scholarship targets, and control your privacy settings.'}
            </p>
          </div>
          <div id="profile-education-privacy" className="scroll-mt-6 rounded-2xl transition-all grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
              <div className="font-bold">Education Timeline</div>
              <div className="text-slate-500 dark:text-slate-400 mt-0.5">Save school, grade &amp; target major</div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5">
              <Bookmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
              <div className="font-bold">Saved Deadlines</div>
              <div className="text-slate-500 dark:text-slate-400 mt-0.5">{savedIds.length} bookmarked on this device</div>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-1" />
              <div className="font-bold">Privacy First</div>
              <div className="text-slate-500 dark:text-slate-400 mt-0.5">Analytics &amp; research OFF by default</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            {onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{isKhmer ? 'ចូលឬបង្កើតគណនី' : 'Sign In / Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const displayName = authProfile?.name || user?.email?.split('@')[0] || 'Student';
  const displayLevel = authProfile?.education_level || user?.role || 'Account';
  const displaySchool = authProfile?.school || 'School not set';
  const displayLocation = authProfile?.location || 'Location not set';
  const displayEmail = user?.email || '';
  const displayMajor = authProfile?.major || 'Not specified';
  const displayCareer = authProfile?.target_career || 'Not specified';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 pb-12">
      {/* Real Account Snapshot Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-600 text-white text-2xl font-extrabold flex items-center justify-center shadow-sm shrink-0">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {displayName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                {displayLevel}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{displaySchool}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{displayLocation}</span>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{displayEmail}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-2xl p-4 sm:w-80 text-xs space-y-1.5 shrink-0">
          <span className="text-[11px] uppercase tracking-wider font-bold text-blue-700 dark:text-blue-300 block">
            Target Major &amp; Career
          </span>
          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{displayMajor}</p>
          <p className="text-slate-600 dark:text-slate-300">Goal: {displayCareer}</p>
        </div>
      </div>

      {/* Persistent Private Education Profile & Consent Panel */}
      <div id="profile-education-privacy" className="scroll-mt-6">
        <StudentEducationAndPrivacyPanel />
      </div>

      {/* Saved Scholarships Snapshot */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isKhmer ? 'អាហារូបករណ៍ដែលបានរក្សាទុក' : `Bookmarked Scholarships (${savedIds.length})`}
            </h2>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('scholarships')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Browse Scholarships →
            </button>
          )}
        </div>
        {savedCatalog.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {savedIds.length > 0
              ? `${savedIds.length} bookmarked scholarship(s) saved on this browser.`
              : 'Bookmark scholarships in the Scholarships tab to track their deadlines here.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedCatalog.map((sch) => (
              <div
                key={sch.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {isKhmer && sch.nameKm ? sch.nameKm : sch.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {sch.country} • {sch.deadline || sch.deadlineType || 'Not specified'}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 shrink-0">
                  {sch.fundingType}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmed Mentor Sessions (only shown when user booked a session in current session) */}
      {studentProfile.scheduledSessions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Confirmed Mentorship Sessions ({studentProfile.scheduledSessions.length})
          </h2>
          {studentProfile.scheduledSessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  1-on-1 Guidance with {session.mentorName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {session.date} ({session.time}) • {session.topic}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {getSafeHttpUrl(session.meetingLink) && (
                  <a
                    href={getSafeHttpUrl(session.meetingLink)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{isKhmer ? 'ចូលរួម' : 'Join Meet'}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => onCancelBooking(session.id)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-medium cursor-pointer"
                >
                  {isKhmer ? 'បោះបង់' : 'Cancel'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
