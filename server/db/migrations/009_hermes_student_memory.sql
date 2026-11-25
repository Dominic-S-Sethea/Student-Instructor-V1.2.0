-- Migration 009: Hermes-Inspired Student Growth Memory System (USER/MEMORY docs, fact_store, audit history)

CREATE TABLE IF NOT EXISTS hermes_student_memory_docs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('USER', 'MEMORY')),
  content TEXT NOT NULL DEFAULT '',
  char_limit INTEGER NOT NULL DEFAULT 3000,
  turn_counter INTEGER NOT NULL DEFAULT 0,
  nudge_interval INTEGER NOT NULL DEFAULT 10,
  last_consolidated_at TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, doc_type)
);

CREATE INDEX IF NOT EXISTS idx_hermes_docs_user ON hermes_student_memory_docs(user_id);

CREATE TABLE IF NOT EXISTS hermes_memory_facts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('preference', 'goal', 'strength', 'growth_area', 'milestone', 'target_school', 'study_habit')
  ),
  fact_text TEXT NOT NULL,
  entities_json TEXT NOT NULL DEFAULT '[]',
  keywords_json TEXT NOT NULL DEFAULT '[]',
  trust_score REAL NOT NULL DEFAULT 0.75,
  confirmations INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'superseded', 'ended', 'reverted')),
  source TEXT NOT NULL DEFAULT 'explicit_user' CHECK (source IN ('explicit_user', 'observed_pattern', 'app_milestone')),
  previous_fact_text TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hermes_facts_user_status ON hermes_memory_facts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_hermes_facts_category ON hermes_memory_facts(user_id, category);

CREATE TABLE IF NOT EXISTS hermes_fact_history (
  id TEXT PRIMARY KEY,
  fact_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('add', 'confirm', 'change', 'correct', 'end', 'revert')),
  before_text TEXT,
  after_text TEXT,
  before_trust REAL,
  after_trust REAL,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hermes_history_fact ON hermes_fact_history(fact_id, user_id);
