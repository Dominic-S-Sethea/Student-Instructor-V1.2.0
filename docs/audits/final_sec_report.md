# CDES Student-Instructor — Security Review Report

## Recon Phase 2 — Data Layer Security Audit

**Reviewer:** QA_SECURITY (qa_security) · **Phase:** Recon Phase 2 (data layer)
**Review date:** 2026-10-29
**Scope:** soft-delete coverage · consent endpoint security · data retention enforcement · sensitive-data handling
**Repository:** C:\Users\sethe\GitHub\Student-Instructor-V1.2.0
**Deliverables:** (1) this report · (2) FINDINGS_REMEDIATION.md · (3) PENETRATION_TEST_SCOPE.md

## 1. Executive Summary

The data layer for Recon Phase 2 was audited across soft-delete coverage, consent endpoint security, data retention enforcement, and sensitive-data handling. The audit found 2 Critical, 3 High, and 2 Moderate findings. Two of the Critical findings directly block acceptance:

- **F-001 [CRITICAL]** The consent endpoints (GET /api/privacy/consent, POST /api/privacy/consent, POST /api/privacy/parent-verify) are unauthenticated (optionalAuth) and permit arbitrary student-ID access (IDOR) plus parental-consent escalation without any email verification. An unauthenticated attacker can read any minor consent record (parent_email, is_minor, research flags) and mark parentalConsentVerified=true for any student.

- **F-002 [CRITICAL]** The data layer has no soft-delete implementation. Every delete path performs hard DELETE (FKs use ON DELETE CASCADE), so student, scholarship, and academic records are irreversibly destroyed. The GDPR-K right-to-erasure and Recon Phase 2 soft-delete requirements are not implemented.

Additional High findings:
- **F-003 [HIGH]** Hardcoded fallback secret material: JWT_SECRET (authService.ts) and RESEARCH_SALT (privacyRepository.ts), plus documented SEC-001 (containment-partial) hardcoded seed passwords / fallback Gemini key.
- **F-004 [HIGH]** SQLite .db files not git-ignored (only *.db-wal and *.db-shm are excluded).
- **F-005 [HIGH]** The data-platform routes (/student-dossier, /governance, /governance/export) carry no authentication middleware at all and take studentId directly from the request (default usr-student-01) with no ownership scoping.

Moderate findings:
- **F-006 [MODERATE]** Data retention is documented but not enforced (no scheduled/prune job; no cron dependency).
- **F-007 [MODERATE]** The PII redaction helper sanitizeForPublic() is defined in privacyService.ts but never invoked anywhere, so consent/dossier responses return raw PII.

Acceptance status at review gate: NOT met. No Critical/High finding has a signed-off remediation plan.

## 2. Scope & Methodology

### 2.1 In scope
- Soft-delete coverage across data-access paths (repositories, schema, services, routes).
- Consent endpoint security (authN/authZ, ownership, parental verification).
- Data retention enforcement (SLA descriptors, scheduled/prune job).
- Sensitive-data handling (secrets, PII redaction, DB-file git hygiene).

### 2.2 Out of scope
- Application-layer authn for non-privacy routes (separate module).
- Frontend-only scheduling clocks.
- Infrastructure/WAF configuration.

### 2.3 Evidence sources (files inspected directly)
server/controllers/privacyController.ts, server/services/privacyService.ts, server/repositories/privacyRepository.ts, server/repositories/scholarshipRepository.ts, server/services/dataPlatformService.ts, server/routes/dataPlatformRoutes.ts, server/services/authService.ts, server/middleware/authMiddleware.ts, server/db/schema.sql, server/db/migrate.ts, server/data, docs/SECRETS.md, server/tests/secretScan.test.ts, audit-baseline.json, package.json. Pattern searches for soft_delete/is_deleted/deleted_at/retentionJob/prune/node-cron/setInterval returned zero hits across the data layer.

### F-003 [HIGH] Committed fallback tokens + SEC-001
**Files:** server/services/authService.ts, server/repositories/privacyRepository.ts, docs/SECRETS.md
**CWE:** CWE-798, CWE-312

**Evidence (verified):**
- authService.ts binds its JWT signing key to a committed fallback literal when process.env.JWT_SECRET is unset. The key is predictable, so an attacker can forge an admin or student token.
- privacyRepository.ts binds its research salt to a committed fallback literal when process.env.RESEARCH_SALT is unset. The HMAC basis for anonymized IDs is predictable, weakening re-identification resistance.
- docs/SECRETS.md (the repo credential-handling doc) records SEC-001 as containment-partial, citing hardcoded seed passwords, a fallback Gemini key, and plaintext passwords in test fixtures.

**Impact:** Prediction of the JWT signing key allows forging sessions; predicting the research salt lets an attacker regenerate anonymized IDs and correlate records.

**Remediation:** Delete all fallback token material; inject every credential at runtime from GitHub Environment/secret manager; rotate/revoke (owner-authorized action); restore SEC-001 regression-test coverage; document a token-rotation runbook.

### F-004 [HIGH] SQLite DB files can be committed to git (acceptance check)
**File:** .gitignore
**CWE:** CWE-732

**Evidence (verified):** .gitignore excludes *.db-wal and *.db-shm only — it does NOT exclude *.db. The server/data directory holds PII, consent records, demographics, and telemetry.

**Impact:** A developer running git add -A would commit the bare SQLite files (or -wal/-shm companions) into the repository, placing raw PII in git history with a traceability risk even after removal.

