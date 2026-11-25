import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { authenticateToken } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/httpErrors';

const router = Router();
const aiChatLimiter = rateLimiter(60000, 15, 'Too many AI requests. Please wait a minute.');
const aiRecommendLimiter = rateLimiter(60000, 20, 'Too many recommendation requests. Please slow down.');
const aiSearchLimiter = rateLimiter(60000, 30, 'Too many knowledge search requests. Please slow down.');

router.use((_req, res, next) => {
  res.setHeader('Deprecation', 'true');
  res.setHeader('Link', '</api/advisor/chat>; rel="successor-version"');
  next();
});

// Protected Personal Education Intelligence Agent Routes
router.post('/chat', authenticateToken, aiChatLimiter, asyncHandler((req, res) => aiController.chat(req, res)));
router.post('/recommend', authenticateToken, aiRecommendLimiter, asyncHandler((req, res) => aiController.getRecommendations(req, res)));
router.get('/student-insight', authenticateToken, asyncHandler((req, res) => aiController.getStudentInsight(req, res)));
router.post('/feedback', authenticateToken, asyncHandler((req, res) => aiController.recordFeedback(req, res)));

// Public Read-Only Knowledge Base & Semantic Vector Search
router.get('/knowledge', asyncHandler((req, res) => aiController.getKnowledgeDocuments(req, res)));
router.post('/knowledge/search', aiSearchLimiter, asyncHandler((req, res) => aiController.searchKnowledge(req, res)));

// Protected Student AI Memory
router.get('/memory', authenticateToken, asyncHandler((req, res) => aiController.getMemory(req, res)));
router.post('/memory/sync', authenticateToken, asyncHandler((req, res) => aiController.syncMemory(req, res)));

export default router;
