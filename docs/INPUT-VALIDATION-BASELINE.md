# CDES Platform — Input Validation Baseline

## Overview

This document specifies the input validation requirements for the CDES Student-Instructor-V1.2.0 platform. All API inputs must be validated before processing.

---

## 1. Validation Principles

1. **Validate on the server side** — never trust client-side validation alone.
2. **Validate early** — validate at the API boundary, before business logic.
3. **Fail fast** — reject invalid input immediately with appropriate HTTP status codes.
4. **Validate structure, content, and constraints** — all three dimensions.
5. **Use whitelisting** — only accept known-good values.

---

## 2. Validation Layers

### Layer 1: Route-level validation (Express middleware)

- Validate HTTP method, content-type, required headers.
- Reject non-JSON content types unless explicitly allowed.

### Layer 2: Body-level validation (schema validation)

- Validate request body structure and types.
- Use a schema validation library (e.g., zod, joi, or manual validation).
- Reject invalid payloads with 400 Bad Request.

### Layer 3: Field-level validation

Validate each field:
- **String fields**: type, length, format (e.g., email regex, URL format).
- **Numeric fields**: type, range (min/max).
- **Enum fields**: must be one of allowed values.
- **Boolean fields**: must be boolean.

### Layer 4: Database-level validation

- Use parameterized queries exclusively.
- Validate foreign key references exist.
- Allow NULL for nullable fields, reject for non-nullable.

---

## 3. Input Schema Definitions

### 3.1 Student Record (POST /api/students)

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| first_name | string | Yes | 1-100 chars, no HTML |
| last_name | string | Yes | 1-100 chars, no HTML |
| email | string | Yes | Valid email format, unique |
| dob | string | No | ISO date format, must be past |
| grade | number | No | 10-12 |
| target_university | string | No | Max 255 chars |

### 3.2 Scholarship Record (POST /api/scholarships)

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | Yes | 1-255 chars |
| description | string | No | Max 5000 chars |
| deadline | string | No | ISO date |
| eligibility_criteria | string | No | Max 5000 chars |
| amount | number | No | >= 0 |

### 3.3 University Record (POST /api/universities)

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | 1-255 chars |
| country | string | Yes | 2-100 chars (ISO country code or named) |
| location | string | No | Max 255 chars |
| website | string | No | Valid URL |

### 3.4 User Record (POST /api/auth/register)

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| email | string | Yes | Valid email, unique |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit |
| role | string | No | Enum: student, organization, admin |
| name | string | No | Max 255 chars |

---

## 4. Implementation Requirements

### 4.1 Validation Library

Implement input validation using a schema validation library:
- Option A: `zod` (TypeScript-native, recommended)
- Option B: `joi` (popular, robust)
- Option C: Manual validation with base TypeScript types

### 4.2 Example Validation Middleware

```typescript
import { z } from 'zod';

const StudentSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email(),
  grade: z.number().int().min(10).max(12).optional(),
  target_university: z.string().max(255).optional(),
});

export function validateStudent(req: Request, res: Response, next: NextFunction) {
  const result = StudentSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.issues,
    });
  }
  req.body = result.data;
  next();
}
```

### 4.3 Sanitization

- Strip HTML tags from text fields.
- Escape special characters in SQL queries (use parameterized queries).
- Encode output to prevent XSS in frontend.

---

## 5. Field-Level Security Check

**Critical Fields (must NOT be in request or stored as-is):**

| Field | Type | Action |
|-------|------|--------|
| password_hash | string | Never store in plain text (use bcrypt) |
| password | string | Hash before storage |
| api_key | string | Never accept in API |
| secrets | string | Never accept in API |

---

## 6. Validation Matrix

| Endpoint | Validation Method | Status |
|----------|------------------|--------|
| POST /api/students | Zod schema | PENDING |
| POST /api/scholarships | Zod schema | PENDING |
| POST /api/universities | Zod schema | PENDING |
| POST /api/auth/register | Zod schema | PENDING |
| POST /api/consent | Zod schema | PENDING |

---

## 7. Testing Requirements

1. Unit tests for each validation schema (PASS/FAIL matrix).
2. Integration tests for validation middleware.
3. Negative tests (invalid input should return 400).
4. Edge cases (empty strings, overflow, Unicode).

---

## 8. Summary

| Aspect | Status |
|--------|--------|
| Schema library selected | PENDING (recommend Zod) |
| All schemas defined | PENDING |
| Tests written | PENDING |
| Integration tested | PENDING |

---

**Owner:** QA_SECURITY
**Date:** 2026-10-31
