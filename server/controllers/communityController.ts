import { Router, Request, Response } from 'express';
import { communityRepository } from '../repositories/communityRepository';
import { safetyModerationService } from '../services/safetyModerationService';
import { AnalyticsRepository } from '../repositories/analyticsRepository';
import { PrivacyService } from '../services/privacyService';
import { authenticateToken, requireRole, resolveAuthorizedStudentId, AuthenticatedRequest } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validationMiddleware';
import {
  CommunityCommentCreateSchema, CommunityPostCreateSchema, EventRsvpSchema,
  MentorBookSchema, ModerationReportSchema, ProjectJoinSchema,
} from '../validators/domainSchemas';
import { HttpError, safeErrorMessage } from '../utils/httpErrors';
import { assertSafeOptionalHttpUrl } from '../utils/safeUrl';
import { parseOptionalQueryString } from '../utils/queryParams';
import {
  ALLOWED_POST_TYPES, ALLOWED_SESSION_TYPES, moderateCommunityPostInput,
  normalizeReportItemType, normalizeReportReason, sanitizeAuthorDisplayName,
  sanitizeCommunityTags, stripPublicUserIds,
} from '../services/communityModerationHelper';

const router = Router();
const analyticsRepo = new AnalyticsRepository();
const privacyService = new PrivacyService();
const communityWriteLimiter = rateLimiter(60000, 30, 'Too many community submissions. Please slow down.');
const upvoteLimiter = rateLimiter(60000, 30, 'Too many upvote requests. Please slow down.');

function logConsentedActivity(userId: string, eventType: string, metadata: Record<string, unknown>): void {
  if (privacyService.canCollectAnalytics(userId)) {
    analyticsRepo.logActivityEvent({ user_id: userId, event_type: eventType, metadata });
  }
}

function handle(res: Response, fn: () => unknown): void {
  try {
    fn();
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ success: false, ...(err.code ? { code: err.code } : {}), error: safeErrorMessage(err, 'Request failed', err.status) });
      return;
    }
    if (err instanceof Error && err.message.includes('FOREIGN KEY constraint failed')) {
      res.status(404).json({ success: false, error: 'Referenced community entity not found.' });
      return;
    }
    res.status(500).json({ success: false, error: safeErrorMessage(err, 'Unexpected server error', 500) });
  }
}

// 1. COMMUNITIES
router.get('/communities', (req: Request, res: Response) =>
  handle(res, () =>
    res.json({ success: true, data: communityRepository.getAllCommunities(parseOptionalQueryString(req.query.category, 'category', 60)) })
  )
);

router.get('/communities/:slug', (req: Request, res: Response) =>
  handle(res, () => {
    const community = communityRepository.getCommunityBySlug(req.params.slug) as Record<string, unknown> | undefined;
    if (!community) return res.status(404).json({ success: false, error: 'Community not found' });
    const rawMembers = communityRepository.getCommunityMembers(String(community.id)) as Array<Record<string, unknown>>;
    const members = rawMembers.map((m) => ({
      id: m.id,
      community_id: m.community_id,
      role: m.role,
      reputation_points: m.reputation_points,
      is_active: m.is_active,
      joined_at: m.joined_at,
    }));
    return res.json({ success: true, data: { ...community, members } });
  })
);

router.get('/student/:studentId/communities', authenticateToken, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const studentId = resolveAuthorizedStudentId(req, res, req.params.studentId);
    if (!studentId) return;
    res.json({ success: true, data: communityRepository.getStudentJoinedCommunities(studentId) });
  })
);

router.post('/communities/:id/join', authenticateToken, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    if (!communityRepository.getCommunityById(req.params.id)) {
      return res.status(404).json({ success: false, error: 'Community not found' });
    }
    const actingUserId = req.user!.userId;
    const result = communityRepository.joinCommunity(req.params.id, actingUserId, 'member');
    logConsentedActivity(actingUserId, 'COMMUNITY_JOIN', { communityId: req.params.id });
    return res.json({ success: true, result });
  })
);

