import { AnalyticsRepository } from '../repositories/analyticsRepository';
import { LearningAnalyticsEngine } from './learningAnalyticsEngine';
import { IngestionEventPayload } from '../types/analytics';

export class AnalyticsService {
  private repo: AnalyticsRepository;
  private engine: LearningAnalyticsEngine;

  constructor(repo?: AnalyticsRepository, engine?: LearningAnalyticsEngine) {
    this.repo = repo || new AnalyticsRepository();
    this.engine = engine || new LearningAnalyticsEngine(this.repo);
  }

  /**
   * Universal Event Tracker: Ingests User, Education, AI, Game, and Virtual World events
   */
  public trackEvent(payload: IngestionEventPayload) {
    const ingested = this.repo.routeAndIngest(payload);

    // If event is associated with a student, trigger dynamic intelligence evaluation
    const studentId = payload.studentId || payload.userId;
    if (studentId && studentId !== 'anonymous-guest') {
      try {
        this.engine.evaluateStudentIntelligence(studentId);
      } catch (err) {
        console.warn('Asynchronous student intelligence profile evolution skipped:', err);
      }
    }

    return ingested;
  }

  /**
   * Get Platform-wide engagement analytics (DAU, time spent, retention)
   */
  public getPlatformEngagement(days: number = 14) {
    return this.repo.getPlatformEngagementMetrics(days);
  }

  /**
   * Get dynamic student intelligence profile and analytics
   */
  public getStudentIntelligence(studentId: string) {
    return this.engine.evaluateStudentIntelligence(studentId);
  }

  /**
   * Legacy backward-compatible activity logger
   */
  public recordActivity(data: { user_id?: string | null; student_id?: string | null; session_id?: string | null; event_type: string; duration?: number; metadata?: any }) {
    return this.repo.logActivityEvent(data);
  }

  public getRecentActivities(limit: number = 30) {
    return this.repo.getRecentActivityEvents(limit);
  }

  /**
   * Legacy backward-compatible game logger
   */
  public recordGameEvent(data: { user_id: string; student_id?: string; game_id: string; action: string; duration: number; result: string; score?: number; metadata?: any }) {
    return this.repo.logGameEvent({
      student_id: data.student_id || data.user_id,
      user_id: data.user_id,
      game_id: data.game_id,
      action: data.action,
      time_taken: data.duration,
      duration: data.duration,
      result: data.result,
      score: data.score,
      metadata: data.metadata
    });
  }

  /**
   * Legacy backward-compatible learning logger
   */
  public recordLearningEvent(data: { user_id: string; student_id?: string; content_id: string; action: string; performance: string; score?: number; time_spent?: number; difficulty?: string; metadata?: any }) {
    return this.repo.logLearningEvent({
      student_id: data.student_id || data.user_id,
      user_id: data.user_id,
      content_id: data.content_id,
      action: data.action,
      performance: data.performance,
      score: data.score,
      time_spent: data.time_spent,
      difficulty: data.difficulty,
      metadata: data.metadata
    });
  }
}
