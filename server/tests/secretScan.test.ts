import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
const ROOT = process.cwd();
const SCAN_DIRS = [join(ROOT, "server"), join(ROOT, "src")];
const EXCLUDE_DIRS = new Set(["node_modules", "dist", "coverage", ".git", "__tests__"]);
const SECRET_PATTERNS: Array<[string, RegExp]> = [
  ["google-api-key", /AIza[0-9A-Za-z_-]{35}/],
  ["openai-secret-key", /sk-[A-Za-z0-9]{20,}/],
  ["github-classic-token", /ghp_[A-Za-z0-9]{36}/],
  ["aws-access-key-id", /AKIA[0-9A-Z]{16}/],
  ["bcrypt-hash-literal", /\$2[aby]\$[0-9]{2}\$[A-Za-z0-9.\/]{53}/],
];
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) out.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith(".ts") && !/\.(test|spec)\.ts$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}
function lineOf(content: string, index: number): number {
  return content.slice(0, index).split("\n").length;
}
const findings: string[] = [];
console.log("=== SEC-001 Secret-Scan Regression (npm test) ===\n");
for (const dir of SCAN_DIRS) {
  const st = statSync(dir, { throwIfNoEntry: false });
  if (!st || !st.isDirectory()) continue;
  for (const file of walk(dir)) {
    const content = readFileSync(file, "utf8");
    const rel = file.slice(ROOT.length + 1).replace(/\\/g, "/");
    for (const [name, re] of SECRET_PATTERNS) {
      const regex = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
      for (const match of content.matchAll(regex)) {
        const start = content.lastIndexOf("\n", match.index ?? 0) + 1;
        const end = content.indexOf("\n", match.index ?? 0);
        const line = content.slice(start, end === -1 ? content.length : end);
        if (/process\.env/.test(line) || /sample|placeholder|example|your_?api|xxx{1,}/i.test(line)) continue;
        findings.push(rel + ":" + lineOf(content, match.index ?? 0) + " " + name + " [REDACTED]");
      }
    }
  }
}
if (findings.length > 0) {
  console.error("FAIL: hardcoded secrets detected in source (SEC-001):");
  for (const f of findings) console.error("  - " + f);
  process.exit(1);
}
console.log("PASS: no hardcoded production secrets in server/ and src/.");
process.exit(0);
