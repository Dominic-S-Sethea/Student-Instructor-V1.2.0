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
import { RegisterSchema, LoginSchema } from '../validators/apiSchemas';
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
    res.status(400).json({
      success: false,
      error: safeErrorMessage(err, 'Registration failed.', 400),
    });
  }
});

/** POST /api/auth/login — verify credentials, enforce progressive lockout, set HttpOnly session cookie, rotate CSRF. */
router.post('/login', authLimiter, loginAccountLimiter, validate(LoginSchema, 'body'), (req: Request, res: Response): void => {
  const { email, password } = req.body as { email: string; password: string };
  const lockoutSec = authLockoutService.getLockoutSeconds(email);
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
    authLockoutService.recordSuccess(email);
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
    const lockResult = authLockoutService.recordFailure(email, req.ip || req.socket.remoteAddress);
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

/** POST /api/auth/logout — revoke active JWT and clear session/CSRF cookies. */
router.post('/logout', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  authService.revokeToken(extractJwt(req));
  authService.clearAuthCookie(res);
  clearCsrfCookie(res);
  res.json({ success: true });
});

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
