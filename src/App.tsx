/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { ADMIN_ONLY_TABS } from './components/navigation/navConfig';
import { topCambodianUniversities } from './data/universityIntelligenceData';
import { universityClient } from './services/universityClient';
import { mergeLiveUniversities } from './utils/mergeUniversities';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

const AIAdvisor = lazy(() => import('./components/AIAdvisor').then((m) => ({ default: m.AIAdvisor })));
const UniversityAlumniView = lazy(() => import('./components/UniversityAlumniView').then((m) => ({ default: m.UniversityAlumniView })));
const MentorDiscovery = lazy(() => import('./components/MentorDiscovery').then((m) => ({ default: m.MentorDiscovery })));
const StudentMeetupsView = lazy(() => import('./components/StudentMeetupsView').then((m) => ({ default: m.StudentMeetupsView })));
const MajorsAndCareersView = lazy(() => import('./components/MajorsAndCareersView').then((m) => ({ default: m.MajorsAndCareersView })));
const ConferencesAndAMAsView = lazy(() => import('./components/ConferencesAndAMAsView').then((m) => ({ default: m.ConferencesAndAMAsView })));
const StudentProfileView = lazy(() => import('./components/StudentProfileView').then((m) => ({ default: m.StudentProfileView })));
const BookingModal = lazy(() => import('./components/BookingModal').then((m) => ({ default: m.BookingModal })));
const STEMDiscoveryView = lazy(() => import('./components/STEMDiscoveryView').then((m) => ({ default: m.STEMDiscoveryView })));
const DecisionEngineView = lazy(() => import('./components/DecisionEngineView').then((m) => ({ default: m.DecisionEngineView })));
const UniversityIntelligenceView = lazy(() => import('./components/UniversityIntelligenceView').then((m) => ({ default: m.UniversityIntelligenceView })));
const ScholarshipIntelligenceView = lazy(() => import('./components/ScholarshipIntelligenceView').then((m) => ({ default: m.ScholarshipIntelligenceView })));
const AvatarWorldView = lazy(() => import('./components/avatar/AvatarWorldView').then((m) => ({ default: m.AvatarWorldView })));
const CommunityDashboard = lazy(() => import('./components/community/CommunityDashboard').then((m) => ({ default: m.CommunityDashboard })));
const ResearchLaboratoryView = lazy(() => import('./components/research/ResearchLaboratoryView').then((m) => ({ default: m.ResearchLaboratoryView })));
const PlatformArchitectureView = lazy(() => import('./components/architecture/PlatformArchitectureView').then((m) => ({ default: m.PlatformArchitectureView })));
const EducationDataPlatformView = lazy(() => import('./components/data-strategy/EducationDataPlatformView').then((m) => ({ default: m.EducationDataPlatformView })));
const PatchNotesModal = lazy(() => import('./components/PatchNotesModal').then((m) => ({ default: m.PatchNotesModal })));
const AnalyticsTelemetryDrawer = lazy(() => import('./components/AnalyticsTelemetryDrawer').then((m) => ({ default: m.AnalyticsTelemetryDrawer })));
const ROICalculatorModal = lazy(() => import('./components/ROICalculatorModal').then((m) => ({ default: m.ROICalculatorModal })));
import {
  TabView,
  Mentor,
  StudentMeetup,
  SessionBooking,
  ComprehensiveUniversityProfile,
} from './types';
import {
  initialStudentProfile,
  initialMentors,
  initialMeetups,
  initialMajorInsights,
  initialOpportunities,
  initialNotifications,
} from './data/mockData';

