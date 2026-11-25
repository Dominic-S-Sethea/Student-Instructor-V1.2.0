import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import {
  authenticateToken,
  optionalAuth,
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

const router = Router();
const authService = new AuthService();

const authLimiter = rateLimiter(60000, 30, 'Too many authentication attempts. Please try again in a minute.');

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
      error: err instanceof Error ? err.message : 'Registration failed.',
    });
  }
});

/** POST /api/auth/login — verify credentials, set HttpOnly session cookie, rotate CSRF. */
router.post('/login', authLimiter, validate(LoginSchema, 'body'), (req: Request, res: Response): void => {
  try {
    const { email, password } = req.body;

    const result = authService.login({ email, password });
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
    res.status(401).json({
      success: false,
      error: err instanceof Error ? err.message : 'Authentication failed.',
    });
  }
});

/** POST /api/auth/logout — clear session and CSRF cookies. */
router.post('/logout', optionalAuth, (_req: AuthenticatedRequest, res: Response): void => {
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
