import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import {
  authenticateToken,
  optionalAuth,
  extractJwt,
  AuthenticatedRequest,
} from '../middleware/authMiddleware';
import {
  issueCsrfToken,
  rotateCsrfToken,
  clearCsrfCookie,
} from '../middleware/csrfMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validationMiddleware';
import { RegisterSchema, LoginSchema, ChangePasswordSchema } from '../validators/apiSchemas';
import { safeErrorMessage } from '../utils/httpErrors';
import { authLockoutService } from '../services/authLockoutService';

const router = Router();
const authService = new AuthService();

const authLimiter = rateLimiter(60000, 30, 'Too many authentication attempts. Please try again in a minute.');
const loginAccountLimiter = rateLimiter(
  60000,
  12,
  'Too many login attempts for this account. Please wait a minute before trying again.',
  (req) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    return `login:${ip}:${rawEmail || 'unknown'}`;
  }
);

/** GET /api/auth/csrf — issue/read CSRF token for browser sessions. */
router.get('/csrf', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const csrfToken = issueCsrfToken(req, res, req.user?.userId);
  res.json({
    success: true,
    data: { csrfToken },
  });
});

/** GET /api/auth/session — single bootstrap endpoint for browser state + CSRF token. */
router.get('/session', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const csrfToken = issueCsrfToken(req, res, req.user?.userId);
  if (!req.user) {
    res.json({
      success: true,
      data: {
        authenticated: false,
        user: null,
        profile: null,
        education: [],
        csrfToken,
      },
    });
    return;
  }

  const details = authService.getSessionDetails(req.user.userId);
  if (!details) {
    res.json({
      success: true,
      data: {
        authenticated: false,
        user: null,
        profile: null,
        education: [],
        csrfToken,
      },
    });
    return;
  }

  res.json({
    success: true,
    data: {
      authenticated: true,
      user: details.user,
      profile: details.profile,
      education: details.education,
      csrfToken,
    },
  });
});

/** POST /api/auth/register — create account, set HttpOnly session cookie, rotate CSRF. */
router.post('/register', authLimiter, validate(RegisterSchema, 'body'), (req: Request, res: Response): void => {
  try {
    const { email, password, role, name, education_level, organization_name } = req.body;

    const result = authService.register({
      email,
      password,
      role,
      name: name || (role === 'organization' ? organization_name : 'New Student'),
      education_level,
      organization_name,
    });

    authService.setAuthCookie(res, result.token);
    const csrfToken = rotateCsrfToken(res, result.user.id);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        profile: result.profile,
        education: result.education,
        csrfToken,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    const isClientError = /already exists|must be at least|must not exceed|invalid/i.test(msg);
    const status = isClientError ? 400 : 500;
    res.status(status).json({
      success: false,
      error: safeErrorMessage(err, 'Registration failed.', status),
    });
  }
});

/** POST /api/auth/login — verify credentials, enforce (ip, email) progressive lockout, set HttpOnly session cookie, rotate CSRF. */
router.post('/login', authLimiter, loginAccountLimiter, validate(LoginSchema, 'body'), (req: Request, res: Response): void => {
  const { email, password } = req.body as { email: string; password: string };
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const lockoutSec = authLockoutService.getLockoutSeconds(email, clientIp);
  if (lockoutSec > 0) {
    res.setHeader('Retry-After', String(lockoutSec));
    res.status(429).json({
      success: false,
      code: 'ACCOUNT_TEMPORARILY_LOCKED',
      error: 'Too many failed login attempts. Please try again later.',
    });
    return;
  }

  try {
    const result = authService.login({ email, password });
    authLockoutService.recordSuccess(email, clientIp);
    authService.setAuthCookie(res, result.token);
    const csrfToken = rotateCsrfToken(res, result.user.id);

    res.json({
      success: true,
      data: {
        user: result.user,
        profile: result.profile,
        education: result.education,
        csrfToken,
      },
    });
  } catch (err: unknown) {
    const lockResult = authLockoutService.recordFailure(email, clientIp);
    if (lockResult.locked) {
      res.setHeader('Retry-After', String(lockResult.retryAfterSeconds));
      res.status(429).json({
        success: false,
        code: 'ACCOUNT_TEMPORARILY_LOCKED',
        error: 'Too many failed login attempts. Please try again later.',
      });
      return;
    }
    res.status(401).json({
      success: false,
      error: safeErrorMessage(err, 'Authentication failed.', 401),
    });
  }
});

/** POST /api/auth/logout — revoke active JWT (persisted in SQLite) and clear session/CSRF cookies. */
router.post('/logout', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  authService.revokeToken(extractJwt(req));
  authService.clearAuthCookie(res);
  clearCsrfCookie(res);
  res.json({ success: true });
});

/** POST /api/auth/logout-all — bump users.token_version to invalidate all active sessions across devices. */
router.post('/logout-all', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  authService.revokeToken(extractJwt(req));
  authService.revokeAllUserSessions(req.user!.userId);
  authService.clearAuthCookie(res);
  clearCsrfCookie(res);
  res.json({ success: true, message: 'All active sessions have been revoked.' });
});

/** POST /api/auth/change-password — rotate user password, invalidate prior sessions, and issue fresh cookies. */
router.post(
  '/change-password',
  authenticateToken,
  authLimiter,
  validate(ChangePasswordSchema, 'body'),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
      const { token } = authService.changePassword(req.user!.userId, currentPassword, newPassword);
      authService.setAuthCookie(res, token);
      const csrfToken = rotateCsrfToken(res, req.user!.userId);
      res.json({ success: true, data: { csrfToken }, message: 'Password updated and prior sessions revoked.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      const status = /incorrect|at least|exceed|not found/i.test(msg) ? 400 : 500;
      res.status(status).json({
        success: false,
        error: safeErrorMessage(err, 'Failed to change password.', status),
      });
    }
  }
);

/** GET /api/auth/me — get currently authenticated user details and CSRF token. */
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const details = authService.getSessionDetails(req.user!.userId);
  if (!details) {
    res.status(404).json({ success: false, error: 'User not found.' });
    return;
  }
  const csrfToken = issueCsrfToken(req, res, req.user!.userId);
  res.json({
    success: true,
    data: {
      ...details.user,
      user: details.user,
      profile: details.profile,
      education: details.education,
      csrfToken,
    },
  });
});

export default router;
