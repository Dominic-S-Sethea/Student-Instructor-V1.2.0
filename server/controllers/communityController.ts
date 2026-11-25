import { Router, Request, Response } from 'express';
import { communityRepository } from '../repositories/communityRepository';
import { safetyModerationService } from '../services/safetyModerationService';
import { AnalyticsRepository } from '../repositories/analyticsRepository';
import { PrivacyService } from '../services/privacyService';
import {
  authenticateToken,
  requireRole,
  resolveAuthorizedStudentId,
  AuthenticatedRequest,
} from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { HttpError, safeErrorMessage } from '../utils/httpErrors';

const router = Router();
const analyticsRepo = new AnalyticsRepository();
const privacyService = new PrivacyService();
const communityWriteLimiter = rateLimiter(60000, 30, 'Too many community submissions. Please slow down.');

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
      res.status(err.status).json({ success: false, error: safeErrorMessage(err, 'Request failed', err.status) });
      return;
    }
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('FOREIGN KEY constraint failed')) {
      res.status(404).json({ success: false, error: 'Referenced community entity not found.' });
      return;
    }
    res.status(500).json({ success: false, error: safeErrorMessage(err, 'Unexpected server error', 500) });
  }
}

// 1. COMMUNITIES
router.get('/communities', (req: Request, res: Response) =>
  handle(res, () => res.json({ success: true, data: communityRepository.getAllCommunities(req.query.category as string | undefined) }))
);

router.get('/communities/:slug', (req: Request, res: Response) =>
  handle(res, () => {
    const community = communityRepository.getCommunityBySlug(req.params.slug) as Record<string, unknown> | undefined;
    if (!community) return res.status(404).json({ success: false, error: 'Community not found' });
    const members = communityRepository.getCommunityMembers(String(community.id));
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
    const role = typeof req.body?.role === 'string' ? req.body.role : undefined;
    const result = communityRepository.joinCommunity(req.params.id, actingUserId, role);
    logConsentedActivity(actingUserId, 'COMMUNITY_JOIN', { communityId: req.params.id });
    return res.json({ success: true, result });
  })
);

router.post('/communities/:id/leave', authenticateToken, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => res.json({ success: true, result: communityRepository.leaveCommunity(req.params.id, req.user!.userId) }))
);

// 2. POSTS & DISCUSSIONS
router.get('/posts', (req: Request, res: Response) =>
  handle(res, () =>
    res.json({
      success: true,
      data: communityRepository.getCommunityPosts(req.query.communityId as string | undefined, req.query.postType as string | undefined),
    })
  )
);

router.post('/posts', authenticateToken, communityWriteLimiter, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const actingUserId = req.user!.userId;
    const body = (req.body || {}) as Record<string, unknown>;
    const communityId = typeof body.community_id === 'string' ? body.community_id.trim() : '';
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const content = typeof body.content === 'string' ? body.content : '';
    if (!communityId || !title || !content.trim()) {
      return res.status(400).json({ success: false, error: 'community_id, title, and content are required.' });
    }
    if (!communityRepository.getCommunityById(communityId)) {
      return res.status(404).json({ success: false, error: 'Community not found.' });
    }
    const filterResult = safetyModerationService.evaluateContent(content, actingUserId);
    if (filterResult.action === 'blocked') {
      return res.status(400).json({
        success: false,
        error: filterResult.warningNotice || 'Content violates CDES safety and academic policy.',
        blocked: true,
      });
    }
    const post = communityRepository.createPost({
      community_id: communityId,
      author_id: actingUserId,
      author_name: typeof body.author_name === 'string' ? body.author_name : req.user!.email.split('@')[0],
      author_role: req.user!.role,
      author_avatar: typeof body.author_avatar === 'string' ? body.author_avatar : undefined,
      post_type: typeof body.post_type === 'string' ? body.post_type : 'discussion',
      title,
      content: filterResult.sanitizedContent,
      tags: Array.isArray(body.tags) ? (body.tags as string[]) : undefined,
    }) as Record<string, unknown> | undefined;
    logConsentedActivity(actingUserId, 'COMMUNITY_POST_CREATE', {
      postId: post?.id,
      communityId,
      postType: body.post_type,
    });
    return res.json({ success: true, data: post, notice: filterResult.warningNotice });
  })
);

