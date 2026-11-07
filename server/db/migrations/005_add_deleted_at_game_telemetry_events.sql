-- ============================================================
-- CDES PLATFORM MIGRATION 005
--
-- Retention soft-delete column for game_telemetry_events (high-volume
-- game telemetry events).
--
-- SQLite supports ADD COLUMN only in this form. Future upgrades follow
-- the NNN_<description>.sql pattern in this directory.
-- ============================================================

ALTER TABLE game_telemetry_events ADD COLUMN deleted_at TEXT;
