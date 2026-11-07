/**
 * CDES Student Intelligence Analytics Platform Types
 * Foundation for AI Education Agent, Personal Learning System, Avatar World, and STEM Games.
 */

// ==========================================
// 1. EVENT TRACKING SPECIFICATION TYPES
// ==========================================

export type UserEventType =
  | 'login'
  | 'logout'
  | 'profile_update'
  | 'search'
  | 'bookmark'
  | 'page_visit';

export type EducationEventType =
  | 'lesson_started'
  | 'lesson_completed'
  | 'quiz_attempt'
  | 'experiment_completed'
  | 'course_progress';

export type AIInteractionEventType =
  | 'ai_question'
  | 'ai_recommendation'
  | 'career_analysis'
  | 'scholarship_matching';

export type GameEventType =
  | 'game_started'
  | 'level_completed'
  | 'level_failed'
  | 'difficulty_changed'
  | 'achievement_unlocked';

export type VirtualWorldEventType =
  | 'avatar_created'
  | 'room_customized'
  | 'friend_interaction'
  | 'environment_exploration';

export type UniversalEventType =
  | UserEventType
  | EducationEventType
  | AIInteractionEventType
  | GameEventType
  | VirtualWorldEventType
  | string;

export interface IngestionEventPayload {
  studentId?: string;
  userId?: string;
  sessionId?: string;
  eventType: UniversalEventType;
  timestamp?: string;
  duration?: number;
  // Learning specific
  contentId?: string;
  action?: string;
  score?: number;
  timeSpent?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'hard' | string;
  // Game specific
  gameId?: string;
  level?: number;
  attempt?: number;
  success?: boolean | number;
  failureReason?: string;
  timeTaken?: number;
  // Generic metadata
  metadata?: Record<string, any>;
}

// ==========================================
// 2. DATABASE ENTITY RECORDS
// ==========================================

export interface ActivityEventRecord {
  id: string;
  student_id: string | null;
  user_id: string | null;
  session_id: string | null;
  event_type: string;
  timestamp: string;
  duration: number;
  metadata: string; // JSON
}

export interface LearningEventRecord {
  id: string;
  student_id: string;
  user_id: string | null;
  content_id: string;
  action: string;
  score: number | null;
  time_spent: number;
  difficulty: string;
  performance: string | null;
  metadata: string; // JSON
  timestamp: string;
}

export interface GameEventRecord {
  id: string;
  student_id: string;
  user_id: string | null;
  game_id: string;
  level: number;
  attempt: number;
  success: number;
  failure_reason: string | null;
  time_taken: number;
  action: string | null;
  duration: number | null;
  result: string | null;
  score: number;
  metadata: string; // JSON
  timestamp: string;
}

// ==========================================
// 3. STUDENT INTELLIGENCE PROFILE
// ==========================================

export interface LearningPreferences {
  primaryStyle: 'visual' | 'textual' | 'interactive' | 'simulation' | 'balanced';
  pacing: 'accelerated' | 'moderate' | 'deliberate' | 'deep_dive';
  sessionLengthPreferenceMinutes: number;
  peakLearningHours: 'morning' | 'afternoon' | 'evening' | 'late_night';
  visualPreferenceRatio: number; // 0 to 1
  interactivePreferenceRatio: number; // 0 to 1
}

export interface SubjectAssessment {
  subject: string;
  score: number; // 0 - 100
  attemptsCount: number;
  masteryLevel: 'Novice' | 'Developing' | 'Proficient' | 'Advanced' | 'Master';
  lastPracticed: string;
}

export interface StudentIntelligenceProfile {
  studentId: string;
  learningPreferences: LearningPreferences;
  subjectStrengths: SubjectAssessment[];
  subjectWeaknesses: SubjectAssessment[];
  interestPatterns: string[];
  engagementScore: number; // 0 to 100
  persistenceScore: number; // 0 to 100
  problemSolvingScore: number; // 0 to 100
  updatedAt: string;
}

// ==========================================
// 4. LEARNING ANALYTICS ENGINE OUTPUTS
// ==========================================

export interface EngagementMetrics {
  totalTimeSpentSeconds: number;
  totalTimeSpentMinutes: number;
  totalTimeSpentHours: number;
  activeDaysCount: number;
  weeklySessionFrequency: number;
  consistencyScore: number; // 0 - 100
  lastActive: string | null;
  dailyActiveTrend: Array<{ date: string; activeMinutes: number; eventCount: number }>;
}

