import { Request, Response } from 'express';
import { aiAgentService } from '../services/aiAgentService';
import { aiRecommendationService } from '../services/aiRecommendationService';
import { studentAIMemoryService } from '../services/studentAIMemoryService';
import { knowledgeRepository } from '../repositories/knowledgeRepository';
import { KnowledgeCategory } from '../types/aiTypes';

export class AIController {
  /**
   * POST /api/ai/chat
   * Core dialogue endpoint with RAG context, student memory, and safety filters
   */
  public async chat(req: Request, res: Response): Promise<void> {
    try {
      const { message, studentId = 'usr-student-01', chatHistory = [] } = req.body;

      if (!message || typeof message !== 'string' || message.trim() === '') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const response = await aiAgentService.handleChat(studentId, message.trim(), chatHistory);
      res.json(response);
    } catch (error: any) {
      console.error('Error in /api/ai/chat:', error);
      res.status(500).json({ error: 'Failed to process AI chat request', details: error?.message });
    }
  }

  /**
   * POST /api/ai/recommend
   * Generates or retrieves personalized recommendations across Learning, Career, Scholarship
   */
  public async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { studentId = 'usr-student-01', forceRefresh = false } = req.body;

      let recommendations;
      if (forceRefresh) {
        recommendations = aiRecommendationService.generateFreshRecommendations(studentId);
      } else {
        recommendations = aiRecommendationService.getOrGenerateRecommendations(studentId);
      }

      res.json({
        studentId,
        count: recommendations.length,
        recommendations,
        generatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error in /api/ai/recommend:', error);
      res.status(500).json({ error: 'Failed to generate recommendations', details: error?.message });
    }
  }

  /**
   * GET /api/ai/student-insight
   * Comprehensive AI-generated multi-dimensional student intelligence profile
   */
  public async getStudentInsight(req: Request, res: Response): Promise<void> {
    try {
      const studentId = (req.query.studentId as string) || 'usr-student-01';
      const insight = aiAgentService.getStudentInsight(studentId);
      res.json(insight);
    } catch (error: any) {
      console.error('Error in /api/ai/student-insight:', error);
      res.status(500).json({ error: 'Failed to fetch student insight', details: error?.message });
    }
  }

  /**
   * POST /api/ai/feedback
   * Closes the feedback loop: tracks recommendation_given, clicked, completed, result
   */
  public async recordFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { recommendationId, action = 'clicked', rating, comments } = req.body;

      if (!recommendationId) {
        res.status(400).json({ error: 'recommendationId is required' });
        return;
      }

      const result = aiRecommendationService.recordFeedback(recommendationId, action, rating, comments);
      if (!result.success) {
        res.status(404).json({ error: 'Recommendation not found' });
        return;
      }

      res.json({
        success: true,
        message: `Feedback recorded successfully for ${recommendationId}`,
        recommendation: result.recommendation
      });
    } catch (error: any) {
      console.error('Error in /api/ai/feedback:', error);
      res.status(500).json({ error: 'Failed to record feedback', details: error?.message });
    }
  }

  /**
   * GET /api/ai/knowledge
   * Lists knowledge base documents by category or query
   */
  public async getKnowledgeDocuments(req: Request, res: Response): Promise<void> {
    try {
      const category = req.query.category as KnowledgeCategory | undefined;
      const docs = knowledgeRepository.getAllDocuments(category);
      res.json({
        total: docs.length,
        category: category || 'all',
        documents: docs
      });
    } catch (error: any) {
      console.error('Error in /api/ai/knowledge:', error);
      res.status(500).json({ error: 'Failed to fetch knowledge documents', details: error?.message });
    }
  }

  /**
   * POST /api/ai/knowledge/search
   * Semantic Vector Search Sandbox against knowledge base embeddings
   */
  public async searchKnowledge(req: Request, res: Response): Promise<void> {
    try {
      const { query, category, topK = 5 } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'query string is required' });
        return;
      }

      const results = knowledgeRepository.semanticSearch(query.trim(), Number(topK) || 5, category);
      res.json({
        query,
        category: category || 'all',
        count: results.length,
        results
      });
    } catch (error: any) {
      console.error('Error in /api/ai/knowledge/search:', error);
      res.status(500).json({ error: 'Failed to perform semantic search', details: error?.message });
    }
  }

  /**
   * GET /api/ai/memory
   * Retrieves the 5 memory pillars for a student
   */
  public async getMemory(req: Request, res: Response): Promise<void> {
    try {
      const studentId = (req.query.studentId as string) || 'usr-student-01';
      const memory = studentAIMemoryService.getMemory(studentId);
      res.json({ memory });
    } catch (error: any) {
      console.error('Error in /api/ai/memory:', error);
      res.status(500).json({ error: 'Failed to fetch memory', details: error?.message });
    }
  }

  /**
   * POST /api/ai/memory/sync
   * Triggers dynamic synthesis and update of student AI memory
   */
  public async syncMemory(req: Request, res: Response): Promise<void> {
    try {
      const { studentId = 'usr-student-01' } = req.body;
      const memory = studentAIMemoryService.synthesizeAndSaveMemory(studentId);
      res.json({
        success: true,
        message: 'Student AI memory synthesized from learning, behavior, and activity events.',
        memory
      });
    } catch (error: any) {
      console.error('Error in /api/ai/memory/sync:', error);
      res.status(500).json({ error: 'Failed to sync memory', details: error?.message });
    }
  }
}

export const aiController = new AIController();
