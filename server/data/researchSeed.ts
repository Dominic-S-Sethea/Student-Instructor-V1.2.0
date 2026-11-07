/**
 * CDES Phase 8 Education Research Laboratory & Learning Science Seed Data
 * Empirically-grounded pedagogical studies, teaching method benchmarks,
 * Bayesian Knowledge Tracing concepts, and Cambodian education intelligence.
 */

export interface SeedResearchExperiment {
  id: string;
  slug: string;
  title: string;
  hypothesis: string;
  research_question: string;
  domain: 'stem_foundations' | 'moeys_bac_ii' | 'computer_science' | 'ai_pedagogy' | 'retention_science';
  status: 'draft' | 'active' | 'analyzing' | 'concluded';
  primary_metric: string;
  secondary_metrics: string[];
  target_sample_size: number;
  current_sample_size: number;
  power_analysis: { alpha: number; power: number; target_effect_size: number };
  start_date: string;
  end_date: string | null;
  groups: Array<{
    id: string;
    group_name: string;
    group_type: 'control' | 'experimental';
    intervention_type: 'traditional' | 'interactive' | 'ai_assisted' | 'game_based';
    pedagogy_parameters: Record<string, any>;
    target_allocation_ratio: number;
    participant_count: number;
  }>;
  results?: {
    sample_size: number;
    group_metrics: Record<string, any>;
    comparative_analysis: {
      p_value: number;
      t_stat: number;
      effect_size_cohens_d: number;
      confidence_interval_95: string;
      is_statistically_significant: boolean;
    };
    key_findings?: string[];
    keyFindings?: string[];
    pedagogical_recommendation: string;
    target_curriculum_revision: string;
  };
}

