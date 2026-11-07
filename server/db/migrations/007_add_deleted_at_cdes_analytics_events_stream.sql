-- ============================================================
-- CDES PLATFORM MIGRATION 007
--
-- Retention soft-delete column for cdes_analytics_events_stream
-- (high-volume analytics event stream).
--
-- SQLite supports ADD COLUMN only in this form. Future upgrades follow
-- the NNN_<description>.sql pattern in this directory.
-- ============================================================

ALTER TABLE cdes_analytics_events_stream ADD COLUMN deleted_at TEXT;
