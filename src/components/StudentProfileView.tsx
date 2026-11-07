import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Calendar,
  Video,
  Award,
  Bookmark,
  Plus,
  X,
  ExternalLink,
  MapPin,
  Mail,
  CheckCircle2,
  Target,
  Compass,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import {
  StudentProfile,
  Mentor,
  OpportunityItem,
  SessionBooking,
} from '../types';

interface StudentProfileViewProps {
  studentProfile: StudentProfile;
  mentors: Mentor[];
  opportunities: OpportunityItem[];
  onUpdateInterests: (interests: string[]) => void;
  onCancelBooking: (bookingId: string) => void;
  onOpenBooking: (mentor: Mentor) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  studentProfile,
  mentors,
  opportunities,
  onUpdateInterests,
  onCancelBooking,
  onOpenBooking,
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'sessions' | 'saved' | 'badges'>('sessions');

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagInput.trim();
    if (!clean || studentProfile.interests.includes(clean)) return;
    onUpdateInterests([...studentProfile.interests, clean]);
    setNewTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    onUpdateInterests(studentProfile.interests.filter((t) => t !== tag));
  };

  const savedMentors = mentors.filter((m) => studentProfile.savedMentorIds.includes(m.id));
  const savedOpportunities = opportunities.filter((o) => studentProfile.savedOpportunityIds.includes(o.id));

  return (
    <div className="space-y-6 pb-12">
      {/* Profile Header Dossier */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
          <img
            src={
              studentProfile?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
            }
            alt={studentProfile?.name || 'Student Profile'}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
            }}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-indigo-100 shadow-sm"
          />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                {studentProfile.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                {studentProfile.educationLevel}
              </span>
            </div>

            <p className="text-xs text-stone-600 font-medium">{studentProfile.school}</p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{studentProfile.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>{studentProfile.email}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Target Goal Highlight Box */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 sm:w-80 text-xs space-y-1.5 shrink-0">
          <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-700 block">
            Target Degree & Career
          </span>
          <p className="font-bold text-stone-900 text-sm">
            {studentProfile.targetMajor}
          </p>
          <p className="text-stone-600">Goal: {studentProfile.targetCareer}</p>
        </div>
      </div>

      {/* Student Identity Profile: Future Navigator 5-Pillar Matrix (MVP Core) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              <span>Student Identity Profile (Future Navigator Core)</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              5 core dimensions guiding your personalized Discover → Decide → Prepare → Grow roadmap.
            </p>
          </div>
          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
            MVP Verified Profile
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {/* 1. Education Background */}
          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 text-indigo-700 font-bold text-[11px]">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>1. Education</span>
            </div>
            <div className="font-bold text-stone-900 text-xs">{studentProfile.educationLevel}</div>
            <div className="text-[11px] text-stone-500 line-clamp-1">{studentProfile.school}</div>
            <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
              STEM Science Track
            </div>
          </div>

          {/* 2. Interests */}
          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 text-blue-700 font-bold text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>2. Interests</span>
            </div>
            <div className="font-bold text-stone-900 text-xs">{studentProfile.interests.length} Core Domains</div>
            <div className="text-[11px] text-stone-500 line-clamp-1">{studentProfile.interests.slice(0, 2).join(', ')}...</div>
            <div className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block">
              AI, Robotics, Web
            </div>
          </div>

          {/* 3. Career Goal */}
          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 text-purple-700 font-bold text-[11px]">
              <Target className="w-3.5 h-3.5" />
              <span>3. Career Goal</span>
            </div>
            <div className="font-bold text-stone-900 text-xs line-clamp-1">{studentProfile.targetCareer || 'Software Engineer'}</div>
            <div className="text-[11px] text-stone-500">Tech & Digital Economy</div>
            <div className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.5 rounded mt-1 inline-block">
              High Growth Industry
            </div>
          </div>

          {/* 4. University Goal */}
          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-[11px]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>4. University Goal</span>
            </div>
            <div className="font-bold text-stone-900 text-xs line-clamp-1">{studentProfile.targetMajor || 'Computer Science'}</div>
            <div className="text-[11px] text-stone-500">CADT, ITC, RUPP Target</div>
            <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
              Bac II Grade A/B Needed
            </div>
          </div>

          {/* 5. Learning Goal */}
          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 text-amber-700 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>5. Learning Goal</span>
            </div>
            <div className="font-bold text-stone-900 text-xs">Bac II Honors (Grade A)</div>
            <div className="text-[11px] text-stone-500">5 hrs/wk STEM Practice</div>
            <div className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">
              MPTC Scholarship Target
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Academic Interests Tagging Section */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Your Academic & Skill Interests
            </h2>
            <p className="text-xs text-stone-500">
              Adding or removing tags dynamically adjusts your AI Advisor suggestions and scholarship match scores.
            </p>
          </div>

          {/* Add Tag Form */}
          <form onSubmit={handleAddTag} className="flex items-center space-x-2">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="Add interest (e.g. Robotics)..."
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!newTagInput.trim()}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold shadow-xs flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Tag Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {studentProfile.interests.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-900 text-xs font-semibold border border-indigo-100"
            >
              <span>{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-indigo-400 hover:text-rose-600 transition-colors"
                title="Remove interest"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Tabs for Scheduled Sessions, Saved Items & Badges */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveSubTab('sessions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'sessions'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Confirmed Sessions ({studentProfile.scheduledSessions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'saved'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Saved Items ({savedMentors.length + savedOpportunities.length})
          </button>
          <button
            onClick={() => setActiveSubTab('badges')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'badges'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Badges & Milestones ({studentProfile.badges.filter((b) => b.isUnlocked).length})
          </button>
        </div>

        {/* 1. Confirmed Sessions Tab */}
        {activeSubTab === 'sessions' && (
          <div className="space-y-3">
            {studentProfile.scheduledSessions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-stone-500 border border-stone-200 text-xs">
                No active 1-on-1 sessions scheduled. Visit Find Mentors to schedule your first meeting!
              </div>
            ) : (
              studentProfile.scheduledSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={session.mentorAvatar}
                      alt={session.mentorName}
                      className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {session.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          📅 {session.date} ({session.time})
                        </span>
                      </div>
                      <h3 className="font-bold text-stone-900 text-sm mt-1">
                        1-on-1 Guidance with {session.mentorName}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-1">{session.topic}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meet</span>
                    </a>
                    <button
                      onClick={() => onCancelBooking(session.id)}
                      className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. Saved Items Tab */}
        {activeSubTab === 'saved' && (
          <div className="space-y-6">
            {/* Saved Mentors */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Bookmarked Mentors ({savedMentors.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedMentors.map((m) => (
                  <div key={m.id} className="bg-white rounded-2xl border border-stone-200 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          m?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                        }
                        alt={m?.name || 'Mentor'}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                        }}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-stone-900">{m.name}</h4>
                        <p className="text-[11px] text-stone-500">{m.university}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenBooking(m)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs"
                    >
                      Book
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Opportunities */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Saved Scholarships & Programs ({savedOpportunities.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedOpportunities.map((opp) => (
                  <div key={opp.id} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {opp.coverageOrStipend}
                    </span>
                    <h4 className="font-bold text-xs text-stone-900">{opp.title}</h4>
                    <p className="text-[11px] text-stone-500">{opp.provider}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. Badges Tab */}
        {activeSubTab === 'badges' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {studentProfile.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border transition-all ${
                  badge.isUnlocked
                    ? 'bg-white border-stone-200 shadow-xs'
                    : 'bg-stone-50/70 border-stone-100 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${
                    badge.isUnlocked
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-200 text-stone-400'
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>

                <h4 className="font-bold text-stone-900 text-sm">{badge.title}</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">{badge.description}</p>
                {badge.isUnlocked && (
                  <span className="inline-block mt-3 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Unlocked {badge.unlockedAt}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
