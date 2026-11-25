import { Router, Request, Response } from 'express';
import { getDatabaseReadiness, verifyDatabaseHealth } from '../db/connection';
import { safeErrorMessage } from '../utils/httpErrors';

const router = Router();

/**
 * @route GET /api/health
 * @desc Live readiness probe reporting verified database schema, WAL, FK, and AI provider status.
 */
router.get('/', (_req: Request, res: Response): void => {
  res.setHeader('Content-Type', 'application/json');
  const readiness = getDatabaseReadiness();
  const dbHealth = readiness.ready ? verifyDatabaseHealth() : null;
  const aiEnabled = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');

  if (!readiness.ready || !dbHealth?.ok) {
    res.status(503).json({
      status: 'error',
      ready: false,
      platform: 'Cambodia Digital Education Society (CDES)',
      system: 'Production Layered Backend',
      database: dbHealth || {
        engine: 'SQLite',
        journalMode: readiness.journalMode,
        foreignKeys: readiness.foreignKeys,
        schemaVersion: readiness.schemaVersion,
        integrity: readiness.integrity,
      },
      aiEnabled,
      error: safeErrorMessage(dbHealth?.error || readiness.lastError, 'Database is not ready.', 503),
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.status(200).json({
    status: 'ok',
    ready: true,
    platform: 'Cambodia Digital Education Society (CDES)',
    system: 'Production Layered Backend',
    database: {
      engine: 'SQLite',
      journalMode: dbHealth.journalMode,
      foreignKeys: dbHealth.foreignKeys,
      schemaVersion: dbHealth.schemaVersion,
      integrity: dbHealth.integrity,
    },
    aiEnabled,
    timestamp: new Date().toISOString(),
  });
});

export default router;
