import { safetyModerationService } from './safetyModerationService';

export const ALLOWED_POST_TYPES = new Set([
  'discussion',
  'question',
  'resource',
  'showcase',
  'announcement',
]);

export const ALLOWED_SESSION_TYPES = new Set([
  'academic_guidance',
  'career_coaching',
  'scholarship_review',
  'project_mentoring',
  'mock_interview',
]);

export function sanitizeAuthorDisplayName(rawName: unknown, email: string): string {
  return typeof rawName === 'string' && rawName.trim()
    ? rawName.trim().slice(0, 80)
    : email.split('@')[0];
}

export function sanitizeCommunityTags(rawTags: unknown): string[] {
  if (!Array.isArray(rawTags)) return [];
  return rawTags
    .slice(0, 10)
    .map((t) => String(t).trim().slice(0, 40))
    .filter(Boolean);
}

export interface ModeratedPostFields {
  blocked: boolean;
  error?: string;
  notice?: string;
  title: string;
  content: string;
  authorName: string;
  tags: string[];
}

export function moderateCommunityPostInput(
  userId: string,
  title: string,
  content: string,
  rawAuthorName: string,
  rawTags: string[]
): ModeratedPostFields {
  const titleCheck = safetyModerationService.evaluateContent(title, userId);
  const contentCheck = safetyModerationService.evaluateContent(content, userId);
  const authorCheck = safetyModerationService.evaluateContent(rawAuthorName, userId);
  const tagsCheck =
    rawTags.length > 0 ? safetyModerationService.evaluateContent(rawTags.join(' '), userId) : null;

  if (
    titleCheck.action === 'blocked' ||
    contentCheck.action === 'blocked' ||
    authorCheck.action === 'blocked' ||
    tagsCheck?.action === 'blocked'
  ) {
    return {
      blocked: true,
      error:
        contentCheck.warningNotice ||
        titleCheck.warningNotice ||
        'Content violates CDES safety and academic policy.',
      title: '',
      content: '',
      authorName: '',
      tags: [],
    };
  }

  return {
    blocked: false,
    notice: contentCheck.warningNotice || titleCheck.warningNotice,
    title: titleCheck.sanitizedContent,
    content: contentCheck.sanitizedContent,
    authorName: authorCheck.sanitizedContent,
    tags: rawTags.map((t) => safetyModerationService.evaluateContent(t, userId).sanitizedContent),
  };
}

export function normalizeReportItemType(
  raw: unknown
): 'post' | 'mentor' | 'project' | 'comment' | 'message' {
  if (raw === 'mentor' || raw === 'project' || raw === 'comment' || raw === 'message') {
    return raw;
  }
  return 'post';
}

export function normalizeReportReason(
  raw: unknown
): 'harassment' | 'spam' | 'unsafe_contact_request' | 'false_information' | 'inappropriate_content' {
  if (
    raw === 'harassment' ||
    raw === 'spam' ||
    raw === 'unsafe_contact_request' ||
    raw === 'false_information'
  ) {
    return raw;
  }
  return 'inappropriate_content';
}

export function stripPublicUserIds<T extends Record<string, unknown>>(
  row: T
): Omit<T, 'author_id' | 'user_id'> {
  const { author_id: _a, user_id: _u, ...rest } = row;
  return rest;
}

