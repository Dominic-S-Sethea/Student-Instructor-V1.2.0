import assert from 'node:assert';
import fs, { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { closeDatabase, getDatabase } from '../db/connection';
import { runMigrations } from '../db/migrate';
import {
  cleanupAnalyticsEvents,
  cleanupHermesMemory,
  cleanupInactiveUsers,
} from '../services/retentionService';

const execFileAsync = promisify(execFile);

async function run(): Promise<void> {
  process.env.GEMINI_API_KEY = '';
  process.env.NODE_ENV = 'development';
  const workDir = mkdtempSync(join(tmpdir(), 'cdes-p6-'));

  try {
    // 1. Fail closed when migrationsDir is missing or empty
    const emptyMigDir = join(workDir, 'empty-migs');
    fs.mkdirSync(emptyMigDir, { recursive: true });
    process.env.DATABASE_PATH = join(workDir, 'fail-closed.db');
    assert.throws(
      () => runMigrations({ migrationsDir: join(workDir, 'nonexistent-dir'), seedCatalog: false, seedDemo: false }),
      /Migrations directory not found/
    );
    assert.throws(
      () => runMigrations({ migrationsDir: emptyMigDir, seedCatalog: false, seedDemo: false }),
      /No numbered SQL migration files found/
    );
    closeDatabase();

    // 2. v9 -> v10 upgrade preserves valid Hermes rows, drops orphans, enforces ON DELETE CASCADE
    const v9DbPath = join(workDir, 'v9-upgrade.db');
    process.env.DATABASE_PATH = v9DbPath;
    const v9MigDir = join(workDir, 'migs-v9');
    fs.mkdirSync(v9MigDir, { recursive: true });
    const srcMigsDir = join(process.cwd(), 'server', 'db', 'migrations');
    for (const file of fs.readdirSync(srcMigsDir)) {
      if (file.endsWith('.sql') && parseInt(file, 10) <= 9) {
        fs.copyFileSync(join(srcMigsDir, file), join(v9MigDir, file));
      }
    }
    const v9Res = runMigrations({ migrationsDir: v9MigDir, seedCatalog: false, seedDemo: false });
    assert.strictEqual(v9Res.schemaVersion, 9);

    const db9 = getDatabase();
    const now = new Date().toISOString();
    db9.prepare(
      'INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run('usr-v9-valid', 'v9@cdes.test', 'hash', 'student', 'active', now, now);
    db9.prepare(
      "INSERT INTO hermes_memory_facts (id, user_id, category, fact_text, status, source, created_at, updated_at) VALUES ('hf-valid', 'usr-v9-valid', 'goal', 'Valid fact', 'active', 'explicit_user', ?, ?)"
    ).run(now, now);
    db9.prepare(
      "INSERT INTO hermes_memory_facts (id, user_id, category, fact_text, status, source, created_at, updated_at) VALUES ('hf-orphan', 'usr-deleted-ghost', 'goal', 'Orphan fact', 'active', 'explicit_user', ?, ?)"
    ).run(now, now);
    closeDatabase();

    const v10Res = runMigrations({ seedCatalog: true, seedDemo: false });
    assert.ok(v10Res.schemaVersion >= 10);
    const db10 = getDatabase();
    assert.ok(db10.prepare('SELECT id FROM hermes_memory_facts WHERE id = ?').get('hf-valid'));
    assert.strictEqual(db10.prepare('SELECT id FROM hermes_memory_facts WHERE id = ?').get('hf-orphan'), undefined);

    // Deleting user must cascade to hermes_memory_facts
    db10.prepare('DELETE FROM users WHERE id = ?').run('usr-v9-valid');
    assert.strictEqual(
      db10.prepare('SELECT id FROM hermes_memory_facts WHERE id = ?').get('hf-valid'),
      undefined,
      'ON DELETE CASCADE must remove Hermes facts when user is deleted'
    );

    // 3. Retention protections: admins excluded, ai_conversations aged out, game_telemetry & Hermes purged
    const oldIso = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString();
    const veryOldIso = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString();
    db10.prepare(
      'INSERT INTO users (id, email, password_hash, role, status, last_login_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run('usr-p6-adm', 'adm@cdes.test', 'h', 'admin', 'active', oldIso, oldIso, oldIso);
    db10.prepare(
      'INSERT INTO users (id, email, password_hash, role, status, last_login_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run('usr-p6-stu', 'stu@cdes.test', 'h', 'student', 'active', oldIso, oldIso, oldIso);
    db10.prepare(
      'INSERT INTO users (id, email, password_hash, role, status, last_login_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run('usr-p6-withdrawn', 'wd@cdes.test', 'h', 'student', 'active', now, now, now);

    db10.prepare(
      "INSERT INTO ai_conversations (id, user_id, session_title, message, response, timestamp) VALUES ('conv-old', 'usr-p6-stu', 'Old', 'hi', 'hello', ?)"
    ).run(oldIso);
    const gameRow = db10.prepare('SELECT id FROM campus_educational_games LIMIT 1').get() as { id: string } | undefined;
    const gameId = gameRow?.id || 'game-p6-test';
    if (!gameRow) {
      db10.prepare(
        "INSERT INTO campus_educational_games (id, game_key, title_en, title_km, genre, stem_learning_objective, created_at) VALUES (?, 'quantum_stem_lab', 'P6 Test', 'តេស្ត', 'logic', 'Test', ?)"
      ).run(gameId, now);
    }
    db10.prepare(
      `INSERT INTO game_telemetry_events (
        id, student_id, game_id, session_id, event_type, trial_count,
        bkt_inferred_skill, prior_probability, posterior_probability, game_state_payload, timestamp, deleted_at
      ) VALUES ('gt-old', 'usr-p6-stu', ?, 'sess-old', 'puzzle_solved', 1, 'algebra', 0.5, 0.8, '{}', ?, ?)`
    ).run(gameId, veryOldIso, veryOldIso);
    db10.prepare(
      "INSERT INTO hermes_memory_facts (id, user_id, category, fact_text, status, source, created_at, updated_at) VALUES ('hf-ended-old', 'usr-p6-adm', 'goal', 'Ended', 'ended', 'explicit_user', ?, ?)"
    ).run(oldIso, oldIso);
    db10.prepare(
      "INSERT INTO student_privacy_consents (student_id, is_minor, consent_status, anonymized_research_id, consent_date, updated_at) VALUES ('usr-p6-withdrawn', 0, 'withdrawn', 'anon-wd', ?, ?)"
    ).run(now, now);
    db10.prepare(
      "INSERT INTO hermes_memory_facts (id, user_id, category, fact_text, status, source, created_at, updated_at) VALUES ('hf-wd', 'usr-p6-withdrawn', 'goal', 'Withdrawn', 'active', 'explicit_user', ?, ?)"
    ).run(now, now);

    const inactiveRes = await cleanupInactiveUsers();
    assert.strictEqual(inactiveRes.inactive_users_marked, 1, 'Only inactive non-admin user should be marked');
    const admRow = db10.prepare('SELECT is_deleted FROM users WHERE id = ?').get('usr-p6-adm') as { is_deleted: number };
    assert.strictEqual(admRow.is_deleted, 0, 'Admin accounts must never be soft-deleted by inactivity retention');

    const analyticsRes = await cleanupAnalyticsEvents();
    assert.strictEqual(analyticsRes.ai_conversations_purged, 1, 'Aged ai_conversations must be purged');
    assert.strictEqual(analyticsRes.game_telemetry_purged, 1, 'Expired game_telemetry_events must be purged');

    const hermesRes = await cleanupHermesMemory();
    assert.strictEqual(hermesRes.ended_facts_purged, 1, 'Ended Hermes facts older than 90d must be purged');
    assert.strictEqual(hermesRes.withdrawn_facts_purged, 1, 'Withdrawn user Hermes facts must be purged');

    // Insert a soft-deleted activity event for retention_cron.js --dry-run count check
    db10.prepare(
      "INSERT INTO activity_events (id, student_id, user_id, event_type, timestamp, duration, metadata, deleted_at) VALUES ('ae-dry-1', 'usr-p6-adm', 'usr-p6-adm', 'visit', ?, 10, '{}', '2025-01-01T00:00:00Z')"
    ).run(oldIso);
    closeDatabase();

    // 4. retention_cron.js --dry-run reports real matching_rows
    const dryRes = await execFileAsync(process.execPath, [
      join(process.cwd(), 'server', 'db', 'retention_cron.js'),
      '--db', v9DbPath,
      '--cutoff', '2025-06-01',
      '--tables', 'activity_events',
      '--dry-run',
    ]);
    assert.ok(dryRes.stdout.includes('matching_rows=1'), `Expected real dry-run row count, got: ${dryRes.stdout}`);

    // 5. backupRestore.mjs atomic backup/restore + same-path guard
    const backupScript = join(process.cwd(), 'server', 'db', 'backupRestore.mjs');
    await assert.rejects(() => execFileAsync(process.execPath, [backupScript, 'backup', v9DbPath, v9DbPath]));
    const bakPath = join(workDir, 'atomic-backup.db');
    const restPath = join(workDir, 'atomic-restored.db');
    const bakOut = await execFileAsync(process.execPath, [backupScript, 'backup', v9DbPath, bakPath]);
    const bakJson = JSON.parse(bakOut.stdout) as { integrity: string; schemaVersion: number };
    assert.strictEqual(bakJson.integrity, 'ok');
    assert.ok(bakJson.schemaVersion >= 10);
    await assert.rejects(() => execFileAsync(process.execPath, [backupScript, 'restore', bakPath, bakPath]));
    const restOut = await execFileAsync(process.execPath, [backupScript, 'restore', bakPath, restPath]);
    assert.strictEqual(JSON.parse(restOut.stdout).foreignKeyViolations, 0);

    // 6. check-audit-baseline.cjs MUST fail on 0 -> 1 high/critical regression
    const baseZero = join(workDir, 'base-zero.json');
    const curOne = join(workDir, 'cur-one.json');
    fs.writeFileSync(baseZero, JSON.stringify({ metadata: { vulnerabilities: { high: 0, critical: 0 } } }));
    fs.writeFileSync(curOne, JSON.stringify({ metadata: { vulnerabilities: { high: 1, critical: 0 } } }));
    await assert.rejects(
      () =>
        execFileAsync(process.execPath, [join(process.cwd(), '.github', 'scripts', 'check-audit-baseline.cjs')], {
          env: { ...process.env, AUDIT_BASELINE_PATH: baseZero, AUDIT_CURRENT_PATH: curOne },
        }),
      'check-audit-baseline.cjs must exit non-zero on 0 -> 1 high/critical regression'
    );

    console.log('✓ phase6ProductionReadiness.test.ts passed');
  } finally {
    closeDatabase();
    rmSync(workDir, { recursive: true, force: true });
  }
}

run().catch((err) => {
  console.error('phase6ProductionReadiness.test.ts failed:', err);
  process.exit(1);
});
