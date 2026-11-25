/**
 * CDES Advanced Learning Science Engine
 * Core scientific algorithms for:
 * 1. Bayesian Knowledge Tracing (BKT) Mastery Modeling
 * 2. Dynamic Zone of Proximal Development (ZPD) Difficulty Adjustment
 * 3. Ebbinghaus Memory Decay & Spaced Retrieval Scheduling
 * 4. Error & Misconception Taxonomy Classification
 */

import { getDatabase } from '../db/connection';
import crypto from 'crypto';

export interface BKTParameters {
  priorL0: number;      // P(L0) Initial mastery prior
  transitionT: number;  // P(T) Probability of learning / transition
  guessG: number;       // P(G) Probability of correct guess without mastery
  slipS: number;        // P(S) Probability of slip / careless mistake despite mastery
}

export interface MasteryUpdateResult {
  conceptId: string;
  conceptName: string;
  previousMastery: number;
  updatedMastery: number;
  masteryStatus: 'emerging' | 'developing' | 'mastered' | 'retained';
  isMastered: boolean;
  recommendedAction: string;
}

export interface ZPDAssessmentResult {
  studentId: string;
  recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'challenge';
  scaffoldingLevel: 1 | 2 | 3 | 4 | 5; // 1 = minimal hints, 5 = high step-by-step guidance
  cognitiveLoadIndex: number; // 0 - 100
  interventionType: 'advance_challenge' | 'maintain_flow' | 'provide_scaffold' | 'remedial_simulation';
  reasoning: string;
}

export interface RetentionForecast {
  daysElapsed: number;
  projectedRetentionPercentage: number;
  memoryStabilityIndex: number;
  recommendedReviewDay: number;
  urgency: 'low' | 'moderate' | 'high' | 'critical';
}

export class LearningScienceEngine {
  private get db() {
    return getDatabase();
  }

  /**
   * Standard default BKT parameters calibrated on STEM education research
   */
  private defaultBKT: BKTParameters = {
    priorL0: 0.15,
    transitionT: 0.18,
    guessG: 0.20,
    slipS: 0.10,
  };

