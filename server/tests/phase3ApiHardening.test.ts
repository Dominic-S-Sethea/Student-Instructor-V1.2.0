import assert from 'node:assert';
import { getDatabase } from '../db/connection';
import { httpMetricsStore } from '../middleware/httpMetricsMiddleware';
import { PrivacyService } from '../services/privacyService';
import {
  bootstrapCsrf,
  createTestUser,
  startTestServer,
} from './helpers/httpTestHelper';

async function run(): Promise<void> {
  // 1. Live rate limiting on /api/advisor/chat (429 + Retry-After) & UNMATCHED HTTP metrics bucketing
  httpMetricsStore.reset();
  const rlCtx = await startTestServer({ prefix: 'cdes-p3-rl-', disableRateLimit: false });
  try {
    const anon = await bootstrapCsrf(rlCtx.baseUrl);
    for (let i = 0; i < 15; i++) {
      const r = await fetch(`${rlCtx.baseUrl}/api/advisor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: anon.cookie, 'X-CSRF-Token': anon.csrf },
        body: JSON.stringify({ userPrompt: `Question ${i}` }),
      });
      assert.strictEqual(r.status, 200, `Request ${i} should succeed under limit`);
    }
    const limitedRes = await fetch(`${rlCtx.baseUrl}/api/advisor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: anon.cookie, 'X-CSRF-Token': anon.csrf },
      body: JSON.stringify({ userPrompt: 'Question 16 over limit' }),
    });
    assert.strictEqual(limitedRes.status, 429, '16th advisor request within 60s must return 429');
    assert.ok(limitedRes.headers.get('retry-after'), '429 response must include Retry-After header');

    await fetch(`${rlCtx.baseUrl}/api/unknown-probe-alpha`);
    await fetch(`${rlCtx.baseUrl}/api/unknown-probe-beta`);
    const snap = httpMetricsStore.getSnapshot();
    assert.strictEqual(snap.routes['GET /api/unknown-probe-alpha'], undefined);
    assert.strictEqual(snap.routes['GET /api/unknown-probe-beta'], undefined);
    assert.ok((snap.routes['GET UNMATCHED']?.count || 0) >= 2, '404 routes must collapse into UNMATCHED');
  } finally {
    await rlCtx.close();
  }

  // 2. Remaining Phase 3 hardening checks (rate limit disabled for bulk testing)
  const ctx = await startTestServer({ prefix: 'cdes-p3-', disableRateLimit: true });
  try {
    const db = getDatabase();
    const { token: adminToken } = createTestUser({
      id: 'usr-p3-admin', email: 'admin.p3@cdes.test', role: 'admin', jwtSecret: ctx.jwtSecret,
    });
    const { token: tokenA } = createTestUser({
      id: 'usr-p3-stu-a', email: 'stua.p3@cdes.test', role: 'student', name: 'Sokha P3', jwtSecret: ctx.jwtSecret,
    });
    const { token: tokenB } = createTestUser({
      id: 'usr-p3-stu-b', email: 'stub.p3@cdes.test', role: 'student', name: 'Minor B', jwtSecret: ctx.jwtSecret,
    });
    const { token: orgToken } = createTestUser({
      id: 'usr-p3-org', email: 'org.p3@cdes.test', role: 'organization', jwtSecret: ctx.jwtSecret,
    });

    new PrivacyService().updateConsent(
      'usr-p3-stu-a',
      { isMinor: false, allowAnalyticsTracking: true, allowAiMemory: true },
      'admin'
    );
    const anon = await bootstrapCsrf(ctx.baseUrl);
    const baseUrl = ctx.baseUrl;

    // Decision engine UX/UI track must NOT recommend UHS medical school
    const designRes = await fetch(`${baseUrl}/api/decision/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: anon.cookie, 'X-CSRF-Token': anon.csrf },
      body: JSON.stringify({ interests: ['Technology'], mathAbility: 'hates_math', budgetTier: 'low_under_1000' }),
    });
    assert.strictEqual(designRes.status, 200);
    const designJson = (await designRes.json()) as {
      recommendations: { topMajor: string; recommendedUniversities: Array<{ univAbbr: string }> };
    };
    assert.strictEqual(designJson.recommendations.topMajor, 'UX/UI & Digital Product Design');
    const abbrs = designJson.recommendations.recommendedUniversities.map((u) => u.univAbbr);
    assert.ok(!abbrs.includes('UHS'), 'UX/UI Design recommendation must never route to UHS Medical School');
    assert.ok(abbrs.includes('CADT'), 'UX/UI Design should recommend CADT');

    // Digital World companion isolation & real game telemetry persistence
    const secretMarker = 'PRIVATE_SOKHA_GOAL_999';
    const compRes = await fetch(`${baseUrl}/api/digital-world/companion/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ message: `Remember ${secretMarker}` }),
    });
    assert.strictEqual(compRes.status, 200);

    const overviewRes = await fetch(`${baseUrl}/api/digital-world/overview`);
    assert.strictEqual(overviewRes.status, 200);
    assert.ok(!(await overviewRes.text()).includes(secretMarker), 'Public /overview must never leak companion dialogue');

    const telemRes = await fetch(`${baseUrl}/api/digital-world/game-telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ gameKey: 'quantum_stem_lab', eventType: 'level_cleared', posteriorProbability: 0.91 }),
    });
    assert.strictEqual(telemRes.status, 200);
    const telemJson = (await telemRes.json()) as { persisted: boolean; data: { id: string } };
    assert.strictEqual(telemJson.persisted, true);
    const persistedRow = db.prepare('SELECT id, game_id FROM game_events WHERE id = ?').get(telemJson.data.id) as
      | { id: string; game_id: string }
      | undefined;
    assert.strictEqual(persistedRow?.game_id, 'quantum_stem_lab', 'game-telemetry must persist to game_events table');

    // Research public summary vs admin-only report
    const createExp = await fetch(`${baseUrl}/api/research/experiments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'P3 Visibility Trial', hypothesis: 'Interactive labs help' }),
    });
    assert.strictEqual(createExp.status, 201);
    const expId = String(((await createExp.json()) as { data: { id: string } }).data.id);

    const pubExp = await fetch(`${baseUrl}/api/research/experiments/${expId}`);
    assert.strictEqual(pubExp.status, 200);
    const pubExpJson = (await pubExp.json()) as { data: Record<string, unknown> };
    assert.strictEqual(pubExpJson.data.statisticalSignificance, undefined, 'Public endpoint must only return metadata');

    assert.strictEqual((await fetch(`${baseUrl}/api/research/experiments/${expId}/report`, { headers: { Authorization: `Bearer ${tokenA}` } })).status, 403);
    assert.strictEqual((await fetch(`${baseUrl}/api/research/experiments/${expId}/report`, { headers: { Authorization: `Bearer ${adminToken}` } })).status, 200);

    // Scholarship review must reject typos/empty decisions instead of approving
    const orgSub = await fetch(`${baseUrl}/api/scholarships/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${orgToken}` },
      body: JSON.stringify({
        organizationName: 'P3 Org', contactEmail: 'org.p3@cdes.test', scholarshipName: 'P3 Validation Grant', deadline: '2027-10-01',
      }),
    });
    assert.strictEqual(orgSub.status, 201);
    const subId = String(((await orgSub.json()) as { submission: { id: string } }).submission.id);
    const badReview = await fetch(`${baseUrl}/api/scholarships/submissions/${subId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ action: 'rejct' }),
    });
    assert.strictEqual(badReview.status, 400, 'Typo action must return 400 rather than approving');
    assert.strictEqual((db.prepare('SELECT status FROM organization_submissions WHERE id = ?').get(subId) as { status: string }).status, 'Pending Admin Review');

    // Whitespace-only advisor message & analytics negative limit clamping
    const wsAdv = await fetch(`${baseUrl}/api/advisor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: anon.cookie, 'X-CSRF-Token': anon.csrf },
      body: JSON.stringify({ messages: [{ sender: 'student', text: '   \n\t  ' }] }),
    });
    assert.strictEqual(wsAdv.status, 400);
    assert.strictEqual((await fetch(`${baseUrl}/api/analytics/recent?limit=-1`, { headers: { Authorization: `Bearer ${adminToken}` } })).status, 200);

    // Avatar 400/404 and unconsented privacy gating
    assert.strictEqual((await fetch(`${baseUrl}/api/avatar-world/room/objects/missing-obj`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ position_x: 'bad', position_y: 20 }),
    })).status, 400);
    assert.strictEqual((await fetch(`${baseUrl}/api/avatar-world/room/objects/missing-obj`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ position_x: 10, position_y: 20 }),
    })).status, 404);
    assert.strictEqual((await fetch(`${baseUrl}/api/avatar-world/room/objects/missing-obj`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    })).status, 404);

    const preEventsB = (db.prepare('SELECT COUNT(*) AS c FROM activity_events WHERE student_id = ?').get('usr-p3-stu-b') as { c: number }).c;
    const unconsentedAvatar = await fetch(`${baseUrl}/api/avatar-world/avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ avatar_name: 'Minor Avatar' }),
    });
    assert.strictEqual(unconsentedAvatar.status, 200);
    const postEventsB = (db.prepare('SELECT COUNT(*) AS c FROM activity_events WHERE student_id = ?').get('usr-p3-stu-b') as { c: number }).c;
    assert.strictEqual(postEventsB, preEventsB, 'Unconsented avatar mutation must not log analytics events');

    // Invalid X-Trace-Id header, malformed JSON, negative forecast
    const badTrace = 'bad trace with spaces & symbols!!';
    const traceRes = await fetch(`${baseUrl}/api/health`, { headers: { 'X-Trace-Id': badTrace } });
    assert.strictEqual(traceRes.status, 200);
    const outTrace = traceRes.headers.get('x-trace-id') || '';
    assert.notStrictEqual(outTrace, badTrace);
    assert.ok(/^[a-zA-Z0-9._-]{1,64}$/.test(outTrace));

    const badJsonRes = await fetch(`${baseUrl}/api/learning-science/retention-forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: anon.cookie, 'X-CSRF-Token': anon.csrf },
      body: '{"daysElapsed": ',
    });
    assert.strictEqual(badJsonRes.status, 400);
    assert.strictEqual(((await badJsonRes.json()) as { success: boolean }).success, false);

    assert.strictEqual((await fetch(`${baseUrl}/api/learning-science/retention-forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: anon.cookie, 'X-CSRF-Token': anon.csrf },
      body: JSON.stringify({ daysElapsed: -5, reviewCount: 1 }),
    })).status, 400);

    // AI OS memory GET must NOT fabricate demo profile
    const aiOsMemRes = await fetch(`${baseUrl}/api/ai-os/memory/usr-p3-stu-a`, { headers: { Authorization: `Bearer ${tokenA}` } });
    assert.strictEqual(aiOsMemRes.status, 200);
    const aiOsMemJson = (await aiOsMemRes.json()) as { memory: { identity: { fullName: string }; achievements: unknown[] } };
    assert.strictEqual(aiOsMemJson.memory.identity.fullName, 'Sokha P3');
    assert.strictEqual(aiOsMemJson.memory.achievements.length, 0);
    const syntheticCount = (db.prepare('SELECT COUNT(*) AS c FROM student_longterm_memory_profiles WHERE student_id = ?').get('usr-p3-stu-a') as { c: number }).c;
    assert.strictEqual(syntheticCount, 0, 'GET long-term memory must not write synthetic rows');

    console.log('✓ phase3ApiHardening.test.ts passed');
  } finally {
    await ctx.close();
  }
}

run().catch((err) => {
  console.error('phase3ApiHardening.test.ts failed:', err);
  process.exit(1);
});
