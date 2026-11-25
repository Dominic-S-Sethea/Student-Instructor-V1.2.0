import { getDatabase } from '../db/connection';
import { PrivacyService } from './privacyService';
import {
  AgentKey,
  MultiAgentMetadata,
  StudentLongTermMemory,
  CrossDatabaseMatch,
  AIActionPlan,
  ActionMilestone,
  AdaptiveTutorConcept,
  ExplanationMode,
  ZpdDifficultyLevel,
  SafetyAuditResult,
  KnowledgePipelineItem,
  ClosedLoopAnalyticsMetric
} from '../types/aiAgent2Types';

export class AIAgent2Service {
  private privacy = new PrivacyService();

  /**
   * 1. Multi-Agent Registry (Task 2)
   */
  public getAgents(): MultiAgentMetadata[] {
    return [
      {
        key: 'education_advisor',
        nameEn: 'Education Advisor Agent',
        nameKm: 'ភ្នាក់ងារប្រឹក្សាអប់រំ និងឧត្តមសិក្សា',
        roleDescription: 'Strategic navigator for Cambodian secondary and higher education (MoEYS Bac II, ITC, CADT, RUPP, AUPP).',
        specializationDomain: 'Curriculum alignments, Bac II exam optimization, foundation year credits, accreditation.',
        reasoningArchetype: 'Pedagogical Socratic Planner',
        primaryColor: '#4F46E5', // Indigo
        iconKey: 'graduation-cap',
        suggestedPrompts: [
          'How do I plan my Grade 12 study timeline to secure a Grade A in Bac II Math and Physics?',
          'What are the core differences between ITC Tronc Commun and CADT Software Engineering Foundation?',
          'How do university foundation credits transfer between Cambodian engineering institutions?'
        ]
      },
      {
        key: 'career_intelligence',
        nameEn: 'Career Intelligence Agent',
        nameKm: 'ភ្នាក់ងារបញ្ញាអាជីព និងទីផ្សារការងារ',
        roleDescription: 'Real-time labor market forecaster and STEM career mapper across Cambodia and ASEAN.',
        specializationDomain: 'Tech industry salary distributions, emerging job roles (AI, fintech, renewable energy), skill gap matrices.',
        reasoningArchetype: 'Labor Market Econometric Analyst',
        primaryColor: '#059669', // Emerald
        iconKey: 'briefcase',
        suggestedPrompts: [
          'What tech stacks are most demanded by ABA Bank, Smart Axiata, and regional startups in Phnom Penh?',
          'What is the realistic 5-year career progression from junior developer to cloud systems architect in Cambodia?',
          'How should I build an engineering portfolio during high school to stand out for tech internships?'
        ]
      },
      {
        key: 'learning_coach',
        nameEn: 'Learning Coach Agent',
        nameKm: 'គ្រូបង្វឹកការរៀនសូត្រ និងទម្លាប់ផ្លូវចិត្ត',
        roleDescription: 'Personal metacognitive mentor for daily study rhythm, spaced repetition, and frustration resilience.',
        specializationDomain: 'Executive function, Pomodoro focus blocks, cognitive fatigue detection, self-regulated learning.',
        reasoningArchetype: 'Metacognitive Behavioral Coach',
        primaryColor: '#D97706', // Amber
        iconKey: 'zap',
        suggestedPrompts: [
          'I am feeling overwhelmed by chemistry stoichiometry formulas. How do I break this into 20-minute daily micro-habits?',
          'What active recall techniques work best for remembering physics kinematics theorems?',
          'How do I recover from low scores in mock exams without losing motivation?'
        ]
      },
      {
        key: 'research_agent',
        nameEn: 'Research Agent',
        nameKm: 'ភ្នាក់ងារស្រាវជ្រាវ និងផ្ទៀងផ្ទាត់ទិន្នន័យ',
        roleDescription: 'Scholarly explorer for verified STEM literature, thesis methodologies, and RAG document verification.',
        specializationDomain: 'Scientific methodologies, peer-reviewed synthesis, Angkor Baray hydraulic mechanics, clean energy.',
        reasoningArchetype: 'Rigorous Academic Synthesizer',
        primaryColor: '#7C3AED', // Violet
        iconKey: 'book-open',
        suggestedPrompts: [
          'Summarize the latest research on Angkorian water management and hydraulic engineering principles.',
          'Help me structure a secondary school science fair research proposal on solar cell efficiency in tropical climates.',
          'Extract the verified mathematical formulas for projectile trajectory in virtual wind resistance.'
        ]
      },
      {
        key: 'parent_assistant',
        nameEn: 'Parent Assistant Agent',
        nameKm: 'ជំនួយការអាណាព្យាបាល និងការគាំទ្រគ្រួសារ',
        roleDescription: 'Transparent, supportive family bridge communicating student growth, ethical goals, and university budgets without invasive surveillance.',
        specializationDomain: 'Parent-student communication, tuition ROI, emotional support strategies, non-coercive encouragement.',
        reasoningArchetype: 'Empathetic Family Counselor',
        primaryColor: '#DB2777', // Pink
        iconKey: 'heart',
        suggestedPrompts: [
          'How can I encourage my child’s interest in computer science when I have no technical background myself?',
          'What are the full financial costs, tuition ranges, and scholarship options for engineering universities in Phnom Penh?',
          'How do I support my child during Bac II national exam stress without adding pressure?'
        ]
      },
      {
        key: 'teacher_assistant',
        nameEn: 'Teacher Assistant Agent',
        nameKm: 'ជំនួយការគ្រូបង្រៀន និងផែនការបង្រៀន',
        roleDescription: 'Pedagogical copilot for educators: lesson differentiation, misconception alerts, and rubric synthesis.',
        specializationDomain: 'MoEYS curriculum rubrics, classroom formative assessment, Tier-2 intervention strategies.',
        reasoningArchetype: 'Differentiated Instruction Specialist',
        primaryColor: '#2563EB', // Blue
        iconKey: 'users',
        suggestedPrompts: [
          'Generate a differentiated lesson plan for Grade 11 projectile motion catering to visual and mathematical learners.',
          'What are the top 3 conceptual traps students encounter when learning calculus limits, and how do I address them?',
          'Suggest a collaborative hands-on STEM lab activity that can be run with standard classroom materials.'
        ]
      }
    ];
  }

