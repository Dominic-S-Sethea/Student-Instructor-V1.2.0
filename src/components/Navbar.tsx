import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Users,
  ChevronDown,
  Sparkles,
  BookOpen,
  MessageSquare,
  Search,
  Bell,
  CheckCircle2,
  User,
  GraduationCap,
  Award,
  Calendar,
  Gamepad2,
  ArrowLeft,
  Menu,
  X,
  Play,
  Briefcase,
  FileText,
  Shield,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Layers,
} from 'lucide-react';
import { TabView, StudentProfile, NotificationItem } from '../types';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  currentTab?: TabView;
  activeTab?: TabView;
  setCurrentTab?: (tab: TabView) => void;
  onSelectTab?: (tab: TabView) => void;
  onTabChange?: (tab: TabView) => void;
  studentProfile?: StudentProfile;
  studentName?: string;
  studentAvatar?: string;
  unreadMessagesCount?: number;
  unreadNotificationsCount?: number;
  notifications?: NotificationItem[];
  onMarkNotificationRead?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onOpenDemoFlow?: () => void;
  onOpenAdminModal?: () => void;
  onOpenPatchNotes?: () => void;
  onBack?: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab: propCurrentTab,
  activeTab: propActiveTab,
  setCurrentTab: propSetCurrentTab,
  onSelectTab: propOnSelectTab,
  onTabChange: propOnTabChange,
  studentProfile,
  studentName,
  studentAvatar,
  unreadMessagesCount = 0,
  unreadNotificationsCount = 0,
  onOpenDemoFlow,
  onOpenAdminModal,
  onOpenPatchNotes,
  onBack,
  onGoBack,
  canGoBack = false,
}) => {
  const currentTab = propCurrentTab || propActiveTab || 'dashboard';
  const handleSelectTab = (tab: TabView) => {
    if (propSetCurrentTab) propSetCurrentTab(tab);
    else if (propOnSelectTab) propOnSelectTab(tab);
    else if (propOnTabChange) propOnTabChange(tab);
  };

  const handleBack = onBack || onGoBack;

  const { t } = useLanguage();
  const desktopNavScroll = useDraggableScroll<HTMLDivElement>();
  const mobileNavScroll = useDraggableScroll<HTMLDivElement>();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mentorsOpen, setMentorsOpen] = useState(false);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifFilter, setNotifFilter] = useState<'all' | 'mentorship' | 'events'>('all');

  const [notificationsList, setNotificationsList] = useState([
    {
      id: 'n1',
      type: 'session',
      title: '1-on-1 Mentorship Confirmed',
      desc: 'Dr. Sok Dara accepted your session for Saturday at 4:00 PM (Data Science & AI).',
      time: '10 mins ago',
      read: false,
      targetTab: 'messages' as TabView,
    },
    {
      id: 'n2',
      type: 'event',
      title: 'Live Talk Starting Soon',
      desc: "'Ask a Senior Software Engineer' AMA starts in 2 days. Virtual pass ready.",
      time: '2 hours ago',
      read: false,
      targetTab: 'events' as TabView,
    },
    {
      id: 'n3',
      type: 'community',
      title: 'Senior Mentor Replied',
      desc: "Chantha Srey commented on your post: 'ITC vs CADT for Computer Science'.",
      time: '1 day ago',
      read: true,
      targetTab: 'community' as TabView,
    },
    {
      id: 'n4',
      type: 'system',
      title: 'STEM Discovery Milestone',
      desc: 'You scored in the top 10% for Analytical Problem Solving. View your certificate.',
      time: '2 days ago',
      read: true,
      targetTab: 'stem-discovery' as TabView,
    },
  ]);

  const navHeaderRef = useRef<HTMLElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
        setMentorsOpen(false);
        setDiscoveryOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [searchOpen]);

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item: (typeof notificationsList)[0]) => {
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    if (item.targetTab) {
      handleSelectTab(item.targetTab);
    }
    setNotificationsOpen(false);
  };

  const filteredNotifs = notificationsList.filter((n) => {
    if (notifFilter === 'mentorship') return n.type === 'session' || n.type === 'community';
    if (notifFilter === 'events') return n.type === 'event';
    return true;
  });

  const mentorshipItems = [
    {
      id: 'community' as TabView,
      title: 'Digital Campus & Circles',
      desc: 'Academic Q&A circles, student projects, events & partners.',
      icon: Users,
      badge: 'Campus',
    },
    {
      id: 'mentors' as TabView,
      title: '1-on-1 Mentors',
      desc: 'Connect with verified senior students & professionals.',
      icon: Users,
      badge: 'Verified',
    },
    {
      id: 'alumni' as TabView,
      title: 'University Alumni Hub',
      desc: 'Insights from ITC, CADT, RUPP & international universities.',
      icon: GraduationCap,
      badge: 'Campuses',
    },
    {
      id: 'meetups' as TabView,
      title: 'Student Study Circles',
      desc: 'Peer study meetups, coding groups & exam review.',
      icon: MessageSquare,
      badge: 'Peer Study',
    },
    {
      id: 'become-mentor' as TabView,
      title: 'Apply as Mentor',
      desc: 'Share your experience and guide fellow students.',
      icon: Award,
      badge: 'Join',
    },
  ];

  const discoveryItems = [
    {
      id: 'decision-engine' as TabView,
      title: 'Student Decision Engine',
      desc: '6-stage fit finder: cognitive match, major alternatives & ROI action plan.',
      icon: Compass,
      badge: 'Find Fit',
    },
    {
      id: 'university-intelligence' as TabView,
      title: 'University Intelligence & Matrix',
      desc: '9-point framework, 30/20/20/30 profile scores & comparison matrix.',
      icon: Building2,
      badge: '9-Point DB',
    },
    {
      id: 'stem-discovery' as TabView,
      title: 'STEM Discovery Lab',
      desc: 'Interactive scenarios, ability challenges & major guidance.',
      icon: Gamepad2,
      badge: 'Quests',
    },
    {
      id: 'opportunities' as TabView,
      title: 'Majors & Careers Directory',
      desc: 'Explore degree pathways, high-demand skills & scholarships.',
      icon: Briefcase,
      badge: 'Roadmaps',
    },
    {
      id: 'events' as TabView,
      title: 'Conferences & AMAs',
      desc: 'Attend free webinars, university talks & career orientation.',
      icon: Calendar,
      badge: 'Free Events',
    },
  ];

  const isMentorshipActive = ['community', 'mentors', 'alumni', 'meetups', 'become-mentor'].includes(currentTab);
  const isDiscoveryActive = ['decision-engine', 'university-intelligence', 'stem-discovery', 'opportunities', 'events'].includes(currentTab);

  const searchResults = [
    { label: 'AI Student Advisor', category: 'Guidance', tab: 'advisor' as TabView, icon: Sparkles },
    {
      label: 'Scholarship Search Engine (Global & Cambodia)',
      category: 'Scholarship',
      tab: 'scholarships' as TabView,
      icon: Award,
    },
    {
      label: 'STEM Self-Discovery Lab',
      category: 'Assessment',
      tab: 'stem-discovery' as TabView,
      icon: Gamepad2,
    },
    {
      label: 'University Alumni Insights (ITC, CADT, RUPP)',
      category: 'Universities',
      tab: 'alumni' as TabView,
      icon: GraduationCap,
    },
    { label: 'Book 1-on-1 Mentorship', category: 'Mentors', tab: 'mentors' as TabView, icon: Users },
    { label: 'Live Conferences & AMAs', category: 'Events', tab: 'events' as TabView, icon: Calendar },
    {
      label: 'Student Study Meetups',
      category: 'Study Circles',
      tab: 'meetups' as TabView,
      icon: MessageSquare,
    },
    {
      label: 'Scholarships & Degree Pathways',
      category: 'Opportunities',
      tab: 'opportunities' as TabView,
      icon: Compass,
    },
    {
      label: 'Community Discussion Forum',
      category: 'Forum',
      tab: 'community' as TabView,
      icon: BookOpen,
    },
    {
      label: 'Apply as a Student Mentor',
      category: 'Application',
      tab: 'become-mentor' as TabView,
      icon: Award,
    },
    {
      label: 'My Student Profile & Portfolio',
      category: 'Account',
      tab: 'profile' as TabView,
      icon: User,
    },
  ].filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userName = studentProfile?.name || studentName || 'Vannak Sam';
  const userAvatar =
    studentProfile?.avatar ||
    studentAvatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
  const userSchool = studentProfile?.school || 'Bak Touk High School, Phnom Penh';
  const profileCompletion = studentProfile?.explorationProgress?.profileCompleted || 85;

  return (
    <>
      <header
        ref={navHeaderRef}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all select-none"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Left: Back button & Brand Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              {canGoBack && handleBack && (
                <button
                  onClick={handleBack}
                  id="global-navbar-back-btn"
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-all shrink-0 active:scale-95"
                  title="Back to previous page"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Back</span>
                </button>
              )}

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleSelectTab('dashboard')}
                  className="flex items-center space-x-2.5 text-left group focus:outline-none shrink-0 cursor-pointer"
                  id="brand-logo-btn"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white shadow-xs group-hover:from-blue-600 group-hover:to-indigo-800 transition-all shrink-0">
                    <Compass className="w-5 h-5 text-blue-200" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors whitespace-nowrap">
                        Student Instructor
                      </span>
                      <span className="hidden sm:inline-flex text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded leading-none whitespace-nowrap">
                        PRO
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium leading-tight hidden sm:block whitespace-nowrap">
                      Mentorship & Career Platform
                    </span>
                  </div>
                </button>

                {onOpenPatchNotes && (
                  <button
                    type="button"
                    onClick={onOpenPatchNotes}
                    className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded leading-none whitespace-nowrap transition cursor-pointer"
                    title="View Version V1.2.0 Patch Notes"
                    id="navbar-patch-notes-btn"
                  >
                    <span>v1.2.0</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </button>
                )}
              </div>
            </div>

            {/* Center: Desktop Navigation Tabs & Fixed Dropdowns with Drag Left/Right */}
            <div className="hidden lg:flex items-center relative min-w-0 flex-1 max-w-3xl mx-2 group">
              {desktopNavScroll.canScrollLeft && (
                <button
                  type="button"
                  onClick={desktopNavScroll.scrollLeft}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 z-30 p-1 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer"
                  title="Scroll headers left"
                  aria-label="Scroll headers left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}

              <nav
                ref={desktopNavScroll.ref}
                {...desktopNavScroll.events}
                id="desktop-nav"
                aria-label="Main Navigation"
                className={`flex items-center space-x-1 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1.5 select-none w-full ${
                  desktopNavScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                title={t('nav.dragHint', 'Drag left & right to visibly view all headers')}
              >
                {/* Dashboard Tab */}
                <button
                  id="nav-link-dashboard"
                  onClick={() => handleSelectTab('dashboard')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'dashboard'
                      ? 'text-blue-700 bg-blue-50 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Compass
                    className={`w-4 h-4 shrink-0 ${
                      currentTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{t('nav.dashboard', 'Dashboard')}</span>
                </button>

                {/* Decision Engine Tab */}
                <button
                  id="nav-link-decision-engine"
                  onClick={() => handleSelectTab('decision-engine')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'decision-engine'
                      ? 'text-indigo-700 bg-indigo-50 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles
                    className={`w-4 h-4 shrink-0 ${
                      currentTab === 'decision-engine' ? 'text-indigo-600' : 'text-amber-500'
                    }`}
                  />
                  <span>{t('nav.decisionEngine', 'Decision Engine')}</span>
                  <span className="text-[9px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full">
                    {t('nav.fitBadge', 'Fit')}
                  </span>
                </button>

                {/* University Intelligence Tab */}
                <button
                  id="nav-link-university-intelligence"
                  onClick={() => handleSelectTab('university-intelligence')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'university-intelligence'
                      ? 'text-blue-700 bg-blue-50 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap
                    className={`w-4 h-4 shrink-0 ${
                      currentTab === 'university-intelligence' ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{t('nav.universityIntel', 'University Intel')}</span>
                </button>

                {/* Scholarship Fixed Header */}
                <button
                  id="nav-link-scholarship"
                  onClick={() => handleSelectTab('scholarships')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'scholarships'
                      ? 'text-emerald-800 bg-emerald-50 font-bold border border-emerald-200 shadow-xs'
                      : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                  }`}
                  title="Cambodia Scholarship Intelligence Platform"
                >
                  <Award
                    className={`w-4 h-4 shrink-0 ${
                      currentTab === 'scholarships' ? 'text-emerald-600' : 'text-emerald-500'
                    }`}
                  />
                  <span>{t('nav.scholarship', 'Scholarship')}</span>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                    {t('nav.scholarshipBadge', 'Global')}
                  </span>
                </button>

                {/* Network Fixed Dropdown Header */}
              <div
                className="relative shrink-0"
                onMouseEnter={() => setMentorsOpen(true)}
                onMouseLeave={() => setMentorsOpen(false)}
              >
                <button
                  id="nav-dropdown-network"
                  onClick={() => handleSelectTab('mentors')}
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    isMentorshipActive
                      ? 'text-blue-700 bg-blue-50 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  aria-expanded={mentorsOpen}
                >
                  <Users
                    className={`w-4 h-4 shrink-0 ${
                      isMentorshipActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>Network</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      mentorsOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {mentorsOpen && (
                  <div className="absolute left-0 top-full pt-1 w-72 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 space-y-0.5 ring-1 ring-black/5">
                      <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Network Hub
                      </div>
                      {mentorshipItems.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = currentTab === item.id;
                        return (
                          <button
                            key={item.id}
                            id={`dropdown-mentorship-${item.id}`}
                            onClick={() => {
                              handleSelectTab(item.id);
                              setMentorsOpen(false);
                            }}
                            className={`w-full flex items-start space-x-2.5 p-2 rounded-lg text-left transition-colors ${
                              isCurrent
                                ? 'bg-blue-50 text-blue-900'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div
                              className={`p-1.5 rounded-md mt-0.5 shrink-0 ${
                                isCurrent
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-xs font-semibold truncate ${
                                    isCurrent ? 'text-blue-700' : 'text-slate-900'
                                  }`}
                                >
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1 py-0.2 rounded">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Discovery Fixed Dropdown Header */}
              <div
                className="relative shrink-0"
                onMouseEnter={() => setDiscoveryOpen(true)}
                onMouseLeave={() => setDiscoveryOpen(false)}
              >
                <button
                  id="nav-dropdown-explore"
                  onClick={() => handleSelectTab('stem-discovery')}
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    isDiscoveryActive
                      ? 'text-blue-700 bg-blue-50 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  aria-expanded={discoveryOpen}
                >
                  <Compass
                    className={`w-4 h-4 shrink-0 ${
                      isDiscoveryActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>Discovery</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      discoveryOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {discoveryOpen && (
                  <div className="absolute left-0 top-full pt-1 w-72 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 space-y-0.5 ring-1 ring-black/5">
                      <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Explore & Career Lab
                      </div>
                      {discoveryItems.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = currentTab === item.id;
                        return (
                          <button
                            key={item.id}
                            id={`dropdown-explore-${item.id}`}
                            onClick={() => {
                              handleSelectTab(item.id);
                              setDiscoveryOpen(false);
                            }}
                            className={`w-full flex items-start space-x-2.5 p-2 rounded-lg text-left transition-colors ${
                              isCurrent
                                ? 'bg-blue-50 text-blue-900'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div
                              className={`p-1.5 rounded-md mt-0.5 shrink-0 ${
                                isCurrent
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-xs font-semibold truncate ${
                                    isCurrent ? 'text-blue-700' : 'text-slate-900'
                                  }`}
                                >
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1 py-0.2 rounded">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Advisor Tab */}
              <button
                id="nav-link-ai-advisor"
                onClick={() => handleSelectTab('advisor')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  currentTab === 'advisor' || currentTab === 'ai-advisor'
                    ? 'text-blue-700 bg-blue-50 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles
                  className={`w-4 h-4 shrink-0 ${
                    currentTab === 'advisor' || currentTab === 'ai-advisor'
                      ? 'text-blue-600'
                      : 'text-amber-500'
                  }`}
                />
                <span>AI Advisor</span>
              </button>

              {/* Community Tab */}
              <button
                id="nav-link-community"
                onClick={() => handleSelectTab('community')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  currentTab === 'community'
                    ? 'text-blue-700 bg-blue-50 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookOpen
                  className={`w-4 h-4 shrink-0 ${
                    currentTab === 'community' ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <span>{t('nav.community', 'Community')}</span>
              </button>

              {/* Education Research Lab Tab */}
              <button
                id="nav-link-research-lab"
                onClick={() => handleSelectTab('research-lab')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  currentTab === 'research-lab'
                    ? 'text-indigo-700 bg-indigo-50 font-bold border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FlaskConical
                  className={`w-4 h-4 shrink-0 ${
                    currentTab === 'research-lab' ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <span>Research Lab</span>
                <span className="text-[9px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full">
                  Sci
                </span>
              </button>

              {/* Platform Architecture & Mobile Engineering Lead (Phase 9) */}
              <button
                id="nav-link-platform-architecture"
                onClick={() => handleSelectTab('platform-architecture')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  currentTab === 'platform-architecture'
                    ? 'text-emerald-700 bg-emerald-50 font-bold border border-emerald-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Layers
                  className={`w-4 h-4 shrink-0 ${
                    currentTab === 'platform-architecture' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <span>Platform Arch</span>
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                  Phase 9
                </span>
              </button>

              {/* Mentors Fixed Tab (Replaced Messages for Teenager Safety) */}
              <button
                id="nav-link-mentors"
                onClick={() => handleSelectTab('mentors')}
                className={`relative flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  currentTab === 'mentors'
                    ? 'text-blue-700 bg-blue-50 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <GraduationCap
                  className={`w-4 h-4 shrink-0 ${
                    currentTab === 'mentors' ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <span>{t('nav.mentors', 'Mentors')}</span>
              </button>
            </nav>

            {desktopNavScroll.canScrollRight && (
              <button
                type="button"
                onClick={desktopNavScroll.scrollRight}
                className="absolute -right-2 top-1/2 -translate-y-1/2 z-30 p-1 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer"
                title="Scroll headers right"
                aria-label="Scroll headers right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Actions (Language, Search, Tour, Notifications, Profile, Mobile toggle) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Language Selector in Top Right Corner */}
            <LanguageSelector />

            {/* Quick Search */}
              <button
                onClick={() => setSearchOpen(true)}
                id="global-search-trigger"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 text-xs border border-slate-200 transition-colors shrink-0"
                title="Search mentors, tests & events (⌘K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="hidden xl:inline text-slate-400">Search...</span>
                <kbd className="hidden sm:inline-block text-[9px] font-mono bg-white text-slate-400 px-1 py-0.5 rounded border border-slate-200">
                  ⌘K
                </kbd>
              </button>

              {/* Tour Flow */}
              {onOpenDemoFlow && (
                <button
                  onClick={onOpenDemoFlow}
                  id="demo-flow-trigger"
                  className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-all shrink-0 active:scale-95"
                  title="Launch guided tour"
                >
                  <Play className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="whitespace-nowrap">Tour</span>
                </button>
              )}

              {/* Notifications Dropdown */}
              <div className="relative shrink-0" ref={notifRef}>
                <button
                  id="notifications-button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none ${
                    notificationsOpen ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200' : ''
                  }`}
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4 shrink-0" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 ring-1 ring-black/5">
                    <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-xs text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition"
                      >
                        Mark all as read
                      </button>
                    </div>

                    <div className="px-3 pt-2 pb-1 flex items-center space-x-1 border-b border-slate-50">
                      <button
                        onClick={() => setNotifFilter('all')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                          notifFilter === 'all'
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setNotifFilter('mentorship')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                          notifFilter === 'mentorship'
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Mentorship
                      </button>
                      <button
                        onClick={() => setNotifFilter('events')}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                          notifFilter === 'events'
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Events
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                      {filteredNotifs.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          No notifications found.
                        </div>
                      ) : (
                        filteredNotifs.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className={`p-3 text-xs hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-2.5 ${
                              item.read ? '' : 'bg-blue-50/50'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {item.read ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p
                                  className={`font-bold text-xs truncate ${
                                    item.read ? 'text-slate-700' : 'text-slate-900'
                                  }`}
                                >
                                  {item.title}
                                </p>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                  {item.time}
                                </span>
                              </div>
                              <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5 line-clamp-2">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar Dropdown */}
              <div className="relative shrink-0" ref={profileRef}>
                <button
                  id="user-profile-header-btn"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center space-x-1.5 p-1 rounded-lg transition-colors border border-transparent hover:border-slate-200 hover:bg-slate-50 focus:outline-none shrink-0 ${
                    profileOpen ? 'bg-slate-100 border-slate-200' : ''
                  }`}
                  aria-label="User profile and settings"
                >
                  <div className="relative shrink-0">
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 ring-1 ring-black/5">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={userAvatar}
                          alt={userName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{userSchool}</p>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-50">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-1">
                          <span>Profile Completion</span>
                          <span className="text-blue-600">{profileCompletion}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${profileCompletion}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleSelectTab('profile');
                          setProfileOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Profile & Portfolio</span>
                      </button>
                      <button
                        onClick={() => {
                          handleSelectTab('profile');
                          setProfileOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                      >
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>Interests & Badges</span>
                      </button>
                      {onOpenAdminModal && (
                        <button
                          onClick={() => {
                            onOpenAdminModal();
                            setProfileOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                        >
                          <Shield className="w-3.5 h-3.5 text-slate-400" />
                          <span>Admin & Insights</span>
                        </button>
                      )}
                      {onOpenPatchNotes && (
                        <button
                          onClick={() => {
                            onOpenPatchNotes();
                            setProfileOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-emerald-800 hover:bg-emerald-50 flex items-center space-x-2 font-semibold"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>What&apos;s New (V1.2.0 Notes)</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none shrink-0"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Draggable Header Bar */}
        <div className="lg:hidden border-t border-slate-100 bg-slate-50/95 backdrop-blur-xs px-2 py-1.5 relative">
          <div className="flex items-center relative">
            {mobileNavScroll.canScrollLeft && (
              <button
                type="button"
                onClick={mobileNavScroll.scrollLeft}
                className="absolute left-0 z-20 p-1 rounded-full bg-white shadow-xs border border-slate-200 text-slate-600 hover:text-slate-900"
                aria-label="Scroll mobile headers left"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
            )}
            <div
              ref={mobileNavScroll.ref}
              {...mobileNavScroll.events}
              className={`flex items-center space-x-1 overflow-x-auto no-scrollbar scroll-smooth px-1 py-0.5 select-none w-full ${
                mobileNavScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              title={t('nav.dragHint', 'Drag left & right to view all headers')}
            >
              {[
                { id: 'dashboard', label: t('nav.dashboard', 'Dashboard'), icon: Compass },
                { id: 'decision-engine', label: t('nav.decisionEngine', 'Decision Engine'), icon: Sparkles },
                { id: 'university-intelligence', label: t('nav.universityIntel', 'University Intel'), icon: GraduationCap },
                { id: 'scholarships', label: t('nav.scholarship', 'Scholarship'), icon: Award },
                { id: 'advisor', label: t('nav.aiAdvisor', 'AI Advisor'), icon: Sparkles },
                { id: 'mentors', label: t('nav.mentors', 'Mentors'), icon: Users },
                { id: 'stem-discovery', label: t('nav.stemLab', 'STEM Lab'), icon: Award },
                { id: 'opportunities', label: t('nav.opportunities', 'Majors'), icon: Briefcase },
                { id: 'community', label: t('nav.community', 'Community'), icon: BookOpen },
              ].map((item) => {
                const isActive = currentTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id as TabView)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            {mobileNavScroll.canScrollRight && (
              <button
                type="button"
                onClick={mobileNavScroll.scrollRight}
                className="absolute right-0 z-20 p-1 rounded-full bg-white shadow-xs border border-slate-200 text-slate-600"
                aria-label="Scroll mobile headers right"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-4">
            {/* Language Selection in Mobile Menu */}
            <div className="pb-3 border-b border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                {t('nav.language', 'Language')} / ភាសា
              </div>
              <LanguageSelector variant="mobile" />
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  handleSelectTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2 p-2.5 rounded-xl text-xs font-semibold ${
                  currentTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  handleSelectTab('decision-engine');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2 p-2.5 rounded-xl text-xs font-semibold ${
                  currentTab === 'decision-engine'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Decision Engine (Find Fit)</span>
              </button>

              <button
                onClick={() => {
                  handleSelectTab('university-intelligence');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2 p-2.5 rounded-xl text-xs font-semibold ${
                  currentTab === 'university-intelligence'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>University Intel & Matrix</span>
              </button>

              <button
                onClick={() => {
                  handleSelectTab('scholarships');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2 p-2.5 rounded-xl text-xs font-semibold ${
                  currentTab === 'scholarships'
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Award className="w-4 h-4 text-emerald-600" />
                <span>{t('nav.scholarship', 'Scholarship')} (Global Search)</span>
              </button>

              <button
                onClick={() => {
                  handleSelectTab('advisor');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2 p-2.5 rounded-xl text-xs font-semibold ${
                  currentTab === 'advisor' || currentTab === 'ai-advisor'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Advisor</span>
              </button>
            </div>

            {/* Network Section */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 mb-1.5">
                Network
              </div>
              <div className="space-y-0.5">
                {mentorshipItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleSelectTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs ${
                        currentTab === item.id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.title}</span>
                      </div>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discovery Section */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 mb-1.5">
                Discovery & Careers
              </div>
              <div className="space-y-0.5">
                {discoveryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleSelectTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs ${
                        currentTab === item.id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.title}</span>
                      </div>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <button
                onClick={() => {
                  handleSelectTab('community');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 p-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50"
              >
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Community Discussions</span>
              </button>
              <button
                onClick={() => {
                  handleSelectTab('research-lab');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100"
              >
                <div className="flex items-center space-x-2">
                  <FlaskConical className="w-4 h-4 text-indigo-600" />
                  <span>Research Laboratory & Learning Science</span>
                </div>
                <span className="text-[9px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded font-bold">
                  Phase 8
                </span>
              </button>
              <button
                onClick={() => {
                  handleSelectTab('platform-architecture');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100"
              >
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Platform Architecture & Mobile Engineering</span>
                </div>
                <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                  Phase 9
                </span>
              </button>
              <button
                onClick={() => {
                  handleSelectTab('mentors');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 p-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50"
              >
                <GraduationCap className="w-4 h-4 text-slate-400" />
                <span>Mentors & Public Q&A</span>
              </button>
              <button
                onClick={() => {
                  handleSelectTab('profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 p-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </button>
              {onOpenPatchNotes && (
                <button
                  onClick={() => {
                    onOpenPatchNotes();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Version V1.2.0 Patch Notes</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono">
                    NEW
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Quick Search Modal (⌘K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in-0 zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center space-x-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mentors, majors, scholarships, tests..."
                className="w-full text-sm text-slate-800 placeholder-slate-400 outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No matches found for "{searchQuery}".
                </div>
              ) : (
                searchResults.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        handleSelectTab(item.tab);
                        setSearchOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left transition group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.label}</p>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">Jump →</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Navigate with arrow keys or click</span>
              <span>Press ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
