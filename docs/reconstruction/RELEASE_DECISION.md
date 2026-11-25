# CDES Student Instructor V1.2.0 — Release Decision & Handoff

**Decision**: **GO FOR STAGING & CONTROLLED PILOT — ALL TECHNICAL BLOCKERS CLEARED (ONLY OWNER GOVERNANCE & PROD SECRETS REMAIN)**  
**Updated**: 25 November 2026 (Branch `feat/phases-4-6-remediation`, Schema `v11`)  

---

## 1. Passed Verification Evidence (Verified on Final Revision)

1. **Strict TypeScript Compilation** (`Node v22.23.5`, `node:sqlite`):
   - `npm run lint` (`tsc --noEmit && tsc --noEmit -p tsconfig.server.json`) -> **Exit `0`** (zero errors; zero `any` in all 43 newly created files)
2. **Automated Test & Coverage Suites** (`GEMINI_API_KEY=""`, disposable temp SQLite databases):
   - `npm test` -> **Exit `0` — 16/16 suites passing** (all test files strictly `<= 250` lines):
     - Core reconstruction suites (`6`): `backend.test.ts`, `secretScan.test.ts` (expanded patterns + removed `process.env` bypass), `startupAndMigrations.test.ts` (upgraded to schema `v11`), `authOwnershipConsent.test.ts`, `catalogAccuracyAndEditorial.test.ts`, `guidanceAndPackaging.test.ts`.
     - Audit Phases 3–6 suites (`6`): `mcpAndHermesMemory.test.ts`, `phase3ApiHardening.test.ts`, `phase4FrontendContracts.test.ts`, `phase5SecurityHardening.test.ts`, `phase5AiPrivacyHardening.test.ts`, `phase6ProductionReadiness.test.ts`.
     - 8-Hour Engineering Expansion suites (`4`): `savedScholarshipsAndNotifications.test.ts` (W1), `securityPentestSuite.test.ts` (W2), `dataPipelineE2E.test.ts` (W3), `stressAndConcurrency.test.ts` (W4: `240 reqs, p95=196.0ms, writes=687, busyRetries=0`).
   - `npm run test:coverage` -> **Exit `0`** (auto-discovered **16 suites**, **114 server modules executed**, **6767/17076 functions hit (`39.6%`)**).
3. **Mixed-Workload Concurrency Stress Benchmark & Catalog Integrity Audit**:
   - `npm run test:stress` (`32` concurrent workers x `20` rounds = **640 mixed read/write requests**):
     - **Status**: `PASS` | **Throughput**: `209.8 req/s` (`416` HTTP `200`, `224` HTTP `201`, **0 5xx errors**)
     - **Latency**: `p50 = 97.47 ms`, `p95 = 234.84 ms`, `heapUsed delta = -1.23 MB`
     - **SQLite Concurrency**: `readOps = 6266`, `writeOps = 981`, `writerMax = 1`, `busyTimeoutRetries = 0`, `slowQueriesCount = 0`, `integrity = "ok"`, `foreignKeyViolations = 0`
   - `npm run verify:catalog` -> **PASS** (`schemaVersion: 11`, `12` scholarships audited, `7` universities audited, `0` FK violations, `integrity: "ok"`).
4. **Interactive Headless Chromium Browser E2E Suite** (Previous Release Blocker **RESOLVED**):
   - `npm run test:e2e:browser` (`scripts/e2e-browser-smoke.py`, Playwright + Google Chrome `158.0.8127.36` against production `dist/server/server.cjs` + `dist/public`):
     - **Status**: `PASS` — **13/13 checks passed**, **`consoleErrors: 0`**, **`pageErrors: 0`**, **`schemaVersion: 11`**.
     - Verified live DOM journeys: production `/api/health`, guest home & hidden admin tabs, dark/light theme persistence, bilingual EN/KM toggle, scholarship catalog & guest bookmarking, live university hydration, 2-minute Decision Engine quiz, Student A registration + persisted notification bell + guest-to-SQLite bookmark sync + offline Study Advisor reply + Profile/Privacy Center, and Student B strict UI isolation.
5. **Production Packaging, Containerization & Clean-Directory Smoke Test**:
   - `npm run build` -> **Exit `0`** (`vite v6.4.5` built `1978` modules into `dist/public/`; `esbuild` bundled `dist/server/server.cjs` `1.3 MB`; `copy-db-assets.mjs` copied SQL + operational DB scripts into `dist/server/db/`).
   - Clean-directory production boot (`dist/` copied to `/tmp/cdes-clean-smoke-*` with zero `server/` or `src/` sources, `NODE_ENV=production`, `PORT=3198`, `COOKIE_SECURE=false`, `GEMINI_API_KEY=""`):
     - `GET /api/health` -> `200` (`ready: true`, `aiEnabled: false`, `journalMode: "wal"`, `foreignKeys: true`, `schemaVersion: 11`, `integrity: "ok"`)
     - `GET /api/does-not-exist` -> `404` JSON (`{"success":false,"error":"API route not found."}`)
     - Private `dist/server/*` probes (`/server/server.cjs`, `/dist/server/server.cjs`, `/db/schema.sql`, `/server/db/schema.sql`) -> zero server/SQL code exposed
     - Static frontend `/` and `/assets/index-*.js`, `/assets/index-*.css` -> `200`
   - Added production multi-stage non-root `Dockerfile`, `.dockerignore`, `docker-compose.yml` (`docker compose config --quiet` valid), and `docs/DEPLOYMENT_RUNBOOK.md`.