export const initialResearchExperiments: SeedResearchExperiment[] = [
  {
    id: 'exp-01',
    slug: 'interactive-simulation-vs-didactic-kinematics',
    title: 'Interactive Micro-Simulation vs Didactic Text in High School Bac II Kinematics',
    research_question: 'Does dynamic vector manipulation in projectile motion reduce spatial misconception errors among Grade 12 Cambodian STEM students?',
    hypothesis: 'Students utilizing real-time parameter sliders and visual gravity trajectory simulations will demonstrate >= 15% higher normalized learning gains and significantly reduced misconceptions compared to static textbook formula memorization.',
    domain: 'stem_foundations',
    status: 'concluded',
    primary_metric: 'normalized_learning_gain',
    secondary_metrics: ['time_on_task', '30d_retention', 'persistence_index', 'spatial_misconception_rate'],
    target_sample_size: 140,
    current_sample_size: 148,
    power_analysis: { alpha: 0.05, power: 0.85, target_effect_size: 0.65 },
    start_date: '2026-06-01',
    end_date: '2026-08-15',
    groups: [
      {
        id: 'grp-01-a',
        group_name: 'Group A (Control - Traditional Text & Equations)',
        group_type: 'control',
        intervention_type: 'traditional',
        pedagogy_parameters: { format: 'standard_formulaic', interactivity: 'none', feedback: 'static_answer_key' },
        target_allocation_ratio: 0.33,
        participant_count: 48,
      },
      {
        id: 'grp-01-b',
        group_name: 'Group B (Experimental - Interactive HTML5 Simulation)',
        group_type: 'experimental',
        intervention_type: 'interactive',
        pedagogy_parameters: { format: 'vector_canvas_slider', interactivity: 'high', feedback: 'real_time_trajectory' },
        target_allocation_ratio: 0.33,
        participant_count: 52,
      },
      {
        id: 'grp-01-c',
        group_name: 'Group C (Experimental - AI Socratic Guided Inquiry)',
        group_type: 'experimental',
        intervention_type: 'ai_assisted',
        pedagogy_parameters: { format: 'socratic_tutor_dialogue', interactivity: 'high', feedback: 'adaptive_scaffolding' },
        target_allocation_ratio: 0.34,
        participant_count: 48,
      },
    ],
    results: {
      sample_size: 148,
      group_metrics: {
        'Group A (Control)': {
          pre_test_mean: 46.2,
          post_test_mean: 63.5,
          normalized_gain: 0.32,
          time_on_task_minutes: 24.5,
          retention_30d: 58.2,
          misconception_resolution: '41%',
        },
        'Group B (Interactive Simulation)': {
          pre_test_mean: 45.8,
          post_test_mean: 82.4,
          normalized_gain: 0.68,
          time_on_task_minutes: 36.8,
          retention_30d: 79.5,
          misconception_resolution: '84%',
        },
        'Group C (AI Socratic Inquiry)': {
          pre_test_mean: 47.1,
          post_test_mean: 85.0,
          normalized_gain: 0.72,
          time_on_task_minutes: 41.2,
          retention_30d: 83.1,
          misconception_resolution: '88%',
        },
      },
      comparative_analysis: {
        p_value: 0.002,
        t_stat: 4.82,
        effect_size_cohens_d: 0.79,
        confidence_interval_95: '95% CI [0.48, 1.10]',
        is_statistically_significant: true,
      },
      keyFindings: [
        'Interactive simulations and AI Socratic inquiry doubled the normalized learning gain (<g> = 0.68 and 0.72 vs 0.32) relative to static formulas.',
        'The confusion between instantaneous velocity and acceleration vector components dropped by 84% in the interactive cohort.',
        '30-day conceptual retention increased by 21.3 percentage points for students who visually adjusted initial launch angle parameters.',
      ],
      pedagogical_recommendation:
        'Standardize vector-based kinetic micro-simulations across all MoEYS Grade 12 physics modules prior to formulaic calculus derivations.',
      target_curriculum_revision: 'MoEYS Bac II Physics Chapter 2: Mechanics & Gravitational Trajectories',
    },
  },
  {
    id: 'exp-02',
    slug: 'ai-socratic-scaffolding-vs-direct-solution-coding',
    title: 'AI Socratic Scaffolding vs Immediate Solution in Python Recursion & Data Structures',
    research_question: 'Does progressive cognitive scaffolding from an AI tutor prevent "copy-paste mental fatigue" and foster algorithmic problem-solving autonomy?',
    hypothesis: 'Guiding students with progressive Socratic hints within their Zone of Proximal Development will yield higher independent problem completion on unseen transfer tasks compared to immediate code answers.',
    domain: 'computer_science',
    status: 'active',
    primary_metric: 'unseen_transfer_score',
    secondary_metrics: ['hint_dependency_index', 'debugging_persistence_minutes', 'self_efficacy_rating'],
    target_sample_size: 120,
    current_sample_size: 114,
    power_analysis: { alpha: 0.05, power: 0.80, target_effect_size: 0.55 },
    start_date: '2026-08-01',
    end_date: null,
    groups: [
      {
        id: 'grp-02-a',
        group_name: 'Group A (Direct Solution Reveal on Failure)',
        group_type: 'control',
        intervention_type: 'traditional',
        pedagogy_parameters: { hint_level: 'full_code_solution', latency_delay: 0 },
        target_allocation_ratio: 0.5,
        participant_count: 56,
      },
      {
        id: 'grp-02-b',
        group_name: 'Group B (ZPD Socratic Progressive Hints)',
        group_type: 'experimental',
        intervention_type: 'ai_assisted',
        pedagogy_parameters: { hint_level: 'conceptual_questioning', adaptive_zpd: true },
        target_allocation_ratio: 0.5,
        participant_count: 58,
      },
    ],
    results: {
      sample_size: 114,
      group_metrics: {
        'Group A (Direct Solution)': {
          initial_task_completion: 96.0,
          unseen_transfer_score: 51.4,
          avg_debug_persistence_minutes: 8.2,
          hint_dependency_score: 84.0,
        },
        'Group B (Socratic Scaffolding)': {
          initial_task_completion: 88.5,
          unseen_transfer_score: 79.2,
          avg_debug_persistence_minutes: 21.6,
          hint_dependency_score: 32.0,
        },
      },
      comparative_analysis: {
        p_value: 0.006,
        t_stat: 3.41,
        effect_size_cohens_d: 0.64,
        confidence_interval_95: '95% CI [0.31, 0.97]',
        is_statistically_significant: true,
      },
      keyFindings: [
        'While direct solution reveals inflated initial module completion, unseen transfer problem-solving plunged to 51.4%.',
        'Students in the Socratic Scaffolding cohort developed 2.6x greater debugging persistence on novel algorithmic challenges.',
        'ZPD-calibrated hints eliminated learned helplessness without causing frustration-driven abandonment.',
      ],
      pedagogical_recommendation:
        'Enforce a minimum of two Socratic conceptual questions before unlocking syntax-level hints in the CDES code execution environment.',
      target_curriculum_revision: 'CADT & ITC Foundation Year CS 101: Algorithmic Thinking & Recursion',
    },
  },
  {
    id: 'exp-03',
    slug: 'avatar-world-quests-vs-worksheets-chemistry',
    title: 'Avatar World Gamified Quest Loops vs Static Worksheets in Organic Chemistry',
    research_question: 'How does embedding IUPAC hydrocarbon nomenclature into 3D avatar laboratory crafting quests influence voluntary study time and mastery?',
    hypothesis: 'Gamified laboratory item-crafting will increase voluntary practice repetitions by >40% without increasing cognitive overload or frivolous guessing.',
    domain: 'moeys_bac_ii',
    status: 'active',
    primary_metric: 'practice_repetition_count',
    secondary_metrics: ['voluntary_time_spent', 'nomenclature_accuracy', 'retention_rate'],
    target_sample_size: 100,
    current_sample_size: 92,
    power_analysis: { alpha: 0.05, power: 0.80, target_effect_size: 0.50 },
    start_date: '2026-07-15',
    end_date: null,
    groups: [
      {
        id: 'grp-03-a',
        group_name: 'Group A (Standard PDF Worksheet Exercises)',
        group_type: 'control',
        intervention_type: 'traditional',
        pedagogy_parameters: { gamification: 'none', interface: 'pdf_form' },
        target_allocation_ratio: 0.5,
        participant_count: 45,
      },
      {
        id: 'grp-03-b',
        group_name: 'Group B (Avatar Laboratory Molecular Synthesis Quests)',
        group_type: 'experimental',
        intervention_type: 'game_based',
        pedagogy_parameters: { gamification: 'avatar_room_unlocks', merit_reward: 40 },
        target_allocation_ratio: 0.5,
        participant_count: 47,
      },
    ],
    results: {
      sample_size: 92,
      group_metrics: {
        'Group A (Worksheets)': {
          avg_practice_problems: 18.4,
          voluntary_study_minutes: 22.1,
          nomenclature_accuracy: 72.8,
          weekly_return_rate: 42.0,
        },
        'Group B (Avatar Quests)': {
          avg_practice_problems: 47.6,
          voluntary_study_minutes: 58.4,
          nomenclature_accuracy: 86.2,
          weekly_return_rate: 81.5,
        },
      },
      comparative_analysis: {
        p_value: 0.001,
        t_stat: 5.12,
        effect_size_cohens_d: 0.88,
        confidence_interval_95: '95% CI [0.55, 1.21]',
        is_statistically_significant: true,
      },
      keyFindings: [
        'Voluntary practice problems attempted surged by 158% when mapped to room decoration recipe rewards.',
        'Weekly retention and return frequency doubled (81.5% vs 42.0%).',
        'No evidence of random "trial-and-error click guessing" was observed when merit penalties were softly paired with diagnostic feedback.',
      ],
      pedagogical_recommendation:
        'Integrate Bac II science practice milestones into Avatar World laboratory unlocks to convert passive revision into active creation.',
      target_curriculum_revision: 'MoEYS Bac II Chemistry: Organic Compounds & Esterification',
    },
  },
  {
    id: 'exp-04',
    slug: 'spaced-retrieval-ebbinghaus-calculus-retention',
    title: 'Spaced Retrieval Practice vs Massed Cramming in Foundation Calculus',
    research_question: 'Does algorithmic scheduling based on Ebbinghaus memory decay curves significantly improve 60-day calculus final exam performance?',
    hypothesis: 'Automated 1-3-7-21 day spaced micro-quizzing will preserve >75% of conceptual integral calculus fluency compared to single-session cramming.',
    domain: 'retention_science',
    status: 'analyzing',
    primary_metric: '60d_retention_score',
    secondary_metrics: ['forgetting_curve_half_life', 'recall_latency_seconds', 'mastery_decay_rate'],
    target_sample_size: 150,
    current_sample_size: 135,
    power_analysis: { alpha: 0.05, power: 0.85, target_effect_size: 0.60 },
    start_date: '2026-05-10',
    end_date: '2026-09-01',
    groups: [
      {
        id: 'grp-04-a',
        group_name: 'Group A (Massed Single-Week Cramming)',
        group_type: 'control',
        intervention_type: 'traditional',
        pedagogy_parameters: { schedule: 'massed_block', interval_days: [0, 1] },
        target_allocation_ratio: 0.5,
        participant_count: 67,
      },
      {
        id: 'grp-04-b',
        group_name: 'Group B (Spaced Algorithmic Retrieval 1-3-7-21d)',
        group_type: 'experimental',
        intervention_type: 'interactive',
        pedagogy_parameters: { schedule: 'ebbinghaus_spaced', interval_days: [1, 3, 7, 21] },
        target_allocation_ratio: 0.5,
        participant_count: 68,
      },
    ],
    results: {
      sample_size: 135,
      group_metrics: {
        'Group A (Massed Cramming)': {
          immediate_post_test: 84.2,
          retention_60d: 38.6,
          decay_half_life_days: 6.2,
          recall_latency_seconds: 14.5,
        },
        'Group B (Spaced Retrieval)': {
          immediate_post_test: 82.8,
          retention_60d: 76.4,
          decay_half_life_days: 34.8,
          recall_latency_seconds: 5.2,
        },
      },
      comparative_analysis: {
        p_value: 0.0004,
        t_stat: 6.04,
        effect_size_cohens_d: 0.94,
        confidence_interval_95: '95% CI [0.62, 1.26]',
        is_statistically_significant: true,
      },
      keyFindings: [
        'Massed cramming resulted in a steep memory cliff: 60-day recall crashed from 84.2% down to 38.6%.',
        'Spaced algorithmic review stabilized long-term retention at 76.4%—nearly double the control group.',
        'Recall response latency was reduced by 64%, indicating deep cognitive fluency rather than laborious re-derivation.',
      ],
      pedagogical_recommendation:
        'Deploy automated 3-minute spaced review micro-challenges across the student notification drawer before upcoming national tests.',
      target_curriculum_revision: 'ITC & RUPP Calculus I: Definite Integrals and Differential Equations',
    },
  },
];

