import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  GraduationCap,
  Calendar,
  Star,
  Bookmark,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Send,
  ShieldCheck,
  Share2,
  Sparkles,
  ChevronRight,
  Info,
  X,
  Lock,
} from 'lucide-react';
import { Mentor, StudentProfile } from '../types';
import { useEscapeKey } from '../hooks/useModalAccessibility';

export interface MentorPostComment {
  id: string;
  mentorId: string;
  studentName: string;
  studentSchool: string;
  studentAvatar: string;
  text: string;
  timestamp: string;
  likesCount: number;
  hasLiked?: boolean;
  mentorReply?: {
    mentorName: string;
    mentorAvatar: string;
    text: string;
    timestamp: string;
  };
}

const initialCommentsData: Record<string, MentorPostComment[]> = {
  'men-001': [
    {
      id: 'c1',
      mentorId: 'men-001',
      studentName: 'Vannak Sam',
      studentSchool: 'Bak Touk High School (Grade 12)',
      studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      text: 'Sokha, how much advanced calculus should I study before entering Tronc Commun at ITC? Is the Bac II textbook enough?',
      timestamp: '2 hours ago',
      likesCount: 8,
      hasLiked: false,
      mentorReply: {
        mentorName: 'Sokha Meng (ITC Year 4)',
        mentorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        text: 'Great question Vannak! Bac II gives you the foundation, but Tronc Commun moves quickly into epsilon-delta limits, Taylor expansions, and partial derivatives. I recommend reviewing integration by parts and matrix multiplication during your vacation!',
        timestamp: '1 hour ago',
      },
    },
    {
      id: 'c2',
      mentorId: 'men-001',
      studentName: 'Sophea Nou',
      studentSchool: 'Preah Sisowath High School (Grade 11)',
      studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      text: 'What laptop specifications do you recommend for the Data Science and AI lab courses?',
      timestamp: '5 hours ago',
      likesCount: 5,
      hasLiked: false,
      mentorReply: {
        mentorName: 'Sokha Meng (ITC Year 4)',
        mentorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        text: 'At least 16GB RAM is ideal for local Docker and pandas dataframes. A dedicated GPU is helpful, but CADT and ITC cloud labs also provide Google Colab Pro credits for heavy model training!',
        timestamp: '3 hours ago',
      },
    },
  ],
  'men-002': [
    {
      id: 'c3',
      mentorId: 'men-002',
      studentName: 'Dara Chan',
      studentSchool: 'Tuol Tom Poung High School (Grade 12)',
      studentAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
      text: 'Vireak, is prior programming experience required before applying for the MPTC full scholarship exam at CADT?',
      timestamp: '1 day ago',
      likesCount: 14,
      hasLiked: true,
      mentorReply: {
        mentorName: 'Vireak Rith (CADT Year 3)',
        mentorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        text: 'Not at all! The exam tests mathematical logic, English comprehension, and algorithmic pattern recognition. If you enjoy puzzle-solving and logic, you can easily score well!',
        timestamp: '22 hours ago',
      },
    },
  ],
  'men-003': [
    {
      id: 'c4',
      mentorId: 'men-003',
      studentName: 'Chantrea Lim',
      studentSchool: 'Indra Devi High School (Grade 12)',
      studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
      text: 'How does the RUPP Computer Science schedule accommodate students who want to take part-time tech internships?',
      timestamp: '2 days ago',
      likesCount: 6,
      hasLiked: false,
      mentorReply: {
        mentorName: 'Dalin Chhem (Wing Bank)',
        mentorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        text: 'RUPP offers flexible morning, afternoon, and evening shift options in Years 3 and 4, which makes balancing junior engineering jobs and banking internships very manageable!',
        timestamp: '1 day ago',
      },
    },
  ],
  'men-004': [
    {
      id: 'c5',
      mentorId: 'men-004',
      studentName: 'Rathana Heng',
      studentSchool: 'Hun Sen Kampong Cham High School',
      studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      text: 'Dr. Sreymom, which biology topics carry the highest weight in the National Medical Concours entrance exam?',
      timestamp: '3 days ago',
      likesCount: 19,
      hasLiked: true,
      mentorReply: {
        mentorName: 'Dr. Sreymom Meas (UHS Alumna)',
        mentorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
        text: 'Focus deeply on human genetics, cellular respiration/biochemistry, and endocrine regulation from the Grade 12 curriculum. Diagrams and enzyme pathways are frequently tested!',
        timestamp: '2 days ago',
      },
    },
  ],
};

