/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { AppTabRouter } from './components/AppTabRouter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppFooter } from './components/navigation/AppFooter';
import { ADMIN_ONLY_TABS } from './components/navigation/navConfig';
import { readTabFromHash, VALID_TABS, writeTabHash } from './utils/tabHashRouting';
import { importWithRetry } from './utils/lazyWithRetry';
import { topCambodianUniversities } from './data/universityIntelligenceData';
import { universityClient } from './services/universityClient';
import { usePersistedNotifications } from './hooks/usePersistedNotifications';
import { useSidebarShellState, type NavigateTabOptions } from './hooks/useSidebarShellState';
import { mergeLiveUniversities, normalizeUniversityMedia } from './utils/mergeUniversities';
import { buildSessionStudentProfile } from './utils/appSessionProfile';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { SavedScholarshipsProvider } from './context/SavedScholarshipsContext';
import { AuthModal } from './components/AuthModal';
import type {
  TabView,
  Mentor,
  StudentMeetup,
  SessionBooking,
  ComprehensiveUniversityProfile,
  StudentProfile,
} from './types';
import { initialMentors, initialMeetups, initialMajorInsights, initialOpportunities } from './data/mockData';

const BookingModal = lazy(() => importWithRetry(() => import('./components/BookingModal').then((m) => ({ default: m.BookingModal }))));
const PatchNotesModal = lazy(() => importWithRetry(() => import('./components/PatchNotesModal').then((m) => ({ default: m.PatchNotesModal }))));
const AnalyticsTelemetryDrawer = lazy(() => importWithRetry(() => import('./components/AnalyticsTelemetryDrawer').then((m) => ({ default: m.AnalyticsTelemetryDrawer }))));
const ROICalculatorModal = lazy(() => importWithRetry(() => import('./components/ROICalculatorModal').then((m) => ({ default: m.ROICalculatorModal }))));

