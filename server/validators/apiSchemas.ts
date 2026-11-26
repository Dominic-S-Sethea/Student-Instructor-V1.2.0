import { z } from 'zod';

// ============================================================================
// Authentication Schemas
// ============================================================================

const passwordByteLimit = (val: string) => Buffer.byteLength(val, 'utf8') <= 72;

export const RegisterSchema = z.object({
  email: z.string().trim().email('Invalid email format').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(72, 'Password must be at most 72 characters.')
    .refine(passwordByteLimit, 'Password must not exceed 72 UTF-8 bytes.'),
  role: z.enum(['student', 'organization'], {
    message: 'Role must be either "student" or "organization".',
  }),
  name: z.string().max(255).nullish(),
  education_level: z.string().max(100).nullish(),
  organization_name: z.string().max(255).nullish(),
});

export const LoginSchema = z.object({
  email: z.string().trim().email('Invalid email format').max(255),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(72, 'Password must be at most 72 characters.')
    .refine(passwordByteLimit, 'Password must not exceed 72 UTF-8 bytes.'),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(72),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long.')
    .max(72, 'Password must be at most 72 characters.')
    .refine(passwordByteLimit, 'Password must not exceed 72 UTF-8 bytes.'),
});

// ============================================================================
// Study Advisor & Learning Science Schemas
// ============================================================================

export const AdvisorChatSchema = z.object({
  userPrompt: z.string().max(4000).optional(),
  messages: z
    .array(
      z.object({
        sender: z.string().max(40),
        text: z.string().max(4000),
      })
    )
    .max(30)
    .optional(),
  studentProfile: z
    .object({
      name: z.string().max(200).optional(),
      educationLevel: z.string().max(100).optional(),
      favoriteSubjects: z.array(z.string().max(100)).max(20).optional(),
      targetMajor: z.string().max(200).optional(),
    })
    .optional(),
});

export const RetentionForecastSchema = z.object({
  daysElapsed: z.number().finite().min(0).max(3650).default(7),
  reviewCount: z.number().int().min(1).max(100).default(1),
});

// ============================================================================
// Avatar & Digital World Schemas
// ============================================================================

export const AvatarObjectPositionSchema = z.object({
  position_x: z.number().finite().min(0).max(1000),
  position_y: z.number().finite().min(0).max(1000),
});

export const DigitalWorldChatSchema = z.object({
  message: z.string().trim().min(1, 'Message string is required').max(2000),
});

// ============================================================================
// Knowledge Supply Chain Schemas
// ============================================================================

