# CDES Student-Instructor — Penetration-Test Scope

## Recon Phase 2 — Data Layer Security Audit

**Scope owner:** QA_SECURITY (qa_security)
**Target:** C:\Users\sethe\GitHub\Student-Instructor-V1.2.0 data layer
**Companion documents:** SECURITY_REVIEW_REPORT.md, FINDINGS_REMEDIATION.md

## 1. Test Objectives (mapped to findings)

| Finding | Pen-test objective |
|---|---|
| F-001 | Confirm unauthenticated access to consent records plus ability to escalate parentalConsentVerified for arbitrary students. |
| F-002 | Confirm destructive hard-delete of student/scholarship records (no recoverable soft-delete). |
| F-003 | Confirm JWT forgery via predictable signing key plus re-identification risk via research salt. |
| F-004 | Confirm db files can be committed to git; verify no db in tracked repo. |
| F-005 | Confirm any caller (no auth) can request full dossier of any student ID. |
| F-006 | Confirm no scheduled retention/prune job exists; retention SLA not enforced. |
| F-007 | Confirm PII leakage in consent/dossier responses (sanitize not applied). |

## 2. Preconditions

- Target repo clone: C:\Users\sethe\GitHub\Student-Instructor-V1.2.0 (committed source only, no live DB dependency).
- Reference: CDES operating model (Student Instructor V1.2.0), docs/SECRETS.md.
- No destructive actions (no history rewrite, no DB deletion, no secret rotation) without owner authorization.
- All findings below to be confirmed via black-box source-level and, where safe, local-run verification.

## 3. Test Cases

### TC-1 (F-001) Consent endpoint auth bypass plus IDOR plus parental escalation
1. GET /api/privacy/consent with no Authorization header -> expect 200 with a consent record.
2. GET /api/privacy/consent?studentId=<random-uuid> with no auth -> expect 200 with that student record (no ownership check).
3. POST /api/privacy/consent with no auth, body with studentId plus allowAnalyticsTracking -> expect success flag and record updated.
4. POST /api/privacy/parent-verify with no auth, body with studentId plus parentEmail -> expect parentalConsentVerified written as true.
5. Confirm parent_email is returned in any consent response without authentication.

**Expected result (block):** Unauthenticated access plus arbitrary student-ID targeting plus parental-consent escalation confirmed.

### TC-2 (F-002) Hard-delete / no soft-delete
1. Locate DELETE paths in the data layer (scholarship repo delete and any entity delete methods).
2. Confirm no is_deleted or deleted_at flag is consulted anywhere.
3. Confirm FKs use ON DELETE CASCADE (irreversible).

**Expected result (block):** Delete is irreversible; no soft-delete path exists.

### TC-3 (F-003) Committed secret material
1. Verify JWT signing key fallback constant in authService.ts (predictable HMAC key for jsonwebtoken).
2. Verify research salt fallback constant in privacyRepository.ts (predictable HMAC salt for anonymized IDs).
3. Confirm docs/SECRETS.md records SEC-001 as containment-partial.

**Expected result (block):** Predictable signing key and HMAC salt present in committed source.

### TC-4 (F-004) DB-file git hygiene
1. Verify .gitignore contains *.db (it does not, only *.db-wal and *.db-shm).
2. Verify server/data is not excluded.
3. Confirm tracked files include db artifacts (per repo history).

**Expected result (block):** db files visible to git add.

### TC-5 (F-005) Data-platform route IDOR / no auth
1. GET /student-dossier/{any-uuid} with no auth header -> expect 200 with full dossier.
2. GET /governance/{any-uuid} -> 200 with governance/consent state.
3. GET /governance/export/{any-uuid} -> 200 with an exported dossier.
4. Confirm no ownership scoping: any-uuid is attacker-controlled.

**Expected result (block):** Fully unauthenticated, cross-tenant data exposure.

### TC-6 (F-006) Retention enforcement
1. Search server/ for node-cron, setInterval, prune, retention -> confirm none.
2. Confirm package.json has no cron dependency.
3. Confirm getDataCollectionMatrix only documents SLAs; no enforcement function.

**Expected result (block):** No scheduled retention job exists.

### TC-7 (F-007) PII leakage at response boundary
1. Inspect consent GET response path (privacyController to privacyService.getConsent to repo) -> confirm sanitizeForPublic is not called.
2. Inspect dossier response path -> confirm no sanitization.
3. Confirm sanitizeForPublic exists but is never invoked.

**Expected result (block):** parent_email and other PII returned raw.

## 4. Deliverable Checklist

- [x] Scope and objectives
- [x] Preconditions
- [x] Test cases mapped to findings
- [x] Expected and blocked status per case
- [ ] Execute (automated local runs where safe) and record evidence
- [ ] Link results to FINDINGS_REMEDIATION.md actions
- [ ] CTA: obtain CTO Bot sign-off for remediation plan

## 5. Sign-off

| Role | Name | Sign-off |
|---|---|---|
| QA Security (scope) | qa_security | (this doc) |
| CTO Bot (remediation acceptance) | CTO Bot | pending F-001 through F-005 remediation |
