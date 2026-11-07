#!/usr/bin/env node
/**
 * server/db/retention_cron.js
 *
 * Retention policy helper for the high-volume telemetry tables.
 *
 * Policy:
 *   - Rows with deleted_at > cutoff  -> KEPT (stay in place in the live table).
 *   - Rows with deleted_at <= cutoff -> ARCHIVED to a dated archive table,
 *     then DELETED from the live table.
 *
 * Usage:
 *   node server/db/retention_cron.js --cutoff 2026-10-30 [--db <path>]
 *       [--tables activity_events,learning_events,...] [--dry-run]
 *
 * Exit codes:
 *   0 - completed
 *   1 - error
 *
 * Notes:
 *   - The archive table name is "<table_name>_archive_<YYYY_MM_DD>" and
 *     lives in the same database file.
 *   - The script is idempotent for a given day: an archive table that
 *     already exists for the run date is reused (IF NOT EXISTS) and rows
 *     are inserted/deleted again, which is idempotent for repeat runs.
 *   - The script requires the deleted_at column already to exist (from
 *     the additive ADD COLUMN migrations in server/db/migrations/).
 */

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DEFAULT_DB = path.resolve(process.cwd(), 'server', 'data', 'cdes_platform.db');

// The retention rows (high-volume telemetry tables).
const RETENTION_TABLES = [
  'activity_events',
  'learning_events',
  'game_events',
  'game_telemetry_events',
  'ai_interaction_analytics_events',
  'cdes_analytics_events_stream',
];

// ---- Minimal CLI parsing ----
const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) {
    const key = a.slice(2);
    const next = process.argv[i + 1];
    args.set(key, next && !next.startsWith('--') ? next : true);
    if (next && !next.startsWith('--')) i++;
  }
}

const cutoff = args.get('cutoff');
const dbPath = args.get('db') || process.env.DATABASE_PATH || DEFAULT_DB;
const tablesArg = args.get('tables');
const dryRun = args.get('dry-run') === true;

// Validate the cutoff up-front, before touching the database. It is normalized
// to a date-only string (YYYY-MM-DD). The deleted_at column holds full ISO
// timestamps, so we compare on the date part: rows whose deleted_at date is
// on or before the cutoff date are treated as "old" (archivable), rows after
// the cutoff are kept.
if (!cutoff) {
  console.error('ERROR: --cutoff is required (ISO date, e.g. --cutoff 2026-10-30).');
  console.error('Usage: node server/db/retention_cron.js --cutoff <date> [--db <path>] [--tables a,b,c] [--dry-run]');
  process.exit(1);
}
const cutoffDate = new Date(cutoff);
if (isNaN(cutoffDate.getTime())) {
  err(`ERROR: --cutoff "${cutoff}" is not a valid date.`);
  console.error('Usage: node server/db/retention_cron.js --cutoff <date> [--db <path>] [--tables a,b,c] [--dry-run]');
  process.exit(1);
}
const cutoffDateStr = cutoffDate.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)

const tables = tablesArg
  ? tablesArg.split(',').map((t) => t.trim()).filter(Boolean)
  : RETENTION_TABLES;

const dateStr = new Date(cutoff).toISOString().slice(0, 10).replace(/-/g, '_'); // YYYY_MM_DD

function log(msg) { console.log(msg); }
function err(msg) { console.error(msg); }

function columnExists(db, table, col) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() ;
  return rows.some((c) => c.name === col);
}

function runRetention(db, table) {
  if (dryRun) {
    log(`[DRY-RUN] would archive+delete rows (deleted_at date <= ${cutoffDateStr}) from ${table}`);
    return {};
  }
  if (!columnExists(db, table, 'deleted_at')) {
    log(`[WARN] ${table}: no deleted_at column — skipping.`);
    return null;
  }

  const archiveTable = `${table}_archive_${dateStr}`;
  let archived = 0;
  let removed = 0;

  db.exec('BEGIN;');
  try {
    // 1) Create the dated archive table (empty); column names/types mirror the live table.
    db.exec(`CREATE TABLE IF NOT EXISTS ${archiveTable} AS SELECT * FROM ${table} WHERE 1=0;`);

    // 2) Archive rows whose deleted_at date is on or before the cutoff date.
    //    date() is applied to the column so both date-only and full-timestamp
    //    values compare correctly; rows without a deleted_at are kept.
    const insertArchive = db.prepare(
      `INSERT INTO ${archiveTable} SELECT * FROM ${table} WHERE date(deleted_at) <= ?`
    );
    const infoA = insertArchive.run(cutoffDateStr);
    archived = infoA.changes;

    // 3) Delete archived rows from the live table (date-based comparison).
    const deleteRows = db.prepare(`DELETE FROM ${table} WHERE date(deleted_at) <= ?`);
    const infoD = deleteRows.run(cutoffDateStr);
    removed = infoD.changes;

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  log(`[OK] ${table}: archived=${archived} deleted=${removed} archive_table=${archiveTable}`);
  return { table, archived, removed, archiveTable };
}

// ---- Main ----
function main() {
  let db;
  try {
    db = new DatabaseSync(dbPath);
  } catch (err) {
    err(`FATAL: cannot open database ${dbPath}: ${err.message}`);
    return 1;
  }

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  try {
    for (const table of tables) {
      try {
        const result = runRetention(db, table);
        if (result) {
          processed++;
        } else {
          skipped++;
        }
      } catch (err) {
        failed++;
        log(`[ERROR] ${table}: ${err.message}`);
      }
    }
  } finally {
    db.close();
  }

  log(`\nRetention summary: ${processed} processed, ${skipped} skipped, ${failed} failed.`);
  return 0;
}

process.exit(main());
