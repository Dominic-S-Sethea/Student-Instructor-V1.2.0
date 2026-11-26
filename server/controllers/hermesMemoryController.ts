import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validationMiddleware';
import { HermesDocUpdateSchema, HermesFactCreateSchema, HermesFactFeedbackSchema } from '../validators/domainSchemas';
import { hermesMemoryService } from '../services/hermesMemoryService';
import type {
  HermesDocType,
  HermesFactCategory,
  HermesFactFeedbackAction,
} from '../types/hermesMemoryTypes';

const VALID_CATEGORIES: readonly HermesFactCategory[] = [
  'preference',
  'goal',
  'strength',
  'growth_area',
  'milestone',
  'target_school',
  'study_habit',
];

const memoryLimiter = rateLimiter(60_000, 60, 'Too many memory requests. Please slow down.');
const router = Router();
router.use(authenticateToken);
router.use(memoryLimiter);

/** GET /api/memory — returns student's USER/MEMORY docs and active facts (consent-enforced). */
router.get('/', (req: AuthenticatedRequest, res: Response): void => {
  const includeInactive = req.query.includeInactive === 'true';
  const snapshot = hermesMemoryService.getMemorySnapshot(req.user?.userId, includeInactive);
  res.json({ success: true, ...snapshot });
});

/** PUT /api/memory/docs/:docType — updates USER (3000 chars) or MEMORY (10000 chars) doc. */
router.put('/docs/:docType', validate(HermesDocUpdateSchema, 'body'), (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.userId;
  const rawType = String(req.params.docType || '').toUpperCase();
  if (rawType !== 'USER' && rawType !== 'MEMORY') {
    res.status(400).json({ success: false, error: 'docType must be USER or MEMORY.' });
    return;
  }
  const { content } = req.body as { content: string };
  const result = hermesMemoryService.updateMemoryDoc(userId!, rawType as HermesDocType, content);
  if (!result.enabled) {
    res.status(403).json({
      success: false,
      code: 'AI_MEMORY_CONSENT_REQUIRED',
      error: 'AI advising memory is disabled by student/guardian privacy preferences.',
      reason: result.reason,
    });
    return;
  }
  res.json({ success: true, ...result });
});

/** POST /api/memory/facts — adds or reinforces a structured fact in fact_store. */
router.post('/facts', validate(HermesFactCreateSchema, 'body'), (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.userId;
  const body = req.body as {
    factText: string;
    category?: HermesFactCategory;
    entities?: string[];
    keywords?: string[];
  };
  const result = hermesMemoryService.addFact(userId!, {
    factText: body.factText,
    category: body.category ?? 'preference',
    entities: body.entities,
    keywords: body.keywords,
    source: 'explicit_user',
  });
  if (!result.enabled) {
    res.status(403).json({
      success: false,
      code: 'AI_MEMORY_CONSENT_REQUIRED',
      error: 'AI advising memory is disabled by privacy settings.',
      reason: result.reason,
    });
    return;
  }
  res.status(201).json({ success: true, ...result });
});

/** GET /api/memory/facts/search?q=... — multilingual keyword & entity search. */
router.get('/facts/search', (req: AuthenticatedRequest, res: Response): void => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const rawCat = typeof req.query.category === 'string' ? req.query.category : undefined;
  const category =
    rawCat && VALID_CATEGORIES.includes(rawCat as HermesFactCategory)
      ? (rawCat as HermesFactCategory)
      : undefined;
  const result = hermesMemoryService.searchFacts(req.user!.userId, q, category);
  res.json({ success: true, ...result });
});

/** POST /api/memory/facts/:id/feedback — confirm, correct, end, or revert a fact. */
router.post('/facts/:id/feedback', validate(HermesFactFeedbackSchema, 'body'), (req: AuthenticatedRequest, res: Response): void => {
  const { action, updatedText, note } = req.body as {
    action: HermesFactFeedbackAction;
    updatedText?: string;
    note?: string;
  };
  const result = hermesMemoryService.applyFactFeedback(
    req.user!.userId,
    req.params.id,
    action,
    updatedText,
    note
  );
  if (!result.enabled) {
    res.status(403).json({
      success: false,
      code: 'AI_MEMORY_CONSENT_REQUIRED',
      error: 'AI advising memory is disabled by privacy settings.',
    });
    return;
  }
  if (!result.fact) {
    res.status(404).json({ success: false, error: 'Fact not found for this account.' });
    return;
  }
  res.json({ success: true, ...result });
});

/** GET /api/memory/facts/:id/history — returns change/correction audit trail for one fact. */
router.get('/facts/:id/history', (req: AuthenticatedRequest, res: Response): void => {
  const status = hermesMemoryService.getFactHistoryWithStatus(req.user!.userId, req.params.id);
  res.json({ success: true, ...status });
});

/** DELETE /api/memory — wipes all Hermes memory docs, facts, and history for the user. */
router.delete('/', (req: AuthenticatedRequest, res: Response): void => {
  const result = hermesMemoryService.clearAllMemory(req.user!.userId);
  res.json({ success: true, ...result });
});

export default router;
