import { Request, Response } from 'express';
import { aiAgentService } from '../services/aiAgentService';
import { aiRecommendationService } from '../services/aiRecommendationService';
import { studentAIMemoryService } from '../services/studentAIMemoryService';
import { knowledgeRepository } from '../repositories/knowledgeRepository';
import { KnowledgeCategory } from '../types/aiTypes';
import {
  AuthenticatedRequest,
  resolveAuthorizedStudentId,
} from '../middleware/authMiddleware';
import { safeErrorMessage } from '../utils/httpErrors';

export class AIController {
  /**
   * POST /api/ai/chat
   */
  public async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const body = (req.body || {}) as Record<string, unknown>;
      const message = typeof body.message === 'string' ? body.message : '';
      const chatHistory = Array.isArray(body.chatHistory) ? body.chatHistory : [];

      const studentId = resolveAuthorizedStudentId(
        req,
        res,
        typeof body.studentId === 'string' ? body.studentId : undefined
      );
      if (!studentId) return;

      if (!message || message.trim() === '') {
        res.status(400).json({ success: false, error: 'Message is required' });
        return;
      }

      const response = await aiAgentService.handleChat(
        studentId,
        message.trim(),
        chatHistory as Array<{ sender: string; text: string }>
      );
      res.json(response);
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to process AI chat request',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /**
   * POST /api/ai/recommend
   */
  public async getRecommendations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const body = (req.body || {}) as Record<string, unknown>;
      const studentId = resolveAuthorizedStudentId(
        req,
        res,
        typeof body.studentId === 'string' ? body.studentId : undefined
      );
      if (!studentId) return;

      const forceRefresh = body.forceRefresh === true;
      const recommendations = forceRefresh
        ? aiRecommendationService.generateFreshRecommendations(studentId)
        : aiRecommendationService.getOrGenerateRecommendations(studentId);

      res.json({
        studentId,
        count: recommendations.length,
        recommendations,
        generatedAt: new Date().toISOString(),
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate recommendations',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /**
   * GET /api/ai/student-insight
   */
  public async getStudentInsight(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const requested = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
      const studentId = resolveAuthorizedStudentId(req, res, requested);
      if (!studentId) return;

      const insight = aiAgentService.getStudentInsight(studentId);
      res.json(insight);
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch student insight',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /**
   * POST /api/ai/feedback
   */
  public async recordFeedback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const body = (req.body || {}) as Record<string, unknown>;
      const recommendationId = typeof body.recommendationId === 'string' ? body.recommendationId : '';
      const rawAction = typeof body.action === 'string' ? body.action : 'clicked';
      const action: 'completed' | 'dismissed' | 'clicked' =
        rawAction === 'completed' || rawAction === 'dismissed' ? rawAction : 'clicked';
      const rating = typeof body.rating === 'number' ? body.rating : undefined;
      const comments = typeof body.comments === 'string' ? body.comments : undefined;

      if (!recommendationId) {
        res.status(400).json({ success: false, error: 'recommendationId is required' });
        return;
      }

      const result = aiRecommendationService.recordFeedback(
        recommendationId,
        action,
        rating,
        comments,
        req.user.userId,
        req.user.role
      );
      if (result.forbidden) {
        res.status(403).json({
          success: false,
          error: 'Forbidden: you can only submit feedback for your own recommendations.',
        });
        return;
      }
      if (!result.success) {
        res.status(404).json({ success: false, error: 'Recommendation not found' });
        return;
      }

      res.json({
        success: true,
        message: `Feedback recorded successfully for ${recommendationId}`,
        recommendation: result.recommendation,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to record feedback',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /**
   * GET /api/ai/knowledge
   */
  public async getKnowledgeDocuments(req: Request, res: Response): Promise<void> {
    try {
      const category = req.query.category as KnowledgeCategory | undefined;
      const docs = knowledgeRepository.getAllDocuments(category);
      res.json({
        total: docs.length,
        category: category || 'all',
        documents: docs,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch knowledge documents',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /**
   * POST /api/ai/knowledge/search
   */
  public async searchKnowledge(req: Request, res: Response): Promise<void> {
    try {
      const { query, category, topK = 5 } = (req.body || {}) as {
        query?: string;
        category?: KnowledgeCategory;
        topK?: number;
      };

      if (!query || typeof query !== 'string' || !query.trim()) {
        res.status(400).json({ success: false, error: 'query string is required' });
        return;
      }

      const numericTopK = typeof topK === 'number' && Number.isFinite(topK) ? Math.trunc(topK) : 5;
      const boundedTopK = Math.min(Math.max(1, numericTopK), 25);

      const results = knowledgeRepository.semanticSearch(query.trim(), boundedTopK, category);
      res.json({
        query: query.trim(),
        category: category || 'all',
        count: results.length,
        results,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to perform semantic search',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /**
   * GET /api/ai/memory
   */
  public async getMemory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const requested = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
      const studentId = resolveAuthorizedStudentId(req, res, requested);
      if (!studentId) return;

      const memory = studentAIMemoryService.getMemory(studentId);
      res.json({ memory });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch memory',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /**
   * POST /api/ai/memory/sync
   */
  public async syncMemory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const body = (req.body || {}) as Record<string, unknown>;
      const studentId = resolveAuthorizedStudentId(
        req,
        res,
        typeof body.studentId === 'string' ? body.studentId : undefined
      );
      if (!studentId) return;

      const memory = studentAIMemoryService.synthesizeAndSaveMemory(studentId);
      res.json({
        success: true,
        message: 'Student AI memory evaluated under active privacy consent.',
        memory,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to sync memory',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }
}

export const aiController = new AIController();
