# CDES Student-Instructor V1.2.0 — Production Deployment & Operations Runbook

## 1. Runtime Architecture
- **Single-Package Deployment**: React 19 + Vite 6 static bundle (`dist/public/`) served by Express 4 (`dist/server/server.cjs`) backed by native Node.js 22+ `node:sqlite` in WAL mode (`PRAGMA foreign_keys = ON`, `PRAGMA busy_timeout = 5000`).
- **Private Build Separation**: `dist/public/` holds only client assets. `dist/server/server.cjs`, `dist/server/retention.cjs`, `dist/server/db/schema.sql`, `dist/server/db/migrations/*.sql`, `dist/server/db/backupRestore.mjs`, and `dist/server/db/retention_cron.js` sit outside static hosting and are never publicly served.
- **Zero-Demo Production Boot**: When `NODE_ENV=production` or `NODE_ENV=staging`, catalog scholarships and universities are seeded automatically, while **zero demo accounts** are created.

---

## 2. Required Environment Variables

| Variable | Required in Prod | Default | Security / Operational Notes |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | `development` | Set to `production` or `staging`. Enables static serving, strict CSP (no `'unsafe-inline'` scripts), HSTS, Secure cookies, and masked 5xx errors. |
| `JWT_SECRET` | **Yes (≥32 chars)** | — | Generate via `openssl rand -hex 32`. Server fails closed at startup in `production`/`staging` if missing, short, or placeholder. |
| `JWT_EXPIRES_IN` | Optional | `7d` | Access-token TTL. Revoked JTIs persist in SQLite `revoked_jwt_tokens`, and `users.token_version` invalidates all sessions on password change / logout-all. |
| `RESEARCH_SALT` | Recommended | HMAC(`JWT_SECRET`) | Dedicated 32-byte hex secret for pseudonymizing `anonymized_research_id`. |
| `DATABASE_PATH` | Yes | `server/data/cdes_platform.db` | Mount on persistent local/block storage (never ephemeral container filesystem or NFS). |
| `FRONTEND_ORIGIN` | Yes | `http://localhost:5173` | Comma-separated exact origins (e.g. `https://cdes.edu.kh,https://www.cdes.edu.kh`). Wildcard `*` is rejected. |
| `TRUST_PROXY` | Behind TLS proxy | `0` | Set `1` behind a single reverse proxy (Nginx/Caddy/Cloudflare) so rate limiting & Secure cookies see real client IPs/TLS. |
| `COOKIE_SECURE` | Auto (`true` in prod/staging) | auto | Keep `true` behind HTTPS. Set `false` ONLY for local HTTP smoke testing. |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Optional | `""` / `gemini-2.5-flash` | Leave `GEMINI_API_KEY` unset to run Study Advisor in honest `deterministic_offline` mode (`aiEnabled: false`). |
| `LOG_LEVEL` / `SLOW_QUERY_THRESHOLD_MS` | Optional | `info` / `200` | Structured JSON logging threshold (`debug`/`info`/`warn`/`error`) and slow-query instrumentation ceiling (ms). |
| `PORT` / `HOST` | Optional | `3000` / `0.0.0.0` | Internal listener bind address. |

---

## 3. Build & Launch Procedures

### Bare-Metal / VM Deployment
```bash
npm ci
npm run build
NODE_ENV=production \
DATABASE_PATH=/var/lib/cdes/cdes_platform.db \
JWT_SECRET="$(openssl rand -hex 32)" \
FRONTEND_ORIGIN="https://cdes.edu.kh" \
TRUST_PROXY=1 \
npm start
```

### Container Deployment (Docker Compose)
```bash
export JWT_SECRET="$(openssl rand -hex 32)"
export FRONTEND_ORIGIN="https://cdes.edu.kh"
docker compose up -d --build
docker compose ps
```
`docker-compose.yml` enforces hardened container runtime defaults (`init: true`, `read_only: true`, `tmpfs: /tmp`, `cap_drop: [ALL]`, `no-new-privileges: true`, `cpus: 1.0`, `memory: 512M`).

