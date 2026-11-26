#!/usr/bin/env node
import fs from 'node:fs';
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
const exportJsonlDir = typeof args.get('export-jsonl') === 'string' ? args.get('export-jsonl') : null;

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

const requestedTables = tablesArg
  ? tablesArg.split(',').map((t) => t.trim()).filter(Boolean)
  : Array.from(RETENTION_TABLES);

for (const tbl of requestedTables) {
  if (!RETENTION_TABLES.has(tbl)) {
    console.error(`ERROR: unsupported table "${tbl}".`);
    process.exit(1);
  }
}

function tableExists(db, table) {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
    .get(table);
  return Boolean(row?.name);
}

function columnExists(db, table, col) {
  if (!tableExists(db, table)) return false;
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return rows.some((c) => c.name === col);
}

function runRetention(db, table) {
  if (!columnExists(db, table, 'deleted_at')) {
    console.log(`[WARN] ${table}: no deleted_at column — skipping.`);
    return null;
  }

  const hasIsDeleted = columnExists(db, table, 'is_deleted');
  const deleteCondition = hasIsDeleted
    ? 'is_deleted = 1 AND deleted_at IS NOT NULL AND date(deleted_at) <= ?'
    : 'deleted_at IS NOT NULL AND date(deleted_at) <= ?';

  if (dryRun) {
    const countRow = db
      .prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE ${deleteCondition}`)
      .get(cutoffDateStr);
    const matchingRows = Number(countRow?.count ?? 0);
    console.log(
      `[DRY-RUN] ${table}: matching_rows=${matchingRows} (deleted_at date <= ${cutoffDateStr})`
    );
    return { dryRun: true, table, matchingRows };
  }

  let exported = 0;
  let removed = 0;
  let exportFile = null;

  db.exec('BEGIN IMMEDIATE;');
  try {
    if (exportJsonlDir) {
      fs.mkdirSync(exportJsonlDir, { recursive: true });
      const rows = db.prepare(`SELECT * FROM ${table} WHERE ${deleteCondition}`).all(cutoffDateStr);
      if (rows.length > 0) {
        exportFile = path.join(exportJsonlDir, `${table}_${cutoffDateStr}.jsonl`);
        const payload = rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
        fs.appendFileSync(exportFile, payload, 'utf8');
        exported = rows.length;
      }
    }

    const infoD = db
      .prepare(`DELETE FROM ${table} WHERE ${deleteCondition}`)
      .run(cutoffDateStr);
    removed = Number(infoD.changes);
    db.exec('COMMIT;');
  } catch (err) {
    try { db.exec('ROLLBACK;'); } catch {}
    throw err;
  }

  const archiveInfo = exportFile ? ` exported=${exported} file=${exportFile}` : '';
  console.log(`[OK] ${table}: deleted=${removed}${archiveInfo}`);
  return { table, exported, removed, exportFile };
}

function pruneRevokedTokens(db) {
  if (!tableExists(db, 'revoked_jwt_tokens')) return 0;
  if (dryRun) {
    const row = db
      .prepare("SELECT COUNT(*) AS count FROM revoked_jwt_tokens WHERE expires_at <= datetime('now')")
      .get();
    console.log(`[DRY-RUN] revoked_jwt_tokens: expired_rows=${Number(row?.count ?? 0)}`);
    return Number(row?.count ?? 0);
  }
  const info = db
    .prepare("DELETE FROM revoked_jwt_tokens WHERE expires_at <= datetime('now')")
    .run();
  const purged = Number(info.changes);
  if (purged > 0) {
    console.log(`[OK] revoked_jwt_tokens: purged=${purged}`);
  }
  return purged;
}

function main() {
  let db;
  try {
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA busy_timeout = 5000;');
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
    pruneRevokedTokens(db);
  } finally {
    db.close();
  }

  console.log(`\nRetention summary: ${processed} processed, ${skipped} skipped, ${failed} failed.`);
  return failed > 0 ? 1 : 0;
}

process.exit(main());
