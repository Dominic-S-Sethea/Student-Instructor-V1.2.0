#!/usr/bin/env node
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DEFAULT_DB = path.resolve(process.cwd(), 'server', 'data', 'cdes_platform.db');

const RETENTION_TABLES = new Set([
  'activity_events',
  'learning_events',
  'game_events',
  'game_telemetry_events',
  'ai_interaction_analytics_events',
  'cdes_analytics_events_stream',
]);

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

if (!cutoff) {
  console.error('ERROR: --cutoff is required (ISO date, e.g. --cutoff 2026-10-30).');
  process.exit(1);
}
const cutoffDate = new Date(cutoff);
if (isNaN(cutoffDate.getTime())) {
  console.error(`ERROR: --cutoff "${cutoff}" is not a valid date.`);
  process.exit(1);
}
const cutoffDateStr = cutoffDate.toISOString().slice(0, 10);
const dateStr = cutoffDateStr.replace(/-/g, '_');

const requestedTables = tablesArg
  ? tablesArg.split(',').map((t) => t.trim()).filter(Boolean)
  : Array.from(RETENTION_TABLES);

for (const tbl of requestedTables) {
  if (!RETENTION_TABLES.has(tbl)) {
    console.error(`ERROR: unsupported table "${tbl}".`);
    process.exit(1);
  }
}

function columnExists(db, table, col) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return rows.some((c) => c.name === col);
}

function runRetention(db, table) {
  if (dryRun) {
    console.log(`[DRY-RUN] would archive+delete rows (deleted_at date <= ${cutoffDateStr}) from ${table}`);
    return { dryRun: true };
  }
  if (!columnExists(db, table, 'deleted_at')) {
    console.log(`[WARN] ${table}: no deleted_at column — skipping.`);
    return null;
  }

  const archiveTable = `${table}_archive_${dateStr}`;
  const hasIsDeleted = columnExists(db, table, 'is_deleted');
  const deleteCondition = hasIsDeleted
    ? 'is_deleted = 1 AND deleted_at IS NOT NULL AND date(deleted_at) <= ?'
    : 'deleted_at IS NOT NULL AND date(deleted_at) <= ?';
  let archived = 0;
  let removed = 0;

  db.exec('BEGIN IMMEDIATE;');
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS ${archiveTable} AS SELECT * FROM ${table} WHERE 1=0;`);
    const infoA = db
      .prepare(`INSERT INTO ${archiveTable} SELECT * FROM ${table} WHERE ${deleteCondition}`)
      .run(cutoffDateStr);
    archived = Number(infoA.changes);

    const infoD = db
      .prepare(`DELETE FROM ${table} WHERE ${deleteCondition}`)
      .run(cutoffDateStr);
    removed = Number(infoD.changes);
    db.exec('COMMIT;');
  } catch (err) {
    try { db.exec('ROLLBACK;'); } catch {}
    throw err;
  }

  console.log(`[OK] ${table}: archived=${archived} deleted=${removed} archive_table=${archiveTable}`);
  return { table, archived, removed, archiveTable };
}

function main() {
  let db;
  try {
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');
  } catch (err) {
    console.error(`FATAL: cannot open database ${dbPath}: ${err.message}`);
    return 1;
  }

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  try {
    for (const table of requestedTables) {
      try {
        const result = runRetention(db, table);
        if (result) processed++;
        else skipped++;
      } catch (err) {
        failed++;
        console.error(`[ERROR] ${table}: ${err.message}`);
      }
    }
  } finally {
    db.close();
  }

  console.log(`\nRetention summary: ${processed} processed, ${skipped} skipped, ${failed} failed.`);
  return failed > 0 ? 1 : 0;
}

process.exit(main());
