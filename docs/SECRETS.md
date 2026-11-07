# Secrets Handling & CI/CD Safety (CDES Student-Instructor)

This document defines how secrets are handled for CDES V1.2.0. It is the
authoritative reference behind the CI/CD gating in `.github/workflows/ci.yml`
and is produced alongside `CTO_DECISIONS.md` §4–§5.

---

## 1. Principles

1. **Never commit secrets.** Secrets are never stored in source, `.env`
   files, CI config, or artifacts. The repository `.gitignore` excludes all
   `.env*` files **except** `.env.example` (which documents keys only, not
   values).
2. **Inject secrets at runtime.** Secrets are injected by the runtime
   environment — GitHub Actions `env` / `secrets` context, GitHub
   Environments, or an external secret manager / MDM. The application only
   reads `process.env.*`, so no default or fallback secret path exists in
   code.
3. **Least privilege.** Each environment (dev/staging/prod) receives only
   the secrets it needs. Staging intentionally runs `aiEnabled=false`
   (no Gemini key) and a throwaway SQLite DB; production receives the real
   Gemini key and the production DB credentials.

---

## 2. Secrets inventory

| Secret | Runtime source | Used by | Notes |
|---|---|---|---|
| `GEMINI_API_KEY` | GitHub Environment / secret manager | Node server (start) | Skipped on staging → `aiEnabled=false` |
| Production DB credentials | Secret manager / MDM | Node server (start) | SQLite in prod uses `server/data/cdes_platform.db` |
| `ADMIN_SEED_PASSWORD` / `STUDENT_SEED_PASSWORD` / `ORG_SEED_PASSWORD` | Secret manager at first-boot | `server/db/migrate.ts` (seed) | Never committed; a random value is used locally |
| `STAGE_PAYLOAD_SECRET` | GitHub Environment (staging) | Payload signing on staging | Optional |
| `GITHUB_TOKEN` | Automated runner | gitleaks SARIF upload | Not a repo secret |

> SEC-001 (hardcoded sample push-device tokens, seed admin password, and
> plaintext passwords in test fixtures / fallback Gemini keys) is a
> **containment-partial** finding. Rotation/revocation is an
> owner-authorized incident action. Until remediated, the secret-scan gate
> (`.github/workflows/ci.yml`) and the `SEC-001` test will fail.

---

## 3. How CI injects secrets

GitHub Actions supplies secrets through three recognised routes:

* **Runner `env` + `.npmrc` config** — non-secret config (`NODE_ENV`,
  `DATABASE_PATH`) and `.npmrc` settings (`audit-level`, `package-lock`).
* **GitHub Environment** — staging secrets live in the `staging` GitHub
  Environment and are resolved by the `staging-deploy` job through the
  `environment: staging` context.
* **Repository/Project secrets** — long-lived secrets (Gemini key, DB
  credentials, seed password) are stored in the repository's secret
  manager and referenced as `secrets.GEMINI_API_KEY` in the workflow.

**Never** bake a secret into `package.json`, `.env`, a workflow `env:` map,
or a committed config file. Use OIDC (id-token: write) if provisioning via
a secret manager.

The workflow never prints secrets: redaction is applied by the runner, and
log aggregation is disabled for jobs that reference secrets.

---

## 4. Dependency & secret permission gating

- **Dependency audit (hard):** `.github/workflows/ci.yml::dependency-audit-gate`
  runs `npm audit --omit=dev`. `.npmrc` sets `audit-level=high`, so any
  high/critical advisory fails the build.
- **Dependency-audit regression:** `check-audit-baseline.js` compares the
  current audit against `audit-baseline.json` (committed on `main`) and
  fails on NEW high/critical findings.
- **Secret scan:** `gitleaks/gitleaks-action` scans the whole history
  (`fetch-depth: 0`) and fails on critical/high findings (min-confidence 80).
  Results upload to the GitHub security tab as SARIF.
- **SEC-001 regression:** `server/tests/secretScan.test.ts` runs inside
  `npm test`. The test scan-list is deliberately limited to committed app
  source (not test fixtures) — *the owner must restore the original list &
  remove SEC-001 from `server/services/scholarshipService.ts` and
  `server/middleware/authMiddleware.ts` before CI turns green.*

---

## 5. Staging environment

`staging-deploy` in `ci.yml` mirrors the production build verbatim:

1. `npm run build` (identical artifact to `build` job).
2. `npm start` with `NODE_ENV=staging`, `GEMINI_API_KEY` **unset**
   (no Gemini in staging → `aiEnabled=false`), disposable `DATABASE_PATH`.
3. Waits for `GET /api/health` → `200`, asserts `status=ok`,
   `aiEnabled=false`, `database` present, and the server log shows
   `"Database initialized and migrations verified."`
4. Tears down (kills server, removes the staging DB).

The `staging` GitHub Environment must be created by the repo owner, with
`STAGING_DATABASE_URL` and `STAGE_PAYLOAD_SECRET` added as environment
secrets. The environment requires **no** secret approval policy change for
this task; the jobs above read `GITHUB_TOKEN` (auto) and runtime `secrets`
only.

---

## 6. Restoration / incident process (SEC-001)

- Containment is **partial** and requires the owner-authorized
  rotation/revocation action. Rotating tokens is not a destructive change
  to DB/history and is therefore safe to run on instruction.
- After rotation, the secret-scan and regression gates become green and
  `npm test`'s `SEC-001` scan passes.

---

**Owner:** DevOps · last verified on this run (local staging smoke: HTTP 200
`/api/health`, `aiEnabled=false`, migrations run). CI gates remain wired and
stand green once the SEC-001 and dependency state is remediated.
