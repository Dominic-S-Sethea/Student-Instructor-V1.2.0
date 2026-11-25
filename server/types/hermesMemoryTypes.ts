export type HermesDocType = 'USER' | 'MEMORY';

export type HermesFactCategory =
  | 'preference'
  | 'goal'
  | 'strength'
  | 'growth_area'
  | 'milestone'
  | 'target_school'
  | 'study_habit';

export type HermesFactStatus = 'active' | 'superseded' | 'ended' | 'reverted';
export type HermesFactSource = 'explicit_user' | 'observed_pattern' | 'app_milestone';
export type HermesFactFeedbackAction = 'confirm' | 'correct' | 'end' | 'revert';
export type HermesHistoryAction = 'add' | 'confirm' | 'change' | 'correct' | 'end' | 'revert';

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
  status: HermesFactStatus;
  source: HermesFactSource;
  previousFactText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HermesFactHistoryEntry {
  id: string;
  factId: string;
  userId: string;
  action: HermesHistoryAction;
  beforeText: string | null;
  afterText: string | null;
  beforeTrust: number | null;
  afterTrust: number | null;
  note: string | null;
  createdAt: string;
}

export interface HermesPromptInjectionBundle {
  enabled: boolean;
  reason?: string;
  userDoc: HermesMemoryDoc | null;
  memoryDoc: HermesMemoryDoc | null;
  topFacts: HermesMemoryFact[];
  turnCounter: number;
  nudgeInterval: number;
  shouldNudge: boolean;
}

export interface HermesMemorySnapshot {
  enabled: boolean;
  reason?: string;
  userDoc: HermesMemoryDoc | null;
  memoryDoc: HermesMemoryDoc | null;
  facts: HermesMemoryFact[];
  turnCounter: number;
  nudgeInterval: number;
}
