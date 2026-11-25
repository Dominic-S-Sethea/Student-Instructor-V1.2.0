# CDES Student-Instructor V1.2.0 — 8-Hour Engineering Expansion & Hardening Plan

**Prepared:** 25 November 2026  
**Branch:** `feat/phases-4-6-remediation` (builds directly on verified Phases 4–6 checkpoints `f783954`, `02ba2c1`, `b2c1670`)  
**Goal:** Elevate CDES Student-Instructor V1.2.0 from a pilot-hardened baseline to a production-grade, end-to-end verified, stress-tested, and container-deployable national student platform while upholding every `RULES.md` architectural, privacy, and bilingual (EN/KM) invariant.

---

## Executive Architecture & Time-Boxed Schedule (8 Hours / 6 Workstreams)

| Workstream | Time Box | Core Deliverables | Exit Gate & Verification |
| --- | --- | --- | --- |
| **W1: New Student Features — Account-Synced Bookmarks, Prep Checklists & Notifications** | 2.0h | Migration `011_student_bookmarks_and_reminders.sql` (`user_saved_scholarships`, `user_notifications`); `savedScholarshipRepository.ts`, `notificationRepository.ts`; `/api/scholarships/saved*` & `/api/users/notifications*`; live sync + guest-to-account merge in `ScholarshipIntelligenceView`, `ScholarshipSavedDrawer`, `StudentDashboard`, `StudentProfileView`; `NotificationBellMenu` in `TopNav` + `App.tsx`; Markdown & JSON checklist export | `savedScholarshipsAndNotifications.test.ts` (≤250 lines), `npm run lint`, `npm test` |
| **W2: Security Deepening & Automated OWASP API Pentest Suite** | 1.5h | Progressive per-account login brute-force lockout + structured security audit telemetry in `authService.ts` / `authController.ts`; strict type cleanup (zero `any` in modified modules); automated OWASP API Top 10 security test suite (`securityPentestSuite.test.ts`) testing SQLi, XSS/`javascript:` URI rejection, BOLA/IDOR matrix, JWT `alg:none`/tampered-sig/revoked-jti, CSRF missing/mismatched, mass-assignment, login lockout, and static path-traversal blocking | `securityPentestSuite.test.ts` (≤250 lines), `secretScan.test.ts`, `npm run lint`, `npm test` |
| **W3: Data Pipeline Engineering & Catalog Integrity Automation** | 1.25h | `server/services/dataPipelineValidator.ts` (schema validation, Cambodian phone/email/Telegram PII scrub verification, triple-lock governance consent enforcement, anonymized research cohort validation); `scripts/verify-catalog-integrity.mjs` (validates every seeded scholarship & university record for EN/KM parity, honest tri-state fields, safe `http(s)` URLs, zero fabricated stipends/guarantees); E2E pipeline test (`dataPipelineE2E.test.ts`) verifying ingest → PII scrub → consent lock → feature store snapshot → anonymized export → right-to-erasure full wipe | `dataPipelineE2E.test.ts` (≤250 lines), `node scripts/verify-catalog-integrity.mjs`, `npm test` |
| **W4: Stress, Concurrency & SQLite Contention Benchmarking** | 1.0h | `scripts/stress-test.mjs` (concurrent mixed HTTP workload across `/api/health`, `/api/scholarships`, `/api/universities`, `/api/auth/register`+login+CSRF, concurrent bookmark writes, Hermes memory writes, and `/api/decision/evaluate` with RPS, p50/p95/p99 latency, RSS/heap delta, SQLite `writerMax`/`busyTimeoutRetries`, and post-load `PRAGMA integrity_check` + `foreign_key_check`); automated regression harness `server/tests/stressAndConcurrency.test.ts` | `stressAndConcurrency.test.ts` (≤250 lines), `node scripts/stress-test.mjs` (0% 5xx, 0 FK violations, `integrity=ok`) |
| **W5: DevOps Containerization, Runbook & Real Headless Chromium E2E** | 1.25h | Multi-stage non-root `Dockerfile` (Node 22 Alpine/Slim with `/api/health` HEALTHCHECK), `.dockerignore`, `docker-compose.yml`, `docs/DEPLOYMENT_RUNBOOK.md` (env matrix, TLS reverse proxy, backup/restore, retention cron, rollback); real headless Chromium + Playwright browser E2E suite (`scripts/e2e-browser-smoke.py`) verifying Guest → Theme Toggle → EN/KM Toggle → Scholarships + Filter → Decision Quiz → Universities → Student A Register → Profile/Bookmarks/Notifications/Advisor → Logout → Student B Isolation with **zero console errors and zero uncaught page errors** | `python3 scripts/e2e-browser-smoke.py` PASS against clean built `dist/server/server.cjs` |
| **W6: Full 9-Point End-to-End Audit, Reconstruction Docs & Draft PR** | 1.0h | Execute full 9-point Verification Matrix (`lint`, `build`, `test`, `test:coverage`, `audit:dep` + `check-audit-baseline.cjs`, clean-dir `dist/` production smoke test, atomic backup/restore drill, headless Chromium E2E, catalog integrity + stress test); update `docs/reconstruction/*`; author `OVERNIGHT_REPORT.md`; verify clean `git status` and untouched `audit-baseline.json`; open Draft PR against `main` via `gh pr create --draft` | All 9 verification gates EXIT `0`, Draft PR opened on GitHub |