6. **Live Atomic Backup & Restore Drill (`dist/server/db/backupRestore.mjs`)**:
   - Backed up populated production smoke DB (containing HTTP-registered student `smoke@student.cdes.edu.kh` + persisted welcome notification) -> atomically restored via temp-file rename -> verified `PRAGMA integrity_check = "ok"`, `foreignKeyViolations = 0`, `schemaVersion = 11`, user and notification preserved.
7. **Dependency & Secret Audits**:
   - `npm run audit:dep` -> `found 0 vulnerabilities` (`0` high/critical runtime vulnerabilities).
   - `node .github/scripts/check-audit-baseline.cjs` -> **PASS** (`current high/critical=0`, `baseline high/critical=4`; fixed `0 -> 1` regression logic; `audit-baseline.json` untouched).
   - Valid Gitleaks v8 `.github/.gitleaks.toml` + hardened `.github/workflows/ci.yml`.

---

## 2. Remaining Owner Decisions Required Before Live Real-Student Pilot

All technical blockers from the initial reconstruction report (including headless Chromium browser verification, account-synced bookmarks, PII pipeline scrubbing, stress testing, and container packaging) have been **resolved**. Only owner operational governance items remain:

1. **Minor / Guardian Verification Workflow**: Minor optional data collection (analytics, AI memory, research inclusion) remains strictly fail-closed (`allow_* = 0`, `isMinor` locked when DOB < 18 or parent verification is pending) until the owner defines and activates an authoritative guardian-verification workflow calling `POST /api/privacy/parent-verify/:studentId/approve`.
2. **Production TLS & Secrets**: Deploy behind HTTPS termination (keeping default `COOKIE_SECURE=true`), inject strong persistent `JWT_SECRET` (>= 32 chars) and `RESEARCH_SALT`, configure `FRONTEND_ORIGIN` allowlist, and optionally provide `GEMINI_API_KEY` if live Gemini MCP mode is desired.
3. **Draft PR Review & Merge**: Review and merge branch `feat/phases-4-6-remediation` into `main` per `RULES.md`, and configure staging secrets in GitHub Actions.

---

## 3. Rollback Procedures by Phase

| Phase / Workstream | Scope | Safe Rollback Procedure |
| --- | --- | --- |
| **Migrations (`008`–`011`)** | `server/db/migrations/*`, `migrationRunner.ts`, `backupRestore.mjs` | Always take an online backup via `node dist/server/db/backupRestore.mjs backup` prior to deploying. Migrations `008`–`011` are backwards-safe additive tables/columns/indexes (except `010` orphan cleanup on Hermes facts). Restore pre-upgrade `.db` snapshot cleanly via `node dist/server/db/backupRestore.mjs restore` + restart. |
| **Auth, Security & Lockout (Phase 5 & W2)** | `authService.ts`, `authLockoutService.ts`, `authController.ts`, `securityHeadersMiddleware.ts`, `csrfMiddleware.ts` | Revert auth/middleware unit together. Rotating `JWT_SECRET` invalidates all active sessions cleanly if rolling back JTI revocation or cookie policies. |
| **Bookmarks, Notifications & Data Pipeline (W1 & W3)** | `savedScholarshipRoutes.ts`, `userController.ts`, `privacyController.ts`, `dataPipelineValidator.ts`, frontend hooks/drawers | New routes (`/api/scholarships/saved*`, `/api/users/notifications*`, `/api/privacy/erasure`) and UI drawers are additive; guest `localStorage` fallback remains intact if server endpoints are reverted. |
| **Container & Ops Tooling (Phase 6 & W5)** | `Dockerfile`, `docker-compose.yml`, `server.ts`, `retentionService.ts`, `ci.yml` | Pure operational packaging; can fall back to bare Node `node dist/server/server.cjs` execution without DB schema changes. |

---

## 4. Remaining Future Enhancements (Post-Pilot Roadmap)

1. **Teacher / Guardian Role Spec**: Implement teacher cohort dashboards only after the owner defines instructor verification, supervised student rosters, and permitted aggregate vs. individual fields.
2. **External Scholarship Crawler Automation**: Keep `/api/scholarships/check-updates` non-destructive until an approved allowlist of official scholarship domains and scheduled moderation queue SLA are established.
3. **Multi-Instance Horizontal Scaling (Optional)**: Current native `node:sqlite` WAL architecture easily sustains `>200 req/s` with `0` lock retries for single-node Cambodia pilot deployments; migrate to PostgreSQL only if multi-region multi-writer scaling is later required.