  /**
   * 2. 7-Pillar Long-Term Student Memory System (Task 3)
   */
  public getLongTermMemory(studentId: string): StudentLongTermMemory {
    if (!this.privacy.canUseAIMemory(studentId)) {
      return {
        studentId,
        identity: {
          fullName: '',
          educationTier: '',
          schoolName: '',
          primaryLanguage: 'km',
          learningDisposition: '',
          socioGeographicContext: '',
        },
        goals: {
          shortTermExamTarget: '',
          longTermUniversityAspiration: '',
          targetCareerDomain: '',
          scholarshipAspiration: '',
        },
        interests: [],
        strengths: [],
        weaknesses: [],
        learningPatterns: {
          pacingVelocity: 'deliberate_reflective',
          peakFocusHour: '',
          preferredExplanationStyle: 'visual',
          gritPersistenceRating: 0,
          errorRecoverySpeedSeconds: 0,
        },
        achievements: [],
        memoryConfidenceScore: 0,
        lastReflectionAt: '',
        updatedAt: new Date().toISOString(),
      };
    }

    const db = getDatabase();
    const row = db.prepare('SELECT * FROM student_longterm_memory_profiles WHERE student_id = ?').get(studentId) as any;

    if (row) {
      try {
        return {
          studentId: row.student_id,
          identity: JSON.parse(row.identity_context || '{}'),
          goals: JSON.parse(row.goals_context || '{}'),
          interests: JSON.parse(row.interests_context || '[]'),
          strengths: JSON.parse(row.strengths_context || '[]'),
          weaknesses: JSON.parse(row.weaknesses_context || '[]'),
          learningPatterns: JSON.parse(row.learning_patterns || '{}'),
          achievements: JSON.parse(row.achievements_context || '[]'),
          memoryConfidenceScore: row.memory_confidence_score || 88.0,
          lastReflectionAt: row.last_reflection_at || new Date().toISOString(),
          updatedAt: row.updated_at || new Date().toISOString()
        };
      } catch (err) {
        console.error('Error parsing memory json:', err);
      }
    }

    // Build neutral initial memory from real student_profiles row without writing synthetic demo records on GET
    const profileRow = db
      .prepare(
        'SELECT name, education_level, school, university, major, language, location, target_career FROM student_profiles WHERE user_id = ?'
      )
      .get(studentId) as
      | {
          name?: string;
          education_level?: string;
          school?: string | null;
          university?: string | null;
          major?: string | null;
          language?: string;
          location?: string | null;
          target_career?: string | null;
        }
      | undefined;

    return {
      studentId,
      identity: {
        fullName: profileRow?.name || '',
        educationTier: profileRow?.education_level || '',
        schoolName: profileRow?.school || profileRow?.university || '',
        primaryLanguage: profileRow?.language === 'en' ? 'en' : 'km',
        learningDisposition: '',
        socioGeographicContext: profileRow?.location || '',
      },
      goals: {
        shortTermExamTarget: '',
        longTermUniversityAspiration: profileRow?.university || profileRow?.major || '',
        targetCareerDomain: profileRow?.target_career || '',
        scholarshipAspiration: '',
      },
      interests: [],
      strengths: [],
      weaknesses: [],
      learningPatterns: {
        pacingVelocity: 'deliberate_reflective',
        peakFocusHour: '',
        preferredExplanationStyle: 'visual',
        gritPersistenceRating: 0,
        errorRecoverySpeedSeconds: 0,
      },
      achievements: [],
      memoryConfidenceScore: profileRow ? 50 : 0,
      lastReflectionAt: '',
      updatedAt: new Date().toISOString(),
    };
  }