---

## Detailed Workstream Specifications

### W1: Account-Synced Bookmarks, Application Checklists & Persisted Notifications
- **Database Migration (`server/db/migrations/011_student_bookmarks_and_reminders.sql`)**:
  - `user_saved_scholarships`: `id TEXT PRIMARY KEY`, `user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE`, `scholarship_id TEXT NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE`, `status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved','preparing','submitted','awarded','archived'))`, `target_note TEXT NOT NULL DEFAULT ''`, `checklist_json TEXT NOT NULL DEFAULT '[]'`, `created_at TEXT NOT NULL`, `updated_at TEXT NOT NULL`, `UNIQUE(user_id, scholarship_id)`.
  - `user_notifications`: `id TEXT PRIMARY KEY`, `user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE`, `category TEXT NOT NULL CHECK (category IN ('deadline','scholarship','privacy','study','system'))`, `title TEXT NOT NULL`, `body TEXT NOT NULL`, `action_tab TEXT`, `is_read INTEGER NOT NULL DEFAULT 0`, `created_at TEXT NOT NULL`.
  - Secondary indexes on `(user_id, updated_at DESC)` and `(user_id, is_read, created_at DESC)`.
- **Backend APIs (Strictly Auth + CSRF + Ownership Scoped)**:
  - `GET /api/scholarships/saved` — returns authenticated user's saved scholarship bookmarks joined with live formatted scholarship metadata.
  - `POST /api/scholarships/saved` — saves/updates a bookmark (auto-seeds default document checklist from scholarship requirements; creates a deadline reminder notification if closing within 45 days).
  - `PATCH /api/scholarships/saved/:scholarshipId` — updates `status`, `target_note` (sanitized), or `checklist` item completion state.
  - `DELETE /api/scholarships/saved/:scholarshipId` — removes bookmark strictly for `req.user.userId`.
  - `POST /api/scholarships/saved/sync` — idempotent guest-to-account merge on login (accepts up to 50 `scholarshipIds`, ignores non-existent IDs safely).
  - `GET /api/users/notifications` — returns `{ notifications, unreadCount }` strictly for `req.user.userId`.
  - `PATCH /api/users/notifications/:id/read` — marks one owned notification read (`404` if missing or owned by another user).
  - `POST /api/users/notifications/read-all` — marks all notifications read for `req.user.userId`.
  - `DELETE /api/users/notifications/:id` — deletes an owned notification.
- **Frontend UX**:
  - `src/services/savedScholarshipClient.ts` & `src/services/notificationClient.ts` using `apiClient.ts` (HttpOnly cookies + `X-CSRF-Token`).
  - `ScholarshipIntelligenceView`: syncs local guest bookmarks to SQLite on login via `/api/scholarships/saved/sync`, hydrates persisted bookmarks + checklists, persists toggles/status/checklist updates to SQLite when authenticated (preserving guest `localStorage` fallback).
  - `ScholarshipSavedDrawer`: shows application status badge (`Saved` / `Preparing` / `Submitted`), interactive document checklist checkboxes when signed in, and downloadable `.md` (Markdown) + `.txt` preparation checklists.
  - `StudentDashboard` & `StudentProfileView`: reflect live synced bookmark counts and saved scholarships from SQLite when authenticated.
  - `TopNav` (`NotificationBellMenu.tsx` extracted to keep `TopNav.tsx ≤ 400 lines`): live unread badge + accessible dropdown menu with one-click mark-read, mark-all-read, and tab navigation; zero fabricated mock notifications for authenticated users.

