import { getDatabase, getDbMetrics } from '../server/db/connection';
import { createPhaseTestServer, createUserAndLogin, type LoggedInTestClient } from '../server/tests/helpers/httpTestHelper';

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return Number(sorted[idx].toFixed(2));
}

async function runStressTest(): Promise<void> {
  const workers = Math.max(4, Number(process.env.STRESS_WORKERS || 32));
  const rounds = Math.max(5, Number(process.env.STRESS_ROUNDS || 20));
  const ctx = await createPhaseTestServer('cdes-stress-');

  try {
    const users: LoggedInTestClient[] = [];
    for (let i = 0; i < 8; i++) {
      const client = await createUserAndLogin(ctx.baseUrl, `usr-stress-${i}`, `stress${i}@cdes.test`, 'student');
      await client.request('POST', '/api/privacy/consent', {
        isMinor: false,
        allowAnalyticsTracking: true,
        allowAiMemory: true,
      });
      users.push(client);
    }

    const catRes = await fetch(`${ctx.baseUrl}/api/scholarships`);
    const catalog = ((await catRes.json()) as { scholarships: Array<{ id: string }> }).scholarships;
    const schIds = catalog.slice(0, 6).map((s) => s.id);

    const memBefore = process.memoryUsage();
    const latencies: number[] = [];
    const statusCounts: Record<string, number> = {};
    let error5xxCount = 0;
    const tStart = performance.now();

    const workerTask = async (workerId: number): Promise<void> => {
      const user = users[workerId % users.length];
      for (let r = 0; r < rounds; r++) {
        const slot = (workerId * rounds + r) % 20;
        const reqStart = performance.now();
        let status = 500;
        try {
          if (slot < 3) {
            status = (await fetch(`${ctx.baseUrl}/api/scholarships?q=Computer`)).status;
          } else if (slot < 5) {
            status = (await fetch(`${ctx.baseUrl}/api/universities`)).status;
          } else if (slot < 6) {
            status = (await fetch(`${ctx.baseUrl}/api/health`)).status;
          } else if (slot < 9) {
            status = (await user.request('GET', '/api/users/profile')).status;
          } else if (slot < 11) {
            status = (await user.request('GET', '/api/users/notifications')).status;
          } else if (slot < 15) {
            const schId = schIds[(workerId + r) % schIds.length];
            status = (await user.request('POST', '/api/scholarships/saved', { scholarshipId: schId })).status;
          } else if (slot < 18) {
            status = (
              await user.request('POST', '/api/memory/facts', {
                factText: `Stress study milestone w${workerId}-r${r}`,
                category: 'milestone',
              })
            ).status;
          } else {
            status = (
              await user.request('POST', '/api/decision/evaluate', {
                interests: ['Technology'],
                mathAbility: 'loves_math',
                budgetTier: 'low_under_1000',
              })
            ).status;
          }
        } catch {
          status = 599;
        }
        latencies.push(performance.now() - reqStart);
        statusCounts[String(status)] = (statusCounts[String(status)] || 0) + 1;
        if (status >= 500) error5xxCount += 1;
      }
    };

    await Promise.all(Array.from({ length: workers }, (_, idx) => workerTask(idx)));
    const durationMs = performance.now() - tStart;
    const memAfter = process.memoryUsage();
    latencies.sort((a, b) => a - b);

    const db = getDatabase();
    const integrity = (db.prepare('PRAGMA integrity_check').get() as { integrity_check?: string })?.integrity_check;
    const fkViolations = db.prepare('PRAGMA foreign_key_check').all().length;
    const sqlite = getDbMetrics().toJSON();

    const report = {
      status: error5xxCount === 0 && integrity === 'ok' && fkViolations === 0 && sqlite.busyTimeoutRetries === 0 ? 'PASS' : 'FAIL',
      workers,
      roundsPerWorker: rounds,
      totalRequests: latencies.length,
      durationMs: Number(durationMs.toFixed(1)),
      requestsPerSecond: Number(((latencies.length / durationMs) * 1000).toFixed(1)),
      statusCounts,
      error5xxCount,
      latencyMs: {
        p50: percentile(latencies, 50),
        p95: percentile(latencies, 95),
        p99: percentile(latencies, 99),
        max: percentile(latencies, 100),
      },
      memoryDeltaMb: {
        rss: Number(((memAfter.rss - memBefore.rss) / (1024 * 1024)).toFixed(2)),
        heapUsed: Number(((memAfter.heapUsed - memBefore.heapUsed) / (1024 * 1024)).toFixed(2)),
      },
      sqlite: {
        readOps: sqlite.readOps,
        writeOps: sqlite.writeOps,
        writerMax: sqlite.writerMax,
        busyTimeoutRetries: sqlite.busyTimeoutRetries,
        slowQueriesCount: sqlite.slowQueries.length,
        integrity,
        foreignKeyViolations: fkViolations,
      },
    };

    console.log(JSON.stringify(report, null, 2));
    if (report.status !== 'PASS') {
      process.exitCode = 1;
    }
  } finally {
    await ctx.cleanup();
  }
}

runStressTest().catch((err) => {
  console.error('Stress test crashed:', err);
  process.exit(1);
});
