/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { AIAdvisor } from './components/AIAdvisor';
import { UniversityAlumniView } from './components/UniversityAlumniView';
import { MentorDiscovery } from './components/MentorDiscovery';
import { StudentMeetupsView } from './components/StudentMeetupsView';
import { OpportunityDirectory } from './components/OpportunityDirectory';
import { MajorsAndCareersView } from './components/MajorsAndCareersView';
import { ConferencesAndAMAsView } from './components/ConferencesAndAMAsView';
import { StudentProfileView } from './components/StudentProfileView';
import { BookingModal } from './components/BookingModal';
import { STEMDiscoveryView } from './components/STEMDiscoveryView';
import { DecisionEngineView } from './components/DecisionEngineView';
import { UniversityIntelligenceView } from './components/UniversityIntelligenceView';
import { ScholarshipIntelligenceView } from './components/ScholarshipIntelligenceView';
import { AvatarWorldView } from './components/avatar/AvatarWorldView';
import { CommunityDashboard } from './components/community/CommunityDashboard';
import { ResearchLaboratoryView } from './components/research/ResearchLaboratoryView';
import { PlatformArchitectureView } from './components/architecture/PlatformArchitectureView';
import { EducationDataPlatformView } from './components/data-strategy/EducationDataPlatformView';
import { PatchNotesModal } from './components/PatchNotesModal';
import { AnalyticsTelemetryDrawer } from './components/AnalyticsTelemetryDrawer';
import { ROICalculatorModal } from './components/ROICalculatorModal';
import { topCambodianUniversities } from './data/universityIntelligenceData';
import { LanguageProvider } from './context/LanguageContext';
import {
  TabView,
  Mentor,
  StudentMeetup,
  UniversityMajorInsight,
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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
  const [studentProfile, setStudentProfile] = useState(initialStudentProfile);
  const [mentors, setMentors] = useState(initialMentors);
  const [meetups, setMeetups] = useState(initialMeetups);
  const [majorInsights, setMajorInsights] = useState(initialMajorInsights);
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [notifications, setNotifications] = useState(initialNotifications);

  // Modals and cross-tab triggers
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [advisorPrefillPrompt, setAdvisorPrefillPrompt] = useState<string>('');
  const [tabHistory, setTabHistory] = useState<TabView[]>([]);
  const [universities] = useState<ComprehensiveUniversityProfile[]>(topCambodianUniversities);
  const [roiModalUnivId, setRoiModalUnivId] = useState<string | null>(null);
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState(false);

  // Tab navigation helpers
  const handleNavigateTab = (tab: TabView) => {
    // Teenager safety protection: redirect messages to mentors with public comments
    const destination = (tab as string) === 'messages' ? 'mentors' : tab;
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
    <LanguageProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
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
          canGoBack={tabHistory.length > 0}
          onBack={handleGoBack}
          onGoBack={handleGoBack}
        />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 w-full mx-auto">
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
            canGoBack={tabHistory.length > 0}
            onBack={handleGoBack}
          />
        )}

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
              studentProfile={studentProfile}
              mentors={mentors}
              initialPrompt={advisorPrefillPrompt}
              onOpenBooking={handleOpenBooking}
              onNavigateTab={handleNavigateTab}
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
              studentProfile={studentProfile}
              mentors={mentors}
              opportunities={opportunities}
              onUpdateInterests={handleUpdateInterests}
              onCancelBooking={handleCancelBooking}
              onOpenBooking={handleOpenBooking}
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
            onOpenBookingWithSenior={(abbr) => {
              handleNavigateTab('alumni');
            }}
          />
        )}

        {activeTab === 'scholarships' && (
          <ScholarshipIntelligenceView />
        )}

        {activeTab === 'research-lab' && (
          <ResearchLaboratoryView />
        )}

        {activeTab === 'platform-architecture' && (
          <PlatformArchitectureView />
        )}

        {activeTab === 'data-strategy' && (
          <EducationDataPlatformView />
        )}
      </main>

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

      {/* 3.2 Live Telemetry Drawer */}
      <AnalyticsTelemetryDrawer />

      {/* 3.3 Version V1.2.0 Patch Notes Modal */}
      <PatchNotesModal
        isOpen={isPatchNotesOpen}
        onClose={() => setIsPatchNotesOpen(false)}
        onNavigateToScholarships={() => handleNavigateTab('scholarships')}
      />

      {/* 4. Global Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-stone-900">Student Instructor V1.2.0</span>
            <span>•</span>
            <button
              onClick={() => setIsPatchNotesOpen(true)}
              className="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
            >
              <span>V1.2.0 Patch Notes</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
            <span>•</span>
            <span>Comprehensive University Degree Guidance & Peer Mentorship Platform</span>
          </div>

          <div className="flex items-center space-x-4">
            <span>ITC • CADT • RUPP • UHS Academic Curricula Grounded</span>
            <span>•</span>
            <button
              onClick={() => handleNavigateTab('dashboard')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </footer>
    </div>
    </LanguageProvider>
  );
}
