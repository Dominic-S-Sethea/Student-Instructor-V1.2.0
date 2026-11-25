import bcrypt from 'bcryptjs';
import { TrackedDatabase } from './metrics';
import { demoStudentSeed as initialStudentProfile } from '../../shared/data/demoStudentSeed';
import { initialStudentMasteryStates, initialMisconceptionLogs } from '../data/researchSeed';

export interface DemoSeedOptions {
  strictPasswords?: boolean;
}

function validateSeedPassword(value: string | undefined): string | null {
  if (!value || value.trim().length < 8) {
    return null;
  }
  return value;
}

/**
 * Seed explicit demo/test accounts and sample student activity.
 * Never invoked in production/staging, and refuses empty password hashes.
 */
export function seedDemoData(db: TrackedDatabase, options: DemoSeedOptions = {}): boolean {
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv === 'production' || nodeEnv === 'staging') {
    throw new Error(`Refusing to seed demo accounts in NODE_ENV=${nodeEnv}.`);
  }

  const adminPw = validateSeedPassword(process.env.ADMIN_SEED_PASSWORD);
  const studentPw = validateSeedPassword(process.env.STUDENT_SEED_PASSWORD);
  const orgPw = validateSeedPassword(process.env.ORG_SEED_PASSWORD);

  if (!adminPw || !studentPw || !orgPw) {
    const msg =
      'Demo seeding skipped: ADMIN_SEED_PASSWORD, STUDENT_SEED_PASSWORD, and ORG_SEED_PASSWORD (min 8 chars) must all be set.';
    if (options.strictPasswords) {
      throw new Error(msg);
    }
    console.warn(msg);
    return false;
  }

  const now = new Date().toISOString();
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertUser.run('usr-admin-01', 'admin@cdes.edu.kh', bcrypt.hashSync(adminPw, 10), 'admin', 'active', now, now);
    insertUser.run('usr-student-01', 'student@cdes.edu.kh', bcrypt.hashSync(studentPw, 10), 'student', 'active', now, now);
    insertUser.run('usr-org-paragon-01', 'admissions@paragoniu.edu.kh', bcrypt.hashSync(orgPw, 10), 'organization', 'active', now, now);

    const studentProfileId = initialStudentProfile.id || 'stu-sreypov-01';
    db.prepare(`
      INSERT INTO student_profiles (
        id, user_id, name, date_of_birth, education_level, school, university, major,
        graduation_year, language, location, target_career, interests, favorite_subjects, goals, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      studentProfileId, 'usr-student-01', initialStudentProfile.name, '2008-04-15',
      initialStudentProfile.educationLevel, initialStudentProfile.school,
      'Cambodia Academy of Digital Technology (CADT)', initialStudentProfile.targetMajor,
      2026, 'km', initialStudentProfile.location, initialStudentProfile.targetCareer,
      JSON.stringify(initialStudentProfile.interests || []),
      JSON.stringify(initialStudentProfile.favoriteSubjects || []),
      initialStudentProfile.goals, now, now
    );

    db.prepare(`
      INSERT INTO education_history (id, student_id, institution, degree, start_date, end_date, achievements)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'edu-01', studentProfileId, initialStudentProfile.school || 'Preah Sisowath High School',
      'High School Bac II Science Track', '2023-10-01', '2026-08-30',
      'Top 5% in National Mathematics Olympiad Mock'
    );
  }

  seedDemoSubmissionsAndReports(db, now);
  seedDemoStudentTelemetry(db, now);
  return true;
}

