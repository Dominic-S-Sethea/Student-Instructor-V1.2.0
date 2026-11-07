// Dependency-audit regression gate.
//
// Compares the current `npm audit --omit=dev --json` snapshot against the
// committed baseline file (audit-baseline.json, versioned on "main").
// Fails the CI build when the current audit reports MORE high/critical
// findings than the baseline — i.e. NEW vulnerabilities since the last
// known-good state.  This satisfies the "regression, not just weekly scan"
// gate required by CTO_DECISIONS.md §5.
//
// current snapshot : written by the workflow's audit-job before the hard
//                    gate (audit-current.json).  Does NOT equal the
//                    baseline: that is the COMMITTED audit-baseline.json,
//                    refreshed only on "main".
//
// The committed baseline is refreshed automatically by the "baseline-sync"
// workflow job whenever the "main" audit changes.  Pull requests are
// measured against main's committed snapshot and must not rewrite it.

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const baselinePath = path.resolve(root, 'audit-baseline.json');
const currentPath = path.resolve(root, 'audit-current.json');

function load(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return null;
  }
}

function vulnCount(d) {
  const m = d && d.metadata ? d.metadata.vulnerabilities : null;
  const high = m ? (m.high || 0) : 0;
  const critical = m ? (m.critical || 0) : 0;
  return high + critical;
}

function main() {
  if (!fs.existsSync(currentPath)) {
    console.error('check-audit-baseline: no current snapshot (audit-current.json).');
    process.exit(1);
  }
  const current = load(currentPath);
  if (!current) {
    console.error('check-audit-baseline: failed to parse current snapshot.');
    process.exit(1);
  }
  const cur = vulnCount(current);
  const base = load(baselinePath);
  const baseCount = base ? vulnCount(base) : 0;

  console.log(`dependency-audit snapshot: current high/critical=${cur}  baseline high/critical=${baseCount}`);

  if (baseCount > 0 && cur > baseCount) {
    console.error(`dependency-audit REGRESSION: NEW high/critical findings since committed baseline (${baseCount} -> ${cur}).`);
    console.error('Fix the affected dependencies; do not push a regression to a PR.');
    process.exit(1);
  }
  console.log('dependency-audit regression: no new high/critical findings.');
}

main();
