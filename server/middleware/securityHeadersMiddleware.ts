import type { Request, Response, NextFunction } from 'express';
import { isCookieSecure } from '../config';

function buildCspDirectives(isDev: boolean): string {
  const extraConnect = (process.env.CSP_CONNECT_SRC || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0 && entry !== '*' && entry !== 'https:');

  const scriptSrc = isDev ? "script-src 'self' 'unsafe-inline'" : "script-src 'self'";
  const connectSources = ["'self'", ...(isDev ? ['ws:', 'wss:'] : []), ...extraConnect];

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    scriptSrc,
    `connect-src ${connectSources.join(' ')}`,
  ].join('; ');
}

/**
 * Applies defense-in-depth HTTP security headers to all API and static responses.
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProdOrStaging = nodeEnv === 'production' || nodeEnv === 'staging';

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', buildCspDirectives(!isProdOrStaging));

  if (isProdOrStaging && isCookieSecure()) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  if (req.path.startsWith('/api/') || req.path === '/api') {
    res.setHeader('Cache-Control', 'no-store');
  }

  next();
}

