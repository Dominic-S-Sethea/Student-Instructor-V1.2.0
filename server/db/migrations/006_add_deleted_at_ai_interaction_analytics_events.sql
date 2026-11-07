-- ============================================================
-- CDES PLATFORM MIGRATION 006
--
-- Retention soft-delete column for ai_interaction_analytics_events
-- (high-volume AI interaction analytics events).
--
-- SQLite supports ADD COLUMN only in this form. Future upgrades follow
-- the NNN_<description>.sql pattern in this directory.
-- ============================================================

ALTER TABLE ai_interaction_analytics_events ADD COLUMN deleted_at TEXT;
