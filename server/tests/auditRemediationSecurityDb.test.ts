import assert from 'node:assert';
import { getDatabase, withTransaction } from '../db/connection';
import { authLockoutService } from '../services/authLockoutService';
import { clearRevokedTokenCache } from '../services/authService';
import { assertSafeScholarshipUrls, assertSafeOptionalHttpUrl } from '../utils/safeUrl';
import { createPhaseTestServer, createUserAndLogin } from './helpers/httpTestHelper';

async function run(): Promise<void> {
  authLockoutService.reset();
  const ctx = await createPhaseTestServer('cdes-audit-secdb-');

  try {
    const stu = await createUserAndLogin(ctx.baseUrl, 'usr-aud-stu', 'audstu@cdes.test', 'student');
    const org = await createUserAndLogin(ctx.baseUrl, 'usr-aud-org', 'audorg@cdes.test', 'organization');
    const admin = await createUserAndLogin(ctx.baseUrl, 'usr-aud-adm', 'audadm@cdes.test', 'admin');

    // 1. P4-#2: URL alias bypass, credentials-in-URL, scholarship report, community avatar
    assert.throws(
      () => assertSafeScholarshipUrls({ applicationLink: '', application_link: 'javascript:alert(1)' }),
      /http:\/\/ or https:\/\//
    );
    assert.throws(
      () => assertSafeOptionalHttpUrl('https://user:pass@evil.example.com/hook', 'officialSourceUrl'),
      /credentials/
    );
    const badRep = await stu.request('POST', '/api/scholarships/report', {
      scholarshipId: 'sch-chevening-uk',
      scholarshipName: 'Chevening',
      reportedField: 'officialSourceUrl',
      description: 'Bad link test',
      officialSourceUrl: 'javascript:alert(1)',
    });
    assert.strictEqual(badRep.status, 400, 'reportError must reject javascript: officialSourceUrl');

    const comms = await stu.request('GET', '/api/community/communities');
    const commId = String((comms.json.data as Array<{ id: string }>)[0].id);
    const badAvatar = await stu.request('POST', '/api/community/posts', {
      community_id: commId,
      title: 'Valid study post',
      content: 'Testing safe avatar validation',
      author_avatar: 'javascript:alert(1)',
    });
    assert.strictEqual(badAvatar.status, 400, 'community post must reject unsafe author_avatar URL');

    // 2. P4-#6: Public community posts strip raw author_id
    const goodPost = await stu.request('POST', '/api/community/posts', {
      community_id: commId,
      title: 'Clean Study Question',
      content: 'How to prepare for Bac II calculus?',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    });
    assert.strictEqual(goodPost.status, 200);
    assert.strictEqual('author_id' in (goodPost.json.data as Record<string, unknown>), false);
    const publicPosts = await fetch(`${ctx.baseUrl}/api/community/posts`).then((r) => r.json()) as {
      data: Array<Record<string, unknown>>;
    };
    assert.ok(publicPosts.data.length > 0 && publicPosts.data.every((p) => !('author_id' in p)));

    // 3. P4-#3: Dual-key (ip, email) lockout avoids cross-IP account DoS
    for (let i = 0; i < 5; i++) {
      authLockoutService.recordFailure('victim@cdes.test', '198.51.100.10');
    }
    assert.ok(authLockoutService.getLockoutSeconds('victim@cdes.test', '198.51.100.10') > 0);
    assert.strictEqual(authLockoutService.getLockoutSeconds('victim@cdes.test', '203.0.113.20'), 0);
    authLockoutService.reset();

    // 4. P4-#4 & P4-#10: SQLite-persisted JTI survives cache clear; logout-all & change-password bump token_version
    const stuCookie1 = stu.cookieHeader();
    const logoutRes = await stu.request('POST', '/api/auth/logout');
    assert.strictEqual(logoutRes.status, 200);
    clearRevokedTokenCache(); // Simulate server restart clearing in-memory cache
    const replayAfterRestart = await fetch(`${ctx.baseUrl}/api/users/profile`, {
      headers: { Cookie: stuCookie1 },
    });
    assert.strictEqual(replayAfterRestart.status, 401, 'SQLite-persisted JTI must block replay after cache clear');

    const stuFresh = await createUserAndLogin(ctx.baseUrl, 'usr-aud-tv', 'audtv@cdes.test', 'student');
    const capturedTokenCookie = stuFresh.cookieHeader();
    const logoutAllRes = await stuFresh.request('POST', '/api/auth/logout-all');
    assert.strictEqual(logoutAllRes.status, 200);
    const afterLogoutAll = await fetch(`${ctx.baseUrl}/api/users/profile`, {
      headers: { Cookie: capturedTokenCookie },
    });
    assert.strictEqual(afterLogoutAll.status, 401, 'logout-all must invalidate prior token_version');

    const stuPwd = await createUserAndLogin(ctx.baseUrl, 'usr-aud-pwd', 'audpwd@cdes.test', 'student');
    const oldPwdCookie = stuPwd.cookieHeader();
    const chgRes = await stuPwd.request('POST', '/api/auth/change-password', {
      currentPassword: 'SecurePass!usr-aud-pwd',
      newPassword: 'NewStrongPassword!99',
    });
    assert.strictEqual(chgRes.status, 200);
    const replayOldPwd = await fetch(`${ctx.baseUrl}/api/users/profile`, {
      headers: { Cookie: oldPwdCookie },
    });
    assert.strictEqual(replayOldPwd.status, 401, 'change-password must invalidate pre-rotation token');

    // 5. P4-#7: Suspended account login returns uniform generic error
    const db = getDatabase();
    db.prepare("UPDATE users SET status = 'suspended' WHERE id = 'usr-aud-org'").run();
    const csrfBoot = await fetch(`${ctx.baseUrl}/api/auth/csrf`);
    const bootCookie = ((csrfBoot.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.() || [])
      .map((c) => c.split(';')[0])
      .join('; ');
    const bootCsrf = csrfBoot.headers.get('X-CSRF-Token') || '';
    const suspLogin = await fetch(`${ctx.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: bootCookie, 'X-CSRF-Token': bootCsrf },
      body: JSON.stringify({ email: 'audorg@cdes.test', password: 'SecurePass!usr-aud-org' }),
    });
    assert.strictEqual(suspLogin.status, 401);
    const suspBody = (await suspLogin.json()) as { error: string };
    assert.strictEqual(suspBody.error, 'Invalid email or password.');

    // 6. P4-#8: Dummy Bearer header cannot bypass CSRF + Sec-Fetch-Site: cross-site blocked
    const fakeBearerCsrf = await fetch(`${ctx.baseUrl}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: stuPwd.cookieHeader(),
        Authorization: 'Bearer forged-not-valid-jwt',
      },
      body: JSON.stringify({ name: 'Bypass Attempt' }),
    });
    assert.strictEqual(fakeBearerCsrf.status, 403, 'Forged Bearer header must not bypass CSRF check');

    const csrfForCross = await fetch(`${ctx.baseUrl}/api/auth/csrf`, {
      headers: { Cookie: stuPwd.cookieHeader() },
    });
    const freshCsrf = csrfForCross.headers.get('X-CSRF-Token') || '';
    const crossSiteRes = await fetch(`${ctx.baseUrl}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: stuPwd.cookieHeader(),
        'X-CSRF-Token': freshCsrf,
        'Sec-Fetch-Site': 'cross-site',
      },
      body: JSON.stringify({ name: 'Cross Site Attempt' }),
    });
    assert.strictEqual(crossSiteRes.status, 403, 'Sec-Fetch-Site: cross-site must be rejected');

    // 7. P3-#5: Reject > 72 UTF-8 byte passwords cleanly with 400
    const longPwdRes = await fetch(`${ctx.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: bootCookie, 'X-CSRF-Token': bootCsrf },
      body: JSON.stringify({ email: 'longpwd@cdes.test', password: 'A'.repeat(73), name: 'Long Pwd' }),
    });
    assert.strictEqual(longPwdRes.status, 400, '73-byte password must be rejected with 400');

    // 8. P2-#2, #3, #4, #5: Nested SAVEPOINT tx, dead tables dropped, FK indexes used, ON DELETE SET NULL
    withTransaction(() => {
      db.prepare("INSERT INTO search_keywords_log (query, count, last_searched) VALUES ('outer-ok', 1, ?)").run(
        new Date().toISOString()
      );
      try {
        withTransaction(() => {
          db.prepare("INSERT INTO search_keywords_log (query, count, last_searched) VALUES ('inner-rollback', 1, ?)").run(
            new Date().toISOString()
          );
          throw new Error('force inner rollback');
        });
      } catch {
        // inner savepoint rolled back
      }
    });
    assert.ok(db.prepare("SELECT query FROM search_keywords_log WHERE query = 'outer-ok'").get());
    assert.strictEqual(db.prepare("SELECT query FROM search_keywords_log WHERE query = 'inner-rollback'").get(), undefined);

    for (const dead of ['career_paths', 'learning_objectives', 'campus_worlds', 'university_programs']) {
      assert.strictEqual(
        db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(dead),
        undefined,
        `Dead table ${dead} must be dropped in migration 012`
      );
    }
    assert.ok(
      db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = 'campus_educational_games'").get(),
      'Live table campus_educational_games must be preserved'
    );

    const planText = (sql: string, ...args: string[]) =>
      (db.prepare(`EXPLAIN QUERY PLAN ${sql}`).all(...args) as Array<{ detail: string }>)
        .map((r) => r.detail)
        .join(' | ');
    assert.ok(planText('SELECT * FROM lessons WHERE course_id = ?', 'c1').includes('USING INDEX'));
    assert.ok(planText('SELECT * FROM universities WHERE abbr = ? COLLATE NOCASE', 'ITC').includes('USING INDEX'));

    // Hard-deleting a user who created verification_records / change_history / organization_submissions succeeds (SET NULL)
    const subRes = await admin.request('POST', '/api/scholarships/submit', {
      organizationName: 'Test Org',
      contactEmail: 'audadm@cdes.test',
      scholarshipName: 'SetNull Test Grant',
      deadline: '2027-09-01',
    });
    assert.strictEqual(subRes.status, 201);
    const subId = String((subRes.json.submission as { id: string }).id);
    db.prepare('DELETE FROM users WHERE id = ?').run('usr-aud-adm');
    const keptSub = db
      .prepare('SELECT submitted_by_user_id FROM organization_submissions WHERE id = ?')
      .get(subId) as { submitted_by_user_id: string | null };
    assert.strictEqual(keptSub.submitted_by_user_id, null, 'User deletion must SET NULL on organization_submissions');

    console.log('✓ auditRemediationSecurityDb.test.ts passed');
  } finally {
    authLockoutService.reset();
    await ctx.cleanup();
  }
}

run().catch((err) => {
  console.error('auditRemediationSecurityDb.test.ts failed:', err);
  process.exit(1);
});