router.post('/posts/:id/upvote', authenticateToken, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => res.json({ success: true, data: communityRepository.upvotePost(req.params.id) }))
);

// 3. COMMENTS
router.get('/posts/:id/comments', (req: Request, res: Response) =>
  handle(res, () => res.json({ success: true, data: communityRepository.getPostComments(req.params.id) }))
);

router.post('/posts/:id/comments', authenticateToken, communityWriteLimiter, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const actingUserId = req.user!.userId;
    const body = (req.body || {}) as Record<string, unknown>;
    const content = typeof body.content === 'string' ? body.content : '';
    if (!content.trim()) {
      return res.status(400).json({ success: false, error: 'content is required.' });
    }
    if (!communityRepository.getPostById(req.params.id)) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }
    const filterResult = safetyModerationService.evaluateContent(content, actingUserId);
    if (filterResult.action === 'blocked') {
      return res.status(400).json({
        success: false,
        error: filterResult.warningNotice || 'Comment violates CDES safety guidelines.',
        blocked: true,
      });
    }
    const comment = communityRepository.createComment({
      post_id: req.params.id,
      author_id: actingUserId,
      author_name: typeof body.author_name === 'string' ? body.author_name : req.user!.email.split('@')[0],
      author_role: req.user!.role,
      author_avatar: typeof body.author_avatar === 'string' ? body.author_avatar : undefined,
      parent_comment_id: typeof body.parent_comment_id === 'string' ? body.parent_comment_id : undefined,
      content: filterResult.sanitizedContent,
    }) as Record<string, unknown> | undefined;
    logConsentedActivity(actingUserId, 'COMMUNITY_COMMENT_ADD', { postId: req.params.id, commentId: comment?.id });
    return res.json({ success: true, data: comment, notice: filterResult.warningNotice });
  })
);

router.post('/comments/:id/upvote', authenticateToken, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => res.json({ success: true, data: communityRepository.upvoteComment(req.params.id) }))
);

router.post('/posts/:postId/accept-answer/:commentId', authenticateToken, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const post = communityRepository.getPostById(req.params.postId) as { author_id?: string } | undefined;
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }
    if (req.user!.role !== 'admin' && post.author_id !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: only the post author or an admin can accept an answer.',
      });
    }
    return res.json({
      success: true,
      data: communityRepository.markAcceptedAnswer(req.params.postId, req.params.commentId),
    });
  })
);

// 4. MENTOR NETWORK
router.get('/mentors', (req: Request, res: Response) =>
  handle(res, () => res.json({ success: true, data: communityRepository.getAllMentors(req.query.badge as string | undefined) }))
);

router.get('/mentors/:id', (req: Request, res: Response) =>
  handle(res, () => {
    const mentor = communityRepository.getMentorById(req.params.id);
    if (!mentor) return res.status(404).json({ success: false, error: 'Mentor not found' });
    return res.json({ success: true, data: mentor });
  })
);

router.post('/mentors/book', authenticateToken, communityWriteLimiter, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const actingUserId = req.user!.userId;
    const body = (req.body || {}) as Record<string, unknown>;
    const mentorId = typeof body.mentor_id === 'string' ? body.mentor_id.trim() : '';
    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
    const scheduledDate = typeof body.scheduled_date === 'string' ? body.scheduled_date.trim() : '';
    const scheduledTime = typeof body.scheduled_time === 'string' ? body.scheduled_time.trim() : '';
    if (!mentorId || !topic || !scheduledDate || !scheduledTime) {
      return res.status(400).json({
        success: false,
        error: 'mentor_id, topic, scheduled_date, and scheduled_time are required.',
      });
    }
    if (!communityRepository.getMentorById(mentorId)) {
      return res.status(404).json({ success: false, error: 'Mentor not found.' });
    }
    const session = communityRepository.bookMentorshipSession({
      mentor_id: mentorId,
      student_id: actingUserId,
      student_name: typeof body.student_name === 'string' ? body.student_name : req.user!.email.split('@')[0],
      topic,
      session_type: typeof body.session_type === 'string' ? body.session_type : 'guidance',
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      student_notes: typeof body.student_notes === 'string' ? body.student_notes : undefined,
    });
    logConsentedActivity(actingUserId, 'MENTOR_SESSION_BOOK', {
      mentorId,
      topic,
      sessionType: body.session_type,
    });
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
      data: communityRepository.getAllProjects(req.query.category as string | undefined, req.query.stage as string | undefined),
    })
  )
);

