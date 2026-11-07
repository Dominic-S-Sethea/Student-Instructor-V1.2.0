import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { getDatabase } from './connection';
import { initialScholarships } from '../../src/data/scholarshipData';
import { topCambodianUniversities } from '../../src/data/universityIntelligenceData';
import { initialStudentProfile } from '../../src/data/mockData';
import {
  initialSubjects,
  initialCategories,
  initialLearningContent,
  initialLabExperiments,
  initialLearningActivities,
  initialLearningPaths,
  initialLearningPathSteps,
} from '../data/learningWorldSeed';
import { initialKnowledgeDocuments } from '../data/knowledgeBaseSeed';
import { embeddingService } from '../services/embeddingService';
import {
  initialCommunities,
  initialCommunityPosts,
  initialCommunityComments,
  initialMentors,
  initialStudentProjects,
  initialCampusEvents,
  initialPartnerOrgs,
} from '../data/communitySeed';
import {
  initialResearchExperiments,
  initialTeachingMethodBenchmarks,
  initialStudentMasteryStates,
  initialMisconceptionLogs,
  initialTeacherClassAnalytics,
  initialEducationKnowledgeAggregates,
} from '../data/researchSeed';
import {
  initialUniversitiesLake,
  initialScholarshipsLake,
  initialCareersLake,
  initialIndustriesLake,
  initialPsychometricsLake,
  initialLearningScienceLake,
  initialMLModelsRegistry,
} from '../data/dataPlatformSeed';

function safeVal<T>(val: T | undefined | null, fallback: any = null): any {
  return val === undefined ? fallback : val;
}

export function runMigrations(): { success: boolean; message: string } {
  const db = getDatabase();

  // 1. Execute schema DDL
  const schemaPath = path.join(process.cwd(), 'server', 'db', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at ${schemaPath}`);
  }

  // Upgrade existing analytics tables if created in prior revisions before indexes are applied
  ensureAnalyticsColumns(db);

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);

  // 2. Run idempotent seeding for any empty tables
  seedInitialData(db);

  return { success: true, message: 'Database schema and seed migration completed successfully.' };
}

function ensureAnalyticsColumns(db: ReturnType<typeof getDatabase>): void {
  // Check and add missing columns dynamically
  const checkAndAdd = (table: string, col: string, colDef: string) => {
    try {
      const cols = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
      if (cols && !cols.some(c => c.name === col)) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${colDef}`);
      }
    } catch {
      // ignore
    }
  };

  checkAndAdd('activity_events', 'student_id', 'TEXT');
  checkAndAdd('activity_events', 'duration', 'INTEGER DEFAULT 0');

  checkAndAdd('learning_events', 'student_id', 'TEXT');
  checkAndAdd('learning_events', 'score', 'REAL');
  checkAndAdd('learning_events', 'time_spent', 'INTEGER DEFAULT 0');
  checkAndAdd('learning_events', 'difficulty', "TEXT DEFAULT 'intermediate'");

  checkAndAdd('game_events', 'student_id', 'TEXT');
  checkAndAdd('game_events', 'level', 'INTEGER DEFAULT 1');
  checkAndAdd('game_events', 'attempt', 'INTEGER DEFAULT 1');
  checkAndAdd('game_events', 'success', 'INTEGER DEFAULT 0');
  checkAndAdd('game_events', 'failure_reason', 'TEXT');
  checkAndAdd('game_events', 'time_taken', 'INTEGER DEFAULT 0');

  // Ensure subjects table has all required columns across Phase 2 and Phase 5 Digital Learning World
  checkAndAdd('subjects', 'name', "TEXT DEFAULT ''");
  checkAndAdd('subjects', 'description', 'TEXT');
  checkAndAdd('subjects', 'icon_key', "TEXT DEFAULT 'book-open'");
  checkAndAdd('subjects', 'color', "TEXT DEFAULT '#2563EB'");
  checkAndAdd('subjects', 'order_index', 'INTEGER DEFAULT 1');
  checkAndAdd('subjects', 'name_en', 'TEXT');
  checkAndAdd('subjects', 'domain', 'TEXT');
  checkAndAdd('subjects', 'color_hex', "TEXT DEFAULT '#2563EB'");
  checkAndAdd('subjects', 'created_at', 'TEXT');

  // --- Soft-delete columns for F-002 remediation ---
  // users table
  checkAndAdd('users', 'is_deleted', 'INTEGER NOT NULL DEFAULT 0');
  checkAndAdd('users', 'deleted_at', 'TEXT');
  checkAndAdd('users', 'deleted_by', 'TEXT');
  // student_profiles table
  checkAndAdd('student_profiles', 'is_deleted', 'INTEGER NOT NULL DEFAULT 0');
  checkAndAdd('student_profiles', 'deleted_at', 'TEXT');
  checkAndAdd('student_profiles', 'deleted_by', 'TEXT');
  // scholarships table
  checkAndAdd('scholarships', 'is_deleted', 'INTEGER NOT NULL DEFAULT 0');
  checkAndAdd('scholarships', 'deleted_at', 'TEXT');
  checkAndAdd('scholarships', 'deleted_by', 'TEXT');
  // scholarship_requirements table
  checkAndAdd('scholarship_requirements', 'is_deleted', 'INTEGER NOT NULL DEFAULT 0');
  checkAndAdd('scholarship_requirements', 'deleted_at', 'TEXT');
  checkAndAdd('scholarship_requirements', 'deleted_by', 'TEXT');
  // scholarship_funding table
  checkAndAdd('scholarship_funding', 'is_deleted', 'INTEGER NOT NULL DEFAULT 0');
  checkAndAdd('scholarship_funding', 'deleted_at', 'TEXT');
  checkAndAdd('scholarship_funding', 'deleted_by', 'TEXT');

  try {
    db.exec(`
      UPDATE subjects
      SET
        name = CASE WHEN name IS NULL OR name = '' THEN COALESCE(name_en, slug) ELSE name END,
        color = CASE WHEN color IS NULL OR color = '' THEN COALESCE(color_hex, '#2563EB') ELSE color END,
        icon_key = CASE WHEN icon_key IS NULL OR icon_key = '' THEN 'book-open' ELSE icon_key END,
        order_index = CASE WHEN order_index IS NULL THEN 1 ELSE order_index END
      WHERE name IS NULL OR name = '' OR color IS NULL OR color = '' OR icon_key IS NULL OR icon_key = '' OR order_index IS NULL;
    `);
  } catch {
    // ignore
  }

  // Ensure AI Knowledge, Vector Embedding, Memory, and Recommendation tables exist
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS knowledge_documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        content TEXT NOT NULL,
        source TEXT,
        embedding_reference TEXT,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS knowledge_embeddings (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
        vector TEXT NOT NULL,
        metadata TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS student_ai_memory (
        student_id TEXT PRIMARY KEY,
        learning_summary TEXT NOT NULL DEFAULT '',
        interest_summary TEXT NOT NULL DEFAULT '',
        career_summary TEXT NOT NULL DEFAULT '',
        behavior_summary TEXT NOT NULL DEFAULT '',
        conversation_summary TEXT NOT NULL DEFAULT '',
        last_interaction_at TEXT,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS ai_recommendation_events (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('learning', 'career', 'scholarship')),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        match_reason TEXT NOT NULL,
        target_entity_id TEXT,
        priority_score REAL NOT NULL DEFAULT 85.0,
        status TEXT NOT NULL DEFAULT 'given' CHECK (status IN ('given', 'clicked', 'completed', 'dismissed')),
        feedback_rating INTEGER,
        feedback_comments TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  } catch {
    // ignore
  }
}