router.post('/communities/:id/leave', authenticateToken, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => res.json({ success: true, result: communityRepository.leaveCommunity(req.params.id, req.user!.userId) }))
);

// 2. POSTS & DISCUSSIONS
router.get('/posts', (req: Request, res: Response) =>
  handle(res, () => {
    const rows = communityRepository.getCommunityPosts(
      parseOptionalQueryString(req.query.communityId, 'communityId', 120),
      parseOptionalQueryString(req.query.postType, 'postType', 40)
    ) as Array<Record<string, unknown>>;
    res.json({ success: true, data: rows.map(stripPublicUserIds) });
  })
);

router.post('/posts', authenticateToken, communityWriteLimiter, validate(CommunityPostCreateSchema, 'body'), (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const actingUserId = req.user!.userId;
    const body = req.body as Record<string, unknown>;
    const communityId = String(body.community_id);
    if (!communityRepository.getCommunityById(communityId)) {
      return res.status(404).json({ success: false, error: 'Community not found.' });
    }
    const safeAvatar = assertSafeOptionalHttpUrl(body.author_avatar, 'author_avatar');
    const moderated = moderateCommunityPostInput(
      actingUserId,
      String(body.title),
      String(body.content),
      sanitizeAuthorDisplayName(body.author_name, req.user!.email),
      sanitizeCommunityTags(body.tags)
    );
    if (moderated.blocked) {
      return res.status(400).json({ success: false, error: moderated.error, blocked: true });
    }
    const rawPostType = typeof body.post_type === 'string' ? body.post_type.trim() : 'discussion';
    const postType = ALLOWED_POST_TYPES.has(rawPostType) ? rawPostType : 'discussion';

    const post = communityRepository.createPost({
      community_id: communityId,
      author_id: actingUserId,
      author_name: moderated.authorName,
      author_role: req.user!.role,
      author_avatar: safeAvatar,
      post_type: postType,
      title: moderated.title,
      content: moderated.content,
      tags: moderated.tags,
    }) as Record<string, unknown> | undefined;
    logConsentedActivity(actingUserId, 'COMMUNITY_POST_CREATE', { postId: post?.id, communityId, postType });
    return res.json({ success: true, data: post ? stripPublicUserIds(post) : post, notice: moderated.notice });
  })
);

router.post('/posts/:id/upvote', authenticateToken, upvoteLimiter, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => res.json({ success: true, data: communityRepository.upvotePost(req.params.id, req.user!.userId) }))
);

// 3. COMMENTS
router.get('/posts/:id/comments', (req: Request, res: Response) =>
  handle(res, () => {
    const rows = communityRepository.getPostComments(req.params.id) as Array<Record<string, unknown>>;
    res.json({ success: true, data: rows.map(stripPublicUserIds) });
  })
);

router.post('/posts/:id/comments', authenticateToken, communityWriteLimiter, validate(CommunityCommentCreateSchema, 'body'), (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const actingUserId = req.user!.userId;
    const body = req.body as Record<string, unknown>;
    if (!communityRepository.getPostById(req.params.id)) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }
    const safeAvatar = assertSafeOptionalHttpUrl(body.author_avatar, 'author_avatar');
    const rawAuthorName = sanitizeAuthorDisplayName(body.author_name, req.user!.email);
    const filterResult = safetyModerationService.evaluateContent(String(body.content), actingUserId);
    const authorCheck = safetyModerationService.evaluateContent(rawAuthorName, actingUserId);
    if (filterResult.action === 'blocked' || authorCheck.action === 'blocked') {
      return res.status(400).json({
        success: false,
        error: filterResult.warningNotice || 'Comment violates CDES safety guidelines.',
        blocked: true,
      });
    }
    const comment = communityRepository.createComment({
      post_id: req.params.id,
      author_id: actingUserId,
      author_name: authorCheck.sanitizedContent,
      author_role: req.user!.role,
      author_avatar: safeAvatar,
      parent_comment_id: typeof body.parent_comment_id === 'string' ? body.parent_comment_id : undefined,
      content: filterResult.sanitizedContent,
    }) as Record<string, unknown> | undefined;
    logConsentedActivity(actingUserId, 'COMMUNITY_COMMENT_ADD', { postId: req.params.id, commentId: comment?.id });
    return res.json({ success: true, data: comment ? stripPublicUserIds(comment) : comment, notice: filterResult.warningNotice });
  })
);

