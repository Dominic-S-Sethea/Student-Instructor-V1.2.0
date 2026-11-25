#!/usr/bin/env node
/**
 * Thin CLI notice / helper pointing to the canonical transactional TypeScript migration runner
 * (server/db/migrationRunner.ts via tsx) so standalone migrations never diverge on schema_migrations.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const root = process.cwd();
execFileSync(
  cmd,
  [
    'tsx',
    '-e',
    "import { runMigrations } from './server/db/migrate'; const r = runMigrations({ seedCatalog: true, seedDemo: false }); console.log(JSON.stringify(r, null, 2));",
  ],
  { cwd: root, stdio: 'inherit' }
);
