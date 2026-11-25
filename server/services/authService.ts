import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import type { CookieOptions, Response } from 'express';
import { getDatabase } from '../db/connection';
import { parseDurationSeconds, isCookieSecure, getResearchSalt } from '../config';
import {
  UserRepository,
  UserRecord,
  StudentProfileRecord,
  EducationHistoryRecord,
} from '../repositories/userRepository';

const WEAK_SECRET_PATTERNS = [
  /^changeme/i,
  /^replace[-_]?me/i,
  /^your[-_]?secret/i,
  /^dev[-_]?secret/i,
  /^secret$/i,
  /^password$/i,
  /^123456/,
];

const DUMMY_PASSWORD_HASH = bcrypt.hashSync('cdes-timing-defense-dummy-secret', 10);
const MAX_REVOKED_TOKENS = 10_000;
const revokedTokenIds = new Map<string, number>();

function pruneRevokedTokens(nowMs: number): void {
  for (const [jti, expMs] of revokedTokenIds.entries()) {
    if (expMs <= nowMs) {
      revokedTokenIds.delete(jti);
    }
  }
  while (revokedTokenIds.size >= MAX_REVOKED_TOKENS) {
    const oldest = revokedTokenIds.keys().next().value;
    if (oldest === undefined) break;
    revokedTokenIds.delete(oldest);
  }
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim() || '';
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production' || env === 'staging') {
    if (secret.length < 32 || WEAK_SECRET_PATTERNS.some((pattern) => pattern.test(secret))) {
      throw new Error('JWT_SECRET is too weak for production/staging (minimum 32 non-placeholder characters required).');
    }
  }
  return secret;
}

export function getSessionTtlSeconds(): number {
  return parseDurationSeconds(process.env.JWT_EXPIRES_IN, 86400);
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: 'student' | 'admin' | 'organization' | 'mentor';
  jti?: string;
  exp?: number;
  studentProfileId?: string | null;
}

export interface RegisterResult {
  user: Omit<UserRecord, 'password_hash'>;
  token: string;
  profile: StudentProfileRecord | null;
  education: EducationHistoryRecord[];
}

export interface LoginResult {
  user: Omit<UserRecord, 'password_hash'>;
  token: string;
  profile: StudentProfileRecord | null;
  education: EducationHistoryRecord[];
}

export class AuthService {
  private userRepo: UserRepository;

  constructor(userRepo?: UserRepository) {
    this.userRepo = userRepo || new UserRepository();
  }

