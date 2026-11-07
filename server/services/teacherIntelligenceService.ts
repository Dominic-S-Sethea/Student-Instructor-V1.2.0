/**
 * CDES Teacher Intelligence Foundation Service
 * Provides actionable classroom analytics and pedagogical intervention recommendations
 * for Cambodian high school and university educators.
 */

import { getDatabase } from '../db/connection';

export interface TeacherClassCohort {
  id: string;
  className: string;
  gradeLevel: string;
  subject: string;
  schoolName: string;
  province: string;
  studentCount: number;
  averageMasteryPercentage: number;
  learningVelocityIndex: number;
  topMisconceptions: Array<{ code: string; title: string; affectedPercentage: number }>;
  recommendedInterventions: string[];
  studentsNeedingScaffolding: number;
  studentsAccelerating: number;
  updatedAt: string;
}

export class TeacherIntelligenceService {
  private db = getDatabase();

  public getClassCohorts(): TeacherClassCohort[] {
    const rows = this.db.prepare(`
      SELECT * FROM teacher_class_analytics
      ORDER BY average_mastery_percentage DESC
    `).all() as any[];

    return rows.map(r => ({
      id: r.id,
      className: r.class_name,
      gradeLevel: r.grade_level,
      subject: r.subject,
      schoolName: r.school_name,
      province: r.province,
      studentCount: r.student_count,
      averageMasteryPercentage: r.average_mastery_percentage,
      learningVelocityIndex: r.learning_velocity_index,
      topMisconceptions: JSON.parse(r.top_misconceptions || '[]'),
      recommendedInterventions: JSON.parse(r.recommended_interventions || '[]'),
      studentsNeedingScaffolding: r.students_needing_scaffolding,
      studentsAccelerating: r.students_accelerating,
      updatedAt: r.updated_at,
    }));
  }

  public getClassCohortById(id: string): TeacherClassCohort | null {
    const r = this.db.prepare(`
      SELECT * FROM teacher_class_analytics WHERE id = ?
    `).get(id) as any;

    if (!r) return null;

    return {
      id: r.id,
      className: r.class_name,
      gradeLevel: r.grade_level,
      subject: r.subject,
      schoolName: r.school_name,
      province: r.province,
      studentCount: r.student_count,
      averageMasteryPercentage: r.average_mastery_percentage,
      learningVelocityIndex: r.learning_velocity_index,
      topMisconceptions: JSON.parse(r.top_misconceptions || '[]'),
      recommendedInterventions: JSON.parse(r.recommended_interventions || '[]'),
      studentsNeedingScaffolding: r.students_needing_scaffolding,
      studentsAccelerating: r.students_accelerating,
      updatedAt: r.updated_at,
    };
  }

  public generateInterventionPlan(classId: string) {
    const cohort = this.getClassCohortById(classId);
    if (!cohort) return null;

    return {
      classId: cohort.id,
      className: cohort.className,
      school: cohort.schoolName,
      diagnosticOverview: `Cohort consists of ${cohort.studentCount} students with an average concept mastery of ${cohort.averageMasteryPercentage}% and a learning velocity of ${cohort.learningVelocityIndex}x.`,
      urgencyLevel: cohort.averageMasteryPercentage < 75 ? 'Elevated' : 'Moderate',
      targetedActions: cohort.recommendedInterventions,
      scaffoldingGroup: {
        count: cohort.studentsNeedingScaffolding,
        recommendedStrategy: 'Provide visual 2D interactive micro-simulations and ZPD level 4 scaffolding before advancing to Bac II proof sets.',
      },
      accelerationGroup: {
        count: cohort.studentsAccelerating,
        recommendedStrategy: 'Assign university entrance scholarship challenge problems and invite them to become peer study circle mentors.',
      },
      createdAt: new Date().toISOString(),
    };
  }
}
