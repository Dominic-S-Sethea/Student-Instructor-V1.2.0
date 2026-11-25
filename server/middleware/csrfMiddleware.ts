import crypto from 'node:crypto';
import type { Request, Response, NextFunction, CookieOptions } from 'express';
import { parseCookies } from '../utils/cookies';
import { getSessionTtlSeconds } from '../services/authService';
import { isCookieSecure } from '../config';
import type { AuthenticatedRequest } from './authMiddleware';

const CSRF_COOKIE_NAME = 'cdes_csrf_secret';
const fallbackSigningKey = crypto.randomBytes(32).toString('hex');

function getCsrfSigningKey(): string {
  const jwtSecret = process.env.JWT_SECRET;
  return jwtSecret && jwtSecret.trim() !== '' ? jwtSecret : fallbackSigningKey;
}

function getCsrfCookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isCookieSecure(),
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  };
}

function computeBoundToken(secret: string, sessionScope: string): string {
  return crypto
    .createHmac('sha256', getCsrfSigningKey())
    .update(`${sessionScope}:${secret}`)
    .digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
}

/**
 * Ensures an HttpOnly CSRF secret cookie exists and returns a session-bound
 * browser-readable CSRF token via X-CSRF-Token response header.
 */
export function issueCsrfToken(req: Request, res: Response, sessionUserId?: string): string {
  const cookies = parseCookies(req.headers.cookie);
  let secret = cookies[CSRF_COOKIE_NAME];
  if (!secret || secret.length < 32) {
    secret = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE_NAME, secret, getCsrfCookieOptions(getSessionTtlSeconds() * 1000));
  }
  const scope = sessionUserId || (req as AuthenticatedRequest).user?.userId || 'anon';
  const token = computeBoundToken(secret, scope);
  res.setHeader('X-CSRF-Token', token);
  return token;
}

/** Rotates the CSRF secret on authentication state changes (login/register). */
export function rotateCsrfToken(res: Response, sessionUserId: string): string {
  const secret = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, secret, getCsrfCookieOptions(getSessionTtlSeconds() * 1000));
  const token = computeBoundToken(secret, sessionUserId);
  res.setHeader('X-CSRF-Token', token);
  return token;
}

/** Clears CSRF cookie on logout. */
export function clearCsrfCookie(res: Response): void {
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: true,
    secure: isCookieSecure(),
    sameSite: 'lax',
    path: '/',
  });
}

/** Refreshes X-CSRF-Token header when a CSRF secret cookie is already present. */
export function generateCsrfToken(req: Request, res: Response, next: NextFunction): void {
  const cookies = parseCookies(req.headers.cookie);
  const secret = cookies[CSRF_COOKIE_NAME];
  if (secret) {
    const scope = (req as AuthenticatedRequest).user?.userId || 'anon';
    res.setHeader('X-CSRF-Token', computeBoundToken(secret, scope));
  }
  next();
}

/**
 * Validates session-bound CSRF token on state-changing HTTP requests.
 * Pure Bearer-header API clients without a session cookie are exempt.
 */
export function validateCsrfToken(req: Request, res: Response, next: NextFunction): void {
  const method = req.method?.toUpperCase() || 'GET';
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    next();
    return;
  }

  const cookies = parseCookies(req.headers.cookie);
  const authHeader = req.headers['authorization'];
  const hasBearer = typeof authHeader === 'string' && authHeader.startsWith('Bearer ');
  const hasSessionCookie = Boolean(cookies['cdes_jwt']);

  if (hasBearer && !hasSessionCookie) {
    next();
    return;
  }

  const secret = cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers['x-csrf-token'];
  const providedToken = typeof headerToken === 'string' ? headerToken.trim() : '';

  if (!secret || !providedToken) {
    res.status(403).json({
      success: false,
      code: 'CSRF_MISSING',
      error: 'CSRF validation failed: missing CSRF cookie or X-CSRF-Token header.',
    });
    return;
  }

  const scope = (req as AuthenticatedRequest).user?.userId || 'anon';
  const expectedToken = computeBoundToken(secret, scope);

  if (!safeEqualHex(expectedToken, providedToken)) {
    res.status(403).json({
      success: false,
      code: 'CSRF_INVALID',
      error: 'CSRF validation failed: invalid or session-mismatched token.',
    });
    return;
  }

  next();
}
