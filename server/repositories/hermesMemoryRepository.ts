import crypto from 'node:crypto';
import { getDatabase, withTransaction } from '../db/connection';
import type {
  HermesDocType,
  HermesFactCategory,
  HermesFactHistoryEntry,
  HermesFactSource,
  HermesFactStatus,
  HermesHistoryAction,
  HermesMemoryDoc,
  HermesMemoryFact,
} from '../types/hermesMemoryTypes';

interface DocRow {
  id: string;
  user_id: string;
  doc_type: HermesDocType;
  content: string;
  char_limit: number;
  turn_counter: number;
  nudge_interval: number;
  last_consolidated_at: string | null;
  updated_at: string;
}

interface FactRow {
  id: string;
  user_id: string;
  category: HermesFactCategory;
  fact_text: string;
  entities_json: string;
  keywords_json: string;
  trust_score: number;
  confirmations: number;
  status: HermesFactStatus;
  source: HermesFactSource;
  previous_fact_text: string | null;
  created_at: string;
  updated_at: string;
}

interface HistoryRow {
  id: string;
  fact_id: string;
  user_id: string;
  action: HermesHistoryAction;
  before_text: string | null;
  after_text: string | null;
  before_trust: number | null;
  after_trust: number | null;
  note: string | null;
  created_at: string;
}

