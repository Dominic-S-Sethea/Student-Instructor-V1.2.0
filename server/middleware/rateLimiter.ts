import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const clientMap = new Map<string, RateLimitRecord>();

/**
 * Creates an in-memory sliding window rate limiter.
 * @param windowMs Window size in milliseconds
 * @param maxRequests Max allowed requests per window per IP
 * @param message Custom message
 */
export function rateLimiter(windowMs: number = 60000, maxRequests: number = 60, message: string = 'Too many requests, please try again later.') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const record = clientMap.get(ip);

    if (!record || now > record.resetAt) {
      clientMap.set(ip, {
        count: 1,
        resetAt: now + windowMs
      });
      next();
      return;
    }

    if (record.count >= maxRequests) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfterSec));
      res.status(429).json({
        success: false,
        error: message,
        retryAfterSeconds: retryAfterSec
      });
      return;
    }

    record.count += 1;
    next();
  };
}
