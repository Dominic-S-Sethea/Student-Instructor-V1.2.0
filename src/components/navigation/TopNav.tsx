import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Building2,
  ChevronDown,
  Compass,
  FlaskConical,
  GraduationCap,
  Home,
  Layers,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Shield,
  Sparkles,
  Sun,
  User,
  X,
} from 'lucide-react';
import type { NotificationItem, TabView } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LanguageSelector } from '../LanguageSelector';
import { ADMIN_NAV_ITEMS, EXPLORE_NAV_ITEMS, PRIMARY_NAV_ITEMS } from './navConfig';
import { TopNavMobileDrawer } from './TopNavMobileDrawer';
import { NotificationBellMenu } from './NotificationBellMenu';

interface TopNavProps {
  currentTab: TabView;
  onSelectTab: (tab: TabView) => void;
  notifications?: NotificationItem[];
  onMarkNotificationRead?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onOpenAuthModal?: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

function getTabIcon(id: TabView): React.ReactNode {
  switch (id) {
    case 'dashboard':
      return <Home className="w-4 h-4" />;
    case 'scholarships':
      return <Award className="w-4 h-4" />;
    case 'university-intelligence':
      return <Building2 className="w-4 h-4" />;
    case 'advisor':
    case 'ai-advisor':
      return <Sparkles className="w-4 h-4" />;
    case 'profile':
      return <User className="w-4 h-4" />;
    case 'research-lab':
      return <FlaskConical className="w-4 h-4" />;
    case 'platform-architecture':
    case 'data-strategy':
      return <Layers className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  notifications = [],
  onMarkNotificationRead,
  onClearAllNotifications,
  onOpenAuthModal,
  onBack,
  canGoBack = false,
}) => {
  const { language } = useLanguage();
  const isKhmer = language === 'km';
  const { authenticated, user, profile: authProfile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const isAdmin = user?.role === 'admin';

  const [exploreOpen, setExploreOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const exploreRef = useRef<HTMLDivElement>(null);
  const adminRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (exploreRef.current && !exploreRef.current.contains(target)) setExploreOpen(false);
      if (adminRef.current && !adminRef.current.contains(target)) setAdminOpen(false);
      if (accountRef.current && !accountRef.current.contains(target)) setAccountOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExploreOpen(false);
        setAdminOpen(false);
        setAccountOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navigate = (tab: TabView) => {
    onSelectTab(tab);
    setExploreOpen(false);
    setAdminOpen(false);
    setAccountOpen(false);
    setMobileMenuOpen(false);
  };

  const displayName = authProfile?.name || user?.email?.split('@')[0] || 'Account';
  const initials = displayName.slice(0, 2).toUpperCase();
  const isExploreActive = EXPLORE_NAV_ITEMS.some((item) => item.id === currentTab);
  const isAdminTabActive = ADMIN_NAV_ITEMS.some((item) => item.id === currentTab);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand + Optional Back */}
        <div className="flex items-center gap-2.5 min-w-0">
          {canGoBack && onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('dashboard')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none truncate">
                Student Instructor
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate hidden sm:block">
                {isKhmer ? 'មគ្គុទ្ទេសក៍អាហារូបករណ៍ និងសិក្សា' : 'Cambodia Study & Scholarship Guide'}
              </div>
            </div>
          </button>
        </div>

        {/* Desktop 5-Tab Navigation + Explore + Admin (if admin) */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const active =
              currentTab === item.id ||
              (item.id === 'advisor' && currentTab === 'ai-advisor');
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => navigate(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                {getTabIcon(item.id)}
                <span>{isKhmer ? item.labelKm : item.labelEn}</span>
              </button>
            );
          })}

          {/* Explore Dropdown */}
          <div className="relative" ref={exploreRef}>
            <button
              type="button"
              onClick={() => setExploreOpen((prev) => !prev)}
              aria-expanded={exploreOpen}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                isExploreActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{isKhmer ? 'ស្វែងយល់' : 'Explore'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
            </button>

            {exploreOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isKhmer ? 'ឧបករណ៍សិក្សាបន្ថែម' : 'More Study Tools'}
                </div>
                {EXPLORE_NAV_ITEMS.map((item) => {
                  const active = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={active ? 'page' : undefined}
                      onClick={() => navigate(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{isKhmer ? item.labelKm : item.labelEn}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {isKhmer ? item.descKm : item.descEn}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin-Only Ops Dropdown */}
          {isAdmin && (
            <div className="relative" ref={adminRef}>
              <button
                type="button"
                onClick={() => setAdminOpen((prev) => !prev)}
                aria-expanded={adminOpen}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  isAdminTabActive
                    ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-transparent'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Ops</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${adminOpen ? 'rotate-180' : ''}`} />
              </button>

              {adminOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Admin Internal Views
                  </div>
                  {ADMIN_NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                        currentTab === item.id
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.labelEn}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.descEn}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right Controls: Theme Toggle, Language, Auth */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to Calm Light Mode' : 'Switch to Dark Study Mode'}
            title={isDark ? 'Light Study Mode' : 'Dark Study Mode'}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
            <span className="hidden xl:inline">{isDark ? 'Light' : 'Study Dark'}</span>
          </button>

          <div className="hidden sm:block">
            <LanguageSelector variant="nav" />
          </div>

          {authenticated && (
            <NotificationBellMenu
              notifications={notifications}
              isKhmer={isKhmer}
              onMarkRead={onMarkNotificationRead}
              onMarkAllRead={onClearAllNotifications}
              onNavigateTab={navigate}
            />
          )}

          {authenticated ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center">
                  {initials}
                </span>
                <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[110px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {displayName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                      {user?.role || 'student'} account
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('profile')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{isKhmer ? 'ប្រវត្តិរូបខ្ញុំ' : 'My Profile & Privacy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      void logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isKhmer ? 'ចាកចេញ' : 'Sign Out'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isKhmer ? 'ចូលគណនី' : 'Sign In'}</span>
            </button>
          )}

          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <TopNavMobileDrawer
          currentTab={currentTab}
          isKhmer={isKhmer}
          isAdmin={isAdmin}
          onNavigate={navigate}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};
