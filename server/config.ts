import dotenv from 'dotenv';
import path from 'node:path';
import crypto from 'node:crypto';

const ephemeralResearchSalt = crypto.randomBytes(32).toString('hex');

/**
 * Resolves the research pseudonymization salt without a hardcoded literal secret.
 * Prefers RESEARCH_SALT, falls back to an HMAC derived from JWT_SECRET, or per-process entropy.
 */
export function getResearchSalt(): string {
  const explicit = process.env.RESEARCH_SALT;
  if (explicit && explicit.trim() !== '') {
    return explicit.trim();
  }
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.trim() !== '') {
    return crypto.createHmac('sha256', jwtSecret.trim()).update('cdes-research-salt-v1').digest('hex');
  }
  return ephemeralResearchSalt;
}

export interface AppConfig {
  nodeEnv: string;
  isProduction: boolean;
  isStaging: boolean;
  port: number;
  host: string;
  databasePath: string;
  frontendOrigin: string;
  jwtExpiresInSeconds: number;
  geminiApiKey: string;
  seedDemoData: boolean;
  cookieSecure: boolean;
  dbAssetsDir?: string;
  publicDistDir?: string;
}

/** Determine whether auth/CSRF cookies should set the Secure flag. */
export function isCookieSecure(): boolean {
  const override = (process.env.COOKIE_SECURE || '').trim().toLowerCase();
  if (override === 'false') return false;
  if (override === 'true') return true;
  return process.env.NODE_ENV === 'production';
}

let envLoaded = false;

/** Parse duration strings like '86400', '24h', '7d', '30m' into positive seconds. */
export function parseDurationSeconds(raw: string | undefined, fallbackSeconds: number = 86400): number {
  if (!raw || !raw.trim()) {
    return fallbackSeconds;
  }
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) {
    const num = Number(trimmed);
    return Number.isFinite(num) && num > 0 ? num : fallbackSeconds;
  }
  const match = trimmed.match(/^(\d+)\s*([smhd])$/i);
  if (!match) {
    return fallbackSeconds;
  }
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
  const total = value * multiplier;
  return Number.isFinite(total) && total > 0 ? total : fallbackSeconds;
}

/** Load environment configuration lazily without opening database or binding ports. */
export function loadConfig(): AppConfig {
  if (!envLoaded) {
    dotenv.config();
    envLoaded = true;
  }

  const nodeEnv = process.env.NODE_ENV || 'development';
  const portRaw = Number(process.env.PORT);
  const port = Number.isInteger(portRaw) && portRaw > 0 && portRaw <= 65535 ? portRaw : 3000;
  const defaultDbPath = path.join(process.cwd(), 'server', 'data', 'cdes_platform.db');

  return {
    nodeEnv,
    isProduction: nodeEnv === 'production',
    isStaging: nodeEnv === 'staging',
    port,
    host: process.env.HOST || '0.0.0.0',
    databasePath: process.env.DATABASE_PATH || defaultDbPath,
    frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    jwtExpiresInSeconds: parseDurationSeconds(process.env.JWT_EXPIRES_IN, 86400),
    geminiApiKey: (process.env.GEMINI_API_KEY || '').trim(),
    seedDemoData: process.env.SEED_DEMO_DATA === 'true',
    cookieSecure: isCookieSecure(),
    dbAssetsDir: process.env.DB_ASSETS_DIR || undefined,
    publicDistDir: process.env.PUBLIC_DIST_DIR || undefined,
  };
}
