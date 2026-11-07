import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRepository, UserRecord } from '../repositories/userRepository';

let jwtSecretCache: string | undefined = undefined;
export function getJwtSecret(): string {
  if (jwtSecretCache === undefined) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    jwtSecretCache = secret;
  }
  return jwtSecretCache;
}
const JWT_EXPIRES_IN = '7d';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: 'student' | 'admin' | 'organization' | 'mentor';
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
  }): { user: Omit<UserRecord, 'password_hash'>; token: string } {
    const existing = this.userRepo.findByEmail(params.email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    if (params.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const password_hash = bcrypt.hashSync(params.password, 10);
    const user = this.userRepo.createUser({
      email: params.email,
      password_hash,
      role: params.role,
      status: 'active'
    });

    if (params.role === 'student') {
      this.userRepo.createOrUpdateProfile({
        user_id: user.id,
        name: params.name,
        education_level: params.education_level || 'Grade 12'
      });
    }

    const token = this.generateToken(user);
    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  public login(params: {
    email: string;
    password: string;
  }): { user: Omit<UserRecord, 'password_hash'>; token: string } {
    const user = this.userRepo.findByEmail(params.email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = bcrypt.compareSync(params.password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    if (user.status === 'suspended') {
      throw new Error('This account has been suspended. Please contact CDES administration.');
    }

    this.userRepo.updateLastLogin(user.id);
    const token = this.generateToken(user);
    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  /** HttpOnly cookie configuration for JWT storage */
  private readonly COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: Number(process.env.JWT_EXPIRES_IN || "86400") * 1000, // 24h default
    path: "/",
  };

  public generateToken(user: UserRecord): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
  }

  public verifyToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
    } catch {
      throw new Error('Invalid or expired authentication token.');
    }
  }

  public getCurrentUser(userId: string): Omit<UserRecord, 'password_hash'> | null {
    const user = this.userRepo.findById(userId);
    if (!user) return null;
    const { password_hash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Set JWT as httpOnly cookie (no token returned in response body)
   */
  public setAuthCookie(res: any, token: string): void {
    res.cookie("cdes_jwt", token, this.COOKIE_OPTIONS);
  }

  /**
   * Clear JWT cookie (logout)
   */
  public clearAuthCookie(res: any): void {
    res.cookie("cdes_jwt", "", {
      ...this.COOKIE_OPTIONS,
      maxAge: 0,
    });
  }
}
