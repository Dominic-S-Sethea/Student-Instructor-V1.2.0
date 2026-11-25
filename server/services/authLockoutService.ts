import crypto from 'node:crypto';
import logger from '../middleware/loggingMiddleware';

interface LockoutEntry {
  failures: number;
  lockedUntilMs: number;
  lastAttemptMs: number;
}

const MAX_TRACKED_ACCOUNTS = 5_000;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const SOFT_LOCK_THRESHOLD = 5;
const HARD_LOCK_THRESHOLD = 8;
const SOFT_LOCK_MS = 60 * 1000;
const HARD_LOCK_MS = 300 * 1000;

function hashIdentifier(email: string): string {
  return crypto.createHash('sha256').update(email).digest('hex').slice(0, 12);
}

export class AuthLockoutService {
  private readonly entries = new Map<string, LockoutEntry>();

  private normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  private prune(nowMs: number): void {
    for (const [key, entry] of this.entries.entries()) {
      if (entry.lockedUntilMs <= nowMs && nowMs - entry.lastAttemptMs > FAILURE_WINDOW_MS) {
        this.entries.delete(key);
      }
    }
    while (this.entries.size >= MAX_TRACKED_ACCOUNTS) {
      let oldestKey: string | undefined;
      for (const [key, entry] of this.entries.entries()) {
        if (entry.lockedUntilMs <= nowMs) {
          oldestKey = key;
          break;
        }
      }
      if (oldestKey === undefined) {
        oldestKey = this.entries.keys().next().value;
      }
      if (oldestKey === undefined) break;
      this.entries.delete(oldestKey);
    }
  }

  public getLockoutSeconds(email: string, nowMs = Date.now()): number {
    const key = this.normalize(email);
    if (!key) return 0;
    const entry = this.entries.get(key);
    if (!entry) return 0;
    if (entry.lockedUntilMs > nowMs) {
      return Math.max(1, Math.ceil((entry.lockedUntilMs - nowMs) / 1000));
    }
    if (nowMs - entry.lastAttemptMs > FAILURE_WINDOW_MS) {
      this.entries.delete(key);
    }
    return 0;
  }

  public recordFailure(email: string, ip?: string, nowMs = Date.now()): { locked: boolean; retryAfterSeconds: number } {
    const key = this.normalize(email);
    if (!key) return { locked: false, retryAfterSeconds: 0 };
    this.prune(nowMs);

    const prev = this.entries.get(key);
    const failures =
      prev && nowMs - prev.lastAttemptMs <= FAILURE_WINDOW_MS ? prev.failures + 1 : 1;

    let lockedUntilMs = prev?.lockedUntilMs ?? 0;
    if (failures >= HARD_LOCK_THRESHOLD) {
      lockedUntilMs = nowMs + HARD_LOCK_MS;
    } else if (failures >= SOFT_LOCK_THRESHOLD) {
      lockedUntilMs = nowMs + SOFT_LOCK_MS;
    }

    this.entries.set(key, { failures, lockedUntilMs, lastAttemptMs: nowMs });
    const retryAfterSeconds = lockedUntilMs > nowMs ? Math.ceil((lockedUntilMs - nowMs) / 1000) : 0;

    if (retryAfterSeconds > 0) {
      logger.warn('SECURITY_LOGIN_LOCKOUT', {
        emailHash: hashIdentifier(key),
        ip: ip || 'unknown',
        failures,
        retryAfterSeconds,
      });
    }
    return { locked: retryAfterSeconds > 0, retryAfterSeconds };
  }

  public recordSuccess(email: string): void {
    const key = this.normalize(email);
    if (key) this.entries.delete(key);
  }

  public reset(): void {
    this.entries.clear();
  }
}

export const authLockoutService = new AuthLockoutService();
