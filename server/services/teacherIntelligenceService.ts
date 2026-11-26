/**
 * CDES Teacher Intelligence Foundation Service
 * Provides actionable classroom analytics and pedagogical intervention recommendations
 * for Cambodian high school and university educators.
 */

import { getDatabase } from '../db/connection';
import { safeJsonParse } from '../utils/safeJson';

interface TeacherClassRow {
  id: string;
  class_name: string;
  grade_level: string;
  subject: string;
  school_name: string;
  province: string;
  student_count: number;
  average_mastery_percentage: number;
  learning_velocity_index: number;
  top_misconceptions: string | null;
  recommended_interventions: string | null;
  students_needing_scaffolding: number;
  students_accelerating: number;
  updated_at: string;
}

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
  private get db() {
    return getDatabase();
  }

  private mapRow(r: TeacherClassRow): TeacherClassCohort {
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
      topMisconceptions: safeJsonParse(r.top_misconceptions, []),
      recommendedInterventions: safeJsonParse(r.recommended_interventions, []),
      studentsNeedingScaffolding: r.students_needing_scaffolding,
      studentsAccelerating: r.students_accelerating,
      updatedAt: r.updated_at,
    };
  }

  public getClassCohorts(): TeacherClassCohort[] {
    const rows = this.db.prepare(`
      SELECT * FROM teacher_class_analytics
      ORDER BY average_mastery_percentage DESC
      LIMIT 200
    `).all() as unknown as TeacherClassRow[];

    return rows.map((r) => this.mapRow(r));
  }

  public getClassCohortById(id: string): TeacherClassCohort | null {
    const r = this.db.prepare(`
      SELECT * FROM teacher_class_analytics WHERE id = ?
    `).get(id) as TeacherClassRow | undefined;

    if (!r) return null;
    return this.mapRow(r);
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
