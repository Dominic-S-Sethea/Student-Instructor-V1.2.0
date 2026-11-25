import { getDatabase } from '../db/connection';
import { PrivacyService } from './privacyService';
import { StudentAIMemory } from '../types/aiTypes';
import { safeJsonParse } from '../utils/safeJson';

const privacyService = new PrivacyService();

function emptyDisabledMemory(studentId: string): StudentAIMemory {
  const now = new Date().toISOString();
  return {
    student_id: studentId,
    learning_summary: '',
    interest_summary: '',
    career_summary: '',
    behavior_summary: '',
    conversation_summary: '',
    last_interaction_at: '',
    updated_at: now,
  };
}

export class StudentAIMemoryService {
  private resolveCanonicalKeys(studentId: string): { userId: string; profileId: string | null } {
    const db = getDatabase();
    const profile = db
      .prepare('SELECT id, user_id FROM student_profiles WHERE user_id = ? OR id = ? LIMIT 1')
      .get(studentId, studentId) as { id?: string; user_id?: string } | undefined;
    return {
      userId: profile?.user_id || studentId,
      profileId: profile?.id || null,
    };
  }

  /**
   * Retrieves student AI memory only when enforceable AI memory consent is granted.
   * When disabled, returns an empty non-persisted memory struct without fabricating profile data.
   */
  public getMemory(studentId: string): StudentAIMemory {
    const { userId, profileId } = this.resolveCanonicalKeys(studentId);
    if (!privacyService.canUseAIMemory(userId)) {
      return emptyDisabledMemory(userId);
    }

    const db = getDatabase();
    const existing = (db
      .prepare('SELECT * FROM student_ai_memory WHERE student_id = ? OR student_id = ? ORDER BY updated_at DESC LIMIT 1')
      .get(userId, profileId || userId)) as Record<string, string> | undefined;

    if (existing) {
      return {
        student_id: userId,
        learning_summary: existing.learning_summary || '',
        interest_summary: existing.interest_summary || '',
        career_summary: existing.career_summary || '',
        behavior_summary: existing.behavior_summary || '',
        conversation_summary: existing.conversation_summary || '',
        last_interaction_at: existing.last_interaction_at || new Date().toISOString(),
        updated_at: existing.updated_at || new Date().toISOString(),
      };
    }

    return this.synthesizeAndSaveMemory(userId);
  }

  /**
   * Synthesizes memory only when AI memory consent is granted.
   */
  public synthesizeAndSaveMemory(studentId: string): StudentAIMemory {
    const { userId, profileId } = this.resolveCanonicalKeys(studentId);
    if (!privacyService.canUseAIMemory(userId)) {
      return emptyDisabledMemory(userId);
    }
    const db = getDatabase();
    const now = new Date().toISOString();

    const profile = db
      .prepare('SELECT * FROM student_profiles WHERE user_id = ? OR id = ? LIMIT 1')
      .get(userId, profileId || userId) as Record<string, unknown> | undefined;

    let labCount = 0;
    let completedLabs: string[] = [];
    try {
      const labs = db.prepare(`
        SELECT l.title, r.score, r.status
        FROM lab_experiment_results r
        JOIN lab_experiments l ON r.experiment_id = l.id
        WHERE r.student_id IN (?, ?) AND r.status = 'completed'
      `).all(userId, profileId || userId) as Array<{ title: string; score: number; status: string }>;
      labCount = labs.length;
      completedLabs = labs.map((l) => `${l.title} (Score: ${l.score}%)`);
    } catch {
      // ignore
    }

    let learningActivitiesCount = 0;
    try {
      const actCount = db
        .prepare("SELECT COUNT(*) as c FROM student_activity_progress WHERE student_id IN (?, ?) AND status = 'completed'")
        .get(userId, profileId || userId) as { c: number };
      learningActivitiesCount = actCount?.c || 0;
    } catch {
      // ignore
    }

    let strengths: string[] = [];
    let weaknesses: string[] = [];
    let persistenceScore = 0;
    let problemSolvingScore = 0;
    let engagementScore = 0;
    try {
      const intel = db
        .prepare('SELECT * FROM student_intelligence_profile WHERE student_id IN (?, ?) LIMIT 1')
        .get(userId, profileId || userId) as Record<string, unknown> | undefined;
      if (intel) {
        const rawStrengths = safeJsonParse<Array<string | { subject?: string }>>(String(intel.subject_strengths || '[]'), []);
        const rawWeaknesses = safeJsonParse<Array<string | { subject?: string }>>(String(intel.subject_weaknesses || '[]'), []);
        strengths = rawStrengths.map((s) => (typeof s === 'string' ? s : String(s.subject || ''))).filter(Boolean);
        weaknesses = rawWeaknesses.map((w) => (typeof w === 'string' ? w : String(w.subject || ''))).filter(Boolean);
        persistenceScore = Number(intel.persistence_score) || 0;
        problemSolvingScore = Number(intel.problem_solving_score) || 0;
        engagementScore = Number(intel.engagement_score) || 0;
      }
    } catch {
      // ignore
    }

    let avatarLevel = 1;
    let meritPoints = 0;
    try {
      const avatar = db
        .prepare('SELECT level, merit_points FROM avatar_profiles WHERE student_id IN (?, ?) LIMIT 1')
        .get(userId, profileId || userId) as { level?: number; merit_points?: number } | undefined;
      if (avatar) {
        avatarLevel = avatar.level || 1;
        meritPoints = avatar.merit_points || 0;
      }
    } catch {
      // ignore
    }

    const strengthsLabel = strengths.length > 0 ? strengths.join(', ') : 'Not yet assessed';
    const weaknessesLabel = weaknesses.length > 0 ? weaknesses.join(', ') : 'Not yet assessed';
    const labSnippet = completedLabs.length > 0
      ? `Completed STEM Virtual Labs: ${completedLabs.join(', ')}.`
      : 'No completed virtual lab experiments recorded yet.';

    const learningSummary = `Academic Level: ${String(profile?.education_level || 'Not specified')}. Target Major: ${String(profile?.major || 'Not specified')}. Observed strengths: ${strengthsLabel}. Growth areas: ${weaknessesLabel}. ${labSnippet} Total completed interactive learning modules: ${learningActivitiesCount + labCount}.`;

    const interestList = safeJsonParse<string[]>(String(profile?.interests || '[]'), []);
    const interestSummary = interestList.length > 0
      ? `Declared interests: ${interestList.join(', ')}.`
      : 'No declared study interests recorded yet.';

    const targetCareer = String(profile?.target_career || 'Not specified');
    const careerSummary = `Target Profession: ${targetCareer}.`;

    const behaviorSummary = `Persistence Index: ${persistenceScore}/100. Problem Solving Index: ${problemSolvingScore}/100. Engagement Rating: ${engagementScore}/100. Avatar Level: ${avatarLevel} (${meritPoints} Merit Points).`;
    const conversationSummary = 'No advisor conversation history recorded yet.';

    const memory: StudentAIMemory = {
      student_id: userId,
      learning_summary: learningSummary,
      interest_summary: interestSummary,
      career_summary: careerSummary,
      behavior_summary: behaviorSummary,
      conversation_summary: conversationSummary,
      last_interaction_at: now,
      updated_at: now
    };

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO student_ai_memory (
        student_id, learning_summary, interest_summary, career_summary,
        behavior_summary, conversation_summary, last_interaction_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(student_id) DO UPDATE SET
        learning_summary = excluded.learning_summary,
        interest_summary = excluded.interest_summary,
        career_summary = excluded.career_summary,
        behavior_summary = excluded.behavior_summary,
        conversation_summary = excluded.conversation_summary,
        last_interaction_at = excluded.last_interaction_at,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      memory.student_id,
      memory.learning_summary,
      memory.interest_summary,
      memory.career_summary,
      memory.behavior_summary,
      memory.conversation_summary,
      memory.last_interaction_at,
      memory.updated_at
    );

    return memory;
  }

