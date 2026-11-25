# CDES Student Instructor V1.2.0 — Reconstruction Baseline & Verification Report

**Workspace**: `c:\Users\Reinh\OneDrive\Desktop\Student-Instructor-V1.2.0\Student-Instructor-V1.2.0` (source export aligned with remote `Dominic-S-Sethea/Student-Instructor-V1.2.0` commit `0bc6aa60721ea5982680e34d2d0ca4af3b1eea4c`, no `.git` history in local export)  
**Runtime verified**: Node `v24.22.3` (`node:sqlite`), Windows PowerShell, `GEMINI_API_KEY=""` (disabled for all checks)  
**Date**: 25 November 2026  

---

## 1. Before vs. After Command Verification Summary

| Check | Unmodified Baseline (Before) | Post-Reconstruction (After) | Evidence / Notes |
| --- | --- | --- | --- |
| `npm.cmd ci` | Exit `0` (461 packages) | Reused lockfile install | Exact lockfile installation verified |
| `npx.cmd --no-install tsc --noEmit -p tsconfig.server.json` | Exit `0` | **Exit `0`** | Strict server TypeScript config passes after final backend edits |
| `npm.cmd run lint` (`tsc --noEmit`) | Exit `0` | **Exit `0`** | Root frontend + shared TS passes with zero errors |
| `npm.cmd test` | Exit `0` (2 legacy scripts; logged `adminUser.password_hash`) | **Exit `0`** (6 suites: `backend.test.ts`, `secretScan.test.ts`, `startupAndMigrations.test.ts`, `authOwnershipConsent.test.ts`, `catalogAccuracyAndEditorial.test.ts`, `guidanceAndPackaging.test.ts`) | Removed password-hash stdout logging; tested HTTP auth, CSRF, isolation, consent, catalog accuracy, atomic approval, guidance fail-closed timeouts, backup/restore, retention |
| `npm.cmd run test:coverage` | **Missing script** (`RULES.md` gap) | **Exit `0`** (`scripts/run-coverage.mjs`) | V8 coverage across all 6 suites: **86 server modules executed, 1638/3989 functions hit (41.1%)** |
| `npm.cmd run build` | Exit `0`, placed `dist/server.cjs` in static `dist/` | **Exit `0`** (`dist/public` + `dist/server/server.cjs` + `dist/server/db/`) | `vite build` -> `dist/public` (`index.html`, JS/CSS bundles); `esbuild` -> `dist/server/server.cjs`; SQL assets copied privately to `dist/server/db/` |
| `npm audit --omit=dev` + `check-audit-baseline.cjs` | Exit `0` (`high/critical=0`, baseline `4`) | **Exit `0`** (`high/critical=0`, baseline `4`) | Zero high/critical runtime vulnerabilities; no baseline regressions |
| Clean-dir production smoke (`node dist/server/server.cjs`, `PORT=3199`, `COOKIE_SECURE=false`, `NODE_ENV=production`) | Blocked on host port `3000` (occupied; hardcoded `PORT=3000`) | **Exit `0`** (port configurable; zero demo accounts on boot) | `/api/health` -> `200` (`schemaVersion: 8`, `aiEnabled: false`, `journalMode: "wal"`, `foreignKeys: true`, `integrity: "ok"`); `/api/does-not-exist` -> `404` JSON; `/server/server.cjs` & `/db/schema.sql` not leaked |
| Live backup & restore drill (`server/db/backupRestore.mjs`) | Unverified | **Exit `0`** (`integrity=ok`, `fk_violations=0`) | Restored live populated `smoke.db` to new file; verified Student A (`Data Science & AI`) and admin-published `Clean Deploy Grant 2027` via HTTP |
| Built-in Electron `browser` subagent E2E DOM check | Unverified | **Blocked by webview environment** (`EVAL_ISOLATED_TIMEOUT` / `CAPTURE_EMPTY` on `127.0.0.1:3199`) | Server returned HTTP `200`/`304` for `/` and `/api/scholarships` (`200` confirmed directly for JS `2131447` bytes & CSS `178810` bytes + full cookie/CSRF API journeys), but host webview failed to evaluate/screenshot DOM |

---

## 2. Rules & Packaging Hygiene Audit

- **`RULES.md` `test:coverage` gap**: Resolved by adding `scripts/run-coverage.mjs` and wiring `npm run test:coverage` in `package.json` and `.github/workflows/ci.yml`.
- **CI staging environment persistence (`ci.yml`)**: Fixed disconnected `export` step by writing `NODE_ENV=staging`, `DATABASE_PATH`, `COOKIE_SECURE=false`, and `STAGING_PID` to `$GITHUB_ENV` and replacing broad `pkill` with targeted `kill "$STAGING_PID"`.
- **Secret-scan compliance (`secretScan.test.ts`)**: Passed (`PASS: no hardcoded production secrets in server/ and src/`), and removed `adminUser.password_hash` print from `server/tests/backend.test.ts`.
- **Public vs. private build layout**: `dist/public` contains only browser artifacts (`index.html`, `assets/`, `crests/`, `images/`). `dist/server/server.cjs`, sourcemap, `schema.sql`, and `migrations/*.sql` sit outside `dist/public`. Note: `server/services/scholarshipService.ts` sits at 466 lines (pre-existing >400 lines; formatting logic was extracted into 308-line `server/services/scholarshipFormatter.ts`), while every newly added module and all 4 new integration test files are strictly `<= 308` lines (`<= 226` lines for all new test files) with zero `any` in modified scopes.
