import { Router, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { authenticateToken, optionalAuth, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const analyticsService = new AnalyticsService();

/**
 * @route POST /api/analytics/track
 * @desc Universal Event Tracking: Tracks User, Education, AI, Game, and Virtual World events
 */
router.post('/track', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const {
      eventType,
      studentId,
      sessionId,
      duration,
      contentId,
      action,
      score,
      timeSpent,
      difficulty,
      gameId,
      level,
      attempt,
      success,
      failureReason,
      timeTaken,
      metadata
    } = req.body;

    if (!eventType) {
      res.status(400).json({ success: false, error: 'eventType is required.' });
      return;
    }

    const resolvedStudentId = studentId || req.user?.userId || 'usr-student-01';

    const ingested = analyticsService.trackEvent({
      studentId: resolvedStudentId,
      userId: req.user?.userId || resolvedStudentId,
      sessionId,
      eventType,
      duration,
      contentId,
      action,
      score,
      timeSpent,
      difficulty,
      gameId,
      level,
      attempt,
      success,
      failureReason,
      timeTaken,
      metadata
    });

    res.status(201).json({
      success: true,
      message: `Event '${eventType}' recorded and dispatched to analytics engine.`,
      data: ingested
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * @route GET /api/analytics/engagement
 * @desc Platform Engagement Analytics: Daily Active Users, Time Spent, Retention
 */
router.get('/engagement', (_req, res: Response): void => {
  try {
    const metrics = analyticsService.getPlatformEngagement(14);
    res.json({
      success: true,
      data: {
        dailyActiveUsers: metrics.dailyActiveUsers,
        totalTimeSpentMinutes: metrics.totalTimeSpentMinutes,
        averageSessionDurationMinutes: metrics.averageSessionDurationMinutes,
        retentionRate7Day: metrics.retentionRate7Day,
        activeUsersToday: metrics.activeUsersToday,
        totalEventsTracked: metrics.totalEventsTracked
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route GET /api/analytics/recent
 * @desc Get recent platform events (admin only)
 */
router.get('/recent', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const limit = parseInt(req.query.limit as string) || 30;
    const events = analyticsService.getRecentActivities(limit);
    res.json({ success: true, data: events });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route POST /api/analytics/events
 * @desc Legacy Activity event endpoint
 */
router.post('/events', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { session_id, event_type, metadata, duration, student_id } = req.body;
    const event = analyticsService.recordActivity({
      user_id: req.user?.userId || null,
      student_id: student_id || req.user?.userId || null,
      session_id,
      event_type: event_type || 'PAGE_VIEW',
      duration: duration || 0,
      metadata
    });
    res.status(201).json({ success: true, data: event });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * @route POST /api/analytics/game
 * @desc Legacy STEM / Avatar game event
 */
router.post('/game', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { game_id, action, duration, result, score, metadata, student_id } = req.body;
    const studentId = student_id || req.user?.userId || 'usr-student-01';
    const event = analyticsService.recordGameEvent({
      user_id: studentId,
      student_id: studentId,
      game_id: game_id || 'stem-foundation',
      action: action || 'complete_level',
      duration: duration || 0,
      result: result || 'SUCCESS',
      score: score || 100,
      metadata
    });
    res.status(201).json({ success: true, data: event });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * @route POST /api/analytics/learning
 * @desc Legacy Learning progress event
 */
router.post('/learning', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { content_id, action, performance, score, time_spent, difficulty, metadata, student_id } = req.body;
    const studentId = student_id || req.user?.userId || 'usr-student-01';
    const event = analyticsService.recordLearningEvent({
      user_id: studentId,
      student_id: studentId,
      content_id,
      action: action || 'view_lesson',
      performance: performance || 'good',
      score,
      time_spent,
      difficulty,
      metadata
    });
    res.status(201).json({ success: true, data: event });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