  /**
   * Bayesian Knowledge Tracing (BKT) State Update:
   * P(L_t | action) -> P(L_t+1) = P(L_t) + (1 - P(L_t)) * P(T)
   */
  public updateStudentMastery(
    studentId: string,
    conceptId: string,
    isCorrect: boolean,
    conceptMetadata?: { name?: string; subject?: string }
  ): MasteryUpdateResult {
    const existing = this.db.prepare(`
      SELECT * FROM student_mastery_states
      WHERE student_id = ? AND concept_id = ?
    `).get(studentId, conceptId) as any;

    const pL_prev = existing ? existing.current_mastery_prob : this.defaultBKT.priorL0;
    const pT = existing ? existing.transition_prob_p_t : this.defaultBKT.transitionT;
    const pG = existing ? existing.guess_prob_p_g : this.defaultBKT.guessG;
    const pS = existing ? existing.slip_prob_p_s : this.defaultBKT.slipS;

    let pL_posterior: number;
    if (isCorrect) {
      // P(L | correct) = [P(L) * (1 - S)] / [P(L) * (1 - S) + (1 - P(L)) * G]
      const numerator = pL_prev * (1 - pS);
      const denominator = (pL_prev * (1 - pS)) + ((1 - pL_prev) * pG);
      pL_posterior = numerator / Math.max(0.0001, denominator);
    } else {
      // P(L | incorrect) = [P(L) * S] / [P(L) * S + (1 - P(L)) * (1 - G)]
      const numerator = pL_prev * pS;
      const denominator = (pL_prev * pS) + ((1 - pL_prev) * (1 - pG));
      pL_posterior = numerator / Math.max(0.0001, denominator);
    }

    // Apply learning transition probability
    const pL_next = pL_posterior + ((1 - pL_posterior) * pT);
    const boundedMastery = Math.min(0.99, Math.max(0.01, Math.round(pL_next * 1000) / 1000));

    let status: 'emerging' | 'developing' | 'mastered' | 'retained' = 'emerging';
    if (boundedMastery >= 0.90) {
      status = (existing && existing.correct_streak >= 4) ? 'retained' : 'mastered';
    } else if (boundedMastery >= 0.65) {
      status = 'developing';
    } else {
      status = 'emerging';
    }

    const newStreak = isCorrect ? ((existing?.correct_streak || 0) + 1) : 0;
    const totalOps = (existing?.total_opportunities || 0) + 1;
    const now = new Date().toISOString();

    const conceptName = conceptMetadata?.name || existing?.concept_name || conceptId;
    const subject = conceptMetadata?.subject || existing?.subject || 'STEM Foundations';

    if (existing) {
      this.db.prepare(`
        UPDATE student_mastery_states
        SET current_mastery_prob = ?,
            mastery_status = ?,
            total_opportunities = ?,
            correct_streak = ?,
            last_practiced_at = ?,
            updated_at = ?
        WHERE id = ?
      `).run(boundedMastery, status, totalOps, newStreak, now, now, existing.id);
    } else {
      const id = `mst-${crypto.randomUUID().slice(0, 8)}`;
      this.db.prepare(`
        INSERT INTO student_mastery_states (
          id, student_id, concept_id, concept_name, subject,
          prior_mastery_p_l0, transition_prob_p_t, guess_prob_p_g, slip_prob_p_s,
          current_mastery_prob, mastery_status, total_opportunities, correct_streak,
          last_practiced_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, studentId, conceptId, conceptName, subject,
        this.defaultBKT.priorL0, pT, pG, pS,
        boundedMastery, status, totalOps, newStreak, now, now
      );
    }

    let recommendedAction = '';
    if (status === 'retained' || status === 'mastered') {
      recommendedAction = 'Concept mastered. Transition to higher complexity transfer challenges.';
    } else if (status === 'developing') {
      recommendedAction = 'Progressing well. Provide 1-2 interleaved practice questions.';
    } else {
      recommendedAction = 'Mastery emerging. Recommend interactive micro-simulation or Socratic inquiry.';
    }

    return {
      conceptId,
      conceptName,
      previousMastery: pL_prev,
      updatedMastery: boundedMastery,
      masteryStatus: status,
      isMastered: boundedMastery >= 0.85,
      recommendedAction,
    };
  }

  /**
   * Dynamic Zone of Proximal Development (ZPD) Difficulty Engine
   * Balances student frustration vs boredom by dynamically calibrating scaffolding
   */
  public evaluateZPD(studentId: string, subject?: string): ZPDAssessmentResult {
    // Read recent mastery and event metrics
    const masteryRows = this.db.prepare(`
      SELECT current_mastery_prob, correct_streak, mastery_status
      FROM student_mastery_states
      WHERE student_id = ? ${subject ? 'AND subject = ?' : ''}
    `).all(...(subject ? [studentId, subject] : [studentId])) as any[];

    const avgMastery = masteryRows.length > 0
      ? masteryRows.reduce((sum, r) => sum + r.current_mastery_prob, 0) / masteryRows.length
      : 0.50;

    const maxStreak = masteryRows.reduce((max, r) => Math.max(max, r.correct_streak || 0), 0);

    // Calculate cognitive load estimate
    let cognitiveLoadIndex = Math.round((1 - avgMastery) * 100);

    let recommendedDifficulty: ZPDAssessmentResult['recommendedDifficulty'] = 'intermediate';
    let scaffoldingLevel: ZPDAssessmentResult['scaffoldingLevel'] = 3;
    let interventionType: ZPDAssessmentResult['interventionType'] = 'maintain_flow';
    let reasoning = '';

    if (avgMastery > 0.82 && maxStreak >= 3) {
      recommendedDifficulty = 'challenge';
      scaffoldingLevel = 1;
      interventionType = 'advance_challenge';
      cognitiveLoadIndex = 30;
      reasoning = 'Student demonstrates strong competency fluency. Advancing to multi-step synthesis challenge with minimal scaffolding.';
    } else if (avgMastery >= 0.65) {
      recommendedDifficulty = 'advanced';
      scaffoldingLevel = 2;
      interventionType = 'maintain_flow';
      cognitiveLoadIndex = 55;
      reasoning = 'Student is in the optimal Zone of Proximal Development (Flow state). Maintain standard challenge with reflective hints.';
    } else if (avgMastery >= 0.40) {
      recommendedDifficulty = 'intermediate';
      scaffoldingLevel = 4;
      interventionType = 'provide_scaffold';
      cognitiveLoadIndex = 75;
      reasoning = 'Emerging mastery detected. Providing structured Socratic prompt scaffolding and step-by-step vector breakdowns.';
    } else {
      recommendedDifficulty = 'beginner';
      scaffoldingLevel = 5;
      interventionType = 'remedial_simulation';
      cognitiveLoadIndex = 88;
      reasoning = 'Cognitive overload risk detected. Redirecting to visual interactive lab simulation to build intuitive foundations before equations.';
    }

    return {
      studentId,
      recommendedDifficulty,
      scaffoldingLevel,
      cognitiveLoadIndex,
      interventionType,
      reasoning,
    };
  }

  /**
   * Ebbinghaus Memory Decay Projection
   * R = e^(-t / S) where S is stability in days
   */
  public forecastRetention(daysElapsed: number, reviewCount: number = 1): RetentionForecast {
    // Stability increases with each spaced retrieval repetition: S = S0 * (1 + 1.2 * reviews)
    const baseStabilityDays = 7;
    const stabilityIndex = Math.round((baseStabilityDays * (1 + (1.4 * Math.max(0, reviewCount - 1)))) * 10) / 10;
    
    // Ebbinghaus exponential decay equation
    const retentionRate = Math.exp(-daysElapsed / stabilityIndex);
    const projectedPercent = Math.min(100, Math.max(5, Math.round(retentionRate * 1000) / 10));

    let urgency: RetentionForecast['urgency'] = 'low';
    if (projectedPercent < 50) urgency = 'critical';
    else if (projectedPercent < 65) urgency = 'high';
    else if (projectedPercent < 80) urgency = 'moderate';

    // Optimal next review day is when retention hits approx 75%
    const recommendedReviewDay = Math.max(1, Math.round(-stabilityIndex * Math.log(0.75)));

    return {
      daysElapsed,
      projectedRetentionPercentage: projectedPercent,
      memoryStabilityIndex: stabilityIndex,
      recommendedReviewDay,
      urgency,
    };
  }

  /**
   * Diagnostic Misconception Classifier
   * Identifies student error category and provides remedial pedagogical action
   */
  public logMisconception(data: {
    studentId: string;
    subject: string;
    topic: string;
    misconceptionCode: string;
    misconceptionTitle: string;
    errorTaxonomy: 'conceptual_flaw' | 'calculation_slip' | 'careless_oversight' | 'missing_prerequisite' | 'language_comprehension';
    contextDetails: string;
    suggestedIntervention: string;
  }): { id: string; logged: boolean } {
    const id = `misc-${crypto.randomUUID().slice(0, 8)}`;
    this.db.prepare(`
      INSERT INTO misconception_logs (
        id, student_id, subject, topic, misconception_code, misconception_title,
        error_taxonomy, context_details, suggested_intervention, resolved, logged_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      id, data.studentId, data.subject, data.topic, data.misconceptionCode,
      data.misconceptionTitle, data.errorTaxonomy, data.contextDetails,
      data.suggestedIntervention, new Date().toISOString()
    );

    return { id, logged: true };
  }

  /**
   * Get all mastery states for a student
   */
  public getStudentMasteryOverview(studentId: string) {
    const states = this.db.prepare(`
      SELECT * FROM student_mastery_states
      WHERE student_id = ?
      ORDER BY current_mastery_prob DESC
    `).all(studentId) as any[];

    const totalConcepts = states.length;
    const masteredCount = states.filter(s => s.mastery_status === 'mastered' || s.mastery_status === 'retained').length;
    const developingCount = states.filter(s => s.mastery_status === 'developing').length;
    const emergingCount = states.filter(s => s.mastery_status === 'emerging').length;

    return {
      studentId,
      totalConcepts,
      masteredCount,
      developingCount,
      emergingCount,
      masteryRate: totalConcepts > 0 ? Math.round((masteredCount / totalConcepts) * 100) : 0,
      concepts: states,
    };
  }
}
