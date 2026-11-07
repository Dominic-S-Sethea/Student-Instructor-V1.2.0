import { Router } from 'express';
import { getDbMetrics } from '../db/connection';

const router = Router();

/**
 * GET /api/metrics/sqlite
 *
 * Exposes the SQLite writer-concurrency counter and slow-query metric for the
 * production database. Fields mirror the 00_db_scaling_decision.md §12 gate:
 *   - SQLITE_BUSY proxy:     busyTimeoutRetries (SQLITE_BUSY is the early-warning
 *                            limit in the §7 upgrade-trigger list)
 *   - writer concurrency:    writerActive / writerMax
 *   - read/write ops:        readOps / writeOps
 *   - slow-query metric:     slowQueries (EXPLAIN QUERY PLAN already stored per
 *                            top-N query in the topQueries array)
 */
router.get('/sqlite', (_req, res) => {
  try {
    res.json(getDbMetrics().toJSON());
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to read SQLite metrics' });
  }
});

export default router;
