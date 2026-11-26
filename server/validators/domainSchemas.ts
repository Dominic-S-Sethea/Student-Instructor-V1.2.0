import { z } from 'zod';

const optionalShortStr = (max = 200) => z.string().trim().max(max).nullish();
const stringArrayOrString = (maxItems = 25, maxLen = 120) =>
  z.union([z.array(z.string().max(maxLen)).max(maxItems), z.string().max(1500)]).optional();

// ============================================================================
// Scholarships, Submissions & Reports
// ============================================================================

export const ScholarshipMatchSchema = z.object({
  gpa: z.number().finite().min(0).max(5).optional(),
  ielts: z.number().finite().min(0).max(9).optional(),
  degreeLevel: z.string().trim().max(80).optional(),
  fieldOfStudy: z.string().trim().max(120).optional(),
  preferredRegion: z.string().trim().max(100).optional(),
  studentCategory: z.string().trim().max(100).optional(),
  age: z.number().int().min(10).max(90).optional(),
  needsFullFunding: z.boolean().optional(),
}).passthrough();

export const ScholarshipSubmitSchema = z.object({
  organizationName: z.string().trim().min(1).max(200).optional(),
  organization_name: z.string().trim().min(1).max(200).optional(),
  contactPerson: optionalShortStr(150),
  contact_person: optionalShortStr(150),
  contactEmail: z.string().trim().email().max(200).optional(),
  contact_email: z.string().trim().email().max(200).optional(),
  officialWebsite: optionalShortStr(500),
  official_website: optionalShortStr(500),
  scholarshipName: z.string().trim().min(1).max(250).optional(),
  scholarship_name: z.string().trim().min(1).max(250).optional(),
  scholarshipNameKm: optionalShortStr(250),
  country: optionalShortStr(100),
  region: optionalShortStr(100),
  degreeLevel: stringArrayOrString(15, 80),
  fieldOfStudy: stringArrayOrString(20, 120),
  fundingType: optionalShortStr(120),
  fundingDetails: optionalShortStr(2000),
  eligibilitySummary: optionalShortStr(3000),
  deadline: optionalShortStr(80),
  applicationLink: optionalShortStr(1000),
  application_link: optionalShortStr(1000),
  officialSourceUrl: optionalShortStr(1000),
  official_source_url: optionalShortStr(1000),
}).passthrough().refine(
  (v) => Boolean((v.organizationName || v.organization_name) && (v.scholarshipName || v.scholarship_name)),
  { message: 'organizationName and scholarshipName are required.' }
);

export const ScholarshipReportSchema = z.object({
  scholarshipId: z.string().trim().min(1).max(120).optional(),
  scholarship_id: z.string().trim().min(1).max(120).optional(),
  scholarshipName: optionalShortStr(250),
  reportedField: optionalShortStr(100),
  reported_field: optionalShortStr(100),
  description: z.string().trim().min(3, 'Description must be at least 3 characters.').max(2000),
  suggestedCorrection: optionalShortStr(1000),
  suggested_correction: optionalShortStr(1000),
  officialSourceUrl: optionalShortStr(1000),
  official_source_url: optionalShortStr(1000),
}).passthrough().refine(
  (v) => Boolean(v.scholarshipId || v.scholarship_id),
  { message: 'scholarshipId is required.' }
);

export const ScholarshipWriteSchema = z.object({
  name: z.string().trim().min(1).max(250).optional(),
  provider: z.string().trim().min(1).max(200).optional(),
  country: optionalShortStr(100),
  region: optionalShortStr(100),
  deadline: optionalShortStr(100),
  fundingType: optionalShortStr(120),
  applicationLink: optionalShortStr(1000),
  application_link: optionalShortStr(1000),
  officialSourceUrl: optionalShortStr(1000),
  official_source_url: optionalShortStr(1000),
}).passthrough();

export const ScholarshipVerifySchema = z.object({
  verifierName: optionalShortStr(150),
  notes: optionalShortStr(1500),
});

// ============================================================================
// Community Hub Schemas
// ============================================================================

export const CommunityPostCreateSchema = z.object({
  community_id: z.string().trim().min(1, 'community_id is required.').max(120),
  title: z.string().trim().min(1, 'title is required.').max(200),
  content: z.string().trim().min(1, 'content is required.').max(5000),
  post_type: z.string().trim().max(40).optional(),
  author_name: optionalShortStr(80),
  author_avatar: optionalShortStr(500),
  tags: z.array(z.string().max(40)).max(10).optional(),
});

