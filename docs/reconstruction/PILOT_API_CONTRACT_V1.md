# CDES Pilot API Contract V1

This contract documents every stable HTTP API endpoint backing the V1.2.0 Pilot journeys (Public Catalog Discovery, Authenticated Student Profile Management, Organization Submission & Editorial Review, and Offline/Bounded Guidance), plus the operational disposition of all extended modules.

---

## 1. Authentication, Session Cookies & CSRF

- **Session Cookie**: `cdes_jwt` (`HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` enabled automatically in `production`/`staging` unless `COOKIE_SECURE=false`).
- **CSRF Protection**:
  - `GET /api/auth/csrf` and `GET /api/auth/session` issue an `HttpOnly` `cdes_csrf_secret` cookie and return a session-bound HMAC token in both the `X-CSRF-Token` response header and JSON `data.csrfToken`.
  - All state-changing browser requests (`POST`, `PUT`, `PATCH`, `DELETE`) using cookies must send the matching `X-CSRF-Token` header.
  - Pure API callers using `Authorization: Bearer <jwt>` without a `cdes_jwt` cookie are supported during transition and exempt from CSRF headers.
  - CSRF failures return HTTP `403` with `code: "CSRF_MISSING"` or `code: "CSRF_INVALID"`.

### Key Auth & Privacy Endpoints

| Method & Path | Permission | Request Body / Params | Key Response Fields & Status |
| --- | --- | --- | --- |
| `GET /api/auth/csrf` | Public | — | `200`: `{ success: true, data: { csrfToken } }` + `X-CSRF-Token` header |
| `GET /api/auth/session` | Public | — | `200`: `{ success: true, data: { authenticated, user, profile, education, csrfToken } }` |
| `POST /api/auth/register` | Public (+rate limit) | `{ email, password (>=8 chars), role: "student"\|"organization", name, education_level?, organization_name? }` | `201`: `{ success: true, data: { user, profile, education, csrfToken } }` + cookies; creates pending privacy defaults (`consentStatus: "pending"`, `allow*: false`) |
| `POST /api/auth/login` | Public (+rate limit) | `{ email, password }` | `200`: sets rotated `cdes_jwt` & `cdes_csrf_secret`; `401` on invalid credentials |
| `POST /api/auth/logout` | Public (CSRF-protected) | — | `200`: clears `cdes_jwt` and `cdes_csrf_secret` cookies even if JWT expired |
| `GET /api/users/profile` | Authenticated | — | `200`: `{ success: true, data: { profile, education } }`; `401` if unauthenticated |
| `PUT /api/users/profile` | Authenticated | `{ name?, education_level?, school?, location?, major?, target_career?, interests?, ... }` | `200`: updates only `req.user.userId`'s profile (`401` if guest) |
| `POST /api/users/education` | Authenticated | `{ institution, degree, start_date?, end_date?, achievements? }` | `201`: `{ success: true, data: EducationHistoryRecord }` |
| `DELETE /api/users/education/:id` | Authenticated (owner) | `:id` path param | `200` or `404` if not owned by user |
| `GET /api/privacy/consent` | Authenticated | — | `200`: `{ studentId, isMinor, parentalConsentVerified, parentVerificationStatus, allowAnalyticsTracking, allowResearchInclusion, allowAiMemory, consentStatus, anonymizedResearchId }` |
| `POST /api/privacy/consent` | Authenticated | `{ isMinor?, parentEmail?, allowAnalyticsTracking?, allowResearchInclusion?, allowAiMemory?, withdrawAll? }` | `200`: minors cannot enable optional flags without `parentVerificationStatus === "verified"`; `withdrawAll: true` sets `consentStatus: "withdrawn"` |
| `POST /api/privacy/parent-verify` | Authenticated | `{ parentEmail }` | `200`: sets `parentVerificationStatus: "pending_owner_verification"` while keeping `parentalConsentVerified: false` |
| `POST /api/privacy/parent-verify/:studentId/approve` | `admin` | `:studentId` param | `200`: marks `parentalConsentVerified: true`, `parentVerificationStatus: "verified"` |

