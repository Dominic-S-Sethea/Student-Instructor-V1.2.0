import { getDatabase } from '../db/connection';
import { StudentIntelligenceProfile } from '../types/analytics';
import { safeJsonParse } from '../utils/safeJson';

interface IntelligenceProfileRow {
  student_id: string;
  learning_preferences: string | null;
  subject_strengths: string | null;
  subject_weaknesses: string | null;
  interest_patterns: string | null;
  engagement_score: number | null;
  persistence_score: number | null;
  problem_solving_score: number | null;
  updated_at: string;
}

export class IntelligenceRepository {
  private get db() {
    return getDatabase();
  }

  private mapRow(row: IntelligenceProfileRow): StudentIntelligenceProfile {
    return {
      studentId: row.student_id,
      learningPreferences: safeJsonParse<StudentIntelligenceProfile['learningPreferences']>(
        row.learning_preferences,
        {} as StudentIntelligenceProfile['learningPreferences']
      ),
      subjectStrengths: safeJsonParse(row.subject_strengths, []),
      subjectWeaknesses: safeJsonParse(row.subject_weaknesses, []),
      interestPatterns: safeJsonParse(row.interest_patterns, []),
      engagementScore: Number(row.engagement_score) || 0,
      persistenceScore: Number(row.persistence_score) || 0,
      problemSolvingScore: Number(row.problem_solving_score) || 0,
      updatedAt: row.updated_at,
    };
  }

  public getProfile(studentId: string): StudentIntelligenceProfile | null {
    const row = this.db.prepare(`
      SELECT * FROM student_intelligence_profile WHERE student_id = ?
    `).get(studentId) as IntelligenceProfileRow | undefined;

    if (!row) return null;
    return this.mapRow(row);
  }

  public upsertProfile(profile: StudentIntelligenceProfile): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO student_intelligence_profile (
        student_id,
        learning_preferences,
        subject_strengths,
        subject_weaknesses,
        interest_patterns,
        engagement_score,
        persistence_score,
        problem_solving_score,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(student_id) DO UPDATE SET
        learning_preferences = excluded.learning_preferences,
        subject_strengths = excluded.subject_strengths,
        subject_weaknesses = excluded.subject_weaknesses,
        interest_patterns = excluded.interest_patterns,
        engagement_score = excluded.engagement_score,
        persistence_score = excluded.persistence_score,
        problem_solving_score = excluded.problem_solving_score,
        updated_at = excluded.updated_at
    `).run(
      profile.studentId,
      JSON.stringify(profile.learningPreferences || {}),
      JSON.stringify(profile.subjectStrengths || []),
      JSON.stringify(profile.subjectWeaknesses || []),
      JSON.stringify(profile.interestPatterns || []),
      profile.engagementScore,
      profile.persistenceScore,
      profile.problemSolvingScore,
      now
    );
  }

  public getAllProfiles(limit: number = 500): StudentIntelligenceProfile[] {
    const safeLimit = Math.min(Math.max(1, Math.trunc(limit)), 1000);
    const rows = this.db.prepare(`
      SELECT * FROM student_intelligence_profile ORDER BY updated_at DESC LIMIT ?
    `).all(safeLimit) as unknown as IntelligenceProfileRow[];

    return rows.map((row) => this.mapRow(row));
  }
}
