import { Request, Response } from 'express';
import { aiAgent2Service } from '../services/aiAgent2Service';
import { AgentKey } from '../types/aiAgent2Types';

export class AIAgent2Controller {
  /**
   * GET /api/ai-os/agents
   * Lists all 6 specialized agents in the Personal Education OS
   */
  public async getAgents(req: Request, res: Response): Promise<void> {
    try {
      const agents = aiAgent2Service.getAgents();
      res.json({
        total: agents.length,
        systemVersion: 'Personal Education Intelligence Agent 2.0 (CDES OS)',
        agents
      });
    } catch (error: any) {
      console.error('Error in /api/ai-os/agents:', error);
      res.status(500).json({ error: 'Failed to fetch agents', details: error?.message });
    }
  }

  /**
   * POST /api/ai-os/chat
   * Socratic multi-agent dialogue with safety filtering, long-term memory, and RAG grounding
   */
  public async chat(req: Request, res: Response): Promise<void> {
    try {
      const {
        studentId = 'usr-student-01',
        agentKey = 'education_advisor',
        message
      } = req.body;

      if (!message || typeof message !== 'string' || message.trim() === '') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const result = await aiAgent2Service.handleAgentDialogue(
        studentId,
        agentKey as AgentKey,
        message.trim()
      );

      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/ai-os/chat:', error);
      res.status(500).json({ error: 'Failed to process chat in AI OS', details: error?.message });
    }
  }

  /**
   * GET /api/ai-os/memory/:studentId
   * Retrieves the 7-pillar long-term student memory profile
   */
  public async getMemory(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.params.studentId || 'usr-student-01';
      const memory = aiAgent2Service.getLongTermMemory(studentId);
      res.json({ memory });
    } catch (error: any) {
      console.error('Error in /api/ai-os/memory:', error);
      res.status(500).json({ error: 'Failed to fetch memory', details: error?.message });
    }
  }

  /**
   * POST /api/ai-os/memory/update
   * Updates or enriches long-term memory
   */
  public async updateMemory(req: Request, res: Response): Promise<void> {
    try {
      const { memory } = req.body;
      if (!memory || !memory.studentId) {
        res.status(400).json({ error: 'Valid memory payload is required' });
        return;
      }
      aiAgent2Service.saveLongTermMemory(memory);
      res.json({ success: true, message: 'Long-term memory updated successfully', memory });
    } catch (error: any) {
      console.error('Error in /api/ai-os/memory/update:', error);
      res.status(500).json({ error: 'Failed to update memory', details: error?.message });
    }
  }

  /**
   * GET /api/ai-os/recommendations/:studentId
   * Generates cross-database personalized matches (Student + Universities + Scholarships + Labs)
   */
  public async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.params.studentId || 'usr-student-01';
      const matches = aiAgent2Service.getPersonalizedMatches(studentId);
      res.json({
        studentId,
        count: matches.length,
        matches,
        generatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error in /api/ai-os/recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations', details: error?.message });
    }
  }

  /**
   * GET /api/ai-os/action-plans/:studentId
   * Retrieves active multi-week learning plans and career roadmaps
   */
  public async getActionPlans(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.params.studentId || 'usr-student-01';
      const plans = aiAgent2Service.getActionPlans(studentId);
      res.json({
        studentId,
        count: plans.length,
        plans
      });
    } catch (error: any) {
      console.error('Error in /api/ai-os/action-plans:', error);
      res.status(500).json({ error: 'Failed to fetch action plans', details: error?.message });
    }
  }

  /**
   * POST /api/ai-os/action-plans/toggle-milestone
   * Toggles milestone completion status and recalculates progress
   */
  public async toggleMilestone(req: Request, res: Response): Promise<void> {
    try {
      const { planId, milestoneId, studentId = 'usr-student-01' } = req.body;
      if (!planId || !milestoneId) {
        res.status(400).json({ error: 'planId and milestoneId are required' });
        return;
      }
      const success = aiAgent2Service.toggleMilestone(planId, milestoneId, studentId);
      res.json({ success, planId, milestoneId });
    } catch (error: any) {
      console.error('Error in /api/ai-os/action-plans/toggle-milestone:', error);
      res.status(500).json({ error: 'Failed to toggle milestone', details: error?.message });
    }
  }

  /**
   * GET /api/ai-os/tutor/concept
   * Retrieves adaptive tutor concept with 4 explanation styles and ZPD ladder
   */
  public async getAdaptiveConcept(req: Request, res: Response): Promise<void> {
    try {
      const conceptId = req.query.conceptId as string | undefined;
      const concept = aiAgent2Service.getAdaptiveConcept(conceptId);
      res.json({ concept });
    } catch (error: any) {
      console.error('Error in /api/ai-os/tutor/concept:', error);
      res.status(500).json({ error: 'Failed to fetch adaptive concept', details: error?.message });
    }
  }

  /**
   * GET /api/ai-os/knowledge/pipeline
   * Retrieves knowledge ingestion and verification ledger
   */
  public async getKnowledgePipeline(req: Request, res: Response): Promise<void> {
    try {
      const pipeline = aiAgent2Service.getKnowledgePipeline();
      res.json({
        total: pipeline.length,
        pipeline
      });
    } catch (error: any) {
      console.error('Error in /api/ai-os/knowledge/pipeline:', error);
      res.status(500).json({ error: 'Failed to fetch knowledge pipeline', details: error?.message });
    }
  }

  /**
   * POST /api/ai-os/safety/test
   * Tests a prompt against the 4 safety guardrails
   */
  public async testSafety(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, agentKey = 'education_advisor', studentId = 'usr-student-01' } = req.body;
      if (!prompt) {
        res.status(400).json({ error: 'prompt is required' });
        return;
      }
      const result = aiAgent2Service.evaluateSafety(prompt, agentKey as AgentKey, studentId);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/ai-os/safety/test:', error);
      res.status(500).json({ error: 'Failed to test safety', details: error?.message });
    }
  }

  /**
   * GET /api/ai-os/analytics/metrics
   * Retrieves closed-loop analytics conversion funnel and metrics
   */
  public async getAnalyticsMetrics(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.query.studentId as string | undefined;
      const metrics = aiAgent2Service.getClosedLoopMetrics(studentId);
      res.json(metrics);
    } catch (error: any) {
      console.error('Error in /api/ai-os/analytics/metrics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics metrics', details: error?.message });
    }
  }
}

export const aiAgent2Controller = new AIAgent2Controller();
