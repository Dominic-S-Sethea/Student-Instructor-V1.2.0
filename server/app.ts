import express, { Express, Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import { requestLogger } from './middleware/requestLogger';
import { traceMiddleware } from './middleware/tracingMiddleware';
import { rateLimiter } from './middleware/rateLimiter';
import { httpMetricsMiddleware } from './middleware/httpMetricsMiddleware';
import { securityHeadersMiddleware } from './middleware/securityHeadersMiddleware';
import { optionalAuth } from './middleware/authMiddleware';
import { generateCsrfToken, validateCsrfToken } from './middleware/csrfMiddleware';
import { resolvePublicDistDir } from './db/schemaAssets';
import { HttpError, safeErrorMessage } from './utils/httpErrors';
import logger from './middleware/loggingMiddleware';

import healthRoutes from './routes/healthRoutes';
import authController from './controllers/authController';
import userController from './controllers/userController';
import scholarshipController from './controllers/scholarshipController';
import universityController from './controllers/universityController';
import analyticsController from './controllers/analyticsController';
import monitorController from './controllers/monitorController';
import studentIntelligenceController from './controllers/studentIntelligenceController';
import researchController from './controllers/researchController';
import privacyController from './controllers/privacyController';
import avatarWorldController from './controllers/avatarWorldController';
import learningController from './controllers/learningController';
import communityController from './controllers/communityController';
import learningScienceController from './controllers/learningScienceController';
import aiRoutes from './routes/aiRoutes';
import platformArchitectureRoutes from './routes/platformArchitectureRoutes';
import knowledgeController from './controllers/knowledgeController';
import digitalWorldController from './controllers/digitalWorldController';
import { aiAgent2Routes } from './routes/aiAgent2Routes';
import dataPlatformRoutes from './routes/dataPlatformRoutes';
import { createAdvisorRouter, AdvisorProvider } from './routes/advisorRoutes';
import { createDecisionRouter } from './routes/decisionRoutes';
import hermesMemoryController from './controllers/hermesMemoryController';

export interface CreateAppOptions {
  frontendOrigin?: string;
  serveStatic?: boolean;
  publicDistDir?: string;
  advisorProvider?: AdvisorProvider | null;
  advisorTimeoutMs?: number;
  disableRateLimit?: boolean;
}

function parseAllowedOrigins(rawOrigin: string): string[] {
  const parsed = rawOrigin
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0 && entry !== '*');
  return parsed.length > 0 ? parsed : ['http://localhost:5173'];
}

/**
 * Constructs the Express application cleanly without opening SQLite on import or binding a port.
 * Suitable for both production/development servers and ephemeral HTTP integration tests.
 */
export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();
  app.disable('x-powered-by');
  const trustProxyRaw = (process.env.TRUST_PROXY || '').trim();
  if (trustProxyRaw === 'true') {
    app.set('trust proxy', true);
  } else if (/^\d+$/.test(trustProxyRaw)) {
    app.set('trust proxy', Number(trustProxyRaw));
  } else if (trustProxyRaw && trustProxyRaw !== 'false') {
    app.set('trust proxy', trustProxyRaw);
  }
  if (options.disableRateLimit) {
    app.set('disableRateLimit', true);
  }
  const allowedOrigins = parseAllowedOrigins(
    options.frontendOrigin || process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
  );
  const nodeEnv = process.env.NODE_ENV || 'development';
  const serveStatic =
    options.serveStatic !== undefined
      ? options.serveStatic
      : nodeEnv === 'production' || nodeEnv === 'staging';

  app.use(securityHeadersMiddleware);
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }
        callback(null, allowedOrigins.includes(origin));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-CSRF-Token-Id'],
      exposedHeaders: ['X-CSRF-Token'],
    })
  );

  app.use(traceMiddleware);
  app.use(httpMetricsMiddleware);
  app.use(requestLogger);

  if (!options.disableRateLimit) {
    app.use(rateLimiter());
  }

  // Parse authenticated session before generating/validating session-bound CSRF tokens
  app.use(optionalAuth);
  app.use(generateCsrfToken);
  app.use(validateCsrfToken);

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authController);
  app.use('/api/users', userController);
  app.use('/api/scholarships', scholarshipController);
  app.use('/api/universities', universityController);
  app.use('/api/analytics', analyticsController);
  app.use('/api/student/profile', studentIntelligenceController);
  app.use('/api/research', researchController);
  app.use('/api/metrics', monitorController);
  app.use('/api/privacy', privacyController);
  app.use('/api/avatar-world', avatarWorldController);
  app.use('/api/learning', learningController);
  app.use('/api/community', communityController);
  app.use('/api/learning-science', learningScienceController);
  app.use('/api/ai', aiRoutes);
  app.use('/api/ai-os', aiAgent2Routes);
  app.use('/api/platform', platformArchitectureRoutes);
  app.use('/api/knowledge', knowledgeController);
  app.use('/api/digital-world', digitalWorldController);
  app.use('/api/data-platform', dataPlatformRoutes);
  app.use('/api/memory', hermesMemoryController);
  app.use(
    '/api/advisor',
    createAdvisorRouter({
      provider: options.advisorProvider,
      timeoutMs: options.advisorTimeoutMs,
    })
  );
  app.use('/api/decision', createDecisionRouter());

  // Catch-all for unknown /api routes so they never fall through to SPA HTML
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'API route not found.',
    });
  });

  if (serveStatic) {
    const publicDir = resolvePublicDistDir(options.publicDistDir);
    if (fs.existsSync(publicDir)) {
      app.use(express.static(publicDir, { dotfiles: 'ignore' }));
      app.get('*', (req: Request, res: Response, next: NextFunction) => {
        if (req.path.startsWith('/api')) {
          next();
          return;
        }
        const indexPath = path.join(publicDir, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).json({ success: false, error: 'Frontend bundle not found.' });
        }
      });
    }
  }

  // Global JSON error middleware
  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    const record = err as { status?: unknown; statusCode?: unknown; code?: unknown; details?: unknown };
    const status =
      err instanceof HttpError
        ? err.status
        : typeof record?.status === 'number'
        ? record.status
        : typeof record?.statusCode === 'number'
        ? record.statusCode
        : 500;
    if (status >= 500) {
      logger.error('UNHANDLED_API_ERROR', {
        traceId: (req as { traceId?: string }).traceId,
        status,
        method: req.method,
        path: req.originalUrl,
        error: err instanceof Error ? err.message : String(err),
      });
    }
    const code = err instanceof HttpError ? err.code : typeof record?.code === 'string' ? record.code : undefined;
    const details = err instanceof HttpError ? err.details : record?.details;
    res.status(status).json({
      success: false,
      ...(code ? { code } : {}),
      error: safeErrorMessage(err, 'Internal server error', status),
      ...(details !== undefined ? { details } : {}),
    });
  });

  return app;
}