### W2: Security Deepening & Automated OWASP API Pentest Suite
- **Progressive Account Lockout (`server/services/authLockoutService.ts`)**:
  - Tracks consecutive failed logins per normalized email (5 failures → 60s lockout, 8+ failures → 300s lockout) with bounded LRU map (max 5,000 keys) and automatic clearing upon successful login.
  - Returns HTTP `429` with `Retry-After` header and structured JSON security warning log (email masked/hashed, never logging raw passwords).
- **Automated OWASP API Top 10 Pentest Suite (`server/tests/securityPentestSuite.test.ts`, ≤250 lines)**:
  - API1 BOLA/IDOR matrix (profiles, education delete, saved bookmarks, notifications, AI memory, action plans, mobile devices).
  - API2 Broken Auth (`alg: "none"` JWT, tampered signature, expired JWT, post-logout revoked `jti`, progressive brute-force lockout `429`).
  - API3 Mass Assignment (role elevation on register, `user_id` override on profile, `level`/`merit_points` on avatar, `role: 'admin'` on community join).
  - API4 Unrestricted Resource Consumption (oversized payloads, negative pagination limits).
  - API5 Broken Function-Level Authorization (student/org blocked with `403` on `/api/metrics`, `/api/scholarships/submissions`, `/api/research/anonymized-dataset`, `/api/data-platform/improvement-flywheel`, `/api/ai-os/safety/test`).
  - API8 Security Misconfiguration & Injection (SQLi probes in scholarship search & university filters, `javascript:`/`data:` URI rejection in scholarship submissions, missing/mismatched CSRF `403`, path traversal attempts `/../server/server.cjs` and `/db/schema.sql`).

### W3: Data Pipeline Engineering & Catalog Integrity Verification
- **`server/services/dataPipelineValidator.ts` (≤250 lines)**:
  - Pure, reusable pipeline validation + scrubbing utilities:
    - `scrubPipelinePii(input)` — strips Cambodian phone formats (`012 345 678`, `+855-96-...`), Telegram handles (`t.me/...`, `@handle`), and personal emails while preserving institutional `.edu.kh` addresses.
    - `validateAnalyticsEventRecord(payload)` — enforces required fields, bounds durations/scores, rejects raw PII in metadata keys.
    - `verifyGovernanceExportIntegrity(rows)` — confirms zero raw `email`, `user_id`, or `student_id` fields leak into anonymized research datasets and every exported student satisfies triple-lock consent (`allow_research_inclusion = 1`, `consent_status != 'withdrawn'`, minor parental verification).
    - `executeStudentRightToErasure(userId)` — transactional full-pipeline erasure removing/clearing analytics streams, learning/game events, AI conversations, Hermes docs/facts/history, online feature store, and marking consent `withdrawn`.
- **`scripts/verify-catalog-integrity.mjs`**:
  - Boots a disposable in-memory/temp migrated SQLite DB (`seedCatalog: true, seedDemo: false`) and audits EVERY scholarship and university row for:
    - Non-empty EN & KM names/providers,
    - Safe URLs (`http:`/`https:` or empty/null — zero `javascript:`/`data:` schemes),
    - Honest tri-state fields (no fabricated `'100% Verified'`, no `$0` vs `Not specified` confusion, no missing-accreditation fabrication),
    - Zero duplicate IDs or broken foreign keys.
- **`server/tests/dataPipelineE2E.test.ts` (≤250 lines)**:
  - Runs the entire data lifecycle end-to-end: Consent OFF (0 persistence) → Minor pending lock (0 persistence) → Verified Consent ON → Event ingestion + PII scrub → Feature store snapshot → Anonymized research export (verified zero PII + included) → Right-to-erasure wipe → Post-wipe export verification (0 rows across all pipeline tables).

