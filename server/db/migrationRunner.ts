import fs from 'node:fs';
import path from 'node:path';
import { TrackedDatabase } from './metrics';
import { getDatabase, setDatabaseReadiness } from './connection';
import { resolveMigrationsDir, resolveSchemaPath } from './schemaAssets';
import { seedCatalogData } from './seedCatalog';
import { seedDemoData } from './seedDemo';

export interface MigrationRunOptions {
  seedCatalog?: boolean;
  seedDemo?: boolean;
  strictDemoPasswords?: boolean;
  migrationsDir?: string;
  schemaPath?: string;
}

export interface MigrationRunResult {
  success: boolean;
  message: string;
  schemaVersion: number;
  appliedMigrations: string[];
}

function tableExists(db: TrackedDatabase, table: string): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
    .get(table) as { name?: string } | undefined;
  return Boolean(row?.name);
}

function columnExists(db: TrackedDatabase, table: string, col: string): boolean {
  if (!tableExists(db, table)) return false;
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return cols.some((c) => c.name === col);
}

function ensureColumnOnExistingTable(db: TrackedDatabase, table: string, col: string, colDef: string): void {
  if (tableExists(db, table) && !columnExists(db, table, col)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${colDef}`);
  }
}

/** Patch legacy schemas only on pre-existing tables before executing CREATE TABLE IF NOT EXISTS DDL. */
function patchLegacyTables(db: TrackedDatabase): void {
  ensureColumnOnExistingTable(db, 'activity_events', 'student_id', 'TEXT');
  ensureColumnOnExistingTable(db, 'activity_events', 'duration', 'INTEGER DEFAULT 0');
  ensureColumnOnExistingTable(db, 'learning_events', 'student_id', 'TEXT');
  ensureColumnOnExistingTable(db, 'learning_events', 'score', 'REAL');
  ensureColumnOnExistingTable(db, 'learning_events', 'time_spent', 'INTEGER DEFAULT 0');
  ensureColumnOnExistingTable(db, 'learning_events', 'difficulty', "TEXT DEFAULT 'intermediate'");
  ensureColumnOnExistingTable(db, 'game_events', 'student_id', 'TEXT');
  ensureColumnOnExistingTable(db, 'game_events', 'level', 'INTEGER DEFAULT 1');
  ensureColumnOnExistingTable(db, 'game_events', 'attempt', 'INTEGER DEFAULT 1');
  ensureColumnOnExistingTable(db, 'game_events', 'success', 'INTEGER DEFAULT 0');
  ensureColumnOnExistingTable(db, 'game_events', 'failure_reason', 'TEXT');
  ensureColumnOnExistingTable(db, 'game_events', 'time_taken', 'INTEGER DEFAULT 0');
  ensureColumnOnExistingTable(db, 'subjects', 'name', "TEXT DEFAULT ''");
  ensureColumnOnExistingTable(db, 'subjects', 'description', 'TEXT');
  ensureColumnOnExistingTable(db, 'subjects', 'icon_key', "TEXT DEFAULT 'book-open'");
  ensureColumnOnExistingTable(db, 'subjects', 'color', "TEXT DEFAULT '#2563EB'");
  ensureColumnOnExistingTable(db, 'subjects', 'order_index', 'INTEGER DEFAULT 1');
  ensureColumnOnExistingTable(db, 'subjects', 'name_en', 'TEXT');
  ensureColumnOnExistingTable(db, 'subjects', 'domain', 'TEXT');
  ensureColumnOnExistingTable(db, 'subjects', 'color_hex', "TEXT DEFAULT '#2563EB'");
  ensureColumnOnExistingTable(db, 'subjects', 'created_at', 'TEXT');

  for (const tbl of ['users', 'student_profiles', 'scholarships', 'scholarship_requirements', 'scholarship_funding']) {
    ensureColumnOnExistingTable(db, tbl, 'is_deleted', 'INTEGER NOT NULL DEFAULT 0');
    ensureColumnOnExistingTable(db, tbl, 'deleted_at', 'TEXT');
    ensureColumnOnExistingTable(db, tbl, 'deleted_by', 'TEXT');
  }

  for (const tbl of [
    'activity_events',
    'learning_events',
    'game_events',
    'game_telemetry_events',
    'ai_interaction_analytics_events',
    'cdes_analytics_events_stream',
  ]) {
    ensureColumnOnExistingTable(db, tbl, 'deleted_at', 'TEXT');
  }
}

function listNumberedMigrations(migrationsDir: string): Array<{ version: number; file: string; fullPath: string }> {
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }
  return fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql') && /^\d+/.test(f))
    .map((file) => {
      const match = file.match(/^(\d+)/);
      return {
        version: match ? parseInt(match[1], 10) : 0,
        file,
        fullPath: path.join(migrationsDir, file),
      };
    })
    .sort((a, b) => a.version - b.version);
}

function getCurrentVersion(db: TrackedDatabase): number {
  if (!tableExists(db, 'schema_version')) {
    return -1;
  }
  const row = db
    .prepare('SELECT schema_version AS v FROM schema_version ORDER BY v DESC LIMIT 1')
    .get() as { v?: number } | undefined;
  return row && typeof row.v === 'number' ? row.v : 0;
}

function applySqlStatements(db: TrackedDatabase, sql: string): void {
  const statements = sql
    .split(';')
    .map((s) =>
      s
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim()
    )
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    const addColMatch = stmt.match(
      /^ALTER\s+TABLE\s+["'`]?([a-zA-Z0-9_]+)["'`]?\s+ADD\s+COLUMN\s+["'`]?([a-zA-Z0-9_]+)["'`]?\s+/i
    );
    if (addColMatch) {
      const [, table, column] = addColMatch;
      if (columnExists(db, table, column)) {
        continue;
      }
    }
    db.exec(`${stmt};`);
  }
}

function shouldSeedDemoByDefault(): boolean {
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv === 'production' || nodeEnv === 'staging') {
    return false;
  }
  if (process.env.SEED_DEMO_DATA === 'true') {
    return true;
  }
  return Boolean(
    process.env.ADMIN_SEED_PASSWORD &&
      process.env.STUDENT_SEED_PASSWORD &&
      process.env.ORG_SEED_PASSWORD
  );
}

/** Execute base schema, ordered transactional SQL migrations, integrity/FK checks, and explicit seeding. */
export function runOrderedMigrations(options: MigrationRunOptions = {}): MigrationRunResult {
  const db = getDatabase();
  const schemaPath = options.schemaPath ? path.resolve(options.schemaPath) : resolveSchemaPath();
  const migrationsDir = options.migrationsDir ? path.resolve(options.migrationsDir) : resolveMigrationsDir();
  const appliedMigrations: string[] = [];

  try {
    const preCheck = db.prepare('PRAGMA integrity_check').get() as { integrity_check?: string } | undefined;
    if (preCheck?.integrity_check !== 'ok') {
      throw new Error(`Pre-migration integrity_check failed: ${preCheck?.integrity_check || 'unknown'}`);
    }

    db.exec('BEGIN IMMEDIATE;');
    try {
      patchLegacyTables(db);
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      db.exec(schemaSql);
      db.exec(`
        CREATE TABLE IF NOT EXISTS schema_version (schema_version INTEGER DEFAULT 0);
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY,
          filename TEXT NOT NULL,
          applied_at TEXT NOT NULL
        );
      `);
      db.exec('COMMIT;');
    } catch (err) {
      try { db.exec('ROLLBACK;'); } catch { /* ignore */ }
      throw err;
    }

    let currentVersion = getCurrentVersion(db);
    const migrations = listNumberedMigrations(migrationsDir);
    for (const mig of migrations) {
      if (mig.version <= currentVersion) {
        continue;
      }
      const sql = fs.readFileSync(mig.fullPath, 'utf8');
      db.exec('BEGIN IMMEDIATE;');
      try {
        applySqlStatements(db, sql);
        db.exec('DELETE FROM schema_version;');
        db.prepare('INSERT INTO schema_version (schema_version) VALUES (?)').run(mig.version);
        db.prepare('INSERT OR REPLACE INTO schema_migrations (version, filename, applied_at) VALUES (?, ?, ?)').run(
          mig.version,
          mig.file,
          new Date().toISOString()
        );
        db.exec('COMMIT;');
        currentVersion = mig.version;
        appliedMigrations.push(mig.file);
      } catch (err) {
        try { db.exec('ROLLBACK;'); } catch { /* ignore */ }
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`Migration ${mig.file} (v${mig.version}) failed and rolled back: ${msg}`);
      }
    }

    const doCatalog = options.seedCatalog !== undefined ? options.seedCatalog : true;
    const doDemo = options.seedDemo !== undefined ? options.seedDemo : shouldSeedDemoByDefault();
    if (doCatalog || doDemo) {
      db.exec('BEGIN IMMEDIATE;');
      try {
        if (doCatalog) seedCatalogData(db);
        if (doDemo) seedDemoData(db, { strictPasswords: options.strictDemoPasswords });
        db.exec('COMMIT;');
      } catch (err) {
        try { db.exec('ROLLBACK;'); } catch { /* ignore */ }
        throw err;
      }
    }

    const postIntegrity = db.prepare('PRAGMA integrity_check').get() as { integrity_check?: string } | undefined;
    if (postIntegrity?.integrity_check !== 'ok') {
      throw new Error(`Post-migration integrity_check failed: ${postIntegrity?.integrity_check || 'unknown'}`);
    }
    const fkViolations = db.prepare('PRAGMA foreign_key_check').all();
    if (fkViolations.length > 0) {
      throw new Error(`Foreign key check failed with ${fkViolations.length} violation(s).`);
    }

    const journalRow = db.prepare('PRAGMA journal_mode').get() as { journal_mode?: string } | undefined;
    const fkRow = db.prepare('PRAGMA foreign_keys').get() as { foreign_keys?: number } | undefined;
    const finalVersion = Math.max(0, getCurrentVersion(db));

    setDatabaseReadiness({
      ready: true,
      schemaVersion: finalVersion,
      journalMode: journalRow?.journal_mode || 'wal',
      foreignKeys: Number(fkRow?.foreign_keys || 0) === 1,
      integrity: 'ok',
      lastError: null,
      checkedAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Database schema and seed migration completed successfully.',
      schemaVersion: finalVersion,
      appliedMigrations,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    setDatabaseReadiness({
      ready: false,
      schemaVersion: Math.max(0, getCurrentVersion(db)),
      journalMode: 'unknown',
      foreignKeys: false,
      integrity: 'failed',
      lastError: message,
      checkedAt: new Date().toISOString(),
    });
    throw err;
  }
}