function seedInitialData(db: ReturnType<typeof getDatabase>): void {
  const now = new Date().toISOString();

  // SEC-001: seed credentials externalised to environment variables (no in-code secrets).
  if (!process.env.ADMIN_SEED_PASSWORD || !process.env.STUDENT_SEED_PASSWORD || !process.env.ORG_SEED_PASSWORD) {
    console.warn("SEC-001: seed credentials not set via env (ADMIN_SEED_PASSWORD / STUDENT_SEED_PASSWORD / ORG_SEED_PASSWORD).");
  }

  // ----------------------------------------------------
  // Seed Users
  // ----------------------------------------------------
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (userCount === 0) {
    const adminPasswordHash = bcrypt.hashSync(process.env.ADMIN_SEED_PASSWORD ?? '');
    const studentPasswordHash = bcrypt.hashSync(process.env.STUDENT_SEED_PASSWORD ?? '');
    const orgPasswordHash = bcrypt.hashSync(process.env.ORG_SEED_PASSWORD ?? '');

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. System Administrator
    const adminId = 'usr-admin-01';
    insertUser.run(adminId, 'admin@cdes.edu.kh', adminPasswordHash, 'admin', 'active', now, now);

    // 2. Demo Student Account
    const studentUserId = 'usr-student-01';
    insertUser.run(studentUserId, 'student@cdes.edu.kh', studentPasswordHash, 'student', 'active', now, now);

    // 3. Organization Partner Account
    const orgUserId = 'usr-org-paragon-01';
    insertUser.run(orgUserId, 'admissions@paragoniu.edu.kh', orgPasswordHash, 'organization', 'active', now, now);

    // Seed Student Profile & Education History
    const studentProfileId = initialStudentProfile.id || 'stu-sreypov-01';
    const insertProfile = db.prepare(`
      INSERT INTO student_profiles (
        id, user_id, name, date_of_birth, education_level, school, university, major,
        graduation_year, language, location, target_career, interests, favorite_subjects, goals, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProfile.run(
      studentProfileId,
      studentUserId,
      initialStudentProfile.name,
      '2008-04-15',
      initialStudentProfile.educationLevel,
      initialStudentProfile.school,
      'Cambodia Academy of Digital Technology (CADT)',
      initialStudentProfile.targetMajor,
      2026,
      'km',
      initialStudentProfile.location,
      initialStudentProfile.targetCareer,
      JSON.stringify(initialStudentProfile.interests || []),
      JSON.stringify(initialStudentProfile.favoriteSubjects || []),
      initialStudentProfile.goals,
      now,
      now
    );

    const insertEduHistory = db.prepare(`
      INSERT INTO education_history (id, student_id, institution, degree, start_date, end_date, achievements)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertEduHistory.run(
      'edu-01',
      studentProfileId,
      initialStudentProfile.school || 'Preah Sisowath High School',
      'High School Bac II Science Track',
      '2023-10-01',
      '2026-08-30',
      'Top 5% in National Mathematics Olympiad Mock; English Club President'
    );
  }

  // ----------------------------------------------------
  // Seed Scholarships (Migrate from existing scholarshipData.ts)
  // ----------------------------------------------------
  const schCount = (db.prepare('SELECT COUNT(*) as count FROM scholarships').get() as { count: number }).count;
  if (schCount === 0) {
    const insertScholarship = db.prepare(`
      INSERT INTO scholarships (
        id, legacy_code, name, name_km, provider, provider_km, country, country_km, region,
        degree_levels, field_of_study, funding_type, funding_details, funding_details_km,
        eligibility_summary, eligibility_summary_km, overview, overview_km, target_demographic,
        application_link, official_source_url, deadline, is_deadline_rolling, is_verified,
        verification_tier, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertReqs = db.prepare(`
      INSERT INTO scholarship_requirements (
        id, scholarship_id, gpa_minimum, ielts_minimum, toefl_minimum, age_limit, nationalities,
        work_experience_years, required_documents, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertFunding = db.prepare(`
      INSERT INTO scholarship_funding (
        id, scholarship_id, covers_tuition, tuition_coverage_percentage, monthly_stipend_usd,
        covers_flights, covers_visa, covers_health_insurance, funding_currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of initialScholarships) {
      const isFull = s.fundingType.toLowerCase().includes('full');
      const gpaReq = typeof s.minGpa === 'number' ? s.minGpa : null;
      const ageLimit = typeof s.maxAge === 'number' ? s.maxAge : null;
      const workExp = typeof s.workExpYears === 'number' ? s.workExpYears : (s.id.includes('chevening') ? 2 : 0);

      let englishMin: number | null = null;
      if (s.englishRequirement?.minScore) {
        const match = s.englishRequirement.minScore.match(/IELTS\s*([0-9]+(?:\.[0-9]+)?)/i)
          || s.englishRequirement.minScore.match(/^([0-9]+(?:\.[0-9]+)?)/);
        if (match) {
          englishMin = parseFloat(match[1]) || null;
        }
      }

      const tagsList = Array.from(new Set([
        ...(s.fieldOfStudy || []),
        s.region,
        s.country,
        s.fundingType,
        ...(s.eligibleStudentCategories || [])
      ]));

      insertScholarship.run(
        safeVal(s.id),
        safeVal(s.id),
        safeVal(s.name, ''),
        safeVal(s.nameKm, ''),
        safeVal(s.provider, ''),
        safeVal(s.providerKm, ''),
        safeVal(s.country, ''),
        safeVal(s.countryKm, ''),
        safeVal(s.region, ''),
        JSON.stringify(s.degreeLevel || []),
        JSON.stringify(s.fieldOfStudy || []),
        safeVal(s.fundingType, 'Fully funded'),
        safeVal(s.tuitionCoverage || s.monthlyAllowance, ''),
        safeVal(s.tuitionCoverageKm || s.monthlyAllowanceKm, ''),
        safeVal(s.nationalityRequirement, ''),
        safeVal(s.nationalityRequirementKm, ''),
        safeVal(s.overview, ''),
        safeVal(s.overviewKm, ''),
        JSON.stringify(s.eligibleStudentCategories || []),
        safeVal(s.applicationLink, '#'),
        safeVal(s.officialSourceUrl, '#'),
        safeVal(s.deadline, '2026-12-31'),
        s.deadlineType === 'Rolling' ? 1 : 0,
        s.verifiedBadge ? 1 : 0,
        safeVal(s.verificationStatus, 'official'),
        JSON.stringify(tagsList),
        now,
        now
      );

      // Requirement details
      insertReqs.run(
        `req-${s.id}`,
        s.id,
        gpaReq,
        englishMin,
        80.0,
        ageLimit,
        JSON.stringify(['Cambodian']),
        workExp,
        JSON.stringify(s.requiredDocuments || ['Transcripts', 'CV', 'Motivation Letter', 'Recommendation Letters']),
        safeVal(s.nationalityRequirement, '')
      );

      // Funding details
      insertFunding.run(
        `fnd-${s.id}`,
        s.id,
        1,
        isFull ? 100 : 50,
        isFull ? 1200 : 300,
        isFull ? 1 : 0,
        isFull ? 1 : 0,
        1,
        'USD'
      );
    }
  }

  // ----------------------------------------------------
  // Seed Organization Submissions (Pending queue)
  // ----------------------------------------------------
  const subCount = (db.prepare('SELECT COUNT(*) as count FROM organization_submissions').get() as { count: number }).count;
  if (subCount === 0) {
    const insertSub = db.prepare(`
      INSERT INTO organization_submissions (
        id, organization_name, contact_person, contact_email, official_website, scholarship_name,
        scholarship_name_km, country, region, degree_level, field_of_study, funding_type,
        funding_details, eligibility_summary, deadline, application_link, official_source_url,
        status, submitted_by_user_id, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertSub.run(
      'sub-paragon-2026',
      'Paragon International University',
      'Admissions & International Office',
      'admissions@paragoniu.edu.kh',
      'https://paragoniu.edu.kh',
      'Paragon IU President Excellence Scholarship',
      'អាហារូបករណ៍ឧត្តមភាពប្រធានសាកលវិទ្យាល័យប៉ារ៉ាហ្គន',
      'Cambodia',
      'Cambodia',
      JSON.stringify(['Bachelor']),
      JSON.stringify(['Computer Science', 'Engineering', 'Business']),
      'Fully funded',
      '100% full 4-year tuition fee waiver for top 50 scorers in Paragon National Entrance Exam.',
      'High school graduates with Bac II Grade A/B or foreign high school diploma equivalent.',
      '2026-10-20',
      'https://paragoniu.edu.kh/scholarship-exam/',
      'https://paragoniu.edu.kh/scholarship-exam/',
      'Pending Admin Review',
      'usr-org-paragon-01',
      now
    );

    insertSub.run(
      'sub-rmit-australia',
      'RMIT University (Australia)',
      'Dr. Sarah Jenkins, Global Engagement',
      'international.scholarships@rmit.edu.au',
      'https://www.rmit.edu.au',
      'RMIT Southeast Asia High Achiever Scholarship',
      'អាហារូបករណ៍សិស្សឆ្នើមអាស៊ីអាគ្នេយ៍ RMIT អូស្ត្រាលី',
      'Australia',
      'Australia',
      JSON.stringify(['Bachelor', 'Master']),
      JSON.stringify(['Computer Science', 'Engineering', 'Business', 'Other']),
      'Partial funding',
      'AU$10,000 tuition fee contribution per year for the standard duration of the program.',
      'Citizen of Cambodia or other ASEAN country applying for Bachelor or Master by coursework.',
      '2026-11-30',
      'https://www.rmit.edu.au/study-with-us/international-students',
      'https://www.rmit.edu.au/',
      'Pending Admin Review',
      null,
      now
    );
  }

  // ----------------------------------------------------
  // Seed User Error Reports
  // ----------------------------------------------------
  const reportCount = (db.prepare('SELECT COUNT(*) as count FROM user_error_reports').get() as { count: number }).count;
  if (reportCount === 0) {
    const insertReport = db.prepare(`
      INSERT INTO user_error_reports (
        id, scholarship_id, scholarship_name, reported_field, description, suggested_correction,
        official_source_url, reporter_email, status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertReport.run(
      'rep-1',
      'sch-chevening-uk',
      'Chevening UK Government Scholarships',
      'deadline',
      'The Chevening Cambodia office noted that reference letters are due slightly later than the initial form submission date.',
      'Application closes Nov 4; references due mid-February.',
      'https://www.chevening.org/scholarship/cambodia/',
      'sokha.student@gmail.com',
      'Pending Review',
      now
    );
  }

  // ----------------------------------------------------
  // Seed Search Keywords Log
  // ----------------------------------------------------
  const keywordCount = (db.prepare('SELECT COUNT(*) as count FROM search_keywords_log').get() as { count: number }).count;
  if (keywordCount === 0) {
    const insertKeyword = db.prepare(`
      INSERT INTO search_keywords_log (query, count, last_searched)
      VALUES (?, ?, ?)
    `);
    const initialKeywords = [
      { query: 'Chevening', count: 482 },
      { query: 'Computer Science', count: 412 },
      { query: 'Fully Funded Master', count: 398 },
      { query: 'CADT MPTC', count: 345 },
      { query: 'Korea GKS', count: 290 },
      { query: 'Japan MEXT', count: 280 },
      { query: 'IELTS 6.0', count: 220 },
    ];
    for (const k of initialKeywords) {
      insertKeyword.run(k.query, k.count, now);
    }
  }

  // ----------------------------------------------------
  // Seed Universities & Majors (Migrate from existing universityIntelligenceData.ts)
  // ----------------------------------------------------
  const univCount = (db.prepare('SELECT COUNT(*) as count FROM universities').get() as { count: number }).count;
  if (univCount === 0) {
    const insertUniv = db.prepare(`
      INSERT INTO universities (
        id, abbr, name, khmer_name, location, type, founded_year, website, logo, cover_image,
        profile_score_overall, academic_reputation_score, industry_connection_score, facilities_score,
        graduate_outcome_score, annual_tuition_usd, total_degree_cost_usd, accreditation_status,
        verification_confidence, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMajor = db.prepare(`
      INSERT INTO majors (
        id, university_id, slug, name, faculty, degree_type, duration_years, difficulty_rating,
        difficulty_reason, job_market_demand, average_starting_salary, course_structure,
        technical_skills, soft_skills, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const u of topCambodianUniversities) {
      insertUniv.run(
        safeVal(u.id),
        safeVal(u.abbr),
        safeVal(u.name),
        safeVal(u.khmerName, ''),
        safeVal(u.location, 'Phnom Penh'),
        safeVal(u.type, 'Public'),
        safeVal(u.foundedYear, 1990),
        safeVal(u.website, ''),
        safeVal(u.logo, ''),
        safeVal(u.coverImage, ''),
        safeVal(u.profileScore?.overall, 90),
        safeVal(u.profileScore?.academicReputation, 90),
        safeVal(u.profileScore?.industryConnection, 85),
        safeVal(u.profileScore?.facilities, 85),
        safeVal(u.profileScore?.graduateOutcome, 90),
        safeVal(u.annualTuitionUSD, 1500),
        safeVal(u.totalDegreeCostUSD, 6000),
        safeVal(u.accreditation?.status, 'Fully Accredited'),
        'official',
        now,
        now
      );

      if (Array.isArray(u.majors)) {
        for (const m of u.majors) {
          insertMajor.run(
            `${u.id}-${m.id || m.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            u.id,
            m.id || m.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            safeVal(m.name, 'Major Program'),
            safeVal(m.faculty, 'Information & Engineering Sciences'),
            safeVal(m.degreeType, 'Bachelor of Science'),
            safeVal(m.durationYears, 4.0),
            safeVal(m.difficultyRating, 4.0),
            safeVal(m.difficultyReason, 'Rigorous engineering foundation with practical capstone.'),
            safeVal(m.jobMarketDemand, 'High'),
            safeVal(m.averageStartingSalary, '$600 - $1,200/mo'),
            JSON.stringify(m.courseStructure || []),
            JSON.stringify(m.technicalSkillsGained || []),
            JSON.stringify(m.softSkillsGained || []),
            now
          );
        }
      }
    }
  }

  // ----------------------------------------------------
  // Seed Research Experiments (Education Research Platform)
  // ----------------------------------------------------
  const expCount = (db.prepare('SELECT COUNT(*) as count FROM experiments').get() as { count: number }).count;
  if (expCount === 0) {
    const insertExp = db.prepare(`
      INSERT INTO experiments (id, name, hypothesis, start_date, end_date, status, description, metrics, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertExp.run(
      'exp-visual-vs-text',
      'Visual Learning vs Text Learning in Physics & Mechanics',
      'Interactive 3D simulation-based modules improve 14-day concept retention and Bac II mechanics quiz scores by at least 15% compared to traditional static text explanations.',
      '2026-08-01T00:00:00.000Z',
      null,
      'active',
      'Evaluating cognitive load and knowledge retention across two cohorts of Cambodian grade 11 and 12 STEM students studying Newton dynamics.',
      JSON.stringify(['quiz_score', 'retention_rate', 'engagement_time', 'retry_persistence']),
      now
    );

    insertExp.run(
      'exp-adaptive-ladder',
      'Dynamic Adaptive Difficulty vs Fixed Curriculum in Code Logic',
      'Real-time Elo-based algorithmic problem adjustment decreases frustration drop-off by 25% and improves sustained problem-solving persistence.',
      '2026-08-15T00:00:00.000Z',
      null,
      'active',
      'A/B experiment testing whether personalized problem difficulty ladders maintain optimal flow state compared to linear chapter curricula.',
      JSON.stringify(['completion_rate', 'persistence_score', 'session_frequency']),
      now
    );

    // Enroll demo student into experiment cohort Group B
    db.prepare(`
      INSERT OR IGNORE INTO experiment_participants (id, student_id, experiment_id, group_name, assigned_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('part-demo-01', 'usr-student-01', 'exp-visual-vs-text', 'Group B (Interactive Simulation)', now);

    // Seed interim experiment results
    db.prepare(`
      INSERT INTO experiment_results (id, experiment_id, metrics, outcomes, analysis, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'res-exp-01',
      'exp-visual-vs-text',
      JSON.stringify({
        groupA_avgQuiz: 72.4,
        groupB_avgQuiz: 86.7,
        groupA_retention14d: 64.8,
        groupB_retention14d: 83.1,
        sampleSize: 42
      }),
      JSON.stringify({
        pValue: 0.003,
        effectSizeCohenD: 1.18,
        statisticallySignificant: true
      }),
      'Simulation cohort Group B exhibited a statistically significant 14.3 point score increase and 18.3% higher retention.',
      now
    );
  }

  // ----------------------------------------------------
  // Seed Privacy Consents (Child Safety & Minor Protections)
  // ----------------------------------------------------
  const consentCount = (db.prepare('SELECT COUNT(*) as count FROM student_privacy_consents').get() as { count: number }).count;
  if (consentCount === 0) {
    db.prepare(`
      INSERT INTO student_privacy_consents (
        student_id, is_minor, parental_consent_verified, parent_email,
        allow_analytics_tracking, allow_research_inclusion, anonymized_research_id, consent_date, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'usr-student-01',
      1, // minor flag
      1, // parental consent verified
      'parent.sokha@gmail.com',
      1,
      1,
      'anon-std-cdes-89f4b1',
      now,
      now
    );
  }

  // ----------------------------------------------------
  // Seed Initial Learning & Game Events for Behavioral Modeling
  // ----------------------------------------------------
  const learnCount = (db.prepare('SELECT COUNT(*) as count FROM learning_events').get() as { count: number }).count;
  if (learnCount === 0) {
    const insertLearn = db.prepare(`
      INSERT INTO learning_events (id, student_id, user_id, content_id, action, score, time_spent, difficulty, performance, metadata, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertLearn.run('lrn-01', 'usr-student-01', 'usr-student-01', 'cs-algo-sorting', 'lesson_completed', 92, 240, 'intermediate', 'proficient', JSON.stringify({ format: 'simulation' }), now);
    insertLearn.run('lrn-02', 'usr-student-01', 'usr-student-01', 'cs-binary-trees', 'quiz_attempt', 88, 180, 'advanced', 'proficient', JSON.stringify({ format: 'interactive' }), now);
    insertLearn.run('lrn-03', 'usr-student-01', 'usr-student-01', 'math-calculus-derivatives', 'quiz_attempt', 84, 210, 'intermediate', 'proficient', JSON.stringify({ format: 'visual' }), now);
    insertLearn.run('lrn-04', 'usr-student-01', 'usr-student-01', 'math-integral-applications', 'lesson_completed', 78, 300, 'advanced', 'proficient', JSON.stringify({ format: 'interactive' }), now);
    insertLearn.run('lrn-05', 'usr-student-01', 'usr-student-01', 'phys-newton-dynamics', 'experiment_completed', 72, 280, 'intermediate', 'developing', JSON.stringify({ format: 'simulation' }), now);

    const insertGame = db.prepare(`
      INSERT INTO game_events (id, student_id, user_id, game_id, level, attempt, success, failure_reason, time_taken, action, duration, result, score, metadata, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertGame.run('gm-01', 'usr-student-01', 'usr-student-01', 'logic-circuit-builder', 1, 1, 1, null, 120, 'level_completed', 120, 'SUCCESS', 100, JSON.stringify({ subject: 'Computer Science' }), now);
    insertGame.run('gm-02', 'usr-student-01', 'usr-student-01', 'logic-circuit-builder', 2, 1, 0, 'Timing synchronization delay exceeded threshold', 95, 'level_failed', 95, 'FAILED', 40, JSON.stringify({ subject: 'Computer Science' }), now);
    insertGame.run('gm-03', 'usr-student-01', 'usr-student-01', 'logic-circuit-builder', 2, 2, 1, null, 140, 'level_completed', 140, 'SUCCESS', 95, JSON.stringify({ subject: 'Computer Science' }), now);
    insertGame.run('gm-04', 'usr-student-01', 'usr-student-01', 'orbital-physics-sim', 1, 1, 1, null, 160, 'level_completed', 160, 'SUCCESS', 90, JSON.stringify({ subject: 'Physics' }), now);

    const insertAct = db.prepare(`
      INSERT INTO activity_events (id, student_id, user_id, session_id, event_type, timestamp, duration, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAct.run('act-01', 'usr-student-01', 'usr-student-01', 'sess-01', 'login', now, 0, '{}');
    insertAct.run('act-02', 'usr-student-01', 'usr-student-01', 'sess-01', 'search', now, 45, JSON.stringify({ searchQuery: 'Artificial Intelligence Scholarships CADT', category: 'scholarship' }));
    insertAct.run('act-03', 'usr-student-01', 'usr-student-01', 'sess-01', 'bookmark', now, 15, JSON.stringify({ scholarshipId: 'sch-cadt-techo' }));
    insertAct.run('act-04', 'usr-student-01', 'usr-student-01', 'sess-01', 'ai_question', now, 60, JSON.stringify({ query: 'How does math calculus prepare me for machine learning?' }));

    // Seed baseline dynamic intelligence profile
    db.prepare(`
      INSERT OR REPLACE INTO student_intelligence_profile (
        student_id, learning_preferences, subject_strengths, subject_weaknesses,
        interest_patterns, engagement_score, persistence_score, problem_solving_score, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'usr-student-01',
      JSON.stringify({
        primaryStyle: 'interactive',
        pacing: 'deliberate',
        sessionLengthPreferenceMinutes: 18,
        peakLearningHours: 'evening',
        visualPreferenceRatio: 0.42,
        interactivePreferenceRatio: 0.58
      }),
      JSON.stringify([
        { subject: 'Computer Science', score: 90, attemptsCount: 3, masteryLevel: 'Advanced', lastPracticed: now },
        { subject: 'Mathematics', score: 81, attemptsCount: 2, masteryLevel: 'Proficient', lastPracticed: now }
      ]),
      JSON.stringify([
        { subject: 'Physics', score: 72, attemptsCount: 2, masteryLevel: 'Developing', lastPracticed: now }
      ]),
      JSON.stringify(['Software Engineering', 'Artificial Intelligence', 'Calculus & Logic', 'Robotics & STEM']),
      84.0,
      86.5,
      82.0,
      now
    );
  }

  // ----------------------------------------------------
  // Seed Avatar World Items, Locations & Achievements
  // ----------------------------------------------------
  const itemsCount = (db.prepare('SELECT COUNT(*) as count FROM avatar_items').get() as { count: number }).count;
  if (itemsCount === 0) {
    const insertItem = db.prepare(`
      INSERT INTO avatar_items (id, name, category, description, icon_key, default_slot, educational_value, subject_tag, unlock_condition_type, unlock_condition_val, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertItem.run(
      'itm-desk',
      'Smart Study Desk',
      'Furniture',
      'Solid oak ergonomic desk equipped with integrated power channels and notebook slots.',
      'desk',
      'floor',
      'Promotes focused 50-minute deliberate study intervals.',
      'General',
      'free',
      null,
      now
    );

    insertItem.run(
      'itm-chair',
      'Ergonomic Study Chair',
      'Furniture',
      'High-lumbar mesh chair designed for healthy posture during marathon exam prep.',
      'chair',
      'floor',
      'Reduces cognitive fatigue during calculus problem sets.',
      'General',
      'free',
      null,
      now
    );

    insertItem.run(
      'itm-bookshelf',
      'Cambodian STEM Library Shelf',
      'Furniture',
      'Multi-tiered bookshelf stocked with MoEYS Bac II texts, Khmer-English lexicons, and algorithms.',
      'bookshelf',
      'floor',
      'Boosts curiosity breadth and reference speed across mathematics and science.',
      'Computer Science',
      'learning_milestone',
      'Complete 3 STEM lessons',
      now
    );

    insertItem.run(
      'itm-computer',
      'High-Performance Terminal',
      'Learning Object',
      'Dual-display developer station loaded with Linux, Python, and simulation runtimes.',
      'computer',
      'desk',
      'Enables interactive code compilation and algorithm visualization.',
      'Computer Science',
      'free',
      null,
      now
    );

    insertItem.run(
      'itm-microscope',
      'Digital STEM Microscope',
      'Learning Object',
      'High-magnification digital microscope with direct screen output for cellular histology.',
      'microscope',
      'desk',
      'Connects theoretical biology to empirical observable cell structures.',
      'STEM',
      'achievement',
      'ACH_STEM_SIM',
      now
    );

    insertItem.run(
      'itm-chem-kit',
      'Molecular Chemistry Kit',
      'Learning Object',
      'Precision glassware, titrators, and 3D molecular bond modeling sphere set.',
      'chemistry_kit',
      'desk',
      'Reinforces chemical equilibrium and stoichiometry principles.',
      'Chemistry',
      'quiz_score',
      'Score 80%+ on Chemistry diagnostic',
      now
    );

    insertItem.run(
      'itm-telescope',
      'Celestial Refractor Telescope',
      'Learning Object',
      'Multi-coated 90mm refractor for observational astronomy and orbital kinematics.',
      'telescope',
      'floor',
      'Hands-on experimental verification of Kepler and Newton gravitational laws.',
      'Physics',
      'achievement',
      'ACH_PHYSICS_ACE',
      now
    );

    insertItem.run(
      'itm-cert-frame',
      'Gold Bac II Honor Certificate Frame',
      'Achievement',
      'Gilded teak wood display frame for national examination honors and Olympiad medals.',
      'certificate_frame',
      'wall',
      'Visual reinforcement of academic mastery and continuous effort.',
      'MoEYS Bac II',
      'achievement',
      'ACH_BAC2_SCHOLAR',
      now
    );

    insertItem.run(
      'itm-whiteboard',
      'Algorithmic Whiteboard',
      'Furniture',
      'Magnetic glass dry-erase board for system architecture diagrams and proof sketches.',
      'whiteboard',
      'wall',
      'Facilitates spatial problem decomposition and collaborative study.',
      'Mathematics',
      'free',
      null,
      now
    );

    insertItem.run(
      'itm-plant',
      'Bonsai Oxygen Plant',
      'Decoration',
      'Living dwarf ficus bonsai that refreshes study air and provides calming visual balance.',
      'plant',
      'desk',
      'Biophilic workspace enhancement shown to lower exam stress.',
      'General',
      'free',
      null,
      now
    );

    insertItem.run(
      'itm-lamp',
      'Dual-Spectrum Study Lamp',
      'Decoration',
      'Circadian eye-care LED lamp with warm evening and crisp day-focus modes.',
      'lamp',
      'desk',
      'Supports peak night-owl and early-bird study habits without eye strain.',
      'General',
      'free',
      null,
      now
    );

    insertItem.run(
      'itm-poster-solar',
      'Astrophysics Deep Space Chart',
      'Decoration',
      'Detailed wall chart detailing our solar system, gravitational wells, and satellite trajectories.',
      'poster',
      'wall',
      'Visual mnemonic for astrophysics and space engineering pathways.',
      'Physics',
      'free',
      null,
      now
    );

    // World Locations
    const insertLoc = db.prepare(`
      INSERT OR IGNORE INTO world_locations (id, slug, name, name_km, description, icon_key, access_level, is_unlocked, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertLoc.run('loc-room', 'room', 'Student Study Sanctuary', 'បន្ទប់សិក្សាផ្ទាល់ខ្លួន', 'Your private educational sanctuary for deep focus, room customization, and achievement reflection.', 'home', 'student', 1, 1);
    insertLoc.run('loc-hallway', 'hallway', 'Central Academic Hallway', 'សាលកណ្ដាល', 'The central connector linking student dorms, research libraries, laboratories, and career centers.', 'compass', 'student', 1, 2);
    insertLoc.run('loc-library', 'library', 'National Digital Library', 'បណ្ណាល័យឌីជីថលជាតិ', 'Repository of Cambodian MoEYS Bac II exam papers, university research databases, and academic books.', 'book-open', 'student', 1, 3);
    insertLoc.run('loc-lab', 'laboratory', 'STEM Simulation Lab', 'បន្ទប់ពិសោធន៍ STEM', 'Hands-on interactive physics simulations, logic circuit sandboxes, and virtual experiments.', 'flask', 'student', 1, 4);
    insertLoc.run('loc-career', 'career_center', 'Career & University Center', 'មជ្ឈមណ្ឌលការងារ និងសាកលវិទ្យាល័យ', 'Scholarship discovery, senior alumni mentorship bookings, and decision intelligence engine.', 'briefcase', 'student', 1, 5);
    insertLoc.run('loc-community', 'community', 'Student Peer Commons', 'សហគមន៍សិស្សានុសិស្ស', 'Study circles, peer AMA rooms, and collaborative coding meetups across Cambodian high schools.', 'users', 'student', 1, 6);

    // Achievements
    const insertAch = db.prepare(`
      INSERT OR IGNORE INTO achievements (id, code, title, title_km, description, category, badge_icon, item_reward_id, merit_points, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAch.run('ach-01', 'ACH_BAC2_SCHOLAR', 'Bac II STEM Pioneer', 'អ្នកត្រួសត្រាយ STEM បាក់ឌុប', 'Completed Grade 12 core Mathematics, Calculus & Newton Dynamics modules.', 'Learning completion', 'award', 'itm-cert-frame', 100, now);
    insertAch.run('ach-02', 'ACH_PHYSICS_ACE', 'Newton Mechanics Master', 'ជើងឯកមេកានិចញូតុន', 'Achieved 90%+ score on kinematic and gravitational simulation assessments.', 'Quiz scores', 'zap', 'itm-telescope', 80, now);
    insertAch.run('ach-03', 'ACH_STEM_SIM', 'Virtual Circuit Architect', 'ស្ថាបត្យករសៀគ្វីនិម្មិត', 'Successfully completed binary logic synchronization with zero fatal timing faults.', 'STEM activities', 'flask', 'itm-microscope', 75, now);
    insertAch.run('ach-04', 'ACH_SCHOLAR_SEARCH', 'Global Opportunity Scout', 'អ្នករុករកអាហារូបករណ៍', 'Researched and bookmarked 3 fully-funded scholarship opportunities (CADT, AUPP, Australia Awards).', 'Scholarship activities', 'compass', 'itm-computer', 50, now);
    insertAch.run('ach-05', 'ACH_PEER_CONTRIB', 'Knowledge Contributor', 'អ្នកចែករំលែកចំណេះដឹង', 'Joined peer study circle and contributed collaborative problem insights.', 'Community contribution', 'star', 'itm-bookshelf', 60, now);

    // Seed Demo Student's Avatar Profile
    db.prepare(`
      INSERT OR REPLACE INTO avatar_profiles (
        student_id, avatar_name, gender_presentation, skin_tone, hair_style, hair_color,
        eye_color, clothing_outfit, accessory, expression, level, merit_points, updated_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'usr-student-01',
      'Vannak Sam',
      'neutral',
      '#E0AC69',
      'short_wavy',
      '#2A2421',
      '#3B2F2F',
      'cdes_uniform',
      'glasses_round',
      'smiling',
      3,
      365,
      now,
      now
    );

    // Seed Virtual Room
    db.prepare(`
      INSERT OR REPLACE INTO virtual_rooms (
        id, student_id, room_name, background_theme, wall_color, floor_style, layout_grid_size, study_streak_days, updated_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'room-demo-01',
      'usr-student-01',
      'Vannak\'s STEM Sanctuary',
      'daylight_study',
      '#F0F4F8',
      'warm_wood',
      12,
      7,
      now,
      now
    );

    // Seed Student Inventory (Items owned)
    const insertInv = db.prepare(`
      INSERT OR IGNORE INTO student_inventory (id, student_id, item_id, quantity, acquired_at, is_equipped)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const initialItemIds = [
      'itm-desk', 'itm-chair', 'itm-bookshelf', 'itm-computer',
      'itm-cert-frame', 'itm-plant', 'itm-lamp', 'itm-whiteboard',
      'itm-microscope', 'itm-poster-solar'
    ];

    initialItemIds.forEach((itemId, idx) => {
      insertInv.run(`inv-${idx + 1}`, 'usr-student-01', itemId, 1, now, 1);
    });

    // Seed Placed Room Objects
    const insertObj = db.prepare(`
      INSERT OR IGNORE INTO room_objects (id, room_id, item_id, position_x, position_y, layer, rotation, is_interactive, placed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertObj.run('obj-01', 'room-demo-01', 'itm-desk', 50, 72, 'floor', 0, 1, now);
    insertObj.run('obj-02', 'room-demo-01', 'itm-chair', 50, 84, 'floor', 0, 1, now);
    insertObj.run('obj-03', 'room-demo-01', 'itm-computer', 50, 62, 'desk', 0, 1, now);
    insertObj.run('obj-04', 'room-demo-01', 'itm-lamp', 34, 62, 'desk', 0, 1, now);
    insertObj.run('obj-05', 'room-demo-01', 'itm-plant', 66, 62, 'desk', 0, 1, now);
    insertObj.run('obj-06', 'room-demo-01', 'itm-bookshelf', 82, 60, 'floor', 0, 1, now);
    insertObj.run('obj-07', 'room-demo-01', 'itm-whiteboard', 20, 32, 'wall', 0, 1, now);
    insertObj.run('obj-08', 'room-demo-01', 'itm-cert-frame', 50, 24, 'wall', 0, 1, now);
    insertObj.run('obj-09', 'room-demo-01', 'itm-poster-solar', 80, 24, 'wall', 0, 1, now);

    // Seed Student Achievements & Wall placement
    const insertStdAch = db.prepare(`
      INSERT OR IGNORE INTO student_achievements (id, student_id, achievement_id, unlocked_at, is_displayed_on_wall, wall_slot_index, progress_percentage)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertStdAch.run('std-ach-01', 'usr-student-01', 'ach-01', now, 1, 1, 100);
    insertStdAch.run('std-ach-02', 'usr-student-01', 'ach-02', now, 1, 2, 100);
    insertStdAch.run('std-ach-03', 'usr-student-01', 'ach-03', now, 0, null, 100);
    insertStdAch.run('std-ach-04', 'usr-student-01', 'ach-04', now, 0, null, 100);
    insertStdAch.run('std-ach-05', 'usr-student-01', 'ach-05', now, 0, null, 65);

    // Seed Phase 5 Learning World
    seedLearningWorld(db);
  }
}

function seedLearningWorld(db: ReturnType<typeof getDatabase>): void {
  const now = new Date().toISOString();

  // SEC-001: seed credentials externalised to environment variables (no in-code secrets).
  if (!process.env.ADMIN_SEED_PASSWORD || !process.env.STUDENT_SEED_PASSWORD || !process.env.ORG_SEED_PASSWORD) {
    console.warn("SEC-001: seed credentials not set via env (ADMIN_SEED_PASSWORD / STUDENT_SEED_PASSWORD / ORG_SEED_PASSWORD).");
  }

  // 1. Seed Achievements related to Learning World
  const insertAch = db.prepare(`
    INSERT OR IGNORE INTO achievements (id, code, title, title_km, description, category, badge_icon, item_reward_id, merit_points, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAch.run(
    'ach-lab-chem',
    'ach-lab-chem',
    'Chemistry Explorer Badge',
    'អ្នករុករកគីមីវិទ្យា',
    'Mastered volumetric titration and observed precise phenolphthalein end-point neutralization.',
    'STEM activities',
    'flask',
    'itm-chem-kit',
    80,
    now
  );

  insertAch.run(
    'ach-lab-phys',
    'ach-lab-phys',
    'Newtonian Mechanics Master',
    'រូបវិទូញូតុន',
    'Experimentally determined gravitational constant g via simple harmonic pendulum oscillations.',
    'STEM activities',
    'zap',
    'itm-telescope',
    75,
    now
  );

  insertAch.run(
    'ach-lab-bio',
    'ach-lab-bio',
    'Biosphere Cell Investigator',
    'អ្នកស្រាវជ្រាវជីវវិទ្យា',
    'Conducted plant tissue cellular osmosis and identified plasmolysis solute thresholds.',
    'STEM activities',
    'microscope',
    'itm-microscope',
    75,
    now
  );

  insertAch.run(
    'ach-path-ai',
    'ach-path-ai',
    'AI Pathway Pioneer',
    'សិក្ខាកាមបញ្ញាសិប្បនិម្មិត',
    'Enrolled and mastered core stages in the AI & Intelligent Systems Engineer roadmap.',
    'Learning completion',
    'star',
    'itm-computer',
    100,
    now
  );

  insertAch.run(
    'ach-stem-circuit',
    'ach-stem-circuit',
    'Digital Logic Architect',
    'ស្ថាបត្យករសៀគ្វីឌីជីថល',
    'Constructed multi-gate boolean combinational logic synchronizers with zero timing faults.',
    'STEM activities',
    'shield-check',
    'itm-whiteboard',
    60,
    now
  );

  // 2. Seed Subjects
  const subjectCount = (db.prepare('SELECT COUNT(*) as count FROM subjects').get() as { count: number }).count;
  if (subjectCount === 0) {
    const insertSub = db.prepare(`
      INSERT OR IGNORE INTO subjects (id, slug, name, name_km, description, icon_key, color, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    initialSubjects.forEach((sub) => {
      insertSub.run(sub.id, sub.slug, sub.name, sub.name_km, sub.description, sub.icon_key, sub.color, sub.order_index);
    });

    // 3. Seed Categories
    const insertCat = db.prepare(`
      INSERT OR IGNORE INTO categories (id, subject_id, slug, name, name_km, description, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    initialCategories.forEach((cat) => {
      insertCat.run(cat.id, cat.subject_id, cat.slug, cat.name, cat.name_km, cat.description, cat.order_index);
    });

    // 4. Seed Learning Content
    const insertCnt = db.prepare(`
      INSERT OR IGNORE INTO learning_content (
        id, subject_id, category_id, title, title_km, content_type, difficulty,
        read_time_minutes, media_url, body_markdown, simulation_config, quiz_data,
        project_brief, learning_objectives, merit_points, is_featured, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    initialLearningContent.forEach((cnt) => {
      insertCnt.run(
        cnt.id,
        cnt.subject_id,
        cnt.category_id,
        cnt.title,
        cnt.title_km,
        cnt.content_type,
        cnt.difficulty,
        cnt.read_time_minutes,
        cnt.media_url || null,
        cnt.body_markdown,
        cnt.simulation_config ? JSON.stringify(cnt.simulation_config) : '{}',
        cnt.quiz_data ? JSON.stringify(cnt.quiz_data) : '[]',
        cnt.project_brief ? JSON.stringify(cnt.project_brief) : '{}',
        JSON.stringify(cnt.learning_objectives || []),
        cnt.merit_points,
        cnt.is_featured,
        cnt.created_at
      );
    });

    // 5. Seed Lab Experiments
    const insertExp = db.prepare(`
      INSERT OR IGNORE INTO lab_experiments (
        id, subject_id, title, title_km, category, description,
        learning_objectives, apparatus_list, instructions, parameters_schema,
        initial_state, expected_outcome, safety_notes, merit_points, difficulty, badge_reward_code, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    initialLabExperiments.forEach((exp) => {
      insertExp.run(
        exp.id,
        exp.subject_id,
        exp.title,
        exp.title_km,
        exp.category,
        exp.description,
        JSON.stringify(exp.learning_objectives || []),
        JSON.stringify(exp.apparatus_list || []),
        JSON.stringify(exp.instructions || []),
        JSON.stringify(exp.parameters_schema || {}),
        JSON.stringify(exp.initial_state || {}),
        JSON.stringify(exp.expected_outcome || {}),
        exp.safety_notes || null,
        exp.merit_points,
        exp.difficulty,
        exp.badge_reward_code || null,
        exp.created_at
      );
    });

    // 6. Seed Learning Activities
    const insertAct = db.prepare(`
      INSERT OR IGNORE INTO learning_activities (
        id, title, title_km, activity_type, subject_id, difficulty,
        learning_objective, instructions, activity_data, hint, reward_points, item_reward_id, badge_code, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    initialLearningActivities.forEach((act) => {
      insertAct.run(
        act.id,
        act.title,
        act.title_km,
        act.activity_type,
        act.subject_id,
        act.difficulty,
        act.learning_objective,
        act.instructions,
        JSON.stringify(act.activity_data || {}),
        act.hint || null,
        act.reward_points,
        act.item_reward_id || null,
        act.badge_code || null,
        act.created_at
      );
    });

    // 7. Seed Learning Paths & Steps
    const insertPath = db.prepare(`
      INSERT OR IGNORE INTO learning_paths (
        id, code, title, title_km, target_career, description, difficulty, estimated_weeks, icon_key, color, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    initialLearningPaths.forEach((p) => {
      insertPath.run(p.id, p.code, p.title, p.title_km, p.target_career, p.description, p.difficulty, p.estimated_weeks, p.icon_key, p.color, p.created_at);
    });

    const insertStep = db.prepare(`
      INSERT OR IGNORE INTO learning_path_steps (
        id, path_id, step_order, title, title_km, subject, step_type, reference_id, description, is_required
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    initialLearningPathSteps.forEach((s) => {
      insertStep.run(s.id, s.path_id, s.step_order, s.title, s.title_km, s.subject, s.step_type, s.reference_id || null, s.description, s.is_required);
    });

    // 8. Seed Demo Student Initial Learning Record
    db.prepare(`
      INSERT OR IGNORE INTO student_learning_paths (
        id, student_id, path_id, current_step_order, status, progress_percentage, enrolled_at, last_active_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('slp-demo-01', 'usr-student-01', 'path-ai-engineer', 2, 'active', 25.0, now, now);

    db.prepare(`
      INSERT OR IGNORE INTO lab_experiment_results (
        id, student_id, experiment_id, status, attempts_count, actions_log, parameters_used, observation_notes, outcome_data, score, completed_at, updated_at
      ) VALUES (?, ?, ?, 'completed', 2, '[]', '{"length":1.0,"g":9.789}', 'Measured T = 2.01s with 2.1% error.', '{"calculated_g":9.789}', 94.5, ?, ?)
    `).run('res-demo-01', 'usr-student-01', 'exp-physics-01', now, now);

    db.prepare(`
      INSERT OR IGNORE INTO student_activity_progress (
        id, student_id, activity_id, status, score, attempts, hint_used_count, response_data, completed_at, updated_at
      ) VALUES (?, ?, ?, 'completed', 100.0, 1, 0, '{"logic_output":1}', ?, ?)
    `).run('prog-demo-01', 'usr-student-01', 'act-puzzle-logic', now, now);

    // ----------------------------------------------------
    // 9. Seed Knowledge Documents & Precomputed Embeddings (Phase 6)
    // ----------------------------------------------------
    const docCount = (db.prepare('SELECT COUNT(*) as c FROM knowledge_documents').get() as { c: number })?.c || 0;
    if (docCount === 0) {
      const insertDoc = db.prepare(`
        INSERT OR IGNORE INTO knowledge_documents (id, title, category, content, source, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const insertEmbed = db.prepare(`
        INSERT OR IGNORE INTO knowledge_embeddings (id, document_id, vector, metadata, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const doc of initialKnowledgeDocuments) {
        insertDoc.run(doc.id, doc.title, doc.category, doc.content, doc.source, now);

        // Precompute 128-dimensional dense vector embedding
        const vectorText = `${doc.title} ${doc.category} ${doc.content} ${doc.keywords.join(' ')}`;
        const vector = embeddingService.generateEmbedding(vectorText);
        const metadata = {
          title: doc.title,
          category: doc.category,
          source: doc.source,
          keywords: doc.keywords
        };

        insertEmbed.run(
          `emb-${doc.id}`,
          doc.id,
          JSON.stringify(vector),
          JSON.stringify(metadata),
          now
        );
      }
    }

    // ----------------------------------------------------
    // 10. Seed Student AI Memory (Phase 6)
    // ----------------------------------------------------
    const memCount = (db.prepare('SELECT COUNT(*) as c FROM student_ai_memory').get() as { c: number })?.c || 0;
    if (memCount === 0) {
      db.prepare(`
        INSERT OR IGNORE INTO student_ai_memory (
          student_id, learning_summary, interest_summary, career_summary,
          behavior_summary, conversation_summary, last_interaction_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'usr-student-01',
        'Academic Track: Grade 12 Bac II Science Candidate. Demonstrated high aptitude in Applied Mathematics, Logic Circuits, and Algorithmic Problem Solving. Areas for focused reinforcement: Optics (Snell Law angular derivations) and French technical terminology for polytechnic entrance. Completed STEM Virtual Labs: Simple Harmonic Motion Pendulum & Logic Gates.',
        'Primary Curiosity Vectors: Robotics & Automation, Artificial Intelligence, Renewable Energy, and High-Performance Web Architecture. Engages deeply in hands-on simulation environments.',
        'Target Profession: AI Systems Software Engineer. Target Universities: Cambodia Academy of Digital Technology (CADT) and Institute of Technology of Cambodia (ITC Tronc Commun). Target Funding: MPTC Digital Skill 100% Scholarship, Paragon President Excellence, and Australia Awards.',
        'Persistence Index: 82/100 (High cognitive grit; persists through multi-step puzzle failures). Problem Solving Index: 79/100. Engagement Rating: 88/100. Level 1 Avatar Scholar (150 Merit Points). Prefers visual simulation discovery before formal algebraic proofs.',
        'Inquired about ITC Tronc Commun vs CADT Software Engineering curriculums, scholarship eligibility criteria for Cambodian Grade 12 students, and step-by-step guidance for wave optics.',
        now,
        now
      );
    }

    // ----------------------------------------------------
    // 11. Seed Initial Recommendations (Phase 6)
    // ----------------------------------------------------
    const recCount = (db.prepare('SELECT COUNT(*) as c FROM ai_recommendation_events').get() as { c: number })?.c || 0;
    if (recCount === 0) {
      const insertRec = db.prepare(`
        INSERT OR IGNORE INTO ai_recommendation_events (
          id, student_id, recommendation_type, title, description, match_reason,
          target_entity_id, priority_score, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertRec.run(
        'rec-seed-01',
        'usr-student-01',
        'scholarship',
        'MPTC Digital Skill 100% Undergraduate Scholarship',
        'Fully funded 4-year tuition fee waiver with monthly living stipends ($100-$150/mo) for Cambodian Grade 12 Science track students entering CADT or ITC.',
        'Perfect match: Grade 12 Cambodian national, Science track, projected Bac II Grade A/B, and verified interest in Software Engineering & AI.',
        'sch-mptc-full',
        98.0,
        'given',
        now,
        now
      );

      insertRec.run(
        'rec-seed-02',
        'usr-student-01',
        'learning',
        'Virtual STEM Lab: Snell\'s Law & Refraction Simulator',
        'Adjust incident angles and refractive indices in real-time to master wave optics derivations before the national Bac II examination.',
        'Recommended based on diagnostic hesitation in wave optics formulas; visual manipulation accelerates schema formation.',
        'exp-optics-01',
        94.5,
        'given',
        now,
        now
      );

      insertRec.run(
        'rec-seed-03',
        'usr-student-01',
        'career',
        'Embedded Robotics & AI Systems Engineering Pathway',
        'Comprehensive dual-track preparation bridging ITC polytechnic foundations with CADT software incubation ecosystems.',
        'Direct alignment with your robotics curiosity, 82/100 persistence rating, and top percentile mathematics performance.',
        'career-ai-robotics',
        96.0,
        'given',
        now,
        now
      );
    }

    // ----------------------------------------------------
    // 12. Seed Phase 7 Community Ecosystem (Communities, Posts, Mentors, Projects, Events, Orgs)
    // ----------------------------------------------------
    const commCount = (db.prepare('SELECT COUNT(*) as c FROM communities').get() as { c: number })?.c || 0;
    if (commCount === 0) {
      const insertComm = db.prepare(`
        INSERT OR IGNORE INTO communities (
          id, slug, name, name_km, description, category, icon_key, color,
          created_by, is_verified, member_count, post_count, safety_level, rules, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const c of initialCommunities) {
        insertComm.run(
          c.id, c.slug, c.name, c.name_km, c.description, c.category, c.icon_key, c.color,
          c.created_by, c.is_verified, c.member_count, c.post_count, c.safety_level, c.rules, now
        );
      }

      // Automatically join student to the default STEM clubs
      const insertMember = db.prepare(`
        INSERT OR IGNORE INTO community_members (id, community_id, user_id, role, reputation_points, is_active, joined_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertMember.run('cm-init-01', 'comm-bacii-stem', 'usr-student-01', 'member', 15, 1, now);
      insertMember.run('cm-init-02', 'comm-ai-robotics', 'usr-student-01', 'member', 10, 1, now);
    }

    const postCount = (db.prepare('SELECT COUNT(*) as c FROM community_posts').get() as { c: number })?.c || 0;
    if (postCount === 0) {
      const insertPost = db.prepare(`
        INSERT OR IGNORE INTO community_posts (
          id, community_id, author_id, author_name, author_role, author_avatar,
          post_type, title, content, tags, upvotes_count, comments_count,
          is_pinned, is_solved, solved_comment_id, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of initialCommunityPosts) {
        insertPost.run(
          p.id, p.community_id, p.author_id, p.author_name, p.author_role, p.author_avatar,
          p.post_type, p.title, p.content, p.tags, p.upvotes_count, p.comments_count,
          p.is_pinned, p.is_solved, (p as any).solved_comment_id || null, p.status, p.created_at, p.updated_at
        );
      }

      const insertCmt = db.prepare(`
        INSERT OR IGNORE INTO community_comments (
          id, post_id, author_id, author_name, author_role, author_avatar,
          parent_comment_id, content, upvotes_count, is_accepted_answer, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const c of initialCommunityComments) {
        insertCmt.run(
          c.id, c.post_id, c.author_id, c.author_name, c.author_role, c.author_avatar,
          c.parent_comment_id, c.content, c.upvotes_count, c.is_accepted_answer, c.status, c.created_at
        );
      }
    }

    const mentorCount = (db.prepare('SELECT COUNT(*) as c FROM mentor_profiles').get() as { c: number })?.c || 0;
    if (mentorCount === 0) {
      const insertMentor = db.prepare(`
        INSERT OR IGNORE INTO mentor_profiles (
          id, user_id, full_name, full_name_km, title, organization, bio,
          expertise_areas, university_id, degree, graduation_year, verified_badge,
          rating, total_sessions, availability_slots, is_accepting_mentees, avatar_url, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const m of initialMentors) {
        insertMentor.run(
          m.id, m.user_id, m.full_name, m.full_name_km, m.title, m.organization, m.bio,
          JSON.stringify(m.expertise_areas), m.university_id, m.degree, m.graduation_year,
          m.verified_badge, m.rating, m.total_sessions, JSON.stringify(m.availability_slots),
          m.is_accepting_mentees, m.avatar_url, now
        );
      }
    }

    const projCount = (db.prepare('SELECT COUNT(*) as c FROM student_projects').get() as { c: number })?.c || 0;
    if (projCount === 0) {
      const insertProj = db.prepare(`
        INSERT OR IGNORE INTO student_projects (
          id, slug, title, title_km, description, category, creator_id,
          creator_name, creator_avatar, stage, required_skills, current_team_size,
          max_team_size, repository_url, live_demo_url, merit_points_reward,
          upvotes_count, associated_learning_path_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of initialStudentProjects) {
        insertProj.run(
          p.id, p.slug, p.title, p.title_km, p.description, p.category, p.creator_id,
          p.creator_name, p.creator_avatar, p.stage, JSON.stringify(p.required_skills),
          p.current_team_size, p.max_team_size, p.repository_url, p.live_demo_url,
          p.merit_points_reward, p.upvotes_count, p.associated_learning_path_id || null, now, now
        );
      }

      // Seed sample milestones
      const insertMs = db.prepare(`
        INSERT OR IGNORE INTO project_milestones (
          id, project_id, title, description, due_date, status, merit_points, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertMs.run('ms-01', 'proj-01', 'Khmer Unicode Phoneme Lexicon', 'Compile 2,500 audio syllable recordings with verified MoEYS phonetic annotations.', '2026-10-15', 'completed', 30, now);
      insertMs.run('ms-02', 'proj-01', 'Acoustic Model Training & Quantization', 'Train lightweight Conformer model and quantize for mobile ONNX runtime.', '2026-11-01', 'in_progress', 40, null);
      insertMs.run('ms-03', 'proj-01', 'Rural School Classroom Pilot', 'Deploy offline tablet demo in 3 provincial schools in Kampong Cham.', '2026-11-20', 'pending', 50, null);
    }

    const evCount = (db.prepare('SELECT COUNT(*) as c FROM campus_events').get() as { c: number })?.c || 0;
    if (evCount === 0) {
      const insertEvent = db.prepare(`
        INSERT OR IGNORE INTO campus_events (
          id, slug, title, title_km, event_type, description, host_organization,
          host_university_id, speaker_name, speaker_title, speaker_avatar, event_format,
          location_or_link, start_time, end_time, registration_deadline, max_participants,
          current_rsvp_count, tags, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const e of initialCampusEvents) {
        insertEvent.run(
          e.id, e.slug, e.title, e.title_km, e.event_type, e.description, e.host_organization,
          e.host_university_id, e.speaker_name, e.speaker_title, e.speaker_avatar, e.event_format,
          e.location_or_link, e.start_time, e.end_time, e.registration_deadline, e.max_participants,
          e.current_rsvp_count, JSON.stringify(e.tags), e.status, now
        );
      }
    }

    const orgCount = (db.prepare('SELECT COUNT(*) as c FROM partner_organizations').get() as { c: number })?.c || 0;
    if (orgCount === 0) {
      const insertOrg = db.prepare(`
        INSERT OR IGNORE INTO partner_organizations (
          id, name, name_km, org_type, description, logo_url, website_url,
          verified_status, contact_email, focus_domains, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const o of initialPartnerOrgs) {
        insertOrg.run(
          o.id, o.name, o.name_km, o.org_type, o.description, o.logo_url, o.website_url,
          o.verified_status, o.contact_email, JSON.stringify(o.focus_domains), now
        );
      }
    }

    // ----------------------------------------------------
    // Seed Phase 8: Education Research Laboratory & Learning Science
    // ----------------------------------------------------
    const expCount = (db.prepare('SELECT COUNT(*) as c FROM research_experiments').get() as { c: number })?.c || 0;
    if (expCount === 0) {
      const insertExp = db.prepare(`
        INSERT OR IGNORE INTO research_experiments (
          id, slug, title, hypothesis, research_question, domain, status,
          primary_metric, secondary_metrics, target_sample_size, current_sample_size,
          power_analysis, start_date, end_date, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertGroup = db.prepare(`
        INSERT OR IGNORE INTO experiment_groups (
          id, experiment_id, group_name, group_type, intervention_type,
          pedagogy_parameters, target_allocation_ratio, participant_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertResult = db.prepare(`
        INSERT OR IGNORE INTO research_results_v2 (
          id, experiment_id, sample_size, group_metrics, comparative_analysis,
          is_statistically_significant, p_value, effect_size_cohens_d, key_findings,
          pedagogical_recommendation, target_curriculum_revision, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const e of initialResearchExperiments) {
        insertExp.run(
          e.id, e.slug, e.title, e.hypothesis, e.research_question, e.domain, e.status,
          e.primary_metric, JSON.stringify(e.secondary_metrics), e.target_sample_size,
          e.current_sample_size, JSON.stringify(e.power_analysis), e.start_date, e.end_date,
          'CDES Education Research Council', now, now
        );

        for (const g of e.groups) {
          insertGroup.run(
            g.id, e.id, g.group_name, g.group_type, g.intervention_type,
            JSON.stringify(g.pedagogy_parameters), g.target_allocation_ratio, g.participant_count, now
          );
        }

        if (e.results) {
          const findings = e.results.key_findings || (e.results as any).keyFindings || [];
          insertResult.run(
            `res-${e.id}`,
            e.id,
            e.results.sample_size || 0,
            JSON.stringify(e.results.group_metrics || {}),
            JSON.stringify(e.results.comparative_analysis || {}),
            e.results.comparative_analysis?.is_statistically_significant ? 1 : 0,
            e.results.comparative_analysis?.p_value ?? 0,
            e.results.comparative_analysis?.effect_size_cohens_d ?? 0,
            JSON.stringify(findings),
            e.results.pedagogical_recommendation || '',
            e.results.target_curriculum_revision || '',
            now
          );
        }
      }
    }

    // Seed Teaching Method Benchmarks
    const benchCount = (db.prepare('SELECT COUNT(*) as c FROM teaching_method_benchmarks').get() as { c: number })?.c || 0;
    if (benchCount === 0) {
      const insertBench = db.prepare(`
        INSERT OR IGNORE INTO teaching_method_benchmarks (
          id, method_key, method_name, description, avg_engagement_minutes,
          completion_rate_percentage, normalized_gain_score, retention_rate_30d,
          persistence_index, cognitive_load_rating, best_fit_domains, sample_students_count, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const b of initialTeachingMethodBenchmarks) {
        insertBench.run(
          `bench-${b.method_key}`, b.method_key, b.method_name, b.description,
          b.avg_engagement_minutes, b.completion_rate_percentage, b.normalized_gain_score,
          b.retention_rate_30d, b.persistence_index, b.cognitive_load_rating,
          JSON.stringify(b.best_fit_domains), b.sample_students_count, now
        );
      }
    }

    // Seed Student Mastery States (BKT)
    const masteryCount = (db.prepare('SELECT COUNT(*) as c FROM student_mastery_states').get() as { c: number })?.c || 0;
    if (masteryCount === 0) {
      const insertMastery = db.prepare(`
        INSERT OR IGNORE INTO student_mastery_states (
          id, student_id, concept_id, concept_name, subject, prior_mastery_p_l0,
          transition_prob_p_t, guess_prob_p_g, slip_prob_p_s, current_mastery_prob,
          mastery_status, total_opportunities, correct_streak, last_practiced_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const m of initialStudentMasteryStates) {
        insertMastery.run(
          m.id, m.student_id, m.concept_id, m.concept_name, m.subject,
          m.prior_mastery_p_l0, m.transition_prob_p_t, m.guess_prob_p_g, m.slip_prob_p_s,
          m.current_mastery_prob, m.mastery_status, m.total_opportunities,
          m.correct_streak, m.last_practiced_at, now
        );
      }
    }

    // Seed Misconception Logs
    const miscCount = (db.prepare('SELECT COUNT(*) as c FROM misconception_logs').get() as { c: number })?.c || 0;
    if (miscCount === 0) {
      const insertMisc = db.prepare(`
        INSERT OR IGNORE INTO misconception_logs (
          id, student_id, subject, topic, misconception_code, misconception_title,
          error_taxonomy, context_details, suggested_intervention, resolved, logged_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const mi of initialMisconceptionLogs) {
        insertMisc.run(
          mi.id, mi.student_id, mi.subject, mi.topic, mi.misconception_code,
          mi.misconception_title, mi.error_taxonomy, mi.context_details,
          mi.suggested_intervention, mi.resolved, mi.logged_at
        );
      }
    }

    // Seed Teacher Class Analytics
    const teacherCount = (db.prepare('SELECT COUNT(*) as c FROM teacher_class_analytics').get() as { c: number })?.c || 0;
    if (teacherCount === 0) {
      const insertTeacher = db.prepare(`
        INSERT OR IGNORE INTO teacher_class_analytics (
          id, class_name, grade_level, subject, school_name, province, student_count,
          average_mastery_percentage, learning_velocity_index, top_misconceptions,
          recommended_interventions, students_needing_scaffolding, students_accelerating, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const tc of initialTeacherClassAnalytics) {
        insertTeacher.run(
          tc.id, tc.class_name, tc.grade_level, tc.subject, tc.school_name, tc.province,
          tc.student_count, tc.average_mastery_percentage, tc.learning_velocity_index,
          JSON.stringify(tc.top_misconceptions), JSON.stringify(tc.recommended_interventions),
          tc.students_needing_scaffolding, tc.students_accelerating, now
        );
      }
    }

    // Seed Cambodia Education Knowledge Aggregates
    const aggCount = (db.prepare('SELECT COUNT(*) as c FROM education_knowledge_aggregates').get() as { c: number })?.c || 0;
    if (aggCount === 0) {
      const insertAgg = db.prepare(`
        INSERT OR IGNORE INTO education_knowledge_aggregates (
          id, domain, subject, grade_or_level, difficulty_rating, provincial_readiness,
          top_learning_challenges, career_alignment_score, national_curriculum_notes, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const a of initialEducationKnowledgeAggregates) {
        insertAgg.run(
          a.id, a.domain, a.subject, a.grade_or_level, a.difficulty_rating,
          JSON.stringify(a.provincial_readiness), JSON.stringify(a.top_learning_challenges),
          a.career_alignment_score, a.national_curriculum_notes, now
        );
      }
    }

    // ==========================================================
    // PHASE 14: SEED DATA PLATFORM & EDUCATION INTELLIGENCE TABLES
    // ==========================================================
    // 1. Universities Lake
    const univLakeCount = (db.prepare('SELECT COUNT(*) as c FROM cdes_universities_lake').get() as { c: number })?.c || 0;
    if (univLakeCount === 0) {
      const insUniv = db.prepare(`
        INSERT OR IGNORE INTO cdes_universities_lake (
          id, abbr, name_en, name_km, established_year, accreditation_body, moeys_recognition,
          campus_city, province, institution_type, student_count, faculty_ratio, tuition_usd_annual,
          tronc_commun_mandatory, bac_ii_min_grade, entrance_exam_req, avg_employment_rate,
          top_sectors_json, programs_count, accreditation_status, data_confidence, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const u of initialUniversitiesLake) {
        insUniv.run(
          u.id, u.abbr, u.name_en, u.name_km, u.established_year, u.accreditation_body,
          u.moeys_recognition, u.campus_city, u.province, u.institution_type, u.student_count,
          u.faculty_ratio, u.tuition_usd_annual, u.tronc_commun_mandatory, u.bac_ii_min_grade,
          u.entrance_exam_req, u.avg_employment_rate, u.top_sectors_json, u.programs_count,
          u.accreditation_status, u.data_confidence, now, now
        );
      }
    }

    // 2. Scholarships Lake
    const schLakeCount = (db.prepare('SELECT COUNT(*) as c FROM cdes_scholarships_lake').get() as { c: number })?.c || 0;
    if (schLakeCount === 0) {
      const insSch = db.prepare(`
        INSERT OR IGNORE INTO cdes_scholarships_lake (
          id, code, title, provider, scholarship_type, coverage_percentage, coverage_details,
          stipend_monthly_usd, target_education_tier, provincial_quota_flag, priority_fields_json,
          min_gpa_or_grade, deadline, annual_recipient_quota, application_url, verified_by, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const s of initialScholarshipsLake) {
        insSch.run(
          s.id, s.code, s.title, s.provider, s.scholarship_type, s.coverage_percentage,
          s.coverage_details, s.stipend_monthly_usd, s.target_education_tier, s.provincial_quota_flag,
          s.priority_fields_json, s.min_gpa_or_grade, s.deadline, s.annual_recipient_quota,
          s.application_url, s.verified_by, now
        );
      }
    }

    // 3. Careers Lake
    const carLakeCount = (db.prepare('SELECT COUNT(*) as c FROM cdes_careers_lake').get() as { c: number })?.c || 0;
    if (carLakeCount === 0) {
      const insCar = db.prepare(`
        INSERT OR IGNORE INTO cdes_careers_lake (
          id, soc_code, title_en, title_km, onet_taxonomy_code, industry_domain,
          entry_salary_usd, median_salary_usd, senior_salary_usd, projected_growth_5yr,
          automation_risk_pct, top_skills_json, education_requirement, asean_mobility_tier,
          demand_index, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const c of initialCareersLake) {
        insCar.run(
          c.id, c.soc_code, c.title_en, c.title_km, c.onet_taxonomy_code, c.industry_domain,
          c.entry_salary_usd, c.median_salary_usd, c.senior_salary_usd, c.projected_growth_5yr,
          c.automation_risk_pct, c.top_skills_json, c.education_requirement, c.asean_mobility_tier,
          c.demand_index, now
        );
      }
    }

    // 4. Industries Lake
    const indLakeCount = (db.prepare('SELECT COUNT(*) as c FROM cdes_industries_lake').get() as { c: number })?.c || 0;
    if (indLakeCount === 0) {
      const insInd = db.prepare(`
        INSERT OR IGNORE INTO cdes_industries_lake (
          id, sector_code, name_en, name_km, gdp_contribution_pct, digital_transformation_index,
          strategic_priority_level, total_formal_workforce, hiring_velocity_index, top_employers_json,
          key_growth_drivers, partner_institutions_count, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const i of initialIndustriesLake) {
        insInd.run(
          i.id, i.sector_code, i.name_en, i.name_km, i.gdp_contribution_pct, i.digital_transformation_index,
          i.strategic_priority_level, i.total_formal_workforce, i.hiring_velocity_index, i.top_employers_json,
          i.key_growth_drivers, i.partner_institutions_count, now
        );
      }
    }

    // 5. Psychometrics Lake
    const psyLakeCount = (db.prepare('SELECT COUNT(*) as c FROM cdes_psychometrics_lake').get() as { c: number })?.c || 0;
    if (psyLakeCount === 0) {
      const insPsy = db.prepare(`
        INSERT OR IGNORE INTO cdes_psychometrics_lake (
          id, instrument_code, instrument_name, dimension_key, dimension_label, description,
          educational_application, pedagogical_strategy, scale_range_min, scale_range_max,
          assessment_items_count, non_clinical_guarantee, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of initialPsychometricsLake) {
        insPsy.run(
          p.id, p.instrument_code, p.instrument_name, p.dimension_key, p.dimension_label, p.description,
          p.educational_application, p.pedagogical_strategy, p.scale_range_min, p.scale_range_max,
          p.assessment_items_count, p.non_clinical_guarantee, now
        );
      }
    }

    // 6. Learning Science Lake
    const lsLakeCount = (db.prepare('SELECT COUNT(*) as c FROM cdes_learning_science_lake').get() as { c: number })?.c || 0;
    if (lsLakeCount === 0) {
      const insLs = db.prepare(`
        INSERT OR IGNORE INTO cdes_learning_science_lake (
          id, framework_name, level_or_phase, cognitive_domain, definition, action_verbs_json,
          scaffolding_techniques_json, ebbinghaus_decay_factor, cognitive_load_type,
          misconception_countermeasures_json, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const l of initialLearningScienceLake) {
        insLs.run(
          l.id, l.framework_name, l.level_or_phase, l.cognitive_domain, l.definition, l.action_verbs_json,
          l.scaffolding_techniques_json, l.ebbinghaus_decay_factor, l.cognitive_load_type,
          l.misconception_countermeasures_json, now
        );
      }
    }

    // 7. Student Intelligence (usr-student-01)
    const sIdentCount = (db.prepare("SELECT COUNT(*) as c FROM cdes_student_identities WHERE student_id = 'usr-student-01'").get() as { c: number })?.c || 0;
    if (sIdentCount === 0) {
      db.prepare(`
        INSERT OR IGNORE INTO cdes_student_identities (
          student_id, sovereign_pseudonym, academic_grade, institution_name, province_origin,
          geographic_tier, socioeconomic_access_bracket, primary_language, consent_status,
          encryption_key_hash, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'usr-student-01', 'CDES-KH-STU-88219', 'Grade 12 (Bac II Candidate)',
        'Preah Sisowath High School / New Generation School', 'Phnom Penh',
        'Tier 1 Capital', 'Moderate Digital Access (Self-Sustained)', 'km',
        'fully_consented', 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        now, now
      );

      // Student Goals
      const insGoal = db.prepare(`
        INSERT OR IGNORE INTO cdes_student_goals (
          id, student_id, goal_category, target_title, target_deadline, priority_level,
          progress_pct, status, verification_criteria, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insGoal.run('goal-1', 'usr-student-01', 'bac_ii_exam', 'Attain Bac II Overall Grade A (Math & Physics >= 95%)', '2026-10-25', 'critical', 82, 'in_progress', 'National MoEYS Examination Board Official Transcript', now);
      insGoal.run('goal-2', 'usr-student-01', 'university_admission', 'Gain Admission to CADT Software Engineering or ITC Computer Engineering', '2026-11-15', 'critical', 78, 'in_progress', 'Official CADT / ITC Entrance Exam Merit List Verification', now);
      insGoal.run('goal-3', 'usr-student-01', 'scholarship_award', 'Secure MPTC Techo Digital Talent 100% Scholarship', '2026-10-15', 'high', 85, 'in_progress', 'MPTC Official Scholarship Award Decree Notice', now);
      insGoal.run('goal-4', 'usr-student-01', 'career_aspiration', 'Cloud & Distributed AI Systems Architect in Southeast Asia', '2030-06-01', 'high', 45, 'in_progress', 'Industry Employment Contract or Published System Architecture Paper', now);

      // Student Interest Vectors
      const insInterest = db.prepare(`
        INSERT OR IGNORE INTO cdes_student_interest_vectors (
          id, student_id, domain_key, explicit_weight, inferred_weight, composite_score, last_interaction_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insInterest.run('int-1', 'usr-student-01', 'Distributed Systems & Cloud Computing', 0.95, 0.92, 0.935, now, now);
      insInterest.run('int-2', 'usr-student-01', 'Applied Neural Networks & Khmer NLP', 0.88, 0.91, 0.895, now, now);
      insInterest.run('int-3', 'usr-student-01', 'Projectile Kinematics & Mechanics', 0.85, 0.84, 0.845, now, now);
      insInterest.run('int-4', 'usr-student-01', 'Khmer Hydraulic Engineering (Angkorian Baray Systems)', 0.90, 0.86, 0.880, now, now);

      // Student Behavioral Telemetry
      const insBeh = db.prepare(`
        INSERT OR IGNORE INTO cdes_student_behavioral_telemetry (
          id, student_id, session_id, concept_id, dwell_time_sec, hesitation_latency_sec,
          hint_requests_count, error_attempts_count, completion_status, persistence_score, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insBeh.run('beh-1', 'usr-student-01', 'sess-001', 'concept-projectile-kinematics', 1420, 18, 1, 1, 'mastered_with_hints', 0.94, now);
      insBeh.run('beh-2', 'usr-student-01', 'sess-002', 'concept-calculus-derivatives', 980, 12, 0, 0, 'mastered_first_try', 0.98, now);
      insBeh.run('beh-3', 'usr-student-01', 'sess-003', 'concept-baray-hydraulics', 1850, 24, 2, 1, 'completed', 0.91, now);

      // Student Learning Pattern
      db.prepare(`
        INSERT OR IGNORE INTO cdes_student_learning_patterns (
          student_id, chronotype_peak, avg_session_duration_min, cognitive_stamina_half_life_min,
          preferred_modality, error_recovery_velocity, consistency_streak_days, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'usr-student-01', 'Morning Prime (06:00 - 10:30)', 48, 55,
        'Mathematical Rigor & Visual Vector Fields', 0.89, 21, now
      );

      // Student Achievements
      const insAch = db.prepare(`
        INSERT OR IGNORE INTO cdes_student_achievements (
          id, student_id, achievement_type, title, issuing_body, date_earned,
          verified_proof_hash, credential_tier, metadata_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insAch.run('ach-1', 'usr-student-01', 'Olympiad Medal', 'Silver Medal - Cambodia National High School Mathematics Olympiad', 'MoEYS Department of General Secondary Education', '2025-12-18', 'hash-moeys-math-olympiad-silver-2025', 'National Tier 1', JSON.stringify({ score: 94, rank: 2 }), now);
      insAch.run('ach-2', 'usr-student-01', 'Academic Mock Exam', 'Grade A Simulation (Score: 482 / 500) - Bac II Pre-Board Exam', 'New Generation School Directorate', '2026-08-14', 'hash-ngs-bac2-mock-aug2026', 'Institutional Flagship', JSON.stringify({ math: 100, physics: 98, khmer: 92 }), now);

      // Student Projects
      const insProj = db.prepare(`
        INSERT OR IGNORE INTO cdes_student_projects (
          id, student_id, title, category, description, repository_url, live_demo_url,
          rubric_score, skills_demonstrated_json, verified_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insProj.run(
        'proj-1', 'usr-student-01', 'Angkorian Baray Reservoir Automated Hydraulic Simulation', 'Civil & AI Simulation',
        'Mathematical fluid dynamics model simulating the water retention capacity of the East and West Baray during dry and monsoon seasons.',
        'https://github.com/dara-chan/angkor-baray-hydro-sim', 'https://baray-sim.cdes.edu.kh',
        96.5, JSON.stringify(['Python NumPy / SciPy', 'Differential Equations', 'GIS Satellite Bathymetry', 'Hydrology']),
        now, now
      );
      insProj.run(
        'proj-2', 'usr-student-01', 'Khmer OCR Optical Character Recognizer for Palm Leaf Manuscripts', 'Computer Vision & Heritage',
        'Deep convolutional neural network trained on digitized Buddhist Institute archival palm leaf manuscripts (Sastra Sleuk Rith).',
        'https://github.com/dara-chan/khmer-palm-leaf-ocr', 'https://sastra-ocr.cdes.edu.kh',
        98.0, JSON.stringify(['PyTorch Vision', 'Transfer Learning', 'Khmer Character Tokenizer', 'OpenCV']),
        now, now
      );

      // Governance Consents
      db.prepare(`
        INSERT OR IGNORE INTO cdes_data_governance_consents (
          consent_id, student_id, consent_scope, is_minor, parent_guardian_approved,
          school_administrator_approved, allowed_for_personalization, allowed_for_research_aggregates,
          granted_at, expires_at, revoked_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'cons-usr-01', 'usr-student-01', 'Comprehensive Education Personalization & Sovereign Research',
        1, 1, 1, 1, 1, now, '2027-09-01', null
      );
    }

    // 8. ML Models Registry
    const mlCount = (db.prepare('SELECT COUNT(*) as c FROM cdes_ml_models_registry').get() as { c: number })?.c || 0;
    if (mlCount === 0) {
      const insML = db.prepare(`
        INSERT OR IGNORE INTO cdes_ml_models_registry (
          model_id, model_name, task_type, framework, algorithm, version, accuracy_score,
          f1_or_rmse, parameters_json, training_dataset_size, deployment_status, registered_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const m of initialMLModelsRegistry) {
        insML.run(
          m.model_id, m.model_name, m.task_type, m.framework, m.algorithm, m.version,
          m.accuracy_score, m.f1_or_rmse, m.parameters_json, m.training_dataset_size,
          m.deployment_status, now
        );
      }
    }

    // 9. Feature Store Online
    const fsCount = (db.prepare("SELECT COUNT(*) as c FROM cdes_feature_store_online WHERE entity_id = 'usr-student-01'").get() as { c: number })?.c || 0;
    if (fsCount === 0) {
      const insFS = db.prepare(`
        INSERT OR IGNORE INTO cdes_feature_store_online (
          entity_id, feature_group, feature_key, feature_value_json, ttl_seconds, last_updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);
      insFS.run('usr-student-01', 'mastery_state', 'stem_composite_vector', JSON.stringify({ math: 0.96, physics: 0.94, chemistry: 0.88, logic: 0.92 }), 86400, now);
      insFS.run('usr-student-01', 'cognitive_state', 'realtime_cognitive_load_index', JSON.stringify({ current_load: 0.42, threshold: 0.75, fatigue_level: 'optimal' }), 3600, now);
      insFS.run('usr-student-01', 'recommendation_weights', 'active_context_weights', JSON.stringify({ exploration_beta: 0.15, scholarship_urgency: 0.92, rigor_preference: 0.88 }), 86400, now);
    }

    // 10. Closed-Loop Improvement Loop
    const loopCount = (db.prepare('SELECT COUNT(*) as c FROM cdes_recommendation_improvement_loop').get() as { c: number })?.c || 0;
    if (loopCount === 0) {
      const insLoop = db.prepare(`
        INSERT OR IGNORE INTO cdes_recommendation_improvement_loop (
          loop_id, student_id, recommendation_type, candidate_id, candidate_title, confidence_score,
          impression_at, action_taken, action_at, time_to_action_sec, outcome_metric_name,
          baseline_metric_value, post_outcome_metric_value, outcome_delta, attribution_weight,
          algorithm_version, feedback_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insLoop.run('loop-01', 'usr-student-01', 'university_program', 'CADT-SE', 'CADT Bachelor of Software Engineering', 0.97, '2026-09-01T08:00:00Z', 'applied', '2026-09-01T08:04:12Z', 252, 'entrance_exam_mock_readiness', 82.0, 94.5, 12.5, 1.0, 'v3.1.0', 'incorporated');
      insLoop.run('loop-02', 'usr-student-01', 'scholarship_application', 'MPTC-TECHO-2026', 'Techo Digital Talent National Scholarship', 0.99, '2026-09-02T10:15:00Z', 'saved', '2026-09-02T10:16:30Z', 90, 'portfolio_completeness_pct', 65.0, 92.0, 27.0, 1.0, 'v3.1.0', 'incorporated');
      insLoop.run('loop-03', 'usr-student-01', 'learning_drill', 'concept-projectile-kinematics', 'ZPD Scaffolding Drill: Trajectory Parabolic Proof', 0.94, '2026-09-05T14:30:00Z', 'completed', '2026-09-05T14:52:00Z', 1320, 'physics_mastery_probability', 0.74, 0.95, 0.21, 1.0, 'v3.1.0', 'incorporated');
    }

    // 11. Data Quality Scorecards
    const dqCount = (db.prepare('SELECT COUNT(*) as c FROM cdes_data_quality_scorecards').get() as { c: number })?.c || 0;
    if (dqCount === 0) {
      const insDQ = db.prepare(`
        INSERT OR IGNORE INTO cdes_data_quality_scorecards (
          scorecard_id, dataset_name, completeness_pct, freshness_sla_met, accuracy_pct,
          consistency_pct, uniqueness_pct, overall_health_grade, critical_issues_count,
          audit_summary_json, audited_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insDQ.run('dq-01', 'cdes_universities_lake', 99.4, 1, 98.8, 99.2, 100.0, 'A+', 0, JSON.stringify({ verified_institutions: 6, sync_source: 'MoEYS / ACC Registry' }), now);
      insDQ.run('dq-02', 'cdes_scholarships_lake', 98.2, 1, 99.0, 97.5, 100.0, 'A', 0, JSON.stringify({ verified_scholarships: 4, annual_audited_quotas: 3830 }), now);
      insDQ.run('dq-03', 'cdes_careers_lake', 97.5, 1, 96.5, 98.0, 100.0, 'A', 0, JSON.stringify({ labor_market_sync: 'National Employment Agency / ILO' }), now);
      insDQ.run('dq-04', 'cdes_student_behavioral_telemetry', 99.8, 1, 99.4, 99.1, 99.9, 'A+', 0, JSON.stringify({ outlier_truncation: 'Applied (max dwell 7200s)', missing_timestamps: 0 }), now);
    }
  }
}

