import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { StudentDashboard } from './StudentDashboard';
import type { NavSubCommand } from '../hooks/useSidebarShellState';
import type {
  ComprehensiveUniversityProfile,
  Mentor,
  OpportunityItem,
  StudentMeetup,
  StudentProfile,
  TabView,
  UniversityMajorInsight,
} from '../types';

const AIAdvisor = lazy(() => import('./AIAdvisor').then((m) => ({ default: m.AIAdvisor })));
const UniversityAlumniView = lazy(() => import('./UniversityAlumniView').then((m) => ({ default: m.UniversityAlumniView })));
const MentorDiscovery = lazy(() => import('./MentorDiscovery').then((m) => ({ default: m.MentorDiscovery })));
const StudentMeetupsView = lazy(() => import('./StudentMeetupsView').then((m) => ({ default: m.StudentMeetupsView })));
const MajorsAndCareersView = lazy(() => import('./MajorsAndCareersView').then((m) => ({ default: m.MajorsAndCareersView })));
const ConferencesAndAMAsView = lazy(() => import('./ConferencesAndAMAsView').then((m) => ({ default: m.ConferencesAndAMAsView })));
const StudentProfileView = lazy(() => import('./StudentProfileView').then((m) => ({ default: m.StudentProfileView })));
const STEMDiscoveryView = lazy(() => import('./STEMDiscoveryView').then((m) => ({ default: m.STEMDiscoveryView })));
const DecisionEngineView = lazy(() => import('./DecisionEngineView').then((m) => ({ default: m.DecisionEngineView })));
const UniversityIntelligenceView = lazy(() => import('./UniversityIntelligenceView').then((m) => ({ default: m.UniversityIntelligenceView })));
const ScholarshipIntelligenceView = lazy(() => import('./ScholarshipIntelligenceView').then((m) => ({ default: m.ScholarshipIntelligenceView })));
const AvatarWorldView = lazy(() => import('./avatar/AvatarWorldView').then((m) => ({ default: m.AvatarWorldView })));
const CommunityDashboard = lazy(() => import('./community/CommunityDashboard').then((m) => ({ default: m.CommunityDashboard })));
const ResearchLaboratoryView = lazy(() => import('./research/ResearchLaboratoryView').then((m) => ({ default: m.ResearchLaboratoryView })));
const PlatformArchitectureView = lazy(() => import('./architecture/PlatformArchitectureView').then((m) => ({ default: m.PlatformArchitectureView })));
const EducationDataPlatformView = lazy(() => import('./data-strategy/EducationDataPlatformView').then((m) => ({ default: m.EducationDataPlatformView })));

export interface AppTabRouterProps {
  activeTab: TabView;
  navCommand?: NavSubCommand | null;
  sessionKey: string;
  authenticated: boolean;
  userId?: string;
  isAdmin: boolean;
  canGoBack: boolean;
  studentProfile: StudentProfile;
  mentors: Mentor[];
  meetups: StudentMeetup[];
  majorInsights: UniversityMajorInsight[];
  opportunities: OpportunityItem[];
  universities: ComprehensiveUniversityProfile[];
  universitiesLoading: boolean;
  universitiesError: string | null;
  advisorPrefillPrompt: string;
  selectedUniversityId: string | null;
  onConsumeAdvisorPrompt: () => void;
  onConsumeUniversitySelection: () => void;
  onSelectUniversityDetails: (u: ComprehensiveUniversityProfile) => void;
  onRetryUniversities: () => void;
  onNavigateTab: (tab: TabView) => void;
  onGoBack: () => void;
  onStartAdvisorPrompt: (prompt: string) => void;
  onAskAIAboutMajor: (majorName: string, university: string) => void;
  onOpenBooking: (mentor: Mentor) => void;
  onCancelBooking: (bookingId: string) => void;
  onToggleSaveMentor: (mentorId: string) => void;
  onToggleSaveOpportunity: (oppId: string) => void;
  onToggleJoinMeetup: (meetupId: string) => void;
  onHostMeetup: (data: Partial<StudentMeetup>) => void;
  onAddChatMessage: (meetupId: string, text: string) => void;
  onUpdateInterests: (interests: string[]) => void;
  onOpenROI: (univId: string) => void;
  onOpenAuthModal: () => void;
}

