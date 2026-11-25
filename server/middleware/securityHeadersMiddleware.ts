import type { Request, Response, NextFunction } from 'express';
import { isCookieSecure } from '../config';

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' https:",
].join('; ');

/**
 * Applies defense-in-depth HTTP security headers to all API and static responses.
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', CSP_DIRECTIVES);

  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProdOrStaging = nodeEnv === 'production' || nodeEnv === 'staging';
  if (isProdOrStaging && isCookieSecure()) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/privacy') || req.path.startsWith('/api/memory')) {
    res.setHeader('Cache-Control', 'no-store');
  }

  next();
}