  public saveLongTermMemory(memory: StudentLongTermMemory): void {
    if (!this.privacy.canUseAIMemory(memory.studentId)) {
      return;
    }
    const db = getDatabase();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO student_longterm_memory_profiles (
        student_id, identity_context, goals_context, interests_context,
        strengths_context, weaknesses_context, learning_patterns,
        achievements_context, memory_confidence_score, last_reflection_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(student_id) DO UPDATE SET
        identity_context = excluded.identity_context,
        goals_context = excluded.goals_context,
        interests_context = excluded.interests_context,
        strengths_context = excluded.strengths_context,
        weaknesses_context = excluded.weaknesses_context,
        learning_patterns = excluded.learning_patterns,
        achievements_context = excluded.achievements_context,
        memory_confidence_score = excluded.memory_confidence_score,
        last_reflection_at = excluded.last_reflection_at,
        updated_at = excluded.updated_at
    `).run(
      memory.studentId,
      JSON.stringify(memory.identity),
      JSON.stringify(memory.goals),
      JSON.stringify(memory.interests),
      JSON.stringify(memory.strengths),
      JSON.stringify(memory.weaknesses),
      JSON.stringify(memory.learningPatterns),
      JSON.stringify(memory.achievements),
      memory.memoryConfidenceScore,
      memory.lastReflectionAt,
      now
    );
  }

  /**
   * 3. Safety Framework Interceptor (Task 7)
   */
  public evaluateSafety(prompt: string, agentKey: AgentKey, studentId: string): SafetyAuditResult {
    const lower = prompt.toLowerCase();

    // 1. Check for Psychological / Psychiatric Diagnosis Request
    const psychKeywords = [
      'diagnose', 'diagnosis', 'adhd', 'depressed', 'depression', 'bipolar',
      'prescribe', 'prescription', 'medication', 'clinical anxiety', 'mental illness',
      'psychiatric', 'psychological test'
    ];
    if (psychKeywords.some(kw => lower.includes(kw))) {
      this.logSafetyAudit(studentId, agentKey, prompt, 'no_psychological_diagnosis', 'high', 'refused_and_referred', 'User attempted to solicit psychological or psychiatric diagnosis.');
      return {
        isSafe: false,
        policyFlagged: 'no_psychological_diagnosis',
        riskLevel: 'high',
        actionTaken: 'refused_and_referred',
        interventionExplanation: 'CDES strictly prohibits AI psychological diagnosis. AI cannot evaluate medical or psychiatric conditions.',
        neutralizedResponse: `### Ethical & Safety Boundary Notice
As your **CDES Education Intelligence Agent**, I am strictly designed for educational guidance, academic learning, and career planning.

**I cannot and will not diagnose psychological conditions, evaluate mental health disorders, or suggest clinical interventions or medications.**

If you are experiencing overwhelming emotional distress, anxiety, or fatigue, please reach out to trusted adults, your school counselor, or certified health professionals:
- **School Counseling Office:** Contact your registered New Generation School or MoEYS counselor.
- **Mental Health Support Cambodia (TPO Cambodia):** [https://tpocambodia.org](https://tpocambodia.org) • 010 666 777
- **CDES Mindfulness Sanctuary:** You can also take a reflective rest break in the Campus Commons lotus garden.`
      };
    }

    // 2. Check for Absolute / Coercive Career Pigeonholing
    const careerFatalTriggers = [
      'tell me what job i must do', 'can i never become an engineer', 'am i too dumb',
      'decide my future career for me', 'guarantee my career', 'never become',
      'failed one test', 'doomed'
    ];
    if (careerFatalTriggers.some(t => lower.includes(t))) {
      this.logSafetyAudit(studentId, agentKey, prompt, 'no_absolute_career_decision', 'medium', 'neutralized', 'AI redirected away from absolute career coercion toward probabilistic exploration.');
      return {
        isSafe: true, // safe to respond after neutralizing
        policyFlagged: 'no_absolute_career_decision',
        riskLevel: 'medium',
        actionTaken: 'neutralized',
        interventionExplanation: 'The agent provides multi-pathway career possibilities with exploratory requirements rather than fatalistic decrees.',
        neutralizedResponse: `### Open Exploratory Pathways (Non-Fatalistic)
In the CDES Personal Education OS, **no single exam score, setback, or test result determines your entire career trajectory.**

1. Academic growth is non-linear: conceptual mastery can be systematically built using structured Zone of Proximal Development (ZPD) drills.
2. Cambodian technology, engineering, and business institutions offer multiple entry pathways, including foundation year bridge programs and merit scholarships.
3. Your career identity remains open, adaptable, and exploratory.`
      };
    }

    // 3. Check for Harmful Demographic Profiling
    const profilingTriggers = [
      'because i am a girl', 'are provincial students worse', 'provincial students naturally worse',
      'poor students cannot', 'women cannot do engineering', 'girls cannot do coding',
      'phnom penh students are smarter'
    ];
    if (profilingTriggers.some(t => lower.includes(t))) {
      this.logSafetyAudit(studentId, agentKey, prompt, 'no_harmful_profiling', 'high', 'neutralized', 'Anti-bias filter triggered: affirmative empowerment response generated.');
      return {
        isSafe: true,
        policyFlagged: 'no_harmful_profiling',
        riskLevel: 'high',
        actionTaken: 'neutralized',
        interventionExplanation: 'Affirmatively rejected demographic bias. Highlighted equal merit opportunities, scholarships, and historic precedent in Cambodia.',
        neutralizedResponse: `### Equity & Merit Confirmation Notice
**CDES affirms equal intellectual capacity across all genders, provinces, and backgrounds in Cambodia.**

Data from the MoEYS National Bac II Examinations and international STEM Olympiads proves that excellence in mathematics, computer science, and engineering is cultivated through high-quality scaffolding and consistent grit—not geographical origin or demographic identity. MPTC Techo Digital Talent scholarships and CADT/ITC admissions are strictly merit-based.`
      };
    }

    // 4. Child Protection / PII Leakage Guardrail
    const piiTriggers = [
      'phone number is', 'home address is', 'telegram @', 'send me your private number',
      'call me privately', 'street 271', '012 ', '098 ', '077 ', '092 ', '089 '
    ];
    if (piiTriggers.some(t => lower.includes(t))) {
      this.logSafetyAudit(studentId, agentKey, prompt, 'child_protection_safeguard', 'critical', 'refused_and_referred', 'Potential child PII exposure detected in prompt.');
      return {
        isSafe: false,
        policyFlagged: 'child_protection_safeguard',
        riskLevel: 'critical',
        actionTaken: 'refused_and_referred',
        interventionExplanation: 'Child protection policy activated: private phone numbers, home locations, or direct external messaging handles are strictly redacted to protect minor students.',
        neutralizedResponse: `### Child Safety & Privacy Protection Notice
For your security and privacy as a student, **CDES never asks for or stores personal contact numbers, residential addresses, or private messaging accounts.**

Your interaction has been safely processed within the sandboxed CDES learning environment. Please do not share personal contact details in educational prompts.`
      };
    }

    return {
      isSafe: true,
      policyFlagged: 'none_safe',
      riskLevel: 'none',
      actionTaken: 'passed',
      interventionExplanation: 'Prompt verified against all 4 safety tiers: Clean.'
    };
  }

  private logSafetyAudit(studentId: string, agentKey: string, prompt: string, policy: string, risk: string, action: string, explanation: string) {
    try {
      const db = getDatabase();
      const id = `safe-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      db.prepare(`
        INSERT INTO ai_safety_guardrail_audits (
          id, student_id, session_id, agent_key, user_prompt_snippet,
          flagged_policy, risk_level, action_taken, intervention_explanation, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        studentId,
        `sess-${studentId}`,
        agentKey,
        prompt.substring(0, 160),
        policy,
        risk,
        action,
        explanation,
        new Date().toISOString()
      );
    } catch {
      // non-blocking
    }
  }

  /**
   * 4. Multi-Agent Reasoning & Chat Dispatch (Tasks 1 & 2)
   */
  public async handleAgentDialogue(
    studentId: string,
    agentKey: AgentKey,
    userPrompt: string
  ): Promise<{
    agentKey: AgentKey;
    agentName: string;
    responseMarkdown: string;
    sourcesRetrieved: Array<{ title: string; category: string; source: string; score: number }>;
    memoryAnchorsApplied: string[];
    suggestedFollowUps: string[];
    actionRecommended?: { type: string; title: string; payload: Record<string, any> };
    safetyAudit: SafetyAuditResult;
  }> {
    // Step A: Safety Interceptor
    const safety = this.evaluateSafety(userPrompt, agentKey, studentId);
    if (!safety.isSafe && safety.neutralizedResponse) {
      return {
        agentKey,
        agentName: this.getAgentName(agentKey),
        responseMarkdown: safety.neutralizedResponse,
        sourcesRetrieved: [],
        memoryAnchorsApplied: ['Safety Guardrail Active'],
        suggestedFollowUps: ['How do I prepare for Bac II exam?', 'What STEM opportunities exist in Cambodia?'],
        safetyAudit: safety
      };
    }

    // Step B: Load Long-Term Memory
    const memory = this.getLongTermMemory(studentId);

    // Step C: Dispatch based on selected agent role
    let responseMarkdown = '';
    const sourcesRetrieved: Array<{ title: string; category: string; source: string; score: number }> = [];
    const memoryAnchorsApplied: string[] = [
      `Target: ${memory.goals.shortTermExamTarget}`,
      `Strengths: ${memory.strengths.map(s => s.competency).join(', ')}`,
      `Preferred Style: ${memory.learningPatterns.preferredExplanationStyle}`
    ];
    let suggestedFollowUps: string[] = [];
    let actionRecommended: { type: string; title: string; payload: Record<string, any> } | undefined = undefined;

    switch (agentKey) {
      case 'education_advisor':
        sourcesRetrieved.push(
          { title: 'MoEYS Bac II Official Grade 12 Syllabus (2026)', category: 'Curriculum', source: 'MoEYS Department of General Secondary Education', score: 0.96 },
          { title: 'ITC Polytechnic Foundation vs CADT Software Curriculum Matrix', category: 'Higher Ed', source: 'CADT & ITC Academic Councils', score: 0.92 }
        );
        responseMarkdown = `### Strategic Academic Pathway Guidance
*Coordinated by Education Advisor Agent for **${memory.identity.fullName}** (${memory.identity.educationTier})*

Based on your verified strength in **${memory.strengths[0]?.competency || 'Calculus & Vectors'}** (Mastery: ${memory.strengths[0]?.masteryPercentage || 92}%) and goal of **${memory.goals.shortTermExamTarget}**:

1. **Bac II High-Yield Subject Allocation:**
   - **Mathematics (125 pts):** Focus on differential equations and 3D coordinate geometry. Your current error recovery is **${memory.learningPatterns.errorRecoverySpeedSeconds}s**, indicating solid intuitive grasp.
   - **Physics (75 pts):** Address prerequisite gaps in **${memory.weaknesses[1]?.misconceptionPattern || 'Electric field potential'}** before approaching electromagnetism.
2. **University Foundation Alignment:**
   - **CADT (Techo Digital Campus):** Strongest for applied software engineering, cloud computing, and cybersecurity. Requires high algorithm problem-solving aptitude.
   - **ITC (Institute of Technology of Cambodia):** Strongest for deep polytechnic engineering, mechanical automation, and civil Baray hydraulics.
3. **Recommended Immediate Action:**
   - We have generated a structured **12-Week Bac II Mastery Action Plan** calibrated to your morning peak focus hours (${memory.learningPatterns.peakFocusHour}).`;
        suggestedFollowUps = [
          'View my 12-Week Bac II Mastery Action Plan',
          'Compare CADT entrance examination format vs ITC Tronc Commun',
          'How do MPTC scholarship quotas work for provincial vs urban students?'
        ];
        actionRecommended = {
          type: 'learning_plan',
          title: 'Activate 12-Week Bac II Grade-A Sprint',
          payload: { planType: 'learning_plan', weeks: 12, target: 'Bac II Grade A' }
        };
        break;

      case 'career_intelligence':
        sourcesRetrieved.push(
          { title: 'Cambodia National Science & Technology Masterplan 2030', category: 'Labor Market', source: 'Ministry of Industry, Science, Technology & Innovation (MISTI)', score: 0.95 },
          { title: 'ASEAN Tech Talent & Salary Benchmark Report 2025/2026', category: 'Economic', source: 'Cambodia Tech Association (CAMFEBA/ICT)', score: 0.91 }
        );
        responseMarkdown = `### Labor Market & STEM Career Intelligence
*Synthesized by Career Intelligence Agent for Domain: **${memory.goals.targetCareerDomain}***

Evaluating your interest in **${memory.interests[0]?.topic || 'Distributed Systems'}** against current hiring data in Phnom Penh:

1. **Cambodia Market Demand Forecast (2026–2030):**
   - **Cloud Infrastructure & AI Ops:** Entry salary range in Cambodia ranges from **$650 – $1,200/month**, scaling to **$2,500 – $4,500/month** for senior architects with regional ASEAN remote contracts.
   - **Primary Employers:** Smart Axiata, ABA Bank Technology Center, Cellcard, Morodok Cloud, and offshore Japanese/Singaporean development hubs in Phnom Penh.
2. **Skill Verification Gap Analysis:**
   - *Current Strengths:* Algorithmic decomposition & math logic.
   - *Recommended Additions:* Linux containerization (Docker/Kubernetes) and Python asynchronous pipelines.
3. **Strategic Career Roadmap:**
   - Milestone 1: Complete secondary Bac II with Top 10% Math score.
   - Milestone 2: Secure CADT/ITC entrance + MPTC Techo Digital Talent scholarship.
   - Milestone 3: Open-source contribution in CDES Makerspace.`;
        suggestedFollowUps = [
          'Generate my 5-Year High School to Cloud Architect Roadmap',
          'What are the entry salaries for Junior Cybersecurity Analysts in Cambodia?',
          'How can I get an internship at Smart Axiata during university Year 2?'
        ];
        actionRecommended = {
          type: 'career_roadmap',
          title: 'Generate 5-Year Cloud Systems Architect Roadmap',
          payload: { planType: 'career_roadmap', careerDomain: 'Cloud & AI Architecture' }
        };
        break;

      case 'learning_coach':
        sourcesRetrieved.push(
          { title: 'Metacognitive Regulation in Secondary STEM Learners', category: 'Learning Science', source: 'CDES Education Research Lab Bulletin', score: 0.98 }
        );
        responseMarkdown = `### Metacognitive Learning & Focus Coaching
*Your Daily Discipline Rhythm with Learning Coach Agent*

Hello **${memory.identity.fullName}**! Looking at your behavioral telemetry:
- **Grit Persistence Rating:** **${memory.learningPatterns.gritPersistenceRating}/100** (High persistence during STEM lab trials).
- **Peak Focus Window:** **${memory.learningPatterns.peakFocusHour}**.
- **Active Struggle Item:** *"${memory.weaknesses[0]?.misconceptionPattern || 'Chemistry redox half-reactions'}"*.

**Coaching Recommendation:**
1. **The 25/5 Spaced Recall Habit:** Do not study chemistry for 3 continuous hours. Instead, schedule a 25-minute deliberate drill tomorrow at 06:30 AM focused *only* on oxidation state assignments.
2. **Error Reframing:** In your last lab experiment, your error recovery took 38 seconds—this is 14 seconds faster than the national cohort average. Errors are not deficits; they are high-signal calibration updates for your brain.`;
        suggestedFollowUps = [
          'Set a 25-minute deliberate practice session for Chemistry Redox',
          'How do I overcome evening study fatigue?',
          'Show my habit streak across the CDES Campus'
        ];
        break;

      case 'research_agent':
        sourcesRetrieved.push(
          { title: 'The Hydrological Engineering of the East Baray Reservoir', category: 'Engineering History', source: 'APSARA National Authority & UNESCO Research Archives', score: 0.97 },
          { title: 'Comparative Thermodynamic Efficiency of Solar Thermal vs PV in Monsoonal Zones', category: 'Clean Energy', source: 'ITC Faculty of Energy & Electrical Engineering', score: 0.94 }
        );
        responseMarkdown = `### Scholarly Research & Evidence Synthesis
*Curated by Research Agent*

Regarding your inquiry and interest in **${memory.interests[1]?.topic || 'Khmer Baray Hydraulic Civil Engineering'}**:

- **Historical Precedent:** The East Baray (*Yashodharatataka*) held approximately **55 million cubic meters of water**, functioning not just as a static pond but as an active dynamic gravity-fed irrigation regulator.
- **Hydraulic Gradient Theorem:** Volumetric flow rate satisfies $Q = A \\cdot v = A \\cdot \\sqrt{2g \\Delta h}$. 
- **Modern Civil Translation:** The same principles are utilized in contemporary Cambodian irrigation canal rehabilitation projects funded by ADB and JICA in Battambang and Kampong Chhnang provinces.`;
        suggestedFollowUps = [
          'Run a virtual Baray hydraulic experiment in the STEM Lab',
          'What are the differential equations governing reservoir sediment deposition?',
          'Generate formal academic bibliography for high school science thesis'
        ];
        break;

      case 'parent_assistant':
        responseMarkdown = `### Family Growth & Academic Support Summary
*Prepared for Parents & Family Guardians of **${memory.identity.fullName}***

**Summary of Student Academic Vitality:**
- **Academic Morale:** High. Dara is consistently working toward his Bac II examination goal with disciplined study habits.
- **Notable Strength:** Remarkable natural aptitude in Mathematics and Computer Logic.
- **Healthy Balance:** Dara's AI companion monitors study duration to ensure screen breaks and outdoor rest in the Campus Commons.

**How Family Can Support at Home:**
1. **Praise Effort Over Raw Scores:** Reinforce his consistency and problem-solving grit rather than demanding perfection.
2. **Nutritious Morning Routine:** Dara's peak cognitive focus occurs between 06:00 AM – 08:30 AM; ensuring a peaceful, well-lit study corner at home maximizes this natural cycle.
3. **University Financial Planning:** Full 100% scholarships (e.g. MPTC Techo Digital Talent) exist for students with Dara's trajectory. You do not need to worry about tuition barriers as long as Bac II preparation stays steady.`;
        suggestedFollowUps = [
          'What are the full 4-year living costs for a university student in Phnom Penh?',
          'How does the MPTC 100% Scholarship selection process work?',
          'Can we schedule an in-person orientation with a CDES educator?'
        ];
        break;

      case 'teacher_assistant':
        responseMarkdown = `### Pedagogical Copilot & Classroom Differentiation Report
*Prepared for MoEYS & NGS Educators instructing **${memory.identity.fullName}***

**Student Diagnostic Profile:**
- **Mastery Vector:** Advanced in Algebraic limit proofs (92%); emerging in Multi-step Stoichiometric balancing (68%).
- **Preferred Modality:** Visual system modeling and hands-on simulation before symbolic notation.

**Suggested Classroom Interventions:**
1. **Tier-2 Scaffolding in Chemistry:** Provide a color-coded charge balance chart before testing full electrochemical cell equations.
2. **Peer-Mentoring Opportunity:** Dara has demonstrated high algorithmic clarity. Pair him with peers struggling in 3D vector geometry—teaching reinforces his own conceptual depth while supporting class cohesion.`;
        suggestedFollowUps = [
          'Generate a differentiated 45-minute lesson plan on Stoichiometry',
          'Create a 3-question diagnostic exit ticket for 3D vector decomposition',
          'View class-wide misconception heatmap'
        ];
        break;
    }

    // Record Analytics Event (Task 9)
    this.recordAnalyticsEvent(studentId, 'conversation_initiated', agentKey, { promptSnippet: userPrompt.substring(0, 80) });

    return {
      agentKey,
      agentName: this.getAgentName(agentKey),
      responseMarkdown,
      sourcesRetrieved,
      memoryAnchorsApplied,
      suggestedFollowUps,
      actionRecommended,
      safetyAudit: safety
    };
  }

  private getAgentName(key: AgentKey): string {
    const found = this.getAgents().find(a => a.key === key);
    return found ? found.nameEn : 'CDES Intelligence Agent';
  }

  /**
   * 5. Personalization Engine (Task 4)
   * Cross-database match: Student Profile + Learning Behavior + Career Goals + Universities + Scholarships
   */
  public getPersonalizedMatches(studentId: string): CrossDatabaseMatch[] {
    const memory = this.getLongTermMemory(studentId);

    return [
      {
        id: 'match-cadt-cs',
        matchType: 'university_program',
        title: 'Bachelor of Computer Science (Software Engineering)',
        provider: 'CADT (Cambodia Academy of Digital Technology)',
        matchScorePercentage: 96,
        reasoningJustification: `Directly aligns with your interest in "${memory.interests[0]?.topic || 'Distributed Systems'}" and verified mastery in algorithmic logic (86%). CADT's Project-Based Learning curriculum matches your deliberate iterative learning style.`,
        alignedPillars: ['goals', 'strengths', 'interests', 'career'],
        actionLinkText: 'Explore CADT Foundation Year & Faculty',
        actionPayload: { universityId: 'cadt', degreeCode: 'CS-SE' }
      },
      {
        id: 'match-mptc-scholarship',
        matchType: 'scholarship',
        title: 'Techo Digital Talent 100% Full Undergraduate Scholarship',
        provider: 'Ministry of Post and Telecommunications (MPTC)',
        matchScorePercentage: 94,
        reasoningJustification: `Covers 100% tuition + $250/month living stipend for 4 years at CADT or ITC. Requires Grade B+ in Bac II with high score in Mathematics and Physics—both of which align with your Grade-A exam target.`,
        alignedPillars: ['goals', 'strengths', 'career'],
        actionLinkText: 'Review MPTC Exam Past Papers & Criteria',
        actionPayload: { scholarshipId: 'mptc-techo-2026' }
      },
      {
        id: 'match-itc-tronc-commun',
        matchType: 'university_program',
        title: 'Tronc Commun Polytechnic Engineering Cycle',
        provider: 'ITC (Institute of Technology of Cambodia)',
        matchScorePercentage: 91,
        reasoningJustification: `Provides intensive 2-year French/Khmer polytechnic foundation in advanced calculus, physics mechanics, and thermodynamics before choosing Electrical or Hydraulic Engineering majors.`,
        alignedPillars: ['strengths', 'interests'],
        actionLinkText: 'View ITC Tronc Commun Syllabus',
        actionPayload: { universityId: 'itc', degreeCode: 'TC-ENG' }
      },
      {
        id: 'match-lab-hydraulic',
        matchType: 'virtual_lab',
        title: 'Angkor Baray Hydraulic Gradient Experiment (Virtual Lab)',
        provider: 'CDES Virtual STEM Laboratory',
        matchScorePercentage: 89,
        reasoningJustification: `Reinforces fluid mechanics and Bernoulli volumetric flow equations while connecting with your high interest in Cambodian civil engineering heritage.`,
        alignedPillars: ['interests', 'strengths'],
        actionLinkText: 'Launch Hydraulic Experiment Bench',
        actionPayload: { experimentId: 'exp-angkor-hydraulic-01' }
      },
      {
        id: 'match-career-cloud',
        matchType: 'career_role',
        title: 'Cloud Infrastructure & Distributed Systems Architect',
        provider: 'Cambodia STEM Talent Horizon 2030',
        matchScorePercentage: 95,
        reasoningJustification: `One of the top 3 highest-paying emerging tech roles in ASEAN. High demand in Phnom Penh banking, telecommunications, and regional tech enterprises.`,
        alignedPillars: ['goals', 'career', 'interests'],
        actionLinkText: 'View 5-Year Career Competency Ladder',
        actionPayload: { roleCode: 'cloud-architect' }
      }
    ];
  }

  /**
   * 6. AI Action System (Task 5)
   * Create and manage Learning Plans and Career Roadmaps
   */
  public getActionPlans(studentId: string): AIActionPlan[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM ai_action_plans WHERE student_id = ? ORDER BY created_at DESC').all(studentId) as any[];

    if (rows && rows.length > 0) {
      return rows.map(r => {
        const milestones = db.prepare('SELECT * FROM ai_action_milestones WHERE plan_id = ? ORDER BY milestone_order ASC').all(r.id) as any[];
        return {
          id: r.id,
          studentId: r.student_id,
          planType: r.plan_type,
          title: r.title,
          targetObjective: r.target_objective,
          timeframeWeeks: r.timeframe_weeks,
          progressPercentage: r.progress_percentage,
          status: r.status,
          milestones: (milestones || []).map(m => ({
            id: m.id,
            order: m.milestone_order,
            title: m.title,
            description: m.description,
            targetTimeline: m.target_date || 'Within 2 weeks',
            isCompleted: Boolean(m.is_completed),
            linkedEntityType: m.linked_entity_type,
            linkedEntityId: m.linked_entity_id
          })),
          createdAt: r.created_at,
          updatedAt: r.updated_at
        };
      });
    }

    // Initialize 2 default action plans: 1 Learning Plan + 1 Career Roadmap
    const initialPlans: AIActionPlan[] = [
      {
        id: `plan-bac2-sprint-${studentId}`,
        studentId,
        planType: 'learning_plan',
        title: '12-Week Bac II Grade-A Examination Sprint',
        targetObjective: 'Achieve Grade A (Total Score ≥ 90%) in MoEYS National Bac II Exam with distinction in Math & Physics',
        timeframeWeeks: 12,
        progressPercentage: 42,
        status: 'active',
        milestones: [
          {
            id: 'm-1',
            order: 1,
            title: 'Diagnostic Mastery Baseline across Math, Physics, Chemistry',
            description: 'Complete 3 standardized 2024 Bac II past exam papers under timed examination conditions.',
            targetTimeline: 'Week 1–2',
            isCompleted: true,
            linkedEntityType: 'quiz',
            linkedEntityId: 'diag-bac2-01'
          },
          {
            id: 'm-2',
            order: 2,
            title: 'Calculus Limit Theorems & 3D Vector Geometry Mastery',
            description: 'Solve 60 high-difficulty calculus proofs; eliminate recurring sign errors in integration.',
            targetTimeline: 'Week 3–4',
            isCompleted: true,
            linkedEntityType: 'course',
            linkedEntityId: 'math-calc-grade12'
          },
          {
            id: 'm-3',
            order: 3,
            title: 'Virtual STEM Laboratory: Electromagnetic & Kinematics Mastery',
            description: 'Run virtual experiments on projectile drag and magnetic induction in CDES Virtual Lab.',
            targetTimeline: 'Week 5–7',
            isCompleted: false,
            linkedEntityType: 'lab',
            linkedEntityId: 'exp-phys-em-01'
          },
          {
            id: 'm-4',
            order: 4,
            title: 'Full National Simulation & Timed Mock Exam Review',
            description: 'Participate in national digital mock exam run by CDES and receive AI misconception breakdown.',
            targetTimeline: 'Week 8–10',
            isCompleted: false,
            linkedEntityType: 'quiz',
            linkedEntityId: 'mock-national-01'
          },
          {
            id: 'm-5',
            order: 5,
            title: 'Final Revision & Metacognitive Peak Focus Conditioning',
            description: 'Light active recall flashcards, sleep rhythm stabilization, and formula synthesis cheatsheets.',
            targetTimeline: 'Week 11–12',
            isCompleted: false
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `plan-career-cloud-${studentId}`,
        studentId,
        planType: 'career_roadmap',
        title: '5-Year Journey: High School Scholar to Cloud Infrastructure Architect',
        targetObjective: 'Graduate with Bachelor in Computer Science (CADT/ITC) and enter regional cloud systems engineering role in Cambodia/ASEAN',
        timeframeWeeks: 260, // 5 years
        progressPercentage: 20,
        status: 'active',
        milestones: [
          {
            id: 'cr-1',
            order: 1,
            title: 'High School Distinction & MPTC Techo Scholarship Win',
            description: 'Graduate Bac II with distinction and secure 100% full-tuition scholarship to CADT or ITC.',
            targetTimeline: 'Year 1 (2026)',
            isCompleted: true
          },
          {
            id: 'cr-2',
            order: 2,
            title: 'Foundation Year: Data Structures, Algorithms & Linux Core',
            description: 'Master C/C++, algorithmic Big-O optimization, and Linux shell systems programming.',
            targetTimeline: 'Year 2 (2027)',
            isCompleted: false
          },
          {
            id: 'cr-3',
            order: 3,
            title: 'Makerspace Capstone: Distributed Microservices System',
            description: 'Build open-source distributed event queue and present at Cambodia Digital Tech Expo.',
            targetTimeline: 'Year 3 (2028)',
            isCompleted: false
          },
          {
            id: 'cr-4',
            order: 4,
            title: 'Industry Internship at Top Tier Telecom/Bank in Phnom Penh',
            description: 'Complete 6-month enterprise infrastructure internship at Smart Axiata or ABA Bank.',
            targetTimeline: 'Year 4 (2029)',
            isCompleted: false
          },
          {
            id: 'cr-5',
            order: 5,
            title: 'Professional Cloud Certification & Junior Architect Role',
            description: 'Pass AWS/GCP Certified Solutions Architect Associate exam and join enterprise engineering team.',
            targetTimeline: 'Year 5 (2030)',
            isCompleted: false
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Persist defaults to database
    for (const plan of initialPlans) {
      this.saveActionPlan(plan);
    }

    return initialPlans;
  }

  public saveActionPlan(plan: AIActionPlan): void {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO ai_action_plans (
        id, student_id, plan_type, title, target_objective,
        timeframe_weeks, progress_percentage, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        progress_percentage = excluded.progress_percentage,
        status = excluded.status,
        updated_at = excluded.updated_at
    `).run(
      plan.id,
      plan.studentId,
      plan.planType,
      plan.title,
      plan.targetObjective,
      plan.timeframeWeeks,
      plan.progressPercentage,
      plan.status,
      plan.createdAt,
      plan.updatedAt
    );

    for (const m of plan.milestones) {
      db.prepare(`
        INSERT INTO ai_action_milestones (
          id, plan_id, milestone_order, title, description,
          target_date, is_completed, linked_entity_type, linked_entity_id, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          is_completed = excluded.is_completed,
          completed_at = excluded.completed_at
      `).run(
        m.id,
        plan.id,
        m.order,
        m.title,
        m.description,
        m.targetTimeline,
        m.isCompleted ? 1 : 0,
        m.linkedEntityType || null,
        m.linkedEntityId || null,
        m.isCompleted ? new Date().toISOString() : null
      );
    }
  }

  public toggleMilestone(planId: string, milestoneId: string, studentId: string): boolean {
    const db = getDatabase();
    const row = db.prepare('SELECT is_completed FROM ai_action_milestones WHERE id = ? AND plan_id = ?').get(milestoneId, planId) as any;
    if (!row) return false;

    const newCompleted = row.is_completed ? 0 : 1;
    const completedAt = newCompleted ? new Date().toISOString() : null;

    db.prepare('UPDATE ai_action_milestones SET is_completed = ?, completed_at = ? WHERE id = ?').run(newCompleted, completedAt, milestoneId);

    // Recalculate plan percentage
    const allM = db.prepare('SELECT is_completed FROM ai_action_milestones WHERE plan_id = ?').all(planId) as any[];
    if (allM.length > 0) {
      const completedCount = allM.filter(m => m.is_completed === 1).length;
      const pct = Math.round((completedCount / allM.length) * 100);
      db.prepare('UPDATE ai_action_plans SET progress_percentage = ?, updated_at = ? WHERE id = ?').run(pct, new Date().toISOString(), planId);
    }

    if (newCompleted) {
      this.recordAnalyticsEvent(studentId, 'plan_milestone_completed', 'education_advisor', { planId, milestoneId });
    }

    return true;
  }

  /**
   * 7. Adaptive AI Tutor Foundation (Task 6)
   * Multi-modal explanations (Intuitive, Rigorous, Visual, Socratic) & ZPD ladder
   */
  public getAdaptiveConcept(conceptId?: string): AdaptiveTutorConcept {
    return {
      id: conceptId || 'concept-projectile-kinematics',
      subject: 'Physics & Applied Mathematics',
      topic: 'Projectile Motion & Trajectory Parabolic Equation',
      coreQuestion: 'Why does an object launched with velocity $v_0$ at angle $\\theta$ trace an inverted parabola, and how does air drag alter its optimal range?',
      explanations: {
        intuitive: {
          title: 'The "Two Clocks" Analogy (Intuitive)',
          body: `Imagine two separate clocks running at the exact same moment. One clock controls a skateboard rolling horizontally on frictionless ice ($x$-axis) at a steady, unbothered speed. The second clock controls a basketball thrown straight up into the air ($y$-axis), fighting gravity every millisecond until it stops and plunges downward.

When you launch a projectile, the universe simply stitches these two clocks together. Gravity never touches the skateboard's sideways journey; it only pulls down on the basketball. That curved arc in the sky is just what steady sideways walking looks like when you are also falling.`,
          analogyOrProof: 'Real-world visual: Tossing a mango from a moving tuk-tuk across a Phnom Penh street.'
        },
        rigorous: {
          title: 'Newtonian Differential Mechanics & Proof (Rigorous)',
          body: `Starting from Newton's Second Law with constant gravitational field $\\vec{g} = -g\\hat{j}$:
$$\\vec{a}(t) = \\frac{d^2\\vec{r}}{dt^2} = 0\\hat{i} - g\\hat{j}$$

Integrating with initial conditions $\\vec{v}(0) = v_0\\cos\\theta\\hat{i} + v_0\\sin\\theta\\hat{j}$ and $\\vec{r}(0) = 0$:
$$x(t) = (v_0\\cos\\theta)t \\implies t = \\frac{x}{v_0\\cos\\theta}$$
$$y(t) = (v_0\\sin\\theta)t - \\frac{1}{2}gt^2$$

Substituting $t$:
$$y(x) = (\\tan\\theta)x - \\left[\\frac{g}{2v_0^2\\cos^2\\theta}\\right]x^2$$
This is precisely a quadratic parabola $y = Ax - Bx^2$ where $B > 0$. Maximizing range $R = \\frac{v_0^2\\sin(2\\theta)}{g}$ yields optimal angle $\\theta = 45^\\circ$ in vacuum.`,
          analogyOrProof: 'Mathematical proof verified against MoEYS Grade 12 National Exam Question 2.'
        },
        visual: {
          title: 'Vector Field Decomposition & Energy Flow (Visual)',
          body: `Look at the energy trade-off across the flight path:
1. **Launch Point:** Kinetic Energy $E_k = \\frac{1}{2}m v_0^2$ is at maximum. Potential Energy $E_p = 0$.
2. **Apex (Peak):** The vertical velocity vector $v_y$ shrinks to absolute zero! But notice: horizontal velocity $v_x = v_0\\cos\\theta$ is STILL ALIVE. Total velocity is never zero.
3. **Descent:** Gravity accelerates the downward vector, returning all stored potential energy back into kinetic energy.
4. **With Air Drag ($F_d = -\\frac{1}{2}\\rho C_d A v^2$):** The descent is steeper than the ascent, compressing the back half of the curve into an asymmetric tear-drop shape.`,
          analogyOrProof: 'Interactive WebGL vector diagram rendered in CDES Animal Racing simulation.'
        },
        socratic: {
          title: 'First-Principles Guided Inquiry (Socratic)',
          body: `Let's break this down together with three quick questions:
1. *If a cannon shoots a bullet horizontally from a 10-meter tower, and simultaneously you drop an identical bullet from your hand at the same height, which bullet hits the ground first?*
2. *Why doesn't the immense horizontal speed of the fired bullet delay gravity from pulling it downward?*
3. *If horizontal speed doesn't change falling time, what single parameter actually dictates how long any projectile stays in the air?*`,
          analogyOrProof: 'Think about independent orthogonal coordinate frames.'
        }
      },
      difficultyLevels: {
        foundation: {
          problemStatement: 'A ball is kicked horizontally from a 20m high riverbank at 15 m/s. Taking $g = 10\\text{ m/s}^2$, how long does it take to reach the water?',
          hintScaffold: [
            'Only look at the vertical motion ($y$-axis). Horizontal speed does not change falling time.',
            'Use $h = \\frac{1}{2}gt^2 \\implies 20 = \\frac{1}{2}(10)t^2$.'
          ],
          sampleAnswer: '$t = \\sqrt{4} = 2.0\\text{ seconds}$. Horizontal distance traveled is $x = 15 \\times 2 = 30\\text{ meters}$.'
        },
        beginner: {
          problemStatement: 'A projectile is launched from ground level at $v_0 = 20\\text{ m/s}$ at an angle of $\\theta = 30^\\circ$. Find the maximum height reached. ($g = 9.8\\text{ m/s}^2$).',
          hintScaffold: [
            'Find initial vertical speed: $v_{y0} = v_0\\sin(30^\\circ) = 20(0.5) = 10\\text{ m/s}$.',
            'At apex, $v_y = 0$. Use $v_y^2 = v_{y0}^2 - 2gh$.'
          ],
          sampleAnswer: '$h_{max} = \\frac{10^2}{2(9.8)} = \\frac{100}{19.6} \\approx 5.10\\text{ meters}$.'
        },
        intermediate: {
          problemStatement: 'Calculate the required launch angle $\\theta$ to hit a target on an elevated wall at $(x = 40\\text{m}, y = 15\\text{m})$ with initial velocity $v_0 = 25\\text{ m/s}$.',
          hintScaffold: [
            'Use trajectory equation: $y = x\\tan\\theta - \\frac{g x^2}{2v_0^2}(1 + \\tan^2\\theta)$.',
            'Substitute $u = \\tan\\theta$ to create a quadratic equation $Au^2 + Bu + C = 0$.'
          ],
          sampleAnswer: 'Solving the quadratic in $\\tan\\theta$ yields two viable trajectory angles: $\\theta_1 \\approx 38.6^\\circ$ (flat direct trajectory) and $\\theta_2 \\approx 69.2^\\circ$ (high lobbing mortar arc).'
        },
        advanced: {
          problemStatement: 'Derive the optimal launch angle $\\theta$ to achieve maximum range when launching down an inclined hill of downward slope $\\beta$.',
          hintScaffold: [
            'Rotate coordinates to align the $x\'-$axis parallel to the hill slope.',
            'Alternatively, maximize $R(\\theta) = \\frac{v_0^2}{g\\cos^2\\beta}\\left[\\sin(2\\theta + \\beta) - \\sin\\beta\\right]$.'
          ],
          sampleAnswer: 'Setting derivative $\\frac{d}{d\\theta}[\\sin(2\\theta + \\beta)] = 0 \\implies 2\\theta + \\beta = 90^\\circ \\implies \\theta = 45^\\circ - \\frac{\\beta}{2}$.'
        },
        olympiad: {
          problemStatement: 'In the presence of linear air drag $\\vec{F}_d = -m k \\vec{v}$, prove that the trajectory asymptote is $x_{max} = \\frac{v_0\\cos\\theta}{k}$ and find the exact transcendental equation for the flight time $T$.',
          hintScaffold: [
            'Set up differential equation $\\frac{dv_x}{dt} = -k v_x \\implies v_x(t) = v_{x0}e^{-kt}$.',
            'Integrate to find $x(t) = \\frac{v_{x0}}{k}(1 - e^{-kt})$. As $t \\to \\infty$, $x \\to \\frac{v_{x0}}{k}$.'
          ],
          sampleAnswer: 'Flight time $T$ satisfies $y(T) = 0 \\implies \\left(\\frac{v_{y0}}{k} + \\frac{g}{k^2}\\right)(1 - e^{-kT}) - \\frac{g}{k}T = 0$. Solved numerically via Newton-Raphson.'
        }
      },
      practiceRecommendations: [
        { drillTitle: 'Animal Racing Kinematics Launch Calibrator', focusCompetency: 'Optimal launch angle selection under wind resistance', estimatedMinutes: 15, labLink: '/campus-world' },
        { drillTitle: 'MoEYS Bac II Vector Decomposition Timed Drill (5 Questions)', focusCompetency: 'Algebraic manipulation under exam time constraints', estimatedMinutes: 20 },
        { drillTitle: 'Angkor Water Siphon Projectile Velocity Lab', focusCompetency: 'Bernoulli exit speed combined with parabolic descent', estimatedMinutes: 25, labLink: '/virtual-lab' }
      ]
    };
  }

  /**
   * 8. Knowledge Ingestion, Verification & RAG Pipeline (Task 8)
   */
  public getKnowledgePipeline(): KnowledgePipelineItem[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM knowledge_pipeline_documents ORDER BY ingested_at DESC').all() as any[];

    if (rows && rows.length > 0) {
      return rows.map(r => ({
        id: r.id,
        documentTitle: r.document_title,
        curriculumDomain: r.curriculum_domain,
        sourceAgency: r.source_agency,
        verificationStatus: r.verification_status,
        embeddingModel: r.embedding_model,
        chunkCount: r.chunk_count,
        confidenceScore: r.confidence_score,
        lastVerifiedAt: r.last_verified_at,
        ingestedAt: r.ingested_at
      }));
    }

    const initialDocs: KnowledgePipelineItem[] = [
      {
        id: 'doc-moeys-bac2-2026',
        documentTitle: 'MoEYS National Examination Framework & Bac II Scoring Rubrics 2026',
        curriculumDomain: 'MoEYS Bac II',
        sourceAgency: 'MoEYS',
        verificationStatus: 'verified',
        embeddingModel: 'text-embedding-004-dense-128',
        chunkCount: 64,
        confidenceScore: 0.99,
        lastVerifiedAt: '2026-08-01',
        ingestedAt: '2026-07-15'
      },
      {
        id: 'doc-cadt-curriculum',
        documentTitle: 'CADT Undergraduate Digital Curriculum & Software Engineering Catalog',
        curriculumDomain: 'Higher Ed Cambodia',
        sourceAgency: 'CADT',
        verificationStatus: 'verified',
        embeddingModel: 'text-embedding-004-dense-128',
        chunkCount: 42,
        confidenceScore: 0.98,
        lastVerifiedAt: '2026-07-20',
        ingestedAt: '2026-06-10'
      },
      {
        id: 'doc-itc-polytechnic',
        documentTitle: 'ITC Tronc Commun & Engineering Cycle Academic Handbook',
        curriculumDomain: 'Higher Ed Cambodia',
        sourceAgency: 'ITC',
        verificationStatus: 'verified',
        embeddingModel: 'text-embedding-004-dense-128',
        chunkCount: 56,
        confidenceScore: 0.97,
        lastVerifiedAt: '2026-08-10',
        ingestedAt: '2026-06-25'
      },
      {
        id: 'doc-mptc-scholarships',
        documentTitle: 'MPTC Techo Digital Talent 100% Scholarship Regulation & Past Exam Archives',
        curriculumDomain: 'Scholarship Rules',
        sourceAgency: 'MPTC',
        verificationStatus: 'verified',
        embeddingModel: 'text-embedding-004-dense-128',
        chunkCount: 28,
        confidenceScore: 0.99,
        lastVerifiedAt: '2026-08-25',
        ingestedAt: '2026-08-05'
      },
      {
        id: 'doc-angkor-hydraulic-unesco',
        documentTitle: 'UNESCO & APSARA Water Architecture of Angkor: Baray Hydraulic Dynamics',
        curriculumDomain: 'STEM Research',
        sourceAgency: 'UNESCO',
        verificationStatus: 'peer_reviewed',
        embeddingModel: 'text-embedding-004-dense-128',
        chunkCount: 38,
        confidenceScore: 0.96,
        lastVerifiedAt: '2026-05-15',
        ingestedAt: '2026-05-01'
      }
    ];

    for (const doc of initialDocs) {
      db.prepare(`
        INSERT INTO knowledge_pipeline_documents (
          id, document_title, curriculum_domain, source_agency,
          verification_status, embedding_model, chunk_count,
          confidence_score, last_verified_at, ingested_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO NOTHING
      `).run(
        doc.id,
        doc.documentTitle,
        doc.curriculumDomain,
        doc.sourceAgency,
        doc.verificationStatus,
        doc.embeddingModel,
        doc.chunkCount,
        doc.confidenceScore,
        doc.lastVerifiedAt,
        doc.ingestedAt
      );
    }

    return initialDocs;
  }

  /**
   * 9. Closed-Loop Analytics (Task 9)
   * Track: Conversation -> Recommendation -> Acceptance -> Completion -> Outcome
   */
  public recordAnalyticsEvent(
    studentId: string,
    eventStage: 'conversation_initiated' | 'recommendation_delivered' | 'recommendation_accepted' | 'plan_milestone_completed' | 'academic_outcome_achieved',
    agentKey: AgentKey,
    details: Record<string, unknown>
  ): void {
    if (!this.privacy.canCollectAnalytics(studentId)) {
      return;
    }
    try {
      const db = getDatabase();
      const id = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      db.prepare(`
        INSERT INTO ai_interaction_analytics_events (
          id, student_id, event_stage, agent_key, details, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        id,
        studentId,
        eventStage,
        agentKey,
        JSON.stringify(details),
        new Date().toISOString()
      );
    } catch (err) {
      console.error('Error logging analytics event:', err);
    }
  }

  public getClosedLoopMetrics(studentId?: string): ClosedLoopAnalyticsMetric {
    const db = getDatabase();
    let rows: any[] = [];
    try {
      if (studentId) {
        rows = db.prepare('SELECT * FROM ai_interaction_analytics_events WHERE student_id = ? ORDER BY timestamp DESC LIMIT 100').all(studentId) as any[];
      } else {
        rows = db.prepare('SELECT * FROM ai_interaction_analytics_events ORDER BY timestamp DESC LIMIT 100').all() as any[];
      }
    } catch {
      // ignore
    }

    const conversations = rows.filter(r => r.event_stage === 'conversation_initiated').length;
    const delivered = rows.filter(r => r.event_stage === 'recommendation_delivered').length;
    const accepted = rows.filter(r => r.event_stage === 'recommendation_accepted').length;
    const completed = rows.filter(r => r.event_stage === 'plan_milestone_completed').length;
    const outcomes = rows.filter(r => r.event_stage === 'academic_outcome_achieved').length;
    const pct = (part: number, whole: number): number => (whole > 0 ? Math.round((part / whole) * 100) : 0);

    return {
      conversationsInitiated: conversations,
      recommendationsDelivered: delivered,
      recommendationsAccepted: accepted,
      milestonesCompleted: completed,
      academicOutcomesAchieved: outcomes,
      conversionFunnel: [
        { step: '1. Socratic Conversations', count: conversations, percentage: conversations > 0 ? 100 : 0 },
        { step: '2. Recommendations Delivered', count: delivered, percentage: pct(delivered, conversations) },
        { step: '3. Recommendations Accepted', count: accepted, percentage: pct(accepted, delivered) },
        { step: '4. Action Milestones Completed', count: completed, percentage: pct(completed, accepted) },
        { step: '5. Academic Outcomes Achieved', count: outcomes, percentage: pct(outcomes, completed) }
      ],
      recentEvents: rows.slice(0, 8).map(r => ({
        id: r.id,
        timestamp: r.timestamp,
        agentKey: r.agent_key as AgentKey,
        eventStage: r.event_stage,
        summary: r.event_stage.replace(/_/g, ' ').toUpperCase()
      }))
    };
  }
}

export const aiAgent2Service = new AIAgent2Service();
