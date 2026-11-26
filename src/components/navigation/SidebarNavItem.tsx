import React from 'react';
import {
  Award,
  Bookmark,
  BookOpen,
  Bot,
  Brain,
  Building2,
  Calculator,
  Calendar,
  ChevronDown,
  Compass,
  FlaskConical,
  GraduationCap,
  Home,
  Layers,
  MessageSquare,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import type { MasterNavGroupConfig, SubNavItemConfig } from './navConfig';

interface SidebarNavItemProps {
  group: MasterNavGroupConfig;
  isKhmer: boolean;
  isGroupActive: boolean;
  activeSubId: string | null;
  isExpanded: boolean;
  collapsed: boolean;
  isFlyoutOpen: boolean;
  onMasterClick: (group: MasterNavGroupConfig) => void;
  onSubItemClick: (group: MasterNavGroupConfig, sub: SubNavItemConfig) => void;
}

function getMasterIcon(groupId: string): React.ReactNode {
  switch (groupId) {
    case 'home':
      return <Home className="w-[18px] h-[18px] shrink-0" />;
    case 'scholarships':
      return <Award className="w-[18px] h-[18px] shrink-0" />;
    case 'universities':
      return <Building2 className="w-[18px] h-[18px] shrink-0" />;
    case 'advisor':
      return <Sparkles className="w-[18px] h-[18px] shrink-0" />;
    case 'community':
      return <Users className="w-[18px] h-[18px] shrink-0" />;
    case 'profile':
      return <User className="w-[18px] h-[18px] shrink-0" />;
    case 'admin-ops':
      return <Shield className="w-[18px] h-[18px] shrink-0" />;
    default:
      return <BookOpen className="w-[18px] h-[18px] shrink-0" />;
  }
}

function getSubIcon(subId: string): React.ReactNode {
  switch (subId) {
    case 'home-overview':
      return <Home className="w-3.5 h-3.5 shrink-0" />;
    case 'home-verified-scholarships':
    case 'sch-flagship':
      return <Award className="w-3.5 h-3.5 shrink-0" />;
    case 'home-major-quiz':
      return <Compass className="w-3.5 h-3.5 shrink-0" />;
    case 'home-deadlines':
    case 'comm-events':
      return <Calendar className="w-3.5 h-3.5 shrink-0" />;
    case 'sch-top-global':
      return <GraduationCap className="w-3.5 h-3.5 shrink-0" />;
    case 'sch-saved':
      return <Bookmark className="w-3.5 h-3.5 shrink-0" />;
    case 'uni-profiles':
      return <Building2 className="w-3.5 h-3.5 shrink-0" />;
    case 'uni-compare':
      return <Scale className="w-3.5 h-3.5 shrink-0" />;
    case 'uni-roi':
      return <Calculator className="w-3.5 h-3.5 shrink-0" />;
    case 'uni-majors':
      return <BookOpen className="w-3.5 h-3.5 shrink-0" />;
    case 'adv-chat':
      return <Bot className="w-3.5 h-3.5 shrink-0" />;
    case 'adv-memory':
      return <Brain className="w-3.5 h-3.5 shrink-0" />;
    case 'adv-recs':
      return <Sparkles className="w-3.5 h-3.5 shrink-0" />;
    case 'adv-stem':
    case 'admin-research':
      return <FlaskConical className="w-3.5 h-3.5 shrink-0" />;
    case 'comm-mentors':
    case 'comm-meetups':
    case 'comm-alumni':
      return <Users className="w-3.5 h-3.5 shrink-0" />;
    case 'comm-hall':
      return <MessageSquare className="w-3.5 h-3.5 shrink-0" />;
    case 'prof-account':
      return <User className="w-3.5 h-3.5 shrink-0" />;
    case 'prof-privacy':
      return <ShieldCheck className="w-3.5 h-3.5 shrink-0" />;
    default:
      return <Layers className="w-3.5 h-3.5 shrink-0" />;
  }
}

function getAccentStyles(accent: MasterNavGroupConfig['accent']): {
  activeBtn: string;
  bar: string;
  subActive: string;
} {
  switch (accent) {
    case 'emerald':
      return {
        activeBtn:
          'bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-200/80 dark:border-emerald-800/70',
        bar: 'bg-emerald-600 dark:bg-emerald-400',
        subActive:
          'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-bold',
      };
    case 'amber':
      return {
        activeBtn:
          'bg-amber-50/90 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-200/80 dark:border-amber-800/70',
        bar: 'bg-amber-600 dark:bg-amber-400',
        subActive:
          'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-bold',
      };
    case 'indigo':
      return {
        activeBtn:
          'bg-blue-50/90 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-blue-200/80 dark:border-blue-800/70',
        bar: 'bg-blue-600 dark:bg-blue-400',
        subActive:
          'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 font-bold',
      };
    case 'slate':
      return {
        activeBtn:
          'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700',
        bar: 'bg-slate-700 dark:bg-slate-300',
        subActive:
          'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold',
      };
    default:
      return {
        activeBtn:
          'bg-blue-50/90 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-blue-200/80 dark:border-blue-800/70',
        bar: 'bg-blue-600 dark:bg-blue-400',
        subActive:
          'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 font-bold',
      };
  }
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  group,
  isKhmer,
  isGroupActive,
  activeSubId,
  isExpanded,
  collapsed,
  isFlyoutOpen,
  onMasterClick,
  onSubItemClick,
}) => {
  const label = isKhmer ? group.labelKm : group.labelEn;
  const styles = getAccentStyles(group.accent);
  const panelId = `sidebar-dropdown-${group.id}`;

  if (collapsed) {
    return (
      <div className="relative flex justify-center">
        <button
          type="button"
          onClick={() => onMasterClick(group)}
          aria-label={label}
          aria-expanded={isFlyoutOpen}
          aria-controls={panelId}
          title={label}
          className={`relative w-11 h-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
            isGroupActive || isFlyoutOpen
              ? styles.activeBtn
              : 'border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {isGroupActive && (
            <span className={`absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full ${styles.bar}`} />
          )}
          {getMasterIcon(group.id)}
        </button>

        {isFlyoutOpen && (
          <div
            id={panelId}
            className="absolute left-full top-0 ml-2.5 w-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-2 z-50"
          >
            <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
              {label}
            </div>
            <div className="space-y-0.5">
              {group.subItems.map((sub) => {
                const subActive = activeSubId === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    aria-current={subActive ? 'page' : undefined}
                    onClick={() => onSubItemClick(group, sub)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl flex items-start gap-2.5 transition-colors cursor-pointer ${
                      subActive
                        ? styles.subActive
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="mt-0.5 opacity-80">{getSubIcon(sub.id)}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-snug truncate">
                        {isKhmer ? sub.labelKm : sub.labelEn}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {isKhmer ? sub.descKm : sub.descEn}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => onMasterClick(group)}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className={`relative w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left text-[13px] font-bold border transition-all cursor-pointer ${
          isGroupActive
            ? styles.activeBtn
            : 'border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white'
        }`}
      >
        {isGroupActive && (
          <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${styles.bar}`} />
        )}
        <span className="flex items-center gap-2.5 min-w-0">
          {getMasterIcon(group.id)}
          <span className="truncate">{label}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 opacity-70 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          <div className="ml-[21px] pl-3 py-1 border-l-2 border-slate-200/90 dark:border-slate-700/80 space-y-0.5">
            {group.subItems.map((sub) => {
              const subActive = activeSubId === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  tabIndex={isExpanded ? 0 : -1}
                  aria-current={subActive ? 'page' : undefined}
                  onClick={() => onSubItemClick(group, sub)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 text-xs transition-colors cursor-pointer ${
                    subActive
                      ? styles.subActive
                      : 'text-slate-600 dark:text-slate-300 font-medium hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <span className={subActive ? 'opacity-100' : 'opacity-70'}>{getSubIcon(sub.id)}</span>
                  <span className="truncate">{isKhmer ? sub.labelKm : sub.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
