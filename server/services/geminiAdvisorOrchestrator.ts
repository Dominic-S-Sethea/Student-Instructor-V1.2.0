import { GoogleGenAI } from '@google/genai';
import { createScopedMcpSession, type ScopedMcpContext, type ScopedMcpSession } from '../mcp/cdesMcpServer';
import type { McpSourceCitation } from '../mcp/cdesAppTools';
import { hermesMemoryService } from './hermesMemoryService';
import { aiSafetyService } from './aiSafetyService';

export interface WebSearchCitation {
  title: string;
  url: string;
}

export interface AdvisorInteractionFunctionCall {
  type: 'function_call';
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface AdvisorInteractionTextBlock {
  type: string;
  text?: string;
  annotations?: Array<{
    type?: string;
    title?: string;
    url?: string;
  }>;
}

export interface AdvisorInteractionStep {
  type: string;
  id?: string;
  name?: string;
  arguments?: Record<string, unknown>;
  content?: AdvisorInteractionTextBlock[];
  result?: Array<{ search_suggestions?: string }>;
}

export interface AdvisorInteractionResponse {
  id: string;
  output_text?: string;
  steps?: AdvisorInteractionStep[];
}

export interface AdvisorInteractionRequest {
  model: string;
  system_instruction?: string;
  input?:
    | string
    | Array<{
        type: 'function_result';
        call_id: string;
        name?: string;
        result: string;
        is_error?: boolean;
      }>;
  previous_interaction_id?: string;
  tools?: Array<
    | {
        type: 'function';
        name: string;
        description?: string;
        parameters?: Record<string, unknown>;
      }
    | {
        type: 'google_search';
      }
  >;
  generation_config?: {
    thinking_level?: 'minimal' | 'low' | 'medium' | 'high';
    max_output_tokens?: number;
  };
}

export interface AdvisorInteractionRunner {
  create(params: AdvisorInteractionRequest): Promise<AdvisorInteractionResponse>;
}

export interface GeminiMcpAdvisorInput {
  userId: string | null;
  userRole: string | null;
  prompt: string;
  messages: Array<{ sender: string; text: string }>;
  studentProfile?: {
    name?: string;
    educationLevel?: string;
    favoriteSubjects?: string[];
    targetMajor?: string;
  };
  apiKey?: string;
  model?: string;
  interactionRunner?: AdvisorInteractionRunner;
  sessionFactory?: (ctx: ScopedMcpContext) => Promise<ScopedMcpSession>;
  signal?: AbortSignal;
}

export interface GeminiMcpAdvisorResult {
  text: string;
  model: string;
  retrievedSources: McpSourceCitation[];
  webSources: WebSearchCitation[];
  toolsUsed: string[];
  memoryUpdates: string[];
  safetyFlags: string[];
}

const MAX_TOOL_ROUNDS = 4;

const MEMORY_MUTATING_TOOLS = new Set([
  'fact_store_add',
  'fact_store_feedback',
  'memory_doc_update',
]);

function buildAdvisorSystemInstruction(
  userId: string | null,
  studentProfile?: GeminiMcpAdvisorInput['studentProfile']
): string {
  const parts: string[] = [
    aiSafetyService.getPedagogicalSafetySystemPrompt(),
    [
      'You are the CDES Study Advisor on Student Instructor (Cambodia & Global Higher Education).',
      'Use embedded MCP tools (`search_scholarships`, `get_scholarship_detail`, `search_top_global_universities`, `get_top_global_university_detail`, `search_cambodian_universities`, `evaluate_major_fit`, `search_learning_and_knowledge`, `search_community_and_events`, `get_my_study_profile`) for verified platform records.',
      'Use `google_search` when external academic references, current application deadlines, or broader study explanations enrich the student’s question.',
      'Never invent tuition amounts, stipend figures, deadlines, accreditation, or user records; state explicitly if a detail is unavailable.',
    ].join(' '),
  ];

  if (studentProfile) {
    const profileLine = [
      studentProfile.name ? `Name: ${studentProfile.name}` : null,
      studentProfile.educationLevel ? `Level: ${studentProfile.educationLevel}` : null,
      studentProfile.targetMajor ? `Target Major: ${studentProfile.targetMajor}` : null,
      studentProfile.favoriteSubjects?.length
        ? `Subjects: ${studentProfile.favoriteSubjects.join(', ')}`
        : null,
    ]
      .filter(Boolean)
      .join(' | ');
    if (profileLine) {
      parts.push(`[REQUEST PROFILE CONTEXT]: ${profileLine}`);
    }
  }

  const bundle = hermesMemoryService.getPromptInjectionBundle(userId);
  if (bundle.enabled) {
    if (bundle.userDoc?.content) {
      parts.push(`[HERMES USER PROFILE (USER.md)]:\n${bundle.userDoc.content}`);
    }
    if (bundle.memoryDoc?.content) {
      parts.push(`[HERMES AGENT NOTES (MEMORY.md)]:\n${bundle.memoryDoc.content}`);
    }
    if (bundle.topFacts.length > 0) {
      const factLines = bundle.topFacts
        .map(
          (f) =>
            `- [${f.category} | trust=${f.trustScore.toFixed(2)} | id=${f.id}] ${f.factText}`
        )
        .join('\n');
      parts.push(`[RECALLED STUDENT FACTS]:\n${factLines}`);
    }
    parts.push(
      '[HERMES MEMORY TOOLS]: When the student explicitly states preferences, goals, strengths, target universities, or study habits—or corrects an earlier assumption—call `fact_store_add` or `fact_store_feedback` (only use `fact_store_feedback` with known fact IDs).'
    );
    if (bundle.shouldNudge) {
      parts.push(
        `[MEMORY NUDGE]: Turn #${bundle.turnCounter} reached (interval=${bundle.nudgeInterval}). Consolidate important recurring patterns into USER/MEMORY or fact_store if warranted.`
      );
    }
  } else {
    parts.push(
      '[HERMES MEMORY STATUS]: Persistent student memory is disabled (guest or consent not granted). Do not call memory mutation tools.'
    );
  }

  return parts.join('\n\n');
}

function formatConversationPrompt(
  prompt: string,
  messages: Array<{ sender: string; text: string }>
): string {
  const recent = messages.slice(-8);
  if (recent.length === 0) {
    return prompt;
  }
  const transcript = recent
    .map((m) => `${m.sender === 'user' || m.sender === 'student' ? 'Student' : 'Advisor'}: ${m.text || ''}`)
    .join('\n');
  return `Recent conversation:\n${transcript}\n\nLatest student message:\n${prompt}`;
}

function collectCitationsAndText(
  response: AdvisorInteractionResponse,
  webSourcesMap: Map<string, WebSearchCitation>
): { functionCalls: AdvisorInteractionFunctionCall[]; text: string } {
  const functionCalls: AdvisorInteractionFunctionCall[] = [];
  const textFragments: string[] = [];

  for (const step of response.steps || []) {
    if (step.type === 'function_call' && step.id && step.name) {
      functionCalls.push({
        type: 'function_call',
        id: step.id,
        name: step.name,
        arguments: step.arguments || {},
      });
    } else if (step.type === 'model_output' && Array.isArray(step.content)) {
      for (const block of step.content) {
        if (typeof block.text === 'string' && block.text.trim()) {
          textFragments.push(block.text);
        }
        for (const ann of block.annotations || []) {
          if (ann.type === 'url_citation' && ann.url) {
            webSourcesMap.set(ann.url, {
              title: ann.title || ann.url,
              url: ann.url,
            });
          }
        }
      }
    }
  }

  const finalText = (response.output_text || textFragments.join('\n')).trim();
  return { functionCalls, text: finalText };
}

function createDefaultRunner(apiKey: string): AdvisorInteractionRunner {
  const client = new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: { 'User-Agent': 'cdes-platform' },
      timeout: 12000,
    },
  });

  return {
    create: async (params: AdvisorInteractionRequest): Promise<AdvisorInteractionResponse> => {
      const response = await client.interactions.create({
        ...params,
        stream: false,
      });
      return {
        id: response.id,
        output_text: response.output_text,
        steps: response.steps as AdvisorInteractionStep[] | undefined,
      };
    },
  };
}

