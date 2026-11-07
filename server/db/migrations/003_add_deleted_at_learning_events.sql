-- ============================================================
-- CDES PLATFORM MIGRATION 003
--
-- Retention soft-delete column for learning_events (high-volume
-- learning events).
--
-- SQLite supports ADD COLUMN only in this form. Future upgrades follow
-- the NNN_<description>.sql pattern in this directory.
-- ============================================================

ALTER TABLE learning_events ADD COLUMN deleted_at TEXT;
