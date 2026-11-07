# Cambodia Digital Education Society (CDES)
## Phase 2 Backend Architecture & REST API Documentation

This document describes the production backend architecture and REST API endpoints implemented for the CDES platform.

---

### System Architecture Overview

The backend employs a **Layered Clean Architecture**:
1. **Controller Layer (`server/controllers/`)**: Express routers handling HTTP parsing, rate-limiting, status codes, and authorization middleware.
2. **Service Layer (`server/services/`)**: Business logic, query filtering, matching algorithms, Gemini AI orchestration, and entity formatting.
3. **Repository Layer (`server/repositories/`)**: Direct, secure parameterized SQL queries against the high-performance SQLite engine (`DatabaseSync`).
4. **Data Persistence (`server/db/`)**: Relational schema (`schema.sql`), connection pool with WAL mode (`connection.ts`), and idempotent migrations (`migrate.ts`).

---

### Authentication & Authorization (RBAC)

Protected endpoints require a Bearer token in the `Authorization` header:
```http
Authorization: Bearer <JWT_TOKEN>
```

#### Supported Roles
- `student`: Access to personal profile, education records, recommendation engines, and error reporting.
- `organization`: Verified institutional representatives submitting scholarships and editing university profiles.
- `admin`: Full administrative access (reviewing submissions, resolving community reports, database audits, and verification badges).

---

## 1. Authentication APIs (`/api/auth`)

### 1.1 Register New Account
- **Method**: `POST /api/auth/register`
- **Access**: Public (Rate-limited: 10 requests / 15 min)
- **Request Body**:
```json
{
  "email": "serey.rath@cdes.edu.kh",
  "password": "Password123!",
  "role": "student",
  "name": "Serey Rath",
  "education_level": "Grade 12"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-8a9018e2-...",
    "email": "serey.rath@cdes.edu.kh",
    "role": "student",
    "name": "Serey Rath"
  }
}
```

### 1.2 User Login
- **Method**: `POST /api/auth/login`
- **Access**: Public (Rate-limited: 10 requests / 15 min)
- **Request Body**:
```json
{
  "email": "admin@cdes.edu.kh",
  "password": "Admin@CDES2026!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-admin-01",
    "email": "admin@cdes.edu.kh",
    "role": "admin",
    "status": "active"
  }
}
```

### 1.3 Verify Token & Get Current User
- **Method**: `GET /api/auth/me`
- **Access**: Protected (`student`, `organization`, `admin`)
- **Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "userId": "usr-admin-01",
    "email": "admin@cdes.edu.kh",
    "role": "admin"
  }
}
```

---

## 2. User & Profile APIs (`/api/users`)

### 2.1 Get Profile & Timeline
- **Method**: `GET /api/users/profile`
- **Access**: Protected
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr-student-01",
      "email": "student@cdes.edu.kh",
      "role": "student",
      "status": "active",
      "created_at": "2026-09-17T08:00:00Z"
    },
    "profile": {
      "id": "prof-usr-student-01",
      "name": "Sokha Meng",
      "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
      "phone": "+855 12 345 678",
      "education_level": "Undergraduate Senior",
      "university": "Institute of Technology of Cambodia (ITC)",
      "major": "Data Science & Artificial Intelligence",
      "gpa": 3.82,
      "target_career": "Machine Learning Engineer"
    },
    "education": [
      {
        "id": "edu-usr-student-01-1",
        "institution": "Institute of Technology of Cambodia (ITC)",
        "degree": "Engineering Degree in Data Science",
        "field_of_study": "Data Science & AI",
        "start_date": "2022-10-01",
        "end_date": "2026-07-30",
        "achievements": "Ranked Top 5 in Tronc Commun Year 2"
      }
    ]
  }
}
```

### 2.2 Update Profile
- **Method**: `PUT /api/users/profile`
- **Access**: Protected
- **Request Body**:
```json
{
  "target_career": "AI Cloud Architect",
  "gpa": 3.88
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": { ... }
}
```

