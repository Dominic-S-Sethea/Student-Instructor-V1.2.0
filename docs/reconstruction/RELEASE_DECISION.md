# CDES Student Instructor V1.2.0 — Release Decision & Handoff

**Decision**: **GO FOR INTERNAL STAGING / CONTROLLED SYNTHETIC PILOT — CONDITIONAL FOR LIVE REAL-STUDENT PILOT PENDING HOST BROWSER & OWNER GOVERNANCE**  
**Prepared**: 25 November 2026  

---

## 1. Passed Verification Evidence (Verified on Final Revision)

1. **Strict TypeScript Compilation**:
   - `npx.cmd --no-install tsc --noEmit -p tsconfig.server.json` -> **Exit `0`**
   - `npm.cmd run lint` (`tsc --noEmit`) -> **Exit `0`**
2. **Automated Test & Coverage Suites** (`GEMINI_API_KEY=""`, disposable SQLite databases):
   - `server/tests/backend.test.ts` -> **PASS** (service-level auth, profile, scholarships, universities, privacy-gated analytics; secret print removed)
   - `server/tests/secretScan.test.ts` -> **PASS** (`no hardcoded production secrets in server/ and src/`)
   - `server/tests/startupAndMigrations.test.ts` -> **PASS** (production `0`-demo-user boot, legacy fixture upgrade to v8, restart persistence, rollback & `503` readiness on failed migration without file deletion, backup/restore drill, retention purge)
   - `server/tests/authOwnershipConsent.test.ts` -> **PASS** (cookie+CSRF lifecycle, `403` bad CSRF, `401` after logout, Student A vs. Student B isolation across profiles/dossiers/AI memory, pending/unverified consent defaults, guardian email non-auto-verification, 0 telemetry/memory persistence when unconsented or withdrawn, research export exclusion after withdrawal, Bearer compatibility)
   - `server/tests/catalogAccuracyAndEditorial.test.ts` -> **PASS** (missing vs. `$0` stipend, unknown vs. excluded insurance, expired deadline state, missing university accreditation, non-destructive `checkUpdates`, EN/KM round-trip, disabled search logging, atomic concurrent editorial approval -> single publication + `409` conflict + unpublished rejection)
   - `server/tests/guidanceAndPackaging.test.ts` -> **PASS** (deterministic offline advisor & rule-based decision engine, fail-closed `504` timeout & `503` provider failure, JSON `404` on `/api/*`, admin-only `/api/metrics` & `/api/metrics/sqlite`)
   - `npm.cmd run test:coverage` -> **PASS** (`87` server modules executed, `1680/4036` functions hit, `41.6%`)
3. **Synthetic Workload Contention Benchmark** (`guidanceAndPackaging.test.ts`, 50 concurrent catalog GETs + 20 concurrent profile PUTs + admin metrics read):
   - **Requests**: `77`, **5xx Errors**: `0`
   - **Latency**: `p50 = 10.66 ms`, `p95 = 15.16 ms` (`11.64 ms` / `16.93 ms` under V8 coverage)
   - **SQLite Concurrency**: `writeOps = 344`, `writerMax = 1`, `busyRetries = 0` (`PRAGMA foreign_keys = ON`, `WAL` mode)
4. **Post-Audit Security, Integrity & `RULES.md` Hardening**:
   - Replaced hardcoded research salt fallback with `getResearchSalt()`, added expired-entry pruning in `rateLimiter.ts`, closed IDOR gaps on `POST /api/ai/feedback` and `POST /api/community/posts/:postId/accept-answer/:commentId`, aligned `improvement-flywheel/record` Zod schema, and enforced AI-memory consent + removed demo fallbacks in `aiAgentService.ts`.
   - Split `scholarshipEditorialService.ts` (`256` lines) out of `scholarshipService.ts` (`329` lines) and compacted `scholarshipController.ts` (`285` lines), `communityController.ts` (`346` lines), and `StudentEducationAndPrivacyPanel.tsx` (`359` lines) to `<= 400` lines; fixed tri-state `null` handling in `seedCatalog.ts` and `parseUsdMonthlyStipend`, accurate pending counts in `monitorController.ts`, real counts in `aiAgent2Service.ts` / `researchService.ts`, CSRF wiring in `ScholarshipErrorReportModal.tsx`, live computed catalog metrics in `ScholarshipIntelligenceView.tsx`, and profile isolation in `StudentProfileView.tsx`.
5. **Production Packaging & Clean-Directory Smoke Test** (`dist/` copied to `%TEMP%\cdes-clean-deploy` with zero `server/` or `src/` sources, `NODE_ENV=production`, `PORT=3199`, `COOKIE_SECURE=false`):
   - `npm.cmd run build` -> **Exit `0`** (`dist/public/` + `dist/server/server.cjs` + `dist/server/db/`)
   - `GET /api/health` -> `200`, `ready: true`, `aiEnabled: false`, `schemaVersion: 8`, `integrity: "ok"`
   - `GET /assets/*.js` & `GET /assets/*.css` -> `200`; `GET /api/does-not-exist` -> `404` JSON; `/server/server.cjs` & `/db/schema.sql` inaccessible
   - Full cookie+CSRF HTTP E2E flows across guest, Student A, Student B, Organization, Admin, and Advisor/Decision passed on `127.0.0.1:3199`.
