#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const testsDir = path.join(process.cwd(), 'server', 'tests');
const filterArg = process.argv[2]?.trim();

const testFiles = fs
  .readdirSync(testsDir)
  .filter((file) => file.endsWith('.test.ts'))
  .filter((file) => !filterArg || file.includes(filterArg))
  .sort()
  .map((file) => path.join('server', 'tests', file));

if (testFiles.length === 0) {
  console.error('No matching server/tests/*.test.ts suites found.');
  process.exit(1);
}

const tsxCli = path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');
const env = { ...process.env, GEMINI_API_KEY: '' };

const results = [];
for (const testFile of testFiles) {
  const startedAt = Date.now();
  console.log(`\n[test] Running ${testFile} ...`);
  const res = spawnSync(process.execPath, [tsxCli, testFile], {
    stdio: 'inherit',
    env,
  });
  const durationMs = Date.now() - startedAt;
  const passed = res.status === 0;
  results.push({ testFile, passed, exitCode: res.status ?? 1, durationMs });
}

const passedCount = results.filter((r) => r.passed).length;
const failedResults = results.filter((r) => !r.passed);
const totalMs = results.reduce((sum, r) => sum + r.durationMs, 0);

console.log('\n================ TEST SUMMARY ================');
for (const r of results) {
  const mark = r.passed ? 'PASS' : 'FAIL';
  console.log(`  [${mark}] ${r.testFile} (${r.durationMs}ms)`);
}
console.log(
  `Total: ${passedCount}/${results.length} passed, ${failedResults.length} failed (${(totalMs / 1000).toFixed(2)}s)`
);

const junitPath = process.env.JUNIT_OUTPUT_PATH;
if (junitPath) {
  const esc = (s) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  const cases = results
    .map((r) => {
      const secs = (r.durationMs / 1000).toFixed(3);
      if (r.passed) {
        return `  <testcase classname="cdes.server" name="${esc(r.testFile)}" time="${secs}" />`;
      }
      return `  <testcase classname="cdes.server" name="${esc(r.testFile)}" time="${secs}"><failure message="Exited with code ${r.exitCode}" /></testcase>`;
    })
    .join('\n');
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<testsuite name="cdes-server-tests" tests="${results.length}" failures="${failedResults.length}" time="${(totalMs / 1000).toFixed(3)}">\n` +
    `${cases}\n</testsuite>\n`;
  fs.mkdirSync(path.dirname(path.resolve(junitPath)), { recursive: true });
  fs.writeFileSync(junitPath, xml, 'utf8');
  console.log(`Wrote JUnit XML report to ${junitPath}`);
}

process.exit(failedResults.length > 0 ? 1 : 0);
