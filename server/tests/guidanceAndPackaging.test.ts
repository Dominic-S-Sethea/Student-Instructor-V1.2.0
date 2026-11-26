import assert from 'node:assert';
import { mkdtempSync, rmSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { closeDatabase, getDatabase } from '../db/connection';
import { runMigrations } from '../db/migrate';
import { createApp } from '../app';
import type { AdvisorProvider } from '../routes/advisorRoutes';

async function startTestApp(advisorProvider?: AdvisorProvider | null, advisorTimeoutMs?: number) {
  const app = createApp({
    serveStatic: false,
    disableRateLimit: true,
    advisorProvider,
    advisorTimeoutMs,
  });
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as { port: number }).port;
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

async function bootstrapAnonCsrf(baseUrl: string): Promise<{ cookie: string; csrf: string }> {
  const res = await fetch(`${baseUrl}/api/auth/csrf`);
  const setCookie = (res.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.() || [];
  const cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
  const csrf = res.headers.get('X-CSRF-Token') || '';
  return { cookie, csrf };
}

async function run(): Promise<void> {
  process.env.NODE_ENV = 'development';
  process.env.GEMINI_API_KEY = '';
  process.env.JWT_SECRET = `test-jwt-guid-${Date.now()}`;
  const workDir = mkdtempSync(join(tmpdir(), 'cdes-guid-'));
  process.env.DATABASE_PATH = join(workDir, 'guid.db');

  runMigrations({ seedCatalog: true, seedDemo: false });
  const db = getDatabase();
  const now = new Date().toISOString();
  const hash = bcrypt.hashSync(`G#idPass-${Date.now()}`, 10);
  db.prepare('INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    'usr-guid-adm', 'adm.guid@cdes.test', hash, 'admin', 'active', now, now
  );
  db.prepare('INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    'usr-guid-stu', 'stu.guid@cdes.test', hash, 'student', 'active', now, now
  );
  db.prepare('INSERT INTO student_profiles (id, user_id, name, education_level, language, interests, favorite_subjects, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    'stu-guid-1', 'usr-guid-stu', 'Bench Student', 'Grade 12', 'km', '[]', '[]', now, now
  );

  const adminToken = jwt.sign({ userId: 'usr-guid-adm', email: 'adm.guid@cdes.test', role: 'admin' }, process.env.JWT_SECRET!);
  const studentToken = jwt.sign({ userId: 'usr-guid-stu', email: 'stu.guid@cdes.test', role: 'student' }, process.env.JWT_SECRET!);

  // 1. Offline mode (provider unset) + 404 JSON + admin-gated metrics + workload benchmark
  const { server, baseUrl } = await startTestApp(undefined, 150);
  try {
    const anon = await bootstrapAnonCsrf(baseUrl);
    const advRes = await fetch(`${baseUrl}/api/advisor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: anon.cookie, 'X-CSRF-Token': anon.csrf },
      body: JSON.stringify({ userPrompt: 'What STEM scholarships match CADT?' }),
    });
    assert.strictEqual(advRes.status, 200);
    const advJson = (await advRes.json()) as { mode: string; providerStatus: string; isEstimate: boolean; unavailableData: string[] };
    assert.strictEqual(advJson.mode, 'deterministic_offline');
    assert.strictEqual(advJson.providerStatus, 'disabled');
    assert.strictEqual(advJson.isEstimate, true);
    assert(advJson.unavailableData.includes('external_llm_provider'));

    const decRes = await fetch(`${baseUrl}/api/decision/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: anon.cookie, 'X-CSRF-Token': anon.csrf },
      body: JSON.stringify({ interests: ['Technology'], mathAbility: 'confident', strengths: ['Logic'], budgetTier: 'scholarship_dependent' }),
    });
    assert.strictEqual(decRes.status, 200);
    const decJson = (await decRes.json()) as { mode: string; isEstimate: boolean; unavailableData: string[]; sources: string[] };
    assert.strictEqual(decJson.mode, 'rule_based');
    assert.strictEqual(decJson.isEstimate, true);
    assert(decJson.sources.length > 0 && decJson.unavailableData.length > 0);

    // Unknown /api/* route must return JSON 404
    const notFoundRes = await fetch(`${baseUrl}/api/nonexistent-pilot-check`);
    assert.strictEqual(notFoundRes.status, 404);
    assert((notFoundRes.headers.get('content-type') || '').includes('application/json'));

    // Metrics endpoints must be admin-gated
    assert.strictEqual((await fetch(`${baseUrl}/api/metrics`)).status, 401);
    assert.strictEqual((await fetch(`${baseUrl}/api/metrics`, { headers: { Authorization: `Bearer ${studentToken}` } })).status, 403);
    assert.strictEqual((await fetch(`${baseUrl}/api/metrics/sqlite`, { headers: { Authorization: `Bearer ${studentToken}` } })).status, 403);

    // Synthetic mixed workload benchmark (50 reads + 20 profile updates)
    const readTasks = Array.from({ length: 50 }, () =>
      fetch(`${baseUrl}/api/scholarships`).then((r) => assert.strictEqual(r.status, 200))
    );
    const writeTasks = Array.from({ length: 20 }, (_, i) =>
      fetch(`${baseUrl}/api/users/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${studentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ major: `Computer Science Cycle ${i}` }),
      }).then((r) => assert.strictEqual(r.status, 200))
    );
    await Promise.all([...readTasks, ...writeTasks]);

    const metricsRes = await fetch(`${baseUrl}/api/metrics`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert.strictEqual(metricsRes.status, 200);
    const metricsJson = (await metricsRes.json()) as {
      database: { tablesCount: number; sqlite: { writeOps: number; busyTimeoutRetries: number; writerMax: number } };
      http: { totalRequests: number; errors5xx: number; p50Ms: number; p95Ms: number };
    };
    assert(metricsJson.database.tablesCount >= 90);
    assert(metricsJson.http.totalRequests >= 70);
    assert.strictEqual(metricsJson.http.errors5xx, 0);
    console.log(
      `[BENCHMARK] requests=${metricsJson.http.totalRequests} p50=${metricsJson.http.p50Ms}ms p95=${metricsJson.http.p95Ms}ms writeOps=${metricsJson.database.sqlite.writeOps} writerMax=${metricsJson.database.sqlite.writerMax} busyRetries=${metricsJson.database.sqlite.busyTimeoutRetries}`
    );
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  // 2. Provider timeout stub -> 504 (never 200 personalized advice)
  const slowStub: AdvisorProvider = {
    async generateReply() {
      await new Promise((r) => setTimeout(r, 400));
      return { text: 'late', model: 'stub' };
    },
  };
  const timeoutSrv = await startTestApp(slowStub, 80);
  try {
    const anonT = await bootstrapAnonCsrf(timeoutSrv.baseUrl);
    const res504 = await fetch(`${timeoutSrv.baseUrl}/api/advisor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: anonT.cookie, 'X-CSRF-Token': anonT.csrf },
      body: JSON.stringify({ userPrompt: 'Test timeout fail-closed' }),
    });
    assert.strictEqual(res504.status, 504);
    const j504 = (await res504.json()) as { success: boolean; code: string };
    assert.strictEqual(j504.success, false);
    assert.strictEqual(j504.code, 'PROVIDER_TIMEOUT');
  } finally {
    await new Promise<void>((resolve) => timeoutSrv.server.close(() => resolve()));
  }

  // 3. Provider transport failure -> 503
  const errStub: AdvisorProvider = {
    async generateReply() {
      throw new Error('Upstream connection reset');
    },
  };
  const errSrv = await startTestApp(errStub, 500);
  try {
    const anonE = await bootstrapAnonCsrf(errSrv.baseUrl);
    const res503 = await fetch(`${errSrv.baseUrl}/api/advisor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: anonE.cookie, 'X-CSRF-Token': anonE.csrf },
      body: JSON.stringify({ userPrompt: 'Test error fail-closed' }),
    });
    assert.strictEqual(res503.status, 503);
    const j503 = (await res503.json()) as { success: boolean; code: string };
    assert.strictEqual(j503.success, false);
    assert.strictEqual(j503.code, 'PROVIDER_UNAVAILABLE');
  } finally {
    await new Promise<void>((resolve) => errSrv.server.close(() => resolve()));
    closeDatabase();
    rmSync(workDir, { recursive: true, force: true });
  }

  console.log('✓ guidanceAndPackaging.test.ts passed');
}

run().catch((err) => {
  console.error('guidanceAndPackaging.test.ts failed:', err);
  process.exit(1);
});
