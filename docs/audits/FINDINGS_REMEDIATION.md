# CDES Student-Instructor — Findings + Remediation Plan

## Recon Phase 2 — Data Layer Security Findings & Remediation

**Owner of this plan:** QA_SECURITY (qa_security)
**Status:** Open | **Sign-off required from:** CTO Bot (before review gate)

This document maps every finding from the security review report to a concrete remediation action, owner, and sign-off.

## Finding-to-Remediation Matrix

| ID | Severity | Finding | Owner | Remediation action | Status | Sign-off |
|---|---|---|---|---|---|---|
| F-001 | CRITICAL | Consent endpoint auth bypass + IDOR + parental-consent escalation | CTO Bot (security) | 1) Remove optionalAuth from /api/privacy/consent GET/POST and /api/privacy/parent-verify. 2) Require authenticateToken. 3) Enforce ownership (only req.user.userId may be used as the target studentId). 4) Add real email-address verification/signature for parent-verify. 5) Add an admin-only audit log for consent changes. | Open | CTO Bot |
| F-002 | CRITICAL | No soft-delete implementation (hard DELETE only) | Database architect | 1) Add is_deleted INTEGER DEFAULT 0, deleted_at TEXT, deleted_by TEXT to core student/career/scholarship entities (schema). 2) Make every SELECT soft-exclude is_deleted=1. 3) Backfill via a one-time migration. 4) Add archive + hard-delete-after-retention policy. 5) Hook into change_history table. | Open | CTO Bot |
| F-003 | HIGH | Committed fallback tokens + SEC-001 | DevOps | 1) Delete all fallback token constants. 2) Inject every credential at runtime from GitHub Environment/secret manager. 3) Rotate/revoke (owner-authorized action). 4) Restore SEC-001 regression-test coverage. 5) Document a token-rotation runbook. | Open | CTO Bot |
| F-004 | HIGH | SQLite DB files not git-ignored | DevOps | 1) Add *.db, *.db-wal, *.db-shm, cdes_smoke.db to .gitignore. 2) Add a CI check that refuses *.db blobs. 3) Verify git status is clean of server/data. | Open | CTO Bot |
| F-005 | HIGH | Data-platform routes fully unauthenticated, no ownership scoping | CTO Bot (security) | 1) Add authentication to /student-dossier, /governance, /governance/export. 2) Enforce ownership (student reads own studentId; admins may pin scopes). 3) Add pagination + field-level projection. 4) Return only consented, scope-appropriate fields. 5) Log data-access events. | Open | CTO Bot |
| F-006 | MODERATE | Data retention not enforced (no automated job) | Database architect | 1) Implement a scheduled retention/prune job (daily cron) enforcing the documented SLAs. 2) Move raw streams to anonymized-cohort layer; purge beyond cap. 3) Record each purge in change_history. 4) Confirm job runs in CI/staging. | Open | CTO Bot |
| F-007 | MODERATE | PII-redaction helper defined, never applied | CTO Bot (security) | 1) Apply sanitizeForPublic() to the consent GET response and any non-admin data-platform read. 2) Add a regression test asserting parent_email is absent from consent responses. | Open | CTO Bot |

## Sign-off Chain

    QA_SECURITY (report) -> Engineer (implementation of F-001..F-007) -> CTO Bot (remediation sign-off) -> Review gate

- Critical/High items (F-001..F-005) must be remediated, re-verified, and signed off by CTO Bot before the review gate.
- Moderate items (F-006..F-007) may be bundled with the next board cycle, but are required to fully close the phase.
- Owner-authorized rotation is required for F-003. No destructive action (history rewrite, DB deletion) is to be taken without owner authorization.

## Verification & Traceability

Each finding above was verified against committed source, not inferred. Evidence files inspected:
- server/controllers/privacyController.ts, server/services/privacyService.ts, server/repositories/privacyRepository.ts, server/repositories/scholarshipRepository.ts, server/services/dataPlatformService.ts, server/routes/dataPlatformRoutes.ts, server/services/authService.ts, server/middleware/authMiddleware.ts, server/db/schema.sql, server/data, docs/SECRETS.md, server/tests/secretScan.test.ts, audit-baseline.json, package.json.

### Acceptance Evidence for CTO Bot

| Gate check | Current state | Required to close |
|---|---|---|
| No critical/high open | F-001..F-005 open | Remediate F-001..F-005, re-run CI gitleaks + SEC-001, re-verify |
| Secrets gate green | SEC-001 containment-partial | Rotate/revoke + restore SEC-001 regression |
| DB-file git hygiene | .gitignore omits *.db | Add *.db* to .gitignore, CI check, clean server/data |
| Soft-delete implemented | Not implemented | schema + migration + backfill (F-002) |
| Consent endpoint authN | Unauthenticated + parental escalation | authN + ownership + email verification (F-001) |