export const AppTabRouter: React.FC<AppTabRouterProps> = (props) => {
  const { activeTab, navCommand, sessionKey, isAdmin, studentProfile, mentors, meetups, majorInsights, opportunities, universities } = props;

  const schViewCmd =
    navCommand?.action.type === 'scholarship-view' && navCommand.action.view !== 'saved'
      ? { view: navCommand.action.view, nonce: navCommand.nonce }
      : undefined;
  const schSavedNonce =
    navCommand?.action.type === 'scholarship-view' && navCommand.action.view === 'saved'
      ? navCommand.nonce
      : undefined;
  const uniSubCmd =
    navCommand?.action.type === 'university-view' && navCommand.action.subTab !== 'roi'
      ? { subTab: navCommand.action.subTab, nonce: navCommand.nonce }
      : undefined;
  const advSubCmd =
    navCommand?.action.type === 'advisor-view'
      ? { subTab: navCommand.action.subTab, nonce: navCommand.nonce }
      : undefined;

  return (
    <main id="main-content" tabIndex={-1} className="flex-1 w-full mx-auto pb-20 lg:pb-0 focus:outline-hidden">
      {activeTab === 'dashboard' && (
        <StudentDashboard
          key={sessionKey}
          studentProfile={studentProfile}
          mentors={mentors}
          meetups={meetups}
          majorInsights={majorInsights}
          opportunities={opportunities}
          onNavigateTab={props.onNavigateTab}
          onNavigate={props.onNavigateTab}
          onSelectPrompt={props.onStartAdvisorPrompt}
          onStartAIChatWithPrompt={props.onStartAdvisorPrompt}
          onOpenBooking={props.onOpenBooking}
          onSelectMentor={props.onOpenBooking}
          onToggleSaveMentor={props.onToggleSaveMentor}
          onToggleSaveOpportunity={props.onToggleSaveOpportunity}
          onOpenMeetup={() => props.onNavigateTab('meetups')}
          onOpenMajorInsight={() => props.onNavigateTab('alumni')}
          onOpenAuthModal={props.onOpenAuthModal}
          canGoBack={props.canGoBack}
          onBack={props.onGoBack}
        />
      )}

      <ErrorBoundary resetKey={`${activeTab}:${sessionKey}`}>
        <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading view...</div>}>
          {activeTab === 'avatar-world' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
              <AvatarWorldView key={sessionKey} studentId={props.authenticated && props.userId ? props.userId : 'guest'} onNavigateTab={props.onNavigateTab} />
            </div>
          )}

          {(activeTab === 'advisor' || activeTab === 'ai-advisor') && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <AIAdvisor
                key={sessionKey}
                studentProfile={studentProfile}
                mentors={mentors}
                initialPrompt={props.advisorPrefillPrompt}
                onConsumeInitialPrompt={props.onConsumeAdvisorPrompt}
                onOpenBooking={props.onOpenBooking}
                onNavigateTab={(tab) => props.onNavigateTab(tab as TabView)}
                externalSubTab={advSubCmd?.subTab}
                externalSubTabNonce={advSubCmd?.nonce}
              />
            </div>
          )}

          {activeTab === 'stem-discovery' && (
            <STEMDiscoveryView studentName={studentProfile.name} onNavigateTab={props.onNavigateTab} onBack={props.onGoBack} />
          )}

          {activeTab === 'alumni' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <UniversityAlumniView majorInsights={majorInsights} mentors={mentors} onOpenBooking={props.onOpenBooking} onAskAIAboutMajor={props.onAskAIAboutMajor} />
            </div>
          )}

          {(activeTab === 'mentors' || activeTab === 'become-mentor') && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <MentorDiscovery mentors={mentors} savedMentorIds={studentProfile.savedMentorIds} studentProfile={studentProfile} onToggleSaveMentor={props.onToggleSaveMentor} onOpenBooking={props.onOpenBooking} />
            </div>
          )}

          {activeTab === 'community' && <CommunityDashboard key={sessionKey} initialWing="hall" />}

          {activeTab === 'meetups' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <StudentMeetupsView meetups={meetups} studentProfile={studentProfile} onToggleJoinMeetup={props.onToggleJoinMeetup} onHostMeetup={props.onHostMeetup} onAddChatMessage={props.onAddChatMessage} />
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <MajorsAndCareersView
                opportunities={opportunities}
                savedOpportunityIds={studentProfile.savedOpportunityIds}
                onToggleSaveOpportunity={props.onToggleSaveOpportunity}
                onNavigateTab={props.onNavigateTab}
                onStartAIChatWithPrompt={props.onStartAdvisorPrompt}
                onOpenBooking={props.onOpenBooking}
                mentors={mentors}
                onAskAdvisor={(topic) =>
                  props.onStartAdvisorPrompt(
                    `Can you provide a deep-dive roadmap, required foundation preparation, and career job market outlook for ${topic}?`
                  )
                }
              />
            </div>
          )}

          {activeTab === 'events' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <ConferencesAndAMAsView studentName={studentProfile.name} onNavigateTab={props.onNavigateTab} onOpenBooking={props.onOpenBooking} />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <StudentProfileView
                key={sessionKey}
                studentProfile={studentProfile}
                mentors={mentors}
                opportunities={opportunities}
                onUpdateInterests={props.onUpdateInterests}
                onCancelBooking={props.onCancelBooking}
                onOpenBooking={props.onOpenBooking}
                onOpenAuthModal={props.onOpenAuthModal}
                onNavigateTab={props.onNavigateTab}
              />
            </div>
          )}

          {activeTab === 'decision-engine' && (
            <DecisionEngineView
              key={sessionKey}
              universities={universities}
              onNavigateTab={props.onNavigateTab}
              onOpenROI={props.onOpenROI}
              onOpenUniversityDetails={props.onSelectUniversityDetails}
              onStartAIChatWithPrompt={props.onStartAdvisorPrompt}
            />
          )}

          {activeTab === 'university-intelligence' && (
            <UniversityIntelligenceView
              key={sessionKey}
              universities={universities}
              initialSelectedUniversityId={props.selectedUniversityId}
              onConsumeInitialSelection={props.onConsumeUniversitySelection}
              onNavigateTab={props.onNavigateTab}
              onStartAIChatWithPrompt={props.onStartAdvisorPrompt}
              onOpenBookingWithSenior={() => props.onNavigateTab('alumni')}
              isLoadingLive={props.universitiesLoading}
              liveError={props.universitiesError}
              onRetryLive={props.onRetryUniversities}
              externalSubTab={uniSubCmd?.subTab}
              externalSubTabNonce={uniSubCmd?.nonce}
            />
          )}

          {activeTab === 'scholarships' && (
            <ScholarshipIntelligenceView
              key={sessionKey}
              onOpenAuthModal={props.onOpenAuthModal}
              externalDirectoryView={schViewCmd?.view}
              externalViewNonce={schViewCmd?.nonce}
              openSavedNonce={schSavedNonce}
            />
          )}

          {isAdmin && activeTab === 'research-lab' && <ResearchLaboratoryView />}
          {isAdmin && activeTab === 'platform-architecture' && <PlatformArchitectureView />}
          {isAdmin && activeTab === 'data-strategy' && <EducationDataPlatformView />}
        </Suspense>
      </ErrorBoundary>
    </main>
  );
};
