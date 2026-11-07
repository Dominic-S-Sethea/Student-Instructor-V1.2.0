export type KnowledgeCategory =
  | 'Education Science'
  | 'Psychology'
  | 'Career Intelligence'
  | 'University Knowledge'
  | 'Scholarship Knowledge'
  | 'Teaching Methodology'
  | 'Child Development';

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: KnowledgeCategory;
  content: string;
  source?: string | null;
  created_at: string;
}

export interface KnowledgeEmbedding {
  id: string;
  document_id: string;
  vector: number[];
  metadata: {
    title: string;
    category: KnowledgeCategory;
    source?: string | null;
    chunk_index?: number;
    keywords?: string[];
  };
  created_at: string;
}

export interface StudentAIMemory {
  student_id: string;
  learning_summary: string;
  interest_summary: string;
  career_summary: string;
  behavior_summary: string;
  conversation_summary: string;
  last_interaction_at: string;
  updated_at: string;
}

export type RecommendationType = 'learning' | 'career' | 'scholarship';
export type RecommendationStatus = 'given' | 'clicked' | 'completed' | 'dismissed';

export interface AIRecommendation {
  id: string;
  student_id: string;
  recommendation_type: RecommendationType;
  title: string;
  description: string;
  match_reason: string;
  target_entity_id?: string | null;
  priority_score: number;
  status: RecommendationStatus;
  feedback_rating?: number | null;
  feedback_comments?: string | null;
  created_at: string;
  updated_at: string;
  action_label?: string;
  action_link?: string;
}

export interface RetrievedKnowledgeChunk {
  documentId: string;
  title: string;
  category: KnowledgeCategory;
  snippet: string;
  source?: string | null;
  similarityScore: number;
}

export interface AISafetyCheckResult {
  isSafe: boolean;
  violationType?: 'minor_pii' | 'psychological_diagnosis' | 'permanent_labeling' | 'absolute_coercion' | null;
  safetyReason?: string;
  adjustedText?: string;
  guidanceNote?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'student' | 'agent';
  text: string;
  timestamp: string;
  retrievedSources?: RetrievedKnowledgeChunk[];
  studentMemoryApplied?: {
    learningSummarySnippet?: string;
    interestSummarySnippet?: string;
    careerSummarySnippet?: string;
  };
  safetyFlags?: string[];
  suggestedQuestions?: string[];
  recommendedAction?: {
    type: RecommendationType;
    title: string;
    targetTab?: string;
  };
}

export interface AIStudentInsight {
  studentId: string;
  studentName: string;
  gradeLevel: string;
  memory: StudentAIMemory;
  cognitiveProfile: {
    engagementScore: number;
    persistenceScore: number;
    problemSolvingScore: number;
    primaryLearningStyle: string;
    pacingVelocity: string;
    frustrationRisk: 'Low' | 'Moderate' | 'High';
  };
  keyStrengths: string[];
  growthAreas: string[];
  activeRecommendationsCount: number;
  generatedAt: string;
}
