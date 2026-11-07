import { LearningRepository } from '../repositories/learningRepository';
import { AnalyticsRepository } from '../repositories/analyticsRepository';

export class LearningService {
  private learningRepo = new LearningRepository();
  private analyticsRepo = new AnalyticsRepository();

  // 1. Digital Library
  getSubjectsWithCategories() {
    const subjects = this.learningRepo.getSubjects();
    const categories = this.learningRepo.getCategories();

    return subjects.map((s) => ({
      ...s,
      categories: categories.filter((c) => c.subject_id === s.id),
    }));
  }

  getContentCatalog(filters?: {
    subject_id?: string;
    category_id?: string;
    content_type?: string;
    difficulty?: string;
    search?: string;
  }) {
    return this.learningRepo.getLearningContents(filters);
  }

  getContentDetail(contentId: string, studentId?: string) {
    const content = this.learningRepo.getLearningContentById(contentId);
    if (!content) return null;

    if (studentId) {
      this.learningRepo.logLearningHistory({
        student_id: studentId,
        entity_type: 'content',
        entity_id: contentId,
        title: content.title,
        subject: content.subject_name || 'General STEM',
        action: 'opened',
        time_spent_seconds: 30,
        strengths_observed: ['Curiosity', 'Domain Inquiry'],
      });

      this.analyticsRepo.logLearningEvent({
        student_id: studentId,
        content_id: contentId,
        action: 'content_opened',
        metadata: { contentType: content.content_type, difficulty: content.difficulty },
      });
    }

    return content;
  }

  // 2. Virtual Laboratory
  getLaboratoryCatalog(studentId?: string, subjectId?: string) {
    const experiments = this.learningRepo.getLabExperiments(subjectId);
    const results = studentId ? this.learningRepo.getStudentLabResults(studentId) : [];

    return experiments.map((exp) => {
      const studentResult = results.find((r) => r.experiment_id === exp.id);
      return {
        ...exp,
        student_status: studentResult ? studentResult.status : 'unattempted',
        best_score: studentResult ? studentResult.score : null,
        attempts: studentResult ? studentResult.attempts_count : 0,
      };
    });
  }

  getExperimentDetail(experimentId: string, studentId?: string) {
    const exp = this.learningRepo.getLabExperimentById(experimentId);
    if (!exp) return null;

    const results = studentId ? this.learningRepo.getStudentLabResults(studentId) : [];
    const studentResult = results.find((r) => r.experiment_id === exp.id);

    return {
      experiment: exp,
      user_session: studentResult || null,
    };
  }

  recordLabAction(params: {
    studentId: string;
    experimentId: string;
    actionName: string;
    parameters?: any;
    observationNotes?: string;
  }) {
    return this.learningRepo.startOrUpdateLabExperiment(params);
  }

  completeLabExperiment(params: {
    studentId: string;
    experimentId: string;
    parametersUsed: any;
    outcomeData: any;
    score: number;
    observationNotes?: string;
  }) {
    return this.learningRepo.completeLabExperiment(params);
  }

  // 3. STEM Learning Activities
  getActivitiesCatalog(studentId?: string, subjectId?: string, activityType?: string) {
    const activities = this.learningRepo.getLearningActivities(subjectId, activityType);
    const progresses = studentId ? this.learningRepo.getStudentActivityProgress(studentId) : [];

    return activities.map((act) => {
      const prog = progresses.find((p) => p.activity_id === act.id);
      return {
        ...act,
        student_status: prog ? prog.status : 'unattempted',
        student_score: prog ? prog.score : 0,
        hint_used_count: prog ? prog.hint_used_count : 0,
      };
    });
  }

  recordActivityInteraction(params: {
    studentId: string;
    activityId: string;
    action: 'started' | 'hint_used' | 'completed';
    responseData?: any;
    score?: number;
  }) {
    return this.learningRepo.recordActivityAction(params);
  }

  // 4. Learning Paths
  getLearningRoadmaps(studentId?: string) {
    const allPaths = this.learningRepo.getLearningPaths();
    const enrolled = studentId ? this.learningRepo.getStudentLearningPaths(studentId) : [];

    return allPaths.map((p) => {
      const studentPath = enrolled.find((e) => e.path_id === p.id);
      return {
        ...p,
        is_enrolled: !!studentPath,
        current_step: studentPath ? studentPath.current_step_order : 1,
        progress_percentage: studentPath ? studentPath.progress_percentage : 0,
        status: studentPath ? studentPath.status : 'available',
      };
    });
  }

  enrollInRoadmap(studentId: string, pathId: string) {
    return this.learningRepo.enrollLearningPath(studentId, pathId);
  }

  advanceRoadmap(studentId: string, pathId: string, stepOrder: number) {
    return this.learningRepo.advanceLearningPathStep(studentId, pathId, stepOrder);
  }

  // 5. AI Education Profile Preparation
  getStudentAIProfile(studentId: string) {
    return this.learningRepo.getStudentAIEducationProfile(studentId);
  }

  // 6. Generic Analytics Event Logger
  logLearningEvent(studentId: string, eventType: string, metadata: any = {}) {
    this.analyticsRepo.logActivityEvent({
      user_id: studentId,
      student_id: studentId,
      event_type: eventType.toUpperCase(),
      metadata,
    });
  }
}