**Remediation:** Add *.db, *.db-wal, *.db-shm, and cdes_smoke.db to .gitignore; add a CI check that refuses *.db blobs; verify git status --short is clean of server/data.

### F-005 [HIGH] Data-platform routes fully unauthenticated with no ownership scoping
**Files:** server/routes/dataPlatformRoutes.ts, server/services/dataPlatformService.ts
**CWE:** CWE-306, CWE-639, CWE-200

**Evidence (verified):** dataPlatformRoutes.ts defines /student-dossier/:studentId?, /governance/:studentId?, and /governance/export/:studentId? with NO authentication middleware at all (unlike the privacy routes which at least use optionalAuth). Every handler reads studentId from the request path with no caller identity. dataPlatformService.getStudentIntelligenceDossier(studentId = usr-student-01) resolves the caller-supplied studentId and performs broad, unscoped reads (SELECT * on cdes_student_identities, cdes_student_goals, cdes_student_interest_vectors, cdes_student_behavioral_telemetry, cdes_student_achievements, cdes_student_projects, cdes_feature_store_online), with NO ownership check.

**Impact:** Any caller (no token required) can request the full dossier of any student ID via /student-dossier, /governance, or /governance/export. The studentId parameter is not validated or scoped to the caller.

**Remediation:** Enforce authentication and ownership (student reads own studentId; admins may pin scopes); add pagination + field-level projection; return only consented, scope-appropriate fields; log data-access events.

### F-006 [MODERATE] Data retention is documented but not enforced (no automated job)
**File:** server/services/dataPlatformService.ts - getDataCollectionMatrix()
**CWE:** CWE-772

**Evidence (verified):** The data-collection matrix documents retention SLAs (90 days raw behavioral stream before aggregation; 180 days feature-store partition; permanent verified credentials). A repository-wide search for retention/prune/scheduled-job code (retentionJob, pruneData, retentionPrune, setInterval in server code; node-cron/cron) returned none. package.json has no cron/dependency for scheduled execution; the data layer contains no setInterval retention loop.

**Impact:** Raw behavioral telemetry and recommendation events can be retained indefinitely, exceeding the documented acquisition-SLA and potentially violating the data-minimization principle for child-safety data.

**Remediation:** Implement a scheduled retention/prune job (e.g., daily cron) that enforces the documented SLAs, moving raw streams to the anonymized-cohort layer and purging beyond the cap; record each purge in change_history; confirm the job runs in CI/staging.

### F-007 [MODERATE] PII-redaction helper is defined but never applied
**File:** server/services/privacyService.ts - sanitizeForPublic()
**CWE:** CWE-312 / weak defense-in-depth

**Evidence (verified):** PrivacyService.sanitizeForPublic() strips email, password_hash, parent_email, etc., but it is defined and never invoked anywhere in the codebase (consent endpoints do not call it; dataPlatformService.ts does not call it). Consent endpoints and dossier routes return raw PII fields such as parent_email directly.

**Impact:** Even after the authZ fix in F-001/F-005, a response could still leak PII to a caller that holds a token, because no sanitization is applied at the boundary.

**Remediation:** Apply sanitizeForPublic() to the consent GET response and to any data-platform read that is not admin-scoped; add a regression test asserting parent_email is absent from consent responses.

## 4. Security Control Verification Checklist

| Control | Status | Evidence |
|---|---|---|
| Soft-delete on core entities | FAIL | Zero soft_delete/is_deleted/deleted_at matches in data layer |
| Consent endpoint authN | FAIL | optionalAuth + default usr-student-01 + no ownership |
| Parental consent verification | FAIL | No email verification in verifyParentalConsent |
| Data-platform route authN | FAIL | No auth middleware at all on /student-dossier, /governance, /governance/export |
| Data retention enforcement | FAIL | Documented SLA only; no prune/scheduler in repo |
| Secrets injection (no fallback) | FAIL | JWT_SECRET and RESEARCH_SALT committed fallback constants |
| DB-file git hygiene | FAIL | .gitignore omits *.db; server/data present |
| PII redaction on responses | FAIL | sanitizeForPublic defined, never called |
| Audit trail for sensitive changes | WEAK | change_history table present; no ownership/auth on read/write |

## 5. Review-Gate Status, Findings, and Required Actions

- **Acceptance criterion:** "no Critical/High findings open at review gate" → **NOT MET** (F-001 and F-002 are Critical and open).
- **Remediation plan:** see FINDINGS_REMEDIATION.md — curated actions for F-001 through F-007 with owners. F-001, F-002, F-003, F-004, F-005 are the Critical/High items.
- **Required before sign-off (CTO Bot):** remediate F-001 through F-005, re-run the CI gitleaks and SEC-001 gates (F-003), and verify that server/data is clean of .db blobs (F-004).

Owner-authorized rotation is required for F-003. No destructive action (history rewrite, DB deletion) is to be taken without owner authorization.

## Appendix A — Penetration-test scope

See PENETRATION_TEST_SCOPE.md for the per-finding test plan (TC-1 through TC-7). Scope covers the consent endpoints, data-platform routes, delete-path irreversibility, secrets, DB-file hygiene, retention enforcement, and response sanitization.

## Appendix B — Remediation plan

See FINDINGS_REMEDIATION.md for the finding-to-remediation matrix: owner, action, status, and sign-off chain for F-001 through F-007.
