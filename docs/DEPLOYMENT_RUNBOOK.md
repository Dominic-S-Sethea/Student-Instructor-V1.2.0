# CDES Student-Instructor V1.2.0 — Production Deployment & Operations Runbook

## 1. Runtime Architecture
- **Single-Package Deployment**: React 19 + Vite 6 static bundle (`dist/public/`) served by Express 4 (`dist/server/server.cjs`) backed by native Node.js 22+ `node:sqlite` in WAL mode (`PRAGMA foreign_keys = ON`, `PRAGMA busy_timeout = 5000`).
- **Private Build Separation**: `dist/public/` holds only client assets. `dist/server/server.cjs`, `dist/server/db/schema.sql`, `dist/server/db/migrations/*.sql`, `dist/server/db/backupRestore.mjs`, and `dist/server/db/retention_cron.js` sit outside static hosting and are never publicly served.
- **Zero-Demo Production Boot**: When `NODE_ENV=production` or `NODE_ENV=staging`, catalog scholarships and universities are seeded automatically, while **zero demo accounts** are created.

---

## 2. Required Environment Variables

| Variable | Required in Prod | Default | Security / Operational Notes |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | `development` | Set to `production` or `staging`. Enables static serving, HSTS, Secure cookies, and masked 5xx errors. |
| `JWT_SECRET` | **Yes (≥32 chars)** | — | Generate via `openssl rand -hex 32`. Weak/placeholder secrets are rejected at runtime in `production`/`staging`. |
| `RESEARCH_SALT` | Recommended | HMAC(`JWT_SECRET`) | Dedicated 32-byte hex secret for pseudonymizing `anonymized_research_id`. |
| `DATABASE_PATH` | Yes | `server/data/cdes_platform.db` | Mount on persistent local/block storage (never ephemeral container filesystem or NFS). |
| `FRONTEND_ORIGIN` | Yes | `http://localhost:5173` | Comma-separated exact origins (e.g. `https://cdes.edu.kh,https://www.cdes.edu.kh`). Wildcard `*` is rejected. |
| `TRUST_PROXY` | Behind TLS proxy | unset | Set `1` behind a single reverse proxy (Nginx/Caddy/Cloudflare) so rate limiting & Secure cookies see real client IPs/TLS. |
| `COOKIE_SECURE` | Auto (`true` in prod/staging) | auto | Keep `true` behind HTTPS. Set `false` ONLY for local HTTP smoke testing. |
| `GEMINI_API_KEY` | Optional | `""` | Leave unset to run Study Advisor in honest `deterministic_offline` mode (`aiEnabled: false`). |
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

---

## 4. Health Checks & Observability
- **Readiness & Liveness**: `GET /api/health`
  - Returns HTTP `200` with `ready: true`, `database.integrity: "ok"`, `database.foreignKeys: true`, `database.journalMode: "wal"`, `database.schemaVersion >= 11`.
  - Returns HTTP `503` if migrations failed or DB integrity check fails (original `.db` files are NEVER deleted on failure).
- **Admin Operational Metrics**:
  - `GET /api/metrics` (admin JWT required): HTTP request counts, status distribution, p50/p95 latencies, live SQLite table row counts.
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

### Controlled Restore (Stop Server First)
```bash
# 1. Stop application service
# 2. Quarantine broken DB (+ -wal/-shm) for forensics
# 3. Restore atomically:
node dist/server/db/backupRestore.mjs restore \
  /var/lib/cdes/backups/cdes_20261125T000000Z.db \
  /var/lib/cdes/cdes_platform.db
# 4. Restart application and verify GET /api/health -> 200
```

### Scheduled Retention Cron (Dry-Run First)
```bash
node dist/server/db/retention_cron.js --db /var/lib/cdes/cdes_platform.db --cutoff 2026-08-01 --dry-run
node dist/server/db/retention_cron.js --db /var/lib/cdes/cdes_platform.db --cutoff 2026-08-01
```

---

## 6. Safe Rollback Procedure
1. Create a fresh online snapshot via `backupRestore.mjs backup` before deploying any release.
2. Migrations `008`–`011` are strictly additive or FK-hardening without breaking prior catalog columns.
3. To roll back code + DB cleanly: stop the server, restore the pre-release backup snapshot with `backupRestore.mjs restore`, deploy the previous `dist/` artifact or container tag, start the server, and verify `GET /api/health` returns `200` (`integrity: "ok"`).
