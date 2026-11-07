import { LearningAnalyticsEngine } from './learningAnalyticsEngine';
import { PrivacyService } from './privacyService';
import { UserService } from './userService';
import { EducationAIPipelineContext } from '../types/analytics';

export class AIPipelineService {
  private analyticsEngine: LearningAnalyticsEngine;
  private privacyService: PrivacyService;
  private userService: UserService;

  constructor(
    analyticsEngine?: LearningAnalyticsEngine,
    privacyService?: PrivacyService,
    userService?: UserService
  ) {
    this.analyticsEngine = analyticsEngine || new LearningAnalyticsEngine();
    this.privacyService = privacyService || new PrivacyService();
    this.userService = userService || new UserService();
  }

  /**
   * Builds the 4-part unified context payload for the future AI Education Agent:
   * Student Profile + Learning History + Behavior Patterns + Education Knowledge Base
   */
  public generateAIContext(studentId: string): EducationAIPipelineContext {
    const analytics = this.analyticsEngine.evaluateStudentIntelligence(studentId);
    const consent = this.privacyService.getConsent(studentId);

    // Get user profile if available
    let displayName = 'Student';
    let gradeLevel = 'Grade 12 (Bac II Candidate)';
    let targetMajor = 'Computer Science & Software Engineering';
    let targetCareer = 'AI Software Architect';

    try {
      const userProf = this.userService.getProfile(studentId);
      if (userProf?.profile) {
        displayName = userProf.profile.name || 'Student';
        gradeLevel = userProf.profile.education_level || gradeLevel;
        targetMajor = userProf.profile.major || targetMajor;
        targetCareer = userProf.profile.target_career || targetCareer;
      }
    } catch {
      // ignore
    }

    const strengths = analytics.profile.subjectStrengths.map(s => s.subject);
    const weaknesses = analytics.profile.subjectWeaknesses.map(s => `${s.subject} (Score: ${s.score}%)`);

    // 1. Student Profile
    const studentProfile = {
      id: studentId,
      displayName,
      gradeLevel,
      targetMajor,
      targetCareer,
      isMinor: consent.isMinor
    };

    // 2. Learning History
    const learningHistory = {
      masteredConcepts: strengths.length > 0 ? strengths : ['Basic Calculus', 'Binary Logic', 'English Technical Reading'],
      strugglingConcepts: weaknesses.length > 0 ? weaknesses : ['Mechanics & Dynamics in Physics'],
      recentScoresAverage: analytics.learning.averageScore,
      totalLessonsCompleted: analytics.learning.completedLessonsCount,
      difficultyCeiling: analytics.learning.masteryLevel
    };

    // 3. Behavior Patterns
    const frustrationRisk: 'Low' | 'Moderate' | 'High' =
      analytics.behavior.persistenceScore >= 75 ? 'Low' : (analytics.behavior.persistenceScore >= 50 ? 'Moderate' : 'High');

    const behaviorPatterns = {
      primaryLearningStyle: analytics.profile.learningPreferences.primaryStyle,
      pacingVelocity: analytics.profile.learningPreferences.pacing,
      persistenceIndex: analytics.profile.persistenceScore,
      curiosityBreadth: analytics.behavior.curiosityBreadthScore,
      frustrationRiskIndicator: frustrationRisk
    };

    // 4. Education Knowledge Base
    const educationKnowledgeBase = {
      curriculumDomain: 'Cambodian National MoEYS Secondary & Higher Education Framework',
      bacIICoreRequirements: [
        'Advanced Mathematics (Calculus, Probability, Vectors)',
        'Physics (Electromagnetism, Mechanics, Thermodynamics)',
        'Khmer Literature & Composition',
        'English as an International Academic Language'
      ],
      recommendedScholarships: [
        'CADT Digital Leaders Scholarship',
        'AUPP Technology Merit Fellowship',
        'Australia Awards Cambodia',
        'MEXT Japanese Government Monbukagakusho'
      ],
      pedagogicalInterventions: [
        'Provide step-by-step visual breakdowns before introducing algebraic proofs.',
        'If student encounters failure, acknowledge grit and deliver an analogical hint rather than the final answer.',
        'Maintain high challenge level in Computer Science to prevent disengagement.'
      ]
    };

    // 5. Synthesize AI System Prompt Injection
    const synthesizedAIPromptContext = `
[CDES STUDENT INTELLIGENCE CONTEXT FOR AI AGENT]
- Student: ${displayName} (${gradeLevel})
- Target Field: ${targetMajor} | Career Goal: ${targetCareer}
- Learning Style: ${behaviorPatterns.primaryLearningStyle.toUpperCase()} (Pacing: ${behaviorPatterns.pacingVelocity})
- Mastered Strengths: ${learningHistory.masteredConcepts.join(', ')}
- Areas for Growth / Remediation: ${learningHistory.strugglingConcepts.join(', ')}
- Persistence Resilience: ${behaviorPatterns.persistenceIndex}/100 (Frustration Risk: ${frustrationRisk})
- Pedagogical Directive: Adopt a Socratic, encouraging tone. When explaining ${learningHistory.strugglingConcepts[0] || 'challenging topics'}, use interactive analogies and step-by-step visual explanations aligned with the Cambodian MoEYS Bac II syllabus.
`.trim();

    return {
      studentProfile,
      learningHistory,
      behaviorPatterns,
      educationKnowledgeBase,
      synthesizedAIPromptContext
    };
  }
}
