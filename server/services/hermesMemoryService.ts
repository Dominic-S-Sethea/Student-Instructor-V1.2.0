import { withTransaction } from '../db/connection';
import { HermesMemoryRepository } from '../repositories/hermesMemoryRepository';
import { PrivacyService } from './privacyService';
import {
  consolidateTextToLimit,
  expandAliases,
  extractAutoEntitiesAndKeywords,
  normalizeTokens,
  sanitizeMemoryDocText,
  sanitizeMemoryText,
} from './hermesMemoryHelpers';
import type {
  HermesDocType,
  HermesFactCategory,
  HermesFactFeedbackAction,
  HermesFactHistoryEntry,
  HermesFactSource,
  HermesMemoryDoc,
  HermesMemoryFact,
  HermesMemorySnapshot,
  HermesPromptInjectionBundle,
} from '../types/hermesMemoryTypes';

const DEFAULT_USER_LIMIT = 3000;
const DEFAULT_MEMORY_LIMIT = 10000;
const MAX_ACTIVE_FACTS_PER_USER = 200;
const MAX_FEEDBACK_NOTE_LEN = 300;

export class HermesMemoryService {
  private repo: HermesMemoryRepository;
  private privacyService: PrivacyService;

  constructor(repo?: HermesMemoryRepository, privacyService?: PrivacyService) {
    this.repo = repo || new HermesMemoryRepository();
    this.privacyService = privacyService || new PrivacyService();
  }

  private assertMemoryAllowed(userId?: string | null): { allowed: boolean; reason?: string } {
    if (!userId) return { allowed: false, reason: 'authentication_required' };
    if (!this.privacyService.canUseAIMemory(userId)) return { allowed: false, reason: 'ai_memory_disabled_by_consent' };
    return { allowed: true };
  }

  private ensureInitializedDocs(userId: string): { userDoc: HermesMemoryDoc; memoryDoc: HermesMemoryDoc } {
    const userDoc = this.repo.getDoc(userId, 'USER') || this.repo.upsertDoc(userId, 'USER', '', DEFAULT_USER_LIMIT);
    const memoryDoc = this.repo.getDoc(userId, 'MEMORY') || this.repo.upsertDoc(userId, 'MEMORY', '', DEFAULT_MEMORY_LIMIT);
    return { userDoc, memoryDoc };
  }

  public getMemorySnapshot(userId?: string | null, includeInactive: boolean = false): HermesMemorySnapshot {
    const check = this.assertMemoryAllowed(userId);
    if (!check.allowed || !userId) {
      return {
        enabled: false,
        reason: check.reason,
        userDoc: null,
        memoryDoc: null,
        facts: [],
        turnCounter: 0,
        nudgeInterval: 10,
      };
    }

    const { userDoc, memoryDoc } = this.ensureInitializedDocs(userId);
    const facts = this.repo.listFacts(userId, includeInactive);
    return {
      enabled: true,
      userDoc,
      memoryDoc,
      facts,
      turnCounter: userDoc.turnCounter,
      nudgeInterval: userDoc.nudgeInterval,
    };
  }

  public getPromptInjectionBundle(userId?: string | null): HermesPromptInjectionBundle {
    const check = this.assertMemoryAllowed(userId);
    if (!check.allowed || !userId) {
      return {
        enabled: false,
        reason: check.reason,
        userDoc: null,
        memoryDoc: null,
        topFacts: [],
        turnCounter: 0,
        nudgeInterval: 10,
        shouldNudge: false,
      };
    }

    const { userDoc, memoryDoc } = this.ensureInitializedDocs(userId);
    const topFacts = this.repo.listFacts(userId, false).slice(0, 12);
    const shouldNudge =
      userDoc.turnCounter > 0 && userDoc.turnCounter % Math.max(1, userDoc.nudgeInterval) === 0;

    return {
      enabled: true,
      userDoc,
      memoryDoc,
      topFacts,
      turnCounter: userDoc.turnCounter,
      nudgeInterval: userDoc.nudgeInterval,
      shouldNudge,
    };
  }

  public recordUserTurn(userId?: string | null): { recorded: boolean; turnCounter: number; shouldNudge: boolean } {
    const check = this.assertMemoryAllowed(userId);
    if (!check.allowed || !userId) {
      return { recorded: false, turnCounter: 0, shouldNudge: false };
    }
    this.ensureInitializedDocs(userId);
    const { turnCounter, nudgeInterval } = this.repo.incrementTurnCounter(userId);
    const shouldNudge = turnCounter > 0 && turnCounter % Math.max(1, nudgeInterval) === 0;
    return { recorded: true, turnCounter, shouldNudge };
  }

