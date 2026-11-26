import assert from 'node:assert';
import { getDatabase } from '../db/connection';
import { parseCookies } from '../utils/cookies';
import { isCookieSecure } from '../config';
import { createPhaseTestServer, createUserAndLogin } from './helpers/httpTestHelper';

async function run(): Promise<void> {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevCookieSecure = process.env.COOKIE_SECURE;
  process.env.COOKIE_SECURE = '';
  process.env.NODE_ENV = 'staging';
  assert.strictEqual(isCookieSecure(), true, 'staging must default to Secure cookies');
  process.env.NODE_ENV = prevNodeEnv || 'development';
  process.env.COOKIE_SECURE = prevCookieSecure || '';

  const parsed = parseCookies('__proto__=evil; constructor=bad; cdes_test=ok');
  assert.strictEqual(Object.getPrototypeOf(parsed), null, 'parseCookies must use null-prototype object');
  assert.strictEqual(parsed.cdes_test, 'ok');
  assert.strictEqual(({} as Record<string, unknown>).polluted, undefined);

  const ctx = await createPhaseTestServer('cdes-p5-sec-', {
    frontendOrigin: 'https://app.cdes.edu.kh, https://staging.cdes.edu.kh, *',
  });

  try {
    // 1. Security headers + CORS allowlist
    const healthRes = await fetch(`${ctx.baseUrl}/api/health`, {
      headers: { Origin: 'https://staging.cdes.edu.kh' },
    });
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthRes.headers.get('x-powered-by'), null, 'x-powered-by must be disabled');
    assert.strictEqual(healthRes.headers.get('x-content-type-options'), 'nosniff');
    assert.strictEqual(healthRes.headers.get('x-frame-options'), 'DENY');
    assert.ok(healthRes.headers.get('content-security-policy')?.includes("default-src 'self'"));
    assert.strictEqual(healthRes.headers.get('access-control-allow-origin'), 'https://staging.cdes.edu.kh');

    const badCorsRes = await fetch(`${ctx.baseUrl}/api/health`, {
      headers: { Origin: 'https://evil.example.com' },
    });
    assert.strictEqual(badCorsRes.headers.get('access-control-allow-origin'), null);

    // 2. JWT JTI revocation on logout
    const stuA = await createUserAndLogin(ctx.baseUrl, 'usr-p5-a', 'p5a@cdes.test', 'student');
    const stuB = await createUserAndLogin(ctx.baseUrl, 'usr-p5-b', 'p5b@cdes.test', 'student');
    const admin = await createUserAndLogin(ctx.baseUrl, 'usr-p5-admin', 'p5admin@cdes.test', 'admin');

    const sessRes = await fetch(`${ctx.baseUrl}/api/auth/session`, { headers: { Cookie: stuA.cookieHeader() } });
    assert.strictEqual(sessRes.headers.get('cache-control'), 'no-store');

    const capturedCookie = stuA.cookieHeader();
    const logoutRes = await stuA.request('POST', '/api/auth/logout');
    assert.strictEqual(logoutRes.status, 200);
    const replayRes = await fetch(`${ctx.baseUrl}/api/users/profile`, { headers: { Cookie: capturedCookie } });
    assert.strictEqual(replayRes.status, 401, 'revoked JWT must be rejected after logout');

    // Re-login stuA for subsequent ownership tests
    const stuA2 = await createUserAndLogin(ctx.baseUrl, 'usr-p5-a2', 'p5a2@cdes.test', 'student');

    // 3. Scholarship error report resolution with applyCorrection=true (no FK crash!)
    const listSch = await stuA2.request('GET', '/api/scholarships');
    const schId = String(((listSch.json.scholarships as Array<{ id: string }>)[0]).id);
    const repRes = await stuA2.request('POST', '/api/scholarships/report', {
      scholarshipId: schId,
      scholarshipName: 'Test Sch',
      reportedField: 'deadline',
      description: 'Deadline moved to November',
      suggestedCorrection: '2027-11-30',
    });
    assert.strictEqual(repRes.status, 200);
    const reportId = String((repRes.json.report as { id: string }).id);
    const resolveRes = await admin.request('PATCH', `/api/scholarships/reports/${reportId}`, {
      status: 'Verified & Fixed',
      applyCorrection: true,
      adminNotes: 'Verified against gazette',
    });
    assert.strictEqual(resolveRes.status, 200, 'applyCorrection=true must not crash on change_history FK');

    // 4. AI-OS toggleMilestone IDOR & unique per-student milestone IDs
    await stuA2.request('POST', '/api/privacy/consent', { isMinor: false, allowAiMemory: true, allowAnalyticsTracking: true });
    await stuB.request('POST', '/api/privacy/consent', { isMinor: false, allowAiMemory: true, allowAnalyticsTracking: true });
    const plansA = await stuA2.request('GET', '/api/ai-os/action-plans/usr-p5-a2');
    const plansB = await stuB.request('GET', '/api/ai-os/action-plans/usr-p5-b');
    const planA = (plansA.json.plans as Array<{ id: string; milestones: Array<{ id: string }> }>)[0];
    const planB = (plansB.json.plans as Array<{ id: string; milestones: Array<{ id: string }> }>)[0];
    assert.notStrictEqual(planA.milestones[0].id, planB.milestones[0].id, 'milestone PKs must be per-student scoped');
    const idorToggle = await stuB.request('POST', '/api/ai-os/action-plans/toggle-milestone', {
      planId: planA.id,
      milestoneId: planA.milestones[0].id,
    });
    assert.strictEqual(idorToggle.status, 404, 'Student B must receive 404 toggling Student A milestone');
    assert.strictEqual(idorToggle.json.success, false, 'Student B must not toggle Student A milestone');

    // 5. Community hardening: forced member role, stripped user_ids, cross-post accept-answer, mentor default session_type, title moderation
    const commsRes = await stuA2.request('GET', '/api/community/communities');
    const firstComm = (commsRes.json.data as Array<{ id: string; slug: string }>)[0];
    await stuA2.request('POST', `/api/community/communities/${firstComm.id}/join`, { role: 'admin' });
    const commDetail = await stuA2.request('GET', `/api/community/communities/${firstComm.slug}`);
    const members = (commDetail.json.data as { members: Array<Record<string, unknown>> }).members;
    assert.ok(members.every((m) => !('user_id' in m)), 'public community slug must not expose raw user_ids');
    const joinedRow = getDatabase()
      .prepare('SELECT role FROM community_members WHERE community_id = ? AND user_id = ?')
      .get(firstComm.id, 'usr-p5-a2') as { role: string };
    assert.strictEqual(joinedRow.role, 'member', 'joinCommunity must ignore caller-supplied role');

    const badTitlePost = await stuA2.request('POST', '/api/community/posts', {
      community_id: firstComm.id,
      title: 'Where to buy bac ii key fast',
      content: 'Normal content body here',
    });
    assert.strictEqual(badTitlePost.status, 400, 'prohibited keywords in title must be blocked');

    const post1 = await stuA2.request('POST', '/api/community/posts', { community_id: firstComm.id, title: 'Post One', content: 'Question one' });
    const post2 = await stuA2.request('POST', '/api/community/posts', { community_id: firstComm.id, title: 'Post Two', content: 'Question two' });
    const post1Id = String((post1.json.data as { id: string }).id);
    const post2Id = String((post2.json.data as { id: string }).id);
    const cmtOn2 = await stuB.request('POST', `/api/community/posts/${post2Id}/comments`, { content: 'Answer for post two' });
    const cmt2Id = String((cmtOn2.json.data as { id: string }).id);
    const crossAccept = await stuA2.request('POST', `/api/community/posts/${post1Id}/accept-answer/${cmt2Id}`);
    assert.strictEqual(crossAccept.status, 404, 'cannot accept comment belonging to another post');

    const mentorsRes = await stuA2.request('GET', '/api/community/mentors');
    const mentorId = String((mentorsRes.json.data as Array<{ id: string }>)[0].id);
    const bookRes = await stuA2.request('POST', '/api/community/mentors/book', {
      mentor_id: mentorId,
      topic: 'Bac II Calculus prep',
      scheduled_date: '2026-12-10',
      scheduled_time: '14:00',
    });
    assert.strictEqual(bookRes.status, 200, 'default session_type must satisfy schema CHECK constraint');

    // 6. Avatar mass-assignment + locked inventory item placement
    const avatarUpd = await stuA2.request('POST', '/api/avatar-world/avatar', {
      avatar_name: 'Legit Scholar',
      level: 99,
      merit_points: 999999,
    });
    assert.strictEqual(avatarUpd.status, 200);
    assert.strictEqual((avatarUpd.json.data as { level: number; merit_points: number }).level, 1);
    assert.strictEqual((avatarUpd.json.data as { merit_points: number }).merit_points, 150);

    const lockedItem = getDatabase()
      .prepare("SELECT id FROM avatar_items WHERE LOWER(COALESCE(unlock_condition_type, 'default')) NOT IN ('default', 'free') LIMIT 1")
      .get() as { id: string } | undefined;
    if (lockedItem) {
      const placeLocked = await stuA2.request('POST', '/api/avatar-world/room/objects', {
        item_id: lockedItem.id,
        position_x: 10,
        position_y: 10,
      });
      assert.strictEqual(placeLocked.status, 403, 'cannot place unowned locked avatar item');
    }

    // 7. Knowledge drafts hidden from non-admins, no author spoofing, deduped votes
    const pubContent = await stuA2.request('GET', '/api/knowledge/content');
    assert.ok((pubContent.json.data as Array<{ status: string }>).every((c) => c.status === 'published'));
    const subContent = await stuA2.request('POST', '/api/knowledge/content', {
      authorId: 'auth_cadt_dean',
      sourceId: 'src_moeys_official',
      titleEn: 'Student Draft Note',
      titleKm: 'កំណត់ត្រាសិស្ស',
      summary: 'Community summary',
      bodyMarkdown: 'Draft body',
    });
    assert.strictEqual(subContent.status, 201);
    assert.strictEqual((subContent.json.data as { authorId: string }).authorId, 'community_usr-p5-a2');
    const publishedId = String((pubContent.json.data as Array<{ id: string }>)[0].id);
    const fb1 = await stuA2.request('POST', '/api/knowledge/feedback', { contentId: publishedId, isHelpful: true });
    const fb2 = await stuA2.request('POST', '/api/knowledge/feedback', { contentId: publishedId, isHelpful: true });
    assert.strictEqual((fb2.json.data as { helpfulVotes: number }).helpfulVotes, (fb1.json.data as { helpfulVotes: number }).helpfulVotes);

    // 8. Platform mobile ownership & data-platform flywheel gating + pipeline test schema
    const regDevA = await stuA2.request('POST', '/api/platform/mobile/devices', {
      deviceId: 'dev-p5-owned-a',
      platform: 'android',
      role: 'organization',
    });
    assert.strictEqual(regDevA.status, 200);
    assert.strictEqual((regDevA.json.device as { role: string }).role, 'student');
    const hijackDev = await stuB.request('POST', '/api/platform/mobile/devices', {
      deviceId: 'dev-p5-owned-a',
      platform: 'ios',
    });
    assert.strictEqual(hijackDev.status, 403);
    const hijackSync = await stuB.request('POST', '/api/platform/mobile/sync', {
      deviceId: 'dev-p5-owned-a',
      mutations: [{ action: 'sync_test' }],
    });
    assert.strictEqual(hijackSync.status, 403);

    const unauthFlywheel = await fetch(`${ctx.baseUrl}/api/data-platform/improvement-flywheel`);
    assert.strictEqual(unauthFlywheel.status, 401);
    const stuFlywheel = await stuA2.request('GET', '/api/data-platform/improvement-flywheel');
    assert.strictEqual(stuFlywheel.status, 403);
    const admPipeline = await admin.request('POST', '/api/data-platform/ai-pipeline/test', {
      text: 'CADT Computer Science scholarship inquiry',
      category: 'university_inquiry',
    });
    assert.strictEqual(admPipeline.status, 200);

    // 9. Research createExperiment visible in getExperiments
    const expCreate = await admin.request('POST', '/api/research/experiments', {
      name: 'Phase 5 Visibility Trial',
      hypothesis: 'Unified table listing works',
    });
    assert.strictEqual(expCreate.status, 201);
    const createdExpId = String((expCreate.json.data as { id: string }).id);
    const expList = await admin.request('GET', '/api/research/experiments');
    assert.ok((expList.json.data as Array<{ id: string }>).some((e) => e.id === createdExpId));

    console.log('✓ phase5SecurityHardening.test.ts passed');
  } finally {
    await ctx.cleanup();
  }
}

run().catch((err) => {
  console.error('phase5SecurityHardening.test.ts failed:', err);
  process.exit(1);
});
