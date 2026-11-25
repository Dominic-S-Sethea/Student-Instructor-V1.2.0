import { Request, Response } from 'express';
import { aiAgent2Service } from '../services/aiAgent2Service';
import { AgentKey, StudentLongTermMemory } from '../types/aiAgent2Types';
import {
  AuthenticatedRequest,
  resolveAuthorizedStudentId,
} from '../middleware/authMiddleware';
import { safeErrorMessage } from '../utils/httpErrors';

export class AIAgent2Controller {
  /** GET /api/ai-os/agents */
  public async getAgents(_req: Request, res: Response): Promise<void> {
    try {
      const agents = aiAgent2Service.getAgents();
      res.json({
        total: agents.length,
        systemVersion: 'Personal Education Intelligence Agent 2.0 (CDES OS)',
        agents,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch agents',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /** POST /api/ai-os/chat */
  public async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const body = (req.body || {}) as Record<string, unknown>;
      const studentId = resolveAuthorizedStudentId(
        req,
        res,
        typeof body.studentId === 'string' ? body.studentId : undefined
      );
      if (!studentId) return;

      const agentKey = (typeof body.agentKey === 'string' ? body.agentKey : 'education_advisor') as AgentKey;
      const message = typeof body.message === 'string' ? body.message : '';

      if (!message || message.trim() === '') {
        res.status(400).json({ success: false, error: 'Message is required' });
        return;
      }

      const result = await aiAgent2Service.handleAgentDialogue(studentId, agentKey, message.trim());
      res.json(result);
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to process chat in AI OS',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /** GET /api/ai-os/memory/:studentId */
  public async getMemory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const studentId = resolveAuthorizedStudentId(req, res, req.params.studentId);
      if (!studentId) return;

      const memory = aiAgent2Service.getLongTermMemory(studentId);
      res.json({ memory });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch memory',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /** POST /api/ai-os/memory/update */
  public async updateMemory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const memory = (req.body as { memory?: StudentLongTermMemory } | undefined)?.memory;
      if (!memory || !memory.studentId) {
        res.status(400).json({ success: false, error: 'Valid memory payload is required' });
        return;
      }

      const authorizedStudentId = resolveAuthorizedStudentId(req, res, memory.studentId);
      if (!authorizedStudentId) return;

      const scopedMemory: StudentLongTermMemory = { ...memory, studentId: authorizedStudentId };
      aiAgent2Service.saveLongTermMemory(scopedMemory);
      res.json({ success: true, message: 'Long-term memory updated successfully', memory: scopedMemory });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to update memory',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /** GET /api/ai-os/recommendations/:studentId */
  public async getRecommendations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const studentId = resolveAuthorizedStudentId(req, res, req.params.studentId);
      if (!studentId) return;

      const matches = aiAgent2Service.getPersonalizedMatches(studentId);
      res.json({
        studentId,
        count: matches.length,
        matches,
        generatedAt: new Date().toISOString(),
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recommendations',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /** GET /api/ai-os/action-plans/:studentId */
  public async getActionPlans(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const studentId = resolveAuthorizedStudentId(req, res, req.params.studentId);
      if (!studentId) return;

      const plans = aiAgent2Service.getActionPlans(studentId);
      res.json({
        studentId,
        count: plans.length,
        plans,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch action plans',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /** POST /api/ai-os/action-plans/toggle-milestone */
  public async toggleMilestone(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const body = (req.body || {}) as Record<string, unknown>;
      const studentId = resolveAuthorizedStudentId(
        req,
        res,
        typeof body.studentId === 'string' ? body.studentId : undefined
      );
      if (!studentId) return;

      const planId = typeof body.planId === 'string' ? body.planId : '';
      const milestoneId = typeof body.milestoneId === 'string' ? body.milestoneId : '';
      if (!planId || !milestoneId) {
        res.status(400).json({ success: false, error: 'planId and milestoneId are required' });
        return;
      }

      const success = aiAgent2Service.toggleMilestone(planId, milestoneId, studentId);
      res.json({ success, planId, milestoneId });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to toggle milestone',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /** GET /api/ai-os/tutor/concept */
  public async getAdaptiveConcept(req: Request, res: Response): Promise<void> {
    try {
      const conceptId = typeof req.query.conceptId === 'string' ? req.query.conceptId : undefined;
      const concept = aiAgent2Service.getAdaptiveConcept(conceptId);
      res.json({ concept });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch adaptive concept',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /** GET /api/ai-os/knowledge/pipeline */
  public async getKnowledgePipeline(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const pipeline = aiAgent2Service.getKnowledgePipeline();
      res.json({
        total: pipeline.length,
        pipeline,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch knowledge pipeline',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /** POST /api/ai-os/safety/test */
  public async testSafety(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const body = (req.body || {}) as Record<string, unknown>;
      const prompt = typeof body.prompt === 'string' ? body.prompt : '';
      const agentKey = (typeof body.agentKey === 'string' ? body.agentKey : 'education_advisor') as AgentKey;
      const studentId = resolveAuthorizedStudentId(
        req,
        res,
        typeof body.studentId === 'string' ? body.studentId : undefined
      );
      if (!studentId) return;

      if (!prompt) {
        res.status(400).json({ success: false, error: 'prompt is required' });
        return;
      }
      const result = aiAgent2Service.evaluateSafety(prompt, agentKey, studentId);
      res.json(result);
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to test safety',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }

  /** GET /api/ai-os/analytics/metrics */
  public async getAnalyticsMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const studentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
      const metrics = aiAgent2Service.getClosedLoopMetrics(studentId);
      res.json(metrics);
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics metrics',
        details: safeErrorMessage(error, 'Internal error', 500),
      });
    }
  }
}

export const aiAgent2Controller = new AIAgent2Controller();
