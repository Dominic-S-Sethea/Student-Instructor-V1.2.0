import crypto from 'node:crypto';
import { getDatabase, withTransaction } from '../db/connection';
import { safeJsonParse } from '../utils/safeJson';
import { BadRequestError } from '../utils/httpErrors';

const MAX_SAVED_SCHOLARSHIPS_PER_USER = 200;

export type SavedScholarshipStatus = 'saved' | 'preparing' | 'submitted' | 'awarded' | 'archived';

export interface SavedChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface SavedScholarshipRow {
  id: string;
  user_id: string;
  scholarship_id: string;
  status: SavedScholarshipStatus;
  target_note: string;
  checklist_json: string;
  created_at: string;
  updated_at: string;
}

export interface SavedScholarshipRecord {
  id: string;
  userId: string;
  scholarshipId: string;
  status: SavedScholarshipStatus;
  targetNote: string;
  checklist: SavedChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: SavedScholarshipRow): SavedScholarshipRecord {
  const rawList = safeJsonParse<unknown[]>(row.checklist_json, []);
  const checklist: SavedChecklistItem[] = Array.isArray(rawList)
    ? rawList
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
        .map((item, idx) => ({
          id: typeof item.id === 'string' && item.id.trim() ? item.id.trim().slice(0, 64) : `chk-${idx + 1}`,
          label: typeof item.label === 'string' ? item.label.trim().slice(0, 160) : '',
          done: Boolean(item.done),
        }))
        .filter((item) => item.label.length > 0)
        .slice(0, 25)
    : [];

  return {
    id: row.id,
    userId: row.user_id,
    scholarshipId: row.scholarship_id,
    status: row.status,
    targetNote: row.target_note || '',
    checklist,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildDefaultChecklist(scholarshipId: string): SavedChecklistItem[] {
  const db = getDatabase();
  const reqRow = db
    .prepare('SELECT required_documents FROM scholarship_requirements WHERE scholarship_id = ?')
    .get(scholarshipId) as { required_documents?: string } | undefined;
  const docs = safeJsonParse<string[]>(reqRow?.required_documents, []);
  if (!Array.isArray(docs) || docs.length === 0) {
    return [
      { id: 'doc-1', label: 'Review official eligibility criteria', done: false },
      { id: 'doc-2', label: 'Prepare academic transcripts & ID', done: false },
      { id: 'doc-3', label: 'Submit application before official deadline', done: false },
    ];
  }
  return docs
    .map((d) => String(d).trim().slice(0, 160))
    .filter(Boolean)
    .slice(0, 15)
    .map((label, idx) => ({ id: `doc-${idx + 1}`, label, done: false }));
}

export class SavedScholarshipRepository {
  public listByUser(userId: string): SavedScholarshipRecord[] {
    const rows = getDatabase()
      .prepare(
        `SELECT s.* FROM user_saved_scholarships s
         JOIN scholarships sch ON sch.id = s.scholarship_id AND COALESCE(sch.is_deleted, 0) = 0
         WHERE s.user_id = ?
         ORDER BY s.updated_at DESC`
      )
      .all(userId) as SavedScholarshipRow[];
    return rows.map(mapRow);
  }

  public getByUserAndScholarship(userId: string, scholarshipId: string): SavedScholarshipRecord | null {
    const row = getDatabase()
      .prepare('SELECT * FROM user_saved_scholarships WHERE user_id = ? AND scholarship_id = ?')
      .get(userId, scholarshipId) as SavedScholarshipRow | undefined;
    return row ? mapRow(row) : null;
  }

  public scholarshipExists(scholarshipId: string): boolean {
    const row = getDatabase()
      .prepare('SELECT id FROM scholarships WHERE id = ? AND COALESCE(is_deleted, 0) = 0')
      .get(scholarshipId) as { id?: string } | undefined;
    return Boolean(row?.id);
  }

  public save(
    userId: string,
    scholarshipId: string,
    input?: { status?: SavedScholarshipStatus; targetNote?: string; checklist?: SavedChecklistItem[] }
  ): SavedScholarshipRecord | null {
    if (!this.scholarshipExists(scholarshipId)) {
      return null;
    }
    const db = getDatabase();
    const now = new Date().toISOString();
    const existing = this.getByUserAndScholarship(userId, scholarshipId);

    if (existing) {
      const nextStatus = input?.status ?? existing.status;
      const nextNote = input?.targetNote !== undefined ? input.targetNote.trim().slice(0, 500) : existing.targetNote;
      const nextChecklist = input?.checklist ?? existing.checklist;
      db.prepare(
        `UPDATE user_saved_scholarships
         SET status = ?, target_note = ?, checklist_json = ?, updated_at = ?
         WHERE user_id = ? AND scholarship_id = ?`
      ).run(nextStatus, nextNote, JSON.stringify(nextChecklist), now, userId, scholarshipId);
      return this.getByUserAndScholarship(userId, scholarshipId);
    }

    const countRow = db
      .prepare('SELECT COUNT(*) AS c FROM user_saved_scholarships WHERE user_id = ?')
      .get(userId) as { c: number };
    if (Number(countRow?.c ?? 0) >= MAX_SAVED_SCHOLARSHIPS_PER_USER) {
      throw new BadRequestError(`Maximum limit of ${MAX_SAVED_SCHOLARSHIPS_PER_USER} saved scholarships reached.`);
    }

    const id = `sav-${crypto.randomUUID()}`;
    const checklist = input?.checklist && input.checklist.length > 0 ? input.checklist : buildDefaultChecklist(scholarshipId);
    db.prepare(
      `INSERT INTO user_saved_scholarships (
        id, user_id, scholarship_id, status, target_note, checklist_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      userId,
      scholarshipId,
      input?.status ?? 'saved',
      (input?.targetNote ?? '').trim().slice(0, 500),
      JSON.stringify(checklist),
      now,
      now
    );
    return this.getByUserAndScholarship(userId, scholarshipId);
  }

  public update(
    userId: string,
    scholarshipId: string,
    patch: { status?: SavedScholarshipStatus; targetNote?: string; checklist?: SavedChecklistItem[] }
  ): SavedScholarshipRecord | null {
    const existing = this.getByUserAndScholarship(userId, scholarshipId);
    if (!existing) return null;
    return this.save(userId, scholarshipId, patch);
  }

  public remove(userId: string, scholarshipId: string): boolean {
    const res = getDatabase()
      .prepare('DELETE FROM user_saved_scholarships WHERE user_id = ? AND scholarship_id = ?')
      .run(userId, scholarshipId);
    return Number(res.changes) > 0;
  }

  public syncIds(userId: string, scholarshipIds: string[]): SavedScholarshipRecord[] {
    const unique = Array.from(
      new Set(scholarshipIds.map((id) => id.trim()).filter((id) => id.length > 0 && id.length <= 120))
    ).slice(0, 50);

    withTransaction(() => {
      for (const schId of unique) {
        if (!this.getByUserAndScholarship(userId, schId) && this.scholarshipExists(schId)) {
          this.save(userId, schId);
        }
      }
    });
    return this.listByUser(userId);
  }
}

export const savedScholarshipRepository = new SavedScholarshipRepository();
