import assert from 'node:assert';
import { DEFAULT_USER_SETTINGS, type UserSettings } from '../../shared/types/userSettings';
import { bootstrapCsrf, createTestUser, startTestServer } from './helpers/httpTestHelper';

interface SettingsApiResponse {
  success: boolean;
  data?: { settings: UserSettings; updatedAt: string | null };
  error?: string;
}

async function run(): Promise<void> {
  const ctx = await startTestServer({ prefix: 'cdes-settings-', seedCatalog: false, seedDemo: false });
  try {
    // 1. Unauthenticated access must return 401
    const unauth = await fetch(`${ctx.baseUrl}/api/users/settings`);
    assert.strictEqual(unauth.status, 401, 'Unauthenticated GET /api/users/settings must be rejected');

    const stuA = createTestUser({
      id: 'usr-set-a',
      email: 'set.a@cdes.test',
      role: 'student',
      name: 'Student A',
      jwtSecret: ctx.jwtSecret,
    });
    const stuB = createTestUser({
      id: 'usr-set-b',
      email: 'set.b@cdes.test',
      role: 'student',
      name: 'Student B',
      jwtSecret: ctx.jwtSecret,
    });

    const authA = await bootstrapCsrf(ctx.baseUrl, stuA.token);
    const authB = await bootstrapCsrf(ctx.baseUrl, stuB.token);

    // 2. Initial GET returns clean defaults
    const getInit = await fetch(`${ctx.baseUrl}/api/users/settings`, {
      headers: { Cookie: authA.cookie },
    });
    assert.strictEqual(getInit.status, 200);
    const initJson = (await getInit.json()) as SettingsApiResponse;
    assert.deepStrictEqual(initJson.data?.settings, DEFAULT_USER_SETTINGS);
    assert.strictEqual(initJson.data?.updatedAt, null);

    // 3. PUT persists partial settings cleanly & merges with defaults
    const putRes = await fetch(`${ctx.baseUrl}/api/users/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: authA.cookie, 'X-CSRF-Token': authA.csrf },
      body: JSON.stringify({
        themeMode: 'dark',
        accentColor: 'emerald',
        layoutWidth: 'full',
        fontFamily: 'serif',
        fontScale: 'lg',
        defaultScholarshipsTab: 'top_universities',
        deadlineReminderDays: 14,
      }),
    });
    assert.strictEqual(putRes.status, 200);
    const putJson = (await putRes.json()) as SettingsApiResponse;
    assert.strictEqual(putJson.data?.settings.themeMode, 'dark');
    assert.strictEqual(putJson.data?.settings.accentColor, 'emerald');
    assert.strictEqual(putJson.data?.settings.layoutWidth, 'full');
    assert.strictEqual(putJson.data?.settings.fontFamily, 'serif');
    assert.strictEqual(putJson.data?.settings.fontScale, 'lg');
    assert.strictEqual(putJson.data?.settings.defaultScholarshipsTab, 'top_universities');
    assert.strictEqual(putJson.data?.settings.deadlineReminderDays, 14);
    assert.ok(putJson.data?.updatedAt);

    // 4. Reject unknown/invalid keys via strict Zod schema
    const badRes = await fetch(`${ctx.baseUrl}/api/users/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: authA.cookie, 'X-CSRF-Token': authA.csrf },
      body: JSON.stringify({ accentColor: 'neon-pink', injectedField: 'hack' }),
    });
    assert.strictEqual(badRes.status, 400, 'Invalid settings payload must return 400');

    // 5. Strict cross-student isolation (Student B still has defaults)
    const getB = await fetch(`${ctx.baseUrl}/api/users/settings`, {
      headers: { Cookie: authB.cookie },
    });
    assert.strictEqual(getB.status, 200);
    const bJson = (await getB.json()) as SettingsApiResponse;
    assert.deepStrictEqual(bJson.data?.settings, DEFAULT_USER_SETTINGS);

    // 6. DELETE resets Student A back to defaults
    const delRes = await fetch(`${ctx.baseUrl}/api/users/settings`, {
      method: 'DELETE',
      headers: { Cookie: authA.cookie, 'X-CSRF-Token': authA.csrf },
    });
    assert.strictEqual(delRes.status, 200);
    const delJson = (await delRes.json()) as SettingsApiResponse;
    assert.deepStrictEqual(delJson.data?.settings, DEFAULT_USER_SETTINGS);
    assert.strictEqual(delJson.data?.updatedAt, null);

    console.log('✓ userSettings.test.ts passed');
  } finally {
    await ctx.cleanup();
  }
}

void run().catch((err) => {
  console.error('✗ userSettings.test.ts failed:', err);
  process.exit(1);
});