### W4: Stress, Concurrency & SQLite Contention Testing
- **`scripts/stress-test.mjs`**:
  - Spawns or attaches to the built server (or in-process `createApp` over real HTTP loopback) with a disposable temp DB.
  - Drives configurable concurrent virtual users (default: 40 concurrent workers, 600+ requests) executing a realistic mixed workload: catalog search/filters, university queries, auth register/login + CSRF, concurrent saved-scholarship mutations, Hermes memory writes, decision evaluations, and health probes.
  - Reports RPS, p50 / p95 / p99 latencies, status-code histogram, 5xx error rate, RSS/heap delta, SQLite `dbMetrics` (`readOps`, `writeOps`, `writerMax`, `busyTimeoutRetries`), and runs post-load `PRAGMA integrity_check` + `PRAGMA foreign_key_check`.
- **`server/tests/stressAndConcurrency.test.ts` (≤250 lines)**:
  - Automated CI-safe concurrency test (200+ concurrent mixed read/write HTTP requests across 20 simultaneous workers) asserting `0` 5xx errors, `0` `SQLITE_BUSY` failures, `p95 < 500ms`, `PRAGMA integrity_check = ok`, and `0` FK violations.

### W5: DevOps Containerization, Runbook & Real Headless Chromium E2E
- **`Dockerfile` + `.dockerignore` + `docker-compose.yml`**:
  - Multi-stage Node 22 build (`builder` installs devDeps and runs `npm run build`; `runtime` copies `package*.json`, runs `npm ci --omit=dev`, copies `dist/`, runs as non-root `node` user, exposes `3000`, mounts persistent `/data` volume for `DATABASE_PATH=/data/cdes_platform.db`, defines `HEALTHCHECK` probing `/api/health`).
- **`docs/DEPLOYMENT_RUNBOOK.md`**:
  - Complete production operator guide: required secrets (`JWT_SECRET`, `RESEARCH_SALT`, optional `GEMINI_API_KEY`), TLS reverse-proxy headers (`TRUST_PROXY=1`, `COOKIE_SECURE=true`, `FRONTEND_ORIGIN`), zero-downtime backup (`dist/server/db/backupRestore.mjs`), scheduled retention cron (`dist/server/db/retention_cron.js`), monitoring endpoints (`/api/health`, `/api/metrics`), and rollback steps.
- **`scripts/e2e-browser-smoke.py`**:
  - Launches built `dist/server/server.cjs` in production mode (`NODE_ENV=production`, `COOKIE_SECURE=false`, `GEMINI_API_KEY=""`, fresh temp `DATABASE_PATH`, ephemeral port) and drives real `/usr/bin/google-chrome` via Playwright Python Sync API across:
    1. Guest Home load (live scholarship count, zero console/page errors, zero admin tabs visible),
    2. Dark/Light study theme toggle (`#theme-toggle-btn`, `html.dark` class verification),
    3. EN/KM language toggle (`html[lang="km"]` & Khmer UI labels),
    4. Scholarships view + search filter + open dossier modal + bookmark,
    5. 2-Minute Major Fit Quiz completion + honest `Planning Estimate` result,
    6. Universities directory live hydration,
    7. Register Student A via Auth Modal → verify guest bookmark merged to SQLite → verify Profile & Privacy Center (analytics/research OFF by default) → open Notification Bell → send Study Advisor offline message → Sign Out,
    8. Register Student B → verify strict UI & bookmark isolation (zero Student A data visible).

### W6: Full 9-Point Verification Matrix, `OVERNIGHT_REPORT.md` & Draft PR
- Run every single check from the Final End-to-End Verification Matrix on the final commit, record exact verbatim pass/fail metrics in `OVERNIGHT_REPORT.md`, refresh `docs/reconstruction/*`, confirm clean `git status` and untouched `audit-baseline.json`, push branch, and open Draft PR via `gh pr create --draft`.

---

## Architecture & Guardrail Compliance Locks
- Single-package React 19 + Vite 6 + Tailwind 4 + Express 4 + native `node:sqlite` (WAL).
- Every new/edited `server/**/*.ts` and `src/**/*.tsx` ≤ 400 lines (functions ≤ 80 lines); every `server/tests/**/*.ts` ≤ 250 lines.
- Strict TypeScript (`zero any`, `zero as any` in all new/modified code; `npm run lint` exit `0`).
- Zero `.db*`, `.env`, or secrets committed; `audit-baseline.json` untouched on feature branch.
- Per-workstream `git commit -s` (Conventional Commits) + `git push`.
