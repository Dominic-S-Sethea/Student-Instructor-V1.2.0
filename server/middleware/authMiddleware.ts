import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthTokenPayload } from '../services/authService';

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

/**
 * Enforces valid JWT Bearer token on protected endpoints.
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid Bearer token in the Authorization header.'
    });
    return;
  }

  try {
    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    res.status(403).json({
      success: false,
      error: err.message || 'Invalid or expired authentication token.'
    });
  }
}

/**
 * Optional authentication: Attaches user payload if valid token is provided,
 * but allows unauthenticated guest access to proceed.
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (token) {
    try {
      const payload = authService.verifyToken(token);
      req.user = payload;
    } catch {
      // Ignore invalid token for optional auth routes
    }
  }
  next();
}

/**
 * Role-Based Access Control (RBAC) middleware:
 * Ensures the authenticated user possesses one of the authorized roles.
 */
export function requireRole(...allowedRoles: Array<'student' | 'admin' | 'organization' | 'mentor'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden. This action requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
      });
      return;
    }

    next();
  };
}