interface MentorDiscoveryProps {
  mentors: Mentor[];
  savedMentorIds: string[];
  studentProfile?: StudentProfile;
  onToggleSaveMentor: (mentorId: string) => void;
  onOpenBooking: (mentor: Mentor) => void;
}

export const MentorDiscovery: React.FC<MentorDiscoveryProps> = ({
  mentors,
  savedMentorIds,
  studentProfile,
  onToggleSaveMentor,
  onOpenBooking,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedMentorForBio, setSelectedMentorForBio] = useState<Mentor | null>(null);
  const [selectedMentorForComments, setSelectedMentorForComments] = useState<Mentor | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, MentorPostComment[]>>(initialCommentsData);
  const [newCommentInput, setNewCommentInput] = useState('');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  useEscapeKey(Boolean(selectedMentorForBio || selectedMentorForComments), () => {
    setSelectedMentorForBio(null);
    setSelectedMentorForComments(null);
  });

  const roles = [
    { label: 'All Mentors', value: 'ALL' },
    { label: 'University Seniors', value: 'senior' },
    { label: 'Industry Professionals', value: 'professional' },
    { label: 'Medical & Health Experts', value: 'expert' },
  ];

  const filteredMentors = mentors.filter((m) => {
    const matchesRole = selectedRole === 'ALL' || m.mentorType === selectedRole;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(query) ||
      m.university.toLowerCase().includes(query) ||
      m.major.toLowerCase().includes(query) ||
      m.expertiseTags.some((t) => t.toLowerCase().includes(query));
    return matchesRole && matchesSearch;
  });

  const handlePostComment = (mentorId: string) => {
    if (!newCommentInput.trim()) return;

    const newComment: MentorPostComment = {
      id: `comment-${Date.now()}`,
      mentorId,
      studentName: studentProfile?.name || 'Vannak Sam',
      studentSchool: `${studentProfile?.school || 'Bak Touk High School'} (${studentProfile?.educationLevel || 'Grade 12'})`,
      studentAvatar:
        studentProfile?.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      text: newCommentInput.trim(),
      timestamp: 'Just now',
      likesCount: 1,
      hasLiked: true,
    };

    setCommentsMap((prev) => ({
      ...prev,
      [mentorId]: [newComment, ...(prev[mentorId] || [])],
    }));

    setNewCommentInput('');
  };

  const handleToggleLikeComment = (mentorId: string, commentId: string) => {
    setCommentsMap((prev) => {
      const list = prev[mentorId] || [];
      return {
        ...prev,
        [mentorId]: list.map((c) => {
          if (c.id !== commentId) return c;
          const liked = c.hasLiked;
          return {
            ...c,
            likesCount: liked ? c.likesCount - 1 : c.likesCount + 1,
            hasLiked: !liked,
          };
        }),
      };
    });
  };

  const handleToggleLikePost = (mentorId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [mentorId]: !prev[mentorId],
    }));
  };

  const currentModalMentor = selectedMentorForComments || selectedMentorForBio;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-300">
      {/* Child & Teenager Safety Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-amber-950 text-sm sm:text-base flex items-center gap-1.5">
              <span>Teenager Protection & Public Community Q&A</span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                Safety First
              </span>
            </h2>
            <p className="text-xs text-amber-800 mt-0.5 max-w-3xl leading-relaxed">
              Private direct messaging between teenagers and adult mentors is temporarily deactivated until further notice. To protect students and foster collective learning, all mentor questions, degree inquiries, and advice take place transparently in public comment threads below each mentor&apos;s profile post.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center space-x-1 text-xs font-bold text-amber-900 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-300">
          <Lock className="w-3.5 h-3.5 text-amber-700" />
          <span>Private DMs Deactivated</span>
        </div>
      </div>

      {/* Directory Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
              Verified University Mentors & Senior Council
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Ask questions, read advice, and interact openly with senior top-percentile students from ITC, CADT, RUPP, and UHS.
          </p>
        </div>

        <div className="text-xs text-stone-500 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold shrink-0 flex items-center space-x-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>100% Free Peer Mentorship</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by major, university (ITC, CADT), or skill..."
            className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {roles.map((r) => (
            <button
              key={r.value}
              onClick={() => setSelectedRole(r.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedRole === r.value
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mentor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMentors.map((mentor) => {
          const isSaved = savedMentorIds.includes(mentor.id);
          const commentsCount = (commentsMap[mentor.id] || []).length;
          const isLiked = likedPosts[mentor.id] || false;

          return (
            <div
              key={mentor.id}
              className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Top Row: Avatar & Basic Meta */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={mentor.avatar}
                      alt={mentor.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-stone-200 shadow-xs shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h2 className="font-bold text-stone-900 text-base">{mentor.name}</h2>
                        {mentor.isVerified && (
                          <span title="Verified Senior">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-indigo-600 font-semibold">{mentor.title}</p>
                      <p className="text-[11px] text-stone-500">{mentor.university}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleSaveMentor(mentor.id)}
                    className={`p-2 rounded-xl transition-colors ${
                      isSaved
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                    }`}
                    title={isSaved ? 'Remove bookmark' : 'Bookmark mentor'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
                  </button>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                  {mentor.bio}
                </p>

                {/* Expertise Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {mentor.expertiseTags.slice(0, 4).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold px-2.5 py-0.5 bg-stone-100 text-stone-700 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Public Bulletin Post Preview (Facebook Style) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Senior Advice Bulletin:
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Public Thread</span>
                  </div>
                  <p className="text-slate-700 italic line-clamp-2 text-[11px]">
                    &quot;Welcome high school students! Ask me anything below in the public comments about Tronc Commun exams, degree pathways, or scholarship preparations.&quot;
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-indigo-700 font-bold flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3 text-indigo-600" />
                      <span>{commentsCount} Public Questions &amp; Comments</span>
                    </span>
                    <button
                      onClick={() => setSelectedMentorForComments(mentor)}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      Open Comments Wall →
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-bold text-stone-900 flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{mentor.rating}</span>
                  </span>
                  <span className="text-stone-400">•</span>
                  <span className="text-stone-500">{mentor.studentsHelped} guided</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedMentorForComments(mentor)}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition flex items-center space-x-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Comments ({commentsCount})</span>
                  </button>

                  <button
                    onClick={() => onOpenBooking(mentor)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-xs transition"
                  >
                    Book 1-on-1
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mentor Profile & Facebook-Style Public Comment Wall Modal */}
      {currentModalMentor && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${currentModalMentor.name} Public Comments`}
          onClick={() => {
            setSelectedMentorForBio(null);
            setSelectedMentorForComments(null);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-6 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center space-x-3.5">
                <img
                  src={currentModalMentor.avatar}
                  alt={currentModalMentor.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-stone-200 shadow-xs"
                />
                <div>
                  <h3 className="font-bold text-stone-900 text-lg flex items-center space-x-1.5">
                    <span>{currentModalMentor.name}</span>
                    {currentModalMentor.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </h3>
                  <p className="text-xs text-indigo-600 font-semibold">{currentModalMentor.title}</p>
                  <p className="text-xs text-stone-500">{currentModalMentor.university}</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close mentor comments dialog"
                onClick={() => {
                  setSelectedMentorForBio(null);
                  setSelectedMentorForComments(null);
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Child Safety Badge Inside Modal */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-xs text-amber-950 flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Child &amp; Teenager Safety Rule:</strong> Direct private messaging is deactivated. Post questions below on {currentModalMentor.name}&apos;s profile wall. All comments and verified answers are public so all students learn together in safety.
              </p>
            </div>

            {/* Mentor Public Post (Facebook Post Style) */}
            <div className="border border-slate-200 rounded-3xl p-5 bg-white shadow-xs space-y-4">
              {/* Author Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={currentModalMentor.avatar}
                    alt={currentModalMentor.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {currentModalMentor.name}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Author • {currentModalMentor.university} • Public Advice Post
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">Pinned Advisory</span>
              </div>

              {/* Post Body Content */}
              <div className="text-xs text-slate-800 leading-relaxed space-y-2">
                <p>{currentModalMentor.bio}</p>
                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-950 space-y-1">
                  <span className="font-bold block text-[11px]">
                    💬 &quot;Ask me anything below in the comments!&quot;
                  </span>
                  <p className="text-[11px] text-indigo-900">
                    Feel free to ask about Tronc Commun survival strategies, high-school math preparation, MPTC scholarships, or choosing between software and data science.
                  </p>
                </div>
              </div>

              {/* Post Interaction Bar (Like, Comment counts) */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleLikePost(currentModalMentor.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                      likedPosts[currentModalMentor.id]
                        ? 'text-blue-600 bg-blue-50 font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${likedPosts[currentModalMentor.id] ? 'fill-blue-600' : ''}`} />
                    <span>{likedPosts[currentModalMentor.id] ? 'Liked (43)' : 'Helpful (42)'}</span>
                  </button>

                  <span className="text-slate-300">•</span>

                  <span className="flex items-center space-x-1 text-slate-600 font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>{(commentsMap[currentModalMentor.id] || []).length} comments</span>
                  </span>
                </div>

                <span className="text-[10px] text-emerald-600 font-bold">✓ Moderated Public Space</span>
              </div>

              {/* FACEBOOK STYLE COMMENT INPUT */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-start space-x-3">
                  <img
                    src={
                      studentProfile?.avatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
                    }
                    alt={studentProfile?.name || 'Student'}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 mt-1 shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="relative">
                      <textarea
                        rows={2}
                        value={newCommentInput}
                        onChange={(e) => setNewCommentInput(e.target.value)}
                        placeholder={`Ask a public question or comment for ${currentModalMentor.name}...`}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        Commenting publicly as {studentProfile?.name || 'Vannak Sam (Grade 12)'}
                      </span>
                      <button
                        onClick={() => handlePostComment(currentModalMentor.id)}
                        disabled={!newCommentInput.trim()}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-xs"
                      >
                        <span>Post Comment</span>
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PUBLIC COMMENTS LIST (FACEBOOK STYLE THREAD) */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Public Comments &amp; Q&amp;A ({(commentsMap[currentModalMentor.id] || []).length})
                </h4>

                <div className="space-y-3.5">
                  {(commentsMap[currentModalMentor.id] || []).map((comment) => (
                    <div key={comment.id} className="space-y-2">
                      {/* Student Comment Bubble */}
                      <div className="flex items-start space-x-2.5">
                        <img
                          src={comment.studentAvatar}
                          alt={comment.studentName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="bg-slate-100/80 rounded-2xl p-3 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs">
                                {comment.studentName}
                              </span>
                              <span className="text-[10px] text-slate-400">{comment.timestamp}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block">
                              {comment.studentSchool}
                            </span>
                            <p className="text-slate-800 leading-relaxed pt-0.5">{comment.text}</p>
                          </div>

                          <div className="flex items-center space-x-3 px-2 text-[11px] text-slate-500">
                            <button
                              onClick={() => handleToggleLikeComment(currentModalMentor.id, comment.id)}
                              className={`font-semibold hover:underline flex items-center space-x-1 ${
                                comment.hasLiked ? 'text-indigo-600 font-bold' : ''
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{comment.likesCount} Helpful</span>
                            </button>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400">Public Question</span>
                          </div>
                        </div>
                      </div>

                      {/* Mentor Official Reply (Nested) */}
                      {comment.mentorReply && (
                        <div className="ml-9 pl-3 border-l-2 border-indigo-200 flex items-start space-x-2.5">
                          <img
                            src={comment.mentorReply.mentorAvatar}
                            alt={comment.mentorReply.mentorName}
                            className="w-6 h-6 rounded-full object-cover border border-indigo-300 shrink-0 mt-0.5"
                          />
                          <div className="flex-1 bg-indigo-50/80 rounded-2xl p-2.5 text-xs space-y-1 border border-indigo-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-indigo-950 text-[11px]">
                                  {comment.mentorReply.mentorName}
                                </span>
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-600 text-white">
                                  Mentor
                                </span>
                              </div>
                              <span className="text-[9px] text-indigo-400">
                                {comment.mentorReply.timestamp}
                              </span>
                            </div>
                            <p className="text-indigo-900 leading-relaxed text-[11px]">
                              {comment.mentorReply.text}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <button
                onClick={() => {
                  setSelectedMentorForBio(null);
                  setSelectedMentorForComments(null);
                }}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-50 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const m = currentModalMentor;
                  setSelectedMentorForBio(null);
                  setSelectedMentorForComments(null);
                  onOpenBooking(m);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
              >
                Proceed to Book 1-on-1 Guidance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
