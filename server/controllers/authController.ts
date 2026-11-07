import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();
const authService = new AuthService();

// Strict rate limiting for auth to prevent brute force
const authLimiter = rateLimiter(60000, 15, 'Too many authentication attempts. Please try again in a minute.');

/**
 * @route POST /api/auth/register
 * @desc Register a new user (student or organization)
 */
router.post('/register', authLimiter, (req: Request, res: Response): void => {
  try {
    const { email, password, role, name, education_level, organization_name } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    if (!role || !['student', 'organization'].includes(role)) {
      res.status(400).json({ success: false, error: 'Role must be either "student" or "organization".' });
      return;
    }

    const result = authService.register({
      email,
      password,
      role,
      name: name || (role === 'organization' ? organization_name : 'New Student'),
      education_level,
      organization_name
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message || 'Registration failed.'
    });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Log in with email and password
 */
router.post('/login', authLimiter, (req: Request, res: Response): void => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    const result = authService.login({ email, password });

    // Set JWT as httpOnly cookie (no token in response body for XSS protection)
    authService.setAuthCookie(res, result.token);

    res.json({
      success: true,
      data: result.user
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: err.message || 'Authentication failed.'
    });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Clear authentication cookie (logout)
 */
router.post('/logout', (req: Request, res: Response): void => {
  try {
    authService.clearAuthCookie(res);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Logout failed.' });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get currently authenticated user details
 */
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = authService.getCurrentUser(req.user!.userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error.' });
  }
});

export default router;
