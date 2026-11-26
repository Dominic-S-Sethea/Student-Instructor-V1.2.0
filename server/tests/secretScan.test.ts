import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = [
  join(ROOT, 'server'),
  join(ROOT, 'src'),
  join(ROOT, 'shared'),
  join(ROOT, 'scripts'),
  join(ROOT, '.github'),
];
const ROOT_FILES = [join(ROOT, 'server.ts'), join(ROOT, 'vite.config.ts')];
const EXCLUDE_DIRS = new Set(['node_modules', 'dist', 'coverage', '.coverage-v8', '.git', '__tests__']);
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.sh', '.yml', '.yaml']);

const SECRET_PATTERNS: Array<[string, RegExp]> = [
  ['google-api-key', /AIza[0-9A-Za-z_-]{35}/],
  ['openai-secret-key', /sk-[A-Za-z0-9]{20,}/],
  ['github-classic-token', /ghp_[A-Za-z0-9]{36}/],
  ['github-fine-grained-token', /github_pat_[A-Za-z0-9_]{22,}/],
  ['aws-access-key-id', /AKIA[0-9A-Z]{16}/],
  ['private-key-pem', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['bcrypt-hash-literal', /\$2[aby]\$[0-9]{2}\$[A-Za-z0-9./]{53}/],
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) out.push(...walk(full));
    } else if (
      entry.isFile() &&
      SCAN_EXTENSIONS.has(extname(entry.name).toLowerCase()) &&
      !/\.(test|spec)\.[a-z]+$/i.test(entry.name)
    ) {
      out.push(full);
    }
  }
  return out;
}

function lineOf(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

const filesToScan: string[] = [];
for (const dir of SCAN_DIRS) {
  const st = statSync(dir, { throwIfNoEntry: false });
  if (st?.isDirectory()) filesToScan.push(...walk(dir));
}
for (const rootFile of ROOT_FILES) {
  const st = statSync(rootFile, { throwIfNoEntry: false });
  if (st?.isFile()) filesToScan.push(rootFile);
}

const findings: string[] = [];
console.log(`=== SEC-001 Secret-Scan Regression (${filesToScan.length} files) ===\n`);

for (const file of filesToScan) {
  const content = readFileSync(file, 'utf8');
  const rel = file.slice(ROOT.length + 1).replace(/\\/g, '/');
  for (const [name, re] of SECRET_PATTERNS) {
    const regex = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
    for (const match of content.matchAll(regex)) {
      const start = content.lastIndexOf('\n', match.index ?? 0) + 1;
      const end = content.indexOf('\n', match.index ?? 0);
      const line = content.slice(start, end === -1 ? content.length : end);
      if (/sample|placeholder|example|your_?api|xxxx+/i.test(line)) continue;
      findings.push(`${rel}:${lineOf(content, match.index ?? 0)} ${name} [REDACTED]`);
    }
  }
}

if (findings.length > 0) {
  console.error('FAIL: hardcoded secrets detected in source (SEC-001):');
  for (const f of findings) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`PASS: no hardcoded production secrets across ${filesToScan.length} scanned files.`);
process.exit(0);
