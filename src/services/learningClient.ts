import { apiGet, apiPost } from './apiClient';
import {
  Subject,
  LearningContent,
  LabExperiment,
  LabExperimentResult,
  LearningActivity,
  StudentActivityProgress,
  LearningPath,
  StudentLearningPath,
  StudentAIEducationProfile,
  LearningPathStep,
} from '../../shared/types/learningTypes';

export interface ExperimentWithStatus extends LabExperiment {
  student_status?: 'unattempted' | 'in_progress' | 'completed';
  best_score?: number | null;
  attempts?: number;
}

export interface ActivityWithStatus extends LearningActivity {
  progress?: StudentActivityProgress;
  student_status?: 'unattempted' | 'in_progress' | 'completed';
  student_score?: number | null;
}

export interface RoadmapWithStatus extends LearningPath {
  student_id?: string;
  is_enrolled: boolean | number;
  progress_percentage: number;
  current_step_order?: number;
  current_step?: number | LearningPathStep;
}

export interface LearningRewardResponse {
  result?: LabExperimentResult;
  observation_notes?: string;
  meritPointsEarned?: number;
  unlockedBadge?: string | null;
  itemRewardName?: string | null;
  progress?: StudentActivityProgress;
}

export class LearningClient {
  private baseUrl = '/api/learning';

  public async getSubjects(_studentId?: string): Promise<Subject[]> {
    return (await apiGet<Subject[]>(`${this.baseUrl}/subjects`)) || [];
  }

  public async getContent(params: { studentId?: string; category?: string; type?: string; page?: number }): Promise<LearningContent[]> {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category_id', params.category);
    if (params.type) qs.set('content_type', params.type);
    const q = qs.toString();
    return (await apiGet<LearningContent[]>(`${this.baseUrl}/content${q ? `?${q}` : ''}`)) || [];
  }

  public async getContentById(contentId: string, _studentId?: string): Promise<LearningContent> {
    return apiGet<LearningContent>(`${this.baseUrl}/content/${encodeURIComponent(contentId)}`);
  }

  public async getExperiments(_experimentId?: string, subjectId?: string): Promise<LabExperiment[]> {
    const q = subjectId ? `?subject_id=${encodeURIComponent(subjectId)}` : '';
    return (await apiGet<LabExperiment[]>(`${this.baseUrl}/experiments${q}`)) || [];
  }

  public async getExperimentAction(experimentId: string, action: string, _studentId?: string): Promise<LearningRewardResponse> {
    return apiPost<LearningRewardResponse>(`${this.baseUrl}/experiments/${encodeURIComponent(experimentId)}/action`, {
      actionName: action,
    });
  }

  public async getExperimentResult(
    experimentId: string,
    _studentId?: string
  ): Promise<{ experiment: LabExperiment; user_session: LabExperimentResult | null }> {
    return apiGet<{ experiment: LabExperiment; user_session: LabExperimentResult | null }>(
      `${this.baseUrl}/experiments/${encodeURIComponent(experimentId)}`
    );
  }

  public async getStudentProgress(_pathId?: string, _studentId?: string): Promise<RoadmapWithStatus[]> {
    return (await apiGet<RoadmapWithStatus[]>(`${this.baseUrl}/paths`)) || [];
  }

  public async enrollPath(_studentId: string, pathId: string): Promise<void> {
    await apiPost(`${this.baseUrl}/paths/${encodeURIComponent(pathId)}/enroll`, {});
  }

  public async advancePath(_studentId: string, pathId: string, stepOrder: number | string): Promise<void> {
    await apiPost(`${this.baseUrl}/paths/${encodeURIComponent(pathId)}/advance`, { stepOrder: Number(stepOrder) || 1 });
  }

  public async getStudentAIProfile(_studentId?: string): Promise<StudentAIEducationProfile> {
    return apiGet<StudentAIEducationProfile>(`${this.baseUrl}/student-ai-profile`);
  }

  public async trackEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    await apiPost(`${this.baseUrl}/analytics/event`, { eventType, metadata: payload });
  }

  public async getContentCatalog(
    params: { subject_id?: string; category_id?: string; content_type?: string; difficulty?: string; search?: string },
    _studentId?: string
  ): Promise<LearningContent[]> {
    const qs = new URLSearchParams();
    if (params.subject_id) qs.set('subject_id', params.subject_id);
    if (params.category_id) qs.set('category_id', params.category_id);
    if (params.content_type) qs.set('content_type', params.content_type);
    if (params.difficulty) qs.set('difficulty', params.difficulty);
    if (params.search) qs.set('search', params.search);
    const q = qs.toString();
    return (await apiGet<LearningContent[]>(`${this.baseUrl}/content${q ? `?${q}` : ''}`)) || [];
  }

  public async logAnalyticsEvent(eventType: string, payload?: Record<string, unknown>): Promise<void> {
    await apiPost(`${this.baseUrl}/analytics/event`, { eventType, metadata: payload || {} });
  }

  public async getContentDetail(contentId: string, _studentId?: string): Promise<LearningContent> {
    return apiGet<LearningContent>(`${this.baseUrl}/content/${encodeURIComponent(contentId)}`);
  }

  public async getRoadmaps(_studentId?: string): Promise<RoadmapWithStatus[]> {
    return (await apiGet<RoadmapWithStatus[]>(`${this.baseUrl}/paths`)) || [];
  }

  public async enrollRoadmap(pathId: string, _studentId?: string): Promise<boolean> {
    await apiPost(`${this.baseUrl}/paths/${encodeURIComponent(pathId)}/enroll`, {});
    return true;
  }

  public async advanceRoadmap(pathId: string, currentStep: number, _studentId?: string): Promise<boolean> {
    await apiPost(`${this.baseUrl}/paths/${encodeURIComponent(pathId)}/advance`, { stepOrder: currentStep });
    return true;
  }

  public async getActivities(subject?: string, type?: string, _studentId?: string): Promise<LearningActivity[]> {
    const qs = new URLSearchParams();
    if (subject) qs.set('subject_id', subject);
    if (type) qs.set('type', type);
    const q = qs.toString();
    return (await apiGet<LearningActivity[]>(`${this.baseUrl}/activities${q ? `?${q}` : ''}`)) || [];
  }

  public async recordActivityAction(
    activityId: string,
    action: string,
    data?: Record<string, unknown>,
    score?: number,
    _studentId?: string
  ): Promise<LearningRewardResponse> {
    return apiPost<LearningRewardResponse>(`${this.baseUrl}/activities/${encodeURIComponent(activityId)}/action`, {
      action,
      responseData: data,
      score,
    });
  }

  public async getLabExperiments(_experimentId?: string, subjectId?: string): Promise<LabExperiment[]> {
    return this.getExperiments(undefined, subjectId);
  }

  public async getExperimentDetail(
    experimentId: string,
    _studentId?: string
  ): Promise<{ experiment: LabExperiment; user_session: LabExperimentResult | null }> {
    return apiGet<{ experiment: LabExperiment; user_session: LabExperimentResult | null }>(
      `${this.baseUrl}/experiments/${encodeURIComponent(experimentId)}`
    );
  }

  public async completeLabExperiment(
    experimentId: string,
    parametersUsed: unknown,
    outcomeData: unknown,
    score: number,
    _studentId?: string,
    observationNotes?: string
  ): Promise<LearningRewardResponse> {
    return apiPost<LearningRewardResponse>(`${this.baseUrl}/experiments/${encodeURIComponent(experimentId)}/complete`, {
      parametersUsed,
      outcomeData,
      score,
      observationNotes,
    });
  }
}

export const learningClient = new LearningClient();
