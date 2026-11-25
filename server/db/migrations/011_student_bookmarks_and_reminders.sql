-- Migration 011: Account-Synced Saved Scholarships, Application Checklists & Persisted Notifications

CREATE TABLE IF NOT EXISTS user_saved_scholarships (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scholarship_id TEXT NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'saved' CHECK (
    status IN ('saved', 'preparing', 'submitted', 'awarded', 'archived')
  ),
  target_note TEXT NOT NULL DEFAULT '',
  checklist_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, scholarship_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_scholarships_user_time
  ON user_saved_scholarships(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS user_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (
    category IN ('deadline', 'scholarship', 'privacy', 'study', 'system')
  ),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_tab TEXT,
  dedupe_key TEXT,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_read_time
  ON user_notifications(user_id, is_read, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_notifications_user_dedupe
  ON user_notifications(user_id, dedupe_key)
  WHERE dedupe_key IS NOT NULL;
