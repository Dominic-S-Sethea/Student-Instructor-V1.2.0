import assert from 'node:assert';
import fs from 'node:fs';
import { mkdtempSync, rmSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { closeDatabase, getDatabase } from '../db/connection';
import { runMigrations } from '../db/migrate';
import { purgeExpiredSoftDeleted, runRetentionCleanup } from '../services/retentionService';
import { createApp } from '../app';

const execFileAsync = promisify(execFile);

async function withTempServer(runFn: (baseUrl: string) => Promise<void>): Promise<void> {
  const app = createApp({ serveStatic: false, disableRateLimit: true });
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  try {
    await runFn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

async function run(): Promise<void> {
  process.env.GEMINI_API_KEY = '';
  process.env.JWT_SECRET = `test-jwt-${Date.now()}`;
  const workDir = mkdtempSync(join(tmpdir(), 'cdes-mig-'));

  try {
    // 1. Fresh install in production mode must seed 0 demo users
    const prodDb = join(workDir, 'prod.db');
    process.env.DATABASE_PATH = prodDb;
    process.env.NODE_ENV = 'production';
    const prodRes = runMigrations({ seedCatalog: true, seedDemo: false });
    assert.strictEqual(prodRes.success, true);
    assert.strictEqual(prodRes.schemaVersion, 12);
    const db = getDatabase();
    const userCount = (db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number }).c;
    assert.strictEqual(userCount, 0, 'Production startup must create zero demo users');
    const schCount = (db.prepare('SELECT COUNT(*) AS c FROM scholarships').get() as { c: number }).c;
    assert(schCount >= 5, 'Catalog scholarships must still be seeded in production');
    const idxRow = db
      .prepare("SELECT name FROM sqlite_master WHERE type='index' AND name = 'idx_change_history_entity_time'")
      .get() as { name?: string } | undefined;
    assert.strictEqual(idxRow?.name, 'idx_change_history_entity_time', 'Migration 010 indexes must be created');
    const fkList = db.prepare('PRAGMA foreign_key_list(hermes_memory_facts)').all() as Array<{ table: string }>;
    assert(fkList.some((fk) => fk.table === 'users'), 'hermes_memory_facts must reference users(id)');
    const savedFks = db.prepare('PRAGMA foreign_key_list(user_saved_scholarships)').all() as Array<{ table: string }>;
    assert(savedFks.some((fk) => fk.table === 'scholarships'), 'user_saved_scholarships must reference scholarships(id)');
    closeDatabase();

    // 2. Upgrade from legacy schema fixture (prior to 008) & restart persistence
    const upgDbPath = join(workDir, 'upgrade.db');
    process.env.DATABASE_PATH = upgDbPath;
    process.env.NODE_ENV = 'development';
    const seedPass = `Upgr@de-${Date.now()}`;
    process.env.ADMIN_SEED_PASSWORD = seedPass;
    process.env.STUDENT_SEED_PASSWORD = seedPass;
    process.env.ORG_SEED_PASSWORD = seedPass;

    // Seed base tables without 008 columns by stopping migrations at v007 (including 002-007 deleted_at columns)
    const upgDb = getDatabase();
    upgDb.exec(fs.readFileSync(join(process.cwd(), 'server', 'db', 'schema.sql'), 'utf8'));
    upgDb.exec(`
      ALTER TABLE activity_events ADD COLUMN deleted_at TEXT;
      ALTER TABLE learning_events ADD COLUMN deleted_at TEXT;
      ALTER TABLE game_events ADD COLUMN deleted_at TEXT;
      ALTER TABLE game_telemetry_events ADD COLUMN deleted_at TEXT;
      ALTER TABLE ai_interaction_analytics_events ADD COLUMN deleted_at TEXT;
      ALTER TABLE cdes_analytics_events_stream ADD COLUMN deleted_at TEXT;
      CREATE TABLE IF NOT EXISTS schema_version (schema_version INTEGER DEFAULT 0);
      INSERT INTO schema_version (schema_version) VALUES (7);
    `);
    const mig7Now = new Date().toISOString();
    upgDb.prepare(`
      INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at)
      VALUES ('usr-legacy-1', 'legacy@cdes.edu.kh', 'hash', 'student', 'active', ?, ?)
    `).run(mig7Now, mig7Now);
    closeDatabase();

    // Upgrade to v12
    const upgRes = runMigrations({ seedCatalog: true, seedDemo: true });
    assert.strictEqual(upgRes.schemaVersion, 12);
    assert(upgRes.appliedMigrations.some((m) => m.includes('008')));
    assert(upgRes.appliedMigrations.some((m) => m.includes('009')));
    assert(upgRes.appliedMigrations.some((m) => m.includes('010')));
    assert(upgRes.appliedMigrations.some((m) => m.includes('011')));
    assert(upgRes.appliedMigrations.some((m) => m.includes('012')));
    const upgradedRow = getDatabase()
      .prepare('SELECT id, email FROM users WHERE id = ?')
      .get('usr-legacy-1') as { id: string; email: string } | undefined;
    assert.strictEqual(upgradedRow?.email, 'legacy@cdes.edu.kh', 'Legacy user must be preserved on upgrade');

    // Restart simulation preserves state
    closeDatabase();
    runMigrations({ seedCatalog: true, seedDemo: false });
    await withTempServer(async (baseUrl) => {
      const healthRes = await fetch(`${baseUrl}/api/health`);
      assert.strictEqual(healthRes.status, 200);
      const healthJson = (await healthRes.json()) as { status: string; aiEnabled: boolean; database: { schemaVersion: number } };
      assert.strictEqual(healthJson.status, 'ok');
      assert.strictEqual(healthJson.aiEnabled, false);
      assert.strictEqual(healthJson.database.schemaVersion, 12);
    });

    // 3. Backup & Restore drill into new location
    const backupFile = join(workDir, 'backup.db');
    const restoredDb = join(workDir, 'restored.db');
    await execFileAsync(process.execPath, [
      join(process.cwd(), 'server', 'db', 'backupRestore.mjs'),
      'backup',
      upgDbPath,
      backupFile,
    ]);
    await execFileAsync(process.execPath, [
      join(process.cwd(), 'server', 'db', 'backupRestore.mjs'),
      'restore',
      backupFile,
      restoredDb,
    ]);
    closeDatabase();
    process.env.DATABASE_PATH = restoredDb;
    runMigrations({ seedCatalog: false, seedDemo: false });
    await withTempServer(async (baseUrl) => {
      const listRes = await fetch(`${baseUrl}/api/scholarships`);
      assert.strictEqual(listRes.status, 200);
      const listJson = (await listRes.json()) as { totalCount: number };
      assert(listJson.totalCount >= 5);
    });
    const restoredLegacy = getDatabase()
      .prepare('SELECT id FROM users WHERE id = ?')
      .get('usr-legacy-1') as { id: string } | undefined;
    assert.strictEqual(restoredLegacy?.id, 'usr-legacy-1', 'Restored DB must retain custom rows');

    // 4. Retention purge works cleanly against configured DATABASE_PATH
    const purgeCount = await purgeExpiredSoftDeleted('activity_events', 0);
    assert.strictEqual(typeof purgeCount, 'number');
    const cleanupRes = await runRetentionCleanup();
    assert.strictEqual(typeof cleanupRes.analytics.activity_events_purged, 'number');

    // 5. Failed migration rolls back without deleting DB and leaves service unready (503)
    const badMigDir = join(workDir, 'bad-migs');
    fs.mkdirSync(badMigDir, { recursive: true });
    fs.writeFileSync(join(badMigDir, '099_broken.sql'), 'ALTER TABLE nonexistent_table ADD COLUMN foo TEXT;', 'utf8');
    let failedAsExpected = false;
    try {
      runMigrations({ migrationsDir: badMigDir, seedCatalog: false, seedDemo: false });
    } catch {
      failedAsExpected = true;
    }
    assert.strictEqual(failedAsExpected, true, 'Broken migration must throw');
    assert.strictEqual(fs.existsSync(restoredDb), true, 'Original DB file must remain intact after failure');

    await withTempServer(async (baseUrl) => {
      const failHealth = await fetch(`${baseUrl}/api/health`);
      assert.strictEqual(failHealth.status, 503, 'Health check must report 503 when schema migration failed');
    });

    console.log('✓ startupAndMigrations.test.ts passed');
  } finally {
    closeDatabase();
    rmSync(workDir, { recursive: true, force: true });
  }
}

run().catch((err) => {
  console.error('startupAndMigrations.test.ts failed:', err);
  process.exit(1);
});