router.post('/comments/:id/upvote', authenticateToken, upvoteLimiter, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => res.json({ success: true, data: communityRepository.upvoteComment(req.params.id, req.user!.userId) }))
);

router.post('/posts/:postId/accept-answer/:commentId', authenticateToken, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const post = communityRepository.getPostById(req.params.postId) as { author_id?: string } | undefined;
    if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });
    if (req.user!.role !== 'admin' && post.author_id !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Forbidden: only the post author or an admin can accept an answer.' });
    }
    const accepted = communityRepository.markAcceptedAnswer(req.params.postId, req.params.commentId);
    if (!accepted.success) return res.status(404).json({ success: false, error: 'Comment not found on this post.' });
    return res.json({ success: true, data: accepted });
  })
);

// 4. MENTOR NETWORK
router.get('/mentors', (req: Request, res: Response) =>
  handle(res, () => res.json({ success: true, data: communityRepository.getAllMentors(parseOptionalQueryString(req.query.badge, 'badge', 60)) }))
);

router.get('/mentors/:id', (req: Request, res: Response) =>
  handle(res, () => {
    const mentor = communityRepository.getMentorById(req.params.id);
    if (!mentor) return res.status(404).json({ success: false, error: 'Mentor not found' });
    return res.json({ success: true, data: mentor });
  })
);

router.post('/mentors/book', authenticateToken, communityWriteLimiter, validate(MentorBookSchema, 'body'), (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const actingUserId = req.user!.userId;
    const body = req.body as Record<string, unknown>;
    const mentorId = String(body.mentor_id);
    if (!communityRepository.getMentorById(mentorId)) {
      return res.status(404).json({ success: false, error: 'Mentor not found.' });
    }
    const rawSessionType = typeof body.session_type === 'string' ? body.session_type.trim() : 'academic_guidance';
    const sessionType = ALLOWED_SESSION_TYPES.has(rawSessionType) ? rawSessionType : 'academic_guidance';
    const session = communityRepository.bookMentorshipSession({
      mentor_id: mentorId,
      student_id: actingUserId,
      student_name: typeof body.student_name === 'string' && body.student_name ? body.student_name : req.user!.email.split('@')[0],
      topic: String(body.topic),
      session_type: sessionType,
      scheduled_date: String(body.scheduled_date),
      scheduled_time: String(body.scheduled_time),
      student_notes: typeof body.student_notes === 'string' ? body.student_notes : undefined,
    });
    logConsentedActivity(actingUserId, 'MENTOR_SESSION_BOOK', { mentorId, topic: body.topic, sessionType });
    return res.json({ success: true, data: session });
  })
);

router.get('/students/:studentId/sessions', authenticateToken, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const studentId = resolveAuthorizedStudentId(req, res, req.params.studentId);
    if (!studentId) return;
    res.json({ success: true, data: communityRepository.getStudentSessions(studentId) });
  })
);

// 5. STUDENT PROJECTS
router.get('/projects', (req: Request, res: Response) =>
  handle(res, () =>
    res.json({
      success: true,
      data: communityRepository.getAllProjects(
        parseOptionalQueryString(req.query.category, 'category', 60),
        parseOptionalQueryString(req.query.stage, 'stage', 60)
      ),
    })
  )
);

router.get('/projects/:slug', (req: Request, res: Response) =>
  handle(res, () => {
    const project = communityRepository.getProjectBySlug(req.params.slug) as Record<string, unknown> | undefined;
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    const rawMembers = communityRepository.getProjectMembers(String(project.id)) as Array<Record<string, unknown>>;
    const members = rawMembers.map(stripPublicUserIds);
    const milestones = communityRepository.getProjectMilestones(String(project.id));
    return res.json({ success: true, data: { ...project, members, milestones } });
  })
);

