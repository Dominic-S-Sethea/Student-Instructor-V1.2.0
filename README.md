# Cambodia Digital Education Society (CDES)
## Student Decision Intelligence & Education Intelligence Platform (V1.2.0)

> **Platform:** Remix Remix Student Instructor V1.2.0  
> **Codename:** High School Pilot Validation Suite & Education Intelligence Platform (EIDP)  
> **Released:** September 18, 2026  
> **Target:** Grade 10–12 Cambodia (MoEYS Digital Education Strategy 2030)

[![Platform Version](https://img.shields.io/badge/version-v1.2.0-blue.svg)](https://github.com/Dominic-S-Sethea/Student-Instructor-V1.2.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node: >=22.0.0](https://img.shields.io/badge/node->=22.0.0-emerald.svg)](https://nodejs.org/)
[![TypeScript: ~5.8](https://img.shields.io/badge/typescript-~5.8-blue.svg)](https://www.typescriptlang.org/)
[![React: 19](https://img.shields.io/badge/react-19-cyan.svg)](https://react.dev/)
[![Tailwind CSS: 4](https://img.shields.io/badge/tailwind_css-4.1-38bdf8.svg)](https://tailwindcss.com/)

An integrated national education intelligence and decision support platform engineered for Grade 10–12 high school students, university aspirants, and educators across Cambodia.

---

## 📋 Table of Contents
- [Overview & Vision](#overview--vision)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
- [Database & Storage Engine](#database--storage-engine)
- [AI Engine Integration](#ai-engine-integration)
- [API Architecture & Endpoints](#api-architecture--endpoints)
- [Localization (Khmer & English)](#localization-khmer--english)
- [Codebase Features In Development](#codebase-features-in-development)
- [License](#license)

---

## Overview & Vision

The **CDES Student Decision Intelligence Platform** unifies high school academic validation, national examination (Bac II) grade prediction, comprehensive scholarship discovery (CSIP), higher education institutional intel, and sovereign student longitudinal modeling — all wrapped in an 8-week turnkey school pilot validation framework and a 4-tier storage lakehouse architecture.

Aligned with the **MoEYS Digital Education Strategy 2030**, the platform bridges educational information gaps, offering students verifiable pathways to higher education and global academic opportunities.

### Platform Version History

| Version | Release Focus | Key Highlights |
| :--- | :--- | :--- |
| **V1.2.0** | **Pilot Validation Suite & EIDP** | Turnkey 8-week school pilot, live Bac II ML predictor, 4-tier storage lakehouse, sovereign privacy. |
| **V1.1.3** | **Education Intelligence Data Platform (EIDP)** | 4-tier storage, 7-Pillars student model, sovereign data governance. |
| **V1.1.2** | **Scholarship Search Engine (CSIP)** | Fixed header, 150+ verified opportunities, AI ingestion, error reporting. |
| **V1.1.1** | **University Decision Intelligence** | 6-stage cognitive fit engine, university profiles, tuition ROI calculator. |
| **V1.1.0** | **Mentorship & STEM Lab** | 1-on-1 mentorship booking, STEM quests, career directory. |

---

## Key Features

### A. Grade 10–12 High School Pilot Validation Suite

1. **8-Week Turnkey School Pilot Structure**
   - Phased implementation blueprint for New Generation Schools (NGS) and public high schools.
   - Milestone checklists and director briefing decks.

2. **Acquisition Engines**
   - Concrete execution pathways for First 100, First 500, and First 1,000 active students.
   - Campus ambassadors, teacher orientation kits, and telegram study circles.

3. **Interactive Bac II Predictor**
   - ML engine calibrated with historical MoEYS Bac II pass rates and grade distributions (Grade A to E cutoff probabilities).
   - Provides letter grade probabilities and actionable subject improvement priorities.

### B. Education Intelligence Data Platform (EIDP)

1. **4-Tier Storage Architecture**
   - **ACID Operational SQLite/WAL transactional layer** — `server/db/connection.ts`, `server/db/schema.sql`
   - **DuckDB Parquet lakehouse** — analytical query layer for education datasets
   - **Dense HNSW vector engine** — semantic search over student academic profiles
   - **Redis real-time feature store** — low-latency feature retrieval for ML inference

2. **7-Pillar Longitudinal Dossier**
   - Sovereign identity, academic goals, applied STEM projects, behavioral telemetry, chronotypes, and academic telemetry.

3. **Triple-Lock Sovereign Privacy**
   - Multi-party consent protocol across student, parent, and school director.
   - Zero behavioral tracking, sovereign JSON export, and full Cambodian E-Commerce Law compliance.

### C. Cambodia Scholarship Intelligence Platform (CSIP)

- 150+ verified opportunities covering domestic scholarships, ASEAN, Japan (MEXT), South Korea (GKS), China (CSC), Australia (AAS), UK (Chevening), Europe (Erasmus+ / Eiffel), and the US (Fulbright).
- Strict **98.6% quality verification standard** to prevent outdated or fraudulent scholarship listings.
- Multi-dimensional filters (funding scope, degree level, target audience, field of study).
- Deadline countdown clocks and deadline urgency alerts.

### D. Cambodia University Intelligence

- Profiles of public and private higher education institutions (CADT, ITC, RUPP, NUM, Paragon, AUPP, etc.).
- Tuitions, accredited faculties, career outcome benchmarks, and campus facilities.
- 6-stage cognitive fit engine for university matching.

### E. AI Guidance & Advisory Agent

- Server-proxied Google Gemini AI integration with fallback heuristic models for uninterrupted career and study advisory.
- **Model:** `gemini-2.5-flash` with thinking level control and structured JSON schema output for student recommendations.

---

## System Architecture

The platform follows a **Clean, Layered Architecture** with a single unified full-stack process:

```plaintext
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│  (Tailwind CSS v4, Motion, Lucide Icons, Context API)  │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / REST / JSON
┌───────────────────────────▼────────────────────────────┐
│                  Express.js Backend                    │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Controllers  (HTTP Validation, Auth, Rate Limits)  │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ Services     (Business Logic & AI Orchestration)  │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ Repositories (Parameterized SQL Queries)          │ │
│ └─────────────────────────┬──────────────────────────┘ │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     SQLite Embedded       │ │     Google Gemini AI      │
│   (WAL Mode, Node:Sqlite) │ │  (@google/genai SDK v2.4) │
└───────────────────────────┘ └───────────────────────────┘
```

### EIDP Storage Stack

```
┌────────────────────────────────────────────────────────┐
│  Redis — Real-time Feature Store                       │
│  (low-latency feature retrieval for ML inference)      │
├────────────────────────────────────────────────────────┤
│  DuckDB — Parquet Lakehouse                            │
│  (analytical queries on education datasets)            │
├────────────────────────────────────────────────────────┤
│  SQLite/WAL — Operational Transactional Layer          │
│  (student records, scholarship, university profiles)   │
└────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 6](https://vite.dev/)
- **Language**: TypeScript (~5.8)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/) (Framer Motion)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown**: `react-markdown`
- **Effects**: `canvas-confetti`

### Backend
- **Runtime**: [Node.js 22+](https://nodejs.org/) (native `node:sqlite` DatabaseSync)
- **Framework**: [Express 4](https://expressjs.com/)
- **Execution**: `tsx` for live TypeScript execution in development; `esbuild` for production bundling.
- **Security & Auth**: `bcryptjs` (password hashing), `jsonwebtoken` (JWT Bearer tokens), Role-Based Access Control (`student`, `organization`, `admin`).
- **Validation**: `zod` (`^4.6.7`) for runtime input validation.
- **CORS**: `cors` (`^2.8.5`) with `credentials: true` for session cookie support.
- **AI Engine**: `@google/genai` (Google Gen AI SDK v2.4.0) with server-side proxy routes and timeout protections.

### Observability

- **Structured JSON logging**: `server/middleware/loggingMiddleware.ts`
- **Request logging**: `server/middleware/requestLogger.ts`
- **Distributed tracing**: `server/middleware/tracingMiddleware.ts` (`traceId`, `requestId`, `timestamp`)
- **Metrics endpoint**: `/api/metrics` (uptime, node version, memory, cpu, dbMetrics)
- **Rate limiter**: Per-route middleware (`server/middleware/rateLimiter.ts`)
- **CSRF protection**: `server/middleware/csrfMiddleware.ts` (token ID header + cookie-based token)

---

## Project Directory Structure

```plaintext
├── .env.example                # Template environment variables
├── .npmrc                        # npm contract (lockfile + audit gate)
├── index.html                  # HTML entry point with SEO metadata
├── jsconfig.json               # JS/TS editor path mapping
├── package.json                # Project dependencies and npm scripts
├── PATCHNOTES.md               # Version release history (V1.1.2 - V1.2.0)
├── RULES.md                    # Project rules & operating model
├── server.ts                   # Unified server entry point (Express + Vite middlewares)
├── tsconfig.json               # TypeScript compiler configuration (frontend)
├── tsconfig.server.json        # TypeScript compiler configuration (backend)
├── vite.config.ts              # Vite bundler configuration (frontend)
├── docs/                       # Architectural specs & API documentation
│   ├── API_DOCUMENTATION.md    # Complete REST API reference
│   ├── BACKUP-RESTORE-TEST-RESULT.md
│   ├── DB-RESTORE-RUNBOOK.md
│   ├── INPUT-VALIDATION-BASELINE.md
│   ├── OBSERVABILITY-SETUP.md
│   ├── PENETRATION-TESTING-REPORT.md
│   ├── SECRETS.md
│   ├── THREAT_MODEL.md
│   └── UX-AUDIT.md
├── public/                     # Static public assets, icons, manifests
├── server/                     # Backend application code
│   ├── controllers/            # Express controllers (auth, scholarship, university, etc.)
│   ├── data/                   # Initial seeds (scholarships, universities, pilot data)
│   ├── db/                     # Database setup, WAL connection, and migrations
│   │   ├── connection.ts       # SQLite DatabaseSync connection
│   │   ├── metrics.ts          # DB metrics and health monitoring
│   │   ├── migrate.ts          # Idempotent migration runner
│   │   ├── retention_cron.js   # Retention cleanup cron
│   │   └── schema.sql          # Relational schema DDL
│   ├── middleware/             # JWT auth, role validation, rate limiting, observability
│   │   ├── authMiddleware.ts
│   │   ├── csrfMiddleware.ts
│   │   ├── loggingMiddleware.ts
│   │   ├── rateLimiter.ts
│   │   ├── requestLogger.ts
│   │   └── tracingMiddleware.ts
│   ├── repositories/           # Parameterized SQL data access layer
│   ├── routes/                 # Express route definitions
│   ├── scholarships.ts         # Scholarship data pipeline
│   ├── services/               # Core business services & AI orchestration
│   ├── tests/                  # Backend unit & integration tests
│   ├── types/                  # TypeScript interfaces and entity types
│   └── validators/             # zod input validation schemas
├── src/                        # React frontend application
│   ├── App.tsx                 # Root application component
│   ├── components/             # Reusable UI components (Navbar, Modals, Drawers)
│   ├── context/                # AuthContext, LanguageContext, SavedScholarshipContext
│   ├── data/                   # Client-side definitions, fallback datasets
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # Client-side API fetch client (`apiClient.ts`)
│   ├── types/                  # TypeScript interfaces and entity types
│   ├── utils/                  # Utility functions
│   ├── App.tsx                 # Root application component
│   ├── index.css               # Global stylesheet & Tailwind directives
│   ├── main.tsx                # Client application bootstrap
│   └── vite.config.ts          # Vite configuration (frontend)
├── .env.example                # Template for environment variables
├── index.html                  # HTML entry point with SEO metadata
├── metadata.json               # Platform configuration metadata
├── package.json                # Project dependencies and npm scripts
├── PATCHNOTES.md               # Version release history (V1.1.2 - V1.2.0)
├── RULES.md                    # Project rules & operating model
├── server.ts                   # Unified server entry point (Express + Vite middlewares)
├── tsconfig.json               # TypeScript compiler configuration (frontend)
├── tsconfig.server.json        # TypeScript compiler configuration (backend)
├── vite.config.ts              # Vite bundler configuration (frontend)
└── docs/                       # Architectural specs & API documentation
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v22.0.0` or higher (required for native `node:sqlite` DatabaseSync support)
- **npm** or **bun** / **yarn**

> **Note**: The project uses `node:sqlite` (built-in Node.js SQLite module). No external SQLite installation is required.

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Dominic-S-Sethea/Student-Instructor-V1.2.0.git
   cd Student-Instructor-V1.2.0
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

   > The `npm install` process uses `package-lock=true` (locked for reproducible `npm ci`).

### Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables in `.env`:

```env
# Google Gemini API key for AI advisory features
GEMINI_API_KEY="your-gemini-api-key"

# JWT Secret for authentication tokens (optional, default fallback provided in dev)
JWT_SECRET="your-secure-jwt-secret-phrase"

# Application host URL
APP_URL="http://localhost:3000"
```

> **Note**: Even if no `GEMINI_API_KEY` is provided, the platform automatically switches to deterministic Cambodian education advisory models without crashing.

### Running the Development Server

Start the unified full-stack development server:

```bash
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.

- Express backend APIs run on `/api/*`
- Vite automatically handles Hot Module Replacement (HMR) for all React frontend components on the same port.

### Building for Production

1. **Build both client and server**:

   ```bash
   npm run build
   ```

   This generates:
   - `dist/` (static optimized Vite frontend bundle)
   - `dist/server.cjs` (bundled production Node.js server via `esbuild`)

2. **Start the production server**:

   ```bash
   npm start
   ```

3. **Type Checking & Linting**:

   ```bash
   npm run lint
   ```

4. **Running the Test Suite**:

   ```bash
   npm test
   ```

   Runs the backend integration test suite and the SEC-001 secret scanning regression tests. Requires a fresh test database (auto-cleaned via `DATABASE_PATH` env var).

5. **Dependency Audit Gate**:

   The CI pipeline enforces a hard dependency audit gate using `npm audit`:

   ```bash
   npm run audit:dep
   ```

---

## Database & Storage Engine

The platform operates an embedded relational SQLite database powered by Node's synchronous engine:

- **Location**: Local database file `cdes_platform.db` (auto-created on start). See `.gitignore` for exclusion rules (`*.db`, `*.db-wal`, `*.db-shm`, `cdes_smoke.db`).
- **WAL Mode**: Write-Ahead Logging (`PRAGMA journal_mode = WAL;`) for concurrent read/write throughput.
- **Auto-Migrations**: `server/db/migrate.ts` automatically runs on server startup, executing idempotent DDL statements in `server/db/schema.sql`.
- **Soft-Delete**: All core tables include `is_deleted`, `deleted_at`, and `deleted_by` columns for safe, recoverable data removal.

### EIDP Storage Tier Architecture

| Tier | Technology | Purpose |
| --- | --- | --- |
| **Operational** | SQLite/WAL | ACID transactional layer for student, scholarship, university records |
| **Lakehouse** | DuckDB + Parquet | Analytical query layer for education datasets |
| **Vector Index** | HNSW | Semantic search over student academic profiles |
| **Feature Store** | Redis | Low-latency feature retrieval for ML inference |

---

## AI Engine Integration

The platform uses Google's latest **`@google/genai` TypeScript SDK**:

- **Model**: `gemini-2.5-flash` with thinking level control and structured JSON schema output for student recommendations.
- **Server-Side Proxy**: All AI requests are executed inside server endpoints; API keys are never exposed to the client browser.
- **Resilience**: Features 12-second timeout wrappers (`withTimeout`) to guarantee fast UI response times and prevent 504 gateway timeouts.
- **Fallback Models**: Deterministic heuristic models activate when no `GEMINI_API_KEY` is configured, ensuring uninterrupted career and study advisory.

---

## API Architecture & Endpoints

A comprehensive API guide is available in [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md). Key endpoint modules:

| Path Prefix | Description | Auth Requirement |
| :--- | :--- | :--- |
| `/api/auth` | Registration, login, current profile verification | Public / Bearer Token |
| `/api/scholarships` | Search, filter, inspect verified global & local scholarships | Public |
| `/api/universities` | Cambodian university profiles, faculties, tuition info | Public |
| `/api/student-intelligence` | Bac II prediction engine, student academic profile | Bearer Token |
| `/api/ai` | Gemini-powered career & study roadmap generators | Public / Authenticated |
| `/api/privacy` | Sovereign data export, triple-lock parental consent | Bearer Token |
| `/api/health` | Service uptime and migration health check | Public |

### Additional Endpoints (EIDP, Pilot Suite, Data Strategy)

| Path Prefix | Description | Auth Requirement |
| :--- | :--- | :--- |
| `/api/student-dossier` | 7-Pillar longitudinal student dossier | Bearer Token |
| `/api/pilot` | School pilot validation & readiness metrics | Bearer Token |
| `/api/data-platform` | Knowledge lakehouse & advanced analytics | Bearer Token |
| `/api/agent2` | AI guidance agent proxy | Authenticated |

**Authentication & Ownership**: All `/api/privacy/*`, `/api/data-platform/*`, `/api/student-dossier/*` endpoints require bearer token and enforce ownership scoping (admin override for authorized viewers).

**Rate Limiting**: Global rate limiter (`server/middleware/rateLimiter.ts`) applied to all routes; per-route limits of 5–50 req/min depending on route sensitivity.

**CSRF Protection**: Server-rendered forms and authenticated API clients use CSRF tokens (`X-CSRF-Token` header + `X-CSRF-Token-Id` cookie).

---

## Localization (Khmer & English)

The interface natively supports bilingual toggling:

- **Khmer (ភាសាខ្មែរ)**: Tuned with standardized Cambodian educational and Ministry terminology (Bac II, អាហារូបករណ៍, ពិន្ទុ, ក្រសួងអប់រាជ).
- **English**: International standard terms for global scholarships and university admissions.
- Managed centrally via `src/context/LanguageContext.tsx`.

---

## Codebase Features In Development

To maintain a clean high school pilot experience, two future modules have their code preserved in the platform backend and frontend architecture, with header navigation temporarily disabled until their formal release:

1. **Avatar World**: Spatial student learning environment (`server/controllers/avatarWorldController.ts`, `src/components/AvatarWorld/`).
2. **Data Strategy**: Advanced education data lakehouse metrics (`server/routes/dataPlatformRoutes.ts`, `src/components/DataStrategy/`).

Both modules remain fully functional within the repository architecture for developers working on Phase 3.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

**Developed for the Cambodia Digital Education Society (CDES)**  
*Empowering Cambodian students with transparent, verifiable educational intelligence.*
