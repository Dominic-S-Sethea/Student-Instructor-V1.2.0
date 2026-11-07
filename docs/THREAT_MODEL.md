# CDES Platform — Threat Model (2026-10-31)

## 1. Overview

This threat model documents the security posture of the CDES Student-Instructor-V1.2.0 platform, aligned to OWASP Top 10 (2021) and STRIDE threat categories.

**Platform Components:**
- Frontend: React 19 + TypeScript + Vite + Tailwind
- Backend: Express 4 (TypeScript) + Node.js v26.7.0
- Database: SQLite (WAL mode, node:sqlite DatabaseSync)
- AI: @google/genai v2.4.0 (gemini-2.5-flash)
- Auth: JWT Bearer + bcryptjs + RBAC (student/organization/admin)

---

## 2. Threat Categories (STRIDE)

| STRIDE | Description | Threat | Mitigation |
|--------|-------------|--------|------------|
| **Spoofing** | Impersonation of users or systems | Attacker obtains valid JWT token and acts as authenticated user | JWT with short expiry; httpOnly cookies; RBAC enforced on server |
| **Tampering** | Unauthorized data modification | Attacker modifies request payload to alter student records | Input validation; parameterized queries; request signing |
| **Repudiation** | User denies performing an action | Audit log lacks user identity; no logs for admin actions | All actions logged with user_id, timestamp, IP |
| **Information Disclosure** | Sensitive data exposure | DB contains password hashes; API responses expose internal fields | .gitignore updates; credential rotation; field-level filtering |
| **Denial of Service** | Service unavailable | Malicious traffic overwhelms API; SQLite lock contention | Rate limiting; CORS; SQLite WAL mode; busy_timeout |
| **Elevation of Privilege** | Out-of-role access | User gains admin access; organization user accesses other organizations' data | RBAC middleware; ownership checks on all queries |

---

## 3. Detailed Threat Analysis

### 3.1 Authentication & Session Management

**Threat:** JWT token theft or replay.

- **Current State:** JWT stored in memory; Bearer token in Authorization header.
- **Risk:** MEDIUM — tokens can be stolen via XSS or network sniffing.
- **Mitigation:** 
  - Set `Secure`, `SameSite=Strict` on cookies.
  - Use short-lived access tokens (15 min) + refresh tokens.
  - Implement token rotation on refresh.

### 3.2 Data Validation

**Threat:** SQL injection via input fields.

- **Current State:** All queries use parameterized statements via node:sqlite.
- **Risk:** LOW — parameterized queries prevent injection.
- **Mitigation:** 
  - Continue using parameterized queries.
  - Add input validation middleware for all endpoints.
  - Validate data types, formats, and length constraints.

### 3.3 Data Exposure

**Threat:** Sensitive data in API responses.

- **Current State:** Some API responses may expose internal fields.
- **Risk:** MEDIUM — password hashes should never be in responses.
- **Mitigation:**
  - Implement field-level filtering in controllers.
  - Never return password_hash, token, or internal IDs.
  - Add response sanitization middleware.

### 3.4 Audit Logging

**Threat:** Lack of audit trail for admin actions.

- **Current State:** Migrations and schema changes logged.
- **Risk:** LOW — no action-level audit.
- **Mitigation:**
  - Add action logging middleware for all API endpoints.
  - Log user_id, action, timestamp, IP address, resulting data summary.

### 3.5 Denial of Service

**Threat:** SQLite lock contention under high load.

- **Current State:** WAL mode enabled; busy_timeout set to 5000ms.
- **Risk:** LOW — WAL and busy_timeout mitigate most issues.
- **Mitigation:**
  - Continue WAL mode.
  - Increase busy_timeout for high-load scenarios.
  - Implement rate limiting on public endpoints.

---

## 4. Risk Assessment

| Threat | Likelihood | Impact | Risk Level |
|--------|------------|--------|------------|
| Parameterized query injection | LOW | HIGH | LOW |
| Sensitive data exposure | MEDIUM | HIGH | MEDIUM |
| JWT token theft | MEDIUM | HIGH | MEDIUM |
| Audit log missing | LOW | HIGH | LOW-MEDIUM |
| DoS via SQLite locks | MEDIUM | MEDIUM | LOW-MEDIUM |
| RBAC bypass | LOW | HIGH | LOW |

---

## 5. Recommendations

1. **Add input validation middleware** for all API endpoints (type, format, length).
2. **Implement field-level response filtering** to remove sensitive data.
3. **Add audit logging middleware** for all write operations.
4. **Harden JWT** with short expiry + rotation.
5. **Add rate limiting** middleware (already present in authMiddleware.ts).
6. **Run regular dependency audits** (npm audit — already in CI).
7. **Run automated secret scans** (already present via gitleaks).

---

## 6. Triage Summary

| Priority | Finding | Action | Owner | Deadline |
|----------|---------|--------|-------|----------|
| P1 | Sensitive data in responses | Implement field-level filtering | CTO Bot | Next sprint |
| P2 | No audit logging for admin actions | Add audit middleware | CTO Bot | Next sprint |
| P3 | JWT expiry not optimal | Shorten expiry + rotation | CTO Bot | Next sprint |
| P4 | Input validation gaps | Add schema validation | Engineer | Next sprint |
| P5 | Rate limiting bypass | Review middleware implementation | DevOps | Next sprint |

**Overall Risk Rating:** MEDIUM — no critical vulnerabilities identified; standard mitigations recommended.

---

## 7. References

- OWASP Top 10 (2021)
- CDES RULES.md (security rules)
- CONTRIBUTING.md (if exists)

---

**Threated-by:** QA_SECURITY
**Date:** 2026-10-31
