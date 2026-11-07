/**
 * CDES Universal Client Telemetry & Event Tracking Service
 * Dispatches User, Education, AI, Game, and Virtual World events to /api/analytics/track
 */

export interface TrackPayload {
  eventType: string;
  studentId?: string;
  sessionId?: string;
  duration?: number;
  contentId?: string;
  action?: string;
  score?: number;
  timeSpent?: number;
  difficulty?: string;
  gameId?: string;
  level?: number;
  attempt?: number;
  success?: boolean | number;
  failureReason?: string;
  timeTaken?: number;
  metadata?: Record<string, any>;
}

class AnalyticsTracker {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    try {
      let sid = sessionStorage.getItem('cdes_session_id');
      if (!sid) {
        sid = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('cdes_session_id', sid);
      }
      return sid;
    } catch {
      return `sess-${Date.now()}`;
    }
  }

  public async track(payload: TrackPayload): Promise<boolean> {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const body = {
        sessionId: this.sessionId,
        ...payload
      };

      const res = await fetch('/api/analytics/track', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      return res.ok;
    } catch (err) {
      console.warn('Silent analytics tracking failure:', err);
      return false;
    }
  }

  // A. User Events
  public trackPageVisit(pageName: string, metadata?: Record<string, any>) {
    return this.track({
      eventType: 'page_visit',
      metadata: { pageName, ...metadata }
    });
  }

  public trackSearch(query: string, category: string = 'general', resultsCount?: number) {
    return this.track({
      eventType: 'search',
      metadata: { query, category, resultsCount }
    });
  }

  public trackBookmark(itemType: 'scholarship' | 'university' | 'major', itemId: string) {
    return this.track({
      eventType: 'bookmark',
      metadata: { itemType, itemId }
    });
  }

  // B. Education Events
  public trackLessonStarted(contentId: string, difficulty?: string) {
    return this.track({
      eventType: 'lesson_started',
      contentId,
      action: 'lesson_started',
      difficulty
    });
  }

  public trackLessonCompleted(contentId: string, timeSpentSeconds: number, score?: number) {
    return this.track({
      eventType: 'lesson_completed',
      contentId,
      action: 'lesson_completed',
      timeSpent: timeSpentSeconds,
      score
    });
  }

  public trackQuizAttempt(contentId: string, score: number, timeSpentSeconds: number, difficulty?: string) {
    return this.track({
      eventType: 'quiz_attempt',
      contentId,
      action: 'quiz_attempt',
      score,
      timeSpent: timeSpentSeconds,
      difficulty
    });
  }

  // C. AI Interaction Events
  public trackAIQuestion(question: string, topic?: string) {
    return this.track({
      eventType: 'ai_question',
      metadata: { question, topic }
    });
  }

  public trackCareerAnalysis(interests: string[], recommendedMajor: string) {
    return this.track({
      eventType: 'career_analysis',
      metadata: { interests, recommendedMajor }
    });
  }

  public trackScholarshipMatching(studentGpa?: number, filteredCount?: number) {
    return this.track({
      eventType: 'scholarship_matching',
      metadata: { studentGpa, filteredCount }
    });
  }

  // D. Game Events
  public trackGameLevel(data: {
    gameId: string;
    level: number;
    attempt: number;
    success: boolean;
    timeTaken: number;
    score?: number;
    failureReason?: string;
  }) {
    return this.track({
      eventType: data.success ? 'level_completed' : 'level_failed',
      gameId: data.gameId,
      level: data.level,
      attempt: data.attempt,
      success: data.success,
      timeTaken: data.timeTaken,
      score: data.score,
      failureReason: data.failureReason
    });
  }

  // E. Virtual World Events
  public trackVirtualWorldAction(action: 'avatar_created' | 'room_customized' | 'friend_interaction' | 'environment_exploration', details?: Record<string, any>) {
    return this.track({
      eventType: action,
      metadata: details
    });
  }
}

export const analyticsTracker = new AnalyticsTracker();
