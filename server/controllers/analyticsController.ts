import { Router, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware';
import { safeErrorMessage } from '../utils/httpErrors';

const router = Router();
const analyticsService = new AnalyticsService();

/**
 * @route POST /api/analytics/track
 * @desc Universal Event Tracking (authenticated + analytics consent required)
 */
router.post('/track', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const eventType = typeof body.eventType === 'string' ? body.eventType : '';

    if (!eventType) {
      res.status(400).json({ success: false, error: 'eventType is required.' });
      return;
    }

    const actingUserId = req.user!.userId;
    const ingested = analyticsService.trackEvent({
      studentId: actingUserId,
      userId: actingUserId,
      sessionId: typeof body.sessionId === 'string' ? body.sessionId : undefined,
      eventType,
      duration: typeof body.duration === 'number' ? body.duration : undefined,
      contentId: typeof body.contentId === 'string' ? body.contentId : undefined,
      action: typeof body.action === 'string' ? body.action : undefined,
      score: typeof body.score === 'number' ? body.score : undefined,
      timeSpent: typeof body.timeSpent === 'number' ? body.timeSpent : undefined,
      difficulty: typeof body.difficulty === 'string' ? body.difficulty : undefined,
      gameId: typeof body.gameId === 'string' ? body.gameId : undefined,
      level: typeof body.level === 'number' ? body.level : undefined,
      attempt: typeof body.attempt === 'number' ? body.attempt : undefined,
      success: typeof body.success === 'boolean' ? body.success : undefined,
      failureReason: typeof body.failureReason === 'string' ? body.failureReason : undefined,
      timeTaken: typeof body.timeTaken === 'number' ? body.timeTaken : undefined,
      metadata: (body.metadata as Record<string, unknown> | undefined) || undefined,
    });

    res.status(ingested.persisted ? 201 : 200).json({
      success: true,
      persisted: ingested.persisted,
      message: ingested.persisted
        ? `Event '${eventType}' recorded and dispatched to analytics engine.`
        : 'Analytics tracking is disabled by current student privacy consent.',
      data: ingested,
    });
  } catch (err: unknown) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to track analytics event.',
    });
  }
});

/**
 * @route GET /api/analytics/engagement
 * @desc Platform Engagement Analytics (admin only)
 */
router.get('/engagement', authenticateToken, requireRole('admin'), (_req: AuthenticatedRequest, res: Response): void => {
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
        totalEventsTracked: metrics.totalEventsTracked,
      },
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: safeErrorMessage(err, 'Failed to load platform engagement.', 500),
    });
  }
});

/**
 * @route GET /api/analytics/recent
 * @desc Get recent platform events (admin only)
 */
router.get('/recent', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const parsedLimit = Number.parseInt(String(req.query.limit ?? '30'), 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(1, parsedLimit), 200) : 30;
    const events = analyticsService.getRecentActivities(limit);
    res.json({ success: true, data: events });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: safeErrorMessage(err, 'Failed to load recent activities.', 500),
    });
  }
});

/**
 * @route POST /api/analytics/events
 * @desc Legacy Activity event endpoint (authenticated + analytics consent required)
 */
router.post('/events', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const actingUserId = req.user!.userId;
    const result = analyticsService.recordActivity({
      user_id: actingUserId,
      student_id: actingUserId,
      session_id: typeof body.session_id === 'string' ? body.session_id : null,
      event_type: typeof body.event_type === 'string' ? body.event_type : 'PAGE_VIEW',
      duration: typeof body.duration === 'number' ? body.duration : 0,
      metadata: (body.metadata as Record<string, unknown> | undefined) || undefined,
    });
    res.status(result.persisted ? 201 : 200).json({ success: true, ...result });
  } catch (err: unknown) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to record activity event.',
    });
  }
});

/**
 * @route POST /api/analytics/game
 * @desc Legacy STEM / Avatar game event (authenticated + analytics consent required)
 */
router.post('/game', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const actingUserId = req.user!.userId;
    const result = analyticsService.recordGameEvent({
      user_id: actingUserId,
      student_id: actingUserId,
      game_id: typeof body.game_id === 'string' ? body.game_id : 'stem-foundation',
      action: typeof body.action === 'string' ? body.action : 'complete_level',
      duration: typeof body.duration === 'number' ? body.duration : 0,
      result: typeof body.result === 'string' ? body.result : 'SUCCESS',
      score: typeof body.score === 'number' ? body.score : 100,
      metadata: (body.metadata as Record<string, unknown> | undefined) || undefined,
    });
    res.status(result.persisted ? 201 : 200).json({ success: true, ...result });
  } catch (err: unknown) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to record game event.',
    });
  }
});

/**
 * @route POST /api/analytics/learning
 * @desc Legacy Learning progress event (authenticated + analytics consent required)
 */
router.post('/learning', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const actingUserId = req.user!.userId;
    const result = analyticsService.recordLearningEvent({
      user_id: actingUserId,
      student_id: actingUserId,
      content_id: typeof body.content_id === 'string' ? body.content_id : 'unknown',
      action: typeof body.action === 'string' ? body.action : 'view_lesson',
      performance: typeof body.performance === 'string' ? body.performance : 'good',
      score: typeof body.score === 'number' ? body.score : undefined,
      time_spent: typeof body.time_spent === 'number' ? body.time_spent : undefined,
      difficulty: typeof body.difficulty === 'string' ? body.difficulty : undefined,
      metadata: (body.metadata as Record<string, unknown> | undefined) || undefined,
    });
    res.status(result.persisted ? 201 : 200).json({ success: true, ...result });
  } catch (err: unknown) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to record learning event.',
    });
  }
});

export default router;
