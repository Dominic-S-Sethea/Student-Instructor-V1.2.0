import { apiGet, apiPost } from "./apiClient";
import {
  Subject,
  Category,
  LearningContent,
  LabExperiment,
  LabExperimentResult,
  LearningActivity,
  StudentActivityProgress,
  LearningPath,
  StudentLearningPath,
  StudentAIEducationProfile,
  LearningPathStep,
} from "../../server/types/learningTypes";

export interface ExperimentWithStatus extends LabExperiment {
  student_status?: "unattempted" | "in_progress" | "completed";
  best_score?: number | null;
  attempts?: number;
}

export interface ActivityWithStatus extends LearningActivity {
  progress?: StudentActivityProgress;
  student_status?: "unattempted" | "in_progress" | "completed";
  student_score?: number | null;
}

export interface RoadmapWithStatus extends LearningPath {
  student_id: string;
  is_enrolled: number;
  progress_percentage: number;
  current_step_order: number;
  current_step?: LearningPathStep;
}

export class LearningClient {
  private baseUrl = "/api/learning";

  public async getSubjects(studentId: string): Promise<Subject[]> {
    const res = await apiGet(`${this.baseUrl}/subjects?studentId=${studentId}`);
    if (!res.ok) throw new Error("Failed to fetch subjects");
    const json = await res.json();
    return json.data;
  }

  public async getContent(params: { studentId: string; category?: string; type?: string; page?: number }): Promise<LearningContent[]> {
    const url = new URL(`${this.baseUrl}/content`);
    url.searchParams.append("studentId", params.studentId);
    if (params.category) url.searchParams.append("category", params.category);
    if (params.type) url.searchParams.append("type", params.type);
    const res = await apiGet(url.toString());
    if (!res.ok) throw new Error("Failed to fetch content");
    const json = await res.json();
    return json.data;
  }

  public async getContentById(contentId: string, studentId: string): Promise<LearningContent> {
    const res = await apiGet(`${this.baseUrl}/content/${contentId}?studentId=${studentId}`);
    if (!res.ok) throw new Error("Failed to fetch content");
    const json = await res.json();
    return json.data;
  }

  public async getExperiments(experimentId: string, studentId: string): Promise<LabExperiment[]> {
    const res = await apiGet(`${this.baseUrl}/experiments/${experimentId}?studentId=${studentId}`);
    if (!res.ok) throw new Error("Failed to fetch experiments");
    const json = await res.json();
    return json.data;
  }

  public async getExperimentAction(experimentId: string, action: string, studentId: string): Promise<any> {
    const res = await apiPost(`${this.baseUrl}/experiments/${experimentId}/action`, { studentId, action });
    if (!res.ok) throw new Error("Failed to execute experiment action");
    const json = await res.json();
    return json.data;
  }

  public async getExperimentResult(experimentId: string, studentId: string): Promise<LabExperimentResult> {
    const res = await apiGet(`${this.baseUrl}/experiments/${experimentId}/result?studentId=${studentId}`);
    if (!res.ok) throw new Error("Failed to fetch experiment result");
    const json = await res.json();
    return json.data;
  }


  public async getStudentProgress(pathId: string, studentId: string): Promise<StudentLearningPath> {
    const res = await apiGet(`${this.baseUrl}/paths/${pathId}?studentId=${studentId}`);
    if (!res.ok) throw new Error("Failed to fetch student path");
    const json = await res.json();
    return json.data;
  }

  public async enrollPath(studentId: string, pathId: string): Promise<void> {
    await apiPost(`${this.baseUrl}/paths/${pathId}/enroll`, { studentId, pathId });
  }

  public async advancePath(studentId: string, pathId: string, activityId: string): Promise<void> {
    await apiPost(`${this.baseUrl}/paths/${pathId}/advance`, { studentId, pathId, activityId });
  }

  public async getStudentAIProfile(studentId: string): Promise<StudentAIEducationProfile> {
    const res = await apiGet(`${this.baseUrl}/student-ai-profile?studentId=${studentId}`);
    if (!res.ok) throw new Error("Failed to fetch AI education profile");
    const json = await res.json();
    return json.data;
  }

