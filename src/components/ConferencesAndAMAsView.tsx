import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Users,
  Video,
  Clock,
  MapPin,
  CheckCircle2,
  Share2,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Plus,
  X,
  Ticket,
  Search,
  Filter,
  GraduationCap,
  Award,
} from 'lucide-react';
import { TabView } from '../types';

export interface ConferenceEvent {
  id: string;
  title: string;
  subtitle: string;
  category: 'University Orientation' | 'Live AMA' | 'Career Keynote' | 'STEM Workshop';
  date: string;
  time: string;
  duration: string;
  platform: string;
  meetingLink?: string;
  hostOrg: string;
  isFeatured?: boolean;
  coverImage?: string;
  attendeesCount: number;
  maxAttendees?: number;
  speakers: {
    name: string;
    role: string;
    organization: string;
    avatar: string;
  }[];
  agenda: {
    time: string;
    topic: string;
  }[];
  highlights: string[];
  qaQuestions: {
    id: string;
    studentName: string;
    school: string;
    question: string;
    upvotes: number;
    hasUpvoted?: boolean;
    isAnswered?: boolean;
    answer?: string;
  }[];
}

const initialEvents: ConferenceEvent[] = [
  {
    id: 'conf-stem-2026',
    title: 'Cambodia National STEM & University Career Conference 2026',
    subtitle: 'The flagship virtual career orientation summit for Grade 10-12 students & freshmen across Cambodia.',
    category: 'Career Keynote',
    date: 'Saturday, Sep 19, 2026',
    time: '08:30 AM - 04:30 PM (ICT)',
    duration: 'Full Day Event',
    platform: 'Virtual Livestream & CADT Grand Hall',
    meetingLink: 'https://meet.google.com/ais-cambodia-stem2026',
    hostOrg: 'MoEYS & Cambodia STEM Alliance',
    isFeatured: true,
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
    attendeesCount: 1420,
    maxAttendees: 2500,
    speakers: [
      {
        name: 'H.E. Dr. Seng Sopheap',
        role: 'President & Tech Policy Leader',
        organization: 'Cambodia Academy of Digital Tech (CADT)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      },
      {
        name: 'Dr. Po Kimtho',
        role: 'Director General',
        organization: 'Institute of Technology of Cambodia (ITC)',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      },
      {
        name: 'Chantha Srey',
        role: 'AI Research Engineer',
        organization: 'STEAM Cambodia / AI Lab',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      },
    ],
    agenda: [
      { time: '08:30 - 09:15 AM', topic: 'Opening Ceremony: Digital Transformation & Tech Talent in Cambodia' },
      { time: '09:30 - 11:00 AM', topic: 'University Deans Panel: Choosing between ITC, CADT, RUPP & International Programs' },
      { time: '11:15 - 12:30 PM', topic: 'Scholarships Masterclass: MPTC, SmartEdu, and Overseas Grants' },
      { time: '01:30 - 03:00 PM', topic: 'Breakout AMA Rooms with Senior Students & Alumni' },
      { time: '03:15 - 04:30 PM', topic: 'Future Careers in AI, FinTech, and Renewable Energy' },
    ],
    highlights: [
      'Digital Certificate of Participation provided by MoEYS',
      'Direct interaction with university admissions officers',
      'Free scholarship handbook download',
    ],
    qaQuestions: [
      {
        id: 'q1',
        studentName: 'Dara Heng',
        school: 'Preah Sisowath High School',
        question: 'Will there be dedicated scholarship quotas for female students applying for software engineering at CADT this year?',
        upvotes: 42,
        isAnswered: true,
        answer: 'Yes! CADT and MPTC maintain affirmative action initiatives including female leadership bursaries covering full tuition and living allowances.',
      },
      {
        id: 'q2',
        studentName: 'Sreynet Mom',
        school: 'Bak Touk High School',
        question: 'How many students typically get hired before graduating from the ITC Data Science engineering program?',
        upvotes: 35,
        isAnswered: false,
      },
    ],
  },
  {
    id: 'ama-itc-tronc-commun',
    title: 'ITC Tronc Commun (Foundation Year) Survival & Major Selection AMA',
    subtitle: 'Ask senior top-rankers anything about passing calculus, exam strategies, and picking Data Science vs. Software vs. Telecom.',
    category: 'Live AMA',
    date: 'Wednesday, Sep 9, 2026',
    time: '06:30 PM - 08:00 PM (ICT)',
    duration: '90 Minutes',
    platform: 'Google Meet (Interactive)',
    meetingLink: 'https://meet.google.com/ais-itc-ama-session',
    hostOrg: 'ITC Senior Student Council',
    attendeesCount: 380,
    maxAttendees: 500,
    speakers: [
      {
        name: 'Sokha Meng',
        role: 'Year 4 Data Science Senior (Top 5% Tronc Commun)',
        organization: 'ITC Faculty of EE',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      },
      {
        name: 'Bopha Chhum',
        role: 'Year 4 Telecom Senior & TA',
        organization: 'ITC',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      },
    ],
    agenda: [
      { time: '06:30 - 07:00 PM', topic: 'Tronc Commun syllabus breakdown: Math, Physics, and Lab practicals' },
      { time: '07:00 - 07:45 PM', topic: 'Live Open AMA: High school student questions on exams & ranking' },
      { time: '07:45 - 08:00 PM', topic: 'Study group formation & resources sharing' },
    ],
    highlights: [
      'Free past Tronc Commun exam paper walkthroughs',
      'Realistic advice on study hours & avoiding probation',
      'Laptop specifications guide for engineering labs',
    ],
    qaQuestions: [
      {
        id: 'q-itc-1',
        studentName: 'Vannak Sam',
        school: 'Bak Touk High School',
        question: 'Is French language still mandatory to pass the first two years of Tronc Commun, or are lectures in English/Khmer?',
        upvotes: 28,
        isAnswered: true,
        answer: 'Most technical lectures and lecture slides are now in English and Khmer. French is taught as a language module, but does not prevent you from passing math or programming subjects.',
      },
      {
        id: 'q-itc-2',
        studentName: 'Chhorvy Pich',
        school: 'Hun Sen Kampong Cham High School',
        question: 'Can provincial students apply for on-campus dormitories at ITC during Year 1?',
        upvotes: 19,
        isAnswered: false,
      },
    ],
  },
  {
    id: 'ama-cadt-software',
    title: 'CADT Digital Tech & Software Engineering: Day in the Life AMA',
    subtitle: 'Learn what it is really like to study modern cloud, web engineering, and product sprints at CADT with scholarship holders.',
    category: 'Live AMA',
    date: 'Sunday, Sep 13, 2026',
    time: '04:00 PM - 05:30 PM (ICT)',
    duration: '90 Minutes',
    platform: 'Zoom Interactive Panel',
    meetingLink: 'https://zoom.us/j/cadt-student-ama-2026',
    hostOrg: 'CADT Student Developer Circle',
    attendeesCount: 410,
    maxAttendees: 600,
    speakers: [
      {
        name: 'Vireak Rith',
        role: 'Year 3 Software Engineering & MPTC Scholar',
        organization: 'CADT (IDRI)',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      },
      {
        name: 'Kanya Som',
        role: 'Year 2 Cloud Architect Student',
        organization: 'CADT',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      },
    ],
    agenda: [
      { time: '04:00 - 04:25 PM', topic: 'Why CADT is project-based: No memorization, only building real code' },
      { time: '04:25 - 05:10 PM', topic: 'Live Student Q&A: Preparing for the CADT Entrance Aptitude Test' },
      { time: '05:10 - 05:30 PM', topic: 'GitHub and portfolio building from Year 1' },
    ],
    highlights: [
      'Live demonstration of Year 1 student final projects',
      'MPTC Aptitude Test sample questions explained',
    ],
    qaQuestions: [
      {
        id: 'q-cadt-1',
        studentName: 'Rathana Long',
        school: 'Tuol Tom Poung High School',
        question: 'Do I need prior coding experience before joining CADT Year 1, or do they teach from scratch?',
        upvotes: 31,
        isAnswered: true,
        answer: 'They teach programming from zero! What matters is strong logical thinking, math fundamentals, and dedication to practicing code outside class.',
      },
    ],
  },
  {
    id: 'conf-uhs-med',
    title: 'Ask a Medical Doctor: Surviving 8 Years of Medicine at UHS',
    subtitle: 'Candid reflections on the National Concours entrance exam, anatomy flashcards, hospital shifts, and doctor life in Cambodia.',
    category: 'University Orientation',
    date: 'Friday, Sep 18, 2026',
    time: '07:00 PM - 08:30 PM (ICT)',
    duration: '90 Minutes',
    platform: 'Google Meet Livestream',
    meetingLink: 'https://meet.google.com/uhs-doctor-ama-talk',
    hostOrg: 'Cambodian Medical Students Association (CMSA)',
    attendeesCount: 520,
    maxAttendees: 750,
    speakers: [
      {
        name: 'Dr. Sreymom Meas',
        role: 'Resident Physician & UHS Alumna',
        organization: 'Calmette Hospital & UHS',
        avatar: 'https://images.unsplash.com/photo-1594824813589-3221b2b8e5c5?w=200&auto=format&fit=crop&q=80',
      },
    ],
    agenda: [
      { time: '07:00 - 07:30 PM', topic: 'The Reality of the 8-Year Journey: Pre-clinical vs. Clinical years' },
      { time: '07:30 - 08:15 PM', topic: 'Open Q&A on Concours exam prep: Biology, Chemistry & Mental Health' },
      { time: '08:15 - 08:30 PM', topic: 'Financial reality and hospital residency salaries' },
    ],
    highlights: [
      'Honest breakdown of work-life balance in Cambodian hospitals',
      'High-yield biology and chemistry preparation roadmap',
    ],
    qaQuestions: [
      {
        id: 'q-med-1',
        studentName: 'Srey Mao',
        school: 'Preah Monivong High School',
        question: 'If you fail the Year 1 ranking exam at UHS, can you still transition into Pharmacy or Dentistry?',
        upvotes: 24,
        isAnswered: true,
        answer: 'Yes, depending on your final ranking score, students often redirect into Dentistry, Pharmacy, or Nursing without losing credit for general sciences.',
      },
    ],
  },
  {
    id: 'conf-women-stem',
    title: 'Women in STEM Cambodia: AI & Robotics Innovation Talks',
    subtitle: 'Meet female Cambodian engineers leading robotics labs, machine learning initiatives, and regional competitions.',
    category: 'STEM Workshop',
    date: 'Saturday, Sep 26, 2026',
    time: '02:00 PM - 04:00 PM (ICT)',
    duration: '2 Hours',
    platform: 'Virtual Workshop & Live Demo',
    meetingLink: 'https://meet.google.com/stem-women-kh-2026',
    hostOrg: 'Cambodia Women Tech Network & JICA',
    attendeesCount: 290,
    maxAttendees: 400,
    speakers: [
      {
        name: 'Bona Keo',
        role: 'Robotics Engineering Lead',
        organization: 'RoboTech Cambodia',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      },
      {
        name: 'Chenda Lim',
        role: 'Data Scientist',
        organization: 'Morodok FinTech',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      },
    ],
    agenda: [
      { time: '02:00 - 02:40 PM', topic: 'Building IoT robotics solutions for Cambodian agriculture & cities' },
      { time: '02:40 - 03:30 PM', topic: 'Breaking industry stereotypes: Confidence, mentors & scholarships' },
      { time: '03:30 - 04:00 PM', topic: 'Hands-on simulator demo: Programming micro-controllers in Python' },
    ],
    highlights: [
      'Interactive robotics code templates provided to attendees',
      'Peer mentorship group for high school female coders',
    ],
    qaQuestions: [
      {
        id: 'q-w-1',
        studentName: 'Phalla Som',
        school: 'Indra Devi High School',
        question: 'Are there student robotics clubs in Phnom Penh that welcome high school beginners?',
        upvotes: 18,
        isAnswered: true,
        answer: 'Yes! Both CADT and ITC host weekly open robotics meetups on Saturday mornings, open to all high schoolers.',
      },
    ],
  },
];

interface ConferencesAndAMAsViewProps {
  studentName?: string;
  onNavigateTab: (tab: TabView) => void;
  onOpenBooking?: (mentor: any) => void;
}

export const ConferencesAndAMAsView: React.FC<ConferencesAndAMAsViewProps> = ({
  studentName = 'Vannak Sam',
  onNavigateTab,
}) => {
  const [events, setEvents] = useState<ConferenceEvent[]>(initialEvents);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [registeredIds, setRegisteredIds] = useState<string[]>(['conf-stem-2026']);
  const [activeModalEvent, setActiveModalEvent] = useState<ConferenceEvent | null>(null);
  const [activeTicketEvent, setActiveTicketEvent] = useState<ConferenceEvent | null>(null);
  const [activeQAEvent, setActiveQAEvent] = useState<ConferenceEvent | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const categories = [
    { label: 'All Conferences & AMAs', value: 'ALL' },
    { label: 'Live AMAs', value: 'Live AMA' },
    { label: 'University Orientation', value: 'University Orientation' },
    { label: 'Career Keynotes', value: 'Career Keynote' },
    { label: 'STEM Workshops', value: 'STEM Workshop' },
    { label: 'My Registered Passes', value: 'REGISTERED' },
  ];

  const handleToggleRegister = (e: React.MouseEvent, event: ConferenceEvent) => {
    e.stopPropagation();
    if (registeredIds.includes(event.id)) {
      setRegisteredIds((prev) => prev.filter((id) => id !== event.id));
      setNotificationMsg(`Registration cancelled for: ${event.title}`);
    } else {
      setRegisteredIds((prev) => [...prev, event.id]);
      setActiveTicketEvent(event);
      setNotificationMsg(`🎉 Registered successfully! Your Virtual Pass for "${event.title}" is ready.`);
    }
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleUpvoteQuestion = (eventId: string, questionId: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          qaQuestions: ev.qaQuestions.map((q) => {
            if (q.id !== questionId) return q;
            const already = q.hasUpvoted;
            return {
              ...q,
              upvotes: already ? q.upvotes - 1 : q.upvotes + 1,
              hasUpvoted: !already,
            };
          }),
        };
      })
    );
    if (activeQAEvent && activeQAEvent.id === eventId) {
      setActiveQAEvent((curr) => {
        if (!curr) return null;
        return {
          ...curr,
          qaQuestions: curr.qaQuestions.map((q) => {
            if (q.id !== questionId) return q;
            const already = q.hasUpvoted;
            return {
              ...q,
              upvotes: already ? q.upvotes - 1 : q.upvotes + 1,
              hasUpvoted: !already,
            };
          }),
        };
      });
    }
  };

  const handleAddQuestion = (eventId: string) => {
    if (!newQuestionText.trim()) return;
    const newQ = {
      id: `q-${Date.now()}`,
      studentName: studentName || 'Student Scholar',
      school: 'Grade 12 Student',
      question: newQuestionText.trim(),
      upvotes: 1,
      hasUpvoted: true,
      isAnswered: false,
    };

    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          qaQuestions: [newQ, ...ev.qaQuestions],
        };
      })
    );

    if (activeQAEvent && activeQAEvent.id === eventId) {
      setActiveQAEvent((curr) => {
        if (!curr) return null;
        return {
          ...curr,
          qaQuestions: [newQ, ...curr.qaQuestions],
        };
      });
    }

    setNewQuestionText('');
    setNotificationMsg('Question submitted to speaker panel! Other students can now upvote it.');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const filteredEvents = events.filter((ev) => {
    const matchesCategory =
      activeCategory === 'ALL'
        ? true
        : activeCategory === 'REGISTERED'
        ? registeredIds.includes(ev.id)
        : ev.category === activeCategory;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ev.title.toLowerCase().includes(q) ||
      ev.subtitle.toLowerCase().includes(q) ||
      ev.hostOrg.toLowerCase().includes(q) ||
      ev.speakers.some((s) => s.name.toLowerCase().includes(q) || s.organization.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const featuredEvent = events.find((e) => e.isFeatured) || events[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in-50 duration-300">
      {/* Toast notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Conferences & AMAs
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Free Student Passes
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Join live virtual panels, university orientation summits, and senior Ask-Me-Anything sessions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveCategory('REGISTERED')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-200 shadow-2xs"
          >
            <Ticket className="w-4 h-4 text-indigo-600" />
            <span>My Virtual Passes ({registeredIds.length})</span>
          </button>
        </div>
      </div>

      {/* Featured Big Summit Banner */}
      {featuredEvent && (
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white border border-slate-800 shadow-xl">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
            style={{
              backgroundImage: `url(${featuredEvent.coverImage})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />

          <div className="relative z-10 p-6 sm:p-8 lg:p-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                ⭐ Featured National Summit
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-slate-200 backdrop-blur-xs">
                {featuredEvent.category}
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Free Virtual Access
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {featuredEvent.title}
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {featuredEvent.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="font-semibold">{featuredEvent.date}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{featuredEvent.time}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{featuredEvent.platform}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                <span>{featuredEvent.attendeesCount} students registered</span>
              </div>
            </div>

            {/* Keynote Speakers Preview */}
            <div className="pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Keynote Speakers:
              </div>
              <div className="flex flex-wrap gap-3">
                {featuredEvent.speakers.map((sp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10"
                  >
                    <img
                      src={sp.avatar}
                      alt={sp.name}
                      className="w-7 h-7 rounded-full object-cover border border-white/20"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-white truncate">{sp.name}</p>
                      <p className="text-[10px] text-slate-300 truncate">{sp.organization}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={(e) => handleToggleRegister(e, featuredEvent)}
                className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg active:scale-95 ${
                  registeredIds.includes(featuredEvent.id)
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>
                  {registeredIds.includes(featuredEvent.id)
                    ? '✓ Virtual Pass Registered (View Ticket)'
                    : 'Claim Free Student Pass'}
                </span>
              </button>

              <button
                onClick={() => setActiveModalEvent(featuredEvent)}
                className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-xs transition flex items-center space-x-1.5"
              >
                <span>View Full Agenda & Q&A</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conferences, AMAs, topics, or speakers..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <span>Showing {filteredEvents.length} events</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => {
            const isSelected = activeCategory === c.value;
            return (
              <button
                key={c.value}
                onClick={() => setActiveCategory(c.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((event) => {
          const isRegistered = registeredIds.includes(event.id);
          return (
            <div
              key={event.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      {event.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      by {event.hostOrg}
                    </span>
                  </div>

                  {isRegistered && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                      Pass Claimed
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => setActiveModalEvent(event)}
                  className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition cursor-pointer leading-snug"
                >
                  {event.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {event.subtitle}
                </p>

                {/* Event Schedule Info */}
                <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5 text-xs text-slate-600 border border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-800">{event.date}</span>
                    <span className="text-slate-300">•</span>
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Video className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{event.platform}</span>
                  </div>
                </div>

                {/* Speakers Preview */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Speakers & Seniors:
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2 overflow-hidden">
                      {event.speakers.map((sp, idx) => (
                        <img
                          key={idx}
                          src={sp.avatar}
                          alt={sp.name}
                          className="inline-block w-8 h-8 rounded-full ring-2 ring-white object-cover"
                          title={`${sp.name} - ${sp.role}`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-slate-600 font-medium truncate">
                      {event.speakers.map((s) => s.name).join(', ')}
                    </div>
                  </div>
                </div>

                {/* Questions Preview */}
                {event.qaQuestions && event.qaQuestions.length > 0 && (
                  <div className="bg-blue-50/50 rounded-xl p-2.5 text-xs text-blue-900 border border-blue-100/60 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 truncate">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-semibold">{event.qaQuestions.length} Student Questions Submitted</span>
                    </div>
                    <button
                      onClick={() => setActiveQAEvent(event)}
                      className="text-[11px] font-bold text-blue-700 hover:underline shrink-0 ml-2"
                    >
                      View Q&A Board →
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveModalEvent(event)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Full Agenda & Speakers
                </button>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setActiveQAEvent(event)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                    title="Ask Speaker a Question"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </button>

                  <button
                    onClick={(e) => handleToggleRegister(e, event)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 ${
                      isRegistered
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>{isRegistered ? 'View Pass' : 'Register Free'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Event Details Modal */}
      {activeModalEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  {activeModalEvent.category}
                </span>
                <h3 className="font-bold text-slate-900 text-xl">{activeModalEvent.title}</h3>
                <p className="text-xs text-slate-500">Organized by {activeModalEvent.hostOrg}</p>
              </div>
              <button
                onClick={() => setActiveModalEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {activeModalEvent.subtitle}
            </p>

            {/* Logistics summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date & Time</span>
                <p className="text-xs font-bold text-slate-800">{activeModalEvent.date}</p>
                <p className="text-xs text-slate-600">{activeModalEvent.time}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Platform & Access</span>
                <p className="text-xs font-bold text-slate-800">{activeModalEvent.platform}</p>
                <p className="text-xs text-emerald-600 font-semibold">Free Virtual Pass Required</p>
              </div>
            </div>

            {/* Agenda */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Event Agenda</h4>
              <div className="space-y-1.5">
                {activeModalEvent.agenda.map((ag, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3 text-xs"
                  >
                    <span className="font-mono font-bold text-blue-600 shrink-0">{ag.time}</span>
                    <span className="text-slate-800 font-medium">{ag.topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Speakers */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Featured Speakers</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {activeModalEvent.speakers.map((sp, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border border-slate-200 flex items-center space-x-3"
                  >
                    <img
                      src={sp.avatar}
                      alt={sp.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{sp.name}</p>
                      <p className="text-[11px] text-blue-600 truncate">{sp.role}</p>
                      <p className="text-[10px] text-slate-400 truncate">{sp.organization}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  const ev = activeModalEvent;
                  setActiveModalEvent(null);
                  setActiveQAEvent(ev);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Speaker Q&A Board ({activeModalEvent.qaQuestions.length})</span>
              </button>

              <button
                onClick={(e) => {
                  handleToggleRegister(e, activeModalEvent);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-xs ${
                  registeredIds.includes(activeModalEvent.id)
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {registeredIds.includes(activeModalEvent.id)
                  ? 'Pass Claimed • View Digital Ticket'
                  : 'Register Free Virtual Pass'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Pass / Ticket Modal */}
      {activeTicketEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="flex justify-end">
              <button
                onClick={() => setActiveTicketEvent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                Official Virtual Pass
              </span>
              <h3 className="text-lg font-black text-slate-900">{activeTicketEvent.title}</h3>
              <p className="text-xs text-slate-500">Attendee: {studentName} • Grade 12 Scholar</p>
            </div>

            {/* Pass Ticket Stub */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-300 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Pass ID:</span>
                <span className="font-mono font-bold text-slate-800">KH-STEM-{activeTicketEvent.id.slice(0, 6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-bold text-slate-800">{activeTicketEvent.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time:</span>
                <span className="font-bold text-slate-800">{activeTicketEvent.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Access:</span>
                <span className="font-bold text-emerald-600">Free Virtual Access Link Ready</span>
              </div>
            </div>

            {activeTicketEvent.meetingLink && (
              <a
                href={activeTicketEvent.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-xs"
              >
                <Video className="w-4 h-4" />
                <span>Join Virtual Room Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => setActiveTicketEvent(null)}
              className="w-full py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Done & Add to My Passes
            </button>
          </div>
        </div>
      )}

      {/* Speaker Q&A Board Modal */}
      {activeQAEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">Live Student AMA Q&A Board</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{activeQAEvent.title}</p>
              </div>
              <button
                onClick={() => setActiveQAEvent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-950 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Speaker Panel Q&A Rules:
              </span>
              <p className="text-slate-600">
                Submit questions for speakers. High-school students can upvote questions to bring them to the top of the live speaker queue during the broadcast!
              </p>
            </div>

            {/* Question submit input */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddQuestion(activeQAEvent.id);
                  }}
                  placeholder="Ask the speakers about university entrance, calculus, scholarships..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
                <button
                  onClick={() => handleAddQuestion(activeQAEvent.id)}
                  disabled={!newQuestionText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shrink-0 transition"
                >
                  Post
                </button>
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-3 divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
              {activeQAEvent.qaQuestions.map((q) => (
                <div key={q.id} className="pt-3 flex items-start space-x-3 text-xs">
                  <button
                    onClick={() => handleUpvoteQuestion(activeQAEvent.id, q.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition shrink-0 ${
                      q.hasUpvoted
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold mt-0.5">{q.upvotes}</span>
                  </button>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{q.studentName}</span>
                      <span className="text-[10px] text-slate-400">{q.school}</span>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed">{q.question}</p>

                    {q.isAnswered && q.answer && (
                      <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
                        <span className="font-bold text-[10px] text-emerald-700 uppercase tracking-wider block">
                          ✓ Speaker Answer:
                        </span>
                        <p className="text-[11px] leading-relaxed">{q.answer}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveQAEvent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Close Q&A Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
