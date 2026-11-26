import { AnalyticsRepository } from '../repositories/analyticsRepository';
import { LearningAnalyticsEngine } from './learningAnalyticsEngine';
import { PrivacyService } from './privacyService';
import { IngestionEventPayload } from '../types/analytics';
import { scrubPipelineMetadata, validateAndScrubAnalyticsPayload } from './dataPipelineValidator';

export class AnalyticsService {
  private repo: AnalyticsRepository;
  private engine: LearningAnalyticsEngine;
  private privacy: PrivacyService;

  constructor(repo?: AnalyticsRepository, engine?: LearningAnalyticsEngine, privacy?: PrivacyService) {
    this.repo = repo || new AnalyticsRepository();
    this.engine = engine || new LearningAnalyticsEngine(this.repo);
    this.privacy = privacy || new PrivacyService();
  }

  /**
   * Universal Event Tracker: Ingests User, Education, AI, Game, and Virtual World events
   * only when the student has granted enforceable analytics consent.
   */
  public trackEvent(payload: IngestionEventPayload) {
    const studentId = payload.studentId || payload.userId;
    if (!this.privacy.canCollectAnalytics(studentId)) {
      return {
        persisted: false,
        reason: 'consent_disabled',
        eventType: payload.eventType,
        studentId: studentId || null,
      };
    }

    const sanitizedPayload = validateAndScrubAnalyticsPayload(payload);
    const ingested = this.repo.routeAndIngest(sanitizedPayload);

    if (studentId && studentId !== 'anonymous-guest') {
      try {
        this.engine.evaluateStudentIntelligence(studentId);
      } catch (err) {
        console.warn('Asynchronous student intelligence profile evolution skipped:', err);
      }
    }

    return {
      persisted: true,
      ...(typeof ingested === 'object' && ingested !== null ? ingested : { result: ingested }),
    };
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
  public recordActivity(data: { user_id?: string | null; student_id?: string | null; session_id?: string | null; event_type: string; duration?: number; metadata?: Record<string, unknown> }) {
    const targetId = data.student_id || data.user_id;
    if (!this.privacy.canCollectAnalytics(targetId)) {
      return { persisted: false, reason: 'consent_disabled' };
    }
    return {
      persisted: true,
      event: this.repo.logActivityEvent({
        ...data,
        metadata: scrubPipelineMetadata(data.metadata),
      }),
    };
  }

  public getRecentActivities(limit: number = 30) {
    return this.repo.getRecentActivityEvents(limit);
  }

  /**
   * Legacy backward-compatible game logger
   */
  public recordGameEvent(data: { user_id: string; student_id?: string; game_id: string; action: string; duration: number; result: string; score?: number; metadata?: Record<string, unknown> }) {
    const targetId = data.student_id || data.user_id;
    if (!this.privacy.canCollectAnalytics(targetId)) {
      return { persisted: false, reason: 'consent_disabled' };
    }
    return {
      persisted: true,
      event: this.repo.logGameEvent({
        student_id: targetId,
        user_id: data.user_id,
        game_id: data.game_id,
        action: data.action,
        time_taken: data.duration,
        duration: data.duration,
        result: data.result,
        score: data.score,
        metadata: scrubPipelineMetadata(data.metadata),
      }),
    };
  }

  /**
   * Legacy backward-compatible learning logger
   */
  public recordLearningEvent(data: { user_id: string; student_id?: string; content_id: string; action: string; performance: string; score?: number; time_spent?: number; difficulty?: string; metadata?: Record<string, unknown> }) {
    const targetId = data.student_id || data.user_id;
    if (!this.privacy.canCollectAnalytics(targetId)) {
      return { persisted: false, reason: 'consent_disabled' };
    }
    return {
      persisted: true,
      event: this.repo.logLearningEvent({
        student_id: targetId,
        user_id: data.user_id,
        content_id: data.content_id,
        action: data.action,
        performance: data.performance,
        score: data.score,
        time_spent: data.time_spent,
        difficulty: data.difficulty,
        metadata: scrubPipelineMetadata(data.metadata),
      }),
    };
  }
}
