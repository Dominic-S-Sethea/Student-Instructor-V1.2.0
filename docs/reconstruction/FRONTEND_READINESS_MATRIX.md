# CDES Student Instructor V1.2.0 — Frontend Readiness Matrix

> Current reference after the 5-Phase Educational UI/UX Redesign. Documents theme & navigation architecture, session bootstrap, bilingual behavior, admin-only gating, and per-journey state coverage.

---

## 1. Visual System, Navigation & Security Mechanics

- **Study Theme System**: `src/context/ThemeContext.tsx` provides **Calm Academic Light** (default `#F8FAFC` / `#FFFFFF`) and **Dark Study Mode** (`#0F172A` / `#1E293B`), persisted under `cdes_study_theme` in `localStorage` and toggled via `#theme-toggle-btn` in the top navigation bar (`src/index.css` `@custom-variant dark`).
- **Typography**: `index.html` loads `Plus Jakarta Sans` and `Kantumruy Pro` with clean system fallbacks; `src/context/LanguageContext.tsx` syncs `document.documentElement.lang` (`en` / `km`) so Khmer prose uses `line-height: 1.7`.
- **Clean 5-Tab Student Navigation**: `src/components/Navbar.tsx` composes `TopNav.tsx` (Home, Scholarships, Universities, Study Advisor, My Profile + compact Explore dropdown) and sticky `MobileBottomNav.tsx` (`lg:hidden`, `>= 44px` tap targets).
- **Admin-Only Internal Views**: `ResearchLaboratoryView` (`research-lab`), `PlatformArchitectureView` (`platform-architecture`), `EducationDataPlatformView` (`data-strategy`), and `<AnalyticsTelemetryDrawer />` are completely hidden from guests, students, and organizations and rendered in `src/App.tsx` **only when `user?.role === 'admin'`**.
- **Session & CSRF**: `src/context/AuthContext.tsx` and `src/services/apiClient.ts` use HttpOnly `cdes_jwt` / `cdes_csrf_secret` cookies with in-memory `X-CSRF-Token` rotation/retry and key-based account isolation (`user?.id ?? 'guest'`).

---

## 2. Pilot Journeys & UI State Matrix

| Journey & Screen | Role / Guest Access | Loading / Empty / Error / Forbidden / Persisted States | Bilingual (EN/KM) Coverage | Data Backing |
| --- | --- | --- | --- | --- |
| **Student Home** (`StudentDashboard`) | **Public / Guest** or **Authenticated** | **3 Goal Cards**: Scholarships (live count), 2-Min Major Fit Quiz, and 3-step Profile Readiness checklist.<br>**Upcoming Deadlines Strip**: live SQLite `/api/scholarships` deadlines with skeleton loader and Retry error banner; zero hardcoded mock name/metrics. | Bilingual welcome greeting, goal cards, Study Advisor bar, and deadline pills (`en` / `km`). | SQLite `/api/scholarships` + `useAuth()` + local saved bookmark count. |
| **Scholarship Directory & Top 100 Universities** (`ScholarshipIntelligenceView`, `TopUniversityDirectory`, `ScholarshipDirectoryCard`, modals) | **Public / Guest** browse, search, filter, open dossiers; **Org/Admin** submit/review | **Dual Switcher Preserved**: retains both `Top Global University Fellowships & Aid` (`TopUniversityDirectory` structure intact) and `National & Bilateral Flagship Scholarships` with full Light/Dark Study Mode polish.<br>**Error/Empty**: visible retry banner on `/api/scholarships` failure; tri-state `'Not specified'` / `'Not included'` / `'Expired'` badges. | Full EN/KM switch (`nameKm`, `providerKm`, `countryKm`, `'មិនបានបញ្ជាក់'`); `Official Source Verified` label (no `'100% Verified'`). | SQLite `/api/scholarships` + static curated `allTopUniversityPrograms`; saved IDs in `csip_saved_scholarships`. |
| **Private Education Profile & Privacy Center** (`AuthModal`, `StudentProfileView`, `StudentEducationAndPrivacyPanel`) | **Guest** sees sign-in benefit card; **Student / Org / Admin** manage private account | **Guest**: clean onboarding prompt to sign in/register.<br>**Authenticated**: account initials header, Edit Private Profile form, visual Education History list, saved scholarships list, and plain-language Teen Privacy & Safety Center (analytics & research default OFF, guardian email, one-tap withdrawal). | EN & KM headings, labels, and plain-language consent explanation. | SQLite `student_profiles`, `education_history`, `student_privacy_consents`, `cdes_data_governance_consents`. |
| **2-Minute Major Fit Quiz & Live Universities** (`DecisionEngineView`, `DecisionResultDossierView`, `UniversityIntelligenceView`, `mergeUniversities.ts`) | **Public / Guest** or **Authenticated** | **Quiz**: visual 5-step card-tap UX with inline error banner + `Try Again` on API error; salary/ROI labeled with `Planning Estimate` notes.<br>**Universities**: `App.tsx` merges live `/api/universities` records onto rich UI campus profiles via `mergeLiveUniversities`, surfacing retry banner on sync failure and honest accreditation (`'Not specified'` when unknown). | Bilingual quiz headings and Khmer university names. | `/api/decision/evaluate` + `/api/universities` merged with `topCambodianUniversities`. |
| **Study Advisor** (`AIAdvisor`) | **Public / Guest** or **Authenticated** | Defaults to clean **Study Chat** tab (personalizing greeting from `useAuth()`), 4 starter chips, explicit `Live AI Mode` / `Offline Guidance Mode` indicator, and an optional `Advanced Tools` toggle for legacy OS/knowledge/memory panels. | Supports English and Khmer chat prompts & responses. | `/api/advisor/chat` (rule engine + catalog lookup; `GEMINI_API_KEY` optional). |

---

## 3. Browser-Local vs. Backend-Persisted State Summary

- **HttpOnly Server Cookie**: `cdes_jwt`, `cdes_csrf_secret`
- **In-Memory JS Only**: `X-CSRF-Token`, `AuthContext` session state, current `AIAdvisor` session dialogue
- **Browser `localStorage` (Non-sensitive UI Preferences Only)**: `cdes_study_theme` (`light` / `dark`), `csip_saved_scholarships`, `preferred_language`
