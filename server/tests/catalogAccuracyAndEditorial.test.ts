import assert from 'node:assert';
import { mkdtempSync, rmSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { closeDatabase, getDatabase } from '../db/connection';
import { runMigrations } from '../db/migrate';
import { ScholarshipRepository } from '../repositories/scholarshipRepository';
import { UniversityRepository } from '../repositories/universityRepository';
import { createApp } from '../app';

async function apiJson(
  baseUrl: string,
  method: string,
  path: string,
  token?: string,
  body?: unknown
): Promise<{ status: number; json: Record<string, unknown> }> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: (await res.json().catch(() => ({}))) as Record<string, unknown> };
}

async function run(): Promise<void> {
  process.env.NODE_ENV = 'development';
  process.env.GEMINI_API_KEY = '';
  process.env.JWT_SECRET = `test-jwt-cat-${Date.now()}`;
  const workDir = mkdtempSync(join(tmpdir(), 'cdes-cat-'));
  process.env.DATABASE_PATH = join(workDir, 'cat.db');

  const app = createApp({ serveStatic: false, disableRateLimit: true });
  const server = http.createServer(app);

  try {
    runMigrations({ seedCatalog: true, seedDemo: false });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const port = (server.address() as { port: number }).port;
    const baseUrl = `http://127.0.0.1:${port}`;

    const db = getDatabase();
    const now = new Date().toISOString();
    const hash = bcrypt.hashSync(`Pwd-${Date.now()}!`, 10);
    const seedUser = (id: string, email: string, role: string) => {
      db.prepare('INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, email, hash, role, 'active', now, now);
      return jwt.sign({ userId: id, email, role }, process.env.JWT_SECRET!);
    };
    const studentToken = seedUser('usr-stu-cat', 'stu.cat@cdes.test', 'student');
    const orgToken = seedUser('usr-org-cat', 'org.cat@cdes.test', 'organization');
    const adminToken = seedUser('usr-adm-cat', 'adm.cat@cdes.test', 'admin');

    // 1. Missing funding / $0 stipend / excluded insurance / expired deadline accuracy
    const schRepo = new ScholarshipRepository();
    schRepo.create({
      id: 'sch-missing-test',
      name: 'Missing Package Grant',
      nameKm: 'អាហារូបករណ៍សាកល្បង',
      provider: 'Test Foundation',
      country: 'Cambodia',
      region: 'Cambodia',
      deadline: '2020-01-01',
      is_verified: 0,
      verification_tier: 'unverified',
    });
    schRepo.create({
      id: 'sch-zero-excluded',
      name: 'Zero Stipend No Insurance',
      provider: 'Test Institute',
      country: 'Cambodia',
      region: 'Cambodia',
      monthlyStipendUsd: 0,
      coversHealthInsurance: false,
      deadline: '2028-05-01',
      is_verified: 1,
    });
    schRepo.create({
      id: 'sch-range-stipend',
      name: 'Range Stipend Grant',
      provider: 'Test Range Org',
      country: 'Cambodia',
      region: 'Cambodia',
      monthlyAllowance: '$1,200 - $1,500/month',
      deadline: '2028-06-01',
      is_verified: 1,
    });
    const rangeRow = db.prepare('SELECT monthly_stipend_usd FROM scholarship_funding WHERE scholarship_id = ?').get('sch-range-stipend') as { monthly_stipend_usd: number | null };
    assert.strictEqual(rangeRow.monthly_stipend_usd, null);
    const rangeRes = await apiJson(baseUrl, 'GET', '/api/scholarships/sch-range-stipend');
    assert.strictEqual((rangeRes.json.scholarship as Record<string, unknown>).monthlyAllowance, '$1,200 - $1,500/month');

    const missingRes = await apiJson(baseUrl, 'GET', '/api/scholarships/sch-missing-test');
    assert.strictEqual(missingRes.status, 200);
    const missingItem = missingRes.json.scholarship as Record<string, unknown>;
    assert.strictEqual(missingItem.monthlyAllowance, 'Not specified');
    assert.strictEqual(missingItem.monthlyAllowanceKm, 'មិនបានបញ្ជាក់');
    assert.strictEqual(missingItem.insurance, 'Not specified');
    assert.strictEqual(missingItem.totalEstimatedValueUSD, null);
    assert.strictEqual(missingItem.deadlineStatus, 'expired');
    assert(Number(missingItem.daysRemaining) < 0);
    assert.strictEqual(missingItem.lastVerifiedDate, null);

    const zeroRes = await apiJson(baseUrl, 'GET', '/api/scholarships/sch-zero-excluded');
    const zeroItem = zeroRes.json.scholarship as Record<string, unknown>;
    assert.strictEqual(zeroItem.monthlyAllowance, '$0/month');
    assert.strictEqual(zeroItem.monthlyAllowanceKm, '០ ដុល្លារ/ខែ');
    assert.strictEqual(zeroItem.insurance, 'Not included');
    assert.strictEqual(zeroItem.insuranceKm, 'មិនរួមបញ្ចូល');

    // 2. Khmer search round-trip + no PII search logging
    const kmSearch = await apiJson(baseUrl, 'GET', `/api/scholarships?q=${encodeURIComponent('អាហារូបករណ៍សាកល្បង')}`);
    assert.strictEqual(kmSearch.status, 200);
    assert.strictEqual((kmSearch.json.scholarships as Array<{ id: string }>)[0]?.id, 'sch-missing-test');
    const searchLogCount = (db.prepare('SELECT COUNT(*) AS c FROM search_keywords_log').get() as { c: number }).c;
    assert.strictEqual(searchLogCount, 0, 'Public searches must not persist search keywords');

    // 3. University missing accreditation must never default to Fully Accredited
    const univRepo = new UniversityRepository();
    univRepo.createUniversity({
      id: 'univ-unverified-test',
      abbr: 'UUT',
      name: 'Unknown Accreditation College',
      location: 'Takeo',
      type: 'Private',
      accreditation_status: null,
    });
    const univRes = await apiJson(baseUrl, 'GET', '/api/universities/univ-unverified-test');
    assert.strictEqual(univRes.status, 200);
    const acc = (univRes.json.data as { accreditation: { status: string; isKnown: boolean; agency: null | string } }).accreditation;
    assert.strictEqual(acc.status, 'Not specified');
    assert.strictEqual(acc.isKnown, false);
    assert.strictEqual(acc.agency, null);

    // 4. check-updates must not alter deadlines or create fake CRAWLER_DEADLINE_UPDATE history
    const checkRes = await apiJson(baseUrl, 'POST', '/api/scholarships/check-updates', adminToken, {
      scholarshipId: 'sch-zero-excluded',
    });
    assert.strictEqual(checkRes.status, 200);
    assert.strictEqual(checkRes.json.changesDetected, 0);
    const fakeHistory = db
      .prepare("SELECT COUNT(*) AS c FROM change_history WHERE entity_id = 'sch-zero-excluded' AND action = 'CRAWLER_DEADLINE_UPDATE'")
      .get() as { c: number };
    assert.strictEqual(fakeHistory.c, 0);

    // 5. RBAC, atomic idempotent editorial review, 409 conflict & rejection isolation
    const stuSubmit = await apiJson(baseUrl, 'POST', '/api/scholarships/submit', studentToken, {
      organizationName: 'Unauthorized Org',
      contactEmail: 's@cdes.test',
      scholarshipName: 'Blocked',
    });
    assert.strictEqual(stuSubmit.status, 403);

    const orgSub = await apiJson(baseUrl, 'POST', '/api/scholarships/submit', orgToken, {
      organizationName: 'Khmer Tech Foundation',
      contactEmail: 'grants@ktf.org.kh',
      scholarshipName: 'KTF Digital Fellowship 2027',
      scholarshipNameKm: 'អាហារូបករណ៍ឌីជីថល KTF',
      deadline: '2027-06-30',
      officialSourceUrl: 'https://ktf.org.kh/fellowship',
    });
    assert.strictEqual(orgSub.status, 201);
    const subId = String((orgSub.json.submission as { id: string }).id);

    // Pending submission must NOT appear in catalog yet
    const prePubSearch = await apiJson(baseUrl, 'GET', '/api/scholarships?q=KTF%20Digital%20Fellowship');
    assert.strictEqual((prePubSearch.json.scholarships as unknown[]).length, 0);

    // Org cannot approve its own submission
    const orgReview = await apiJson(baseUrl, 'PUT', `/api/scholarships/submissions/${subId}`, orgToken, { action: 'approve' });
    assert.strictEqual(orgReview.status, 403);

    // Concurrent admin approvals produce exactly 1 publication
    const [r1, r2] = await Promise.all([
      apiJson(baseUrl, 'PUT', `/api/scholarships/submissions/${subId}`, adminToken, { action: 'approve' }),
      apiJson(baseUrl, 'POST', `/api/scholarships/admin/submissions/${subId}/approve`, adminToken, {}),
    ]);
    assert.strictEqual(r1.status, 200);
    assert.strictEqual(r2.status, 200);
    const pubCount = (db.prepare("SELECT COUNT(*) AS c FROM scholarships WHERE name = 'KTF Digital Fellowship 2027'").get() as { c: number }).c;
    assert.strictEqual(pubCount, 1, 'Concurrent approval must publish exactly once');

    // Opposite decision after approval returns 409 Conflict
    const conflictRes = await apiJson(baseUrl, 'POST', `/api/scholarships/admin/submissions/${subId}/reject`, adminToken, {});
    assert.strictEqual(conflictRes.status, 409);

    // Rejection stays out of public catalog
    const rejSub = await apiJson(baseUrl, 'POST', '/api/scholarships/submit', orgToken, {
      organizationName: 'Unverified Org',
      contactEmail: 'no@unverified.example',
      scholarshipName: 'Rejected Grant 2027',
      deadline: '2027-07-01',
    });
    const rejId = String((rejSub.json.submission as { id: string }).id);
    const rejDecision = await apiJson(baseUrl, 'PUT', `/api/scholarships/submissions/${rejId}`, adminToken, { action: 'reject' });
    assert.strictEqual(rejDecision.status, 200);
    assert.strictEqual(rejDecision.json.publishedScholarship, null);

    // Nonexistent verify returns 404; report resolution records admin email; metrics counts pending only
    const missingVerify = await apiJson(baseUrl, 'POST', '/api/scholarships/nonexistent-sch-id/verify', adminToken, {});
    assert.strictEqual(missingVerify.status, 404);
    const repPost = await apiJson(baseUrl, 'POST', '/api/scholarships/report', studentToken, { scholarshipId: 'sch-zero-excluded', scholarshipName: 'Zero', reportedField: 'deadline', description: 'Check cycle' });
    assert.strictEqual(repPost.status, 200);
    const repId = String((repPost.json.report as { id: string }).id);
    const repResolve = await apiJson(baseUrl, 'PUT', `/api/scholarships/reports/${repId}`, adminToken, { status: 'Verified & Fixed', adminNotes: 'Checked' });
    assert.strictEqual(repResolve.status, 200);
    const repRow = db.prepare('SELECT resolved_by FROM user_error_reports WHERE id = ?').get(repId) as { resolved_by: string };
    assert.strictEqual(repRow.resolved_by, 'adm.cat@cdes.test');
    const adminMetrics = await apiJson(baseUrl, 'GET', '/api/metrics', adminToken);
    assert.strictEqual((adminMetrics.json.database as { counts: { pendingSubmissions: number } }).counts.pendingSubmissions, 0);

    console.log('✓ catalogAccuracyAndEditorial.test.ts passed');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    closeDatabase();
    rmSync(workDir, { recursive: true, force: true });
  }
}

run().catch((err) => {
  console.error('catalogAccuracyAndEditorial.test.ts failed:', err);
  process.exit(1);
});
