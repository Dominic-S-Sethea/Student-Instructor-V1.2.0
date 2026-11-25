import { Router, Response } from 'express';
import { getDatabase, getDbMetrics, verifyDatabaseHealth } from '../db/connection';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware';
import { httpMetricsStore } from '../middleware/httpMetricsMiddleware';

const router = Router();

/** GET /api/metrics — admin-gated operational metrics backed by live SQLite & HTTP telemetry. */
router.get('/', authenticateToken, requireRole('admin'), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const db = getDatabase();
    const health = verifyDatabaseHealth();
    const sqliteStats = getDbMetrics().toJSON();
    const httpStats = httpMetricsStore.getSnapshot();

    const tablesCount = (
      db
        .prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        .get() as { count: number }
    ).count;

    const ALLOWED_COUNT_TABLES = new Set([
      'users',
      'student_profiles',
      'scholarships',
      'universities',
      'ai_conversations',
    ]);

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

    const pendingSubmissions = ((): number => {
      try {
        return (
          db
            .prepare("SELECT COUNT(*) AS c FROM organization_submissions WHERE status = 'Pending Admin Review'")
            .get() as { c: number }
        ).c;
      } catch {
        return 0;
      }
    })();

    res.json({
      success: true,
      status: health.ok ? 'healthy' : 'degraded',
      uptimeSeconds: Math.round(process.uptime()),
      database: {
        ok: health.ok,
        journalMode: health.journalMode,
        foreignKeys: health.foreignKeys,
        integrity: health.integrity,
        schemaVersion: health.schemaVersion,
        tablesCount,
        counts: {
          users: countTable('users'),
          studentProfiles: countTable('student_profiles'),
          scholarships: countTable('scholarships'),
          universities: countTable('universities'),
          pendingSubmissions,
          aiConversations: countTable('ai_conversations'),
        },
        sqlite: sqliteStats,
      },
      http: httpStats,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to collect metrics.',
    });
  }
});

/** GET /api/metrics/sqlite — admin-gated detailed SQLite metrics. */
router.get('/sqlite', authenticateToken, requireRole('admin'), (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(getDbMetrics().toJSON());
  } catch (err: unknown) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to read SQLite metrics',
    });
  }
});

export default router;