### 2.3 Add Education Milestone
- **Method**: `POST /api/users/profile/education`
- **Access**: Protected
- **Request Body**:
```json
{
  "institution": "Preah Sisowath High School",
  "degree": "High School Diploma (Bac II)",
  "field_of_study": "Science & Mathematics Track",
  "start_date": "2019-10-01",
  "end_date": "2022-08-30",
  "achievements": "Grade A National Exam"
}
```

---

## 3. Scholarship APIs (`/api/scholarships`)

### 3.1 Search & Filter Scholarships
- **Method**: `GET /api/scholarships`
- **Access**: Public
- **Query Parameters**:
  - `q`: Free-text search across title, Khmer title, provider, field of study, and tags.
  - `region`: `Cambodia`, `Japan`, `Europe`, `USA`, `Australia`, `Global`, etc.
  - `degree`: `Bachelor`, `Master`, `PhD`.
  - `funding`: `Fully funded`, `Tuition only`, `Partial funding`.
  - `onlyVerified`: `true` or `false`.
  - `sortBy`: `latest_updated`, `deadline_approaching`, `fully_funded`, `most_popular`.
- **Response (200 OK)**:
```json
{
  "success": true,
  "totalCount": 14,
  "scholarships": [
    {
      "id": "sch-chevening-uk",
      "name": "Chevening UK Government Scholarships",
      "nameKm": "អាហារូបករណ៍រដ្ឋាភិបាលចក្រភពអង់គ្លេស Chevening",
      "provider": "UK Foreign, Commonwealth & Development Office",
      "country": "United Kingdom",
      "region": "Europe",
      "degreeLevel": ["Master"],
      "fundingType": "Fully funded",
      "totalEstimatedValueUSD": 35000,
      "deadline": "2026-11-05",
      "verifiedBadge": true,
      "officialSourceUrl": "https://www.chevening.org/scholarship/cambodia/"
    }
  ],
  "metrics": {
    "totalScholarships": 14,
    "verifiedScholarships": 12,
    "pendingSubmissions": 1,
    "pendingReports": 0
  }
}
```

### 3.2 Match Scholarships to Student Profile
- **Method**: `POST /api/scholarships/match`
- **Access**: Public / Authenticated
- **Request Body**:
```json
{
  "educationLevel": "Grade 12",
  "targetMajor": "Computer Science",
  "interests": ["Artificial Intelligence", "Robotics"],
  "gpa": 3.75
}
```
- **Response (200 OK)**: Returns list sorted by match score with personalized reasoning.

### 3.3 Submit Partner Opportunity
- **Method**: `POST /api/scholarships/submit`
- **Access**: Public or Organization Partner
- **Request Body**:
```json
{
  "organizationName": "Paragon International University",
  "contactEmail": "admissions@paragoniu.edu.kh",
  "scholarshipName": "Paragon STEM Excellence Grant",
  "country": "Cambodia",
  "region": "Cambodia",
  "degreeLevel": ["Bachelor"],
  "fieldOfStudy": ["Computer Science", "Engineering"],
  "fundingType": "Fully funded",
  "deadline": "2026-10-31",
  "officialSourceUrl": "https://paragoniu.edu.kh/scholarships"
}
```

### 3.4 Community Error Reporting
- **Method**: `POST /api/scholarships/report`
- **Access**: Public
- **Request Body**:
```json
{
  "scholarshipId": "sch-chevening-uk",
  "scholarshipName": "Chevening UK Government Scholarships",
  "reportedField": "deadline",
  "description": "Deadline has been extended by one week on the official website.",
  "suggestedCorrection": "2026-11-12",
  "officialSourceUrl": "https://www.chevening.org",
  "reporterEmail": "student@cdes.edu.kh"
}
```