export const initialTeachingMethodBenchmarks = [
  {
    method_key: 'traditional',
    method_name: 'Traditional Didactic Learning',
    description: 'Lecture-style textbook readings, static PDF notes, and formula memorization worksheets.',
    avg_engagement_minutes: 19.4,
    completion_rate_percentage: 64.2,
    normalized_gain_score: 0.34,
    retention_rate_30d: 48.5,
    persistence_index: 56.0,
    cognitive_load_rating: 'High Passive Load (Extraneous text processing)',
    best_fit_domains: ['Historical context', 'Standard definitions', 'Formula references'],
    sample_students_count: 620,
  },
  {
    method_key: 'interactive',
    method_name: 'Interactive STEM Simulations & Labs',
    description: 'HTML5 micro-simulations with real-time sliders, visual physics engines, and parametric circuit analysis.',
    avg_engagement_minutes: 38.6,
    completion_rate_percentage: 84.5,
    normalized_gain_score: 0.69,
    retention_rate_30d: 78.2,
    persistence_index: 82.5,
    cognitive_load_rating: 'Optimal Germane Load (Direct mental schema building)',
    best_fit_domains: ['Physics Mechanics', 'Electromagnetism', 'Calculus geometry', 'Circuitry'],
    sample_students_count: 740,
  },
  {
    method_key: 'ai_assisted',
    method_name: 'AI-Assisted Socratic Intelligence',
    description: 'Adaptive AI tutor with dynamic Zone of Proximal Development (ZPD) scaffolding, mistake diagnosis, and personalized Socratic hints.',
    avg_engagement_minutes: 42.1,
    completion_rate_percentage: 88.0,
    normalized_gain_score: 0.74,
    retention_rate_30d: 82.6,
    persistence_index: 87.0,
    cognitive_load_rating: 'Adaptive Dynamic Scaffolding (Prevents cognitive overload)',
    best_fit_domains: ['Algorithm debugging', 'Bac II proof strategies', 'Conceptual misconceptions', 'Customized pacing'],
    sample_students_count: 810,
  },
  {
    method_key: 'game_based',
    method_name: 'Game-Based & Avatar World Quests',
    description: 'Narrative exploration, laboratory crafting recipes, merit points, and visual room unlock incentives.',
    avg_engagement_minutes: 49.5,
    completion_rate_percentage: 91.2,
    normalized_gain_score: 0.66,
    retention_rate_30d: 75.8,
    persistence_index: 92.4,
    cognitive_load_rating: 'High Intrinsic Motivation with Micro-Challenge Pacing',
    best_fit_domains: ['Chemistry synthesis', 'STEM vocabulary', 'Daily study habits', 'Early coding concepts'],
    sample_students_count: 690,
  },
];

