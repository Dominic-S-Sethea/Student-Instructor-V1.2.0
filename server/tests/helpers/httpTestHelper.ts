import { mkdtempSync, rmSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { closeDatabase, getDatabase } from '../../db/connection';
import { runMigrations } from '../../db/migrate';
import { createApp } from '../../app';
import type { AdvisorProvider } from '../../routes/advisorRoutes';

export interface TestServerContext {
  server: http.Server;
  baseUrl: string;
  workDir: string;
  jwtSecret: string;
  close: () => Promise<void>;
  cleanup: () => Promise<void>;
}

export interface StartTestServerOptions {
  prefix?: string;
  disableRateLimit?: boolean;
  seedCatalog?: boolean;
  seedDemo?: boolean;
  nodeEnv?: string;
  frontendOrigin?: string;
  advisorProvider?: AdvisorProvider | null;
}

export async function startTestServer(options?: StartTestServerOptions): Promise<TestServerContext> {
  const prefix = options?.prefix ?? 'cdes-test-';
  process.env.NODE_ENV = options?.nodeEnv ?? 'development';
  process.env.GEMINI_API_KEY = '';
  const jwtSecret = `test-jwt-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  process.env.JWT_SECRET = jwtSecret;
  const workDir = mkdtempSync(join(tmpdir(), prefix));
  process.env.DATABASE_PATH = join(workDir, 'test.db');

  runMigrations({
    seedCatalog: options?.seedCatalog ?? true,
    seedDemo: options?.seedDemo ?? false,
  });

  const app = createApp({
    serveStatic: false,
    disableRateLimit: options?.disableRateLimit ?? true,
    frontendOrigin: options?.frontendOrigin,
    advisorProvider: options?.advisorProvider,
  });
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as { port: number }).port;

  const close = async (): Promise<void> => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    closeDatabase();
    rmSync(workDir, { recursive: true, force: true });
  };

  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`,
    workDir,
    jwtSecret,
    close,
    cleanup: close,
  };
}

export async function createPhaseTestServer(
  prefix: string,
  options?: Omit<StartTestServerOptions, 'prefix'>
): Promise<TestServerContext> {
  return startTestServer({ ...options, prefix });
}

export function createTestUser(params: {
  id: string;
  email: string;
  role: 'student' | 'organization' | 'admin';
  name?: string;
  password?: string;
  jwtSecret: string;
}): { token: string; password: string } {
  const db = getDatabase();
  const now = new Date().toISOString();
  const password = params.password ?? `Pass!${Date.now()}`;
  const hash = bcrypt.hashSync(password, 8);
  db.prepare(
    'INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(params.id, params.email, hash, params.role, 'active', now, now);

  if (params.role === 'student') {
    db.prepare(
      'INSERT INTO student_profiles (id, user_id, name, education_level, language, interests, favorite_subjects, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      `prof-${params.id}`,
      params.id,
      params.name ?? 'Test Student',
      'Grade 12',
      'en',
      '[]',
      '[]',
      now,
      now
    );
  }

  const token = jwt.sign(
    { userId: params.id, email: params.email, role: params.role },
    params.jwtSecret,
    { algorithm: 'HS256' }
  );
  return { token, password };
}

export async function bootstrapCsrf(
  baseUrl: string,
  jwtToken?: string
): Promise<{ cookie: string; csrf: string }> {
  const headers: Record<string, string> = {};
  if (jwtToken) headers.Cookie = `cdes_jwt=${jwtToken}`;
  const res = await fetch(`${baseUrl}/api/auth/csrf`, { headers });
  const setCookie =
    (res.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.() || [];
  const cookies = setCookie.map((c) => c.split(';')[0]);
  if (jwtToken) cookies.push(`cdes_jwt=${jwtToken}`);
  return {
    cookie: cookies.join('; '),
    csrf: res.headers.get('X-CSRF-Token') || '',
  };
}

export interface LoggedInTestClient {
  userId: string;
  email: string;
  role: 'student' | 'organization' | 'admin';
  cookieHeader: () => string;
  request: (
    method: string,
    path: string,
    body?: unknown
  ) => Promise<{ status: number; json: Record<string, unknown>; text: string; headers: Headers }>;
}

function getSetCookieHeaders(res: Response): string[] {
  return (res.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.() || [];
}

export async function createUserAndLogin(
  baseUrl: string,
  userId: string,
  email: string,
  role: 'student' | 'organization' | 'admin'
): Promise<LoggedInTestClient> {
  const password = `SecurePass!${userId}`;
  createTestUser({
    id: userId,
    email,
    role,
    password,
    jwtSecret: process.env.JWT_SECRET || 'fallback-test-secret',
  });

  const cookieJar = new Map<string, string>();
  const absorbCookies = (res: Response): void => {
    for (const raw of getSetCookieHeaders(res)) {
      const [pair] = raw.split(';');
      const eq = pair.indexOf('=');
      if (eq > 0) cookieJar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }
  };
  const cookieHeader = (): string =>
    Array.from(cookieJar.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');

  const csrfInit = await fetch(`${baseUrl}/api/auth/csrf`);
  absorbCookies(csrfInit);
  let csrfToken = csrfInit.headers.get('X-CSRF-Token') || '';

  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader(),
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify({ email, password }),
  });
  if (!loginRes.ok) {
    throw new Error(`Test login failed for ${email}: ${loginRes.status} ${await loginRes.text()}`);
  }
  absorbCookies(loginRes);

  const csrfAuth = await fetch(`${baseUrl}/api/auth/csrf`, {
    headers: { Cookie: cookieHeader() },
  });
  absorbCookies(csrfAuth);
  csrfToken = csrfAuth.headers.get('X-CSRF-Token') || csrfToken;

  return {
    userId,
    email,
    role,
    cookieHeader,
    request: async (method: string, path: string, body?: unknown) => {
      const headers: Record<string, string> = { Cookie: cookieHeader() };
      if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
        headers['X-CSRF-Token'] = csrfToken;
      }
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      absorbCookies(res);
      const text = await res.text();
      let json: Record<string, unknown> = {};
      try {
        const parsed = JSON.parse(text);
        json = typeof parsed === 'object' && parsed !== null ? parsed : { value: parsed };
      } catch {
        json = {};
      }
      return { status: res.status, json, text, headers: res.headers };
    },
  };
}