  public updateMemoryDoc(
    userId: string,
    docType: HermesDocType,
    content: string
  ): { enabled: boolean; reason?: string; doc: HermesMemoryDoc | null; truncated: boolean } {
    const check = this.assertMemoryAllowed(userId);
    if (!check.allowed) {
      return { enabled: false, reason: check.reason, doc: null, truncated: false };
    }

    const limit = docType === 'USER' ? DEFAULT_USER_LIMIT : DEFAULT_MEMORY_LIMIT;
    const sanitized = sanitizeMemoryDocText(content);
    const consolidated = consolidateTextToLimit(sanitized, limit);
    const truncated = consolidated.length < sanitized.length;
    const doc = this.repo.upsertDoc(userId, docType, consolidated, limit, {
      markConsolidated: true,
    });
    return { enabled: true, doc, truncated };
  }

  public addFact(
    userId: string,
    input: {
      factText: string;
      category?: HermesFactCategory;
      entities?: string[];
      keywords?: string[];
      source?: HermesFactSource;
    }
  ): { enabled: boolean; reason?: string; fact: HermesMemoryFact | null; deduplicated: boolean } {
    const check = this.assertMemoryAllowed(userId);
    if (!check.allowed) {
      return { enabled: false, reason: check.reason, fact: null, deduplicated: false };
    }

    const cleanedText = sanitizeMemoryText(input.factText).slice(0, 400);
    if (!cleanedText) {
      return { enabled: true, fact: null, deduplicated: false };
    }

    return withTransaction(() => {
      const match = this.repo.findActiveFactByNormalizedText(userId, cleanedText);
      if (match) {
        const nextTrust = Math.min(1, Number((match.trustScore + 0.08).toFixed(2)));
        const updated = this.repo.updateFact(userId, match.id, {
          trustScore: nextTrust,
          confirmations: match.confirmations + 1,
        });
        this.repo.insertHistory({
          factId: match.id,
          userId,
          action: 'confirm',
          beforeText: match.factText,
          afterText: match.factText,
          beforeTrust: match.trustScore,
          afterTrust: nextTrust,
          note: 'Reinforced duplicate fact observation',
        });
        return { enabled: true, fact: updated, deduplicated: true };
      }

      const category: HermesFactCategory = input.category || 'preference';
      const source: HermesFactSource = input.source || 'explicit_user';
      const { entities, keywords } = extractAutoEntitiesAndKeywords(
        cleanedText,
        input.entities,
        input.keywords
      );
      const initialTrust = source === 'explicit_user' ? 0.9 : 0.72;

      const created = this.repo.insertFact({
        userId,
        category,
        factText: cleanedText,
        entities,
        keywords,
        trustScore: initialTrust,
        confirmations: 1,
        source,
      });

      this.repo.insertHistory({
        factId: created.id,
        userId,
        action: 'add',
        beforeText: null,
        afterText: created.factText,
        beforeTrust: null,
        afterTrust: created.trustScore,
        note: `Source: ${source}`,
      });

      this.repo.enforceActiveFactCap(userId, MAX_ACTIVE_FACTS_PER_USER);
      return { enabled: true, fact: created, deduplicated: false };
    });
  }

