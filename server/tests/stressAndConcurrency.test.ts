import assert from 'node:assert';
import { getDatabase, getDbMetrics } from '../db/connection';
import { createPhaseTestServer, createUserAndLogin, type LoggedInTestClient } from './helpers/httpTestHelper';

function p95(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil(0.95 * sorted.length) - 1);
  return sorted[Math.max(0, idx)] || 0;
}

async function run(): Promise<void> {
  const ctx = await createPhaseTestServer('cdes-w4-conc-');
  try {
    const clients: LoggedInTestClient[] = [];
    for (let i = 0; i < 6; i++) {
      const c = await createUserAndLogin(ctx.baseUrl, `usr-conc-${i}`, `conc${i}@cdes.test`, 'student');
      await c.request('POST', '/api/privacy/consent', {
        isMinor: false,
        allowAnalyticsTracking: true,
        allowAiMemory: true,
      });
      clients.push(c);
    }

    const catRes = await fetch(`${ctx.baseUrl}/api/scholarships`);
    const schIds = ((await catRes.json()) as { scholarships: Array<{ id: string }> }).scholarships
      .slice(0, 5)
      .map((s) => s.id);

    const latencies: number[] = [];
    let errors5xx = 0;
    let non2xx = 0;

    const workerCount = 20;
    const rounds = 12;
    await Promise.all(
      Array.from({ length: workerCount }, async (_, w) => {
        const user = clients[w % clients.length];
        for (let r = 0; r < rounds; r++) {
          const t0 = performance.now();
          let status = 500;
          const kind = (w + r) % 6;
          if (kind === 0) {
            status = (await fetch(`${ctx.baseUrl}/api/scholarships`)).status;
          } else if (kind === 1) {
            status = (await fetch(`${ctx.baseUrl}/api/universities`)).status;
          } else if (kind === 2) {
            status = (await user.request('GET', '/api/users/profile')).status;
          } else if (kind === 3) {
            status = (
              await user.request('POST', '/api/scholarships/saved', {
                scholarshipId: schIds[(w + r) % schIds.length],
                status: 'preparing',
              })
            ).status;
          } else if (kind === 4) {
            status = (
              await user.request('POST', '/api/memory/facts', {
                factText: `Concurrent study note w${w}-r${r}`,
                category: 'study_habit',
              })
            ).status;
          } else {
            status = (
              await user.request('POST', '/api/decision/evaluate', {
                interests: ['Technology'],
                mathAbility: 'moderate_math',
                budgetTier: 'low_under_1000',
              })
            ).status;
          }
          latencies.push(performance.now() - t0);
          if (status >= 500) errors5xx += 1;
          if (status < 200 || status >= 300) non2xx += 1;
        }
      })
    );

    assert.strictEqual(latencies.length, workerCount * rounds);
    assert.strictEqual(errors5xx, 0, 'Concurrent mixed workload must produce zero 5xx errors');
    assert.strictEqual(non2xx, 0, 'Concurrent mixed workload must produce zero non-2xx responses');
    const p95Ms = p95(latencies);
    assert.ok(p95Ms < 500, `Expected p95 < 500ms, got ${p95Ms.toFixed(1)}ms`);

    const db = getDatabase();
    const integrity = (db.prepare('PRAGMA integrity_check').get() as { integrity_check?: string })?.integrity_check;
    assert.strictEqual(integrity, 'ok', 'Post-concurrency SQLite integrity_check must be ok');
    const fkRows = db.prepare('PRAGMA foreign_key_check').all();
    assert.strictEqual(fkRows.length, 0, 'Post-concurrency foreign_key_check must have 0 violations');

    const metrics = getDbMetrics().toJSON();
    assert.strictEqual(metrics.busyTimeoutRetries, 0, 'SQLite WAL mode must have 0 busy-timeout failures');
    assert.ok(metrics.writeOps > 40, 'Workload must exercise real concurrent SQLite writes');

    console.log(
      `✓ stressAndConcurrency.test.ts passed (${latencies.length} reqs, p95=${p95Ms.toFixed(1)}ms, writes=${metrics.writeOps}, busyRetries=0)`
    );
  } finally {
    await ctx.cleanup();
  }
}

run().catch((err) => {
  console.error('stressAndConcurrency.test.ts failed:', err);
  process.exit(1);
});