function AppContent() {
  const { user, authenticated } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
  const [studentProfile, setStudentProfile] = useState(initialStudentProfile);
  const [mentors] = useState(initialMentors);
  const [meetups, setMeetups] = useState(initialMeetups);
  const [majorInsights] = useState(initialMajorInsights);
  const [opportunities] = useState(initialOpportunities);
  const [notifications, setNotifications] = useState(initialNotifications);

  // Modals and cross-tab triggers
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [advisorPrefillPrompt, setAdvisorPrefillPrompt] = useState<string>('');
  const [tabHistory, setTabHistory] = useState<TabView[]>([]);
  const [universities, setUniversities] = useState<ComprehensiveUniversityProfile[]>(topCambodianUniversities);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [universitiesError, setUniversitiesError] = useState<string | null>(null);
  const [roiModalUnivId, setRoiModalUnivId] = useState<string | null>(null);
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState(false);

  const loadLiveUniversities = useCallback(async () => {
    setUniversitiesLoading(true);
    setUniversitiesError(null);
    try {
      const liveRows = await universityClient.list();
      setUniversities(mergeLiveUniversities(topCambodianUniversities, liveRows));
    } catch (err) {
      setUniversitiesError(
        err instanceof Error ? err.message : 'Unable to refresh live university catalog.'
      );
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

  // Tab navigation helpers
  const handleNavigateTab = (tab: TabView) => {
    // Teenager safety protection: redirect messages to mentors with public comments
    let destination: TabView = (tab as string) === 'messages' ? 'mentors' : tab;
    if (ADMIN_ONLY_TABS.includes(destination) && !isAdmin) {
      destination = 'dashboard';
    }
    if (destination !== activeTab) {
      setTabHistory((prev) => [...prev, activeTab]);
      setActiveTab(destination);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    if (tabHistory.length > 0) {
      const prev = tabHistory[tabHistory.length - 1];
      setTabHistory((history) => history.slice(0, -1));
      setActiveTab(prev);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectPromptFromDashboard = (promptText: string) => {
    setAdvisorPrefillPrompt(promptText);
    setActiveTab('advisor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAskAIAboutMajor = (majorName: string, university: string) => {
    const prompt = `Can you provide a deep-dive analysis of ${majorName} at ${university} in Cambodia? What are the key curriculum stages (including Tronc Commun/Foundation Year), entrance exam criteria, and top career placements?`;
    setAdvisorPrefillPrompt(prompt);
    setActiveTab('advisor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Booking handlers
  const handleOpenBooking = (mentor: Mentor) => {
    setBookingMentor(mentor);
  };

  const handleConfirmBooking = (newBooking: SessionBooking) => {
    setStudentProfile((prev) => ({
      ...prev,
      scheduledSessions: [newBooking, ...prev.scheduledSessions],
      explorationProgress: {
        ...prev.explorationProgress,
        mentorsContacted: prev.explorationProgress.mentorsContacted + 1,
      },
    }));

    // Add a notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Guidance Session Confirmed',
        message: `Your 1-on-1 with ${newBooking.mentorName} is scheduled for ${newBooking.date}.`,
        timestamp: 'Just now',
        isRead: false,
        type: 'session',
      },
      ...prev,
    ]);
  };

  const handleCancelBooking = (bookingId: string) => {
    setStudentProfile((prev) => ({
      ...prev,
      scheduledSessions: prev.scheduledSessions.filter((s) => s.id !== bookingId),
    }));
  };

  // Bookmark handlers
  const handleToggleSaveMentor = (mentorId: string) => {
    setStudentProfile((prev) => {
      const isSaved = prev.savedMentorIds.includes(mentorId);
      return {
        ...prev,
        savedMentorIds: isSaved
          ? prev.savedMentorIds.filter((id) => id !== mentorId)
          : [...prev.savedMentorIds, mentorId],
      };
    });
  };

  const handleToggleSaveOpportunity = (oppId: string) => {
    setStudentProfile((prev) => {
      const isSaved = prev.savedOpportunityIds.includes(oppId);
      return {
        ...prev,
        savedOpportunityIds: isSaved
          ? prev.savedOpportunityIds.filter((id) => id !== oppId)
          : [...prev.savedOpportunityIds, oppId],
      };
    });
  };

  // Meetup handlers
  const handleToggleJoinMeetup = (meetupId: string) => {
    setMeetups((prev) =>
      prev.map((m) => {
        if (m.id === meetupId) {
          const nowJoined = !m.isJoined;
          return {
            ...m,
            isJoined: nowJoined,
            currentParticipantsCount: nowJoined
              ? m.currentParticipantsCount + 1
              : Math.max(0, m.currentParticipantsCount - 1),
          };
        }
        return m;
      })
    );

    setStudentProfile((prev) => ({
      ...prev,
      explorationProgress: {
        ...prev.explorationProgress,
        meetupsJoined: prev.explorationProgress.meetupsJoined + 1,
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
      participants: [
        { id: studentProfile.id, name: studentProfile.name, avatar: studentProfile.avatar, role: 'Host' },
      ],
      chatMessages: newMeetupData.chatMessages || [],
      status: 'upcoming',
      tags: newMeetupData.tags || ['Study Group'],
      materialsOrPrep: newMeetupData.materialsOrPrep || 'Bring past exam questions.',
    };

    setMeetups((prev) => [created, ...prev]);
    setActiveTab('meetups');
  };

  const handleAddChatMessage = (meetupId: string, text: string) => {
    setMeetups((prev) =>
      prev.map((m) => {
        if (m.id === meetupId) {
          return {
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
          };
        }
        return m;
      })
    );
  };

  const handleUpdateInterests = (interests: string[]) => {
    setStudentProfile((prev) => ({
      ...prev,
      interests,
    }));
  };

  const handleMarkNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-blue-500 selection:text-white transition-colors">
        {/* 1. Global Navigation Bar */}
        <Navbar
          currentTab={activeTab}
          activeTab={activeTab}
          onSelectTab={handleNavigateTab}
          onTabChange={handleNavigateTab}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onClearAllNotifications={handleClearAllNotifications}
          studentProfile={studentProfile}
          studentName={studentProfile?.name}
          studentAvatar={studentProfile?.avatar}
          onOpenPatchNotes={() => setIsPatchNotesOpen(true)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          canGoBack={tabHistory.length > 0}
          onBack={handleGoBack}
          onGoBack={handleGoBack}
        />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 w-full mx-auto pb-20 lg:pb-0">
        {activeTab === 'dashboard' && (
          <StudentDashboard
            studentProfile={studentProfile}
            mentors={mentors}
            meetups={meetups}
            majorInsights={majorInsights}
            opportunities={opportunities}
            onNavigateTab={handleNavigateTab}
            onNavigate={handleNavigateTab}
            onSelectPrompt={handleSelectPromptFromDashboard}
            onStartAIChatWithPrompt={handleSelectPromptFromDashboard}
            onOpenBooking={handleOpenBooking}
            onSelectMentor={handleOpenBooking}
            onToggleSaveMentor={handleToggleSaveMentor}
            onToggleSaveOpportunity={handleToggleSaveOpportunity}
            onOpenMeetup={() => handleNavigateTab('meetups')}
            onOpenMajorInsight={() => handleNavigateTab('alumni')}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            canGoBack={tabHistory.length > 0}
            onBack={handleGoBack}
          />
        )}

        <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading view...</div>}>
          {activeTab === 'avatar-world' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
              <AvatarWorldView
                studentId={studentProfile?.id || 'usr-student-01'}
                onNavigateTab={handleNavigateTab}
              />
            </div>
          )}

          {(activeTab === 'advisor' || activeTab === 'ai-advisor') && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <AIAdvisor
                key={user?.id || 'guest'}
                studentProfile={studentProfile}
                mentors={mentors}
                initialPrompt={advisorPrefillPrompt}
                onOpenBooking={handleOpenBooking}
                onNavigateTab={(tab) => handleNavigateTab(tab as TabView)}
              />
            </div>
          )}

        {activeTab === 'stem-discovery' && (
          <STEMDiscoveryView
            studentName={studentProfile?.name}
            onNavigateTab={handleNavigateTab}
            onBack={handleGoBack}
          />
        )}

        {activeTab === 'alumni' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <UniversityAlumniView
              majorInsights={majorInsights}
              mentors={mentors}
              onOpenBooking={handleOpenBooking}
              onAskAIAboutMajor={handleAskAIAboutMajor}
            />
          </div>
        )}

        {(activeTab === 'mentors' || activeTab === 'become-mentor') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <MentorDiscovery
              mentors={mentors}
              savedMentorIds={studentProfile.savedMentorIds}
              studentProfile={studentProfile}
              onToggleSaveMentor={handleToggleSaveMentor}
              onOpenBooking={handleOpenBooking}
            />
          </div>
        )}

        {activeTab === 'community' && (
          <CommunityDashboard initialWing="hall" />
        )}

        {activeTab === 'meetups' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <StudentMeetupsView
              meetups={meetups}
              studentProfile={studentProfile}
              onToggleJoinMeetup={handleToggleJoinMeetup}
              onHostMeetup={handleHostMeetup}
              onAddChatMessage={handleAddChatMessage}
            />
          </div>
        )}

        {/* Discovery Tab 1: Majors & Careers Comprehensive Directory */}
        {activeTab === 'opportunities' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <MajorsAndCareersView
              opportunities={opportunities}
              savedOpportunityIds={studentProfile.savedOpportunityIds}
              onToggleSaveOpportunity={handleToggleSaveOpportunity}
              onNavigateTab={handleNavigateTab}
              onStartAIChatWithPrompt={(prompt) => {
                setAdvisorPrefillPrompt(prompt);
                handleNavigateTab('advisor');
              }}
              onOpenBooking={handleOpenBooking}
              mentors={mentors}
              onAskAdvisor={(topic) => {
                setAdvisorPrefillPrompt(
                  `Can you provide a deep-dive roadmap, required foundation preparation, and career job market outlook for ${topic}?`
                );
                handleNavigateTab('advisor');
              }}
            />
          </div>
        )}

        {/* Discovery Tab 2: Free Conferences, Webinars & Senior AMAs */}
        {activeTab === 'events' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <ConferencesAndAMAsView
              studentName={studentProfile?.name}
              onNavigateTab={handleNavigateTab}
              onOpenBooking={handleOpenBooking}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <StudentProfileView
              key={user?.id || 'guest'}
              studentProfile={studentProfile}
              mentors={mentors}
              opportunities={opportunities}
              onUpdateInterests={handleUpdateInterests}
              onCancelBooking={handleCancelBooking}
              onOpenBooking={handleOpenBooking}
              onOpenAuthModal={() => setAuthModalOpen(true)}
              onNavigateTab={handleNavigateTab}
            />
          </div>
        )}

        {/* 5. Student Decision Intelligence Platform Views */}
        {activeTab === 'decision-engine' && (
          <DecisionEngineView
            universities={universities}
            onNavigateTab={handleNavigateTab}
            onOpenROI={(id) => setRoiModalUnivId(id)}
            onOpenUniversityDetails={(u) => {
              handleNavigateTab('university-intelligence');
            }}
            onStartAIChatWithPrompt={(prompt) => {
              setAdvisorPrefillPrompt(prompt);
              handleNavigateTab('advisor');
            }}
          />
        )}

        {activeTab === 'university-intelligence' && (
          <UniversityIntelligenceView
            universities={universities}
            onNavigateTab={handleNavigateTab}
            onOpenBookingWithSenior={() => {
              handleNavigateTab('alumni');
            }}
            isLoadingLive={universitiesLoading}
            liveError={universitiesError}
            onRetryLive={loadLiveUniversities}
          />
        )}

        {activeTab === 'scholarships' && (
          <ScholarshipIntelligenceView
            key={authenticated ? user?.id : 'guest'}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {isAdmin && activeTab === 'research-lab' && (
          <ResearchLaboratoryView />
        )}

        {isAdmin && activeTab === 'platform-architecture' && (
          <PlatformArchitectureView />
        )}

        {isAdmin && activeTab === 'data-strategy' && (
          <EducationDataPlatformView />
        )}
        </Suspense>
      </main>

      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}

      <Suspense fallback={null}>
        {/* 3. Global Mentorship Booking Modal */}
        {bookingMentor && (
          <BookingModal
            mentor={bookingMentor}
            studentProfile={studentProfile}
            onClose={() => setBookingMentor(null)}
            onConfirmBooking={handleConfirmBooking}
          />
        )}

        {/* 3.1 Global ROI Calculator Modal */}
        {roiModalUnivId && (
          <ROICalculatorModal
            isOpen={!!roiModalUnivId}
            onClose={() => setRoiModalUnivId(null)}
            universities={universities}
            initialUniversityId={roiModalUnivId}
          />
        )}

        {/* 3.2 Live Telemetry Drawer (Admin Only) */}
        {isAdmin && <AnalyticsTelemetryDrawer />}

        {/* 3.3 Version V1.2.0 Patch Notes Modal */}
        {isPatchNotesOpen && (
          <PatchNotesModal
            isOpen={isPatchNotesOpen}
            onClose={() => setIsPatchNotesOpen(false)}
            onNavigateToScholarships={() => handleNavigateTab('scholarships')}
          />
        )}
      </Suspense>

      {/* 4. Global Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 pb-24 lg:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100">Student Instructor</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsPatchNotesOpen(true)}
              className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Release Notes
            </button>
            <span>•</span>
            <span>Scholarships, University Guides &amp; Student Mentorship</span>
          </div>

          <div className="flex items-center gap-4">
            <span>ITC • CADT • RUPP • UHS Curricula Grounded</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleNavigateTab('dashboard')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
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
