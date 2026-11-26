import { useCallback, useEffect, useState } from 'react';
import type { TabView } from '../types';
import type { SubNavAction } from '../components/navigation/navConfig';
import { useSettings } from '../context/SettingsContext';

export interface NavSubCommand {
  nonce: number;
  action: SubNavAction;
}

export function useSidebarShellState(
  onNavigateTab: (tab: TabView) => void,
  onOpenROI: (univId: string) => void,
  defaultUniversityId: string
): {
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  navCommand: NavSubCommand | null;
  handleSelectSubAction: (action: SubNavAction) => void;
} {
  const { settings, updateSettings } = useSettings();
  const sidebarCollapsed = settings.sidebarDefaultCollapsed;
  const [navCommand, setNavCommand] = useState<NavSubCommand | null>(null);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

  const toggleSidebarCollapsed = useCallback(() => {
    updateSettings({ sidebarDefaultCollapsed: !sidebarCollapsed });
  }, [sidebarCollapsed, updateSettings]);

  useEffect(() => {
    if (!pendingScrollId) return;
    const timer = window.setTimeout(() => {
      const el = document.getElementById(pendingScrollId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setPendingScrollId(null);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [pendingScrollId, navCommand]);

  const handleSelectSubAction = useCallback(
    (action: SubNavAction) => {
      const nonce = Date.now();
      setNavCommand({ nonce, action });

      switch (action.type) {
        case 'tab':
          onNavigateTab(action.tab);
          return;
        case 'scholarship-view':
          onNavigateTab('scholarships');
          return;
        case 'university-view':
          if (action.subTab === 'roi') {
            onOpenROI(defaultUniversityId);
          } else {
            onNavigateTab('university-intelligence');
          }
          return;
        case 'advisor-view':
          onNavigateTab('advisor');
          return;
        case 'scroll':
          onNavigateTab(action.tab);
          setPendingScrollId(action.elementId);
          return;
      }
    },
    [onNavigateTab, onOpenROI, defaultUniversityId]
  );

  return {
    sidebarCollapsed,
    toggleSidebarCollapsed,
    navCommand,
    handleSelectSubAction,
  };
}
