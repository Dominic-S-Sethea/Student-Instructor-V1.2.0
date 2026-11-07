import path from 'path';
import fs from 'fs';
import { TrackedDatabase, SQLiteMetrics, dbMetrics } from './metrics';

// Database path resolution (lazy evaluation to allow test env overrides)
const DB_DIR = path.join(process.cwd(), 'server', 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export function getDbFilePath(): string {
  return process.env.DATABASE_PATH || path.join(DB_DIR, 'cdes_platform.db');
}

// Re-export for backward compatibility
export const DB_FILE_PATH = getDbFilePath();

let databaseInstance: TrackedDatabase | null = null;

/** Returns the singleton tracked DatabaseSync instance with WAL + busy_timeout. */
export function getDatabase(): TrackedDatabase {
  if (!databaseInstance) {
    try {
      const dbPath = getDbFilePath();
      databaseInstance = new TrackedDatabase(dbPath);
    } catch (err: any) {
      if (
        err?.code === 'ERR_SQLITE_ERROR' ||
        err?.message?.includes('malformed') ||
        err?.message?.includes('corrupt')
      ) {
        console.warn('SQLite database file appears malformed or corrupted. Auto-recovering fresh database...', err?.message);
        try {
          if (databaseInstance) databaseInstance.close();
        } catch {
          // ignore
        }
        databaseInstance = null;
        try { if (fs.existsSync(DB_FILE_PATH)) fs.unlinkSync(DB_FILE_PATH); } catch {}
        try { if (fs.existsSync(`${DB_FILE_PATH}-wal`)) fs.unlinkSync(`${DB_FILE_PATH}-wal`); } catch {}
        try { if (fs.existsSync(`${DB_FILE_PATH}-shm`)) fs.unlinkSync(`${DB_FILE_PATH}-shm`); } catch {}
        databaseInstance = new TrackedDatabase(DB_FILE_PATH);
      } else {
        throw err;
      }
    }
  }
  return databaseInstance;
}

/** Resets the connection and clears the metrics snapshot (for testing / restart). */
export function closeDatabase(): void {
  if (databaseInstance) {
    try {
      databaseInstance.close();
    } catch {
      // ignore
    }
    databaseInstance = null;
  }
  dbMetrics.reset();
}

/** Exported for the monitoring endpoint and internal observability gates. */
export function getDbMetrics(): SQLiteMetrics {
  return dbMetrics;
}