export const initialStudentMasteryStates = [
  {
    id: 'mst-01',
    student_id: 'usr-student-01',
    concept_id: 'concept-kinematics-vectors',
    concept_name: 'Kinematics: 2D Velocity & Acceleration Vectors',
    subject: 'Physics',
    prior_mastery_p_l0: 0.20,
    transition_prob_p_t: 0.18,
    guess_prob_p_g: 0.15,
    slip_prob_p_s: 0.08,
    current_mastery_prob: 0.91,
    mastery_status: 'mastered',
    total_opportunities: 8,
    correct_streak: 5,
    last_practiced_at: '2026-09-15T14:30:00Z',
  },
  {
    id: 'mst-02',
    student_id: 'usr-student-01',
    concept_id: 'concept-electromagnetism-flux',
    concept_name: 'Electromagnetism: Faraday Law & Magnetic Flux',
    subject: 'Physics',
    prior_mastery_p_l0: 0.15,
    transition_prob_p_t: 0.15,
    guess_prob_p_g: 0.20,
    slip_prob_p_s: 0.12,
    current_mastery_prob: 0.68,
    mastery_status: 'developing',
    total_opportunities: 5,
    correct_streak: 2,
    last_practiced_at: '2026-09-16T10:15:00Z',
  },
  {
    id: 'mst-03',
    student_id: 'usr-student-01',
    concept_id: 'concept-calculus-integration-parts',
    concept_name: 'Calculus: Integration by Parts & Trigonometric Substitution',
    subject: 'Mathematics',
    prior_mastery_p_l0: 0.10,
    transition_prob_p_t: 0.12,
    guess_prob_p_g: 0.18,
    slip_prob_p_s: 0.10,
    current_mastery_prob: 0.76,
    mastery_status: 'developing',
    total_opportunities: 7,
    correct_streak: 3,
    last_practiced_at: '2026-09-16T16:45:00Z',
  },
  {
    id: 'mst-04',
    student_id: 'usr-student-01',
    concept_id: 'concept-python-binary-search-trees',
    concept_name: 'Algorithms: Binary Search Trees & Tree Traversal',
    subject: 'Computer Science',
    prior_mastery_p_l0: 0.25,
    transition_prob_p_t: 0.22,
    guess_prob_p_g: 0.12,
    slip_prob_p_s: 0.06,
    current_mastery_prob: 0.94,
    mastery_status: 'retained',
    total_opportunities: 10,
    correct_streak: 6,
    last_practiced_at: '2026-09-14T11:20:00Z',
  },
  {
    id: 'mst-05',
    student_id: 'usr-student-01',
    concept_id: 'concept-chemistry-organic-esters',
    concept_name: 'Organic Chemistry: Esterification & Functional Groups',
    subject: 'Chemistry',
    prior_mastery_p_l0: 0.15,
    transition_prob_p_t: 0.14,
    guess_prob_p_g: 0.25,
    slip_prob_p_s: 0.14,
    current_mastery_prob: 0.44,
    mastery_status: 'emerging',
    total_opportunities: 4,
    correct_streak: 1,
    last_practiced_at: '2026-09-17T08:00:00Z',
  },
];