router.get('/projects/:slug', (req: Request, res: Response) =>
  handle(res, () => {
    const project = communityRepository.getProjectBySlug(req.params.slug) as Record<string, unknown> | undefined;
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    const members = communityRepository.getProjectMembers(String(project.id));
    const milestones = communityRepository.getProjectMilestones(String(project.id));
    return res.json({ success: true, data: { ...project, members, milestones } });
  })
);

router.post('/projects/:id/join', authenticateToken, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    if (!communityRepository.getProjectById(req.params.id)) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    const actingUserId = req.user!.userId;
    const body = (req.body || {}) as Record<string, unknown>;
    const result = communityRepository.joinProject(req.params.id, {
      user_id: actingUserId,
      user_name: typeof body.user_name === 'string' ? body.user_name : req.user!.email.split('@')[0],
      user_avatar: typeof body.user_avatar === 'string' ? body.user_avatar : undefined,
      role_in_project: typeof body.role_in_project === 'string' ? body.role_in_project : 'Collaborator',
    });
    logConsentedActivity(actingUserId, 'PROJECT_JOIN_REQUEST', { projectId: req.params.id, role: body.role_in_project });
    return res.json({ success: true, data: result });
  })
);

router.post('/projects/:id/upvote', authenticateToken, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => res.json({ success: true, data: communityRepository.upvoteProject(req.params.id) }))
);

// 6. CAMPUS EVENTS
router.get('/events', (req: Request, res: Response) =>
  handle(res, () =>
    res.json({
      success: true,
      data: communityRepository.getAllEvents(req.query.eventType as string | undefined, req.query.status as string | undefined),
    })
  )
);

router.post('/events/:id/rsvp', authenticateToken, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const actingUserId = req.user!.userId;
    const body = (req.body || {}) as Record<string, unknown>;
    const result = communityRepository.rsvpEvent(req.params.id, {
      user_id: actingUserId,
      user_name: typeof body.user_name === 'string' ? body.user_name : req.user!.email.split('@')[0],
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
  handle(res, () => res.json({ success: true, data: communityRepository.getAllOrganizations(req.query.orgType as string | undefined) }))
);

router.get('/ai-recommendations', authenticateToken, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const studentId = resolveAuthorizedStudentId(
      req,
      res,
      typeof req.query.studentId === 'string' ? req.query.studentId : undefined
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
router.post('/moderation/report', authenticateToken, communityWriteLimiter, (req: AuthenticatedRequest, res: Response) =>
  handle(res, () => {
    const actingUserId = req.user!.userId;
    const body = (req.body || {}) as Record<string, unknown>;
    const reportedItemId = typeof body.reported_item_id === 'string' ? body.reported_item_id.trim() : '';
    if (!reportedItemId) {
      return res.status(400).json({ success: false, error: 'reported_item_id is required.' });
    }
    const itemType =
      body.reported_item_type === 'mentor' ||
      body.reported_item_type === 'project' ||
      body.reported_item_type === 'comment' ||
      body.reported_item_type === 'message'
        ? body.reported_item_type
        : 'post';
    const reportReason =
      body.reason === 'harassment' ||
      body.reason === 'spam' ||
      body.reason === 'unsafe_contact_request' ||
      body.reason === 'false_information'
        ? body.reason
        : 'inappropriate_content';
    const report = safetyModerationService.submitReport({
      reporter_id: actingUserId,
      reported_item_type: itemType,
      reported_item_id: reportedItemId,
      reason: reportReason,
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
  handle(res, () => res.json({ success: true, data: safetyModerationService.getReports(req.query.status as string | undefined) }))
);

export default router;