---

## 4. Health Checks & Observability
- **Liveness Probe**: `GET /api/health/live` — zero-DB HTTP `200` confirming the Node.js event loop is responsive.
- **Readiness & Combined Probes**: `GET /api/health/ready` and `GET /api/health`
  - Returns HTTP `200` with `ready: true`, `database.integrity: "ok"` (cached 15-min `PRAGMA quick_check` TTL so high-frequency probes never stall the event loop), `database.foreignKeys: true`, `database.journalMode: "wal"`, `database.schemaVersion >= 12`.
  - Returns HTTP `503` if migrations failed or DB integrity check fails (original `.db` files are NEVER deleted on failure).
- **Admin Operational Metrics**:
  - `GET /api/metrics` (admin JWT required; supports `?deep=true` for on-demand `PRAGMA quick_check`): HTTP request counts, status distribution, p50/p95 latencies, Node heap/RSS & event-loop p95 delay, SQLite/WAL file sizes, and live table row counts.
  - `GET /api/metrics/prometheus` (admin JWT required): Prometheus `0.0.4` text exposition format for external scrapers.
  - `GET /api/metrics/sqlite` (admin JWT required): `readOps`, `writeOps`, `writerMax`, `busyTimeoutRetries`, slow queries, and top query plans.

---

## 5. Online Backup, Restore & Retention Operations

### Online WAL-Safe Atomic Backup (Zero Downtime)
```bash
node dist/server/db/backupRestore.mjs backup \
  /var/lib/cdes/cdes_platform.db \
  /var/lib/cdes/backups/cdes_$(date -u +%Y%m%dT%H%M%SZ).db
```
- Uses `PRAGMA busy_timeout = 5000`, `PRAGMA wal_checkpoint(TRUNCATE)`, `VACUUM INTO` a temporary sibling file, verifies `PRAGMA integrity_check = ok`, `0` FK violations, and `schemaVersion > 0`, then atomically `rename()`s into place.
- Automated tiered retention wrapper: `./server/db/backup_db.sh --db /var/lib/cdes/cdes_platform.db --out-dir /var/lib/cdes/backups --keep-daily 7 --keep-weekly 4 --keep-monthly 6` (automatically falls back to `backupRestore.mjs` when `sqlite3` CLI is absent).

### Controlled Restore (Stop Server First)
```bash
# 1. Stop application service
# 2. Quarantine broken DB (+ -wal/-shm) for forensics
# 3. Restore atomically:
node dist/server/db/backupRestore.mjs restore \
  /var/lib/cdes/backups/cdes_20261125T000000Z.db \
  /var/lib/cdes/cdes_platform.db
# 4. Restart application and verify GET /api/health/ready -> 200
```

### Scheduled Retention Cron
```bash
# Full transactional retention runner (analytics, AI logs, Hermes memory, inactive non-admin users, expired revoked JWTs)
DATABASE_PATH=/var/lib/cdes/cdes_platform.db node dist/server/retention.cjs

# Legacy cutoff dry-run & optional JSONL export before purge
node dist/server/db/retention_cron.js --db /var/lib/cdes/cdes_platform.db --cutoff 2026-08-01 --dry-run
node dist/server/db/retention_cron.js --db /var/lib/cdes/cdes_platform.db --cutoff 2026-08-01 --export-jsonl /var/lib/cdes/archives
```

---

## 6. Safe Rollback Procedure
1. Create a fresh online snapshot via `backupRestore.mjs backup` before deploying any release.
2. Migrations `008`–`012` are strictly tracked in `schema_migrations` (`v12` adds `revoked_jwt_tokens`, `users.token_version`, `community_votes`, 24 missing indexes, FK `ON DELETE SET NULL`, and drops 25 unused legacy tables).
3. To roll back code + DB cleanly: stop the server, restore the pre-release backup snapshot with `backupRestore.mjs restore`, deploy the previous `dist/` artifact or container tag, start the server, and verify `GET /api/health/ready` returns `200` (`integrity: "ok"`).
