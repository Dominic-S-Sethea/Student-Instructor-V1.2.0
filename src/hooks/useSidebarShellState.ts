import { useCallback, useEffect, useState } from 'react';
import type { TabView } from '../types';
import type { SubNavAction } from '../components/navigation/navConfig';
import { useSettings } from '../context/SettingsContext';

export interface NavSubCommand {
  nonce: number;
  action: SubNavAction;
}

export interface NavigateTabOptions {
  skipScrollTop?: boolean;
  preserveSubCommand?: boolean;
}

export function useSidebarShellState(
  onNavigateTab: (tab: TabView, options?: NavigateTabOptions) => void,
  onOpenROI: (univId: string) => void,
  defaultUniversityId: string
): {
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  navCommand: NavSubCommand | null;
  clearNavCommand: () => void;
  handleSelectSubAction: (action: SubNavAction) => void;
} {
  const { settings, updateSettings } = useSettings();
  const sidebarCollapsed = settings.sidebarDefaultCollapsed;
  const [navCommand, setNavCommand] = useState<NavSubCommand | null>(null);
  const [pendingScroll, setPendingScroll] = useState<{ id: string; nonce: number } | null>(null);

  const toggleSidebarCollapsed = useCallback(() => {
    updateSettings({ sidebarDefaultCollapsed: !sidebarCollapsed });
  }, [sidebarCollapsed, updateSettings]);

  const clearNavCommand = useCallback(() => {
    setNavCommand(null);
    setPendingScroll(null);
  }, []);

  // Poll briefly so lazy-loaded tab content mounts before scrolling to anchor IDs
  useEffect(() => {
    if (!pendingScroll) return;
    let attempts = 0;
    const maxAttempts = 35;

    const tryScroll = (): boolean => {
      const el = document.getElementById(pendingScroll.id);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('ring-2', 'ring-blue-500/60', 'ring-offset-2');
      window.setTimeout(() => {
        el.classList.remove('ring-2', 'ring-blue-500/60', 'ring-offset-2');
      }, 1400);
      setPendingScroll(null);
      return true;
    };

    if (tryScroll()) return;
    const interval = window.setInterval(() => {
      attempts += 1;
      if (tryScroll() || attempts >= maxAttempts) {
        window.clearInterval(interval);
        if (attempts >= maxAttempts) setPendingScroll(null);
      }
    }, 60);

    return () => window.clearInterval(interval);
  }, [pendingScroll]);

  const handleSelectSubAction = useCallback(
    (action: SubNavAction) => {
      const nonce = Date.now();
      setNavCommand({ nonce, action });

      switch (action.type) {
        case 'tab':
          setPendingScroll(null);
          onNavigateTab(action.tab, { preserveSubCommand: true });
          return;
        case 'scholarship-view':
          setPendingScroll(null);
          onNavigateTab('scholarships', { preserveSubCommand: true });
          return;
        case 'university-view':
          setPendingScroll(null);
          if (action.subTab === 'roi') {
            onOpenROI(defaultUniversityId);
          } else {
            onNavigateTab('university-intelligence', { preserveSubCommand: true });
          }
          return;
        case 'advisor-view':
          setPendingScroll(null);
          onNavigateTab('advisor', { preserveSubCommand: true });
          return;
        case 'scroll':
          onNavigateTab(action.tab, { skipScrollTop: true, preserveSubCommand: true });
          setPendingScroll({ id: action.elementId, nonce });
          return;
      }
    },
    [onNavigateTab, onOpenROI, defaultUniversityId]
  );

  return {
    sidebarCollapsed,
    toggleSidebarCollapsed,
    navCommand,
    clearNavCommand,
    handleSelectSubAction,
  };
}
