import { Router, Response } from 'express';
import { AIRepository } from '../repositories/aiRepository';
import { ScholarshipRepository } from '../repositories/scholarshipRepository';
import { formatScholarshipRecord } from '../services/scholarshipFormatter';
import { PrivacyService } from '../services/privacyService';
import { aiSafetyService } from '../services/aiSafetyService';
import { hermesMemoryService } from '../services/hermesMemoryService';
import { runGeminiMcpAdvisorTurn } from '../services/geminiAdvisorOrchestrator';
import { buildDeterministicOfflineReply, extractExplicitMemoryRequest } from '../services/advisorOfflineHelper';
import type { McpSourceCitation } from '../mcp/cdesAppTools';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validationMiddleware';
import { AdvisorChatSchema } from '../validators/apiSchemas';
import { asyncHandler, safeErrorMessage } from '../utils/httpErrors';

export interface AdvisorProviderRequest {
  prompt: string;
  systemInstruction: string;
  messages: Array<{ sender: string; text: string }>;
}

export interface AdvisorProvider {
  generateReply(input: AdvisorProviderRequest): Promise<{ text: string; model: string }>;
}

export interface AdvisorRouterOptions {
  provider?: AdvisorProvider | null;
  timeoutMs?: number;
}

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string, onTimeout?: () => void): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      try {
        onTimeout?.();
      } catch {
        // ignore abort hook errors
      }
      reject(new TimeoutError(`Timeout after ${ms}ms waiting for ${label}`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

function logAdvisorTurn(
  aiRepo: AIRepository,
  input: {
    userId: string | null;
    memoryAllowed: boolean;
    sessionTitle: string;
    message: string;
    response: string;
    majors?: string[];
    skills?: string[];
    mentors?: string[];
    sourceAttribution: string;
    latencyMs: number;
  }
): void {
  if (!input.memoryAllowed || !input.userId) return;
  aiRepo.logConversation({
    user_id: input.userId,
    session_title: input.sessionTitle,
    message: input.message,
    response: input.response,
    suggested_majors: JSON.stringify(input.majors || []),
    suggested_skills: JSON.stringify(input.skills || []),
    suggested_mentors: JSON.stringify(input.mentors || []),
    source_attribution: input.sourceAttribution,
    latency_ms: input.latencyMs,
  });
}

function sendProviderFailure(err: unknown, res: Response): void {
  if (err instanceof TimeoutError) {
    res.status(504).json({
      success: false,
      code: 'PROVIDER_TIMEOUT',
      mode: 'provider_timeout',
      providerStatus: 'timeout',
      error: err.message,
    });
    return;
  }
  res.status(503).json({
    success: false,
    code: 'PROVIDER_UNAVAILABLE',
    mode: 'provider_error',
    providerStatus: 'unavailable',
    error: safeErrorMessage(err, 'AI provider transport failed.', 503),
  });
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

      const lastMsgText =
        Array.isArray(body.messages) && body.messages.length > 0
          ? String(body.messages[body.messages.length - 1]?.text || '').trim()
          : '';
      const currentPrompt =
        (typeof body.userPrompt === 'string' ? body.userPrompt.trim() : '') || lastMsgText;

    if (!currentPrompt) {
      res.status(400).json({ success: false, error: 'userPrompt or non-empty messages is required.' });
      return;
    }

    const inputCheck = aiSafetyService.inspectInput(currentPrompt);
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
    const apiKey = process.env.GEMINI_API_KEY?.trim() || '';

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

    const unavailableData: string[] = [];
    if (!activeUserId) unavailableData.push('authenticated_student_profile');
    if (activeUserId && !memoryAllowed) {
      unavailableData.push('ai_memory_disabled_by_consent');
    }

    // 1. Custom injected provider (used by fail-closed timeout & error tests)
    if (options.provider !== undefined) {
      if (!options.provider) {
        unavailableData.push('external_llm_provider');
        const fallback = buildDeterministicOfflineReply(currentPrompt, catalogTitles, body.studentProfile);
        res.json({
          success: true,
          mode: 'deterministic_offline',
          providerStatus: 'disabled',
          isEstimate: true,
          persisted: false,
          sources: catalogTitles.length > 0 ? ['cdes_verified_scholarship_catalog', 'cdes_rule_engine'] : ['cdes_rule_engine'],
          retrievedSources: catalogCitations,
          webSources: [],
          toolsUsed: [],
          memoryUpdates: [],
          unavailableData,
          reply: fallback.reply,
          source: 'deterministic_offline',
          recommendedMajors: fallback.recommendedMajors,
          recommendedSkills: fallback.recommendedSkills,
          suggestedMentors: fallback.suggestedMentors,
          suggestedQuestions: fallback.suggestedQuestions,
        });
        return;
      }

      try {
        const result = await withTimeout(
          options.provider.generateReply({
            prompt: currentPrompt,
            systemInstruction: aiSafetyService.getPedagogicalSafetySystemPrompt(),
            messages: Array.isArray(body.messages) ? body.messages : [],
          }),
          timeoutMs,
          'advisor-provider'
        );

        if (!result.text || !result.text.trim()) {
          res.status(503).json({
            success: false,
            code: 'PROVIDER_EMPTY_RESPONSE',
            mode: 'provider_error',
            providerStatus: 'error',
            error: 'AI provider returned an empty response. Advice could not be generated.',
          });
          return;
        }

        logAdvisorTurn(aiRepo, {
          userId: activeUserId,
          memoryAllowed,
          sessionTitle: 'Career & Academic Advising',
          message: currentPrompt,
          response: result.text,
          sourceAttribution: result.model,
          latencyMs: Date.now() - startTime,
        });

        res.json({
          success: true,
          mode: 'ai_provider',
          providerStatus: 'active',
          isEstimate: true,
          persisted: memoryAllowed,
          sources: [result.model, 'cdes_verified_scholarship_catalog'],
          retrievedSources: catalogCitations,
          webSources: [],
          toolsUsed: [],
          memoryUpdates: [],
          unavailableData,
          reply: result.text,
          source: result.model,
          recommendedMajors: [],
          recommendedSkills: [],
          suggestedMentors: [],
          suggestedQuestions: [],
        });
      } catch (err: unknown) {
        sendProviderFailure(err, res);
      }
      return;
    }

    // 2. Deterministic offline mode when GEMINI_API_KEY is absent
    if (!apiKey) {
      unavailableData.push('external_llm_provider');
      const memoryUpdates: string[] = [];
      let explicitSavedFact: string | null = null;
      const explicitRequest = extractExplicitMemoryRequest(currentPrompt);
      if (explicitRequest && memoryAllowed && activeUserId) {
        const added = hermesMemoryService.addFact(activeUserId, {
          factText: explicitRequest,
          category: 'preference',
          source: 'explicit_user',
        });
        if (added.enabled && added.fact) {
          explicitSavedFact = added.fact.factText;
          memoryUpdates.push(`fact_store_add: ${added.fact.factText}`);
        }
      }

      const turnInfo = hermesMemoryService.recordUserTurn(activeUserId);
      const fallback = buildDeterministicOfflineReply(
        currentPrompt,
        catalogTitles,
        body.studentProfile,
        explicitSavedFact
      );

      logAdvisorTurn(aiRepo, {
        userId: activeUserId,
        memoryAllowed,
        sessionTitle: 'Career & Academic Advising (Offline)',
        message: currentPrompt,
        response: fallback.reply,
        majors: fallback.recommendedMajors,
        skills: fallback.recommendedSkills,
        mentors: fallback.suggestedMentors,
        sourceAttribution: 'deterministic_offline',
        latencyMs: Date.now() - startTime,
      });

      res.json({
        success: true,
        mode: 'deterministic_offline',
        providerStatus: 'disabled',
        isEstimate: true,
        persisted: memoryAllowed,
        sources: catalogTitles.length > 0 ? ['cdes_verified_scholarship_catalog', 'cdes_rule_engine'] : ['cdes_rule_engine'],
        retrievedSources: catalogCitations,
        webSources: [],
        toolsUsed: explicitSavedFact ? ['fact_store_add'] : [],
        memoryUpdates,
        memoryStatus: {
          enabled: memoryAllowed,
          turnCounter: turnInfo.turnCounter,
          shouldNudge: turnInfo.shouldNudge,
        },
        unavailableData,
        reply: fallback.reply,
        source: 'deterministic_offline',
        recommendedMajors: fallback.recommendedMajors,
        recommendedSkills: fallback.recommendedSkills,
        suggestedMentors: fallback.suggestedMentors,
        suggestedQuestions: fallback.suggestedQuestions,
      });
      return;
    }

    // 3. Live Gemini 4 Interactions + Embedded MCP + Google Search + Hermes Memory
    try {
      const abortController = new AbortController();
      const orchestrated = await withTimeout(
        runGeminiMcpAdvisorTurn({
          userId: activeUserId,
          userRole: req.user?.role || null,
          prompt: currentPrompt,
          messages: Array.isArray(body.messages) ? body.messages : [],
          studentProfile: body.studentProfile,
          apiKey,
          signal: abortController.signal,
        }),
        timeoutMs,
        'gemini-mcp-advisor',
        () => abortController.abort()
      );

      if (!orchestrated.text || !orchestrated.text.trim()) {
        res.status(503).json({
          success: false,
          code: 'PROVIDER_EMPTY_RESPONSE',
          mode: 'provider_error',
          providerStatus: 'error',
          error: 'AI provider returned an empty response. Advice could not be generated.',
        });
        return;
      }

      const turnInfo = hermesMemoryService.recordUserTurn(activeUserId);

      logAdvisorTurn(aiRepo, {
        userId: activeUserId,
        memoryAllowed,
        sessionTitle: 'Career & Academic Advising',
        message: currentPrompt,
        response: orchestrated.text,
        sourceAttribution: `${orchestrated.model}+mcp`,
        latencyMs: Date.now() - startTime,
      });

      res.json({
        success: true,
        mode: 'ai_provider',
        providerStatus: 'active',
        isEstimate: true,
        persisted: memoryAllowed,
        sources: [orchestrated.model, 'cdes_embedded_mcp', ...(orchestrated.webSources.length > 0 ? ['google_search'] : [])],
        retrievedSources: orchestrated.retrievedSources,
        webSources: orchestrated.webSources,
        toolsUsed: orchestrated.toolsUsed,
        memoryUpdates: orchestrated.memoryUpdates,
        memoryStatus: {
          enabled: memoryAllowed,
          turnCounter: turnInfo.turnCounter,
          shouldNudge: turnInfo.shouldNudge,
        },
        unavailableData,
        reply: orchestrated.text,
        source: orchestrated.model,
        recommendedMajors: [],
        recommendedSkills: [],
        suggestedMentors: [],
        suggestedQuestions: [],
      });
    } catch (err: unknown) {
      sendProviderFailure(err, res);
    }
  }));

  return router;
}