export const CommunityCommentCreateSchema = z.object({
  content: z.string().trim().min(1, 'content is required.').max(3000),
  author_name: optionalShortStr(80),
  author_avatar: optionalShortStr(500),
  parent_comment_id: optionalShortStr(120),
});

export const MentorBookSchema = z.object({
  mentor_id: z.string().trim().min(1, 'mentor_id is required.').max(120),
  topic: z.string().trim().min(1, 'topic is required.').max(250),
  scheduled_date: z.string().trim().min(4, 'scheduled_date is required.').max(40),
  scheduled_time: z.string().trim().min(2, 'scheduled_time is required.').max(40),
  session_type: z.string().trim().max(60).optional(),
  student_name: optionalShortStr(100),
  student_notes: optionalShortStr(1000),
});

export const ProjectJoinSchema = z.object({
  user_name: optionalShortStr(100),
  user_avatar: optionalShortStr(500),
  role_in_project: optionalShortStr(80),
});

export const EventRsvpSchema = z.object({
  user_name: optionalShortStr(100),
});

export const ModerationReportSchema = z.object({
  reported_item_id: z.string().trim().min(1, 'reported_item_id is required.').max(120),
  reported_item_type: z.string().trim().max(40).optional(),
  reason: z.string().trim().max(60).optional(),
  description: z.string().max(1500).optional(),
});

// ============================================================================
// Privacy, Hermes Memory, Analytics, Decision, Avatar, Learning & Research
// ============================================================================

export const PrivacyConsentUpdateSchema = z.object({
  isMinor: z.boolean().optional(),
  parentEmail: z.string().trim().email('parentEmail must be a valid email.').max(200).nullable().optional(),
  parentalConsentVerified: z.boolean().optional(),
  allowAnalyticsTracking: z.boolean().optional(),
  allowResearchInclusion: z.boolean().optional(),
  allowAiMemory: z.boolean().optional(),
  withdrawAll: z.boolean().optional(),
});

export const ParentVerifySchema = z.object({
  parentEmail: z.string().trim().email('A valid parental email is required for verification.').max(200),
});

export const HermesDocUpdateSchema = z.object({
  content: z.string().max(12000),
});

export const HermesFactCreateSchema = z.object({
  factText: z.string().trim().min(1, 'factText is required.').max(400),
  category: z
    .enum(['preference', 'goal', 'strength', 'growth_area', 'milestone', 'target_school', 'study_habit'])
    .optional(),
  entities: z.array(z.string().max(64)).max(20).optional(),
  keywords: z.array(z.string().max(64)).max(20).optional(),
});

export const HermesFactFeedbackSchema = z.object({
  action: z.enum(['confirm', 'correct', 'end', 'revert']),
  updatedText: z.string().max(400).optional(),
  note: z.string().max(300).optional(),
});

