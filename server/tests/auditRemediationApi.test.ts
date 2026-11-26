import assert from 'node:assert';
import { getDatabase } from '../db/connection';
import { IntelligenceRepository } from '../repositories/intelligenceRepository';
import { createPhaseTestServer, createUserAndLogin } from './helpers/httpTestHelper';

async function run(): Promise<void> {
  // Server WITH rate limiter enabled to test X-RateLimit-* headers and /api/health exemption
  const ctx = await createPhaseTestServer('cdes-audit-api-', { disableRateLimit: false });

  try {
    const stuA = await createUserAndLogin(ctx.baseUrl, 'usr-api-a', 'apia@cdes.test', 'student');
    const stuB = await createUserAndLogin(ctx.baseUrl, 'usr-api-b', 'apib@cdes.test', 'student');
    const admin = await createUserAndLogin(ctx.baseUrl, 'usr-api-adm', 'apiadm@cdes.test', 'admin');

    // 1. P3-#3: /api/health exempt from rate limit headers; /api/scholarships emits X-RateLimit-*
    const healthRes = await fetch(`${ctx.baseUrl}/api/health`);
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthRes.headers.get('x-ratelimit-limit'), null, '/api/health must skip global rate limiter');

    const schRes = await stuA.request('GET', '/api/scholarships');
    assert.strictEqual(schRes.status, 200);
    assert.ok(Number(schRes.headers.get('x-ratelimit-limit')) > 0, '/api routes must emit X-RateLimit-Limit');
    assert.ok(schRes.headers.get('x-ratelimit-remaining') !== null, '/api routes must emit X-RateLimit-Remaining');

    // 2. P3-#9: Duplicate query param arrays cleanly return 400 (never 500 TypeError)
    for (const url of [
      '/api/community/mentors?badge=a&badge=b',
      '/api/scholarships?q=tech&q=stem',
      '/api/learning/content?search=math&search=physics',
    ]) {
      const r = await fetch(`${ctx.baseUrl}${url}`);
      assert.strictEqual(r.status, 400, `Duplicate query array on ${url} must return 400`);
    }
    const notifArr = await stuA.request('GET', '/api/users/notifications?limit=5&limit=10');
    assert.strictEqual(notifArr.status, 400, 'Duplicate limit query param must return 400');

    // 3. P2-#7: Real-calendar & plausible-range date_of_birth validation
    for (const badDob of ['2026-02-31', '2099-01-01', '1850-05-01', '9999-99-99']) {
      const dobRes = await stuA.request('PUT', '/api/users/profile', { date_of_birth: badDob });
      assert.strictEqual(dobRes.status, 400, `Invalid DOB "${badDob}" must be rejected with 400`);
    }
    const goodDob = await stuA.request('PUT', '/api/users/profile', { date_of_birth: '2004-06-15' });
    assert.strictEqual(goodDob.status, 200);

    // 4. P3-#4: Deduplicated community upvotes (post)
    const comms = await stuA.request('GET', '/api/community/communities');
    const commId = String((comms.json.data as Array<{ id: string }>)[0].id);
    const createdPost = await stuA.request('POST', '/api/community/posts', {
      community_id: commId,
      title: 'Upvote Deduplication Check',
      content: 'Verifying one upvote per student per post',
    });
    assert.strictEqual(createdPost.status, 200);
    const postId = String((createdPost.json.data as { id: string }).id);
    const up1 = await stuA.request('POST', `/api/community/posts/${postId}/upvote`);
    assert.strictEqual(up1.status, 200);
    assert.strictEqual((up1.json.data as { upvotes_count: number; alreadyVoted: boolean }).upvotes_count, 1);
    assert.strictEqual((up1.json.data as { alreadyVoted: boolean }).alreadyVoted, false);

    const up2 = await stuA.request('POST', `/api/community/posts/${postId}/upvote`);
    assert.strictEqual(up2.status, 200);
    assert.strictEqual((up2.json.data as { upvotes_count: number }).upvotes_count, 1, 'Duplicate upvote must not inflate count');
    assert.strictEqual((up2.json.data as { alreadyVoted: boolean }).alreadyVoted, true);

    const upB = await stuB.request('POST', `/api/community/posts/${postId}/upvote`);
    assert.strictEqual((upB.json.data as { upvotes_count: number }).upvotes_count, 2, 'Different student upvote must increment');

    // 5. P3-#4: Mentor double-booking returns 409 Conflict
    const mentors = await stuA.request('GET', '/api/community/mentors');
    const mentorId = String((mentors.json.data as Array<{ id: string }>)[0].id);
    const book1 = await stuA.request('POST', '/api/community/mentors/book', {
      mentor_id: mentorId,
      topic: 'Slot Lock Test A',
      scheduled_date: '2027-04-20',
      scheduled_time: '10:00',
    });
    assert.strictEqual(book1.status, 200);
    const book2 = await stuB.request('POST', '/api/community/mentors/book', {
      mentor_id: mentorId,
      topic: 'Slot Lock Test B',
      scheduled_date: '2027-04-20',
      scheduled_time: '10:00',
    });
    assert.strictEqual(book2.status, 409, 'Double-booking same mentor slot must return 409 Conflict');

    // 6. P3-#4: Project max_team_size & Event max_capacity enforce 409 Conflict
    const db = getDatabase();
    const projs = await stuA.request('GET', '/api/community/projects');
    const projId = String((projs.json.data as Array<{ id: string }>)[0].id);
    db.prepare('UPDATE student_projects SET current_team_size = 5, max_team_size = 5 WHERE id = ?').run(projId);
    const fullProj = await stuA.request('POST', `/api/community/projects/${projId}/join`, { role_in_project: 'Tester' });
    assert.strictEqual(fullProj.status, 409, 'Full project team must return 409 Conflict');

    const evs = await stuA.request('GET', '/api/community/events');
    const evId = String((evs.json.data as Array<{ id: string }>)[0].id);
    db.prepare('UPDATE campus_events SET current_rsvp_count = 50, max_participants = 50 WHERE id = ?').run(evId);
    const fullEv = await stuA.request('POST', `/api/community/events/${evId}/rsvp`, {});
    assert.strictEqual(fullEv.status, 409, 'Full campus event must return 409 Conflict');

    // 7. P3-#1: Zod validation rejects malformed domain payloads with 400
    const badConsent = await stuA.request('POST', '/api/privacy/consent', { parentEmail: 'not-an-email' });
    assert.strictEqual(badConsent.status, 400);
    const badMastery = await stuA.request('POST', '/api/learning-science/mastery/update', { conceptId: '', isCorrect: 'yes' });
    assert.strictEqual(badMastery.status, 400);
    const badExp = await admin.request('POST', '/api/research/experiments', { name: '', hypothesis: '' });
    assert.strictEqual(badExp.status, 400);

    // 8. P3-#6: AI-OS response envelope consistency (success: true & 404 on unknown milestone)
    const agentsRes = await fetch(`${ctx.baseUrl}/api/ai-os/agents`).then((r) => r.json()) as { success?: boolean };
    assert.strictEqual(agentsRes.success, true, '/api/ai-os/agents must include success: true');
    const missingToggle = await stuA.request('POST', '/api/ai-os/action-plans/toggle-milestone', {
      planId: 'plan-nonexistent',
      milestoneId: 'ms-nonexistent',
    });
    assert.strictEqual(missingToggle.status, 404, 'toggleMilestone on unknown milestone must return 404');

    // 9. P2-#8: Corrupted JSON in SQLite does not crash IntelligenceRepository
    const now = new Date().toISOString();
    db.prepare(
      `INSERT OR REPLACE INTO student_intelligence_profile
       (student_id, learning_preferences, subject_strengths, subject_weaknesses, interest_patterns, engagement_score, persistence_score, problem_solving_score, updated_at)
       VALUES ('usr-api-a', '{corrupted-json', '[bad', '{nope', 'broken', 50, 50, 50, ?)`
    ).run(now);
    const intelRepo = new IntelligenceRepository();
    const safeProf = intelRepo.getProfile('usr-api-a');
    assert.ok(safeProf && Array.isArray(safeProf.subjectStrengths), 'Corrupted JSON must degrade gracefully via safeJsonParse');

    console.log('✓ auditRemediationApi.test.ts passed');
  } finally {
    await ctx.cleanup();
  }
}

run().catch((err) => {
  console.error('auditRemediationApi.test.ts failed:', err);
  process.exit(1);
});
