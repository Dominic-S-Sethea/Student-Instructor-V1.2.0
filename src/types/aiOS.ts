export type AgentKey =
  | 'education_advisor'
  | 'career_intelligence'
  | 'learning_coach'
  | 'research_agent'
  | 'parent_assistant'
  | 'teacher_assistant';

export interface MultiAgentMetadata {
  key: AgentKey;
  nameEn: string;
  nameKm: string;
  roleDescription: string;
  specializationDomain: string;
  reasoningArchetype: string;
  primaryColor: string;
  iconKey: string;
  suggestedPrompts: string[];
}

export interface StudentIdentityMemory {
  fullName: string;
  educationTier: string;
  schoolName: string;
  primaryLanguage: 'km' | 'en';
  learningDisposition: string;
  socioGeographicContext?: string;
}

export interface StudentGoalsMemory {
  shortTermExamTarget: string;
  longTermUniversityAspiration: string;
  targetCareerDomain: string;
  scholarshipAspiration: string;
}

export interface StudentInterestItem {
  id: string;
  topic: string;
  category: 'STEM' | 'Digital Tech' | 'Creative' | 'Entrepreneurship' | 'Public Service';
  weight: number;
  discoveredVia: string;
}

export interface StudentStrengthItem {
  id: string;
  competency: string;
  subject: string;
  masteryPercentage: number;
  evidenceSource: string;
}

export interface StudentWeaknessItem {
  id: string;
  misconceptionPattern: string;
  subject: string;
  struggleFrequency: number;
  remediationStatus: 'active' | 'in_progress' | 'resolved';
}

export interface StudentLearningPatternsMemory {
  pacingVelocity: 'deliberate_reflective' | 'fast_iterative' | 'deep_diver';
  peakFocusHour: string;
  preferredExplanationStyle: 'intuitive' | 'rigorous' | 'visual' | 'socratic';
  gritPersistenceRating: number;
  errorRecoverySpeedSeconds: number;
}

export interface StudentAchievementItem {
  id: string;
  title: string;
  awardedBy: string;
  credentialBadge: string;
  unlockedAt: string;
}

export interface StudentLongTermMemory {
  studentId: string;
  identity: StudentIdentityMemory;
  goals: StudentGoalsMemory;
  interests: StudentInterestItem[];
  strengths: StudentStrengthItem[];
  weaknesses: StudentWeaknessItem[];
  learningPatterns: StudentLearningPatternsMemory;
  achievements: StudentAchievementItem[];
  memoryConfidenceScore: number;
  lastReflectionAt: string;
  updatedAt: string;
}

export interface CrossDatabaseMatch {
  id: string;
  matchType: 'university_program' | 'scholarship' | 'learning_module' | 'virtual_lab' | 'career_role';
  title: string;
  provider: string;
  matchScorePercentage: number;
  reasoningJustification: string;
  alignedPillars: ('goals' | 'strengths' | 'interests' | 'career')[];
  actionLinkText: string;
  actionPayload: Record<string, any>;
}

export interface ActionMilestone {
  id: string;
  order: number;
  title: string;
  description: string;
  targetTimeline: string;
  isCompleted: boolean;
  linkedEntityType?: 'course' | 'lab' | 'scholarship' | 'quiz' | 'external_app';
  linkedEntityId?: string;
}

export interface AIActionPlan {
  id: string;
  studentId: string;
  planType: 'learning_plan' | 'career_roadmap' | 'scholarship_sprint' | 'stem_mastery';
  title: string;
  targetObjective: string;
  timeframeWeeks: number;
  progressPercentage: number;
  status: 'active' | 'completed' | 'paused' | 'recalibrating';
  milestones: ActionMilestone[];
  createdAt: string;
  updatedAt: string;
}

export type ExplanationMode = 'intuitive' | 'rigorous' | 'visual' | 'socratic';
export type ZpdDifficultyLevel = 'foundation' | 'beginner' | 'intermediate' | 'advanced' | 'olympiad';

export interface AdaptiveTutorConcept {
  id: string;
  subject: string;
  topic: string;
  coreQuestion: string;
  explanations: Record<ExplanationMode, {
    title: string;
    body: string;
    analogyOrProof: string;
  }>;
  difficultyLevels: Record<ZpdDifficultyLevel, {
    problemStatement: string;
    hintScaffold: string[];
    sampleAnswer: string;
  }>;
  practiceRecommendations: {
    drillTitle: string;
    focusCompetency: string;
    estimatedMinutes: number;
    labLink?: string;
  }[];
}

export interface SafetyAuditResult {
  isSafe: boolean;
  policyFlagged: string;
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  actionTaken: 'passed' | 'refused_and_referred' | 'neutralized' | 'escalated_to_educator';
  interventionExplanation: string;
  neutralizedResponse?: string;
}

export interface KnowledgePipelineItem {
  id: string;
  documentTitle: string;
  curriculumDomain: 'MoEYS Bac II' | 'Higher Ed Cambodia' | 'STEM Research' | 'Scholarship Rules';
  sourceAgency: 'MoEYS' | 'ITC' | 'CADT' | 'MPTC' | 'UNESCO';
  verificationStatus: 'ingested' | 'peer_reviewed' | 'verified' | 'deprecated';
  embeddingModel: string;
  chunkCount: number;
  confidenceScore: number;
  lastVerifiedAt: string;
  ingestedAt: string;
}

export interface ClosedLoopAnalyticsMetric {
  conversationsInitiated: number;
  recommendationsDelivered: number;
  recommendationsAccepted: number;
  milestonesCompleted: number;
  academicOutcomesAchieved: number;
  conversionFunnel: {
    step: string;
    count: number;
    percentage: number;
  }[];
  recentEvents: {
    id: string;
    timestamp: string;
    agentKey: AgentKey;
    eventStage: string;
    summary: string;
  }[];
}
