#!/usr/bin/env node
/**
 * server/db/migrations/run_migrations.js
 *
 * Executes queued additive migrations for the CDES SQLite database.
 *
 * Conventions:
 *   - Each migration is ONE .sql file named NNN_<description>.sql inside
 *     this directory (e.g. 001_create_schema_version.sql).
 *   - The leading number is the migration version. Migrations are applied
 *     in ascending numeric order and are never rolled back.
 *   - The current schema version is stored in the schema_version table
 *     (single integer column, default 0) created by migration 001.
 *
 * Usage:
 *   node server/db/migrations/run_migrations.js [--db <path>] [--dry-run]
 *
 * Exit codes:
 *   0 - all selected migrations applied successfully
 *   1 - error (see stderr)
 */

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'server', 'db', 'migrations');
const DEFAULT_DB = path.resolve(process.cwd(), 'server', 'data', 'cdes_platform.db');

// ---- Minimal CLI parsing (no external dependencies) ----
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

const dbPath = args.get('db') || process.env.DATABASE_PATH || DEFAULT_DB;
const dryRun = args.get('dry-run') === true;

// ---- Helpers ----
function listMigrations() {
  let files = [];
  try {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
      return files;
    }
    files = fs.readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql') && /^\d+/.test(f))
      .sort((a, b) => {
        const na = parseInt(a.match(/^\d+/)[0], 10);
        const nb = parseInt(b.match(/^\d+/)[0], 10);
        return na - nb;
      });
  } catch (err) {
    console.error(`FATAL: cannot read migrations directory ${MIGRATIONS_DIR}: ${err.message}`);
    process.exit(1);
  }
  return files;
}

function getDb() {
  return new DatabaseSync(dbPath);
}

function ensureSchemaVersionTable(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_version (
    schema_version INTEGER DEFAULT 0
  );`);
}

function currentVersion(db) {
  const row = db.prepare('SELECT schema_version AS v FROM schema_version ORDER BY v DESC LIMIT 1').get();
  return row ? Number(row.v) : -1;
}

function applyMigration(db, file) {
  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
  const version = parseInt(file.match(/^\d+/)[0], 10);
  db.exec('BEGIN;');
  try {
    db.exec(sql);
    // Record the applied version. The schema_version table stores the
    // highest applied version as a single row.
    db.exec('DELETE FROM schema_version;');
    db.prepare('INSERT INTO schema_version (schema_version) VALUES (?)').run(version);
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

// ---- Main ----
function main() {
  let db;
  try {
    db = getDb();
  } catch (err) {
    console.error(`FATAL: cannot open database ${dbPath}: ${err.message}`);
    return 1;
  }

  let applied = 0;
  let skipped = 0;
  let failed = 0;
  let current = -1;

  try {
    ensureSchemaVersionTable(db);
    current = currentVersion(db);
    const migrations = listMigrations();

    for (const file of migrations) {
      const version = parseInt(file.match(/^\d+/)[0], 10);
      if (version <= current) {
        skipped++;
        continue;
      }
      try {
        if (dryRun) {
          console.log(`[DRY-RUN] would apply ${file} (version ${version})`);
        } else {
          applyMigration(db, file);
          console.log(`[OK] applied ${file} (version ${version})`);
          applied++;
        }
      } catch (err) {
        failed++;
        console.error(`[ERROR] failed ${file} (version ${version}): ${err.message}`);
      }
    }
  } finally {
    db.close();
  }

  console.log(`\nMigration summary: ${applied} applied, ${skipped} already applied (at version ${current}), ${failed} failed.`);
  return failed > 0 ? 1 : 0;
}

process.exit(main());
