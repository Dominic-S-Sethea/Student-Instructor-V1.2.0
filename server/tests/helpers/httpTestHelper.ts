import { mkdtempSync, rmSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { closeDatabase, getDatabase } from '../../db/connection';
import { runMigrations } from '../../db/migrate';
import { createApp } from '../../app';

export interface TestServerContext {
  server: http.Server;
  baseUrl: string;
  workDir: string;
  jwtSecret: string;
  close: () => Promise<void>;
}

export async function startTestServer(options?: {
  prefix?: string;
  disableRateLimit?: boolean;
  seedCatalog?: boolean;
  seedDemo?: boolean;
  nodeEnv?: string;
}): Promise<TestServerContext> {
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
  });
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as { port: number }).port;

  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`,
    workDir,
    jwtSecret,
    close: async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      closeDatabase();
      rmSync(workDir, { recursive: true, force: true });
    },
  };
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