router.post('/projects/:id/join', authenticateToken, validate(ProjectJoinSchema, 'body'), (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const actingUserId = req.user!.userId;
    const body = req.body as Record<string, unknown>;
    const safeAvatar = assertSafeOptionalHttpUrl(body.user_avatar, 'user_avatar');
    const result = communityRepository.joinProject(req.params.id, {
      user_id: actingUserId,
      user_name: typeof body.user_name === 'string' && body.user_name ? body.user_name : req.user!.email.split('@')[0],
      user_avatar: safeAvatar,
      role_in_project: typeof body.role_in_project === 'string' && body.role_in_project ? body.role_in_project : 'Collaborator',
    });
    logConsentedActivity(actingUserId, 'PROJECT_JOIN_REQUEST', { projectId: req.params.id, role: body.role_in_project });
    return res.json({ success: true, data: result });
  })
);

router.post('/projects/:id/upvote', authenticateToken, upvoteLimiter, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => res.json({ success: true, data: communityRepository.upvoteProject(req.params.id, req.user!.userId) }))
);

// 6. CAMPUS EVENTS
router.get('/events', (req: Request, res: Response) =>
  handle(res, () =>
    res.json({
      success: true,
      data: communityRepository.getAllEvents(
        parseOptionalQueryString(req.query.eventType, 'eventType', 60),
        parseOptionalQueryString(req.query.status, 'status', 60)
      ),
    })
  )
);

router.post('/events/:id/rsvp', authenticateToken, validate(EventRsvpSchema, 'body'), (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const actingUserId = req.user!.userId;
    const body = req.body as Record<string, unknown>;
    const result = communityRepository.rsvpEvent(req.params.id, {
      user_id: actingUserId,
      user_name: typeof body.user_name === 'string' && body.user_name ? body.user_name : req.user!.email.split('@')[0],
      user_email: req.user!.email,
    });
    logConsentedActivity(actingUserId, 'CAMPUS_EVENT_RSVP', { eventId: req.params.id });
    res.json({ success: true, data: result });
  })
);

router.get('/students/:studentId/event-registrations', authenticateToken, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const studentId = resolveAuthorizedStudentId(req, res, req.params.studentId);
    if (!studentId) return;
    res.json({ success: true, data: communityRepository.getStudentEventRegistrations(studentId) });
  })
);

// 7. PARTNER ORGANIZATIONS & 8. AI COMMUNITY INTELLIGENCE
router.get('/organizations', (req: Request, res: Response) =>
  handle(res, () =>
    res.json({ success: true, data: communityRepository.getAllOrganizations(parseOptionalQueryString(req.query.orgType, 'orgType', 60)) })
  )
);

router.get('/ai-recommendations', authenticateToken, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const studentId = resolveAuthorizedStudentId(
      req,
      res,
      parseOptionalQueryString(req.query.studentId, 'studentId', 120)
    );
    if (!studentId) return;
    res.json({
      success: true,
      data: {
        communities: communityRepository.getCommunityRecommendationsForStudent(studentId),
        mentors: communityRepository.getMentorRecommendationsForStudent(studentId),
      },
    });
  })
);

// 9. SAFETY & MODERATION
router.post('/moderation/report', authenticateToken, communityWriteLimiter, validate(ModerationReportSchema, 'body'), (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const actingUserId = req.user!.userId;
    const body = req.body as Record<string, unknown>;
    const report = safetyModerationService.submitReport({
      reporter_id: actingUserId,
      reported_item_type: normalizeReportItemType(body.reported_item_type),
      reported_item_id: String(body.reported_item_id),
      reason: normalizeReportReason(body.reason),
      description: typeof body.description === 'string' ? body.description : '',
    });
    logConsentedActivity(actingUserId, 'CONTENT_MODERATION_REPORT', {
      itemType: body.reported_item_type,
      reason: body.reason,
    });
    return res.json({ success: true, data: report });
  })
);

router.get('/moderation/reports', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res: Response) =>
  handle(res, () =>
    res.json({ success: true, data: safetyModerationService.getReports(parseOptionalQueryString(req.query.status, 'status', 60)) })
  )
);

export default router;
