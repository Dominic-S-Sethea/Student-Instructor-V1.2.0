import path from 'node:path';
import fs from 'node:fs';
import { TrackedDatabase, SQLiteMetrics, dbMetrics, closeExplainDb } from './metrics';

export interface DatabaseReadinessState {
  ready: boolean;
  schemaVersion: number;
  journalMode: string;
  foreignKeys: boolean;
  integrity: string;
  lastError: string | null;
  checkedAt: string | null;
}

export class DatabaseInitializationError extends Error {
  public readonly causeError: unknown;

  constructor(message: string, causeError?: unknown) {
    super(message);
    this.name = 'DatabaseInitializationError';
    this.causeError = causeError;
  }
}

let databaseInstance: TrackedDatabase | null = null;
let openedDbPath: string | null = null;

let readinessState: DatabaseReadinessState = {
  ready: false,
  schemaVersion: 0,
  journalMode: 'unknown',
  foreignKeys: false,
  integrity: 'unverified',
  lastError: 'Database migrations have not completed.',
  checkedAt: null,
};

/** Resolve database path lazily from process.env.DATABASE_PATH. */
export function getDbFilePath(): string {
  const envPath = process.env.DATABASE_PATH;
  if (envPath && envPath.trim() !== '') {
    return envPath.trim();
  }
  return path.join(process.cwd(), 'server', 'data', 'cdes_platform.db');
}

/** Return the current database readiness snapshot. */
export function getDatabaseReadiness(): DatabaseReadinessState {
  return { ...readinessState };
}

/** Update readiness state after schema verification or failure. */
export function setDatabaseReadiness(next: DatabaseReadinessState): void {
  readinessState = { ...next };
}

/** Reset readiness state (for tests / reconnect). */
export function resetDatabaseReadiness(): void {
  readinessState = {
    ready: false,
    schemaVersion: 0,
    journalMode: 'unknown',
    foreignKeys: false,
    integrity: 'unverified',
    lastError: 'Database migrations have not completed.',
    checkedAt: null,
  };
}

/**
 * Returns the singleton tracked DatabaseSync instance with WAL + foreign_keys=ON + busy_timeout.
 * Never deletes or overwrites corrupted database or WAL/SHM files.
 */
export function getDatabase(): TrackedDatabase {
  const dbPath = getDbFilePath();
  if (databaseInstance && openedDbPath !== dbPath) {
    closeDatabase();
  }

  if (!databaseInstance) {
    if (dbPath !== ':memory:') {
      const parentDir = path.dirname(dbPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
    }

    try {
      databaseInstance = new TrackedDatabase(dbPath);
      openedDbPath = dbPath;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new DatabaseInitializationError(
        `Failed to open SQLite database at "${dbPath}". Existing files were preserved intact; follow docs/DB-RESTORE-RUNBOOK.md for operator-controlled recovery. Cause: ${msg}`,
        err
      );
    }
  }

  return databaseInstance;
}

/** Verify live DB connectivity, integrity, FK enforcement, and schema version. */
export function verifyDatabaseHealth(): {
  ok: boolean;
  journalMode: string;
  foreignKeys: boolean;
  integrity: string;
  schemaVersion: number;
  error?: string;
} {
  try {
    const db = getDatabase();
    const probe = db.prepare('SELECT 1 AS ok').get() as { ok: number } | undefined;
    if (!probe || probe.ok !== 1) {
      return {
        ok: false,
        journalMode: 'unknown',
        foreignKeys: false,
        integrity: 'failed',
        schemaVersion: 0,
        error: 'Database probe failed.',
      };
    }

    const journalRow = db.prepare('PRAGMA journal_mode').get() as { journal_mode?: string } | undefined;
    const fkRow = db.prepare('PRAGMA foreign_keys').get() as { foreign_keys?: number } | undefined;
    const intRow = db.prepare('PRAGMA quick_check').get() as { quick_check?: string } | undefined;
    let schemaVersion = readinessState.schemaVersion;
    try {
      const verRow = db
        .prepare('SELECT schema_version AS v FROM schema_version ORDER BY v DESC LIMIT 1')
        .get() as { v?: number } | undefined;
      if (verRow && typeof verRow.v === 'number') {
        schemaVersion = verRow.v;
      }
    } catch {
      schemaVersion = 0;
    }

    const journalMode = journalRow?.journal_mode || 'unknown';
    const foreignKeys = Number(fkRow?.foreign_keys || 0) === 1;
    const integrity = intRow?.quick_check || 'unknown';

    return {
      ok: readinessState.ready && integrity === 'ok' && foreignKeys,
      journalMode,
      foreignKeys,
      integrity,
      schemaVersion,
      error: readinessState.ready ? undefined : readinessState.lastError || 'Database not ready',
    };
  } catch (err: unknown) {
    return {
      ok: false,
      journalMode: 'unknown',
      foreignKeys: false,
      integrity: 'error',
      schemaVersion: 0,
      error: err instanceof Error ? err.message : 'Database health check failed',
    };
  }
}

/** Resets the connection, readiness, and metrics snapshot (for testing / restart). */
export function closeDatabase(): void {
  if (databaseInstance) {
    try {
      databaseInstance.close();
    } catch {
      // ignore close errors during teardown
    }
    databaseInstance = null;
    openedDbPath = null;
  }
  closeExplainDb();
  dbMetrics.reset();
  resetDatabaseReadiness();
}

let savepointSeq = 0;

/**
 * Executes `fn` inside a SQLite SAVEPOINT transaction so both standalone and nested
 * repository writes commit or roll back atomically without nesting errors.
 */
export function withTransaction<T>(fn: () => T): T {
  const db = getDatabase();
  const sp = `cdes_sp_${++savepointSeq}`;
  db.exec(`SAVEPOINT ${sp};`);
  try {
    const result = fn();
    db.exec(`RELEASE SAVEPOINT ${sp};`);
    return result;
  } catch (err: unknown) {
    try {
      db.exec(`ROLLBACK TO SAVEPOINT ${sp};`);
      db.exec(`RELEASE SAVEPOINT ${sp};`);
    } catch {
      // ignore rollback error
    }
    throw err;
  }
}

/** Exported for the monitoring endpoint and internal observability gates. */
export function getDbMetrics(): SQLiteMetrics {
  return dbMetrics;
}
