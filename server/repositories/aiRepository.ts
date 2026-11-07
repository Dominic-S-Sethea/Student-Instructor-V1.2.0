import { getDatabase } from '../db/connection';
import crypto from 'crypto';

export interface AIConversationRecord {
  id: string;
  user_id?: string | null;
  session_title?: string | null;
  message: string;
  response: string;
  suggested_majors?: string | null; // JSON
  suggested_skills?: string | null; // JSON
  suggested_mentors?: string | null; // JSON
  source_attribution: string;
  latency_ms?: number | null;
  timestamp: string;
}

export interface AIMemoryRecord {
  id: string;
  student_id: string;
  preference_data: string; // JSON
  learning_history: string; // JSON
  career_interest?: string | null;
  updated_at: string;
}

export interface KnowledgeDocumentRecord {
  id: string;
  title: string;
  category: string;
  content: string;
  source?: string | null;
  embedding_reference?: string | null;
  created_at: string;
}

export class AIRepository {
  private db = getDatabase();

  public logConversation(entry: Omit<AIConversationRecord, 'id' | 'timestamp'>): AIConversationRecord {
    const now = new Date().toISOString();
    const id = `conv-${crypto.randomUUID()}`;

    this.db.prepare(`
      INSERT INTO ai_conversations (
        id, user_id, session_title, message, response, suggested_majors,
        suggested_skills, suggested_mentors, source_attribution, latency_ms, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      entry.user_id || null,
      entry.session_title || 'Educational Advising',
      entry.message,
      entry.response,
      entry.suggested_majors || '[]',
      entry.suggested_skills || '[]',
      entry.suggested_mentors || '[]',
      entry.source_attribution || 'gemini',
      entry.latency_ms || 0,
      now
    );

    return { id, timestamp: now, ...entry };
  }

  public getConversationHistory(userId: string, limit: number = 20): AIConversationRecord[] {
    return this.db.prepare(`
      SELECT * FROM ai_conversations WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?
    `).all(userId, limit) as unknown as AIConversationRecord[];
  }

  public getAIMemory(studentId: string): AIMemoryRecord | null {
    const row = this.db.prepare('SELECT * FROM ai_memory WHERE student_id = ?').get(studentId) as unknown as AIMemoryRecord | undefined;
    return row || null;
  }

  public updateAIMemory(studentId: string, updates: { preference_data?: any; learning_history?: any; career_interest?: string }): AIMemoryRecord {
    const now = new Date().toISOString();
    const existing = this.getAIMemory(studentId);

    if (existing) {
      this.db.prepare(`
        UPDATE ai_memory SET
          preference_data = ?, learning_history = ?, career_interest = ?, updated_at = ?
        WHERE student_id = ?
      `).run(
        updates.preference_data ? JSON.stringify(updates.preference_data) : existing.preference_data,
        updates.learning_history ? JSON.stringify(updates.learning_history) : existing.learning_history,
        updates.career_interest !== undefined ? updates.career_interest : existing.career_interest,
        now,
        studentId
      );
    } else {
      const id = `mem-${crypto.randomUUID()}`;
      this.db.prepare(`
        INSERT INTO ai_memory (id, student_id, preference_data, learning_history, career_interest, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        id,
        studentId,
        JSON.stringify(updates.preference_data || {}),
        JSON.stringify(updates.learning_history || []),
        updates.career_interest || null,
        now
      );
    }

    return this.getAIMemory(studentId)!;
  }

  public addKnowledgeDocument(doc: Omit<KnowledgeDocumentRecord, 'id' | 'created_at'>): KnowledgeDocumentRecord {
    const now = new Date().toISOString();
    const id = `doc-${crypto.randomUUID()}`;
    this.db.prepare(`
      INSERT INTO knowledge_documents (id, title, category, content, source, embedding_reference, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, doc.title, doc.category, doc.content, doc.source || null, doc.embedding_reference || null, now);
    return { id, created_at: now, ...doc };
  }
}
