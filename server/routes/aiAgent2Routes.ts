import { Router } from 'express';
import { aiAgent2Controller } from '../controllers/aiAgent2Controller';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/httpErrors';

export const aiAgent2Routes = Router();
const aiOsChatLimiter = rateLimiter(60000, 15, 'Too many AI OS chat requests. Please wait a minute.');

aiAgent2Routes.use((_req, res, next) => {
  res.setHeader('Deprecation', 'true');
  res.setHeader('Link', '</api/advisor/chat>; rel="successor-version"');
  next();
});

// Public agent catalog & tutor concept demo
aiAgent2Routes.get('/agents', asyncHandler((req, res) => aiAgent2Controller.getAgents(req, res)));
aiAgent2Routes.get('/tutor/concept', asyncHandler((req, res) => aiAgent2Controller.getAdaptiveConcept(req, res)));

// Protected student-scoped AI OS endpoints
aiAgent2Routes.post('/chat', authenticateToken, aiOsChatLimiter, asyncHandler((req, res) => aiAgent2Controller.chat(req, res)));
aiAgent2Routes.get('/memory/:studentId', authenticateToken, asyncHandler((req, res) => aiAgent2Controller.getMemory(req, res)));
aiAgent2Routes.post('/memory/update', authenticateToken, asyncHandler((req, res) => aiAgent2Controller.updateMemory(req, res)));
aiAgent2Routes.get('/recommendations/:studentId', authenticateToken, asyncHandler((req, res) => aiAgent2Controller.getRecommendations(req, res)));
aiAgent2Routes.get('/action-plans/:studentId', authenticateToken, asyncHandler((req, res) => aiAgent2Controller.getActionPlans(req, res)));
aiAgent2Routes.post('/action-plans/toggle-milestone', authenticateToken, asyncHandler((req, res) => aiAgent2Controller.toggleMilestone(req, res)));

// Admin-only AI OS internal & analytics endpoints
aiAgent2Routes.get('/knowledge/pipeline', authenticateToken, requireRole('admin'), asyncHandler((req, res) => aiAgent2Controller.getKnowledgePipeline(req, res)));
aiAgent2Routes.post('/safety/test', authenticateToken, requireRole('admin'), asyncHandler((req, res) => aiAgent2Controller.testSafety(req, res)));
aiAgent2Routes.get('/analytics/metrics', authenticateToken, requireRole('admin'), asyncHandler((req, res) => aiAgent2Controller.getAnalyticsMetrics(req, res)));
