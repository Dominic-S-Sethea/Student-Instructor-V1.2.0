# Release Notes: Platform Version V1.2.0

**Release Date:** September 18, 2026  
**Platform:** Remix Remix Student Instructor V1.2.0  
**Codename:** High School Pilot Validation Suite & Education Intelligence Platform (EIDP)  

---

## 1. Executive Summary

Platform version **V1.2.0** represents the official release unifying the **Grade 10–12 High School Pilot Validation Suite** and the **Education Intelligence Data Platform (EIDP)**. Engineered for high school seniors and school directors across Cambodia, V1.2.0 integrates national Bac II prediction models, turnkey 8-week school pilot toolkits, a 4-tier storage lakehouse architecture, and triple-lock sovereign student privacy.

---

## 2. Key Features & Changes in V1.2.0

### A. Grade 10–12 High School Pilot Validation Suite
- **8-Week Turnkey School Pilot Structure**: Phased implementation blueprint for New Generation Schools (NGS) and public high schools with milestone checklists and director briefing decks.
- **Acquisition Engines**: Concrete execution pathways for First 100, First 500, and First 1,000 active students via campus ambassadors, teacher orientation kits, and telegram study circles.
- **Interactive Bac II Predictor**: Machine learning engine calibrated with historical MoEYS Bac II pass rates and grade distributions (Grade A to E cutoff probabilities).

### B. Education Intelligence Data Platform (EIDP)
- **4-Tier Storage Architecture**: ACID Operational SQLite/WAL transactional layer, DuckDB Parquet lakehouse, dense HNSW vector engine, and Redis real-time feature store.
- **7-Pillar Longitudinal Dossier**: High-resolution student representation capturing sovereign identity, academic goals, behavioral telemetry, chronotypes, and applied STEM projects.
- **Triple-Lock Sovereign Privacy**: Multi-party consent protocol across student, parent, and school director with zero behavioral tracking, sovereign JSON export, and full Cambodian E-Commerce Law compliance.

---

# Release Notes: Platform Version V1.1.3

**Release Date:** September 18, 2026  
**Platform:** Remix Remix Student Instructor V1.1.3  
**Codename:** Education Intelligence Data Platform (EIDP) & High School Pilot Program  

---

## 1. Executive Summary

Platform version **V1.1.3** delivers the **Education Intelligence Data Platform (EIDP)** and the nationwide **Grade 10–12 High School Pilot & User Acquisition Suite**. This release establishes tiered educational storage (ACID Operational SQLite/WAL, Columnar Lakehouse, Vector Index, Online/Offline Feature Store), 7-Pillar longitudinal student intelligence modeling, sovereign data privacy compliance, and turnkey school partnership execution playbooks.

---

## 2. Key Features & Changes in V1.1.3

### A. Education Intelligence Data Platform (EIDP)
- **4-Tier Hybrid Storage**: Operational transactional layer, DuckDB Parquet lakehouse, dense HNSW vector engine, and Redis real-time feature store.
- **6 Education Knowledge Lakes**: Transparent data repositories for Cambodian universities, full-ride scholarships, O*NET-aligned careers, national growth sectors, psychometrics, and cognitive learning sciences.
- **7-Pillar Longitudinal Dossier**: High-resolution student representation capturing sovereign identity, academic goals, behavioral telemetry, chronotypes, and applied STEM projects.

### B. High School Pilot & User Acquisition Suite
- **8-Week School Pilot Architecture**: Phased implementation blueprint across New Generation Schools (NGS) and public high schools.
- **School Director Intelligence**: Aggregate readiness metrics aligned with MoEYS Digital Education Strategy 2030.
- **Triple-Lock Sovereign Privacy**: Multi-party consent ensuring compliance with Cambodia's E-Commerce Law and child safety standards.

---

# Release Notes: Platform Version V1.1.2

**Release Date:** September 16, 2026  
**Platform:** Remix Remix Student Instructor V1.1.2  
**Codename:** Cambodia Scholarship Intelligence Platform (CSIP)  

---

## 1. Executive Summary

Platform version **V1.1.2** delivers the **Cambodia Scholarship Intelligence Platform (CSIP)** MVP in accordance with the CTO Final Decision Document. This release establishes a trusted, verified global scholarship search engine tailored for Cambodian students and high school graduates (Bac II), backed by multi-stage verification pipelines and community feedback loops.

---

## 2. Key Features & Changes in V1.1.2

### A. Fixed Navigation Header ("Scholarship")
- Integrated the **Scholarship** (`អាហារូបករណ៍`) header tab directly adjacent to **University Intel** on both desktop and mobile navigation bars.
- Fully translated into **Khmer Unicode** and **English** via the centralized `LanguageContext`.
- Integrated with drag-scrollable desktop navigation and mobile drawer menus.