export const KnowledgeContentCreateSchema = z.object({
  categoryId: z.string().min(1).max(100).optional(),
  authorId: z.string().min(1).max(100).optional(),
  sourceId: z.string().min(1).max(100).optional(),
  titleEn: z.string().trim().min(1, 'titleEn is required').max(300),
  titleKm: z.string().trim().min(1, 'titleKm is required').max(300),
  contentType: z
    .enum([
      'decision_guide',
      'interactive_stem_module',
      'cognitive_psychology',
      'career_pathway',
      'professional_competency',
    ])
    .optional(),
  summary: z.string().trim().min(1, 'summary is required').max(2000),
  bodyMarkdown: z.string().trim().min(1, 'bodyMarkdown is required').max(25000),
  language: z.enum(['km', 'en', 'bilingual']).default('bilingual'),
  targetGrades: z.array(z.string().max(50)).max(15).default(['grade_12']),
  learningObjectives: z
    .array(
      z.object({
        code: z.string().max(100),
        bloomLevel: z.enum(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']),
        description: z.string().max(1000),
        bktSkillId: z.string().max(100).optional(),
      })
    )
    .max(20)
    .default([]),
});

export const KnowledgeVerifySchema = z.object({
  contentId: z.string().trim().min(1, 'contentId is required').max(120),
  reviewerId: z.string().max(120).optional(),
  reviewerRole: z.string().max(120).optional(),
  decision: z.enum(['approved', 'revision_requested', 'rejected']),
  pedagogicalScore: z.number().finite().min(0).max(100).default(95),
  factualAccuracyScore: z.number().finite().min(0).max(100).default(98),
  safetyComplianceScore: z.number().finite().min(0).max(100).default(100),
  comments: z.string().max(2000).optional(),
});

export const KnowledgeRagSyncSchema = z.object({
  contentId: z.string().trim().min(1, 'contentId is required').max(120),
});

export const KnowledgeFeedbackSchema = z.object({
  contentId: z.string().trim().min(1, 'contentId is required').max(120),
  isHelpful: z.boolean(),
  rating: z.number().finite().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

// ============================================================================
// Platform Architecture & Mobile Operations Schemas
// ============================================================================

export const PlatformDeviceSchema = z.object({
  deviceId: z.string().trim().min(1, 'Missing deviceId').max(150),
  userId: z.string().max(150).optional(),
  role: z.enum(['student', 'parent', 'teacher', 'mentor', 'organization']).optional(),
  platform: z.enum(['ios', 'android', 'web_pwa']),
  osVersion: z.string().max(60).optional(),
  appVersion: z.string().max(60).optional(),
  deviceModel: z.string().max(120).optional(),
  pushToken: z.string().max(500).optional(),
  locale: z.enum(['km-KH', 'en-US']).optional(),
});

export const PlatformSyncSchema = z.object({
  deviceId: z.string().max(150).optional(),
  mutations: z
    .array(
      z
        .object({
          id: z.string().max(150).optional(),
          action: z.string().min(1).max(200),
        })
        .passthrough()
    )
    .max(200),
});

export const SafetyScanSchema = z.object({
  text: z.string().trim().min(1, 'text is required').max(4000),
  senderAge: z.number().finite().min(1).max(120).optional(),
  recipientAge: z.number().finite().min(1).max(120).optional(),
  channelType: z.string().max(100).optional(),
});

export const NotificationDispatchSchema = z.object({
  type: z.string().max(100).optional(),
  title: z.string().trim().min(1, 'title is required').max(200),
  message: z.string().trim().min(1, 'message is required').max(2000),
  targetRole: z.string().max(50).optional(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// User Profile, Education, and Legacy AI Input Bounds
// ============================================================================

export function isValidPlausibleBirthDate(dob: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
  const [yStr, mStr, dStr] = dob.split('-');
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(dt.getTime()) ||
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() + 1 !== month ||
    dt.getUTCDate() !== day
  ) {
    return false;
  }
  const todayUtc = new Date();
  const minYear = 1920;
  return year >= minYear && dt.getTime() <= todayUtc.getTime();
}

export const UserProfileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date_of_birth must be YYYY-MM-DD')
    .refine(isValidPlausibleBirthDate, 'date_of_birth must be a real calendar date between 1920-01-01 and today')
    .nullable()
    .optional(),
  education_level: z.string().trim().max(100).optional(),
  school: z.string().trim().max(200).nullable().optional(),
  university: z.string().trim().max(200).nullable().optional(),
  major: z.string().trim().max(200).nullable().optional(),
  graduation_year: z.number().int().min(1980).max(2045).nullable().optional(),
  language: z.enum(['en', 'km']).optional(),
  location: z.string().trim().max(150).nullable().optional(),
  target_career: z.string().trim().max(200).nullable().optional(),
  interests: z.union([z.array(z.string().max(80)).max(25), z.string().max(1000)]).optional(),
  favorite_subjects: z.union([z.array(z.string().max(80)).max(25), z.string().max(1000)]).optional(),
  goals: z.string().max(1500).nullable().optional(),
});

export const UserEducationCreateSchema = z.object({
  institution: z.string().trim().min(1, 'Institution is required.').max(200),
  degree: z.string().trim().min(1, 'Degree is required.').max(200),
  start_date: z.string().trim().max(40).nullish(),
  end_date: z.string().trim().max(40).nullish(),
  achievements: z.string().trim().max(1000).nullish(),
});

export const LegacyAiChatSchema = z.object({
  studentId: z.string().max(120).optional(),
  prompt: z.string().trim().min(1).max(4000).optional(),
  message: z.string().trim().min(1).max(4000).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
});

export const LegacyKnowledgeSearchSchema = z.object({
  query: z.string().trim().min(1, 'query is required').max(500),
  category: z.string().max(100).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

export const ScholarshipExtractSchema = z.object({
  rawText: z.string().trim().min(20, 'Please provide raw scholarship text (minimum 20 characters).').max(30000),
  sourceUrl: z.string().trim().max(1000).optional(),
});

export const UserSettingsUpdateSchema = z
  .object({
    themeMode: z.enum(['light', 'dark', 'system']).optional(),
    accentColor: z.enum(['blue', 'emerald', 'teal', 'amber', 'slate']).optional(),
    highContrast: z.boolean().optional(),
    reducedMotion: z.boolean().optional(),
    layoutWidth: z.enum(['standard', 'wide', 'full']).optional(),
    sidebarDefaultCollapsed: z.boolean().optional(),
    cardDensity: z.enum(['comfortable', 'compact']).optional(),
    fontFamily: z.enum(['jakarta', 'inter', 'serif', 'system', 'mono']).optional(),
    fontScale: z.enum(['sm', 'md', 'lg', 'xl']).optional(),
    lineSpacing: z.enum(['normal', 'relaxed']).optional(),
    language: z.enum(['en', 'km']).optional(),
    defaultScholarshipsTab: z.enum(['flagship', 'top_universities']).optional(),
    onlyVerifiedScholarshipsByDefault: z.boolean().optional(),
    deadlineReminderDays: z.union([z.literal(3), z.literal(7), z.literal(14)]).optional(),
    advisorResponseStyle: z.enum(['balanced', 'concise', 'bilingual']).optional(),
  })
  .strict();


