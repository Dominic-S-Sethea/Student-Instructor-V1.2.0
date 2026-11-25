-- Migration 010: Missing Secondary/Retention Indexes & Hermes Foreign Key Enforcement

CREATE INDEX IF NOT EXISTS idx_education_history_student ON education_history(student_id);
CREATE INDEX IF NOT EXISTS idx_change_history_entity_time ON change_history(entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_records_scholarship ON verification_records(scholarship_id);
CREATE INDEX IF NOT EXISTS idx_org_submissions_status_time ON organization_submissions(status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_submissions_user ON organization_submissions(submitted_by_user_id);
CREATE INDEX IF NOT EXISTS idx_error_reports_scholarship ON user_error_reports(scholarship_id);
CREATE INDEX IF NOT EXISTS idx_error_reports_status_time ON user_error_reports(status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_time ON ai_conversations(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_scholarships_active_verified_deadline ON scholarships(is_deleted, is_verified, deadline);
CREATE INDEX IF NOT EXISTS idx_users_active_status_login ON users(is_deleted, status, last_login_at);
CREATE INDEX IF NOT EXISTS idx_research_results_v2_experiment ON research_results_v2(experiment_id);

CREATE INDEX IF NOT EXISTS idx_activity_events_deleted ON activity_events(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_learning_events_deleted ON learning_events(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_game_events_deleted ON game_events(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_game_telemetry_deleted ON game_telemetry_events(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_interaction_deleted ON ai_interaction_analytics_events(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_stream_deleted ON cdes_analytics_events_stream(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS hermes_student_memory_docs_v2 (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('USER', 'MEMORY')),
  content TEXT NOT NULL DEFAULT '',
  char_limit INTEGER NOT NULL DEFAULT 3000,
  turn_counter INTEGER NOT NULL DEFAULT 0,
  nudge_interval INTEGER NOT NULL DEFAULT 10,
  last_consolidated_at TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, doc_type)
);

INSERT INTO hermes_student_memory_docs_v2 (id, user_id, doc_type, content, char_limit, turn_counter, nudge_interval, last_consolidated_at, updated_at)
SELECT id, user_id, doc_type, content, char_limit, turn_counter, nudge_interval, last_consolidated_at, updated_at
FROM hermes_student_memory_docs
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = hermes_student_memory_docs.user_id);

DROP TABLE hermes_student_memory_docs;
ALTER TABLE hermes_student_memory_docs_v2 RENAME TO hermes_student_memory_docs;
CREATE INDEX IF NOT EXISTS idx_hermes_docs_user ON hermes_student_memory_docs(user_id);

CREATE TABLE IF NOT EXISTS hermes_memory_facts_v2 (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

INSERT INTO hermes_memory_facts_v2 (id, user_id, category, fact_text, entities_json, keywords_json, trust_score, confirmations, status, source, previous_fact_text, created_at, updated_at)
SELECT id, user_id, category, fact_text, entities_json, keywords_json, trust_score, confirmations, status, source, previous_fact_text, created_at, updated_at
FROM hermes_memory_facts
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = hermes_memory_facts.user_id);

DROP TABLE hermes_memory_facts;
ALTER TABLE hermes_memory_facts_v2 RENAME TO hermes_memory_facts;
CREATE INDEX IF NOT EXISTS idx_hermes_facts_user_status ON hermes_memory_facts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_hermes_facts_category ON hermes_memory_facts(user_id, category);

CREATE TABLE IF NOT EXISTS hermes_fact_history_v2 (
  id TEXT PRIMARY KEY,
  fact_id TEXT NOT NULL REFERENCES hermes_memory_facts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('add', 'confirm', 'change', 'correct', 'end', 'revert')),
  before_text TEXT,
  after_text TEXT,
  before_trust REAL,
  after_trust REAL,
  note TEXT,
  created_at TEXT NOT NULL
);

INSERT INTO hermes_fact_history_v2 (id, fact_id, user_id, action, before_text, after_text, before_trust, after_trust, note, created_at)
SELECT id, fact_id, user_id, action, before_text, after_text, before_trust, after_trust, note, created_at
FROM hermes_fact_history
WHERE EXISTS (SELECT 1 FROM hermes_memory_facts f WHERE f.id = hermes_fact_history.fact_id)
  AND EXISTS (SELECT 1 FROM users u WHERE u.id = hermes_fact_history.user_id);

DROP TABLE hermes_fact_history;
ALTER TABLE hermes_fact_history_v2 RENAME TO hermes_fact_history;
CREATE INDEX IF NOT EXISTS idx_hermes_history_fact ON hermes_fact_history(fact_id, user_id);