export const initialMisconceptionLogs = [
  {
    id: 'misc-01',
    student_id: 'usr-student-01',
    subject: 'Physics',
    topic: 'Kinematics',
    misconception_code: 'PHYS-MISC-01',
    misconception_title: 'Confusing zero vertical velocity with zero acceleration at trajectory apex',
    error_taxonomy: 'conceptual_flaw',
    context_details: 'Student stated that at the highest point of projectile flight, acceleration is 0 m/s^2 instead of downward g (9.8 m/s^2).',
    suggested_intervention: 'Trigger 1-minute 2D force vector simulation showing gravitational vector remains constant throughout flight.',
    resolved: 1,
    logged_at: '2026-09-12T15:20:00Z',
  },
  {
    id: 'misc-02',
    student_id: 'usr-student-01',
    subject: 'Physics',
    topic: 'Electromagnetism',
    misconception_code: 'PHYS-MISC-02',
    misconception_title: 'Believing magnetic flux is identical to magnetic field strength',
    error_taxonomy: 'conceptual_flaw',
    context_details: 'Student failed to multiply by cross-sectional area and angle cos(theta) when computing induced electromotive force.',
    suggested_intervention: 'Interactive loop rotation animation showing how perpendicular vs parallel orientation alters captured magnetic flux.',
    resolved: 0,
    logged_at: '2026-09-16T10:18:00Z',
  },
  {
    id: 'misc-03',
    student_id: 'usr-student-01',
    subject: 'Mathematics',
    topic: 'Calculus',
    misconception_code: 'MATH-MISC-04',
    misconception_title: 'Neglecting the constant of integration C when using substitution',
    error_taxonomy: 'calculation_slip',
    context_details: 'Missed + C in indefinite integral u-substitution step, affecting boundary value condition calculation.',
    suggested_intervention: 'Provide visual graph family display demonstrating infinite parallel vertical curves shifting by C.',
    resolved: 1,
    logged_at: '2026-09-14T17:05:00Z',
  },
  {
    id: 'misc-04',
    student_id: 'usr-student-01',
    subject: 'Computer Science',
    topic: 'Recursion',
    misconception_code: 'CS-MISC-02',
    misconception_title: 'Missing return statement in recursive sub-call tree branch',
    error_taxonomy: 'conceptual_flaw',
    context_details: 'Function computes recursive result on left child but forgets to propagate returned integer up the call stack.',
    suggested_intervention: 'Display visual call stack frame bubble animation illustrating bubble popping and value transmission.',
    resolved: 1,
    logged_at: '2026-09-13T09:40:00Z',
  },
  {
    id: 'misc-05',
    student_id: 'usr-student-01',
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    misconception_code: 'CHEM-MISC-03',
    misconception_title: 'Inverting alcohol and carboxylic acid reactant roles in ester hydrolysis',
    error_taxonomy: 'missing_prerequisite',
    context_details: 'Struggled to identify the nucleophilic attack of the water molecule on the carbonyl carbon during acidic hydrolysis.',
    suggested_intervention: 'Color-coded atom tracking simulation tracing oxygen-18 isotope label from water to carboxylic acid product.',
    resolved: 0,
    logged_at: '2026-09-17T08:05:00Z',
  },
];

