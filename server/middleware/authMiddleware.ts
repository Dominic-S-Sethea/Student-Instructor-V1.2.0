import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthTokenPayload } from '../services/authService';
import { UserRepository } from '../repositories/userRepository';
import { parseCookies } from '../utils/cookies';

const authService = new AuthService();
const userRepo = new UserRepository();

export type UserRole = 'student' | 'admin' | 'organization' | 'mentor';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
  authSource?: 'cookie' | 'bearer';
}

export function extractJwtWithSource(req: Request): { token: string; source: 'cookie' | 'bearer' } | null {
  const cookies = parseCookies(req.headers.cookie);
  if (cookies['cdes_jwt']) {
    return { token: cookies['cdes_jwt'], source: 'cookie' };
  }
  const authHeader = req.headers['authorization'];
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    return token ? { token, source: 'bearer' } : null;
  }
  return null;
}

export function extractJwt(req: Request): string | null {
  return extractJwtWithSource(req)?.token ?? null;
}

function resolveActiveUser(token: string): AuthTokenPayload | null {
  const payload = authService.verifyToken(token);
  const user = userRepo.findById(payload.userId);
  if (!user || user.is_deleted || user.status === 'suspended') {
    return null;
  }
  const currentVersion = typeof user.token_version === 'number' ? user.token_version : 1;
  if (typeof payload.tv === 'number' && payload.tv !== currentVersion) {
    return null;
  }
  const profile = userRepo.getProfileByUserId(user.id);
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    jti: payload.jti,
    exp: payload.exp,
    tv: currentVersion,
    studentProfileId: profile?.id ?? null,
  };
}

/** Enforces valid JWT (from HttpOnly cookie or Bearer header) on protected endpoints. */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const extracted = extractJwtWithSource(req);
  if (!extracted) {
    res.status(401).json({
      success: false,
      error: 'Authentication required.',
    });
    return;
  }

  try {
    const resolved = resolveActiveUser(extracted.token);
    if (!resolved) {
      res.status(401).json({
        success: false,
        error: 'Session is invalid or account is inactive.',
      });
      return;
    }
    req.user = resolved;
    req.authSource = extracted.source;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token.',
    });
  }
}

/** Attaches authenticated user when a valid session/Bearer token is present; allows guests otherwise. */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const extracted = extractJwtWithSource(req);
  if (extracted) {
    try {
      const resolved = resolveActiveUser(extracted.token);
      if (resolved) {
        req.user = resolved;
        req.authSource = extracted.source;
      }
    } catch {
      // Ignore invalid/expired token for optional auth routes
    }
  }
  next();
}

/** Enforces role-based access control on authenticated endpoints. */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden. Requires one of roles: [${allowedRoles.join(', ')}].`,
      });
      return;
    }

    next();
  };
}

/**
 * Resolves the authorized target user ID (users.id) for student-scoped endpoints.
 * Rejects cross-student access unless the caller is an admin.
 */
export function resolveAuthorizedStudentId(
  req: AuthenticatedRequest,
  res: Response,
  requestedId?: string
): string | null {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return null;
  }

  const trimmed = requestedId?.trim();
  if (!trimmed) {
    return req.user.userId;
  }

  if (trimmed === req.user.userId || (req.user.studentProfileId && trimmed === req.user.studentProfileId)) {
    return req.user.userId;
  }

  if (req.user.role === 'admin') {
    const profileOwner = userRepo.findUserIdByProfileId(trimmed);
    return profileOwner || trimmed;
  }

  res.status(403).json({
    success: false,
    error: 'Forbidden: you can only access your own student records.',
  });
  return null;
}