function parseStringArray(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function mapDoc(row: DocRow): HermesMemoryDoc {
  return {
    id: row.id,
    userId: row.user_id,
    docType: row.doc_type,
    content: row.content || '',
    charLimit: Number(row.char_limit) || (row.doc_type === 'USER' ? 3000 : 10000),
    turnCounter: Number(row.turn_counter) || 0,
    nudgeInterval: Number(row.nudge_interval) || 10,
    lastConsolidatedAt: row.last_consolidated_at || null,
    updatedAt: row.updated_at,
  };
}

function mapFact(row: FactRow): HermesMemoryFact {
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category,
    factText: row.fact_text,
    entities: parseStringArray(row.entities_json),
    keywords: parseStringArray(row.keywords_json),
    trustScore: Number(row.trust_score),
    confirmations: Number(row.confirmations),
    status: row.status,
    source: row.source,
    previousFactText: row.previous_fact_text || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapHistory(row: HistoryRow): HermesFactHistoryEntry {
  return {
    id: row.id,
    factId: row.fact_id,
    userId: row.user_id,
    action: row.action,
    beforeText: row.before_text || null,
    afterText: row.after_text || null,
    beforeTrust: row.before_trust !== null ? Number(row.before_trust) : null,
    afterTrust: row.after_trust !== null ? Number(row.after_trust) : null,
    note: row.note || null,
    createdAt: row.created_at,
  };
}

export class HermesMemoryRepository {
  private get db() {
    return getDatabase();
  }

  public getDoc(userId: string, docType: HermesDocType): HermesMemoryDoc | null {
    const row = this.db
      .prepare('SELECT * FROM hermes_student_memory_docs WHERE user_id = ? AND doc_type = ?')
      .get(userId, docType) as unknown as DocRow | undefined;
    return row ? mapDoc(row) : null;
  }

  public upsertDoc(
    userId: string,
    docType: HermesDocType,
    content: string,
    charLimit: number,
    options?: { turnCounter?: number; nudgeInterval?: number; markConsolidated?: boolean }
  ): HermesMemoryDoc {
    const existing = this.getDoc(userId, docType);
    const now = new Date().toISOString();
    const id = existing?.id || `hdoc-${crypto.randomUUID()}`;
    const turnCounter = options?.turnCounter ?? existing?.turnCounter ?? 0;
    const nudgeInterval = options?.nudgeInterval ?? existing?.nudgeInterval ?? 10;
    const lastConsolidatedAt = options?.markConsolidated
      ? now
      : existing?.lastConsolidatedAt || null;

    this.db
      .prepare(
        `INSERT INTO hermes_student_memory_docs (
          id, user_id, doc_type, content, char_limit, turn_counter, nudge_interval, last_consolidated_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, doc_type) DO UPDATE SET
          content = excluded.content,
          char_limit = excluded.char_limit,
          turn_counter = excluded.turn_counter,
          nudge_interval = excluded.nudge_interval,
          last_consolidated_at = excluded.last_consolidated_at,
          updated_at = excluded.updated_at`
      )
      .run(
        id,
        userId,
        docType,
        content,
        charLimit,
        turnCounter,
        nudgeInterval,
        lastConsolidatedAt,
        now
      );

    return this.getDoc(userId, docType)!;
  }

  public incrementTurnCounter(userId: string): { turnCounter: number; nudgeInterval: number } {
    const existingUserDoc = this.getDoc(userId, 'USER');
    const nextTurns = (existingUserDoc?.turnCounter ?? 0) + 1;
    const nudgeInterval = existingUserDoc?.nudgeInterval ?? 10;
    const updated = this.upsertDoc(
      userId,
      'USER',
      existingUserDoc?.content || '',
      existingUserDoc?.charLimit || 3000,
      { turnCounter: nextTurns, nudgeInterval }
    );
    return { turnCounter: updated.turnCounter, nudgeInterval: updated.nudgeInterval };
  }

  public listFacts(userId: string, includeInactive: boolean = false, limit: number = 200): HermesMemoryFact[] {
    const sql = includeInactive
      ? 'SELECT * FROM hermes_memory_facts WHERE user_id = ? ORDER BY trust_score DESC, updated_at DESC LIMIT ?'
      : "SELECT * FROM hermes_memory_facts WHERE user_id = ? AND status = 'active' ORDER BY trust_score DESC, updated_at DESC LIMIT ?";
    const rows = this.db.prepare(sql).all(userId, limit) as unknown as FactRow[];
    return rows.map(mapFact);
  }

  public getFactById(userId: string, factId: string): HermesMemoryFact | null {
    const row = this.db
      .prepare('SELECT * FROM hermes_memory_facts WHERE id = ? AND user_id = ?')
      .get(factId, userId) as unknown as FactRow | undefined;
    return row ? mapFact(row) : null;
  }

  public insertFact(input: {
    userId: string;
    category: HermesFactCategory;
    factText: string;
    entities: string[];
    keywords: string[];
    trustScore: number;
    confirmations: number;
    source: HermesFactSource;
  }): HermesMemoryFact {
    const id = `hfact-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    this.db
      .prepare(
        `INSERT INTO hermes_memory_facts (
          id, user_id, category, fact_text, entities_json, keywords_json,
          trust_score, confirmations, status, source, previous_fact_text, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, NULL, ?, ?)`
      )
      .run(
        id,
        input.userId,
        input.category,
        input.factText,
        JSON.stringify(input.entities),
        JSON.stringify(input.keywords),
        input.trustScore,
        input.confirmations,
        input.source,
        now,
        now
      );
    return this.getFactById(input.userId, id)!;
  }

  public updateFact(
    userId: string,
    factId: string,
    patch: {
      factText?: string;
      entities?: string[];
      keywords?: string[];
      trustScore?: number;
      confirmations?: number;
      status?: HermesFactStatus;
      previousFactText?: string | null;
    }
  ): HermesMemoryFact | null {
    const existing = this.getFactById(userId, factId);
    if (!existing) return null;
    const now = new Date().toISOString();
    this.db
      .prepare(
        `UPDATE hermes_memory_facts SET
          fact_text = ?,
          entities_json = ?,
          keywords_json = ?,
          trust_score = ?,
          confirmations = ?,
          status = ?,
          previous_fact_text = ?,
          updated_at = ?
        WHERE id = ? AND user_id = ?`
      )
      .run(
        patch.factText ?? existing.factText,
        JSON.stringify(patch.entities ?? existing.entities),
        JSON.stringify(patch.keywords ?? existing.keywords),
        patch.trustScore ?? existing.trustScore,
        patch.confirmations ?? existing.confirmations,
        patch.status ?? existing.status,
        patch.previousFactText !== undefined ? patch.previousFactText : existing.previousFactText,
        now,
        factId,
        userId
      );
    return this.getFactById(userId, factId);
  }

  public insertHistory(entry: {
    factId: string;
    userId: string;
    action: HermesHistoryAction;
    beforeText: string | null;
    afterText: string | null;
    beforeTrust: number | null;
    afterTrust: number | null;
    note?: string | null;
  }): HermesFactHistoryEntry {
    const id = `hhist-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    this.db
      .prepare(
        `INSERT INTO hermes_fact_history (
          id, fact_id, user_id, action, before_text, after_text, before_trust, after_trust, note, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        entry.factId,
        entry.userId,
        entry.action,
        entry.beforeText,
        entry.afterText,
        entry.beforeTrust,
        entry.afterTrust,
        entry.note || null,
        now
      );
    const row = this.db
      .prepare('SELECT * FROM hermes_fact_history WHERE id = ?')
      .get(id) as unknown as HistoryRow;
    return mapHistory(row);
  }

  public getFactHistory(userId: string, factId: string): HermesFactHistoryEntry[] {
    const rows = this.db
      .prepare(
        'SELECT * FROM hermes_fact_history WHERE fact_id = ? AND user_id = ? ORDER BY created_at DESC'
      )
      .all(factId, userId) as unknown as HistoryRow[];
    return rows.map(mapHistory);
  }

  public clearAllForUser(userId: string): void {
    withTransaction(() => {
      this.db.prepare('DELETE FROM hermes_fact_history WHERE user_id = ?').run(userId);
      this.db.prepare('DELETE FROM hermes_memory_facts WHERE user_id = ?').run(userId);
      this.db.prepare('DELETE FROM hermes_student_memory_docs WHERE user_id = ?').run(userId);
      try {
        const profile = this.db
          .prepare('SELECT id FROM student_profiles WHERE user_id = ?')
          .get(userId) as { id?: string } | undefined;
        this.db.prepare('DELETE FROM student_ai_memory WHERE student_id = ?').run(userId);
        if (profile?.id) {
          this.db.prepare('DELETE FROM student_ai_memory WHERE student_id = ?').run(profile.id);
        }
      } catch {
        // Legacy student_ai_memory table may be absent on minimal fixtures
      }
    });
  }
}
