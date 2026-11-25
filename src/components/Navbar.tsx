import React from 'react';
import type { NotificationItem, StudentProfile, TabView } from '../types';
import { TopNav } from './navigation/TopNav';
import { MobileBottomNav } from './navigation/MobileBottomNav';

export interface NavbarProps {
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
  onOpenAuthModal?: () => void;
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
  notifications = [],
  onMarkNotificationRead,
  onClearAllNotifications,
  onOpenAuthModal,
  onBack,
  onGoBack,
  canGoBack = false,
}) => {
  const currentTab = propCurrentTab || propActiveTab || 'dashboard';
  const handleSelectTab = (tab: TabView): void => {
    if (propSetCurrentTab) propSetCurrentTab(tab);
    else if (propOnSelectTab) propOnSelectTab(tab);
    else if (propOnTabChange) propOnTabChange(tab);
  };

  return (
    <>
      <TopNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        notifications={notifications}
        onMarkNotificationRead={onMarkNotificationRead}
        onClearAllNotifications={onClearAllNotifications}
        onOpenAuthModal={onOpenAuthModal}
        onBack={onBack || onGoBack}
        canGoBack={canGoBack}
      />
      <MobileBottomNav currentTab={currentTab} onSelectTab={handleSelectTab} />
    </>
  );
};