  public searchFacts(
    userId: string,
    query: string,
    category?: HermesFactCategory
  ): { enabled: boolean; reason?: string; facts: HermesMemoryFact[] } {
    const check = this.assertMemoryAllowed(userId);
    if (!check.allowed) {
      return { enabled: false, reason: check.reason, facts: [] };
    }

    const all = this.repo.listFacts(userId, false).filter((f) => !category || f.category === category);
    const q = query.trim().toLowerCase();
    if (!q) {
      return { enabled: true, facts: all.slice(0, 15) };
    }

    const queryAliases = expandAliases(q);
    const tokens = normalizeTokens(q);
    const scored = all
      .map((fact) => {
        const hay = `${fact.factText} ${fact.entities.join(' ')} ${fact.keywords.join(' ')}`.toLowerCase();
        let score = 0;
        if (hay.includes(q)) score += 3;
        for (const alias of queryAliases) {
          if (hay.includes(alias)) score += 1.5;
        }
        for (const tok of tokens) {
          if (hay.includes(tok)) score += 1;
        }
        return { fact, score: score * fact.trustScore };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return { enabled: true, facts: scored.map((s) => s.fact).slice(0, 15) };
  }

  public probeEntity(userId: string, entity: string): { enabled: boolean; reason?: string; facts: HermesMemoryFact[] } {
    return this.searchFacts(userId, entity);
  }

  public reasonEntities(
    userId: string,
    entities: string[]
  ): { enabled: boolean; reason?: string; facts: HermesMemoryFact[] } {
    const check = this.assertMemoryAllowed(userId);
    if (!check.allowed) {
      return { enabled: false, reason: check.reason, facts: [] };
    }
    const cleanEntities = entities.map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (cleanEntities.length === 0) {
      return { enabled: true, facts: this.repo.listFacts(userId, false).slice(0, 10) };
    }

    const expandedSets = cleanEntities.map((e) => expandAliases(e));
    const matches = this.repo.listFacts(userId, false).filter((fact) => {
      const hay = `${fact.factText} ${fact.entities.join(' ')} ${fact.keywords.join(' ')}`.toLowerCase();
      return expandedSets.every((aliases) => aliases.some((a) => hay.includes(a)));
    });

    return { enabled: true, facts: matches.slice(0, 15) };
  }

  public applyFactFeedback(
    userId: string,
    factId: string,
    action: HermesFactFeedbackAction,
    updatedText?: string,
    note?: string
  ): { enabled: boolean; reason?: string; fact: HermesMemoryFact | null; history: HermesFactHistoryEntry[] } {
    const check = this.assertMemoryAllowed(userId);
    if (!check.allowed) {
      return { enabled: false, reason: check.reason, fact: null, history: [] };
    }

    const safeNote = typeof note === 'string' && note.trim()
      ? sanitizeMemoryText(note).slice(0, MAX_FEEDBACK_NOTE_LEN)
      : undefined;

    return withTransaction(() => {
      const existing = this.repo.getFactById(userId, factId);
      if (!existing) {
        return { enabled: true, fact: null, history: [] };
      }

      let next: HermesMemoryFact | null = existing;
      if (action === 'confirm') {
        const nextTrust = Math.min(1, Number((existing.trustScore + 0.1).toFixed(2)));
        next = this.repo.updateFact(userId, factId, {
          trustScore: nextTrust,
          confirmations: existing.confirmations + 1,
          status: 'active',
        });
        this.repo.insertHistory({
          factId, userId, action: 'confirm',
          beforeText: existing.factText, afterText: existing.factText,
          beforeTrust: existing.trustScore, afterTrust: nextTrust,
          note: safeNote || 'Confirmed',
        });
      } else if (action === 'correct') {
        const sanitizedNext = sanitizeMemoryText(updatedText || existing.factText).slice(0, 400);
        const { entities, keywords } = extractAutoEntitiesAndKeywords(sanitizedNext);
        const nextTrust = Math.max(0.5, existing.trustScore);
        next = this.repo.updateFact(userId, factId, {
          previousFactText: existing.factText,
          factText: sanitizedNext,
          entities,
          keywords,
          trustScore: nextTrust,
          status: 'active',
        });
        this.repo.insertHistory({
          factId, userId, action: 'correct',
          beforeText: existing.factText, afterText: sanitizedNext,
          beforeTrust: existing.trustScore, afterTrust: nextTrust,
          note: safeNote || 'Corrected by student or advisor',
        });
      } else if (action === 'end') {
        const nextTrust = Math.max(0.1, Number((existing.trustScore - 0.35).toFixed(2)));
        next = this.repo.updateFact(userId, factId, { status: 'ended', trustScore: nextTrust });
        this.repo.insertHistory({
          factId, userId, action: 'end',
          beforeText: existing.factText, afterText: existing.factText,
          beforeTrust: existing.trustScore, afterTrust: nextTrust,
          note: safeNote || 'Marked as no longer active',
        });
      } else if (action === 'revert') {
        const restoredText = existing.previousFactText || existing.factText;
        const { entities, keywords } = extractAutoEntitiesAndKeywords(restoredText);
        const nextTrust = 0.75;
        next = this.repo.updateFact(userId, factId, {
          factText: restoredText,
          previousFactText: existing.factText,
          entities,
          keywords,
          status: existing.status === 'ended' ? 'active' : existing.status,
          trustScore: nextTrust,
        });
        this.repo.insertHistory({
          factId, userId, action: 'revert',
          beforeText: existing.factText, afterText: restoredText,
          beforeTrust: existing.trustScore, afterTrust: nextTrust,
          note: safeNote || 'Reverted to previous fact',
        });
      }

      return {
        enabled: true,
        fact: next,
        history: this.repo.getFactHistory(userId, factId),
      };
    });
  }

  public getFactHistory(userId: string, factId: string): HermesFactHistoryEntry[] {
    return this.assertMemoryAllowed(userId).allowed ? this.repo.getFactHistory(userId, factId) : [];
  }

  public getFactHistoryWithStatus(
    userId: string,
    factId: string
  ): { enabled: boolean; reason?: string; history: HermesFactHistoryEntry[] } {
    const check = this.assertMemoryAllowed(userId);
    if (!check.allowed) {
      return { enabled: false, reason: check.reason, history: [] };
    }
    return { enabled: true, history: this.repo.getFactHistory(userId, factId) };
  }

  public clearAllMemory(userId: string): { cleared: boolean } {
    if (!userId) return { cleared: false };
    this.repo.clearAllForUser(userId);
    return { cleared: true };
  }
}

export const hermesMemoryService = new HermesMemoryService();