---

## 2. Scholarships & Universities Catalog Contract

### Accuracy, Provenance & Tri-State Fields
- Missing funding/benefit data MUST NOT be synthesized:
  - Unknown stipend -> `monthlyAllowance: "Not specified"`, `monthlyAllowanceKm: "មិនបានបញ្ជាក់"`, `benefitStates.monthlyAllowanceKnown: false`.
  - Explicit zero stipend -> `monthlyAllowance: "$0/month"`, `monthlyAllowanceKm: "០ ដុល្លារ/ខែ"`, `benefitStates.monthlyAllowanceKnown: true`.
  - Missing package value -> `totalEstimatedValueUSD: null`.
  - Benefits (`insurance`, `flightSupport`, `accommodation`) expose tri-state `state: "included" | "excluded" | "unknown"` and `isKnown: boolean`.
- Deadline & Verification Provenance:
  - `deadlineStatus`: `"open" | "closing_soon" | "expired" | "rolling" | "unknown"`, with integer `daysRemaining: number | null`.
  - `verificationState`: `"verified" | "unverified" | "pending"`.
  - `lastVerifiedDate`: `string | null` (only populated from explicit verification records/timestamps, separate from `lastUpdatedDate`).
  - `verifierName`: `string | null` (`null` when unverified).
  - `qualityScore`: deterministic `0–100` score calculated strictly from present verified/source/funding/deadline attributes.
- Universities:
  - Missing accreditation -> `{ status: "Not specified", statusKm: "មិនបានបញ្ជាក់", isKnown: false, agency: null }`.

### Catalog & Editorial Endpoints

| Method & Path | Permission | Behavior & Error Codes |
| --- | --- | --- |
| `GET /api/scholarships` (alias `/search`) | Public | Filters (`q`, `region`, `degree`, `field`, `funding`, `studentCategory`, `onlyVerified`, `sortBy`). Public searches never log to `search_keywords_log`. Returns `{ success: true, totalCount, scholarships, metrics }`. |
| `GET /api/scholarships/:id` | Public | Returns `{ success: true, scholarship }` or `404`. |
| `POST /api/scholarships/submit` | `organization` or `admin` | Derives `submitted_by_user_id = req.user.userId`. Creates `'Pending Admin Review'` submission (`201`). Returns `403` for `student` or `401` for guest. |
| `GET /api/scholarships/submissions/mine` | `organization` or `admin` | Lists submissions created by `req.user.userId`. |
| `GET /api/scholarships/submissions/all` (aliases `/submissions`, `/admin/submissions`) | `admin` | Lists all submissions (`403` non-admin). |
| `PUT /api/scholarships/submissions/:id` (aliases `/submissions/:id/review`, `/admin/submissions/:id/review\|approve\|reject`) | `admin` | Transactional (`BEGIN IMMEDIATE`) & idempotent: repeat approval returns `{ alreadyProcessed: true, publishedScholarship }` without duplicate insertion; opposite decision returns `409 CONFLICT`; rejection never inserts into `scholarships`. |
| `POST /api/scholarships/report` (alias `/report-error`) | Authenticated | Submits factual error report tied to `req.user.email`. |
| `GET /api/scholarships/reports*` / `PUT\|PATCH /api/scholarships/reports/:id` | `admin` | Lists and resolves discrepancy reports. |
| `POST /api/scholarships/check-updates` (aliases `/admin/check-updates`, `/:id/check-updates`) | `admin` | Non-destructive status check (`externalFetchPerformed: false`, `changesDetected: 0`); never alters deadlines or writes simulated crawler history. |
| `GET /api/universities` & `GET /api/universities/:id` | Public | Returns `{ success: true, data, count }` / `{ success: true, data }`. |

---

## 3. Guidance, Health & Operations

