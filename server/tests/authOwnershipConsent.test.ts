import assert from 'node:assert';
import { mkdtempSync, rmSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';
import { closeDatabase, getDatabase } from '../db/connection';
import { runMigrations } from '../db/migrate';
import { createApp } from '../app';

class CookieSessionClient {
  private cookies = new Map<string, string>();
  public csrfToken = '';
  constructor(private readonly baseUrl: string) {}

  private cookieHeader(): string {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  public async request(method: string, path: string, body?: unknown, extraHeaders: Record<string, string> = {}) {
    const headers: Record<string, string> = { Accept: 'application/json', ...extraHeaders };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const cookieStr = this.cookieHeader();
    if (cookieStr) headers['Cookie'] = cookieStr;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && this.csrfToken && !('X-CSRF-Token' in extraHeaders)) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const getSetCookie = (res.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie;
    const rawCookies = typeof getSetCookie === 'function' ? getSetCookie.call(res.headers) : [];
    for (const raw of rawCookies) {
      const [pair] = raw.split(';');
      const eq = pair.indexOf('=');
      if (eq > 0) {
        const name = pair.slice(0, eq).trim();
        const val = pair.slice(eq + 1).trim();
        if (!val || raw.includes('Max-Age=0')) this.cookies.delete(name);
        else this.cookies.set(name, val);
      }
    }

    const headerCsrf = res.headers.get('X-CSRF-Token');
    if (headerCsrf) this.csrfToken = headerCsrf;

    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const bodyCsrf = (json?.data as Record<string, unknown> | undefined)?.csrfToken;
    if (typeof bodyCsrf === 'string') this.csrfToken = bodyCsrf;

    return { status: res.status, json };
  }
}

async function run(): Promise<void> {
  process.env.NODE_ENV = 'development';
  process.env.GEMINI_API_KEY = '';
  delete process.env.RESEARCH_SALT;
  process.env.JWT_SECRET = `test-jwt-auth-${Date.now()}`;
  const workDir = mkdtempSync(join(tmpdir(), 'cdes-auth-'));
  process.env.DATABASE_PATH = join(workDir, 'auth.db');

  const app = createApp({ serveStatic: false, disableRateLimit: true });
  const server = http.createServer(app);

  try {
    runMigrations({ seedCatalog: true, seedDemo: false });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const port = (server.address() as { port: number }).port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // Create synthetic admin for research export checks
    const adminPass = `Adm!nPass-${Date.now()}`;
    const adminHash = bcrypt.hashSync(adminPass, 10);
    const now = new Date().toISOString();
    getDatabase().prepare(`
      INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at)
      VALUES ('usr-test-admin', 'admin.test@cdes.edu.kh', ?, 'admin', 'active', ?, ?)
    `).run(adminHash, now, now);

    const studentA = new CookieSessionClient(baseUrl);
    const csrfInit = await studentA.request('GET', '/api/auth/csrf');
    assert.strictEqual(csrfInit.status, 200);
    assert(studentA.csrfToken.length > 10);

    // Invalid CSRF must be rejected
    const badCsrf = await studentA.request(
      'POST',
      '/api/auth/register',
      { email: 'a@cdes.test', password: `Pass-${Date.now()}!`, role: 'student', name: 'Student A' },
      { 'X-CSRF-Token': 'tampered-token' }
    );
    assert.strictEqual(badCsrf.status, 403);

    // Student A registers, reloads, edits profile, adds education
    const pwA = `StudA-${Date.now()}!`;
    const regA = await studentA.request('POST', '/api/auth/register', {
      email: 'student.a@cdes.test',
      password: pwA,
      role: 'student',
      name: 'Student Alpha',
      education_level: 'Grade 12',
    });
    assert.strictEqual(regA.status, 201);
    const idA = String((regA.json.data as { user: { id: string } }).user.id);

    const updA = await studentA.request('PUT', '/api/users/profile', {
      school: 'Sisowath High School',
      major: 'Computer Science',
      location: 'Phnom Penh',
    });
    assert.strictEqual(updA.status, 200);

    const addEdu = await studentA.request('POST', '/api/users/education', {
      institution: 'Sisowath High School',
      degree: 'Grade 12 Science Track',
    });
    assert.strictEqual(addEdu.status, 201);

    const reloadA = await studentA.request('GET', '/api/auth/session');
    assert.strictEqual(reloadA.status, 200);
    const sessDataA = reloadA.json.data as { authenticated: boolean; profile: { major: string }; education: unknown[] };
    assert.strictEqual(sessDataA.authenticated, true);
    assert.strictEqual(sessDataA.profile.major, 'Computer Science');
    assert.strictEqual(sessDataA.education.length, 1);

    // Fresh student consent defaults must be pending/unverified and disabled
    const consentA = await studentA.request('GET', '/api/privacy/consent');
    const cData = consentA.json.data as { consentStatus: string; parentalConsentVerified: boolean; allowAnalyticsTracking: boolean; allowAiMemory: boolean };
    assert.strictEqual(cData.consentStatus, 'pending');
    assert.strictEqual(cData.parentalConsentVerified, false);
    assert.strictEqual(cData.allowAnalyticsTracking, false);
    assert.strictEqual(cData.allowAiMemory, false);

    // Recording guardian email must NOT verify parental consent
    const parentReq = await studentA.request('POST', '/api/privacy/parent-verify', { parentEmail: 'parent.a@cdes.test' });
    assert.strictEqual((parentReq.json.data as { parentalConsentVerified: boolean }).parentalConsentVerified, false);

    // Analytics & AI memory must not persist while unconsented
    const trackBlocked = await studentA.request('POST', '/api/analytics/track', { eventType: 'page_visit' });
    assert.strictEqual(trackBlocked.status, 200);
    assert.strictEqual(trackBlocked.json.persisted, false);
    const memUnconsented = await studentA.request('GET', '/api/ai/memory');
    assert.strictEqual((memUnconsented.json.memory as { learning_summary: string }).learning_summary, '');
    const insightUnconsented = await studentA.request('GET', '/api/ai/student-insight');
    assert.strictEqual(insightUnconsented.status, 200);
    assert.notStrictEqual(insightUnconsented.json.studentName, 'Vannak Sam');
    assert.strictEqual((insightUnconsented.json.keyStrengths as unknown[]).length, 0);
    assert.strictEqual((insightUnconsented.json.growthAreas as unknown[]).length, 0);

    // Dossier must not fabricate synthetic consented identity
    const dossierA = await studentA.request('GET', '/api/data-platform/student-dossier');
    assert.strictEqual(dossierA.status, 200);
    assert.strictEqual((dossierA.json.data as { is_complete: boolean; consent_status: string }).is_complete, false);
    assert.strictEqual((dossierA.json.data as { consent_status: string }).consent_status, 'pending');

    // Student B isolation check
    const studentB = new CookieSessionClient(baseUrl);
    await studentB.request('GET', '/api/auth/csrf');
    const regB = await studentB.request('POST', '/api/auth/register', {
      email: 'student.b@cdes.test',
      password: `StudB-${Date.now()}!`,
      role: 'student',
      name: 'Student Beta',
    });
    assert.strictEqual(regB.status, 201);
    const idB = String((regB.json.data as { user: { id: string } }).user.id);

    const bProfile = await studentB.request('GET', '/api/users/profile');
    assert.strictEqual((bProfile.json.data as { education: unknown[] }).education.length, 0);
    const bCrossDossier = await studentB.request('GET', `/api/data-platform/student-dossier/${idA}`);
    assert.strictEqual(bCrossDossier.status, 403);
    const bCrossMemory = await studentB.request('GET', `/api/ai/memory?studentId=${encodeURIComponent(idA)}`);
    assert.strictEqual(bCrossMemory.status, 403);
    getDatabase().prepare(`INSERT INTO ai_recommendation_events (id, student_id, recommendation_type, title, description, match_reason, priority_score, status, created_at, updated_at) VALUES ('rec-b-idor', ?, 'learning', 'Lab B', 'Desc', 'Reason', 90, 'given', ?, ?)`).run(idB, now, now);
    const idorFeedback = await studentA.request('POST', '/api/ai/feedback', { recommendationId: 'rec-b-idor', action: 'clicked' });
    assert.strictEqual(idorFeedback.status, 403);

    // Grant then withdraw consent for Student B (non-minor) and check anonymized research export
    await studentB.request('POST', '/api/privacy/consent', {
      isMinor: false,
      allowAnalyticsTracking: true,
      allowResearchInclusion: true,
      allowAiMemory: true,
    });
    const admin = new CookieSessionClient(baseUrl);
    await admin.request('GET', '/api/auth/csrf');
    await admin.request('POST', '/api/auth/login', { email: 'admin.test@cdes.edu.kh', password: adminPass });
    const adminConsent = await admin.request('GET', '/api/privacy/consent');
    assert.strictEqual(adminConsent.status, 200);
    const datasetWithB = await admin.request('GET', '/api/research/anonymized-dataset');
    assert.strictEqual((datasetWithB.json.data as unknown[]).length, 1);

    await studentB.request('POST', '/api/privacy/consent', { withdrawAll: true });
    const datasetAfterWithdraw = await admin.request('GET', '/api/research/anonymized-dataset');
    assert.strictEqual((datasetAfterWithdraw.json.data as unknown[]).length, 0);
    assert.notStrictEqual(idA, idB);

    // Logout invalidates browser cookie session
    await studentA.request('POST', '/api/auth/logout');
    const afterLogout = await studentA.request('GET', '/api/users/profile');
    assert.strictEqual(afterLogout.status, 401);

    // Bearer transition compatibility (no cookie, CSRF-exempt)
    const bearerLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: '', 'X-CSRF-Token': (await new CookieSessionClient(baseUrl).request('GET', '/api/auth/csrf')).json && '' },
    });
    assert.strictEqual(bearerLogin.status, 403); // cookie-less POST without Bearer or CSRF rejected
    const jwt = (await import('jsonwebtoken')).default.sign(
      { userId: idA, email: 'student.a@cdes.test', role: 'student' },
      process.env.JWT_SECRET!
    );
    const bearerProfile = await fetch(`${baseUrl}/api/users/profile`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    assert.strictEqual(bearerProfile.status, 200);

    console.log('✓ authOwnershipConsent.test.ts passed');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    closeDatabase();
    rmSync(workDir, { recursive: true, force: true });
  }
}

run().catch((err) => {
  console.error('authOwnershipConsent.test.ts failed:', err);
  process.exit(1);
});
