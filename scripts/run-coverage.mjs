import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const coverageDir = path.join(process.cwd(), '.coverage-v8');
fs.rmSync(coverageDir, { recursive: true, force: true });
fs.mkdirSync(coverageDir, { recursive: true });

const testFiles = [
  'server/tests/backend.test.ts',
  'server/tests/secretScan.test.ts',
  'server/tests/startupAndMigrations.test.ts',
  'server/tests/authOwnershipConsent.test.ts',
  'server/tests/catalogAccuracyAndEditorial.test.ts',
  'server/tests/guidanceAndPackaging.test.ts',
].filter((file) => fs.existsSync(path.join(process.cwd(), file)));

const tsxCli = path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');
const env = { ...process.env, NODE_V8_COVERAGE: coverageDir };

for (const testFile of testFiles) {
  console.log(`\n[coverage] Running ${testFile} ...`);
  const res = spawnSync(process.execPath, [tsxCli, testFile], {
    stdio: 'inherit',
    env,
  });
  if (res.status !== 0) {
    fs.rmSync(coverageDir, { recursive: true, force: true });
    process.exit(res.status || 1);
  }
}

const covFiles = fs.readdirSync(coverageDir).filter((f) => f.endsWith('.json'));
const serverFilesCovered = new Set();
let totalFuncs = 0;
let coveredFuncs = 0;

for (const covFile of covFiles) {
  const payload = JSON.parse(fs.readFileSync(path.join(coverageDir, covFile), 'utf8'));
  for (const script of payload.result || []) {
    if (typeof script.url !== 'string') continue;
    const normalized = script.url.replace(/\\/g, '/');
    if (!normalized.includes('/server/') || normalized.includes('/server/tests/')) continue;
    serverFilesCovered.add(normalized);
    for (const fn of script.functions || []) {
      totalFuncs += 1;
      if ((fn.ranges || []).some((r) => r.count > 0)) {
        coveredFuncs += 1;
      }
    }
  }
}

fs.rmSync(coverageDir, { recursive: true, force: true });

const pct = totalFuncs > 0 ? ((coveredFuncs / totalFuncs) * 100).toFixed(1) : '0.0';
console.log(`\n[coverage] Server modules executed: ${serverFilesCovered.size}, functions hit: ${coveredFuncs}/${totalFuncs} (${pct}%)`);

if (serverFilesCovered.size === 0 || coveredFuncs === 0) {
  console.error('Coverage gate failed: zero server functions covered.');
  process.exit(1);
}