6. **Live Backup & Restore Drill (`backupRestore.mjs`)**:
   - Backed up populated `smoke.db` -> restored to `smoke-restored.db` -> `PRAGMA integrity_check = ok`, `foreignKeyViolations = 0`, read back Student A (`major = "Data Science & AI"`) and approved scholarship (`Clean Deploy Grant 2027`) via HTTP `200`.
7. **Dependency Audit**:
   - `npm audit --omit=dev` -> `0` high/critical runtime vulnerabilities; `check-audit-baseline.cjs` -> **PASS**.

---

## 2. Remaining Blockers & Owner Decisions Required Before Live Student Pilot

1. **Interactive DOM/Visual Browser Verification (Blocker on Local Host Tooling)**:
   - The built-in Electron `browser` subagent loaded `http://127.0.0.1:3199/` (`200`) and `/api/scholarships` (`200`) but failed DOM script evaluation (`EVAL_ISOLATED_TIMEOUT`) and screenshot capture (`CAPTURE_EMPTY`) in this Windows environment, and neither Edge, Chrome, nor Playwright CLI was installed on `PATH`.
   - **Action**: Before external pilot launch, execute one Playwright/Chromium interactive UI click-through against a staging server serving `dist/server/server.cjs` + `dist/public`.
2. **Owner Governance & Operational Decisions**:
   - **Minor / Guardian Verification Workflow**: Minor optional data collection (analytics, AI memory, research inclusion) stays strictly disabled until the owner defines and activates an authoritative guardian-verification workflow calling `POST /api/privacy/parent-verify/:studentId/approve`.
   - **Production TLS & Secrets**: Deploy behind HTTPS termination (keeping default `COOKIE_SECURE=true`), inject a strong persistent `JWT_SECRET` and `RESEARCH_SALT`, and optionally provide `GEMINI_API_KEY` + live HTTP source-checker credentials if live AI/crawler automation is enabled.
   - **Repository & CI Target**: Export contained no local `.git` history; commit reconstruction changes on a clean branch off `0bc6aa60721ea5982680e34d2d0ca4af3b1eea4c` and confirm merge target (`main` per `RULES.md`) and staging environment secrets in GitHub.

---

## 3. Rollback Procedures by Phase

| Phase | Scope | Safe Rollback Procedure |
| --- | --- | --- |
| **Phase 2 (Startup, Migrations & Packaging)** | `server/config.ts`, `server/db/*`, `server.ts`, `server/app.ts`, `vite.config.ts`, `package.json`, `.github/workflows/ci.yml` | Before rollback, create an online backup via `node server/db/backupRestore.mjs backup`. Note migration `008_pilot_reconstruction_columns.sql` is strictly **additive** (`ALTER TABLE ... ADD COLUMN`), so restoring prior `server.cjs` / `schemaAssets` can read an upgraded v8 DB safely, or restore pre-upgrade `.db` snapshot cleanly via `node server/db/backupRestore.mjs restore` + restart. |
| **Phase 3 (Auth, RBAC & Consent)** | `authService.ts`, `authMiddleware.ts`, `csrfMiddleware.ts`, `privacyService.ts`, route middleware | Revert controller/middleware changes as a single unit (since cookie/CSRF middleware and frontend `apiClient.ts` co-depend). Clear active cookies by rotating `JWT_SECRET` if rolling back session schema behavior. |
| **Phase 4 (Catalog Accuracy, Guidance & Frontend Clients)** | `scholarshipFormatter.ts`, `scholarshipService.ts`, `advisorRoutes.ts`, `decisionRoutes.ts`, `src/services/*`, UI views | Additive JSON response fields (`benefitStates`, `deadlineStatus`, `verificationState`, `mode`, `isEstimate`) maintain top-level backwards compatibility (`scholarships`, `totalCount`, `data`, `reply`, `recommendations`), allowing selective component rollback without DB schema changes. |

---

## 4. Recommended Post-Pilot Backlog (Dependency Order)

1. **Interactive Headless Browser Suite (Playwright)**: Add automated Playwright tests covering Guest, Student A/B, Organization, and Admin DOM interactions against `dist/server/server.cjs`.
2. **Account-Synced Scholarship Bookmarks**: Migrate `csip_saved_scholarships` from `localStorage` to an authenticated `user_saved_scholarships` table synced across devices while keeping guest `localStorage` fallback.
3. **University Directory Live API Hydration**: Switch `App.tsx` / `UniversityIntelligenceView.tsx` from initial fixture import to `universityClient.list()` while preserving all 9-point dossier fields in SQLite or enriched projection.
4. **Learning & STEM Lab Persistence Proof**: Add end-to-end integration tests verifying lab enrollment, completion scores, and path advancement survive restart under student isolation.
5. **Community, Mentoring & Events Enforcement Tests**: Verify booking idempotency, thread/comment authorization, and admin moderation resolution end-to-end.
6. **Teacher / Guardian Role Spec**: Implement teacher cohort views only after the owner defines instructor verification, supervised student rosters, and permitted aggregate vs. individual fields.
