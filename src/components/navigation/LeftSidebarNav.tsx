import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  GraduationCap,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import type { NotificationItem, TabView } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  ADMIN_MASTER_GROUP,
  findActiveMasterGroupId,
  MASTER_NAV_GROUPS,
  type MasterNavGroupConfig,
  type SubNavAction,
  type SubNavItemConfig,
} from './navConfig';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarUtilityFooter } from './SidebarUtilityFooter';

interface LeftSidebarNavProps {
  currentTab: TabView;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelectTab: (tab: TabView) => void;
  onSelectSubAction?: (action: SubNavAction) => void;
  notifications?: NotificationItem[];
  onMarkNotificationRead?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onOpenAuthModal?: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

function resolveDefaultSubId(tab: TabView, group: MasterNavGroupConfig): string | null {
  const direct = group.subItems.find(
    (s) => s.targetTab === tab && (s.action.type === 'tab' || s.action.type === 'scholarship-view' || s.action.type === 'university-view' || s.action.type === 'advisor-view')
  );
  return direct ? direct.id : group.subItems[0]?.id ?? null;
}

export const LeftSidebarNav: React.FC<LeftSidebarNavProps> = ({
  currentTab,
  collapsed,
  onToggleCollapsed,
  onSelectTab,
  onSelectSubAction,
  notifications = [],
  onMarkNotificationRead,
  onClearAllNotifications,
  onOpenAuthModal,
  onBack,
  canGoBack = false,
}) => {
  const { language } = useLanguage();
  const isKhmer = language === 'km';
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const activeGroupId = findActiveMasterGroupId(currentTab);
  const [openGroupIds, setOpenGroupIds] = useState<string[]>([activeGroupId]);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [flyoutGroupId, setFlyoutGroupId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarRef = useRef<HTMLElement>(null);

  const groups: readonly MasterNavGroupConfig[] = isAdmin
    ? [...MASTER_NAV_GROUPS, ADMIN_MASTER_GROUP]
    : MASTER_NAV_GROUPS;

  // Keep active Master Header accordion open when navigating externally
  useEffect(() => {
    setOpenGroupIds([activeGroupId]);
  }, [activeGroupId]);

  // Close flyouts / mobile drawer on Escape or outside click
  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setFlyoutGroupId(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFlyoutGroupId(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleMasterClick = (group: MasterNavGroupConfig): void => {
    if (collapsed && !mobileOpen) {
      setFlyoutGroupId((prev) => (prev === group.id ? null : group.id));
      return;
    }

    const alreadyOpen = openGroupIds.includes(group.id);
    const alreadyInGroup = group.matchTabs.includes(currentTab);

    if (alreadyInGroup) {
      setOpenGroupIds(alreadyOpen ? [] : [group.id]);
      return;
    }

    setOpenGroupIds([group.id]);
    setSelectedSubId(resolveDefaultSubId(group.defaultTab, group));
    onSelectTab(group.defaultTab);
  };

  const handleSubItemClick = (_group: MasterNavGroupConfig, sub: SubNavItemConfig): void => {
    setSelectedSubId(sub.id);
    setFlyoutGroupId(null);
    setMobileOpen(false);
    if (onSelectSubAction) {
      onSelectSubAction(sub.action);
    } else {
      onSelectTab(sub.targetTab);
    }
  };

  const handleNavigateDirect = (tab: TabView): void => {
    setSelectedSubId(null);
    setFlyoutGroupId(null);
    setMobileOpen(false);
    onSelectTab(tab);
  };

  // Effective collapsed visual mode only applies on desktop (mobile drawer is always full width)
  const isRail = collapsed && !mobileOpen;

  return (
    <>
      {/* Mobile-Only Compact Top Trigger Bar (Hidden on Desktop lg+) */}
      <div className="lg:hidden sticky top-0 z-30 h-14 px-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation sidebar' : 'Open navigation sidebar'}
            aria-expanded={mobileOpen}
            aria-controls="left-sidebar-nav"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
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
            onClick={() => handleNavigateDirect('dashboard')}
            className="flex items-center gap-2 min-w-0 cursor-pointer"
          >
            <span className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <GraduationCap className="w-4 h-4" />
            </span>
            <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100 truncate">
              Student Instructor
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px]"
        />
      )}

      {/* Fixed Left Sidebar (Always Pinned on Desktop lg+, Slide-Over Drawer on Mobile) */}
      <aside
        id="left-sidebar-nav"
        ref={sidebarRef}
        aria-label={isKhmer ? 'ម៉ឺនុយរុករកចម្បង' : 'Primary sidebar navigation'}
        className={`fixed inset-y-0 left-0 z-50 lg:z-40 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg lg:shadow-xs transition-[width,transform] duration-200 ease-out ${
          isRail ? 'w-[76px]' : 'w-[272px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Top Brand & Collapse Toggle */}
        <div
          className={`h-16 px-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center shrink-0 ${
            isRail ? 'justify-center' : 'justify-between gap-2'
          }`}
        >
          {!isRail && (
            <button
              type="button"
              onClick={() => handleNavigateDirect('dashboard')}
              className="flex items-center gap-2.5 text-left min-w-0 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none truncate">
                  Student Instructor
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {isKhmer ? 'មគ្គុទ្ទេសក៍អាហារូបករណ៍' : 'Cambodia Study Guide'}
                </div>
              </div>
            </button>
          )}

          <div className="flex items-center gap-1 shrink-0">
            {!isRail && canGoBack && onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                title="Go back"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Desktop Collapse-to-Icons Toggle */}
            <button
              id="sidebar-collapse-btn"
              type="button"
              onClick={() => {
                setFlyoutGroupId(null);
                onToggleCollapsed();
              }}
              aria-label={isRail ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isRail ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {isRail ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Close Drawer Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation sidebar"
              className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Master Header Accordion Navigation */}
        <nav
          aria-label={isKhmer ? 'ផ្នែកសំខាន់ៗ' : 'Main navigation'}
          className={`flex-1 px-2.5 py-3 space-y-1.5 ${
            isRail ? 'overflow-visible' : 'overflow-y-auto'
          }`}
        >
          {!isRail && (
            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {isKhmer ? 'ម៉ឺនុយសិក្សា' : 'Navigation'}
            </div>
          )}

          {groups.map((group) => {
            const isGroupActive = group.id === activeGroupId;
            const effectiveActiveSubId = isGroupActive
              ? group.subItems.some((s) => s.id === selectedSubId)
                ? selectedSubId
                : resolveDefaultSubId(currentTab, group)
              : null;

            return (
              <SidebarNavItem
                key={group.id}
                group={group}
                isKhmer={isKhmer}
                isGroupActive={isGroupActive}
                activeSubId={effectiveActiveSubId}
                isExpanded={openGroupIds.includes(group.id)}
                collapsed={isRail}
                isFlyoutOpen={flyoutGroupId === group.id}
                onMasterClick={handleMasterClick}
                onSubItemClick={handleSubItemClick}
              />
            );
          })}
        </nav>

        {/* Pinned Bottom Utilities: Theme, Language, Notifications, Sign In / Account */}
        <SidebarUtilityFooter
          collapsed={isRail}
          isKhmer={isKhmer}
          notifications={notifications}
          onMarkNotificationRead={onMarkNotificationRead}
          onClearAllNotifications={onClearAllNotifications}
          onOpenAuthModal={() => {
            setMobileOpen(false);
            onOpenAuthModal?.();
          }}
          onNavigateTab={handleNavigateDirect}
        />
      </aside>
    </>
  );
};
