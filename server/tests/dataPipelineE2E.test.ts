import assert from 'node:assert';
import { getDatabase } from '../db/connection';
import { hermesMemoryService } from '../services/hermesMemoryService';
import {
  ERASURE_EXEMPT_TABLES,
  ERASURE_SPECS,
  verifyAnonymizedExportIntegrity,
} from '../services/dataPipelineValidator';
import type { AnonymizedResearchDataPoint } from '../types/analytics';
import { createPhaseTestServer, createUserAndLogin } from './helpers/httpTestHelper';

async function run(): Promise<void> {
  const ctx = await createPhaseTestServer('cdes-w3-pipeline-');
  try {
    const stuUncons = await createUserAndLogin(ctx.baseUrl, 'usr-pipe-u', 'pipeu@cdes.test', 'student');
    const stuCons = await createUserAndLogin(ctx.baseUrl, 'usr-pipe-c', 'pipec@cdes.test', 'student');
    const admin = await createUserAndLogin(ctx.baseUrl, 'usr-pipe-adm', 'pipeadm@cdes.test', 'admin');

    // 1. Unconsented student: analytics ingestion fails closed (0 DB rows written)
    const blockedTrack = await stuUncons.request('POST', '/api/analytics/track', {
      eventType: 'lesson_completed',
      contentId: 'math-bac2-01',
      score: 95,
      timeSpent: 240,
    });
    assert.strictEqual(blockedTrack.status, 200);
    assert.strictEqual(blockedTrack.json.persisted, false);
    const db = getDatabase();
    assert.strictEqual(
      (db.prepare('SELECT COUNT(*) AS c FROM learning_events WHERE student_id = ?').get('usr-pipe-u') as { c: number }).c,
      0
    );

    // 2. Consented student: PII scrubbed on ingestion across analytics & metadata
    const grantRes = await stuCons.request('POST', '/api/privacy/consent', {
      isMinor: false,
      allowAnalyticsTracking: true,
      allowResearchInclusion: true,
      allowAiMemory: true,
    });
    assert.strictEqual(grantRes.status, 200);

    const trackPii = await stuCons.request('POST', '/api/analytics/track', {
      eventType: 'search',
      duration: 999999, // must clamp to 86400
      metadata: {
        searchQuery: 'CADT contact 012 888 777 or private.user@gmail.com or t.me/studentleak',
        password: 'should-be-stripped-secret',
        schoolEmail: 'admissions@cadt.edu.kh',
      },
    });
    assert.strictEqual(trackPii.status, 201);
    assert.strictEqual(trackPii.json.persisted, true);

    const actRow = db
      .prepare('SELECT duration, metadata FROM activity_events WHERE student_id = ? ORDER BY timestamp DESC LIMIT 1')
      .get('usr-pipe-c') as { duration: number; metadata: string };
    assert.strictEqual(actRow.duration, 86400, 'Outlier duration must clamp to 86400s');
    assert.ok(!actRow.metadata.includes('012 888 777'), 'Cambodian phone must be scrubbed before persistence');
    assert.ok(!actRow.metadata.includes('private.user@gmail.com'), 'Personal email must be scrubbed');
    assert.ok(!actRow.metadata.includes('t.me/studentleak'), 'Telegram handle must be scrubbed');
    assert.ok(!actRow.metadata.includes('should-be-stripped-secret'), 'Blocked secret keys must be dropped');
    assert.ok(actRow.metadata.includes('admissions@cadt.edu.kh'), 'Institutional .edu.kh email preserved');

    // Also add learning event, Hermes fact, and research experiment enrollment
    const learnTrack = await stuCons.request('POST', '/api/analytics/track', {
      eventType: 'lesson_completed',
      contentId: 'cs-alg-01',
      score: 92,
      timeSpent: 300,
    });
    assert.strictEqual(learnTrack.status, 201);
    hermesMemoryService.addFact('usr-pipe-c', { factText: 'Targeting CADT AI Engineering', category: 'goal' });

    // 3. Anonymized research export includes consented student with zero raw PII
    const exportRes = await admin.request('GET', '/api/research/anonymized-dataset');
    assert.strictEqual(exportRes.status, 200);
    const dataset = exportRes.json.data as AnonymizedResearchDataPoint[];
    assert.ok(dataset.length >= 1, 'Consented student must appear in anonymized research export');
    const audit = verifyAnonymizedExportIntegrity(dataset);
    assert.strictEqual(audit.valid, true, `Anonymized export audit failed: ${audit.violations.join('; ')}`);

    // Seed saved scholarship bookmark + notification before erasure
    const schRow = db.prepare('SELECT id FROM scholarships WHERE is_deleted = 0 LIMIT 1').get() as { id: string } | undefined;
    if (schRow) {
      const saveRes = await stuCons.request('POST', '/api/scholarships/saved', {
        scholarshipId: schRow.id,
        targetNote: 'Private personal essay note',
      });
      assert.strictEqual(saveRes.status, 201);
    }
    db.prepare(
      "INSERT INTO user_notifications (id, user_id, category, title, body, is_read, created_at) VALUES ('ntf-erase-1', 'usr-pipe-c', 'system', 'Test', 'Body', 0, ?)"
    ).run(new Date().toISOString());

    // 4. Right-to-Erasure wipes all optional pipeline tables & excludes student from subsequent export
    const eraseRes = await stuCons.request('POST', '/api/privacy/erasure');
    assert.strictEqual(eraseRes.status, 200);
    assert.ok(Number(eraseRes.json.totalRowsErased) >= 4, 'Right-to-erasure must delete persisted pipeline, bookmark, and notification rows');
    assert.strictEqual((eraseRes.json.data as { consentStatus: string }).consentStatus, 'withdrawn');

    for (const [tbl, col] of [
      ['activity_events', 'student_id'],
      ['learning_events', 'student_id'],
      ['student_intelligence_profile', 'student_id'],
      ['hermes_memory_facts', 'user_id'],
      ['hermes_student_memory_docs', 'user_id'],
      ['user_saved_scholarships', 'user_id'],
      ['user_notifications', 'user_id'],
    ] as const) {
      const remaining = (db.prepare(`SELECT COUNT(*) AS c FROM ${tbl} WHERE ${col} = ?`).get('usr-pipe-c') as { c: number }).c;
      assert.strictEqual(remaining, 0, `${tbl} must have 0 rows after right-to-erasure`);
    }

    // 5. Schema completeness check: every table with student_id or user_id must be in ERASURE_SPECS or ERASURE_EXEMPT_TABLES
    const coveredTables = new Set(ERASURE_SPECS.map((s) => s.table));
    const allTables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .all() as Array<{ name: string }>;
    const uncovered: string[] = [];
    for (const { name } of allTables) {
      const cols = db.prepare(`PRAGMA table_info(${name})`).all() as Array<{ name: string }>;
      if (cols.some((c) => c.name === 'student_id' || c.name === 'user_id')) {
        if (!coveredTables.has(name) && !ERASURE_EXEMPT_TABLES.has(name)) {
          uncovered.push(name);
        }
      }
    }
    assert.deepStrictEqual(uncovered, [], `Tables with student_id/user_id missing from ERASURE_SPECS/ERASURE_EXEMPT_TABLES: ${uncovered.join(', ')}`);

    const postEraseExport = await admin.request('GET', '/api/research/anonymized-dataset');
    assert.strictEqual(postEraseExport.status, 200);
    assert.strictEqual(
      (postEraseExport.json.data as unknown[]).length,
      0,
      'Erased & withdrawn student must immediately vanish from anonymized research export'
    );

    console.log('✓ dataPipelineE2E.test.ts passed');
  } finally {
    await ctx.cleanup();
  }
}

run().catch((err) => {
  console.error('dataPipelineE2E.test.ts failed:', err);
  process.exit(1);
});