export const AnalyticsTrackSchema = z.object({
  eventType: z.string().trim().min(1, 'eventType is required.').max(80),
  sessionId: optionalShortStr(120),
  duration: z.number().finite().optional(),
  contentId: optionalShortStr(120),
  action: optionalShortStr(80),
  score: z.number().finite().optional(),
  timeSpent: z.number().finite().optional(),
  difficulty: optionalShortStr(40),
  gameId: optionalShortStr(120),
  level: z.number().int().min(0).max(1000).optional(),
  attempt: z.number().int().min(0).max(1000).optional(),
  success: z.boolean().optional(),
  failureReason: optionalShortStr(200),
  timeTaken: z.number().finite().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const DecisionEvaluateSchema = z.object({
  interests: z.array(z.string().max(80)).max(20).optional(),
  mathAbility: z.string().max(60).optional(),
  strengths: z.array(z.string().max(80)).max(20).optional(),
  budgetTier: z.string().max(60).optional(),
  workStyle: z.string().max(60).optional(),
  careerGoal: z.string().max(100).optional(),
});

export const AvatarUpdateSchema = z.object({
  avatar_name: z.string().trim().min(1).max(80).optional(),
  gender_presentation: z.string().max(40).optional(),
  skin_tone: z.string().max(30).optional(),
  hair_style: z.string().max(60).optional(),
  hair_color: z.string().max(30).optional(),
  eye_color: z.string().max(30).optional(),
  clothing_outfit: z.string().max(60).optional(),
  accessory: z.string().max(60).optional(),
  expression: z.string().max(60).optional(),
}).passthrough();

export const VirtualRoomUpdateSchema = z.object({
  room_name: z.string().trim().min(1).max(80).optional(),
  background_theme: z.string().max(60).optional(),
  wall_color: z.string().max(30).optional(),
  floor_style: z.string().max(60).optional(),
}).passthrough();

export const PlaceRoomObjectSchema = z.object({
  item_id: z.string().trim().min(1, 'item_id is required').max(120),
  position_x: z.number().finite().min(0).max(1000).optional(),
  position_y: z.number().finite().min(0).max(1000).optional(),
  layer: z.enum(['floor', 'wall', 'desk', 'shelf']).optional(),
  rotation: z.number().finite().min(-360).max(360).optional(),
});

export const AchievementWallSchema = z.object({
  achievement_id: z.string().trim().min(1, 'achievement_id is required').max(120),
  display: z.boolean().optional(),
  slot_index: z.number().int().min(1).max(4).optional(),
});

export const LabActionSchema = z.object({
  actionName: z.string().trim().min(1).max(100).optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
  observationNotes: z.string().max(1500).optional(),
});

export const LabCompleteSchema = z.object({
  parametersUsed: z.record(z.string(), z.unknown()).optional(),
  outcomeData: z.record(z.string(), z.unknown()).optional(),
  score: z.number().finite().min(0).max(100).optional(),
  observationNotes: z.string().max(1500).optional(),
});

export const ActivityActionSchema = z.object({
  action: z.enum(['started', 'completed', 'hint_used']).optional(),
  responseData: z.unknown().optional(),
  score: z.number().finite().min(0).max(100).optional(),
});

export const PathAdvanceSchema = z.object({
  stepOrder: z.number().int().min(1).max(100).optional(),
});

export const MasteryUpdateSchema = z.object({
  studentId: optionalShortStr(120),
  conceptId: z.string().trim().min(1, 'conceptId is required.').max(120),
  isCorrect: z.boolean(),
  conceptName: optionalShortStr(200),
  subject: optionalShortStr(100),
  teachingMethod: optionalShortStr(60),
});

export const MisconceptionLogSchema = z.object({
  studentId: optionalShortStr(120),
  subject: z.string().trim().min(1, 'subject is required.').max(100),
  misconceptionTitle: z.string().trim().min(1, 'misconceptionTitle is required.').max(250),
  topic: optionalShortStr(120),
  misconceptionCode: optionalShortStr(60),
  errorTaxonomy: z
    .enum(['conceptual_flaw', 'calculation_slip', 'careless_oversight', 'missing_prerequisite', 'language_comprehension'])
    .optional(),
  contextDetails: z.string().max(1500).optional(),
  suggestedIntervention: z.string().max(1500).optional(),
});

export const ResearchExperimentCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(200),
  hypothesis: z.string().trim().min(1, 'Hypothesis is required.').max(1500),
  description: z.string().max(2000).optional(),
  targetMetrics: z.array(z.string().max(80)).max(15).optional(),
  startDate: optionalShortStr(40),
  endDate: optionalShortStr(40),
});

export const ResearchJoinSchema = z.object({
  groupName: optionalShortStr(80),
});

export const AiOsChatSchema = z.object({
  studentId: optionalShortStr(120),
  agentKey: z
    .enum(['education_advisor', 'career_intelligence', 'learning_coach', 'research_agent', 'parent_assistant', 'teacher_assistant'])
    .optional(),
  message: z.string().trim().min(1, 'Message is required').max(4000),
});

export const AiOsToggleMilestoneSchema = z.object({
  studentId: optionalShortStr(120),
  planId: z.string().trim().min(1, 'planId is required').max(160),
  milestoneId: z.string().trim().min(1, 'milestoneId is required').max(160),
});

export const AiOsSafetyTestSchema = z.object({
  studentId: optionalShortStr(120),
  agentKey: z
    .enum(['education_advisor', 'career_intelligence', 'learning_coach', 'research_agent', 'parent_assistant', 'teacher_assistant'])
    .optional(),
  prompt: z.string().trim().min(1, 'prompt is required').max(4000),
});

export const GameTelemetrySchema = z.object({
  gameKey: optionalShortStr(100),
  eventType: optionalShortStr(100),
  trialCount: z.number().int().min(1).max(10000).optional(),
  bktInferredSkill: optionalShortStr(120),
  priorProbability: z.number().finite().min(0).max(1).optional(),
  posteriorProbability: z.number().finite().min(0).max(1).optional(),
  gameStatePayload: z.record(z.string(), z.unknown()).optional(),
});