export interface LearningProgressionMetrics {
  improvementRatePercentage: number;
  masteryLevel: 'Novice' | 'Developing' | 'Proficient' | 'Advanced' | 'Master';
  averageScore: number;
  completedLessonsCount: number;
  difficultyProgression: {
    beginnerCount: number;
    intermediateCount: number;
    advancedCount: number;
    hardCount: number;
  };
  totalQuizzesTaken: number;
}

export interface BehavioralMetrics {
  persistenceScore: number; // 0 - 100
  retrySuccessRate: number; // 0 - 100
  averageAttemptsBeforeSuccess: number;
  curiosityBreadthScore: number; // 0 - 100
  topicsExploredCount: number;
  explorationDiversityIndex: number; // 0 - 1
  gameResilienceScore: number;
}

export interface ComprehensiveStudentAnalytics {
  profile: StudentIntelligenceProfile;
  engagement: EngagementMetrics;
  learning: LearningProgressionMetrics;
  behavior: BehavioralMetrics;
  recommendations: Array<{
    category: 'pedagogy' | 'subject' | 'challenge' | 'wellbeing';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

// ==========================================
// 5. EDUCATION RESEARCH PLATFORM
// ==========================================

export interface ResearchExperiment {
  id: string;
  name: string;
  hypothesis: string;
  startDate: string;
  endDate: string | null;
  status: 'draft' | 'active' | 'concluded';
  description?: string;
  targetMetrics: string[];
  createdAt: string;
  participantCount?: number;
  groupCounts?: Record<string, number>;
}

export interface ExperimentParticipant {
  id: string;
  studentId: string;
  experimentId: string;
  groupName: string; // e.g. 'Group A', 'Group B'
  assignedAt: string;
}

export interface ExperimentOutcomeReport {
  experimentId: string;
  experimentName: string;
  hypothesis: string;
  sampleSize: number;
  groups: {
    [groupName: string]: {
      participantCount: number;
      averageQuizScore: number;
      retentionRatePercentage: number;
      averageEngagementMinutes: number;
      completionRatePercentage: number;
      persistenceScore: number;
    };
  };
  statisticalSignificance: {
    pValue: number;
    isSignificant: boolean;
    confidenceInterval: string;
    effectSize: number;
  };
  keyFindings: string[];
  pedagogicalRecommendation: string;
  updatedAt: string;
}

// ==========================================
// 6. PRIVACY & CHILD SAFETY
// ==========================================

export interface StudentPrivacyConsent {
  studentId: string;
  isMinor: boolean;
  parentalConsentVerified: boolean;
  parentEmail: string | null;
  allowAnalyticsTracking: boolean;
  allowResearchInclusion: boolean;
  anonymizedResearchId: string;
  consentDate: string;
  updatedAt: string;
}

export interface AnonymizedResearchDataPoint {
  anonymizedId: string;
  ageCohort: string; // e.g., '14-16', '17-18', '19+'
  regionCohort: string; // e.g., 'Phnom Penh', 'Siem Reap', 'Province'
  experimentGroup?: string;
  totalTimeSpentMinutes: number;
  averageScore: number;
  persistenceRating: number;
  learningStyle: string;
  difficultyMastered: string;
  completionRate: number;
}

// ==========================================
// 7. FUTURE AI INTEGRATION PIPELINE
// ==========================================

export interface EducationAIPipelineContext {
  studentProfile: {
    id: string;
    displayName: string;
    gradeLevel: string;
    targetMajor: string;
    targetCareer: string;
    isMinor: boolean;
  };
  learningHistory: {
    masteredConcepts: string[];
    strugglingConcepts: string[];
    recentScoresAverage: number;
    totalLessonsCompleted: number;
    difficultyCeiling: string;
  };
  behaviorPatterns: {
    primaryLearningStyle: string;
    pacingVelocity: string;
    persistenceIndex: number;
    curiosityBreadth: number;
    frustrationRiskIndicator: 'Low' | 'Moderate' | 'High';
  };
  educationKnowledgeBase: {
    curriculumDomain: string;
    bacIICoreRequirements: string[];
    recommendedScholarships: string[];
    pedagogicalInterventions: string[];
  };
  synthesizedAIPromptContext: string;
}
