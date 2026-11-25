# CDES Database Restore Runbook

This runbook documents backup and operator-controlled recovery for the CDES Student-Instructor-V1.2.0 SQLite database.

> **Important**: The application never deletes or overwrites a corrupted database or its `-wal`/`-shm` files on startup. If startup reports `DatabaseInitializationError` or `/api/health` returns `503`, follow this runbook.

## 1. Configured Paths & Backup Strategy

- **Live Database Path**: Configured via `DATABASE_PATH` (default: `server/data/cdes_platform.db`).
- **Backup Location**: `server/data/backups/` (or `$BACKUP_DIR`, git-ignored).
- **Backup Scripts**:
  - Cross-platform Node (`node:sqlite` WAL-safe `VACUUM INTO`): `node server/db/backupRestore.mjs backup [sourceDb] [backupPath]`
  - POSIX shell (`sqlite3 .backup`): `DATABASE_PATH=... ./server/db/backup_db.sh`
- **Naming**: `cdes_platform_YYYYMMDDTHHMMSSZ.db` (standalone snapshot; no `-wal`/`-shm` sidecars needed).

## 2. Pre-Restore Procedures

1. **Stop the Application**: Ensure `node dist/server/server.cjs` (or `tsx server.ts`) is stopped and holds no file locks on `$DATABASE_PATH`.
2. **Verify Backup Integrity Before Touching Live Data**:
   - Using `sqlite3`:
     - `sqlite3 /path/to/backup.db "PRAGMA integrity_check;"` -> must output `ok`
     - `sqlite3 /path/to/backup.db "PRAGMA foreign_keys = ON; PRAGMA foreign_key_check;"` -> must output nothing (0 rows)
     - `sqlite3 /path/to/backup.db "SELECT schema_version FROM schema_version ORDER BY schema_version DESC LIMIT 1;"` -> expected `8` (or current schema version)

## 3. Restore Execution

1. **Preserve the broken database for investigation** (do not delete until recovery is verified):
   - Move `$DATABASE_PATH` (and any `${DATABASE_PATH}-wal`, `${DATABASE_PATH}-shm`) to a forensic quarantine path (e.g. `cdes_platform.db.broken.<timestamp>`).
2. **Restore from the verified backup**:
   - Cross-platform: `node server/db/backupRestore.mjs restore <backupPath> <targetDbPath>`
   - Or manually: copy the verified standalone `.db` snapshot to `$DATABASE_PATH` (without copying stale `-wal`/`-shm` files) and set `chmod 644 "$DATABASE_PATH"`.

## 4. Post-Restore Verification

1. Run SQLite checks on the restored target:
   - `PRAGMA integrity_check;` -> `ok`
   - `PRAGMA foreign_keys = ON; PRAGMA foreign_key_check;` -> 0 rows
   - `SELECT COUNT(*) FROM student_profiles;`
   - `SELECT COUNT(*) FROM scholarships;`
   - `SELECT COUNT(*) FROM universities;`
2. Start the server (`NODE_ENV=production DATABASE_PATH=<target> npm start`) and verify:
   - `GET /api/health` returns HTTP `200` with `status: "ok"`, `ready: true`, `database.integrity: "ok"`, `database.foreignKeys: true`, and expected `schemaVersion`.
   - Known scholarship and authenticated student profile reads succeed over HTTP.
