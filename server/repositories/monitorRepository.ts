import fs from 'node:fs';
import { getDatabase, getDbFilePath } from '../db/connection';

const ALLOWED_COUNT_TABLES = new Set([
  'users',
  'student_profiles',
  'scholarships',
  'universities',
  'ai_conversations',
]);

export interface OperationalTableCounts {
  tablesCount: number;
  users: number;
  studentProfiles: number;
  scholarships: number;
  universities: number;
  pendingSubmissions: number;
  aiConversations: number;
  dbSizeBytes: number;
  walSizeBytes: number;
}

function safeFileSize(filePath: string): number {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

export class MonitorRepository {
  public getOperationalCounts(): OperationalTableCounts {
    const db = getDatabase();
    const tablesCount = (
      db
        .prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        .get() as { count: number }
    ).count;

    const countTable = (table: string): number => {
      if (!ALLOWED_COUNT_TABLES.has(table)) {
        throw new Error(`Disallowed table count request: ${table}`);
      }
      try {
        return (db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number }).c;
      } catch {
        return 0;
      }
    };

    let pendingSubmissions = 0;
    try {
      pendingSubmissions = (
        db
          .prepare("SELECT COUNT(*) AS c FROM organization_submissions WHERE status = 'Pending Admin Review'")
          .get() as { c: number }
      ).c;
    } catch {
      pendingSubmissions = 0;
    }

    const dbPath = getDbFilePath();
    return {
      tablesCount,
      users: countTable('users'),
      studentProfiles: countTable('student_profiles'),
      scholarships: countTable('scholarships'),
      universities: countTable('universities'),
      pendingSubmissions,
      aiConversations: countTable('ai_conversations'),
      dbSizeBytes: safeFileSize(dbPath),
      walSizeBytes: safeFileSize(`${dbPath}-wal`),
    };
  }
}

export const monitorRepository = new MonitorRepository();
