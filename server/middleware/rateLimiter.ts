import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  windowStart: number;
  currentCount: number;
  previousCount: number;
}

const MAX_TRACKED_CLIENTS = 10_000;

/**
 * Creates an isolated in-memory sliding-window counter rate limiter with bounded client tracking.
 */
export function rateLimiter(
  windowMs: number = 60000,
  maxRequests: number = 300,
  message: string = 'Too many requests, please try again later.',
  keyGenerator?: (req: Request) => string
): (req: Request, res: Response, next: NextFunction) => void {
  const clientMap = new Map<string, RateLimitRecord>();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.DISABLE_RATE_LIMIT === 'true' || req.app?.get('disableRateLimit') === true) {
      next();
      return;
    }

    const key = keyGenerator ? keyGenerator(req) : (req.ip || req.socket.remoteAddress || '127.0.0.1');
    const now = Date.now();

    if (clientMap.size >= MAX_TRACKED_CLIENTS && !clientMap.has(key)) {
      const expireCutoff = windowMs * 2;
      for (const [k, entry] of clientMap.entries()) {
        if (now - entry.windowStart >= expireCutoff) {
          clientMap.delete(k);
        }
      }
      if (clientMap.size >= MAX_TRACKED_CLIENTS) {
        for (const [k, entry] of clientMap.entries()) {
          if (clientMap.size < MAX_TRACKED_CLIENTS) break;
          const entryElapsed = Math.max(0, now - entry.windowStart);
          const entryPrevWeight = Math.max(0, 1 - entryElapsed / windowMs);
          const entryEffective = entry.previousCount * entryPrevWeight + entry.currentCount;
          if (entryEffective < maxRequests) {
            clientMap.delete(k);
          }
        }
      }
      while (clientMap.size >= MAX_TRACKED_CLIENTS) {
        const oldestKey = clientMap.keys().next().value;
        if (oldestKey === undefined) break;
        clientMap.delete(oldestKey);
      }
    }

    let record = clientMap.get(key);
    if (!record) {
      record = {
        windowStart: now,
        currentCount: 1,
        previousCount: 0,
      };
      clientMap.set(key, record);
      next();
      return;
    }

    if (now >= record.windowStart + windowMs) {
      const windowsElapsed = Math.floor((now - record.windowStart) / windowMs);
      if (windowsElapsed === 1) {
        record.previousCount = record.currentCount;
        record.windowStart += windowMs;
      } else {
        record.previousCount = 0;
        record.windowStart = now;
      }
      record.currentCount = 0;
    }

    const elapsed = Math.max(0, now - record.windowStart);
    const prevWeight = Math.max(0, 1 - elapsed / windowMs);
    const effectiveCount = record.previousCount * prevWeight + record.currentCount;

    if (effectiveCount >= maxRequests) {
      const retryAfterSec = Math.max(1, Math.ceil((record.windowStart + windowMs - now) / 1000));
      res.set('Retry-After', String(retryAfterSec));
      res.status(429).json({
        success: false,
        error: message,
        retryAfterSeconds: retryAfterSec,
      });
      return;
    }

    record.currentCount += 1;
    // Refresh LRU order on active key
    clientMap.delete(key);
    clientMap.set(key, record);
    next();
  };
}