function AppContent() {
  const { user, authenticated, profile: authProfile } = useAuth();
  const isAdmin = user?.role === 'admin';
  const sessionKey = authenticated && user?.id ? user.id : 'guest';

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>(() => readTabFromHash(isAdmin));
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() =>
    buildSessionStudentProfile(authenticated, user, authProfile)
  );
  const [mentors] = useState(initialMentors);
  const [meetups, setMeetups] = useState(initialMeetups);
  const [majorInsights] = useState(initialMajorInsights);
  const [opportunities] = useState(initialOpportunities);
  const {
    notifications,
    markRead: handleMarkNotificationRead,
    markAllRead: handleClearAllNotifications,
    pushNotification,
  } = usePersistedNotifications(authenticated, sessionKey);

  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [advisorPrefillPrompt, setAdvisorPrefillPrompt] = useState<string>('');
  const [tabHistory, setTabHistory] = useState<TabView[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
  const [universities, setUniversities] = useState<ComprehensiveUniversityProfile[]>(() =>
    normalizeUniversityMedia(topCambodianUniversities)
  );
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [universitiesError, setUniversitiesError] = useState<string | null>(null);
  const [roiModalUnivId, setRoiModalUnivId] = useState<string | null>(null);
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState(false);
  const clearNavCommandRef = useRef<() => void>(() => {});

  const closeActiveOverlays = useCallback(() => {
    setRoiModalUnivId(null);
    setBookingMentor(null);
    setIsPatchNotesOpen(false);
  }, []);

  useEffect(() => {
    setStudentProfile(buildSessionStudentProfile(authenticated, user, authProfile));
    setAdvisorPrefillPrompt('');
    closeActiveOverlays();
    setSelectedUniversityId(null);
    setTabHistory((prev) => (isAdmin ? prev : prev.filter((t) => !ADMIN_ONLY_TABS.includes(t))));
  }, [sessionKey, authenticated, user, authProfile, isAdmin, closeActiveOverlays]);

  const loadLiveUniversities = useCallback(async () => {
    setUniversitiesLoading(true);
    setUniversitiesError(null);
    try {
      const liveRows = await universityClient.list();
      setUniversities(mergeLiveUniversities(topCambodianUniversities, liveRows));
    } catch (err) {
      setUniversitiesError(err instanceof Error ? err.message : 'Unable to refresh live university catalog.');
    } finally {
      setUniversitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLiveUniversities();
  }, [loadLiveUniversities]);

  useEffect(() => {
    const syncFromHash = (): void => {
      closeActiveOverlays();
      clearNavCommandRef.current();
      const next = readTabFromHash(isAdmin);
      setActiveTab((current) => (next !== current ? next : current));
    };
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, [isAdmin, closeActiveOverlays]);

  useEffect(() => {
    if (!isAdmin && ADMIN_ONLY_TABS.includes(activeTab)) {
      setActiveTab('dashboard');
      writeTabHash('dashboard');
    }
  }, [isAdmin, activeTab]);

  const handleNavigateTab = useCallback((tab: TabView, options?: NavigateTabOptions) => {
    let destination: TabView = VALID_TABS.has(tab) ? tab : 'dashboard';
    if (ADMIN_ONLY_TABS.includes(destination) && !isAdmin) {
      destination = 'dashboard';
    }
    closeActiveOverlays();
    if (!options?.preserveSubCommand) {
      clearNavCommandRef.current();
    }
    setActiveTab((current) => {
      if (destination !== current) {
        setTabHistory((prev) => [...prev, current]);
      }
      return destination;
    });
    writeTabHash(destination);
    if (!options?.skipScrollTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isAdmin, closeActiveOverlays]);

  const { sidebarCollapsed, toggleSidebarCollapsed, navCommand, clearNavCommand, handleSelectSubAction } = useSidebarShellState(
    handleNavigateTab,
    setRoiModalUnivId,
    universities[0]?.id || 'univ-cadt'
  );
  clearNavCommandRef.current = clearNavCommand;

  const handleGoBack = useCallback(() => {
    closeActiveOverlays();
    clearNavCommandRef.current();
    setTabHistory((history) => {
      const nextHistory = [...history];
      while (nextHistory.length > 0) {
        const candidate = nextHistory.pop()!;
        if (isAdmin || !ADMIN_ONLY_TABS.includes(candidate)) {
          setActiveTab(candidate);
          writeTabHash(candidate);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return nextHistory;
        }
      }
      return nextHistory;
    });
  }, [isAdmin, closeActiveOverlays]);

  const handleStartAdvisorPrompt = useCallback((promptText: string) => {
    setAdvisorPrefillPrompt(promptText);
    handleNavigateTab('advisor');
  }, [handleNavigateTab]);

  const handleAskAIAboutMajor = useCallback((majorName: string, university: string) => {
    handleStartAdvisorPrompt(
      `Can you provide a deep-dive analysis of ${majorName} at ${university} in Cambodia? What are the key curriculum stages (including Tronc Commun/Foundation Year), entrance exam criteria, and top career placements?`
    );
  }, [handleStartAdvisorPrompt]);

  const handleConfirmBooking = (newBooking: SessionBooking) => {
    setStudentProfile((prev) => ({
      ...prev,
      scheduledSessions: [newBooking, ...prev.scheduledSessions],
      explorationProgress: {
        ...prev.explorationProgress,
        mentorsContacted: prev.explorationProgress.mentorsContacted + 1,
      },
    }));
    pushNotification({
      id: `notif-${Date.now()}`,
      title: 'Guidance Session Confirmed',
      message: `Your 1-on-1 with ${newBooking.mentorName} is scheduled for ${newBooking.date}.`,
      timestamp: 'Just now',
      isRead: false,
      type: 'session',
    });
  };

  const handleToggleJoinMeetup = (meetupId: string) => {
    const target = meetups.find((m) => m.id === meetupId);
    const joining = target ? !target.isJoined : true;
    setMeetups((prev) =>
      prev.map((m) =>
        m.id === meetupId
          ? {
              ...m,
              isJoined: joining,
              currentParticipantsCount: joining
                ? m.currentParticipantsCount + 1
                : Math.max(0, m.currentParticipantsCount - 1),
            }
          : m
      )
    );
    setStudentProfile((prev) => ({
      ...prev,
      explorationProgress: {
        ...prev.explorationProgress,
        meetupsJoined: Math.max(0, prev.explorationProgress.meetupsJoined + (joining ? 1 : -1)),
      },
    }));
  };

  const handleHostMeetup = (d: Partial<StudentMeetup>) => {
    const created: StudentMeetup = {
      id: `meetup-${Date.now()}`, title: d.title || 'Student Study Circle', category: d.category || 'Exam Review',
      topic: d.topic || '', objective: d.objective || '', date: d.date || 'Upcoming Weekend',
      time: d.time || '3:00 PM', duration: '90 mins', format: d.format || 'online',
      location: d.location || 'Google Meet', meetingLink: d.meetingLink || 'https://meet.google.com/ais-study-circle',
      hostStudentId: studentProfile.id, hostName: studentProfile.name, hostAvatar: studentProfile.avatar,
      hostGradeLevel: studentProfile.educationLevel, currentParticipantsCount: 1, maxParticipants: d.maxParticipants || 20,
      isJoined: true, participants: [{ id: studentProfile.id, name: studentProfile.name, avatar: studentProfile.avatar, role: 'Host' }],
      chatMessages: d.chatMessages || [], status: 'upcoming', tags: d.tags || ['Study Group'],
      materialsOrPrep: d.materialsOrPrep || 'Bring past exam questions.',
    };
    setMeetups((prev) => [created, ...prev]);
    handleNavigateTab('meetups');
  };

  const handleAddChatMessage = (meetupId: string, text: string) => {
    setMeetups((prev) => prev.map((m) => (m.id === meetupId ? {
      ...m,
      chatMessages: [...m.chatMessages, {
        id: `msg-${Date.now()}`, senderId: studentProfile.id, senderName: studentProfile.name,
        senderAvatar: studentProfile.avatar, timestamp: 'Just now', text, isHost: m.hostStudentId === studentProfile.id,
      }],
    } : m)));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-blue-500 selection:text-white transition-colors">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-blue-600 focus:text-white focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Navbar
        currentTab={activeTab}
        activeTab={activeTab}
        onSelectTab={handleNavigateTab}
        onTabChange={handleNavigateTab}
        onSelectSubAction={handleSelectSubAction}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebarCollapsed={toggleSidebarCollapsed}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearAllNotifications={handleClearAllNotifications}
        studentProfile={studentProfile}
        studentName={studentProfile.name}
        studentAvatar={studentProfile.avatar}
        onOpenPatchNotes={() => setIsPatchNotesOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        canGoBack={tabHistory.length > 0}
        onBack={handleGoBack}
        onGoBack={handleGoBack}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-200 ease-out ${
          sidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[272px]'
        }`}
      >
        <AppTabRouter
          activeTab={activeTab}
          navCommand={navCommand}
          onConsumeNavCommand={clearNavCommand}
          sessionKey={sessionKey}
          authenticated={authenticated}
          userId={user?.id}
          isAdmin={isAdmin}
          canGoBack={tabHistory.length > 0}
          studentProfile={studentProfile}
          mentors={mentors}
          meetups={meetups}
          majorInsights={majorInsights}
          opportunities={opportunities}
          universities={universities}
          universitiesLoading={universitiesLoading}
          universitiesError={universitiesError}
          advisorPrefillPrompt={advisorPrefillPrompt}
          selectedUniversityId={selectedUniversityId}
          onConsumeAdvisorPrompt={() => setAdvisorPrefillPrompt('')}
          onConsumeUniversitySelection={() => setSelectedUniversityId(null)}
          onSelectUniversityDetails={(u) => {
            setSelectedUniversityId(u.id);
            handleNavigateTab('university-intelligence');
          }}
          onRetryUniversities={loadLiveUniversities}
          onNavigateTab={handleNavigateTab}
          onGoBack={handleGoBack}
          onStartAdvisorPrompt={handleStartAdvisorPrompt}
          onAskAIAboutMajor={handleAskAIAboutMajor}
          onOpenBooking={setBookingMentor}
          onCancelBooking={(bookingId) =>
            setStudentProfile((prev) => ({
              ...prev,
              scheduledSessions: prev.scheduledSessions.filter((s) => s.id !== bookingId),
            }))
          }
          onToggleSaveMentor={(mentorId) =>
            setStudentProfile((prev) => ({
              ...prev,
              savedMentorIds: prev.savedMentorIds.includes(mentorId)
                ? prev.savedMentorIds.filter((id) => id !== mentorId)
                : [...prev.savedMentorIds, mentorId],
            }))
          }
          onToggleSaveOpportunity={(oppId) =>
            setStudentProfile((prev) => ({
              ...prev,
              savedOpportunityIds: prev.savedOpportunityIds.includes(oppId)
                ? prev.savedOpportunityIds.filter((id) => id !== oppId)
                : [...prev.savedOpportunityIds, oppId],
            }))
          }
          onToggleJoinMeetup={handleToggleJoinMeetup}
          onHostMeetup={handleHostMeetup}
          onAddChatMessage={handleAddChatMessage}
          onUpdateInterests={(interests) => setStudentProfile((prev) => ({ ...prev, interests }))}
          onOpenROI={(id) => setRoiModalUnivId(id)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />

        <AppFooter onOpenPatchNotes={() => setIsPatchNotesOpen(true)} onNavigateTab={handleNavigateTab} />
      </div>

      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}

      <ErrorBoundary resetKey={`${activeTab}:${roiModalUnivId || ''}:${isPatchNotesOpen}`}>
        <Suspense fallback={null}>
          {bookingMentor && <BookingModal mentor={bookingMentor} studentProfile={studentProfile} onClose={() => setBookingMentor(null)} onConfirmBooking={handleConfirmBooking} />}
          {roiModalUnivId && <ROICalculatorModal isOpen={!!roiModalUnivId} onClose={() => setRoiModalUnivId(null)} universities={universities} initialUniversityId={roiModalUnivId} />}
          {isAdmin && <AnalyticsTelemetryDrawer />}
          {isPatchNotesOpen && <PatchNotesModal isOpen={isPatchNotesOpen} onClose={() => setIsPatchNotesOpen(false)} onNavigateToScholarships={() => handleNavigateTab('scholarships')} />}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SettingsProvider>
              <SavedScholarshipsProvider><AppContent /></SavedScholarshipsProvider>
            </SettingsProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
