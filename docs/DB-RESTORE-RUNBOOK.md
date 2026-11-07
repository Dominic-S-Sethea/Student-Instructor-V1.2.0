# CDES Database Restore Runbook

This runbook documents the procedures for restoring the CDES Student-Instructor-V1.2.0 SQLite database from backup.

## Table of Contents
1. [Overview](#overview)
2. [Pre-Restore Procedures](#pre-restore-procedures)
3. [Restore Scenarios](#restore-scenarios)
4. [Restore Execution](#restore-execution)
5. [Post-Restore Verification](#post-restore-verification)
6. [Rollback Procedures](#rollback-procedures)
7. [Troubleshooting](#troubleshooting)
8. [Contact & Escalation](#contact--escalation)

---

## Overview

The CDES platform uses SQLite as its database. Backups are created automatically on a daily schedule using the backup script `server/db/backup_db.sh`. This runbook describes how to restore from those backups.

### Backup Strategy

- **Location**: `server/data/backups/` (git-ignored)
- **Format**: SQLite database files with WAL/SHM copies
- **Retention**: 7 daily, 4 weekly, 12 monthly snapshots
- **Naming**: `cdes_platform_YYYYMMDDTHHMMSS.db`

### Critical Assumptions

1. The application must be **stopped** before restoring.
2. The restore must occur from a **verified** backup.
3. The target database must be **empty or absent** during restore.

---

## Pre-Restore Procedures

### 1. Stop the Application

```bash
# Find and stop the running server process
pkill -f "node dist/server.cjs"
# Or use the process manager
pm2 stop server
```

### 2. Verify Backup Availability

```bash
# List available backups
ls -lt server/data/backups/cdes_platform_*.db | head -20
```

Verify the backup file exists and has appropriate size (should be similar to current DB size).

### 3. Verify Backup Integrity

```bash
sqlite3 /path/to/backup.db "PRAGMA integrity_check;"
# Expected output: ok
```

### 4. Prepare Restore Location

```bash
# Ensure the backup directory exists
mkdir -p server/data/

# Check for any existing target database
ls -la server/data/cdes_platform.db
```

---

## Restore Scenarios

### Scenario A: Full Database Restore (Latest Backup)

Restore the database to the state of the most recent backup.

### Scenario B: Point-in-Time Restore (Specific Backup)

Restore to a specific backup date.

### Scenario C: Partial Restore (Missing Tables/Data)

Apply a specific backup to a re-created empty database.

---

## Restore Execution

### Step 1: Stop All Application Processes

```bash
# MySQL: pkill -f "node dist/server.cjs"
# Verify no processes running
ps aux | grep "node dist/server.cjs"
```

### Step 2: Kill Any Lock on the Old Database

```bash
# If the target DB is locked by a crashed process
lsof | grep "cdes_platform.db"
# Kill the process holding the lock
kill -9 <PID>
```

### Step 3: Replace the Database File

```bash
# Navigate to the server directory
cd server/data

# Backup the current (broken/corrupt) DB for investigation
mv cdes_platform.db cdes_platform.db.broken.$(date +%Y%m%d%H%M%S)

# Copy the backup to the target location
cp cdes_platform_YYYYMMDDTHHMMSS.db cdes_platform.db

# Copy WAL and SHM files if they exist in backup
cp cdes_platform_YYYYMMDDTHHMMSS.db-wal cdes_platform.db-wal 2>/dev/null || true
cp cdes_platform_YYYYMMDDTHHMMSS.db-shm cdes_platform.db-shm 2>/dev/null || true

# Ensure proper permissions
chmod 644 cdes_platform.db
```

### Step 4: Verify the Restored Database

```bash
# Run integrity check
sqlite3 cdes_platform.db "PRAGMA integrity_check;"
# Expected output: ok

# Run schema version check
sqlite3 cdes_platform.db "SELECT value FROM schema_version WHERE name='version';"
# Expected: 7 (or whatever the current schema version is)

# Run table count check (should match the backup's record count)
sqlite3 cdes_platform.db "SELECT COUNT(*) FROM sqlite_master WHERE type='table';"
```

### Step 5: Start the Application

```bash
# Start the server
npm start
# Or
node dist/server.cjs

# Verify it's running
curl http://localhost:3000/api/health
```

### Step 6: Verify Data Availability

```bash
# Check a few key tables
sqlite3 cdes_platform.db "SELECT COUNT(*) FROM students;"
sqlite3 cdes_platform.db "SELECT COUNT(*) FROM scholarships;"
sqlite3 cdes_platform.db "SELECT COUNT(*) FROM universities;"
```

---

## Post-Restore Verification

After restoring, verify the following:

| Check | Expected Result |
|-------|----------------|
| Health endpoint `/api/health` | `status: "ok"` |
| Database integrity | `ok` |
| Schema version | Matches current schema version |
| User count | Matches expected seeded count |
| Scholarship count | Matches expected count |
| University count | Matches expected count |
| Application starts | No migration errors |
| API responsiveness | < 200ms response time |

---

## Rollback Procedures

### If the Restore Fails or Causes Data Loss

1. **Immediate Action**: Stop the application.
2. **Verify the Rollback Target**: Ensure the backup is valid.
3. **Execute Rollback**:
   ```bash
   # Re-apply the backup
   cp cdes_platform_YYYYMMDDTHHMMSS.db cdes_platform.db
   ```
4. **Restart and Verify**: Confirm `/api/health` returns OK.
5. **Document**: Record the rollback and notify stakeholders.

### Rollback Checklist

- [ ] Application stopped
- [ ] Last known good backup identified
- [ ] Data verified before overwriting
- [ ] Restore completed
- [ ] Post-restore verification passed
- [ ] Stakeholders notified

---

## Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| `SQLite bus error` | WAL mode corruption | Stop app, recreate from backup |
| `database is locked` | Another process holds lock | Kill the lock holder |
| `no such table` | Wrong DB version | Restore correct backup |
| App crashes on startup | DB not migrated | Run `npm run migrate` |
| Health check timeout | Server not running | Start server, check logs |

---

## Contact & Escalation

| Role | Channel | Escalation |
|------|---------|------------|
| DevOps | #cdes-devops | Immediate |
| CTO | #cdes-cto | After DevOps |
| Product Owner | #cdes-owner | After CTO |

---

**End of Runbook**
