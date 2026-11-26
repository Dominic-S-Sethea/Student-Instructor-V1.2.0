import React, { useEffect, useRef, useState } from 'react';
import { ChevronUp, LogIn, LogOut, Moon, Settings, Sun, User } from 'lucide-react';
import type { NotificationItem, TabView } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { LanguageSelector } from '../LanguageSelector';
import { NotificationBellMenu } from './NotificationBellMenu';

interface SidebarUtilityFooterProps {
  collapsed: boolean;
  isKhmer: boolean;
  currentTab?: TabView;
  notifications: NotificationItem[];
  onMarkNotificationRead?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onOpenAuthModal?: () => void;
  onNavigateTab: (tab: TabView) => void;
}

export const SidebarUtilityFooter: React.FC<SidebarUtilityFooterProps> = ({
  collapsed,
  isKhmer,
  currentTab,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  onOpenAuthModal,
  onNavigateTab,
}) => {
  const { authenticated, user, profile: authProfile, logout } = useAuth();
  const { isDark } = useTheme();
  const { updateSettings } = useSettings();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAccountOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const displayName = authProfile?.name || user?.email?.split('@')[0] || 'Account';
  const initials = displayName.slice(0, 2).toUpperCase();
  const isSettingsActive = currentTab === 'settings';

  const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900';

  const handleToggleTheme = (): void => {
    updateSettings({ themeMode: isDark ? 'light' : 'dark' });
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-2.5 bg-slate-50/70 dark:bg-slate-900/95 shrink-0">
      {/* Row 1: Theme Toggle, Language Selector, Settings Gear, Notifications */}
      <div
        className={`flex items-center ${
          collapsed ? 'flex-col gap-1.5' : 'justify-between gap-1'
        }`}
      >
        <button
          id="theme-toggle-btn"
          type="button"
          onClick={handleToggleTheme}
          aria-label={isDark ? 'Switch to Calm Light Mode' : 'Switch to Dark Study Mode'}
          title={isDark ? 'Light Study Mode' : 'Dark Study Mode'}
          className={`inline-flex items-center justify-center gap-1 ${
            collapsed ? 'w-10 h-10 p-0' : 'px-2 py-2'
          } rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer shrink-0 ${focusRing}`}
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          )}
          {!collapsed && <span>{isDark ? 'Light' : 'Dark'}</span>}
        </button>

        <LanguageSelector variant="nav" placement="up" compact={collapsed} />

        <button
          id="sidebar-settings-btn"
          type="button"
          onClick={() => onNavigateTab('settings')}
          aria-label={isKhmer ? 'ការកំណត់ប្រព័ន្ធ' : 'Platform Settings'}
          aria-current={isSettingsActive ? 'page' : undefined}
          title={isKhmer ? 'ការកំណត់ប្រព័ន្ធ (Settings)' : 'Platform Settings'}
          className={`inline-flex items-center justify-center ${
            collapsed ? 'w-10 h-10' : 'w-8 h-8'
          } rounded-xl border text-xs font-bold transition-colors cursor-pointer shrink-0 ${focusRing} ${
            isSettingsActive
              ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
        </button>

        {authenticated && (
          <NotificationBellMenu
            notifications={notifications}
            isKhmer={isKhmer}
            onMarkRead={onMarkNotificationRead}
            onMarkAllRead={onClearAllNotifications}
            onNavigateTab={onNavigateTab}
            placement="sidebar"
            compact={collapsed}
          />
        )}
      </div>

      {/* Row 2: Account Pill or Sign In Button */}
      {authenticated ? (
        <div className="relative" ref={accountRef}>
          <button
            type="button"
            onClick={() => setAccountOpen((prev) => !prev)}
            aria-expanded={accountOpen}
            aria-label={displayName}
            title={displayName}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center p-1.5' : 'justify-between gap-2 px-2.5 py-2'
            } rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${focusRing}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                {initials}
              </span>
              {!collapsed && (
                <div className="min-w-0 text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize leading-tight">
                    {user?.role || 'student'}
                  </div>
                </div>
              )}
            </div>
            {!collapsed && (
              <ChevronUp
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                  accountOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>

          {accountOpen && (
            <div
              className={`absolute ${
                collapsed ? 'left-full bottom-0 ml-2' : 'left-0 bottom-full mb-2 w-full'
              } min-w-[216px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2 z-50`}
            >
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
                onClick={() => {
                  setAccountOpen(false);
                  onNavigateTab('profile');
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${focusRing}`}
              >
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{isKhmer ? 'ប្រវត្តិរូបខ្ញុំ' : 'My Profile & Privacy'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountOpen(false);
                  onNavigateTab('settings');
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${focusRing}`}
              >
                <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{isKhmer ? 'ការកំណត់ប្រព័ន្ធ' : 'Settings & Preferences'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountOpen(false);
                  void logout();
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer ${focusRing}`}
              >
                <LogOut className="w-4 h-4" />
                <span>{isKhmer ? 'ចាកចេញ' : 'Sign Out'}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        onOpenAuthModal && (
          <button
            type="button"
            onClick={onOpenAuthModal}
            aria-label={isKhmer ? 'ចូលគណនី' : 'Sign In'}
            title={isKhmer ? 'ចូលគណនី' : 'Sign In'}
            className={`w-full inline-flex items-center justify-center gap-1.5 ${
              collapsed ? 'h-10 px-0' : 'px-3.5 py-2.5'
            } rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer ${focusRing}`}
          >
            <LogIn className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{isKhmer ? 'ចូលគណនី' : 'Sign In'}</span>}
          </button>
        )
      )}
    </div>
  );
};
