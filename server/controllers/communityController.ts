import { Router, Request, Response } from 'express';
import { communityRepository } from '../repositories/communityRepository';
import { safetyModerationService } from '../services/safetyModerationService';
import { AnalyticsRepository } from '../repositories/analyticsRepository';

const router = Router();
const analyticsRepo = new AnalyticsRepository();

// ==========================================
// 1. COMMUNITIES
// ==========================================

router.get('/communities', (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const communities = communityRepository.getAllCommunities(category);
    res.json({ success: true, data: communities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.get('/communities/:slug', (req: Request, res: Response) => {
  try {
    const community = communityRepository.getCommunityBySlug(req.params.slug) as Record<string, unknown>;
    if (!community) {
      return res.status(404).json({ success: false, error: 'Community not found' });
    }
    const members = communityRepository.getCommunityMembers((community as any).id);
    res.json({ success: true, data: { ...community, members } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.get('/student/:studentId/communities', (req: Request, res: Response) => {
  try {
    const joined = communityRepository.getStudentJoinedCommunities(req.params.studentId);
    res.json({ success: true, data: joined });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.post('/communities/:id/join', (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;
    const result = communityRepository.joinCommunity(req.params.id, userId || 'usr-student-01', role);
    
    analyticsRepo.logActivityEvent({
      user_id: userId || 'usr-student-01',
      event_type: 'COMMUNITY_JOIN',
      metadata: { communityId: req.params.id }
    });

    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.post('/communities/:id/leave', (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const result = communityRepository.leaveCommunity(req.params.id, userId || 'usr-student-01');
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

// ==========================================
// 2. POSTS & DISCUSSIONS
// ==========================================

router.get('/posts', (req: Request, res: Response) => {
  try {
    const communityId = req.query.communityId as string | undefined;
    const postType = req.query.postType as string | undefined;
    const posts = communityRepository.getCommunityPosts(communityId, postType);
    res.json({ success: true, data: posts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.post('/posts', (req: Request, res: Response) => {
  try {
    const { community_id, author_id, author_name, author_role, author_avatar, post_type, title, content, tags } = req.body;

    // Safety & Content Filtering Check (Task 7)
    const filterResult = safetyModerationService.evaluateContent(content, author_id);
    if (filterResult.action === 'blocked') {
      return res.status(400).json({
        success: false,
        error: filterResult.warningNotice || 'Content violates CDES safety and academic policy.',
        blocked: true
      });
    }

    const post = communityRepository.createPost({
      community_id,
      author_id: author_id || 'usr-student-01',
      author_name: author_name || 'Student',
      author_role: author_role || 'student',
      author_avatar,
      post_type,
      title,
      content: filterResult.sanitizedContent,
      tags
    });

    analyticsRepo.logActivityEvent({
      user_id: author_id || 'usr-student-01',
      event_type: 'COMMUNITY_POST_CREATE',
      metadata: { postId: (post as any)?.id, communityId: community_id, postType: post_type }
    });

    res.json({
      success: true,
      data: post,
      notice: filterResult.warningNotice
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.post('/posts/:id/upvote', (req: Request, res: Response) => {
  try {
    const result = communityRepository.upvotePost(req.params.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

// ==========================================
// 3. COMMENTS
// ==========================================

router.get('/posts/:id/comments', (req: Request, res: Response) => {
  try {
    const comments = communityRepository.getPostComments(req.params.id);
    res.json({ success: true, data: comments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.post('/posts/:id/comments', (req: Request, res: Response) => {
  try {
    const { author_id, author_name, author_role, author_avatar, parent_comment_id, content } = req.body;

    // Safety check
    const filterResult = safetyModerationService.evaluateContent(content, author_id);
    if (filterResult.action === 'blocked') {
      return res.status(400).json({
        success: false,
        error: filterResult.warningNotice || 'Comment violates CDES safety guidelines.',
        blocked: true
      });
    }

    const comment = communityRepository.createComment({
      post_id: req.params.id,
      author_id: author_id || 'usr-student-01',
      author_name: author_name || 'Student',
      author_role: author_role || 'student',
      author_avatar,
      parent_comment_id,
      content: filterResult.sanitizedContent
    });

    analyticsRepo.logActivityEvent({
      user_id: author_id || 'usr-student-01',
      event_type: 'COMMUNITY_COMMENT_ADD',
      metadata: { postId: req.params.id, commentId: (comment as any)?.id }
    });

    res.json({
      success: true,
      data: comment,
      notice: filterResult.warningNotice
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.post('/comments/:id/upvote', (req: Request, res: Response) => {
  try {
    const result = communityRepository.upvoteComment(req.params.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.post('/posts/:postId/accept-answer/:commentId', (req: Request, res: Response) => {
  try {
    const result = communityRepository.markAcceptedAnswer(req.params.postId, req.params.commentId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

// ==========================================
// 4. MENTOR NETWORK
// ==========================================

router.get('/mentors', (req: Request, res: Response) => {
  try {
    const badge = req.query.badge as string | undefined;
    const mentors = communityRepository.getAllMentors(badge);
    res.json({ success: true, data: mentors });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.get('/mentors/:id', (req: Request, res: Response) => {
  try {
    const mentor = communityRepository.getMentorById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ success: false, error: 'Mentor not found' });
    }
    res.json({ success: true, data: mentor });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.post('/mentors/book', (req: Request, res: Response) => {
  try {
    const { mentor_id, student_id, student_name, topic, session_type, scheduled_date, scheduled_time, student_notes } = req.body;
    
    const session = communityRepository.bookMentorshipSession({
      mentor_id,
      student_id: student_id || 'usr-student-01',
      student_name: student_name || 'Dara Chan',
      topic,
      session_type,
      scheduled_date,
      scheduled_time,
      student_notes
    });

    analyticsRepo.logActivityEvent({
      user_id: student_id || 'usr-student-01',
      event_type: 'MENTOR_SESSION_BOOK',
      metadata: { mentorId: mentor_id, topic, sessionType: session_type }
    });

    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.get('/students/:studentId/sessions', (req: Request, res: Response) => {
  try {
    const sessions = communityRepository.getStudentSessions(req.params.studentId);
    res.json({ success: true, data: sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

// ==========================================
// 5. STUDENT PROJECTS
// ==========================================

router.get('/projects', (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const stage = req.query.stage as string | undefined;
    const projects = communityRepository.getAllProjects(category, stage);
    res.json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.get('/projects/:slug', (req: Request, res: Response) => {
  try {
    const project = communityRepository.getProjectBySlug(req.params.slug) as Record<string, unknown>;
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const members = communityRepository.getProjectMembers((project as any).id);
    const milestones = communityRepository.getProjectMilestones((project as any).id);
    res.json({ success: true, data: { ...project, members, milestones } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.post('/projects/:id/join', (req: Request, res: Response) => {
  try {
    const { user_id, user_name, user_avatar, role_in_project } = req.body;
    const result = communityRepository.joinProject(req.params.id, {
      user_id: user_id || 'usr-student-01',
      user_name: user_name || 'Dara Chan',
      user_avatar,
      role_in_project: role_in_project || 'Collaborator'
    });

    analyticsRepo.logActivityEvent({
      user_id: user_id || 'usr-student-01',
      event_type: 'PROJECT_JOIN_REQUEST',
      metadata: { projectId: req.params.id, role: role_in_project }
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.post('/projects/:id/upvote', (req: Request, res: Response) => {
  try {
    const result = communityRepository.upvoteProject(req.params.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

// ==========================================
// 6. CAMPUS EVENTS
// ==========================================

router.get('/events', (req: Request, res: Response) => {
  try {
    const eventType = req.query.eventType as string | undefined;
    const status = req.query.status as string | undefined;
    const events = communityRepository.getAllEvents(eventType, status);
    res.json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.post('/events/:id/rsvp', (req: Request, res: Response) => {
  try {
    const { user_id, user_name, user_email } = req.body;
    const result = communityRepository.rsvpEvent(req.params.id, {
      user_id: user_id || 'usr-student-01',
      user_name: user_name || 'Dara Chan',
      user_email: user_email || 'dara.chan@student.cdes.edu.kh'
    });

    analyticsRepo.logActivityEvent({
      user_id: user_id || 'usr-student-01',
      event_type: 'CAMPUS_EVENT_RSVP',
      metadata: { eventId: req.params.id }
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.get('/students/:studentId/event-registrations', (req: Request, res: Response) => {
  try {
    const registrations = communityRepository.getStudentEventRegistrations(req.params.studentId);
    res.json({ success: true, data: registrations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

// ==========================================
// 7. PARTNER ORGANIZATIONS
// ==========================================

router.get('/organizations', (req: Request, res: Response) => {
  try {
    const orgType = req.query.orgType as string | undefined;
    const orgs = communityRepository.getAllOrganizations(orgType);
    res.json({ success: true, data: orgs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

// ==========================================
// 8. AI COMMUNITY INTELLIGENCE (TASK 6)
// ==========================================

router.get('/ai-recommendations', (req: Request, res: Response) => {
  try {
    const studentId = (req.query.studentId as string) || 'usr-student-01';
    const recommendedCommunities = communityRepository.getCommunityRecommendationsForStudent(studentId);
    const recommendedMentors = communityRepository.getMentorRecommendationsForStudent(studentId);

    res.json({
      success: true,
      data: {
        communities: recommendedCommunities,
        mentors: recommendedMentors
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

// ==========================================
// 9. SAFETY & MODERATION (TASK 7)
// ==========================================

router.post('/moderation/report', (req: Request, res: Response) => {
  try {
    const { reporter_id, reported_item_type, reported_item_id, reason, description } = req.body;
    const report = safetyModerationService.submitReport({
      reporter_id: reporter_id || 'usr-student-01',
      reported_item_type,
      reported_item_id,
      reason,
      description
    });

    analyticsRepo.logActivityEvent({
      user_id: reporter_id || 'usr-student-01',
      event_type: 'CONTENT_MODERATION_REPORT',
      metadata: { itemType: reported_item_type, reason }
    });

    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

router.get('/moderation/reports', (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const reports = safetyModerationService.getReports(status);
    res.json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

export default router;
