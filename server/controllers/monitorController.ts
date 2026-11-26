import { Router, Response } from 'express';
import { getDbMetrics, verifyDatabaseHealth } from '../db/connection';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware';
import { httpMetricsStore } from '../middleware/httpMetricsMiddleware';
import { monitorRepository } from '../repositories/monitorRepository';
import { sendRouteError } from '../utils/httpErrors';

const router = Router();

/** GET /api/metrics — admin-gated operational metrics backed by live SQLite & HTTP telemetry. */
router.get('/', authenticateToken, requireRole('admin'), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const health = verifyDatabaseHealth();
    const sqliteStats = getDbMetrics().toJSON();
    const httpStats = httpMetricsStore.getSnapshot();
    const counts = monitorRepository.getOperationalCounts();

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
        tablesCount: counts.tablesCount,
        dbSizeBytes: counts.dbSizeBytes,
        walSizeBytes: counts.walSizeBytes,
        counts: {
          users: counts.users,
          studentProfiles: counts.studentProfiles,
          scholarships: counts.scholarships,
          universities: counts.universities,
          pendingSubmissions: counts.pendingSubmissions,
          aiConversations: counts.aiConversations,
        },
        sqlite: sqliteStats,
      },
      http: httpStats,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    sendRouteError(res, err, 'Failed to collect metrics.');
  }
});

/** GET /api/metrics/sqlite — admin-gated detailed SQLite metrics. */
router.get('/sqlite', authenticateToken, requireRole('admin'), (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json(getDbMetrics().toJSON());
  } catch (err: unknown) {
    sendRouteError(res, err, 'Failed to read SQLite metrics.');
  }
});

export default router;
