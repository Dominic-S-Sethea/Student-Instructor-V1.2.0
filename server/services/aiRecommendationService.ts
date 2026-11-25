import crypto from 'node:crypto';
import { getDatabase } from '../db/connection';
import { AIRecommendation, RecommendationType, RecommendationStatus } from '../types/aiTypes';
import { studentAIMemoryService } from './studentAIMemoryService';
import { PrivacyService } from './privacyService';

const privacyService = new PrivacyService();

export class AIRecommendationService {
  /**
   * Generates or retrieves personalized recommendations across Learning, Career, and Scholarship.
   */
  public getOrGenerateRecommendations(studentId: string): AIRecommendation[] {
    if (!privacyService.canUseAIMemory(studentId)) {
      return this.generateFreshRecommendations(studentId);
    }
    const db = getDatabase();

    // Check if recommendations already exist
    const existing = db.prepare(`
      SELECT * FROM ai_recommendation_events
      WHERE student_id = ? AND status != 'dismissed'
      ORDER BY priority_score DESC, created_at DESC
      LIMIT 10
    `).all(studentId) as any[];

    if (existing && existing.length >= 3) {
      return existing.map(this.formatRecommendationRow);
    }

    // Generate tailored recommendations from student memory & profile
    return this.generateFreshRecommendations(studentId);
  }

