import { Router } from 'express';
import { aiAgent2Controller } from '../controllers/aiAgent2Controller';

export const aiAgent2Routes = Router();

// Agents
aiAgent2Routes.get('/agents', (req, res) => aiAgent2Controller.getAgents(req, res));

// Dialogue / Chat
aiAgent2Routes.post('/chat', (req, res) => aiAgent2Controller.chat(req, res));

// 7-Pillar Memory
aiAgent2Routes.get('/memory/:studentId', (req, res) => aiAgent2Controller.getMemory(req, res));
aiAgent2Routes.post('/memory/update', (req, res) => aiAgent2Controller.updateMemory(req, res));

// Personalization / Cross-Database Recommendations
aiAgent2Routes.get('/recommendations/:studentId', (req, res) => aiAgent2Controller.getRecommendations(req, res));

// AI Action System: Plans & Milestones
aiAgent2Routes.get('/action-plans/:studentId', (req, res) => aiAgent2Controller.getActionPlans(req, res));
aiAgent2Routes.post('/action-plans/toggle-milestone', (req, res) => aiAgent2Controller.toggleMilestone(req, res));

// Adaptive Tutoring
aiAgent2Routes.get('/tutor/concept', (req, res) => aiAgent2Controller.getAdaptiveConcept(req, res));

// Knowledge Pipeline
aiAgent2Routes.get('/knowledge/pipeline', (req, res) => aiAgent2Controller.getKnowledgePipeline(req, res));

// Safety Interceptor Audit Test
aiAgent2Routes.post('/safety/test', (req, res) => aiAgent2Controller.testSafety(req, res));

// Closed-Loop Analytics
aiAgent2Routes.get('/analytics/metrics', (req, res) => aiAgent2Controller.getAnalyticsMetrics(req, res));
