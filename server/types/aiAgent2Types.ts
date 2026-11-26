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

// 7-Pillar Student Long-Term Memory
export interface StudentIdentityMemory {
  fullName: string;
  educationTier: string; // e.g. "Grade 12 (Bac II Candidate)"
  schoolName: string;
  primaryLanguage: 'km' | 'en';
  learningDisposition: string;
  socioGeographicContext?: string; // non-discriminatory geographic context e.g. "Siem Reap Provincial School"
}

export interface StudentGoalsMemory {
  shortTermExamTarget: string; // e.g. "Grade A in Bac II Mathematics & Physics"
  longTermUniversityAspiration: string; // e.g. "CADT Software Engineering / ITC Automation"
  targetCareerDomain: string; // e.g. "Artificial Intelligence & Cloud Architecture"
  scholarshipAspiration: string; // e.g. "MPTC Techo Digital Talent Scholarship"
}

export interface StudentInterestItem {
  id: string;
  topic: string;
  category: 'STEM' | 'Digital Tech' | 'Creative' | 'Entrepreneurship' | 'Public Service';
  weight: number; // 0 to 1.0
  discoveredVia: string;
}

export interface StudentStrengthItem {
  id: string;
  competency: string;
  subject: string;
  masteryPercentage: number;
  evidenceSource: string; // e.g. "Virtual Lab: Hydraulic Gradient 94% score"
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
  peakFocusHour: string; // e.g. "06:00 - 08:30 Morning Peak"
  preferredExplanationStyle: 'intuitive' | 'rigorous' | 'visual' | 'socratic';
  gritPersistenceRating: number; // e.g. 84.5
  errorRecoverySpeedSeconds: number; // e.g. 42
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

// Personalization & Match Engine
export interface CrossDatabaseMatch {
  id: string;
  matchType: 'university_program' | 'scholarship' | 'learning_module' | 'virtual_lab' | 'career_role';
  title: string;
  provider: string; // e.g. "CADT", "ITC", "MPTC", "MoEYS"
  matchScorePercentage: number;
  reasoningJustification: string;
  alignedPillars: ('goals' | 'strengths' | 'interests' | 'career')[];
  actionLinkText: string;
  actionPayload: Record<string, unknown>;
}

// Action Plans & Career Roadmaps
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

// Adaptive Tutoring
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

// Safety Framework Guardrails
export type SafetyPolicyCode =
  | 'no_psychological_diagnosis'
  | 'no_absolute_career_decision'
  | 'no_harmful_profiling'
  | 'child_protection_safeguard'
  | 'pii_leakage_prevented'
  | 'none_safe';

export interface SafetyAuditResult {
  isSafe: boolean;
  policyFlagged: SafetyPolicyCode;
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  actionTaken: 'passed' | 'refused_and_referred' | 'neutralized' | 'escalated_to_educator';
  interventionExplanation: string;
  neutralizedResponse?: string;
}

// Knowledge Pipeline
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

// Analytics Closed-Loop
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