  /**
   * Synthesizes fresh personalized recommendations using multi-source student intelligence.
   * Persists to ai_recommendation_events only when AI memory consent is granted.
   */
  public generateFreshRecommendations(studentId: string): AIRecommendation[] {
    const db = getDatabase();
    const canPersist = privacyService.canUseAIMemory(studentId);
    const memory = studentAIMemoryService.getMemory(studentId);
    const now = new Date().toISOString();

    const newRecs: Array<Omit<AIRecommendation, 'id' | 'created_at' | 'updated_at'>> = [];

    // 1. Learning Recommendation
    const hasPhysicsWeakness = memory.learning_summary.toLowerCase().includes('physics') || memory.learning_summary.toLowerCase().includes('optics');
    if (hasPhysicsWeakness) {
      newRecs.push({
        student_id: studentId,
        recommendation_type: 'learning',
        title: 'Virtual STEM Lab: Snell\'s Law & Refraction Simulator',
        description: 'Conduct interactive ray-tracing experiments in the CDES Virtual Lab. Adjust incident angles and refractive indices in real-time to master wave optics before Bac II.',
        match_reason: 'Detected conceptual focus on optics & wave mechanics in study context.',
        target_entity_id: 'exp-optics-01',
        priority_score: 94.5,
        status: 'given',
        action_label: 'Launch Optics Lab',
        action_link: '/stem-lab'
      });
    } else {
      newRecs.push({
        student_id: studentId,
        recommendation_type: 'learning',
        title: 'AI & Machine Learning Foundations: Binary Logic & Vectors',
        description: 'Complete hands-on Python matrix math and gradient descent modules to build a competitive edge for university entrance examinations.',
        match_reason: 'Recommended foundational STEM pathway for Cambodian high school and university students.',
        target_entity_id: 'path-ai-engineer',
        priority_score: 92.0,
        status: 'given',
        action_label: 'Start Learning Path',
        action_link: '/learning'
      });
    }

    // 2. Career Recommendation
    const isRoboticsOrAI = memory.interest_summary.toLowerCase().includes('robotics') || memory.career_summary.toLowerCase().includes('ai');
    if (isRoboticsOrAI) {
      newRecs.push({
        student_id: studentId,
        recommendation_type: 'career',
        title: 'Embedded Robotics & AI Systems Engineering Pathway',
        description: 'Explore dual-track preparation bridging Institute of Technology of Cambodia (ITC Tronc Commun / GTI) and Cambodia Academy of Digital Technology (CADT).',
        match_reason: 'Aligned with declared robotics/AI interest and engineering preparation.',
        target_entity_id: 'career-ai-robotics',
        priority_score: 96.0,
        status: 'given',
        action_label: 'Explore Career Blueprint',
        action_link: '/opportunities'
      });
    } else {
      newRecs.push({
        student_id: studentId,
        recommendation_type: 'career',
        title: 'Full-Stack Cloud & Software Architecture Pathway',
        description: 'Explore software engineering and cloud career benchmarks across Cambodia’s digital economy.',
        match_reason: 'General high-demand STEM career pathway in Cambodia.',
        target_entity_id: 'career-cloud-architect',
        priority_score: 89.0,
        status: 'given',
        action_label: 'View Job Market Intel',
        action_link: '/opportunities'
      });
    }

    // 3. Scholarship Recommendation
    newRecs.push({
      student_id: studentId,
      recommendation_type: 'scholarship',
      title: 'MPTC Digital Skill 100% Undergraduate Scholarship',
      description: 'Review eligibility criteria for tuition coverage on Computer Science and Telecom programs at CADT or ITC (verify current cycle terms on official portal).',
      match_reason: 'Relevant domestic STEM scholarship track for Cambodian Grade 12 candidates.',
      target_entity_id: 'sch-mptc-full',
      priority_score: 98.0,
      status: 'given',
      action_label: 'Review Eligibility & Apply',
      action_link: '/scholarships'
    });

    // 4. Secondary International Scholarship Recommendation
    newRecs.push({
      student_id: studentId,
      recommendation_type: 'scholarship',
      title: 'Paragon IU President Excellence Scholarship Exam',
      description: 'Merit-based scholarship aptitude exam covering Mathematics, Logic, and English proficiency.',
      match_reason: 'Merit scholarship opportunity open to Cambodian high school graduates.',
      target_entity_id: 'sch-paragon-pres',
      priority_score: 91.0,
      status: 'given',
      action_label: 'Examine Mock Questions',
      action_link: '/scholarships'
    });

    const insertStmt = canPersist
      ? db.prepare(`
          INSERT INTO ai_recommendation_events (
            id, student_id, recommendation_type, title, description, match_reason,
            target_entity_id, priority_score, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
      : null;

    const result: AIRecommendation[] = [];
    newRecs.forEach((r) => {
      const recId = `rec-${crypto.randomUUID()}`;
      if (insertStmt) {
        insertStmt.run(
          recId,
          r.student_id,
          r.recommendation_type,
          r.title,
          r.description,
          r.match_reason,
          r.target_entity_id || null,
          r.priority_score,
          r.status,
          now,
          now
        );
      }
      result.push({
        ...r,
        id: recId,
        created_at: now,
        updated_at: now
      });
    });

    return result;
  }

  /**
   * Tracks feedback events (click, completed, feedback ratings) to close the loop
   */
  public recordFeedback(
    recommendationId: string,
    action: 'clicked' | 'completed' | 'dismissed',
    rating?: number,
    comments?: string,
    actorUserId?: string,
    actorRole?: string
  ): { success: boolean; forbidden?: boolean; recommendation: AIRecommendation | null } {
    const db = getDatabase();
    const now = new Date().toISOString();

    const rec = db.prepare('SELECT * FROM ai_recommendation_events WHERE id = ?').get(recommendationId) as any;
    if (!rec) {
      return { success: false, recommendation: null };
    }

    if (actorUserId && actorRole !== 'admin' && rec.student_id !== actorUserId) {
      const profileRow = db
        .prepare('SELECT user_id FROM student_profiles WHERE id = ?')
        .get(rec.student_id) as { user_id?: string } | undefined;
      if (profileRow?.user_id !== actorUserId) {
        return { success: false, forbidden: true, recommendation: null };
      }
    }

    const newStatus = action;
    const feedbackRating = rating !== undefined ? rating : rec.feedback_rating;
    const feedbackComments = comments !== undefined ? comments : rec.feedback_comments;

    // Adjust priority score dynamically based on positive/negative feedback
    let adjustedPriority = rec.priority_score;
    if (action === 'clicked') adjustedPriority = Math.min(100, adjustedPriority + 2);
    if (action === 'completed') adjustedPriority = Math.min(100, adjustedPriority + 5);
    if (rating && rating >= 4) adjustedPriority = Math.min(100, adjustedPriority + 3);
    if (rating && rating <= 2) adjustedPriority = Math.max(30, adjustedPriority - 15);

    db.prepare(`
      UPDATE ai_recommendation_events
      SET status = ?, feedback_rating = ?, feedback_comments = ?, priority_score = ?, updated_at = ?
      WHERE id = ?
    `).run(newStatus, feedbackRating, feedbackComments, adjustedPriority, now, recommendationId);

    const updated = db.prepare('SELECT * FROM ai_recommendation_events WHERE id = ?').get(recommendationId) as any;
    return { success: true, recommendation: this.formatRecommendationRow(updated) };
  }

  private formatRecommendationRow(r: any): AIRecommendation {
    let actionLabel = 'Explore';
    let actionLink = '/dashboard';

    if (r.recommendation_type === 'learning') {
      actionLabel = 'Start Learning';
      actionLink = '/learning';
    } else if (r.recommendation_type === 'career') {
      actionLabel = 'Explore Pathway';
      actionLink = '/opportunities';
    } else if (r.recommendation_type === 'scholarship') {
      actionLabel = 'View Scholarship';
      actionLink = '/scholarships';
    }

    return {
      id: r.id,
      student_id: r.student_id,
      recommendation_type: r.recommendation_type as RecommendationType,
      title: r.title,
      description: r.description,
      match_reason: r.match_reason,
      target_entity_id: r.target_entity_id,
      priority_score: r.priority_score,
      status: r.status as RecommendationStatus,
      feedback_rating: r.feedback_rating,
      feedback_comments: r.feedback_comments,
      created_at: r.created_at,
      updated_at: r.updated_at,
      action_label: actionLabel,
      action_link: actionLink
    };
  }
}

export const aiRecommendationService = new AIRecommendationService();