/**
 * Runs a single Study Advisor turn with Gemini 4 Interactions API, embedded MCP tools,
 * Google Search grounding, and consent-enforced Hermes memory injection.
 */
export async function runGeminiMcpAdvisorTurn(
  input: GeminiMcpAdvisorInput
): Promise<GeminiMcpAdvisorResult> {
  const model = input.model || process.env.GEMINI_MODEL || 'gemini-4-hydrogen';
  const runner = input.interactionRunner || createDefaultRunner(input.apiKey || process.env.GEMINI_API_KEY || '');
  const session = await (input.sessionFactory || createScopedMcpSession)({
    userId: input.userId,
    userRole: input.userRole,
  });

  const retrievedMap = new Map<string, McpSourceCitation>();
  const webSourcesMap = new Map<string, WebSearchCitation>();
  const toolsUsed = new Set<string>();
  const memoryUpdates: string[] = [];

  try {
    const mcpTools = await session.listTools();
    const tools: NonNullable<AdvisorInteractionRequest['tools']> = [
      ...mcpTools.map((t) => ({
        type: 'function' as const,
        name: t.name,
        description: t.description,
        parameters: t.inputSchema,
      })),
      { type: 'google_search' as const },
    ];

    const systemInstruction = buildAdvisorSystemInstruction(input.userId, input.studentProfile);
    if (input.signal?.aborted) {
      throw new Error('Advisor turn aborted due to timeout');
    }
    let currentResponse = await runner.create({
      model,
      system_instruction: systemInstruction,
      input: formatConversationPrompt(input.prompt, input.messages),
      tools,
      generation_config: {
        thinking_level: 'low',
        max_output_tokens: 1400,
      },
    });

    let extracted = collectCitationsAndText(currentResponse, webSourcesMap);

    for (let round = 0; round < MAX_TOOL_ROUNDS && extracted.functionCalls.length > 0; round++) {
      if (input.signal?.aborted) {
        throw new Error('Advisor turn aborted due to timeout');
      }
      const functionResults: Array<{
        type: 'function_result';
        call_id: string;
        name: string;
        result: string;
        is_error?: boolean;
      }> = [];

      for (const call of extracted.functionCalls) {
        if (input.signal?.aborted) {
          throw new Error('Advisor turn aborted due to timeout');
        }
        toolsUsed.add(call.name);
        try {
          const toolOut = await session.callTool(call.name, call.arguments);
          for (const citation of toolOut.citations) {
            retrievedMap.set(`${citation.category}:${citation.id}`, citation);
          }
          if (MEMORY_MUTATING_TOOLS.has(call.name)) {
            const payload = toolOut.payload as { enabled?: boolean; fact?: { factText?: string }; updated?: string } | null;
            if (payload && payload.enabled !== false) {
              const summary = payload.fact?.factText || payload.updated || call.name;
              memoryUpdates.push(`${call.name}: ${summary}`);
            }
          }
          functionResults.push({
            type: 'function_result',
            call_id: call.id,
            name: call.name,
            result: JSON.stringify(toolOut.payload),
          });
        } catch (err: unknown) {
          functionResults.push({
            type: 'function_result',
            call_id: call.id,
            name: call.name,
            result: JSON.stringify({
              error: err instanceof Error ? err.message : 'Tool execution error',
            }),
            is_error: true,
          });
        }
      }

      if (input.signal?.aborted) {
        throw new Error('Advisor turn aborted due to timeout');
      }
      currentResponse = await runner.create({
        model,
        system_instruction: systemInstruction,
        previous_interaction_id: currentResponse.id,
        input: functionResults,
        tools,
        generation_config: {
          thinking_level: 'low',
          max_output_tokens: 1400,
        },
      });
      extracted = collectCitationsAndText(currentResponse, webSourcesMap);
    }

    const sanitized = aiSafetyService.sanitizeOutput(extracted.text);
    return {
      text: sanitized.sanitizedText,
      model,
      retrievedSources: Array.from(retrievedMap.values()),
      webSources: Array.from(webSourcesMap.values()),
      toolsUsed: Array.from(toolsUsed),
      memoryUpdates,
      safetyFlags: sanitized.flags,
    };
  } finally {
    await session.close();
  }
}
