import { getDatabase } from '../db/connection';
import { StudentAIMemory } from '../types/aiTypes';

export class StudentAIMemoryService {
  /**
   * Retrieves student AI memory or synthesizes an initial profile
   */
  public getMemory(studentId: string): StudentAIMemory {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM student_ai_memory WHERE student_id = ?').get(studentId) as any;

    if (existing) {
      return {
        student_id: existing.student_id,
        learning_summary: existing.learning_summary || '',
        interest_summary: existing.interest_summary || '',
        career_summary: existing.career_summary || '',
        behavior_summary: existing.behavior_summary || '',
        conversation_summary: existing.conversation_summary || '',
        last_interaction_at: existing.last_interaction_at || new Date().toISOString(),
        updated_at: existing.updated_at || new Date().toISOString()
      };
    }

    // If memory doesn't exist yet, synthesize from student profile and existing tables
    return this.synthesizeAndSaveMemory(studentId);
  }

  /**
   * Synthesizes memory from all platform data sources:
   * 1. student_profiles
   * 2. student_learning_history & lab_experiment_results
   * 3. student_intelligence_profile & analytics events
   * 4. avatar_profiles & achievements
   */
  public synthesizeAndSaveMemory(studentId: string): StudentAIMemory {
    const db = getDatabase();
    const now = new Date().toISOString();

    // 1. Fetch Student Profile
    const profile = db.prepare('SELECT * FROM student_profiles WHERE id = ? OR user_id = ?').get(studentId, studentId) as any;
    const resolvedStudentId = profile?.id || studentId;

    // 2. Fetch Learning History & Labs
    let labCount = 0;
    let completedLabs: string[] = [];
    try {
      const labs = db.prepare(`
        SELECT l.title, r.score, r.status 
        FROM lab_experiment_results r
        JOIN lab_experiments l ON r.experiment_id = l.id
        WHERE r.student_id = ? AND r.status = 'completed'
      `).all(resolvedStudentId) as Array<{ title: string; score: number; status: string }>;
      labCount = labs.length;
      completedLabs = labs.map(l => `${l.title} (Score: ${l.score}%)`);
    } catch {
      // ignore
    }

    let learningActivitiesCount = 0;
    try {
      const actCount = db.prepare("SELECT COUNT(*) as c FROM student_activity_progress WHERE student_id = ? AND status = 'completed'").get(resolvedStudentId) as { c: number };
      learningActivitiesCount = actCount?.c || 0;
    } catch {
      // ignore
    }

    // 3. Fetch Intelligence Analytics
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    let persistenceScore = 80;
    let problemSolvingScore = 75;
    let engagementScore = 85;
    try {
      const intel = db.prepare('SELECT * FROM student_intelligence_profile WHERE student_id = ?').get(resolvedStudentId) as any;
      if (intel) {
        strengths = JSON.parse(intel.subject_strengths || '[]').map((s: any) => typeof s === 'string' ? s : s.subject);
        weaknesses = JSON.parse(intel.subject_weaknesses || '[]').map((w: any) => typeof w === 'string' ? w : w.subject);
        persistenceScore = intel.persistence_score || 80;
        problemSolvingScore = intel.problem_solving_score || 75;
        engagementScore = intel.engagement_score || 85;
      }
    } catch {
      // ignore
    }

    // 4. Fetch Avatar & Items
    let avatarLevel = 1;
    let meritPoints = 150;
    try {
      const avatar = db.prepare('SELECT level, merit_points FROM avatar_profiles WHERE student_id = ?').get(resolvedStudentId) as any;
      if (avatar) {
        avatarLevel = avatar.level || 1;
        meritPoints = avatar.merit_points || 150;
      }
    } catch {
      // ignore
    }

    // Construct the 5 comprehensive pillars:
    // A. Learning Summary
    const defaultStrengths = strengths.length > 0 ? strengths.join(', ') : 'Applied Mathematics, Logic Circuits, Web Development';
    const defaultWeaknesses = weaknesses.length > 0 ? weaknesses.join(', ') : 'Optics & Snell Law Derivations, French Technical Terms';
    const labSnippet = completedLabs.length > 0
      ? `Completed STEM Virtual Labs: ${completedLabs.join(', ')}.`
      : 'Active participant in CDES STEM Laboratory simulation experiments.';

    const learningSummary = `Academic Level: ${profile?.education_level || 'Grade 12 Bac II Candidate'}. Target Major: ${profile?.major || 'Computer Science'}. Demonstrated strengths in ${defaultStrengths}. Areas requiring focused remediation: ${defaultWeaknesses}. ${labSnippet} Total completed interactive learning modules: ${learningActivitiesCount + labCount}.`;

    // B. Interest Summary
    let interestList: string[] = [];
    try {
      interestList = JSON.parse(profile?.interests || '[]');
    } catch {
      interestList = ['Robotics', 'Artificial Intelligence', 'Clean Energy'];
    }
    if (interestList.length === 0) {
      interestList = ['Robotics & Automation', 'Software Engineering', 'Renewable Energy'];
    }
    const interestSummary = `Primary curiosity vectors: ${interestList.join(', ')}. Strong affinity for hands-on simulation environments, algorithmic puzzles, and digital innovation projects in Cambodia.`;

    // C. Career Summary
    const targetCareer = profile?.target_career || 'AI Systems Software Engineer';
    const careerSummary = `Target Profession: ${targetCareer}. Aspiring University Pathways: Cambodia Academy of Digital Technology (CADT) and Institute of Technology of Cambodia (ITC Tronc Commun). Interested in digital scholarships (MPTC Digital Skills, Paragon President Excellence, and Australia Awards).`;

    // D. Behavior Summary
    const frustrationIndicator = persistenceScore >= 75 ? 'High resilience (maintains focus through multi-step puzzle failures)' : 'Moderate persistence';
    const behaviorSummary = `Persistence Index: ${persistenceScore}/100 (${frustrationIndicator}). Problem Solving Index: ${problemSolvingScore}/100. Engagement Rating: ${engagementScore}/100. Avatar Level: ${avatarLevel} (${meritPoints} Merit Points). Prefers visual interactive demonstrations before abstract theoretical proofs.`;

    // E. Conversation Summary
    const conversationSummary = `Inquiring about university entrance examinations (ITC vs CADT), scholarship eligibility requirements for Cambodian Grade 12 students, and foundational software engineering skills.`;

    const memory: StudentAIMemory = {
      student_id: resolvedStudentId,
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