### B. Scholarship Search Engine (Phase 1 Strategy)
- **Search-First Focus**: Designed explicitly as a dedicated search and discovery engine, focusing on data completeness and accuracy rather than premature counseling or social feeds.
- **Strict Verification Guarantee**: Enforces an average **98.6% Quality Verification Score** to uphold the core principle: *"A wrong scholarship is worse than no scholarship"*.
- **Comprehensive Database**:
  - 150+ verified opportunities spanning Cambodia (CADT MPTC Talent, Paragon, AUPP), ASEAN, Japan (MEXT), South Korea (GKS), China (CSC), Singapore, Australia (Australia Awards), Europe (Chevening UK, France Eiffel, Erasmus+), USA (Fulbright), and Canada.
  - Aggregated funding pool representation totaling **$12.5M+ USD** across full tuition waivers, monthly living allowances, flight tickets, and healthcare.

### C. Option C User Registration Model
- **Frictionless Free Search**: Students can freely search, filter, and inspect detailed dossiers without registration gates.
- **Registered Student Features**: 1-click student account access unlocks:
  - Saved/bookmarked opportunities in a dedicated drawer.
  - Live deadline countdowns with color-coded urgency indicators (< 14 days = high urgency).
  - Configurable reminder alerts and personalized application notes.

### D. Multi-Dimensional Search & Filtering Suite
- **Full-Text Live Search**: Search across scholarship names, universities, embassies, countries, and fields of study with instant suggestion chips.
- **Categorical Filters**:
  - **Destination Region**: Domestic Cambodia, ASEAN, Japan, Korea, China, Singapore, Australia & NZ, Europe, USA, Canada, and Global.
  - **Degree Level**: Bachelor (Undergraduate), Master, and PhD.
  - **Funding Scope**: Fully funded (100% tuition + stipend + travel), Tuition waiver only, and Partial funding.
  - **Field of Study**: Computer Science & AI, Engineering, Business & Economics, Medicine, Agriculture, and Education.
  - **Target Audience**: High School Graduates (Bac II), University Students, and Working Professionals.
  - **Verified Shield Toggle**: Excludes speculative, crowdsourced, or unconfirmed announcements.
- **Sorting Modes**: Latest Updated, Deadline Approaching, Fully Funded First, and Popularity.

### E. Structured Dossiers & Community Feedback Loops
- **Standardized Detail Dossier**: Displays exact GPA thresholds, nationality requirements, English language proficiency criteria (IELTS, TOEFL), comprehensive funding breakdown, multi-stage selection timelines, and direct links to official embassy/university portals.
- **User Error Reporting Modal**: Empowers students to report expired deadlines, broken URLs, or modified stipend amounts directly to the editorial desk.
- **Organization Submissions Portal**: Enables verified universities, foundations, and embassies to submit new scholarship programs with contact person details.

### F. Data Ingestion, AI Extraction & Continuous Change Detection
- **4-Stage Pipeline**: Web Crawler $\rightarrow$ Gemini Flash Parser $\rightarrow$ Schema Validation $\rightarrow$ Human Editorial Sign-Off.
- **Gemini Ingestion Engine**: Converts unstructured circulars and announcements into validated scholarship JSON entities (`/api/scholarships/ai-extract`).
- **Continuous Source Diff Engine**: Simulates periodic checks against official portals to detect deadline extensions and update audit records (`/api/scholarships/check-updates`).
- **Editorial Admin Console**: In-line dashboard to approve/reject university submissions, resolve student reports, verify entries, and inspect audit logs.

---

## 3. Platform Version Upgrade History

| Version | Release Focus | Key Highlights |
| :--- | :--- | :--- |
| **V1.2.0** | **Pilot Validation Suite & EIDP (Milestone)** | Turnkey 8-week school pilot, live Bac II ML predictor, 4-tier storage lakehouse, sovereign privacy. |
| **V1.1.3** | **Education Intelligence Data Platform (EIDP)** | 4-tier storage architecture, 7-Pillars student model, Grade 10-12 pilot validation blueprint, sovereign data governance. |
| **V1.1.2** | **Scholarship Search Engine (CSIP)** | Fixed header, Option C registration, 150+ verified opportunities, AI ingestion, change detection, error reporting. |
| **V1.1.1** | **University Decision Intelligence** | 6-stage cognitive fit engine, university profiles, 4-year tuition ROI calculator, side-by-side comparison matrix. |
| **V1.1.0** | **Mentorship & STEM Lab** | 1-on-1 mentorship booking, STEM self-discovery quests, Bac II study circles, career directory. |