  public register(params: {
    email: string;
    password: string;
    role: 'student' | 'organization';
    name: string;
    education_level?: string;
    organization_name?: string;
  }): RegisterResult {
    const email = params.email.trim().toLowerCase();
    const existing = this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    if (!params.password || params.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const password_hash = bcrypt.hashSync(params.password, 10);
    const db = getDatabase();
    const now = new Date().toISOString();
    const userId = `usr-${crypto.randomUUID()}`;
    const profileId = `stu-${crypto.randomUUID()}`;
    const researchSalt = getResearchSalt();
    const anonHash = crypto.createHmac('sha256', researchSalt).update(userId).digest('hex').slice(0, 12);
    const anonId = `anon-std-${anonHash}`;

    db.exec('BEGIN IMMEDIATE;');
    try {
      db.prepare(`
        INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'active', ?, ?)
      `).run(userId, email, password_hash, params.role, now, now);

      if (params.role === 'student') {
        db.prepare(`
          INSERT INTO student_profiles (
            id, user_id, name, education_level, language, interests, favorite_subjects, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'km', '[]', '[]', ?, ?)
        `).run(profileId, userId, params.name.trim() || 'New Student', params.education_level || 'Grade 12', now, now);

        db.prepare(`
          INSERT INTO student_privacy_consents (
            student_id, is_minor, parental_consent_verified, parent_email,
            allow_analytics_tracking, allow_research_inclusion, allow_ai_memory,
            consent_status, parent_verification_status, anonymized_research_id, consent_date, updated_at
          ) VALUES (?, 1, 0, NULL, 0, 0, 0, 'pending', 'unverified', ?, ?, ?)
        `).run(userId, anonId, now, now);

        db.prepare(`
          INSERT INTO cdes_data_governance_consents (
            consent_id, student_id, consent_scope, is_minor, parent_guardian_approved,
            school_administrator_approved, allowed_for_personalization, allowed_for_research_aggregates,
            granted_at, expires_at, revoked_at
          ) VALUES (?, ?, 'pilot_default_pending', 1, 0, 0, 0, 0, ?, ?, NULL)
        `).run(`cons-${crypto.randomUUID()}`, userId, now, new Date(Date.now() + 365 * 86400 * 1000).toISOString());
      }

      db.exec('COMMIT;');
    } catch (err) {
      try {
        db.exec('ROLLBACK;');
      } catch {
        // ignore rollback error
      }
      throw err;
    }

    const user = this.userRepo.findById(userId)!;
    const profile = params.role === 'student' ? this.userRepo.getProfileByUserId(userId) : null;
    const token = this.generateToken(user);
    const { password_hash: _pw, ...safeUser } = user;
    return { user: safeUser, token, profile, education: [] };
  }

  public login(params: { email: string; password: string }): LoginResult {
    const user = this.userRepo.findByEmail(params.email);
    const hashToCheck = user && !user.is_deleted ? user.password_hash : DUMMY_PASSWORD_HASH;
    const isMatch = bcrypt.compareSync(params.password, hashToCheck);
    if (!user || user.is_deleted || !isMatch) {
      throw new Error('Invalid email or password.');
    }

    if (user.status === 'suspended') {
      throw new Error('This account has been suspended. Please contact CDES administration.');
    }

    this.userRepo.updateLastLogin(user.id);
    const profile = this.userRepo.getProfileByUserId(user.id);
    const education = profile ? this.userRepo.getEducationHistory(profile.id) : [];
    const token = this.generateToken(user);
    const { password_hash: _pw, ...safeUser } = user;
    return { user: safeUser, token, profile, education };
  }

  private getCookieOptions(maxAgeMs: number): CookieOptions {
    return {
      httpOnly: true,
      secure: isCookieSecure(),
      sameSite: 'lax',
      maxAge: maxAgeMs,
      path: '/',
    };
  }

  public generateToken(user: UserRecord): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      jti: crypto.randomUUID(),
    };
    return jwt.sign(payload, getJwtSecret(), {
      algorithm: 'HS256',
      expiresIn: getSessionTtlSeconds(),
    });
  }

  public revokeToken(token: string | null | undefined): void {
    if (!token) return;
    try {
      const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] }) as AuthTokenPayload;
      if (decoded.jti) {
        const nowMs = Date.now();
        pruneRevokedTokens(nowMs);
        const expMs = typeof decoded.exp === 'number' ? decoded.exp * 1000 : nowMs + getSessionTtlSeconds() * 1000;
        revokedTokenIds.set(decoded.jti, expMs);
      }
    } catch {
      // Ignore already-invalid/expired tokens during logout
    }
  }

  public verifyToken(token: string): AuthTokenPayload {
    try {
      const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] }) as Partial<AuthTokenPayload>;
      if (
        !decoded ||
        typeof decoded.userId !== 'string' ||
        typeof decoded.email !== 'string' ||
        !['student', 'admin', 'organization', 'mentor'].includes(String(decoded.role))
      ) {
        throw new Error('Malformed token payload.');
      }
      if (decoded.jti) {
        const expMs = revokedTokenIds.get(decoded.jti);
        if (expMs !== undefined) {
          if (expMs > Date.now()) {
            throw new Error('Authentication token has been revoked.');
          }
          revokedTokenIds.delete(decoded.jti);
        }
      }
      return decoded as AuthTokenPayload;
    } catch {
      throw new Error('Invalid or expired authentication token.');
    }
  }

  public getCurrentUser(userId: string): Omit<UserRecord, 'password_hash'> | null {
    const user = this.userRepo.findById(userId);
    if (!user || user.is_deleted) return null;
    const { password_hash: _pw, ...safeUser } = user;
    return safeUser;
  }

  public getSessionDetails(userId: string): {
    user: Omit<UserRecord, 'password_hash'>;
    profile: StudentProfileRecord | null;
    education: EducationHistoryRecord[];
  } | null {
    const user = this.getCurrentUser(userId);
    if (!user) return null;
    const profile = this.userRepo.getProfileByUserId(userId);
    const education = profile ? this.userRepo.getEducationHistory(profile.id) : [];
    return { user, profile, education };
  }

  public setAuthCookie(res: Response, token: string): void {
    res.cookie('cdes_jwt', token, this.getCookieOptions(getSessionTtlSeconds() * 1000));
  }

  public clearAuthCookie(res: Response): void {
    res.clearCookie('cdes_jwt', {
      httpOnly: true,
      secure: isCookieSecure(),
      sameSite: 'lax',
      path: '/',
    });
  }
}
