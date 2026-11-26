import assert from 'node:assert';
import { bootstrapCsrf, createTestUser, startTestServer } from './helpers/httpTestHelper';

async function run(): Promise<void> {
  const srv = await startTestServer({ prefix: 'cdes-learn-obs-', disableRateLimit: true });
  try {
    const stuAId = 'usr-learn-a';
    const stuAEmail = 'learn-a@cdes.test';
    const stuBId = 'usr-learn-b';
    const adminEmail = 'learn-adm@cdes.test';

    await createTestUser({
      id: stuAId,
      email: stuAEmail,
      password: 'Password123!',
      role: 'student',
      name: 'Learn Student A',
      jwtSecret: srv.jwtSecret,
    });
    await createTestUser({
      id: stuBId,
      email: 'learn-b@cdes.test',
      password: 'Password123!',
      role: 'student',
      name: 'Learn Student B',
      jwtSecret: srv.jwtSecret,
    });
    await createTestUser({
      id: 'usr-learn-adm',
      email: adminEmail,
      password: 'Password123!',
      role: 'admin',
      name: 'Obs Admin',
      jwtSecret: srv.jwtSecret,
    });

    const csrfA = await bootstrapCsrf(srv.baseUrl);
    const loginA = await fetch(`${srv.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrfA.cookie, 'X-CSRF-Token': csrfA.csrf },
      body: JSON.stringify({ email: stuAEmail, password: 'Password123!' }),
    });
    assert.strictEqual(loginA.status, 200);
    const jarA = loginA.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
    const tokA = loginA.headers.get('x-csrf-token') || csrfA.csrf;
    const hA = { 'Content-Type': 'application/json', Cookie: jarA, 'X-CSRF-Token': tokA };

    const csrfAdm = await bootstrapCsrf(srv.baseUrl);
    const loginAdm = await fetch(`${srv.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: csrfAdm.cookie, 'X-CSRF-Token': csrfAdm.csrf },
      body: JSON.stringify({ email: adminEmail, password: 'Password123!' }),
    });
    assert.strictEqual(loginAdm.status, 200);
    const jarAdm = loginAdm.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
    const hAdm = { 'Content-Type': 'application/json', Cookie: jarAdm };

    // 1. Health endpoints: /live, /ready, /health
    const liveRes = await fetch(`${srv.baseUrl}/api/health/live`);
    assert.strictEqual(liveRes.status, 200);
    const liveBody = (await liveRes.json()) as { live: boolean; uptimeSeconds: number };
    assert.strictEqual(liveBody.live, true);

    const readyRes = await fetch(`${srv.baseUrl}/api/health/ready`);
    assert.strictEqual(readyRes.status, 200);
    const readyBody = (await readyRes.json()) as { ready: boolean; database: { schemaVersion: number; integrity: string } };
    assert.strictEqual(readyBody.ready, true);
    assert.strictEqual(readyBody.database.integrity, 'ok');
    assert.ok(readyBody.database.schemaVersion >= 12);

    // 2. Metrics & Prometheus exposition (admin-only)
    const studentProm = await fetch(`${srv.baseUrl}/api/metrics/prometheus`, { headers: { Cookie: jarA } });
    assert.strictEqual(studentProm.status, 403, 'Student must not access Prometheus metrics');

    const adminMetrics = await fetch(`${srv.baseUrl}/api/metrics`, { headers: hAdm });
    assert.strictEqual(adminMetrics.status, 200);
    const mJson = (await adminMetrics.json()) as {
      process: { memoryBytes: { rss: number; heapUsed: number }; eventLoopDelayP95Ms: number };
      database: { dbSizeBytes: number; schemaVersion: number };
    };
    assert.ok(mJson.process.memoryBytes.rss > 0);
    assert.ok(mJson.database.dbSizeBytes > 0);

    const adminProm = await fetch(`${srv.baseUrl}/api/metrics/prometheus`, { headers: hAdm });
    assert.strictEqual(adminProm.status, 200);
    const promText = await adminProm.text();
    assert.ok(promText.includes('cdes_http_requests_total'));
    assert.ok(promText.includes('cdes_sqlite_schema_version'));
    assert.ok(promText.includes('cdes_process_resident_memory_bytes'));

    // 3. Learning catalog & paths routes
    const subjectsRes = await fetch(`${srv.baseUrl}/api/learning/subjects`);
    assert.strictEqual(subjectsRes.status, 200);
    const contentRes = await fetch(`${srv.baseUrl}/api/learning/content`);
    assert.strictEqual(contentRes.status, 200);
    const pathsRes = await fetch(`${srv.baseUrl}/api/learning/paths`, { headers: hA });
    assert.strictEqual(pathsRes.status, 200);
    const pathsForbidden = await fetch(`${srv.baseUrl}/api/learning/paths?studentId=${stuBId}`, { headers: hA });
    assert.strictEqual(pathsForbidden.status, 403, 'Must enforce ownership on /api/learning/paths');

    // 4. Learning science routes: BKT mastery update + ZPD + retention forecast + ownership guard
    const mastUpdate = await fetch(`${srv.baseUrl}/api/learning-science/mastery/update`, {
      method: 'POST',
      headers: hA,
      body: JSON.stringify({
        conceptId: 'calc_limits_01',
        conceptName: 'Limits at Infinity',
        subject: 'Mathematics',
        isCorrect: true,
      }),
    });
    assert.strictEqual(mastUpdate.status, 200);
    const mastJson = (await mastUpdate.json()) as { data: { updatedMastery: number } };
    assert.ok(mastJson.data.updatedMastery > 0.15);

    const zpdRes = await fetch(`${srv.baseUrl}/api/learning-science/zpd/${stuAId}`, { headers: hA });
    assert.strictEqual(zpdRes.status, 200);
    const zpdForbidden = await fetch(`${srv.baseUrl}/api/learning-science/zpd/${stuBId}`, { headers: hA });
    assert.strictEqual(zpdForbidden.status, 403);

    const forecastRes = await fetch(`${srv.baseUrl}/api/learning-science/retention-forecast`, {
      method: 'POST',
      headers: hA,
      body: JSON.stringify({ daysElapsed: 7, reviewCount: 2 }),
    });
    assert.strictEqual(forecastRes.status, 200);

    // 5. Student intelligence profile routes + cross-student ownership isolation
    const intelSelf = await fetch(`${srv.baseUrl}/api/student/profile/intelligence`, { headers: hA });
    assert.strictEqual(intelSelf.status, 200);
    const intelOther = await fetch(`${srv.baseUrl}/api/student/profile/intelligence/${stuBId}`, { headers: hA });
    assert.strictEqual(intelOther.status, 403, 'Student A must not read Student B intelligence profile');

    const aiCtx = await fetch(`${srv.baseUrl}/api/student/profile/ai-context`, { headers: hA });
    assert.strictEqual(aiCtx.status, 200);

    // 6. Platform architecture & monitoring return honest single-node telemetry (not fabricated 12,400 RPS)
    const archRes = await fetch(`${srv.baseUrl}/api/platform/architecture`, { headers: hAdm });
    assert.strictEqual(archRes.status, 200);
    const archJson = (await archRes.json()) as { deploymentMode: string; simulated: boolean; cluster: { activePods: number } };
    assert.strictEqual(archJson.deploymentMode, 'single_node_sqlite_wal');
    assert.strictEqual(archJson.simulated, false);
    assert.strictEqual(archJson.cluster.activePods, 1);

    console.log('✓ learningAndIntelligenceRoutes.test.ts passed');
  } finally {
    await srv.close();
  }
}

run().catch((err) => {
  console.error('learningAndIntelligenceRoutes.test.ts failed:', err);
  process.exit(1);
});