function seedDemoSubmissionsAndReports(db: TrackedDatabase, now: string): void {
  if ((db.prepare('SELECT COUNT(*) as count FROM organization_submissions').get() as { count: number }).count === 0) {
    const orgUser = db
      .prepare("SELECT id FROM users WHERE id = 'usr-org-paragon-01'")
      .get() as { id?: string } | undefined;
    const insSub = db.prepare(`
      INSERT INTO organization_submissions (
        id, organization_name, contact_person, contact_email, official_website, scholarship_name,
        scholarship_name_km, country, region, degree_level, field_of_study, funding_type,
        funding_details, eligibility_summary, deadline, application_link, official_source_url,
        status, submitted_by_user_id, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insSub.run(
      'sub-paragon-2026', 'Paragon International University', 'Admissions & International Office',
      'admissions@paragoniu.edu.kh', 'https://paragoniu.edu.kh',
      'Paragon IU President Excellence Scholarship', 'អាហារូបករណ៍ឧត្តមភាពប្រធានសាកលវិទ្យាល័យប៉ារ៉ាហ្គន',
      'Cambodia', 'Cambodia', JSON.stringify(['Bachelor']), JSON.stringify(['Computer Science', 'Engineering', 'Business']),
      'Fully funded', '100% full 4-year tuition fee waiver for top 50 scorers.',
      'High school graduates with Bac II Grade A/B.', '2026-10-20',
      'https://paragoniu.edu.kh/scholarship-exam/', 'https://paragoniu.edu.kh/scholarship-exam/',
      'Pending Admin Review', orgUser?.id ?? null, now
    );
  }

  if ((db.prepare('SELECT COUNT(*) as count FROM user_error_reports').get() as { count: number }).count === 0) {
    db.prepare(`
      INSERT INTO user_error_reports (
        id, scholarship_id, scholarship_name, reported_field, description, suggested_correction,
        official_source_url, reporter_email, status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'rep-1', 'sch-chevening-uk', 'Chevening UK Government Scholarships', 'deadline',
      'Reference letters are due slightly later than initial submission.',
      'Application closes Nov 4; references due mid-February.',
      'https://www.chevening.org/scholarship/cambodia/', 'student@cdes.edu.kh', 'Pending Review', now
    );
  }
}

function seedDemoStudentTelemetry(db: TrackedDatabase, now: string): void {
  const demoExists = db.prepare("SELECT id FROM users WHERE id = 'usr-student-01'").get();
  if (!demoExists) return;

  if ((db.prepare("SELECT COUNT(*) as c FROM student_privacy_consents WHERE student_id = 'usr-student-01'").get() as { c: number }).c === 0) {
    db.prepare(`
      INSERT INTO student_privacy_consents (
        student_id, is_minor, parental_consent_verified, parent_email,
        allow_analytics_tracking, allow_research_inclusion, allow_ai_memory,
        consent_status, parent_verification_status, anonymized_research_id, consent_date, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('usr-student-01', 1, 0, null, 0, 0, 0, 'pending', 'unverified', 'anon-std-demo-01', now, now);
  }

  db.prepare(`
    INSERT OR IGNORE INTO cdes_data_governance_consents (
      consent_id, student_id, consent_scope, is_minor, parent_guardian_approved,
      school_administrator_approved, allowed_for_personalization, allowed_for_research_aggregates,
      granted_at, expires_at, revoked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('cons-usr-01', 'usr-student-01', 'Pilot Consent Scope', 1, 0, 0, 0, 0, now, '2027-09-01', null);

  if ((db.prepare('SELECT COUNT(*) as c FROM learning_events').get() as { c: number }).c === 0) {
    db.prepare(`INSERT INTO learning_events (id, student_id, user_id, content_id, action, score, time_spent, difficulty, performance, metadata, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run('lrn-01', 'usr-student-01', 'usr-student-01', 'cs-algo-sorting', 'lesson_completed', 92, 240, 'intermediate', 'proficient', '{}', now);
  }

  if ((db.prepare('SELECT COUNT(*) as c FROM activity_events').get() as { c: number }).c === 0) {
    db.prepare(`INSERT INTO activity_events (id, student_id, user_id, session_id, event_type, timestamp, duration, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run('act-01', 'usr-student-01', 'usr-student-01', 'sess-01', 'login', now, 0, '{}');
  }

  if ((db.prepare('SELECT COUNT(*) as c FROM student_mastery_states').get() as { c: number }).c === 0) {
    const insMastery = db.prepare(`INSERT OR IGNORE INTO student_mastery_states (id, student_id, concept_id, concept_name, subject, prior_mastery_p_l0, transition_prob_p_t, guess_prob_p_g, slip_prob_p_s, current_mastery_prob, mastery_status, total_opportunities, correct_streak, last_practiced_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const m of initialStudentMasteryStates) {
      insMastery.run(m.id, m.student_id, m.concept_id, m.concept_name, m.subject, m.prior_mastery_p_l0, m.transition_prob_p_t, m.guess_prob_p_g, m.slip_prob_p_s, m.current_mastery_prob, m.mastery_status, m.total_opportunities, m.correct_streak, m.last_practiced_at, now);
    }
  }

  if ((db.prepare('SELECT COUNT(*) as c FROM misconception_logs').get() as { c: number }).c === 0) {
    const insMisc = db.prepare(`INSERT OR IGNORE INTO misconception_logs (id, student_id, subject, topic, misconception_code, misconception_title, error_taxonomy, context_details, suggested_intervention, resolved, logged_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const mi of initialMisconceptionLogs) {
      insMisc.run(mi.id, mi.student_id, mi.subject, mi.topic, mi.misconception_code, mi.misconception_title, mi.error_taxonomy, mi.context_details, mi.suggested_intervention, mi.resolved, mi.logged_at);
    }
  }
}