### 3.5 AI Document Extraction
- **Method**: `POST /api/scholarships/ai-extract`
- **Access**: Public (Rate-limited)
- **Request Body**:
```json
{
  "rawText": "The Ministry of Post and Telecommunications (MPTC) announces the 2026 Digital Talent Scholarship Program offering 100 full scholarships for high school graduates to pursue Bachelor degrees in Computer Science, Cyber Security, and Software Engineering at CADT...",
  "sourceUrl": "https://mptc.gov.kh/announcements/scholarship-2026"
}
```
- **Response (200 OK)**: Structured scholarship JSON extracted with `gemini-3.1-flash-lite`.

---

## 4. University Intelligence APIs (`/api/universities`)

### 4.1 List Universities
- **Method**: `GET /api/universities`
- **Access**: Public
- **Query Parameters**:
  - `type`: `Public`, `Private`, `Dual Degree`
  - `stem`: `true`
  - `q`: Search query
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 7,
  "data": [
    {
      "id": "univ-cadt",
      "name": "Cambodia Academy of Digital Technology",
      "nameKm": "បណ្ឌិត្យសភាបច្ចេកវិទ្យាឌីជីថលកម្ពុជា",
      "abbreviation": "CADT",
      "type": "Public / State Digital Academy",
      "city": "Phnom Penh",
      "profileScore": 96,
      "stemExcellence": true,
      "annualTuitionUsd": 1600,
      "majors": [...]
    }
  ]
}
```

### 4.2 University Detail & Majors
- **Method**: `GET /api/universities/:id`
- **Access**: Public
- **Response (200 OK)**: Complete institution dossier including curriculum structure, tuition tiers, admission requirements, and career placement stats.

---

## 5. AI Education Advisor APIs (`/api/advisor`)

### 5.1 Interactive Conversational Counseling
- **Method**: `POST /api/advisor/chat`
- **Access**: Public / Authenticated
- **Database Persistence**: Every query, AI response, recommended majors, and latency is recorded in `ai_conversations`.
- **Request Body**:
```json
{
  "userPrompt": "I have 10 years of experience running my own business. Can I get a full scholarship to study Artificial Intelligence in the UK or Singapore?",
  "studentProfile": {
    "name": "Kiri",
    "educationLevel": "Working Professional",
    "targetMajor": "Applied AI"
  }
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "reply": "Your 10+ years of entrepreneurship background is a tremendous competitive advantage when applying for AI programs and scholarships...",
  "source": "gemini-3.1-flash-lite",
  "recommendedMajors": [
    "Applied Artificial Intelligence & Machine Learning",
    "AI Product Management & Strategy",
    "Data Science & Business Analytics"
  ],
  "suggestedMentors": [
    "Sreypov Kim (Tech Founder & Cloud Architect)",
    "Dalin Chhem (Senior Software Engineer @ Smart)"
  ],
  "suggestedQuestions": [
    "How do I frame a 10-year business portfolio for a Chevening AI scholarship?",
    "What are the best conversion Master's programs in AI for non-CS graduates?"
  ]
}
```

---

## 6. Decision Engine & Analytics APIs (`/api/decision`, `/api/analytics`)

### 6.1 Multi-Factor Decision Evaluation
- **Method**: `POST /api/decision/evaluate`
- **Access**: Public
- **Request Body**:
```json
{
  "interests": ["Technology", "Software"],
  "mathAbility": "strong",
  "strengths": ["Logic", "Problem Solving"],
  "budgetTier": "scholarship_dependent"
}
```
- **Response (200 OK)**: Returns high-confidence major fit, top universities in Cambodia, 4-year tuition ROI calculation, and a step-by-step action checklist.

### 6.2 Telemetry Event Ingestion
- **Method**: `POST /api/analytics/event`
- **Access**: Public
- **Request Body**:
```json
{
  "eventName": "SCHOLARSHIP_CARD_EXPANDED",
  "userId": "usr-student-01",
  "metadata": { "scholarshipId": "sch-chevening-uk" }
}
```