export const initialTeacherClassAnalytics = [
  {
    id: 'cls-01',
    class_name: 'Grade 12 STEM A (Bac II Preparation)',
    grade_level: 'Grade 12',
    subject: 'Advanced Physics & Mathematics',
    school_name: 'Preah Sisowath High School',
    province: 'Phnom Penh',
    student_count: 42,
    average_mastery_percentage: 78.4,
    learning_velocity_index: 1.24,
    top_misconceptions: [
      { code: 'PHYS-MISC-02', title: 'Magnetic flux angle cosine confusion', affectedPercentage: 54 },
      { code: 'MATH-MISC-03', title: 'Integration by parts sign inversion', affectedPercentage: 38 },
      { code: 'PHYS-MISC-05', title: 'Doppler frequency wavelength shift direction', affectedPercentage: 29 },
    ],
    recommended_interventions: [
      'Conduct a 15-minute group interactive vector orientation demo on Faraday Law before Friday quiz.',
      'Assign the CDES 3D Magnetic Flux simulation module to the 22 students who exhibited angle confusion.',
      'Differentiate homework: Provide challenge tasks for the 12 accelerating students while offering Socratic scaffolding for emerging learners.',
    ],
    students_needing_scaffolding: 6,
    students_accelerating: 12,
  },
  {
    id: 'cls-02',
    class_name: 'Grade 12 Science Cohort 2',
    grade_level: 'Grade 12',
    subject: 'Chemistry & Biology',
    school_name: 'Hun Sen Krong Tep High School',
    province: 'Siem Reap',
    student_count: 38,
    average_mastery_percentage: 71.2,
    learning_velocity_index: 1.08,
    top_misconceptions: [
      { code: 'CHEM-MISC-03', title: 'Esterification reaction water equilibrium', affectedPercentage: 62 },
      { code: 'CHEM-MISC-01', title: 'Le Chatelier principle pressure vs volume response', affectedPercentage: 45 },
    ],
    recommended_interventions: [
      'Utilize the Avatar World laboratory ester crafting game during Tuesday revision hour.',
      'Focus peer study circles on IUPAC functional group nomenclature review.',
    ],
    students_needing_scaffolding: 9,
    students_accelerating: 7,
  },
  {
    id: 'cls-03',
    class_name: 'CADT CS Foundation Year (Cohort 2026)',
    grade_level: 'University Year 1',
    subject: 'Data Structures & Algorithms',
    school_name: 'Cambodia Academy of Digital Technology (CADT)',
    province: 'Phnom Penh',
    student_count: 55,
    average_mastery_percentage: 84.5,
    learning_velocity_index: 1.35,
    top_misconceptions: [
      { code: 'CS-MISC-04', title: 'Recursion tree space complexity O(h) vs O(n)', affectedPercentage: 35 },
      { code: 'CS-MISC-08', title: 'Graph cycle detection in directed vs undirected graphs', affectedPercentage: 28 },
    ],
    recommended_interventions: [
      'Incorporate call-stack memory visualizer in next laboratory assignment.',
      'Encourage pairing of high-persistence students with learners in the developing mastery band.',
    ],
    students_needing_scaffolding: 4,
    students_accelerating: 21,
  },
];

