import type { Response } from 'express';
import type { AIRepository } from '../repositories/aiRepository';
import type { PrivacyService } from './privacyService';
import { aiSafetyService } from './aiSafetyService';
import { hermesMemoryService } from './hermesMemoryService';
import { runGeminiMcpAdvisorTurn } from './geminiAdvisorOrchestrator';
import { buildDeterministicOfflineReply, extractExplicitMemoryRequest } from './advisorOfflineHelper';
import type { McpSourceCitation } from '../mcp/cdesAppTools';
import { safeErrorMessage } from '../utils/httpErrors';

export interface AdvisorProviderRequest {
  prompt: string;
  systemInstruction: string;
  messages: Array<{ sender: string; text: string }>;
}

export interface AdvisorProvider {
  generateReply(input: AdvisorProviderRequest): Promise<{ text: string; model: string }>;
}

export interface AdvisorTurnContext {
  aiRepo: AIRepository;
  privacyService: PrivacyService;
  activeUserId: string | null;
  userRole: string | null;
  currentPrompt: string;
  messages: Array<{ sender: string; text: string }>;
  studentProfile?: { name?: string; educationLevel?: string; favoriteSubjects?: string[]; targetMajor?: string };
  catalogTitles: string[];
  catalogCitations: McpSourceCitation[];
  unavailableData: string[];
  timeoutMs: number;
  startTime: number;
}

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number, label: string, onTimeout?: () => void): Promise<T> {
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

export function logAdvisorTurnIfConsented(
  aiRepo: AIRepository,
  privacyService: PrivacyService,
  input: {
    userId: string | null;
    sessionTitle: string;
    message: string;
    response: string;
    majors?: string[];
    skills?: string[];
    mentors?: string[];
    sourceAttribution: string;
    latencyMs: number;
  }
): boolean {
  if (!input.userId || !privacyService.canUseAIMemory(input.userId)) return false;
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
  return true;
}

export function sendProviderFailure(err: unknown, res: Response): void {
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

export function inspectAdvisorInputs(
  currentPrompt: string,
  messages: Array<{ sender: string; text: string }>,
  studentProfile?: AdvisorTurnContext['studentProfile']
) {
  const candidates: string[] = [currentPrompt];
  for (const msg of messages) {
    if (typeof msg.text === 'string' && msg.text.trim()) {
      candidates.push(msg.text);
    }
  }
  if (studentProfile) {
    if (studentProfile.name) candidates.push(studentProfile.name);
    if (studentProfile.educationLevel) candidates.push(studentProfile.educationLevel);
    if (studentProfile.targetMajor) candidates.push(studentProfile.targetMajor);
    if (Array.isArray(studentProfile.favoriteSubjects)) {
      candidates.push(...studentProfile.favoriteSubjects);
    }
  }
  for (const candidate of candidates) {
    const check = aiSafetyService.inspectInput(candidate);
    if (!check.isSafe) return check;
  }
  return { isSafe: true as const };
}

export async function handleInjectedProviderTurn(
  provider: AdvisorProvider | null,
  ctx: AdvisorTurnContext,
  res: Response
): Promise<void> {
  if (!provider) {
    ctx.unavailableData.push('external_llm_provider');
    const fallback = buildDeterministicOfflineReply(ctx.currentPrompt, ctx.catalogTitles, ctx.studentProfile);
    res.json({
      success: true,
      mode: 'deterministic_offline',
      providerStatus: 'disabled',
      isEstimate: true,
      persisted: false,
      sources: ctx.catalogTitles.length > 0 ? ['cdes_verified_scholarship_catalog', 'cdes_rule_engine'] : ['cdes_rule_engine'],
      retrievedSources: ctx.catalogCitations,
      webSources: [],
      toolsUsed: [],
      memoryUpdates: [],
      unavailableData: ctx.unavailableData,
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
      provider.generateReply({
        prompt: ctx.currentPrompt,
        systemInstruction: aiSafetyService.getPedagogicalSafetySystemPrompt(),
        messages: ctx.messages,
      }),
      ctx.timeoutMs,
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

    const sanitized = aiSafetyService.sanitizeOutput(result.text);
    const persisted = logAdvisorTurnIfConsented(ctx.aiRepo, ctx.privacyService, {
      userId: ctx.activeUserId,
      sessionTitle: 'Career & Academic Advising',
      message: ctx.currentPrompt,
      response: sanitized.sanitizedText,
      sourceAttribution: result.model,
      latencyMs: Date.now() - ctx.startTime,
    });

    res.json({
      success: true,
      mode: 'ai_provider',
      providerStatus: 'active',
      isEstimate: true,
      persisted,
      sources: [result.model, 'cdes_verified_scholarship_catalog'],
      retrievedSources: ctx.catalogCitations,
      webSources: [],
      toolsUsed: [],
      memoryUpdates: [],
      safetyFlags: sanitized.flags,
      unavailableData: ctx.unavailableData,
      reply: sanitized.sanitizedText,
      source: result.model,
      recommendedMajors: [],
      recommendedSkills: [],
      suggestedMentors: [],
      suggestedQuestions: [],
    });
  } catch (err: unknown) {
    sendProviderFailure(err, res);
  }
}

export function handleOfflineTurn(ctx: AdvisorTurnContext, res: Response): void {
  ctx.unavailableData.push('external_llm_provider');
  const memoryAllowed = Boolean(ctx.activeUserId && ctx.privacyService.canUseAIMemory(ctx.activeUserId));
  const memoryUpdates: string[] = [];
  let explicitSavedFact: string | null = null;
  const explicitRequest = extractExplicitMemoryRequest(ctx.currentPrompt);
  if (explicitRequest && memoryAllowed && ctx.activeUserId) {
    const added = hermesMemoryService.addFact(ctx.activeUserId, {
      factText: explicitRequest,
      category: 'preference',
      source: 'explicit_user',
    });
    if (added.enabled && added.fact) {
      explicitSavedFact = added.fact.factText;
      memoryUpdates.push(`fact_store_add: ${added.fact.factText}`);
    }
  }

  const turnInfo = hermesMemoryService.recordUserTurn(ctx.activeUserId);
  const fallback = buildDeterministicOfflineReply(
    ctx.currentPrompt,
    ctx.catalogTitles,
    ctx.studentProfile,
    explicitSavedFact
  );

  const persisted = logAdvisorTurnIfConsented(ctx.aiRepo, ctx.privacyService, {
    userId: ctx.activeUserId,
    sessionTitle: 'Career & Academic Advising (Offline)',
    message: ctx.currentPrompt,
    response: fallback.reply,
    majors: fallback.recommendedMajors,
    skills: fallback.recommendedSkills,
    mentors: fallback.suggestedMentors,
    sourceAttribution: 'deterministic_offline',
    latencyMs: Date.now() - ctx.startTime,
  });

  res.json({
    success: true,
    mode: 'deterministic_offline',
    providerStatus: 'disabled',
    isEstimate: true,
    persisted,
    sources: ctx.catalogTitles.length > 0 ? ['cdes_verified_scholarship_catalog', 'cdes_rule_engine'] : ['cdes_rule_engine'],
    retrievedSources: ctx.catalogCitations,
    webSources: [],
    toolsUsed: explicitSavedFact ? ['fact_store_add'] : [],
    memoryUpdates,
    memoryStatus: {
      enabled: persisted,
      turnCounter: turnInfo.turnCounter,
      shouldNudge: turnInfo.shouldNudge,
    },
    unavailableData: ctx.unavailableData,
    reply: fallback.reply,
    source: 'deterministic_offline',
    recommendedMajors: fallback.recommendedMajors,
    recommendedSkills: fallback.recommendedSkills,
    suggestedMentors: fallback.suggestedMentors,
    suggestedQuestions: fallback.suggestedQuestions,
  });
}

export async function handleLiveGeminiTurn(apiKey: string, ctx: AdvisorTurnContext, res: Response): Promise<void> {
  try {
    const abortController = new AbortController();
    const orchestrated = await withTimeout(
      runGeminiMcpAdvisorTurn({
        userId: ctx.activeUserId,
        userRole: ctx.userRole,
        prompt: ctx.currentPrompt,
        messages: ctx.messages,
        studentProfile: ctx.studentProfile,
        apiKey,
        signal: abortController.signal,
      }),
      ctx.timeoutMs,
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

    const turnInfo = hermesMemoryService.recordUserTurn(ctx.activeUserId);
    const persisted = logAdvisorTurnIfConsented(ctx.aiRepo, ctx.privacyService, {
      userId: ctx.activeUserId,
      sessionTitle: 'Career & Academic Advising',
      message: ctx.currentPrompt,
      response: orchestrated.text,
      sourceAttribution: `${orchestrated.model}+mcp`,
      latencyMs: Date.now() - ctx.startTime,
    });

    res.json({
      success: true,
      mode: 'ai_provider',
      providerStatus: 'active',
      isEstimate: true,
      persisted,
      sources: [
        orchestrated.model,
        'cdes_embedded_mcp',
        ...(orchestrated.webSources.length > 0 ? ['google_search'] : []),
      ],
      retrievedSources: orchestrated.retrievedSources,
      webSources: orchestrated.webSources,
      toolsUsed: orchestrated.toolsUsed,
      memoryUpdates: orchestrated.memoryUpdates,
      safetyFlags: orchestrated.safetyFlags,
      memoryStatus: {
        enabled: persisted,
        turnCounter: turnInfo.turnCounter,
        shouldNudge: turnInfo.shouldNudge,
      },
      unavailableData: ctx.unavailableData,
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
}
