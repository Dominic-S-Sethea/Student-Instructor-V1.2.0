-- ============================================================
-- CDES PLATFORM MIGRATION 002
--
-- Retention soft-delete column for activity_events (high-volume
-- activity/telemetry events).
--
-- SQLite supports ADD COLUMN only in this form. Future upgrades follow
-- the NNN_<description>.sql pattern in this directory.
-- ============================================================

ALTER TABLE activity_events ADD COLUMN deleted_at TEXT;
