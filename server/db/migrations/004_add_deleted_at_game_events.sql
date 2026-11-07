-- ============================================================
-- CDES PLATFORM MIGRATION 004
--
-- Retention soft-delete column for game_events (high-volume game
-- events).
--
-- SQLite supports ADD COLUMN only in this form. Future upgrades follow
-- the NNN_<description>.sql pattern in this directory.
-- ============================================================

ALTER TABLE game_events ADD COLUMN deleted_at TEXT;
