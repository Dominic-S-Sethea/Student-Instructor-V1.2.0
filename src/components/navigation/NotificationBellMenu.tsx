import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Clock, ShieldCheck, Sparkles, Award } from 'lucide-react';
import type { NotificationItem, TabView } from '../../types';

interface NotificationBellMenuProps {
  notifications: NotificationItem[];
  isKhmer: boolean;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onNavigateTab: (tab: TabView) => void;
  placement?: 'top-nav' | 'sidebar';
  compact?: boolean;
}

const VALID_TABS = new Set<string>([
  'dashboard',
  'scholarships',
  'university-intelligence',
  'advisor',
  'profile',
  'decision-engine',
  'learning-hub',
  'mentors',
]);

function categoryIcon(type: NotificationItem['type']): React.ReactNode {
  switch (type) {
    case 'opportunity':
      return <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    case 'session':
      return <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    case 'system':
      return <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
    default:
      return <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
  }
}

export const NotificationBellMenu: React.FC<NotificationBellMenuProps> = ({
  notifications,
  isKhmer,
  onMarkRead,
  onMarkAllRead,
  onNavigateTab,
  placement = 'top-nav',
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const dropdownPosition =
    placement === 'sidebar'
      ? compact
        ? 'left-full bottom-0 ml-2'
        : 'right-0 lg:left-0 lg:right-auto bottom-full mb-2'
      : 'right-0 mt-2';

  return (
    <div className="relative" ref={menuRef}>
      <button
        id="notifications-bell-btn"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={isKhmer ? 'ការជូនដំណឹង' : 'Notifications'}
        aria-expanded={open}
        title={isKhmer ? 'ការជូនដំណឹង' : 'Notifications'}
        className={`relative ${
          compact ? 'w-10 h-10 flex items-center justify-center' : 'w-8 h-8 flex items-center justify-center'
        } rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id="notifications-dropdown"
          className={`absolute ${dropdownPosition} w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden`}
        >
          <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
              {isKhmer ? 'ការជូនដំណឹង' : 'Notifications'}
            </span>
            {unreadCount > 0 && onMarkAllRead && (
              <button
                type="button"
                onClick={() => onMarkAllRead()}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{isKhmer ? 'អានទាំងអស់' : 'Mark all read'}</span>
              </button>
            )}
          </div>

          <div
            aria-live="polite"
            aria-relevant="additions text"
            className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800"
          >
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                {isKhmer ? 'មិនមានការជូនដំណឹងថ្មីទេ' : 'You are all caught up.'}
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (!item.isRead && onMarkRead) onMarkRead(item.id);
                    if (item.actionTab && VALID_TABS.has(item.actionTab)) {
                      onNavigateTab(item.actionTab as TabView);
                    }
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 transition-colors cursor-pointer ${
                    item.isRead
                      ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                      : 'bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50 dark:hover:bg-blue-950/50'
                  }`}
                >
                  <span className="mt-0.5 shrink-0">{categoryIcon(item.type)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {item.title}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                      {item.message}
                    </p>
                  </div>
                  {!item.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
