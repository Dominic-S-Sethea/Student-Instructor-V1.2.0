/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { AppTabRouter } from './components/AppTabRouter';
import { ADMIN_ONLY_TABS } from './components/navigation/navConfig';
import { topCambodianUniversities } from './data/universityIntelligenceData';
import { universityClient } from './services/universityClient';
import { usePersistedNotifications } from './hooks/usePersistedNotifications';
import { mergeLiveUniversities } from './utils/mergeUniversities';
import { buildSessionStudentProfile } from './utils/appSessionProfile';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import type {
  TabView,
  Mentor,
  StudentMeetup,
  SessionBooking,
  ComprehensiveUniversityProfile,
  StudentProfile,
} from './types';
import {
  initialMentors,
  initialMeetups,
  initialMajorInsights,
  initialOpportunities,
} from './data/mockData';

const BookingModal = lazy(() => import('./components/BookingModal').then((m) => ({ default: m.BookingModal })));
const PatchNotesModal = lazy(() => import('./components/PatchNotesModal').then((m) => ({ default: m.PatchNotesModal })));
const AnalyticsTelemetryDrawer = lazy(() => import('./components/AnalyticsTelemetryDrawer').then((m) => ({ default: m.AnalyticsTelemetryDrawer })));
const ROICalculatorModal = lazy(() => import('./components/ROICalculatorModal').then((m) => ({ default: m.ROICalculatorModal })));

function AppContent() {
  const { user, authenticated, profile: authProfile } = useAuth();
  const isAdmin = user?.role === 'admin';
  const sessionKey = authenticated && user?.id ? user.id : 'guest';

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
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
  const [universities, setUniversities] = useState<ComprehensiveUniversityProfile[]>(topCambodianUniversities);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [universitiesError, setUniversitiesError] = useState<string | null>(null);
  const [roiModalUnivId, setRoiModalUnivId] = useState<string | null>(null);
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState(false);

  useEffect(() => {
    setStudentProfile(buildSessionStudentProfile(authenticated, user, authProfile));
    setAdvisorPrefillPrompt('');
    setBookingMentor(null);
    setSelectedUniversityId(null);
    setTabHistory((prev) => (isAdmin ? prev : prev.filter((t) => !ADMIN_ONLY_TABS.includes(t))));
  }, [sessionKey, authenticated, user, authProfile, isAdmin]);

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
    if (!isAdmin && ADMIN_ONLY_TABS.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [isAdmin, activeTab]);

  const handleNavigateTab = useCallback((tab: TabView) => {
    let destination: TabView = (tab as string) === 'messages' ? 'mentors' : tab;
    if (ADMIN_ONLY_TABS.includes(destination) && !isAdmin) {
      destination = 'dashboard';
    }
    setActiveTab((current) => {
      if (destination !== current) {
        setTabHistory((prev) => [...prev, current]);
      }
      return destination;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isAdmin]);

  const handleGoBack = useCallback(() => {
    setTabHistory((history) => {
      const nextHistory = [...history];
      while (nextHistory.length > 0) {
        const candidate = nextHistory.pop()!;
        if (isAdmin || !ADMIN_ONLY_TABS.includes(candidate)) {
          setActiveTab(candidate);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return nextHistory;
        }
      }
      return nextHistory;
    });
  }, [isAdmin]);

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

  const handleHostMeetup = (newMeetupData: Partial<StudentMeetup>) => {
    const created: StudentMeetup = {
      id: `meetup-${Date.now()}`,
      title: newMeetupData.title || 'Student Study Circle',
      category: newMeetupData.category || 'Exam Review',
      topic: newMeetupData.topic || '',
      objective: newMeetupData.objective || '',
      date: newMeetupData.date || 'Upcoming Weekend',
      time: newMeetupData.time || '3:00 PM',
      duration: '90 mins',
      format: newMeetupData.format || 'online',
      location: newMeetupData.location || 'Google Meet',
      meetingLink: newMeetupData.meetingLink || 'https://meet.google.com/ais-study-circle',
      hostStudentId: studentProfile.id,
      hostName: studentProfile.name,
      hostAvatar: studentProfile.avatar,
      hostGradeLevel: studentProfile.educationLevel,
      currentParticipantsCount: 1,
      maxParticipants: newMeetupData.maxParticipants || 20,
      isJoined: true,
      participants: [{ id: studentProfile.id, name: studentProfile.name, avatar: studentProfile.avatar, role: 'Host' }],
      chatMessages: newMeetupData.chatMessages || [],
      status: 'upcoming',
      tags: newMeetupData.tags || ['Study Group'],
      materialsOrPrep: newMeetupData.materialsOrPrep || 'Bring past exam questions.',
    };
    setMeetups((prev) => [created, ...prev]);
    handleNavigateTab('meetups');
  };

  const handleAddChatMessage = (meetupId: string, text: string) => {
    setMeetups((prev) =>
      prev.map((m) =>
        m.id === meetupId
          ? {
              ...m,
              chatMessages: [
                ...m.chatMessages,
                {
                  id: `msg-${Date.now()}`,
                  senderId: studentProfile.id,
                  senderName: studentProfile.name,
                  senderAvatar: studentProfile.avatar,
                  timestamp: 'Just now',
                  text,
                  isHost: m.hostStudentId === studentProfile.id,
                },
              ],
            }
          : m
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-blue-500 selection:text-white transition-colors">
      <Navbar
        currentTab={activeTab}
        activeTab={activeTab}
        onSelectTab={handleNavigateTab}
        onTabChange={handleNavigateTab}
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

      <AppTabRouter
        activeTab={activeTab}
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

      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}

      <Suspense fallback={null}>
        {bookingMentor && (
          <BookingModal mentor={bookingMentor} studentProfile={studentProfile} onClose={() => setBookingMentor(null)} onConfirmBooking={handleConfirmBooking} />
        )}
        {roiModalUnivId && (
          <ROICalculatorModal isOpen={!!roiModalUnivId} onClose={() => setRoiModalUnivId(null)} universities={universities} initialUniversityId={roiModalUnivId} />
        )}
        {isAdmin && <AnalyticsTelemetryDrawer />}
        {isPatchNotesOpen && (
          <PatchNotesModal isOpen={isPatchNotesOpen} onClose={() => setIsPatchNotesOpen(false)} onNavigateToScholarships={() => handleNavigateTab('scholarships')} />
        )}
      </Suspense>

      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 pb-24 lg:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100">Student Instructor</span>
            <span>•</span>
            <button type="button" onClick={() => setIsPatchNotesOpen(true)} className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer">
              Release Notes
            </button>
            <span>•</span>
            <span>Scholarships, University Guides &amp; Student Mentorship</span>
          </div>
          <div className="flex items-center gap-4">
            <span>ITC • CADT • RUPP • UHS Curricula Grounded</span>
            <span>•</span>
            <button type="button" onClick={() => handleNavigateTab('dashboard')} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer">
              Student Home
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