  public async trackEvent(eventType: string, payload: any): Promise<void> {
    await apiPost(`${this.baseUrl}/analytics/event`, { ...payload, eventType });
  }

  // ---- content / catalog ----
  public async getContentCatalog(
    params: { subject_id?: string; category_id?: string; content_type?: string; difficulty?: string; search?: string },
    studentId?: string
  ): Promise<LearningContent[]> {
    const url = new URL(`${this.baseUrl}/content-catalog`);
    if (params.subject_id) url.searchParams.append("subject_id", params.subject_id);
    if (params.category_id) url.searchParams.append("category_id", params.category_id);
    if (params.content_type) url.searchParams.append("content_type", params.content_type);
    if (params.difficulty) url.searchParams.append("difficulty", params.difficulty);
    if (params.search) url.searchParams.append("search", params.search);
    if (studentId) url.searchParams.append("studentId", studentId);
    const res = await apiGet(url.toString());
    return res.data || [];
  }

  public async logAnalyticsEvent(eventType: string, payload?: any): Promise<void> {
    await apiPost(`${this.baseUrl}/analytics/event`, { eventType, ...payload });
  }

  public async getContentDetail(contentId: string, studentId: string): Promise<LearningContent> {
    const res = await apiGet(`${this.baseUrl}/content/${contentId}?studentId=${studentId}`);
    return res.data;
  }

  // ---- roadmaps ----
  public async getRoadmaps(studentId: string): Promise<RoadmapWithStatus[]> {
    const res = await apiGet(`${this.baseUrl}/roadmaps?studentId=${studentId}`);
    return res.data || [];
  }

  public async enrollRoadmap(pathId: string, studentId: string): Promise<boolean> {
    const res = await apiPost(`${this.baseUrl}/paths/${pathId}/enroll`, { studentId, pathId });
    return res.data?.enrolled ?? false;
  }

  public async advanceRoadmap(pathId: string, currentStep: number, studentId: string): Promise<boolean> {
    const res = await apiPost(`${this.baseUrl}/paths/${pathId}/advance`, { studentId, pathId, currentStep });
    return res.data?.advanced ?? false;
  }

  // ---- activities ----
  public async getActivities(subject?: string, type?: string, studentId?: string): Promise<LearningActivity[]> {
    const url = new URL(`${this.baseUrl}/activities`);
    if (subject) url.searchParams.append("subject", subject);
    if (type) url.searchParams.append("type", type);
    if (studentId) url.searchParams.append("studentId", studentId);
    const res = await apiGet(url.toString());
    return res.data || [];
  }

  public async recordActivityAction(
    activityId: string,
    action: string,
    data?: any,
    score?: number,
    studentId?: string
  ): Promise<any> {
    const body: any = { activityId, action, ...(data || {}) };
    if (score !== undefined) body.score = score;
    if (studentId) body.studentId = studentId;
    const res = await apiPost(`${this.baseUrl}/activities/${activityId}/action`, body);
    return res.data;
  }

  // ---- experiments / lab ----
  public async getLabExperiments(experimentId: string, studentId: string): Promise<LabExperiment[]> {
    const res = await apiGet(`${this.baseUrl}/experiments/${experimentId}/student?studentId=${studentId}`);
    return res.data || [];
  }

  public async getExperimentDetail(experimentId: string, studentId: string): Promise<{ experiment: LabExperiment; user_session: any }> {
    const res = await apiGet(`${this.baseUrl}/experiments/${experimentId}?studentId=${studentId}`);
    return res.data;
  }

  public async completeLabExperiment(
    experimentId: string,
    parametersUsed: any,
    outcomeData: any,
    score: number,
    studentId: string,
    observationNotes?: string
  ): Promise<any> {
    const res = await apiPost(`${this.baseUrl}/experiments/${experimentId}/complete`, { experimentId, parametersUsed, outcomeData, score, observationNotes, studentId });
    return res.data;
  }
}

export const learningClient = new LearningClient();
