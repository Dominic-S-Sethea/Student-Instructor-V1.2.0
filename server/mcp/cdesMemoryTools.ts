import { hermesMemoryService } from '../services/hermesMemoryService';
import type { HermesDocType, HermesFactCategory, HermesFactFeedbackAction } from '../types/hermesMemoryTypes';
import type { McpToolExecutionResult } from './cdesAppTools';

function deniedPayload(reason?: string): McpToolExecutionResult {
  return {
    payload: {
      enabled: false,
      reason: reason || 'ai_memory_disabled_by_consent',
      note: 'Personalized AI advising memory is currently disabled or requires student sign-in and consent.',
    },
    citations: [],
  };
}

export function runFactStoreAdd(
  userId: string | null,
  args: {
    factText: string;
    category?: HermesFactCategory;
    entities?: string[];
    keywords?: string[];
    source?: 'explicit_user' | 'observed_pattern';
  }
): McpToolExecutionResult {
  if (!userId) return deniedPayload('authentication_required');
  const res = hermesMemoryService.addFact(userId, {
    factText: args.factText,
    category: args.category || 'preference',
    entities: args.entities,
    keywords: args.keywords,
    source: args.source || 'observed_pattern',
  });
  if (!res.enabled) return deniedPayload(res.reason);
  return {
    payload: {
      saved: Boolean(res.fact),
      deduplicated: res.deduplicated,
      fact: res.fact,
    },
    citations: res.fact
      ? [
          {
            id: `memory:${res.fact.id}`,
            title: `Saved Student Memory (${res.fact.category})`,
            category: 'Hermes Memory',
            source: res.fact.factText,
          },
        ]
      : [],
  };
}

export function runFactStoreSearch(
  userId: string | null,
  args: { query: string; category?: HermesFactCategory }
): McpToolExecutionResult {
  if (!userId) return deniedPayload('authentication_required');
  const res = hermesMemoryService.searchFacts(userId, args.query, args.category);
  if (!res.enabled) return deniedPayload(res.reason);
  return {
    payload: { count: res.facts.length, facts: res.facts },
    citations: [],
  };
}

export function runFactStoreProbe(
  userId: string | null,
  args: { entity: string }
): McpToolExecutionResult {
  if (!userId) return deniedPayload('authentication_required');
  const res = hermesMemoryService.probeEntity(userId, args.entity);
  if (!res.enabled) return deniedPayload(res.reason);
  return {
    payload: { entity: args.entity, count: res.facts.length, facts: res.facts },
    citations: [],
  };
}

export function runFactStoreReason(
  userId: string | null,
  args: { entities: string[] }
): McpToolExecutionResult {
  if (!userId) return deniedPayload('authentication_required');
  const res = hermesMemoryService.reasonEntities(userId, args.entities);
  if (!res.enabled) return deniedPayload(res.reason);
  return {
    payload: { entities: args.entities, count: res.facts.length, facts: res.facts },
    citations: [],
  };
}

export function runFactStoreFeedback(
  userId: string | null,
  args: { factId: string; action: HermesFactFeedbackAction; updatedText?: string; note?: string }
): McpToolExecutionResult {
  if (!userId) return deniedPayload('authentication_required');
  const res = hermesMemoryService.applyFactFeedback(
    userId,
    args.factId,
    args.action,
    args.updatedText,
    args.note
  );
  if (!res.enabled) return deniedPayload(res.reason);
  return {
    payload: {
      found: Boolean(res.fact),
      fact: res.fact,
      historyCount: res.history.length,
    },
    citations: res.fact
      ? [
          {
            id: `memory:${res.fact.id}`,
            title: `Updated Memory (${args.action})`,
            category: 'Hermes Memory',
            source: res.fact.factText,
          },
        ]
      : [],
  };
}

export function runMemoryDocUpdate(
  userId: string | null,
  args: { docType: HermesDocType; content: string }
): McpToolExecutionResult {
  if (!userId) return deniedPayload('authentication_required');
  const res = hermesMemoryService.updateMemoryDoc(userId, args.docType, args.content);
  if (!res.enabled) return deniedPayload(res.reason);
  return {
    payload: {
      saved: Boolean(res.doc),
      truncated: res.truncated,
      docType: args.docType,
      charCount: res.doc?.content.length || 0,
      charLimit: res.doc?.charLimit || 3000,
    },
    citations: res.doc
      ? [
          {
            id: `memory-doc:${args.docType}`,
            title: `Updated ${args.docType} Growth Profile`,
            category: 'Hermes Memory',
            source: `${res.doc.content.length}/${res.doc.charLimit} chars`,
          },
        ]
      : [],
  };
}
