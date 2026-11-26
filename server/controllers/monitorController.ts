import { monitorEventLoopDelay } from 'node:perf_hooks';
import { Router, Response } from 'express';
import { getDbMetrics, verifyDatabaseHealth } from '../db/connection';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware';
import { httpMetricsStore } from '../middleware/httpMetricsMiddleware';
import { monitorRepository } from '../repositories/monitorRepository';
import { sendRouteError } from '../utils/httpErrors';

const router = Router();
const eventLoopMonitor = monitorEventLoopDelay({ resolution: 20 });
eventLoopMonitor.enable();

function getProcessRuntimeStats() {
  const mem = process.memoryUsage();
  const p95Ns = Number.isFinite(eventLoopMonitor.percentile(95)) ? eventLoopMonitor.percentile(95) : 0;
  return {
    uptimeSeconds: Math.round(process.uptime()),
    memoryBytes: {
      rss: mem.rss,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      external: mem.external,
    },
    eventLoopDelayP95Ms: Math.round((p95Ns / 1_000_000) * 100) / 100,
  };
}

/** GET /api/metrics — admin-gated operational metrics backed by live SQLite, HTTP, and Node process telemetry. */
router.get('/', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const deepCheck = req.query.deep === 'true';
    const health = verifyDatabaseHealth({ runQuickCheck: deepCheck });
    const sqliteStats = getDbMetrics().toJSON();
    const httpStats = httpMetricsStore.getSnapshot();
    const counts = monitorRepository.getOperationalCounts();
    const runtime = getProcessRuntimeStats();

    res.json({
      success: true,
      status: health.ok ? 'healthy' : 'degraded',
      uptimeSeconds: runtime.uptimeSeconds,
      process: runtime,
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

/** GET /api/metrics/prometheus — admin-gated Prometheus text exposition endpoint. */
router.get('/prometheus', authenticateToken, requireRole('admin'), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const health = verifyDatabaseHealth({ runQuickCheck: false });
    const sqliteStats = getDbMetrics().toJSON();
    const httpStats = httpMetricsStore.getSnapshot();
    const counts = monitorRepository.getOperationalCounts();
    const runtime = getProcessRuntimeStats();

    const lines = [
      '# HELP cdes_process_uptime_seconds Process uptime in seconds.',
      '# TYPE cdes_process_uptime_seconds gauge',
      `cdes_process_uptime_seconds ${runtime.uptimeSeconds}`,
      '# HELP cdes_process_resident_memory_bytes Resident set size in bytes.',
      '# TYPE cdes_process_resident_memory_bytes gauge',
      `cdes_process_resident_memory_bytes ${runtime.memoryBytes.rss}`,
      '# HELP cdes_process_heap_used_bytes V8 heap used in bytes.',
      '# TYPE cdes_process_heap_used_bytes gauge',
      `cdes_process_heap_used_bytes ${runtime.memoryBytes.heapUsed}`,
      '# HELP cdes_event_loop_delay_p95_ms Event loop delay 95th percentile in milliseconds.',
      '# TYPE cdes_event_loop_delay_p95_ms gauge',
      `cdes_event_loop_delay_p95_ms ${runtime.eventLoopDelayP95Ms}`,
      '# HELP cdes_http_requests_total Total HTTP requests handled.',
      '# TYPE cdes_http_requests_total counter',
      `cdes_http_requests_total ${httpStats.totalRequests}`,
      '# HELP cdes_http_errors_4xx_total Total 4xx HTTP responses.',
      '# TYPE cdes_http_errors_4xx_total counter',
      `cdes_http_errors_4xx_total ${httpStats.errors4xx}`,
      '# HELP cdes_http_errors_5xx_total Total 5xx HTTP responses.',
      '# TYPE cdes_http_errors_5xx_total counter',
      `cdes_http_errors_5xx_total ${httpStats.errors5xx}`,
      '# HELP cdes_http_latency_p95_ms Observed HTTP latency p95 in milliseconds.',
      '# TYPE cdes_http_latency_p95_ms gauge',
      `cdes_http_latency_p95_ms ${httpStats.p95Ms}`,
      '# HELP cdes_sqlite_ready Database health readiness flag (1=ok, 0=degraded).',
      '# TYPE cdes_sqlite_ready gauge',
      `cdes_sqlite_ready ${health.ok ? 1 : 0}`,
      '# HELP cdes_sqlite_schema_version Current applied SQLite schema version.',
      '# TYPE cdes_sqlite_schema_version gauge',
      `cdes_sqlite_schema_version ${health.schemaVersion}`,
      '# HELP cdes_sqlite_file_bytes SQLite main database file size in bytes.',
      '# TYPE cdes_sqlite_file_bytes gauge',
      `cdes_sqlite_file_bytes ${counts.dbSizeBytes}`,
      '# HELP cdes_sqlite_wal_bytes SQLite WAL file size in bytes.',
      '# TYPE cdes_sqlite_wal_bytes gauge',
      `cdes_sqlite_wal_bytes ${counts.walSizeBytes}`,
      '# HELP cdes_sqlite_queries_total Total tracked SQLite query executions.',
      '# TYPE cdes_sqlite_queries_total counter',
      `cdes_sqlite_queries_total ${sqliteStats.totalQueryExecutions}`,
      '# HELP cdes_sqlite_busy_retries_total Total SQLite busy timeout retries.',
      '# TYPE cdes_sqlite_busy_retries_total counter',
      `cdes_sqlite_busy_retries_total ${sqliteStats.busyTimeoutRetries}`,
      '',
    ];

    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.status(200).send(lines.join('\n'));
  } catch (err: unknown) {
    sendRouteError(res, err, 'Failed to render Prometheus metrics.');
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
