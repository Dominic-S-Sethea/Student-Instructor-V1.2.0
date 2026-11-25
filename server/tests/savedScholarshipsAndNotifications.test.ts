import assert from 'node:assert';
import { getDatabase } from '../db/connection';
import { createPhaseTestServer, createUserAndLogin } from './helpers/httpTestHelper';

async function run(): Promise<void> {
  const ctx = await createPhaseTestServer('cdes-w1-saved-');
  try {
    // 1. Unauthenticated requests must fail with 401
    const unauthSaved = await fetch(`${ctx.baseUrl}/api/scholarships/saved`);
    assert.strictEqual(unauthSaved.status, 401);
    const unauthNotif = await fetch(`${ctx.baseUrl}/api/users/notifications`);
    assert.strictEqual(unauthNotif.status, 401);

    // 2. Register Student A via HTTP to verify onboarding welcome notification creation
    const csrfRes = await fetch(`${ctx.baseUrl}/api/auth/csrf`);
    const initCookies = (csrfRes.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.() || [];
    const initCookieStr = initCookies.map((c) => c.split(';')[0]).join('; ');
    const initCsrf = csrfRes.headers.get('X-CSRF-Token') || '';
    const regA = await fetch(`${ctx.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: initCookieStr, 'X-CSRF-Token': initCsrf },
      body: JSON.stringify({
        email: 'w1.student.a@cdes.test',
        password: 'StrongPassword!123',
        role: 'student',
        name: 'W1 Student A',
      }),
    });
    assert.strictEqual(regA.status, 201);
    const regACookies = (regA.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.() || [];
    const jarA = regACookies.map((c) => c.split(';')[0]).join('; ');
    const regAJson = (await regA.json()) as { data: { csrfToken: string; user: { id: string } } };
    const csrfA = regAJson.data.csrfToken;
    const userAId = regAJson.data.user.id;

    // Verify welcome notification created for newly registered student
    const notifResA = await fetch(`${ctx.baseUrl}/api/users/notifications`, { headers: { Cookie: jarA } });
    assert.strictEqual(notifResA.status, 200);
    const notifJsonA = (await notifResA.json()) as {
      data: { notifications: Array<{ id: string; isRead: boolean }>; unreadCount: number };
    };
    assert.ok(notifJsonA.data.notifications.length >= 1, 'New student must receive welcome notification');
    assert.strictEqual(notifJsonA.data.unreadCount, 1);
    const firstNotifId = notifJsonA.data.notifications[0].id;

    // 3. Create Student B via helper for strict cross-student isolation tests
    const stuB = await createUserAndLogin(ctx.baseUrl, 'usr-w1-b', 'w1.student.b@cdes.test', 'student');

    // Student B cannot mark or delete Student A's notification
    const crossRead = await stuB.request('PATCH', `/api/users/notifications/${firstNotifId}/read`);
    assert.strictEqual(crossRead.status, 404, 'Student B must not read-mark Student A notification');
    const crossDel = await stuB.request('DELETE', `/api/users/notifications/${firstNotifId}`);
    assert.strictEqual(crossDel.status, 404, 'Student B must not delete Student A notification');

    // Student A marks own notification read
    const markA = await fetch(`${ctx.baseUrl}/api/users/notifications/${firstNotifId}/read`, {
      method: 'PATCH',
      headers: { Cookie: jarA, 'X-CSRF-Token': csrfA },
    });
    assert.strictEqual(markA.status, 200);
    assert.strictEqual(((await markA.json()) as { unreadCount: number }).unreadCount, 0);

    // 4. Saved scholarships CRUD, guest sync, default checklists, closing-soon reminder & isolation
    const listRes = await fetch(`${ctx.baseUrl}/api/scholarships`);
    const catalog = ((await listRes.json()) as { scholarships: Array<{ id: string }> }).scholarships;
    assert.ok(catalog.length >= 2);
    const sch1Id = catalog[0].id;
    const sch2Id = catalog[1].id;

    // Set sch1 deadline to 15 days from now so saving triggers a closing-soon deadline notification
    const soonIso = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    getDatabase().prepare('UPDATE scholarships SET deadline = ?, is_deadline_rolling = 0 WHERE id = ?').run(soonIso, sch1Id);

    // Sync guest bookmarks including a nonexistent ID (must ignore missing ID safely)
    const syncRes = await fetch(`${ctx.baseUrl}/api/scholarships/saved/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: jarA, 'X-CSRF-Token': csrfA },
      body: JSON.stringify({ scholarshipIds: [sch1Id, 'sch-nonexistent-999'] }),
    });
    assert.strictEqual(syncRes.status, 200);
    const syncJson = (await syncRes.json()) as {
      saved: Array<{ scholarshipId: string; status: string; checklist: Array<{ id: string; label: string; done: boolean }> }>;
    };
    assert.strictEqual(syncJson.saved.length, 1);
    assert.strictEqual(syncJson.saved[0].scholarshipId, sch1Id);
    assert.ok(syncJson.saved[0].checklist.length >= 1, 'Default document checklist must be seeded');

    // Verify closing-soon deadline notification was created & deduplicated on repeat sync
    await fetch(`${ctx.baseUrl}/api/scholarships/saved/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: jarA, 'X-CSRF-Token': csrfA },
      body: JSON.stringify({ scholarshipIds: [sch1Id] }),
    });
    const notifAfterSave = await fetch(`${ctx.baseUrl}/api/users/notifications`, { headers: { Cookie: jarA } });
    const notifAfterJson = (await notifAfterSave.json()) as {
      data: { notifications: Array<{ category: string }>; unreadCount: number };
    };
    const deadlineNotifs = notifAfterJson.data.notifications.filter((n) => n.category === 'deadline');
    assert.strictEqual(deadlineNotifs.length, 1, 'Closing-soon deadline reminder must be created once (deduped)');

    // Update status + toggle checklist item
    const nextChecklist = syncJson.saved[0].checklist.map((item, idx) =>
      idx === 0 ? { ...item, done: true } : item
    );
    const patchRes = await fetch(`${ctx.baseUrl}/api/scholarships/saved/${encodeURIComponent(sch1Id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: jarA, 'X-CSRF-Token': csrfA },
      body: JSON.stringify({ status: 'preparing', targetNote: 'Draft essay by Friday', checklist: nextChecklist }),
    });
    assert.strictEqual(patchRes.status, 200);
    const patchJson = (await patchRes.json()) as {
      data: { status: string; targetNote: string; checklist: Array<{ done: boolean }> };
    };
    assert.strictEqual(patchJson.data.status, 'preparing');
    assert.strictEqual(patchJson.data.targetNote, 'Draft essay by Friday');
    assert.strictEqual(patchJson.data.checklist[0].done, true);

    // Student B cannot see, patch, or delete Student A's saved bookmark
    const listB = await stuB.request('GET', '/api/scholarships/saved');
    assert.strictEqual((listB.json.saved as unknown[]).length, 0);
    const patchB = await stuB.request('PATCH', `/api/scholarships/saved/${encodeURIComponent(sch1Id)}`, { status: 'submitted' });
    assert.strictEqual(patchB.status, 404);
    const delB = await stuB.request('DELETE', `/api/scholarships/saved/${encodeURIComponent(sch1Id)}`);
    assert.strictEqual(delB.status, 404);

    // Student B saves sch2 cleanly, Student A deletes sch1 cleanly
    const saveB = await stuB.request('POST', '/api/scholarships/saved', { scholarshipId: sch2Id });
    assert.strictEqual(saveB.status, 201);
    const delA = await fetch(`${ctx.baseUrl}/api/scholarships/saved/${encodeURIComponent(sch1Id)}`, {
      method: 'DELETE',
      headers: { Cookie: jarA, 'X-CSRF-Token': csrfA },
    });
    assert.strictEqual(delA.status, 200);

    // Mark all read on Student A clears remaining unread count
    const readAllA = await fetch(`${ctx.baseUrl}/api/users/notifications/read-all`, {
      method: 'POST',
      headers: { Cookie: jarA, 'X-CSRF-Token': csrfA },
    });
    assert.strictEqual(readAllA.status, 200);
    assert.strictEqual(((await readAllA.json()) as { unreadCount: number }).unreadCount, 0);

    // Cascade delete: deleting user removes bookmarks & notifications cleanly
    getDatabase().prepare('DELETE FROM users WHERE id = ?').run(userAId);
    const remNotifs = getDatabase().prepare('SELECT COUNT(*) AS c FROM user_notifications WHERE user_id = ?').get(userAId) as { c: number };
    assert.strictEqual(remNotifs.c, 0);

    console.log('✓ savedScholarshipsAndNotifications.test.ts passed');
  } finally {
    await ctx.cleanup();
  }
}

run().catch((err) => {
  console.error('savedScholarshipsAndNotifications.test.ts failed:', err);
  process.exit(1);
});
