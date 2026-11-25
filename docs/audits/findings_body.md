
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
