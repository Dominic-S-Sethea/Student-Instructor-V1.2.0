import { getDatabase } from '../db/connection';
import { StudentIntelligenceProfile } from '../types/analytics';

export class IntelligenceRepository {
  private db = getDatabase();

  public getProfile(studentId: string): StudentIntelligenceProfile | null {
    const row = this.db.prepare(`
      SELECT * FROM student_intelligence_profile WHERE student_id = ?
    `).get(studentId) as any;

    if (!row) return null;

    return {
      studentId: row.student_id,
      learningPreferences: JSON.parse(row.learning_preferences || '{}'),
      subjectStrengths: JSON.parse(row.subject_strengths || '[]'),
      subjectWeaknesses: JSON.parse(row.subject_weaknesses || '[]'),
      interestPatterns: JSON.parse(row.interest_patterns || '[]'),
      engagementScore: Number(row.engagement_score) || 0,
      persistenceScore: Number(row.persistence_score) || 0,
      problemSolvingScore: Number(row.problem_solving_score) || 0,
      updatedAt: row.updated_at
    };
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

  public getAllProfiles(): StudentIntelligenceProfile[] {
    const rows = this.db.prepare(`
      SELECT * FROM student_intelligence_profile ORDER BY updated_at DESC
    `).all() as any[];

    return rows.map(row => ({
      studentId: row.student_id,
      learningPreferences: JSON.parse(row.learning_preferences || '{}'),
      subjectStrengths: JSON.parse(row.subject_strengths || '[]'),
      subjectWeaknesses: JSON.parse(row.subject_weaknesses || '[]'),
      interestPatterns: JSON.parse(row.interest_patterns || '[]'),
      engagementScore: Number(row.engagement_score) || 0,
      persistenceScore: Number(row.persistence_score) || 0,
      problemSolvingScore: Number(row.problem_solving_score) || 0,
      updatedAt: row.updated_at
    }));
  }
}
