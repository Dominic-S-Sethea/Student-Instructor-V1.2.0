# CDES Student Instructor V1.2.0 — Frontend Readiness Matrix

> Current reference after Audit Phases 4–6 & Engineering Expansion W1–W6. Verified live via Playwright + headless Google Chrome (`13/13` checks passing, `0` console errors, `0` page errors).

---

## 1. Visual System, Navigation & Security Mechanics

- **Study Theme System**: `src/context/ThemeContext.tsx` provides **Calm Academic Light** (default `#F8FAFC` / `#FFFFFF`) and **Dark Study Mode** (`#0F172A` / `#1E293B`), persisted under `cdes_study_theme` in `localStorage`, pre-applied before first paint via inline script in `index.html`, and toggled via `#theme-toggle-btn` in the top navigation bar.
- **Typography & Bilingual (EN/KM)**: `index.html` loads `Plus Jakarta Sans` and `Kantumruy Pro` (plus SVG favicon); `src/context/LanguageContext.tsx` syncs `document.documentElement.lang` (`en` / `km`) and provides full EN/KM coverage across all views including university compare matrix and ROI modal.
- **Clean 5-Tab Student Navigation + Persisted Notification Bell**: `src/components/Navbar.tsx` composes `TopNav.tsx` (<= 400 lines), `TopNavMobileDrawer.tsx`, `NotificationBellMenu.tsx` (persisted SQLite notifications with mark-read / mark-all-read), and sticky `MobileBottomNav.tsx`.
- **Admin-Only Internal Views**: `ResearchLaboratoryView` (`research-lab`), `PlatformArchitectureView` (`platform-architecture`), `EducationDataPlatformView` (`data-strategy`), and `<AnalyticsTelemetryDrawer />` are rendered in `src/components/AppTabRouter.tsx` / `src/App.tsx` **only when `user?.role === 'admin'`**.
- **Session, CSRF & URL Safety**: `src/context/AuthContext.tsx` and `src/services/apiClient.ts` use HttpOnly `cdes_jwt` / `cdes_csrf_secret` cookies with in-memory `X-CSRF-Token` rotation/retry, zero raw `fetch('/api/...')` in `src/components/`, global `ErrorBoundary`, `useModalAccessibility` (ESC + focus handling), `rel="noopener noreferrer"` on all external links, and `getSafeHttpUrl()` blocking `javascript:`/`data:`/`vbscript:` schemes.

---

## 2. Pilot Journeys & UI State Matrix

| Journey & Screen | Role / Guest Access | Loading / Empty / Error / Forbidden / Persisted States | Bilingual (EN/KM) Coverage | Data Backing |
| --- | --- | --- | --- | --- |
| **Student Home** (`StudentDashboard`) | **Public / Guest** or **Authenticated** | **3 Goal Cards**: Scholarships (live count), 2-Min Major Fit Quiz, and 3-step Profile Readiness checklist.<br>**Upcoming Deadlines Strip**: live SQLite `/api/scholarships` deadlines with skeleton loader and Retry error banner; zero hardcoded mock name/metrics. | Bilingual welcome greeting, goal cards, Study Advisor bar, and deadline pills (`en` / `km`). | SQLite `/api/scholarships` + `useAuth()` + `useSavedScholarships()`. |
| **Scholarship Directory, Saved Tracker & Top 100 Universities** (`ScholarshipIntelligenceView`, `ScholarshipSavedDrawer`, `TopUniversityDirectory`) | **Public / Guest** browse, filter, local bookmark; **Authenticated** server-synced bookmarks + application checklist + notes; **Org/Admin** submit/review | **Synced Tracker (`useSavedScholarships`)**: Guest bookmarks (`csip_saved_scholarships`) automatically bulk-sync to SQLite `/api/scholarships/saved/sync` on login; supports application stage (`saved` / `preparing` / `submitted` / `awarded`), per-item checklist, personal notes, and Markdown `.md` export.<br>**Dual Switcher & Accuracy**: preserves both Top Global University Fellowships & National/Bilateral Flagship Scholarships with tri-state `'Not specified'` / `'Not included'` / `'Expired'` badges. | Full EN/KM switch (`nameKm`, `providerKm`, `countryKm`, `'មិនបានបញ្ជាក់'`); `Official Source Verified` label. | SQLite `/api/scholarships` & `/api/scholarships/saved*` (migration `011`) + guest `localStorage` fallback. |
| **Private Education Profile, Notifications & Privacy Center** (`AuthModal`, `StudentProfileView`, `StudentEducationAndPrivacyPanel`, `NotificationBellMenu`) | **Guest** sees sign-in benefit card; **Student / Org / Admin** manage private account | **Authenticated**: account initials header, Edit Private Profile form, Education History CRUD, synced saved scholarships list, persisted `NotificationBellMenu` (welcome + application reminders), and plain-language Teen Privacy & Safety Center (analytics & research default OFF, guardian email, one-tap withdrawal, and right-to-erasure backend support). | EN & KM headings, labels, notifications, and plain-language consent explanation. | SQLite `student_profiles`, `education_history`, `user_notifications`, `student_privacy_consents`, `cdes_data_governance_consents`. |
| **2-Minute Major Fit Quiz & Live Universities** (`DecisionEngineView`, `DecisionResultDossierView`, `UniversityIntelligenceView`, `UniversityCatalogCard`, `UniversityQuickStrip`) | **Public / Guest** or **Authenticated** | **Quiz**: visual 5-step card-tap UX honoring `workStyle` & `careerGoal` with inline error banner + `Try Again`; salary/ROI labeled `Planning Estimate`.<br>**Universities**: `App.tsx` merges live `/api/universities` onto rich campus profiles via `mergeLiveUniversities`, with retry banner and honest accreditation (`'Not specified'` when unknown). | Bilingual quiz headings, compare matrix, ROI modal, and Khmer university names. | `/api/decision/evaluate` + `/api/universities` merged with `topCambodianUniversities`. |
| **Study Advisor & Hermes Growth Memory** (`AIAdvisor`, `AdvisorSubTabs`, `GrowthMemoryPanel`) | **Public / Guest** or **Authenticated** | Defaults to clean **Study Chat** tab, 4 starter chips, explicit `Live AI Mode` / `Offline Guidance Mode` indicator, and optional `Advanced Tools` toggle (Growth Memory facts panel + OS/knowledge views). | Supports English and Khmer chat prompts & responses. | `/api/advisor/chat` + `/api/memory/*` (Gemini MCP optional; deterministic offline fallback). |

---

## 3. Browser-Local vs. Backend-Persisted State Summary

- **HttpOnly Server Cookie**: `cdes_jwt` (with JTI revocation on logout), `cdes_csrf_secret`
- **In-Memory JS Only**: `X-CSRF-Token`, `AuthContext` session state, current `AIAdvisor` session dialogue
- **Server-Persisted SQLite (Authenticated)**: profiles, education history, saved scholarships + checklists + stages (`user_saved_scholarships`), notifications (`user_notifications`), privacy consents, and consent-gated Hermes memory facts
- **Browser `localStorage` (Non-sensitive UI / Guest Preferences Only)**: `cdes_study_theme` (`light` / `dark`), `csip_saved_scholarships` (guest fallback, synced & cleared on login), `preferred_language`