| Endpoint | Permission | Modes & Error Contract |
| --- | --- | --- |
| `POST /api/advisor/chat` | `optionalAuth` (CSRF required for browser) | **No key / offline**: HTTP `200` with `mode: "deterministic_offline"`, `providerStatus: "disabled"`, `isEstimate: true`, `sources`, `unavailableData`. **Timeout**: HTTP `504` (`code: "PROVIDER_TIMEOUT"`). **Transport/upstream failure**: HTTP `503` (`code: "PROVIDER_UNAVAILABLE"`). Persistence to `ai_conversations` occurs only when authenticated AND `canUseAIMemory === true`. |
| `POST /api/decision/evaluate` | `optionalAuth` (CSRF required for browser) | HTTP `200` with `mode: "rule_based"`, `isEstimate: true`, `sources`, `unavailableData`. Analytics event persisted only when authenticated AND `canCollectAnalytics === true`. |
| `GET /api/health` | Public | `200` `{ status: "ok", ready: true, aiEnabled, database: { journalMode: "wal", foreignKeys: true, schemaVersion: 8, integrity: "ok" } }` or `503` `{ status: "error", ready: false }` on DB/migration failure. |
| `GET /api/metrics` & `GET /api/metrics/sqlite` | `admin` | `401` unauthenticated, `403` non-admin, `200` live table/row counts, SQLite metrics (`writerMax`, `busyTimeoutRetries`, `readOps`, `writeOps`), HTTP request counts & p50/p95 latency. |
| Any unknown `/api/*` | Public | HTTP `404` JSON `{ success: false, error: "API route not found." }`. |

### Synthetic Example Payloads

**Missing-funding scholarship detail response (`GET /api/scholarships/:id`)**:
```json
{
  "success": true,
  "scholarship": {
    "id": "sch-example-missing",
    "name": "Example Foundation Grant",
    "totalEstimatedValueUSD": null,
    "monthlyAllowance": "Not specified",
    "monthlyAllowanceKm": "មិនបានបញ្ជាក់",
    "insurance": "Not specified",
    "deadlineStatus": "expired",
    "daysRemaining": -120,
    "verificationState": "unverified",
    "lastVerifiedDate": null,
    "verifierName": null
  }
}
```

**Offline advisor response (`POST /api/advisor/chat` with `GEMINI_API_KEY` unset)**:
```json
{
  "success": true,
  "mode": "deterministic_offline",
  "providerStatus": "disabled",
  "isEstimate": true,
  "persisted": false,
  "sources": ["cdes_verified_scholarship_catalog", "cdes_rule_engine"],
  "unavailableData": ["authenticated_student_profile", "external_llm_provider"],
  "reply": "..."
}
```

---

## 4. Disposition of Extended Modules (Post-Pilot Queue)

1. **Learning & STEM Labs (`/api/learning`, `/api/learning-science`)**: Protected with `authenticateToken` + `resolveAuthorizedStudentId` and `admin` gating for cohort analytics/reports; client paths aligned (`/paths`). Deferred for full persistence/resume UX tests in Phase 6.
2. **Community, Mentoring & Events (`/api/community`)**: Protected writes and student-owned queries with `resolveAuthorizedStudentId`, admin-only moderation list, and client method alignment (`/students/:id/sessions`). Deferred for end-to-end moderation & booking state reconciliation.
3. **AI Memory v1/v2 & Research (`/api/ai`, `/api/ai-os`, `/api/research`)**: Consent-gated (`allow_ai_memory`, `allow_research_inclusion`) with real research-eligible SQL queries and zero synthetic student fabrication; kept gated pending owner minor/guardian KYC workflow rollout.
4. **Avatar World, Digital World & Data Platform (`/api/avatar-world`, `/api/digital-world`, `/api/data-platform`, `/api/platform`, `/api/knowledge`)**: Private endpoints authenticated/ownership-checked and telemetry consent-gated; labeled clearly as demo/infrastructure modules in the UI matrix.