export const initialEducationKnowledgeAggregates = [
  {
    id: 'agg-01',
    domain: 'MoEYS Bac II STEM',
    subject: 'Mathematics (Calculus & Probability)',
    grade_or_level: 'Grade 12',
    difficulty_rating: 4.4,
    provincial_readiness: {
      'Phnom Penh': 82,
      'Battambang': 76,
      'Siem Reap': 74,
      'Kandal': 73,
      'Kampong Cham': 69,
      'Takeo': 67,
      'Other Provinces': 61,
    },
    top_learning_challenges: [
      'Integration of trigonometric and rational algebraic functions',
      'Conditional probability and Bayes theorem word problems in Khmer',
      '3D Coordinate geometry line and plane intersections',
    ],
    career_alignment_score: 96.0,
    national_curriculum_notes: 'Prerequisite for CADT Computer Science, ITC Engineering, and AUPP Data Science entrance examinations.',
  },
  {
    id: 'agg-02',
    domain: 'MoEYS Bac II STEM',
    subject: 'Physics (Electromagnetism & Waves)',
    grade_or_level: 'Grade 12',
    difficulty_rating: 4.2,
    provincial_readiness: {
      'Phnom Penh': 79,
      'Battambang': 72,
      'Siem Reap': 70,
      'Kandal': 71,
      'Kampong Cham': 65,
      'Takeo': 63,
      'Other Provinces': 57,
    },
    top_learning_challenges: [
      'Alternating current (AC) RLC circuit resonance and impedance calculation',
      'Lenz law and magnetic flux direction determination',
      'Wave interference and double-slit wavelength calculation',
    ],
    career_alignment_score: 92.5,
    national_curriculum_notes: 'Critical foundation for Telecommunications, Electrical Engineering, and Robotics degrees.',
  },
  {
    id: 'agg-03',
    domain: 'MoEYS Bac II STEM',
    subject: 'Chemistry (Organic Chemistry & Kinetics)',
    grade_or_level: 'Grade 12',
    difficulty_rating: 3.9,
    provincial_readiness: {
      'Phnom Penh': 84,
      'Battambang': 78,
      'Siem Reap': 75,
      'Kandal': 76,
      'Kampong Cham': 71,
      'Takeo': 70,
      'Other Provinces': 64,
    },
    top_learning_challenges: [
      'Multi-step organic synthesis reaction pathways',
      'Chemical equilibrium constants with temperature dependence',
      'Amino acid peptide linkage and buffer solutions',
    ],
    career_alignment_score: 89.0,
    national_curriculum_notes: 'Essential for UHS Medicine & Pharmacy, ITC Chemical Engineering, and Agricultural Biotechnology.',
  },
  {
    id: 'agg-04',
    domain: 'Higher Education Tech',
    subject: 'Computer Science (Algorithms & Systems)',
    grade_or_level: 'University Year 1-2',
    difficulty_rating: 4.6,
    provincial_readiness: {
      'Phnom Penh': 86,
      'Battambang': 70,
      'Siem Reap': 68,
      'Kandal': 67,
      'Kampong Cham': 62,
      'Takeo': 59,
      'Other Provinces': 54,
    },
    top_learning_challenges: [
      'Dynamic programming memoization and state transition equations',
      'Memory management and pointers in low-level languages',
      'Asynchronous concurrency and distributed system race conditions',
    ],
    career_alignment_score: 98.5,
    national_curriculum_notes: 'Primary digital talent pillar recognized by MPTC and National Digital Economy Policy 2021-2035.',
  },
];
