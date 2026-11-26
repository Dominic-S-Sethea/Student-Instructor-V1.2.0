import { Router, Response } from 'express';
import { AIRepository } from '../repositories/aiRepository';
import { ScholarshipRepository } from '../repositories/scholarshipRepository';
import { formatScholarshipRecord } from '../services/scholarshipFormatter';
import { PrivacyService } from '../services/privacyService';
import type { McpSourceCitation } from '../mcp/cdesAppTools';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validationMiddleware';
import { AdvisorChatSchema } from '../validators/apiSchemas';
import { asyncHandler } from '../utils/httpErrors';
import {
  type AdvisorProvider,
  type AdvisorProviderRequest,
  handleInjectedProviderTurn,
  handleLiveGeminiTurn,
  handleOfflineTurn,
  inspectAdvisorInputs,
} from '../services/advisorTurnHandlers';

export type { AdvisorProvider, AdvisorProviderRequest };

export interface AdvisorRouterOptions {
  provider?: AdvisorProvider | null;
  timeoutMs?: number;
}

const advisorLimiter = rateLimiter(
  60_000,
  15,
  'Too many Study Advisor requests. Please wait a minute.',
  (req) => {
    const userId = (req as AuthenticatedRequest).user?.userId;
    return userId ? `advisor:user:${userId}` : `advisor:ip:${req.ip || req.socket.remoteAddress || '127.0.0.1'}`;
  }
);

function loadVerifiedCatalogCitations(scholarshipRepo: ScholarshipRepository): {
  catalogTitles: string[];
  catalogCitations: McpSourceCitation[];
} {
  let verifiedScholarships: ReturnType<ScholarshipRepository['getAll']> = [];
  try {
    verifiedScholarships = scholarshipRepo.getAll({ onlyVerified: true }).slice(0, 5);
  } catch {
    verifiedScholarships = [];
  }
  const catalogTitles = verifiedScholarships.map((s) => `${s.name} (${s.provider})`);
  const catalogCitations: McpSourceCitation[] = verifiedScholarships.map((s) => {
    const formatted = formatScholarshipRecord(s);
    return {
      id: s.id,
      title: s.name,
      category: 'scholarship',
      source: s.provider,
      url: formatted.officialSourceUrl || formatted.applicationLink || undefined,
    };
  });
  return { catalogTitles, catalogCitations };
}

/** Creates the advisor router with embedded MCP, Gemini 4 Interactions, Hermes memory, and fail-closed provider handling. */
export function createAdvisorRouter(options: AdvisorRouterOptions = {}): Router {
  const router = Router();
  const aiRepo = new AIRepository();
  const scholarshipRepo = new ScholarshipRepository();
  const privacyService = new PrivacyService();
  const timeoutMs = options.timeoutMs ?? 30000;

  router.post(
    '/chat',
    optionalAuth,
    advisorLimiter,
    validate(AdvisorChatSchema, 'body'),
    asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const startTime = Date.now();
      const body = (req.body || {}) as {
        messages?: Array<{ sender: string; text: string }>;
        studentProfile?: { name?: string; educationLevel?: string; favoriteSubjects?: string[]; targetMajor?: string };
        userPrompt?: string;
      };

      const messages = Array.isArray(body.messages) ? body.messages : [];
      const lastMsgText = messages.length > 0 ? String(messages[messages.length - 1]?.text || '').trim() : '';
      const currentPrompt =
        (typeof body.userPrompt === 'string' ? body.userPrompt.trim() : '') || lastMsgText;

      if (!currentPrompt) {
        res.status(400).json({ success: false, error: 'userPrompt or non-empty messages is required.' });
        return;
      }

      const inputCheck = inspectAdvisorInputs(currentPrompt, messages, body.studentProfile);
      if (!inputCheck.isSafe) {
        res.json({
          success: true,
          mode: 'safety_guardrail',
          providerStatus: 'guarded',
          isEstimate: false,
          persisted: false,
          sources: ['cdes_pedagogical_safety'],
          retrievedSources: [],
          webSources: [],
          toolsUsed: [],
          memoryUpdates: [],
          unavailableData: [],
          reply: inputCheck.guidanceNote || 'Let us focus on safe, constructive learning and academic planning.',
          source: 'cdes_pedagogical_safety',
          recommendedMajors: [],
          recommendedSkills: [],
          suggestedMentors: [],
          suggestedQuestions: ['How can I prepare effectively for Bac II or university scholarships?'],
        });
        return;
      }

      const activeUserId = req.user?.userId || null;
      const memoryAllowed = Boolean(activeUserId && privacyService.canUseAIMemory(activeUserId));
      const { catalogTitles, catalogCitations } = loadVerifiedCatalogCitations(scholarshipRepo);
      const unavailableData: string[] = [];
      if (!activeUserId) unavailableData.push('authenticated_student_profile');
      if (activeUserId && !memoryAllowed) unavailableData.push('ai_memory_disabled_by_consent');

      const ctx = {
        aiRepo,
        privacyService,
        activeUserId,
        userRole: req.user?.role || null,
        currentPrompt,
        messages,
        studentProfile: body.studentProfile,
        catalogTitles,
        catalogCitations,
        unavailableData,
        timeoutMs,
        startTime,
      };

      if (options.provider !== undefined) {
        await handleInjectedProviderTurn(options.provider, ctx, res);
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY?.trim() || '';
      if (!apiKey) {
        handleOfflineTurn(ctx, res);
        return;
      }

      await handleLiveGeminiTurn(apiKey, ctx, res);
    })
  );

  return router;
}
