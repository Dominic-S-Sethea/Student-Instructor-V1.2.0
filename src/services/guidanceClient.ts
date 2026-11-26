import { apiFetchRaw } from './apiClient';

export interface AdvisorChatResponse {
  success: boolean;
  mode: 'ai_provider' | 'deterministic_offline' | 'provider_timeout' | 'provider_error' | 'safety_guardrail';
  providerStatus: 'active' | 'disabled' | 'timeout' | 'unavailable' | 'error' | 'guarded';
  isEstimate: boolean;
  persisted: boolean;
  sources: string[];
  retrievedSources?: Array<{
    id: string;
    title: string;
    category: string;
    source: string;
    url?: string;
  }>;
  webSources?: Array<{
    title: string;
    url: string;
  }>;
  toolsUsed?: string[];
  memoryUpdates?: string[];
  memoryStatus?: {
    enabled: boolean;
    turnCounter: number;
    shouldNudge: boolean;
  };
  unavailableData: string[];
  reply: string;
  source: string;
  recommendedMajors: string[];
  recommendedSkills: string[];
  suggestedMentors: string[];
  suggestedQuestions: string[];
}

export interface DecisionEvaluationResponse {
  success: boolean;
  mode: 'rule_based';
  isEstimate: boolean;
  persisted: boolean;
  sources: string[];
  unavailableData: string[];
  recommendations: {
    topMajor: string;
    alternativeMajor: string;
    fitReason: string;
    recommendedUniversities: Array<{
      univId: string;
      univName: string;
      univAbbr: string;
      profileScore: number;
      annualTuitionUSD: number;
      scholarshipMatch: string;
      curriculumStyle: string;
      whyFit: string;
    }>;
    roiAnalysis: {
      isEstimate: boolean;
      estimateNote: string;
      estimatedDegreeCostUSD: number;
      projectedMonthlySalaryUSD: number;
      paybackMonths: number;
      financialVerdict: string;
    };
    actionChecklist: Array<{
      stepNumber: number;
      title: string;
      deadline: string;
      instructions: string;
      completed: boolean;
    }>;
  };
}

export const guidanceClient = {
  async chat(payload: {
    userPrompt: string;
    messages?: Array<{ sender: string; text: string }>;
    studentProfile?: { name?: string; educationLevel?: string; favoriteSubjects?: string[]; targetMajor?: string };
  }): Promise<AdvisorChatResponse> {
    return apiFetchRaw<AdvisorChatResponse>('/api/advisor/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async evaluateDecision(payload: {
    interests: string[];
    mathAbility: string;
    strengths: string[];
    budgetTier: string;
    workStyle?: string;
    careerGoal?: string;
  }): Promise<DecisionEvaluationResponse> {
    return apiFetchRaw<DecisionEvaluationResponse>('/api/decision/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
