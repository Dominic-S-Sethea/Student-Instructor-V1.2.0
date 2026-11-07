import { Router } from 'express';
import { aiController } from '../controllers/aiController';

const router = Router();

// Phase 6 Core AI Personal Education Intelligence Agent Routes
router.post('/chat', (req, res) => aiController.chat(req, res));
router.post('/recommend', (req, res) => aiController.getRecommendations(req, res));
router.get('/student-insight', (req, res) => aiController.getStudentInsight(req, res));
router.post('/feedback', (req, res) => aiController.recordFeedback(req, res));

// Knowledge Base & Semantic Vector Search
router.get('/knowledge', (req, res) => aiController.getKnowledgeDocuments(req, res));
router.post('/knowledge/search', (req, res) => aiController.searchKnowledge(req, res));

// Student AI Memory
router.get('/memory', (req, res) => aiController.getMemory(req, res));
router.post('/memory/sync', (req, res) => aiController.syncMemory(req, res));

export default router;
