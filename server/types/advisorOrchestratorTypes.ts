import type { ScopedMcpContext, ScopedMcpSession } from '../mcp/cdesMcpServer';
import type { McpSourceCitation } from '../mcp/cdesAppTools';

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
