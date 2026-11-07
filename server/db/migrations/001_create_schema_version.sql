-- ============================================================
-- CDES PLATFORM MIGRATION 001
-- Creates the schema_version tracking table.
--
-- This is the FIRST migration. It establishes the versioning
-- infrastructure that every future upgrade depends on.
--
-- Pattern for future upgrades (apply in ascending numeric order):
--   NNN_<description>.sql  (e.g. 002_add_deleted_at_activity_events.sql)
--
-- The schema_version table records the current schema version as a
-- single integer column. It starts at 0 (schema_version INTEGER DEFAULT 0)
-- and is incremented by each applied migration.
-- ============================================================

CREATE TABLE IF NOT EXISTS schema_version (
  schema_version INTEGER DEFAULT 0
);
