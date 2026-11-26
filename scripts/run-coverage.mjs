#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = process.cwd();
const v8TempDir = path.join(rootDir, '.coverage-v8');
const summaryOutPath = path.join(rootDir, 'coverage', 'summary.json');
const minCoveragePct = Number(process.env.MIN_COVERAGE_PCT ?? '50');

fs.rmSync(v8TempDir, { recursive: true, force: true });
fs.mkdirSync(v8TempDir, { recursive: true });

function walkTsFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'tests' || entry.name === 'types' || entry.name === 'migrations') continue;
      walkTsFiles(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      out.push(path.relative(rootDir, full).replace(/\\/g, '/'));
    }
  }
  return out;
}

const allServerSources = walkTsFiles(path.join(rootDir, 'server')).sort();

const testsDir = path.join(rootDir, 'server', 'tests');
const testFiles = fs
  .readdirSync(testsDir)
  .filter((file) => file.endsWith('.test.ts'))
  .sort()
  .map((file) => path.join('server', 'tests', file));

if (testFiles.length === 0) {
  console.error('Coverage gate failed: no server/tests/*.test.ts files found.');
  process.exit(1);
}

const tsxCli = path.join(rootDir, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const env = { ...process.env, GEMINI_API_KEY: '', LOG_LEVEL: process.env.LOG_LEVEL || 'warn', NODE_V8_COVERAGE: v8TempDir };

const failures = [];
for (const testFile of testFiles) {
  console.log(`\n[coverage] Running ${testFile} ...`);
  const res = spawnSync(process.execPath, [tsxCli, testFile], {
    stdio: 'inherit',
    env,
  });
  if (res.status !== 0) {
    failures.push({ testFile, status: res.status ?? 1 });
  }
}

if (failures.length > 0) {
  fs.rmSync(v8TempDir, { recursive: true, force: true });
  console.error('\n[coverage] Aborting coverage calculation due to failed suites:', failures);
  process.exit(1);
}

/**
 * Deduplicate V8 function coverage across child processes by
 * `(relPath, functionName, startOffset)` taking the max hit count across runs.
 */
const dedupFunctions = new Map();
const executedModules = new Set();

function toRelativeServerPath(scriptUrl) {
  if (typeof scriptUrl !== 'string') return null;
  let fsPath = scriptUrl;
  if (scriptUrl.startsWith('file://')) {
    try {
      fsPath = fileURLToPath(scriptUrl);
    } catch {
      return null;
    }
  }
  const rel = path.relative(rootDir, fsPath).replace(/\\/g, '/');
  if (!rel.startsWith('server/')) return null;
  if (rel.startsWith('server/tests/') || rel.startsWith('server/types/')) return null;
  if (!rel.endsWith('.ts')) return null;
  return rel;
}

const covFiles = fs.readdirSync(v8TempDir).filter((f) => f.endsWith('.json'));
for (const covFile of covFiles) {
  const payload = JSON.parse(fs.readFileSync(path.join(v8TempDir, covFile), 'utf8'));
  for (const script of payload.result || []) {
    const rel = toRelativeServerPath(script.url);
    if (!rel) continue;
    executedModules.add(rel);
    for (const fn of script.functions || []) {
      const ranges = fn.ranges || [];
      if (ranges.length === 0) continue;
      const startOffset = ranges[0].startOffset ?? 0;
      const key = `${rel}::${fn.functionName || '<anon>'}::${startOffset}`;
      const hit = ranges.some((r) => r.count > 0);
      const prev = dedupFunctions.get(key) || false;
      dedupFunctions.set(key, prev || hit);
    }
  }
}

fs.rmSync(v8TempDir, { recursive: true, force: true });

const totalFunctions = dedupFunctions.size;
let coveredFunctions = 0;
for (const hit of dedupFunctions.values()) {
  if (hit) coveredFunctions += 1;
}

const functionPct = totalFunctions > 0 ? Number(((coveredFunctions / totalFunctions) * 100).toFixed(1)) : 0;
const modulePct =
  allServerSources.length > 0
    ? Number(((executedModules.size / allServerSources.length) * 100).toFixed(1))
    : 0;
const unexecutedModules = allServerSources.filter((m) => !executedModules.has(m));

const summary = {
  generatedAt: new Date().toISOString(),
  suitesRun: testFiles.length,
  totalServerModules: allServerSources.length,
  executedServerModules: executedModules.size,
  moduleCoveragePct: modulePct,
  totalUniqueFunctions: totalFunctions,
  coveredUniqueFunctions: coveredFunctions,
  functionCoveragePct: functionPct,
  minCoveragePct,
  unexecutedModules,
};

fs.mkdirSync(path.dirname(summaryOutPath), { recursive: true });
fs.writeFileSync(summaryOutPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');

console.log(
  `\n[coverage] Suites: ${summary.suitesRun} | Modules: ${summary.executedServerModules}/${summary.totalServerModules} (${summary.moduleCoveragePct}%) | Unique functions: ${summary.coveredUniqueFunctions}/${summary.totalUniqueFunctions} (${summary.functionCoveragePct}%)`
);
console.log(`[coverage] Summary written to ${path.relative(rootDir, summaryOutPath)}`);

if (executedModules.size === 0 || coveredFunctions === 0) {
  console.error('Coverage gate failed: zero server functions covered.');
  process.exit(1);
}

if (functionPct < minCoveragePct) {
  console.error(
    `Coverage gate failed: deduplicated function coverage ${functionPct}% is below MIN_COVERAGE_PCT (${minCoveragePct}%).`
  );
  process.exit(1);
}
