# CDES Student Instructor V1.2.0 — Reconstruction Baseline & Verification Report

**Repository**: `Dominic-S-Sethea/Student-Instructor-V1.2.0` (branch `feat/phases-4-6-remediation`, rebased atop `12c5cff`)  
**Runtime verified**: Node `v22.23.5` (`node:sqlite`), Ubuntu 24.04 Linux, Google Chrome `158.0.8127.36` + Playwright, `GEMINI_API_KEY=""` (disabled for all checks)  
**Updated**: 25 November 2026  

---

## 1. Before vs. After Command Verification Summary

| Check | Unmodified Baseline (Before) | Final Post-Expansion (After Phases 4–6 & W1–W6) | Evidence / Notes |
| --- | --- | --- | --- |
| `npm run lint` (`tsc --noEmit && tsc --noEmit -p tsconfig.server.json`) | Frontend-only lint | **Exit `0`** (both client + server strict TS) | Zero TypeScript errors across client & server; zero `any` in all 43 newly created files |
| `npm test` | Exit `0` (2 legacy scripts; logged `adminUser.password_hash`) | **Exit `0`** (**16 suites**, all `<= 250` lines) | Covers auth, CSRF, JTI revocation, login lockout, OWASP API Top 10 pentest, AI/Hermes privacy, catalog accuracy, account bookmarks/notifications, PII scrubbing & erasure, migrations v11, retention, backup/restore, and concurrency contention |
| `npm run test:coverage` | **Missing script** (`RULES.md` gap) | **Exit `0`** (`scripts/run-coverage.mjs` auto-discovery) | V8 coverage across all **16 suites**: **114 server modules executed, 6767/17076 functions hit (`39.6%`)** |
| `npm run build` | Exit `0`, leaked `dist/server.cjs` in static `dist/` | **Exit `0`** (`dist/public` + `dist/server/server.cjs` + `dist/server/db/`) | `vite v6.4.5` (`1978` modules in `8.63s`); `esbuild` (`1.3 MB` in `155ms`); SQL + ops scripts copied privately into `dist/server/db/` |
| `npm run audit:dep` + `check-audit-baseline.cjs` | Exit `0`, buggy `0 -> 1` comparison | **Exit `0`** (`found 0 vulnerabilities`, `high/critical=0`, baseline `4`) | Fixed `0 -> 1` regression logic in `check-audit-baseline.cjs`; `audit-baseline.json` untouched |
| Clean-dir production smoke (`dist/` isolated, `NODE_ENV=production`, `PORT=3198`) | Blocked on hardcoded `PORT=3000` | **Exit `0`** (zero demo accounts on boot) | `/api/health` -> `200` (`schemaVersion: 11`, `aiEnabled: false`, `journalMode: "wal"`, `foreignKeys: true`, `integrity: "ok"`); unknown `/api/*` -> `404` JSON; `dist/server/*` unreachable; static `/` + JS/CSS -> `200` |
| Atomic backup & restore drill (`dist/server/db/backupRestore.mjs`) | Unverified | **Exit `0`** (`integrity="ok"`, `fkViolations=0`, `schemaVersion=11`) | Atomic temp-file rename + `busy_timeout=5000`; verified persisted HTTP-registered student + welcome notification after restore |
| Headless Chromium browser E2E (`npm run test:e2e:browser`) | Blocked by local webview environment | **Exit `0`** (`13/13` checks PASS, `0` console errors, `0` page errors) | Verified real Chromium DOM flows across guest, theme/language toggle, catalog, live universities, quiz, Student A auth/bell/bookmark-sync/advisor/privacy, and Student B UI isolation |
| Catalog integrity audit (`npm run verify:catalog`) | Not present | **Exit `0`** (`PASS`) | Audited `12` scholarships & `7` universities, `schemaVersion: 11`, `0` FK violations, `integrity: "ok"` |
| Concurrent mixed-workload stress benchmark (`npm run test:stress`) | Not present | **Exit `0`** (`PASS`, `640` reqs, `32` workers, `209.8 req/s`) | `0` 5xx errors, `p50=97.47ms`, `p95=234.84ms`, `heapUsed delta=-1.23MB`, `readOps=6266`, `writeOps=981`, `writerMax=1`, `busyTimeoutRetries=0`, `integrity="ok"`, `fkViolations=0` |

---

## 2. Rules & Packaging Hygiene Audit

- **`RULES.md` line limits**: All **17** files in `server/tests/` (16 test suites + `httpTestHelper.ts`) are strictly `<= 250` lines. All **43** newly added files across `server/`, `src/`, and `scripts/` satisfy line limits with zero `any`/`as any`.
- **Secret-scan & Gitleaks compliance**: Expanded `secretScan.test.ts` (broadened private-key/JWT/token regexes and removed `process.env` bypass) and updated `.github/.gitleaks.toml` to valid Gitleaks v8 syntax.
- **Containerization & Operations**: Added multi-stage non-root `Dockerfile`, `.dockerignore`, `docker-compose.yml`, and `docs/DEPLOYMENT_RUNBOOK.md`; hardened graceful shutdown (`headersTimeout > keepAliveTimeout`, `closeIdleConnections()`, Vite close) in `server.ts`.
- **Public vs. private build layout**: `dist/public` contains only static browser assets; `dist/server/server.cjs`, sourcemap, `schema.sql`, `migrations/*.sql`, and operational DB scripts stay isolated under `dist/server/`.

