#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

function escapeSqlPath(p) {
  return path.resolve(p).replace(/'/g, "''");
}

function verifyDatabaseFile(dbPath) {
  const db = new DatabaseSync(dbPath);
  try {
    db.exec('PRAGMA foreign_keys = ON;');
    const integrity = db.prepare('PRAGMA integrity_check').get();
    if (!integrity || integrity.integrity_check !== 'ok') {
      throw new Error(`integrity_check failed: ${integrity ? integrity.integrity_check : 'unknown'}`);
    }
    const fkRows = db.prepare('PRAGMA foreign_key_check').all();
    if (fkRows.length > 0) {
      throw new Error(`foreign_key_check failed with ${fkRows.length} violation(s).`);
    }
    const verRow = db.prepare('SELECT schema_version AS v FROM schema_version ORDER BY v DESC LIMIT 1').get();
    return {
      integrity: 'ok',
      foreignKeyViolations: 0,
      schemaVersion: verRow ? Number(verRow.v) : 0,
    };
  } finally {
    db.close();
  }
}

export function backupDatabase(sourceDbPath, backupFilePath) {
  const src = path.resolve(sourceDbPath);
  const dest = path.resolve(backupFilePath);
  if (!fs.existsSync(src)) {
    throw new Error(`Source database not found: ${src}`);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { force: true });
  }

  const db = new DatabaseSync(src);
  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    db.exec(`VACUUM INTO '${escapeSqlPath(dest)}';`);
  } finally {
    db.close();
  }

  const verification = verifyDatabaseFile(dest);
  return { source: src, backup: dest, ...verification };
}

export function restoreDatabase(backupFilePath, targetDbPath) {
  const src = path.resolve(backupFilePath);
  const target = path.resolve(targetDbPath);
  if (!fs.existsSync(src)) {
    throw new Error(`Backup file not found: ${src}`);
  }
  verifyDatabaseFile(src);

  fs.mkdirSync(path.dirname(target), { recursive: true });
  for (const suffix of ['', '-wal', '-shm']) {
    const candidate = `${target}${suffix}`;
    if (fs.existsSync(candidate)) {
      fs.rmSync(candidate, { force: true });
    }
  }

  fs.copyFileSync(src, target);
  const verification = verifyDatabaseFile(target);
  return { backup: src, target, ...verification };
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('backupRestore.mjs')) {
  const [cmd, arg1, arg2] = process.argv.slice(2);
  try {
    if (cmd === 'backup') {
      const src = arg1 || process.env.DATABASE_PATH || path.join(process.cwd(), 'server', 'data', 'cdes_platform.db');
      const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
      const dest = arg2 || path.join(process.cwd(), 'server', 'data', 'backups', `cdes_platform_${stamp}.db`);
      console.log(JSON.stringify(backupDatabase(src, dest), null, 2));
    } else if (cmd === 'restore') {
      if (!arg1) {
        throw new Error('Usage: node server/db/backupRestore.mjs restore <backupPath> [targetDbPath]');
      }
      const target = arg2 || process.env.DATABASE_PATH || path.join(process.cwd(), 'server', 'data', 'cdes_platform.db');
      console.log(JSON.stringify(restoreDatabase(arg1, target), null, 2));
    } else {
      throw new Error('Usage: node server/db/backupRestore.mjs <backup|restore> ...');
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