  /**
   * Updates memory after a learning event or lab experiment completion
   */
  public recordLearningActivity(
    studentId: string,
    activityType: string,
    title: string,
    score: number,
    subject: string
  ): void {
    if (!privacyService.canUseAIMemory(studentId)) {
      return;
    }
    const current = this.getMemory(studentId);
    const now = new Date().toISOString();

    const newMilestone = `Recently engaged in ${activityType}: "${title}" in ${subject} with a score of ${score}%.`;
    const updatedLearning = `${current.learning_summary} [Recent Activity: ${newMilestone}]`.slice(-600);

    const db = getDatabase();
    db.prepare(`
      UPDATE student_ai_memory
      SET learning_summary = ?, last_interaction_at = ?, updated_at = ?
      WHERE student_id = ?
    `).run(updatedLearning, now, now, current.student_id);
  }

  /**
   * Updates conversation summary after a chat exchange
   */
  public recordConversationExchange(
    studentId: string,
    userPrompt: string,
    agentReplySnippet: string
  ): void {
    if (!privacyService.canUseAIMemory(studentId)) {
      return;
    }
    const current = this.getMemory(studentId);
    const now = new Date().toISOString();

    const shortPrompt = userPrompt.length > 80 ? userPrompt.slice(0, 80) + '...' : userPrompt;
    const shortReply = agentReplySnippet.length > 100 ? agentReplySnippet.slice(0, 100) + '...' : agentReplySnippet;

    const newExchange = `Student asked: "${shortPrompt}" -> Agent guided: "${shortReply}".`;
    const updatedConv = `${current.conversation_summary} | ${newExchange}`.slice(-700);

    const db = getDatabase();
    db.prepare(`
      UPDATE student_ai_memory
      SET conversation_summary = ?, last_interaction_at = ?, updated_at = ?
      WHERE student_id = ?
    `).run(updatedConv, now, now, current.student_id);
  }

  /**
   * Updates specific memory fields directly (e.g. from advisor UI or student settings)
   */
  public updateMemoryFields(
    studentId: string,
    fields: Partial<Omit<StudentAIMemory, 'student_id' | 'updated_at'>>
  ): StudentAIMemory {
    if (!privacyService.canUseAIMemory(studentId)) {
      return emptyDisabledMemory(studentId);
    }
    const current = this.getMemory(studentId);
    const now = new Date().toISOString();

    const updated: StudentAIMemory = {
      ...current,
      ...fields,
      student_id: current.student_id,
      updated_at: now
    };

    const db = getDatabase();
    db.prepare(`
      INSERT INTO student_ai_memory (
        student_id, learning_summary, interest_summary, career_summary,
        behavior_summary, conversation_summary, last_interaction_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(student_id) DO UPDATE SET
        learning_summary = excluded.learning_summary,
        interest_summary = excluded.interest_summary,
        career_summary = excluded.career_summary,
        behavior_summary = excluded.behavior_summary,
        conversation_summary = excluded.conversation_summary,
        last_interaction_at = excluded.last_interaction_at,
        updated_at = excluded.updated_at
    `).run(
      updated.student_id,
      updated.learning_summary,
      updated.interest_summary,
      updated.career_summary,
      updated.behavior_summary,
      updated.conversation_summary,
      updated.last_interaction_at,
      updated.updated_at
    );

    return updated;
  }
}

export const studentAIMemoryService = new StudentAIMemoryService();
