import { apiFetchRaw } from './apiClient';

export type HermesDocType = 'USER' | 'MEMORY';
export type HermesFactCategory =
  | 'preference'
  | 'goal'
  | 'strength'
  | 'growth_area'
  | 'milestone'
  | 'target_school'
  | 'study_habit';
export type HermesFactFeedbackAction = 'confirm' | 'correct' | 'end' | 'revert';

export interface HermesMemoryDoc {
  id: string;
  userId: string;
  docType: HermesDocType;
  content: string;
  charLimit: number;
  turnCounter: number;
  nudgeInterval: number;
  lastConsolidatedAt: string | null;
  updatedAt: string;
}

export interface HermesMemoryFact {
  id: string;
  userId: string;
  category: HermesFactCategory;
  factText: string;
  entities: string[];
  keywords: string[];
  trustScore: number;
  confirmations: number;
  status: 'active' | 'superseded' | 'ended' | 'reverted';
  source: 'explicit_user' | 'observed_pattern' | 'app_milestone';
  previousFactText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HermesMemorySnapshotResponse {
  success: boolean;
  enabled: boolean;
  reason?: string;
  userDoc: HermesMemoryDoc | null;
  memoryDoc: HermesMemoryDoc | null;
  facts: HermesMemoryFact[];
  turnCounter: number;
  nudgeInterval: number;
}

export const memoryClient = {
  async getSnapshot(includeInactive = false, signal?: AbortSignal): Promise<HermesMemorySnapshotResponse> {
    return apiFetchRaw<HermesMemorySnapshotResponse>(
      `/api/memory${includeInactive ? '?includeInactive=true' : ''}`,
      { signal }
    );
  },

  async updateDoc(docType: HermesDocType, content: string): Promise<{ success: boolean; doc: HermesMemoryDoc; truncated: boolean }> {
    return apiFetchRaw(`/api/memory/docs/${docType}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  async addFact(payload: {
    factText: string;
    category: HermesFactCategory;
    entities?: string[];
  }): Promise<{ success: boolean; fact: HermesMemoryFact | null; deduplicated: boolean }> {
    return apiFetchRaw('/api/memory/facts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async searchFacts(
    query: string,
    signal?: AbortSignal
  ): Promise<{ success: boolean; enabled: boolean; facts: HermesMemoryFact[] }> {
    return apiFetchRaw(`/api/memory/facts/search?q=${encodeURIComponent(query)}`, { signal });
  },

  async feedbackFact(
    factId: string,
    action: HermesFactFeedbackAction,
    updatedText?: string
  ): Promise<{ success: boolean; fact: HermesMemoryFact }> {
    return apiFetchRaw(`/api/memory/facts/${encodeURIComponent(factId)}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ action, updatedText }),
    });
  },

  async clearAll(): Promise<{ success: boolean; cleared: boolean }> {
    return apiFetchRaw('/api/memory', { method: 'DELETE' });
  },
};
