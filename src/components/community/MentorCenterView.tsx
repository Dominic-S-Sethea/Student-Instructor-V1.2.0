import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  Star,
  Calendar,
  Clock,
  Video,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Filter,
  Check,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { ClientMentorProfile, ClientMentorshipSession } from '../../types';
import { communityClient } from '../../services/communityClient';

interface Props {
  onOpenReportModal: (itemType: string, itemId: string) => void;
}

export const MentorCenterView: React.FC<Props> = ({ onOpenReportModal }) => {
  const [mentors, setMentors] = useState<ClientMentorProfile[]>([]);
  const [sessions, setSessions] = useState<ClientMentorshipSession[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'directory' | 'my_sessions'>('directory');
  const [loading, setLoading] = useState(true);

  // Booking modal
  const [selectedMentor, setSelectedMentor] = useState<ClientMentorProfile | null>(null);
  const [bookingTopic, setBookingTopic] = useState('academic_guidance');
  const [bookingDate, setBookingDate] = useState('2026-10-05');
  const [bookingTime, setBookingTime] = useState('17:00 - 17:30');
  const [bookingNotes, setBookingNotes] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const studentId = 'usr-student-01';
  const studentName = 'Dara Chan';

  useEffect(() => {
    loadMentorsAndSessions();
  }, [selectedBadge]);

  const loadMentorsAndSessions = async () => {
    try {
      setLoading(true);
      const [mentorsData, aiRecs, studentSessions] = await Promise.all([
        communityClient.getMentors(selectedBadge !== 'ALL' ? selectedBadge : undefined),
        communityClient.getAIMRecommendations(studentId),
        communityClient.getStudentSessions(studentId)
      ]);
      const aiRecsData = aiRecs as { mentors: { id: string; matchScore?: number; matchReason?: string }[] };

      // Merge AI scores
      const mScores = new Map<string, { score: number; reason: string }>();
      aiRecs.mentors.forEach(m => {
        mScores.set(m.id, { score: m.matchScore || 85, reason: m.matchReason || '' });
      });

      const merged = mentorsData.map(m => {
        const aiInfo = mScores.get(m.id);
        return {
          ...m,
          matchScore: aiInfo?.score,
          matchReason: aiInfo?.reason
        };
      }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      setMentors(merged);
      setSessions(studentSessions);
    } catch (err) {
      console.error('Error loading mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;

    try {
      setSubmittingBooking(true);
      const newSession = await communityClient.bookMentor({
        mentor_id: selectedMentor.id,
        student_id: studentId,
        student_name: studentName,
        topic: bookingTopic,
        session_type: bookingTopic,
        scheduled_date: bookingDate,
        scheduled_time: bookingTime,
        student_notes: bookingNotes
      });

      setSessions([newSession, ...sessions]);
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedMentor(null);
        setActiveTab('my_sessions');
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Failed to book session');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'university_verified':
        return { label: 'University Faculty Verified', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'industry_pro':
        return { label: 'Industry Tech Lead', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'alumni_star':
        return { label: 'Alumni Scholar Star', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Verified Mentor', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Mentor Network Header & Tabs */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-lg">CDES Verified Mentor Network</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Connect with professors from CADT, ITC, RUPP, and scholarship alumni through safety-audited 1-on-1 video guidance.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'directory' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mentor Directory ({mentors.length})
          </button>
          <button
            onClick={() => setActiveTab('my_sessions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'my_sessions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Sessions ({sessions.length})
          </button>
        </div>
      </div>

      {activeTab === 'directory' ? (
        <div className="space-y-6">
          {/* AI Recommended Mentor Spotlight */}
          {mentors[0] && mentors[0].matchScore && (
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-blue-800/40">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <img
                    src={mentors[0].avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={mentors[0].full_name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" /> {mentors[0].matchScore}% AI Cognitive Match
                      </span>
                      <span className="text-xs text-blue-200">
                        {getBadgeStyle(mentors[0].verified_badge).label}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mt-1">
                      {mentors[0].full_name} {mentors[0].full_name_km && `(${mentors[0].full_name_km})`}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {mentors[0].title} • <span className="font-semibold text-white">{mentors[0].organization}</span>
                    </p>
                    <p className="text-xs text-blue-100/90 mt-2 bg-white/10 p-2.5 rounded-xl max-w-2xl border border-white/10">
                      💡 <strong>Why matched:</strong> {mentors[0].matchReason}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMentor(mentors[0])}
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 flex-shrink-0"
                >
                  <Calendar className="w-4 h-4" /> Book 1-on-1 Session
                </button>
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Badge:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'All Mentors' },
                { id: 'university_verified', label: 'University Faculty' },
                { id: 'industry_pro', label: 'Industry Tech Leads' },
                { id: 'alumni_star', label: 'Alumni Stars' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedBadge(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    selectedBadge === f.id
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map((mentor) => {
              const badge = getBadgeStyle(mentor.verified_badge);
              const expertise = typeof mentor.expertise_areas === 'string'
                ? JSON.parse(mentor.expertise_areas)
                : mentor.expertise_areas;

              return (
                <div
                  key={mentor.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3.5">
                      <img
                        src={mentor.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                        alt={mentor.full_name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{mentor.full_name}</h4>
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{mentor.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 truncate">{mentor.title}</p>
                        <p className="text-[11px] font-semibold text-blue-600 truncate">{mentor.organization}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                      {mentor.bio}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {expertise.slice(0, 3).map((exp: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {mentor.total_sessions} safe sessions completed
                    </span>
                    <button
                      onClick={() => setSelectedMentor(mentor)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Book Mentorship
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* My Booked Sessions Tab */
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900 text-base">No Mentorship Sessions Booked</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Schedule your first 1-on-1 academic counseling session with CADT or ITC professors for Bac II guidance, curriculum choices, or project reviews.
              </p>
              <button
                onClick={() => setActiveTab('directory')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Browse Verified Mentors
              </button>
            </div>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        {sess.status}
                      </span>
                      <span className="text-xs font-bold text-slate-400 capitalize">
                        {sess.session_type.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{sess.topic}</h4>
                    <p className="text-xs text-slate-600">
                      With <span className="font-semibold text-slate-800">{sess.mentor_name || 'Academic Mentor'}</span> ({sess.mentor_title || 'CDES Verified Mentor'})
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {sess.scheduled_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {sess.scheduled_time} ({sess.duration_minutes} min)
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Safety Audited
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <a
                    href={sess.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Video className="w-3.5 h-3.5" /> Join Virtual Room
                  </a>
                  <button
                    onClick={() => onOpenReportModal('mentor', sess.mentor_id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg text-xs"
                    title="Report concern"
                  >
                    Flag
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Booking Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Book Safe Mentorship Session</h3>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Session Confirmed!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your academic session with {selectedMentor.full_name} has been scheduled. Safe meeting links are active in your sessions tab.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="mt-4 space-y-3.5">
                <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-200">
                  <img
                    src={selectedMentor.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={selectedMentor.full_name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{selectedMentor.full_name}</h4>
                    <p className="text-[11px] text-slate-500">{selectedMentor.title} • {selectedMentor.organization}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Session Purpose</label>
                  <select
                    value={bookingTopic}
                    onChange={(e) => setBookingTopic(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="academic_guidance">Bac II Prep & Academic Guidance</option>
                    <option value="curriculum_review">University Major & Tronc Commun Review</option>
                    <option value="scholarship_prep">MPTC / International Scholarship Interview Prep</option>
                    <option value="project_feedback">STEM Project Architecture Feedback</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot (Cambodia Time)</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="17:00 - 17:30">17:00 - 17:30 (After School)</option>
                      <option value="17:45 - 18:15">17:45 - 18:15 (Evening)</option>
                      <option value="09:00 - 09:30">09:00 - 09:30 (Saturday Morning)</option>
                      <option value="14:00 - 14:30">14:00 - 14:30 (Saturday Afternoon)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Questions or Goals for Session</label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Describe specific questions, e.g. CADT entrance exam coding questions, or how to prepare for MPTC interview..."
                    rows={3}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-2.5 bg-blue-50 text-blue-800 rounded-xl text-[11px] flex items-center gap-2 border border-blue-200">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>All sessions are logged and monitored under CDES Minor Safety Standards.</span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMentor(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBooking}
                    className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {submittingBooking ? 'Confirming...' : 'Confirm Safe Booking'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
