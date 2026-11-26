// CDES Platform - Request Logging Middleware
// Logs every HTTP request and response with trace correlation and safe path-only URLs (never raw query strings).

import type { NextFunction, Response } from 'express';
import logger from './loggingMiddleware';
import type { TracedRequest } from './tracingMiddleware';

export interface HttpRequestInfo {
  method: string;
  path: string;
  ip: string;
  userAgent: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  startTime: number;
  statusCode: number;
  durationMs: number;
}

export function requestLogger(req: TracedRequest, res: Response, next: NextFunction): void {
  const start = Date.now();
  const safePath = (req.originalUrl || req.url || '/').split('?')[0];

  const requestInfo: HttpRequestInfo = {
    method: req.method,
    path: safePath,
    ip: req.ip || req.socket?.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || '',
    traceId: req.traceId,
    spanId: req.spanId,
    startTime: start,
    statusCode: 200,
    durationMs: 0,
  };

  res.on('finish', () => {
    requestInfo.statusCode = res.statusCode;
    requestInfo.durationMs = Date.now() - start;
    if (req.user?.userId) {
      requestInfo.userId = req.user.userId;
    }

    if (res.statusCode >= 500) {
      logger.error('REQUEST_ERROR', requestInfo);
    } else if (res.statusCode >= 400) {
      logger.warn('REQUEST_WARNING', requestInfo);
    } else {
      logger.info('REQUEST_COMPLETE', requestInfo);
    }
  });

  next();
}
