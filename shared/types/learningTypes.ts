export type SubjectSlug =
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'computer_science'
  | 'engineering'
  | 'business'
  | 'life_skills';

export type ContentType = 'article' | 'video' | 'simulation' | 'quiz' | 'project';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ActivityType = 'puzzle' | 'quiz' | 'simulation' | 'challenge' | 'project';

export interface Subject {
  id: string;
  slug: SubjectSlug;
  name: string;
  name_km: string;
  description: string;
  icon_key: string;
  color: string;
  order_index: number;
}

export interface Category {
  id: string;
  subject_id: string;
  slug: string;
  name: string;
  name_km: string;
  description: string;
  order_index: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  question_km?: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  explanation_km?: string;
}

export interface SimulationConfig {
  type: string;
  canvas_type?: 'pendulum' | 'titration' | 'osmosis' | 'circuit' | 'sorting';
  default_parameters: Record<string, number | string | boolean>;
  allowed_ranges?: Record<string, { min: number; max: number; step?: number; unit?: string }>;
  expected_formula?: string;
  visualization_notes?: string;
}

export interface ProjectBrief {
  challenge_title: string;
  challenge_scenario: string;
  deliverables: string[];
  evaluation_rubric: Array<{ criteria: string; points: number }>;
  recommended_tools: string[];
}

export interface LearningContent {
  id: string;
  subject_id: string;
  category_id: string | null;
  title: string;
  title_km: string;
  content_type: ContentType;
  difficulty: DifficultyLevel;
  read_time_minutes: number;
  media_url?: string;
  body_markdown: string;
  simulation_config?: SimulationConfig;
  quiz_data?: QuizQuestion[];
  project_brief?: ProjectBrief;
  learning_objectives: string[];
  merit_points: number;
  is_featured: number;
  created_at: string;
  subject?: Subject;
  category?: Category;
}

export interface LabExperiment {
  id: string;
  subject_id: string;
  title: string;
  title_km: string;
  category: string;
  description: string;
  learning_objectives: string[];
  apparatus_list: Array<{ name: string; icon: string; description: string }>;
  instructions: string[];
  parameters_schema: Record<string, { label: string; min: number; max: number; step: number; unit: string; default_val: number }>;
  initial_state: Record<string, any>;
  expected_outcome: Record<string, any>;
  safety_notes?: string;
  merit_points: number;
  difficulty: DifficultyLevel;
  badge_reward_code?: string;
  created_at: string;
  subject?: Subject;
}

export interface LabExperimentResult {
  id: string;
  student_id: string;
  experiment_id: string;
  status: 'in_progress' | 'completed' | 'failed';
  attempts_count: number;
  actions_log: Array<{ action: string; timestamp: string; details?: any }>;
  parameters_used: Record<string, any>;
  observation_notes?: string;
  outcome_data: Record<string, any>;
  score: number;
  completed_at?: string;
  updated_at: string;
  experiment?: LabExperiment;
}

export interface LearningActivity {
  id: string;
  title: string;
  title_km: string;
  activity_type: ActivityType;
  subject_id: string;
  difficulty: DifficultyLevel;
  learning_objective: string;
  instructions: string;
  activity_data: Record<string, any>;
  hint?: string;
  reward_points: number;
  item_reward_id?: string;
  badge_code?: string;
  created_at: string;
  subject?: Subject;
}

export interface StudentActivityProgress {
  id: string;
  student_id: string;
  activity_id: string;
  status: 'started' | 'in_progress' | 'completed' | 'needs_review';
  score: number;
  attempts: number;
  hint_used_count: number;
  response_data: Record<string, any>;
  completed_at?: string;
  updated_at: string;
  activity?: LearningActivity;
}

export interface LearningPath {
  id: string;
  code: string;
  title: string;
  title_km: string;
  target_career: string;
  description: string;
  difficulty: string;
  estimated_weeks: number;
  icon_key: string;
  color: string;
  created_at: string;
  steps?: LearningPathStep[];
}

export interface LearningPathStep {
  id: string;
  path_id: string;
  step_order: number;
  title: string;
  title_km: string;
  subject: string;
  step_type: 'content' | 'experiment' | 'activity' | 'project' | 'milestone';
  reference_id?: string;
  description: string;
  is_required: number;
}

export interface StudentLearningPath {
  id: string;
  student_id: string;
  path_id: string;
  current_step_order: number;
  status: 'active' | 'completed' | 'paused';
  progress_percentage: number;
  enrolled_at: string;
  last_active_at: string;
  path?: LearningPath;
}

export interface StudentLearningHistory {
  id: string;
  student_id: string;
  entity_type: 'content' | 'experiment' | 'activity' | 'quiz' | 'path';
  entity_id: string;
  title: string;
  subject: string;
  action: 'opened' | 'started' | 'completed' | 'hint_used' | 'quiz_attempt';
  score?: number;
  time_spent_seconds: number;
  performance_rating?: 'excellent' | 'good' | 'needs_remediation';
  strengths_observed: string[];
  weaknesses_observed: string[];
  timestamp: string;
}

export interface StudentAIEducationProfile {
  student_id: string;
  overall_progress: {
    total_activities_completed: number;
    total_experiments_completed: number;
    total_content_explored: number;
    average_quiz_score: number;
    learning_velocity_hours: number;
    grit_persistence_rating: number;
  };
  strengths: Array<{ subject: string; score: number; evidence: string }>;
  weaknesses: Array<{ subject: string; remediation_focus: string; hint_dependency: string }>;
  interest_patterns: Array<{ category: string; count: number; affinity_level: 'High' | 'Moderate' | 'Emerging' }>;
  enrolled_paths: StudentLearningPath[];
  recommended_next_action: {
    title: string;
    type: 'content' | 'experiment' | 'activity' | 'quiz';
    id: string;
    rationale: string;
    estimated_minutes: number;
  };
  recent_history: StudentLearningHistory[];
}
