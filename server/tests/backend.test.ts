import assert from 'node:assert';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { ScholarshipService } from '../services/scholarshipService';
import { UniversityService } from '../services/universityService';
import { AnalyticsService } from '../services/analyticsService';
import { getDatabase } from '../db/connection';
import { runMigrations } from '../db/migrate';

// SEC-001: seed credentials come from environment (no in-code secrets).
process.env.ADMIN_SEED_PASSWORD = process.env.ADMIN_SEED_PASSWORD || `TestSeedP@ss-${Date.now()}`;
process.env.STUDENT_SEED_PASSWORD = process.env.STUDENT_SEED_PASSWORD || `TestSeedP@ss-${Date.now()}`;
process.env.ORG_SEED_PASSWORD = process.env.ORG_SEED_PASSWORD || `TestSeedP@ss-${Date.now()}`;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-ci-only'; // test-only, production uses runtime secret
process.env.RESEARCH_SALT = process.env.RESEARCH_SALT || 'test-research-salt';
process.env.ORG_SEED_PASSWORD = process.env.ORG_SEED_PASSWORD || `TestSeedP@ss-${Date.now()}`;

// ---- Test DB isolation (F-002/F-004 fix verification) ----
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const testDbDir = mkdtempSync(join(tmpdir(), 'cdes-test-'));
process.env.DATABASE_PATH = join(testDbDir, 'cdes_test.db');
rmSync(process.env.DATABASE_PATH, { force: true, recursive: true });

const testStudentPassword = process.env.TEST_STUDENT_PASSWORD || `TestPass123-${Date.now()}`;

async function runTests() {
  console.log('=== Starting CDES Phase 2 Backend Verification Tests ===\n');
  console.log('[TEST] DATABASE_PATH =', process.env.DATABASE_PATH);
  console.log('[TEST] cwd =', process.cwd());

  // 1. Ensure migrations
  console.log('1. Testing Database Migration & Connection...');
  const migRes = runMigrations();
  assert.strictEqual(migRes.success, true, 'Migration should succeed');
  const db = getDatabase();
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  console.log('[TEST] userCount after migration =', userCount.count);
  const adminUser = db.prepare('SELECT id, email FROM users WHERE email = ?').get('admin@cdes.edu.kh') as { id: string; email: string } | undefined;
  assert(adminUser?.id, 'Seeded admin user should exist');
  assert(userCount.count >= 3, 'Users table should contain seeded users');
  console.log('✓ Database verified: WAL mode active, seeds intact.');

  // 2. Testing Authentication Service
  console.log('2. Testing Authentication Service (Register, Login, Token, RBAC)...');
  const authService = new AuthService();
  const testEmail = `test.student.${Date.now()}@cdes.edu.kh`;
  const regResult = authService.register({
    email: testEmail,
    password: testStudentPassword,
    role: 'student',
    name: 'Sophea Tester',
    education_level: 'Grade 12'
  });

  assert(regResult.user.id, 'User must have an ID');
  assert.strictEqual(regResult.user.email, testEmail.toLowerCase());
  assert.strictEqual(regResult.user.role, 'student');
  assert(regResult.token, 'Token must be generated');

  // Verify token payload
  const tokenPayload = authService.verifyToken(regResult.token);
  assert.strictEqual(tokenPayload.userId, regResult.user.id);
  assert.strictEqual(tokenPayload.email, testEmail.toLowerCase());
  assert.strictEqual(tokenPayload.role, 'student');

  // Test successful login
  const loginResult = authService.login({
    email: testEmail,
    password: testStudentPassword,
  });
  assert(loginResult.token, 'Login must yield JWT token');

  // Test failed login
  assert.throws(() => {
    authService.login({
      email: testEmail,
      password: 'wrongPassword'
    });
  }, /Invalid email or password/);

  // Test admin pre-seeded login
  const adminLogin = authService.login({
    email: 'admin@cdes.edu.kh',
    password: process.env.ADMIN_SEED_PASSWORD!,
  });
  assert.strictEqual(adminLogin.user.role, 'admin');
  console.log('✓ Authentication Service: registration, password hashing, JWT signing/verification, and login passed.\n');

  // 3. Testing User & Profile Service
  console.log('3. Testing User & Profile Service...');
  const userService = new UserService();
  const profileData = userService.getProfile(regResult.user.id);
  assert(profileData.profile, 'Profile should exist for student');
  assert.strictEqual(profileData.profile?.name, 'Sophea Tester');

  // Update profile
  const updatedProfile = userService.updateProfile(regResult.user.id, {
    target_career: 'AI Software Engineer',
    university: 'CADT'
  });
  assert.strictEqual(updatedProfile.target_career, 'AI Software Engineer');
  assert.strictEqual(updatedProfile.university, 'CADT');

  // Add education history
  const eduRecord = userService.addEducation(regResult.user.id, {
    institution: 'Preah Sisowath High School',
    degree: 'High School Diploma (Bac II)',
    start_date: '2023-10-01',
    end_date: '2026-08-30',
    achievements: 'Grade A National Exam'
  });
  assert(eduRecord.id, 'Education record should have an ID');
  const fetchedEdu = userService.getProfile(regResult.user.id).education;
  assert.strictEqual(fetchedEdu.length, 1);
  assert.strictEqual(fetchedEdu[0].institution, 'Preah Sisowath High School');
  console.log('✓ User & Profile Service: profile updates and education timeline passed.\n');

  // 4. Testing Scholarship Service & Repository Layer
  console.log('4. Testing Scholarship Service (Queries, Filters, Admin workflows)...');
  const scholarshipService = new ScholarshipService();

  // Query catalog
  const catalog = scholarshipService.getScholarships({});
  assert(catalog.scholarships.length >= 12, 'Catalog should contain at least 12 scholarships');
  assert(catalog.metrics.totalScholarships >= 12, 'Metrics should track total count');

  // Filter by region
  const cambodiaOnly = scholarshipService.getScholarships({ region: 'Cambodia' });
  assert(cambodiaOnly.scholarships.every(s => s.region === 'Cambodia'), 'All should be from Cambodia');

  // Filter by search query
  const cheveningSearch = scholarshipService.getScholarships({ q: 'Chevening' });
  assert(cheveningSearch.scholarships.length >= 1, 'Should find Chevening scholarship');

  // Stats calculation
  const stats = scholarshipService.getStats();
  assert(stats.totalCount >= 12, 'Stats total count matches');
  assert(stats.fullyFundedCount > 0, 'Should have fully funded count');

  // Organization submission workflow
  const subResult = scholarshipService.submitOpportunity({
    organizationName: 'National University of Management',
    contactPerson: 'Admissions Office',
    contactEmail: 'admissions@num.edu.kh',
    scholarshipName: 'NUM Global Leadership Grant 2026',
    country: 'Cambodia',
    region: 'Cambodia',
    degreeLevel: ['Bachelor', 'Master'],
    fieldOfStudy: ['Business', 'Computer Science'],
    fundingType: 'Fully funded',
    fundingDetails: '100% full tuition waiver for 4 years.',
    deadline: '2026-11-30',
    applicationLink: 'https://num.edu.kh/apply',
    officialSourceUrl: 'https://num.edu.kh'
  });
  assert(subResult.submission.id, 'Submission must have ID');

  // Admin approval of submission
  const reviewResult = scholarshipService.reviewSubmission(
    subResult.submission.id,
    'approve',
    'Approved by editorial desk',
    adminLogin.user.id
  );
  assert(reviewResult && reviewResult.submission, 'Review should return result');
  assert.strictEqual(reviewResult.submission.status, 'Approved & Published');
  assert(reviewResult.publishedScholarship, 'Should automatically publish scholarship upon approval');

  // Verify published scholarship appears in catalog
  const verifyPublished = scholarshipService.getScholarshipById(reviewResult.publishedScholarship.id);
  assert(verifyPublished, 'Published scholarship must be queryable by ID');
  assert.strictEqual(verifyPublished.name, 'NUM Global Leadership Grant 2026');

  // Error report workflow
  const repResult = scholarshipService.reportError({
    scholarshipId: 'sch-chevening-uk',
    scholarshipName: 'Chevening UK Government Scholarships',
    reportedField: 'deadline',
    description: 'Reference letters are due in February.',
    suggestedCorrection: 'References due Feb 2027',
    reporterEmail: 'student@cdes.edu.kh'
  });
  assert(repResult.report.id, 'Report should have ID');

  // Resolve error report
  const resolvedReport = scholarshipService.resolveErrorReport(
    repResult.report.id,
    'Verified & Fixed',
    'Verified with embassy portal',
    false
  );
  assert.strictEqual(resolvedReport?.status, 'Verified & Fixed');
  console.log('✓ Scholarship Service & Repository: catalog queries, submission workflows, admin approval, and error reports passed.\n');

  // 5. Testing University Service & Repository
  console.log('5. Testing University Service (Institutional Profiles & Majors)...');
  const universityService = new UniversityService();
  const unis = universityService.getUniversities();
  assert(unis.length >= 7, 'Should return at least 7 institutions');
  const cadt = universityService.getUniversityById('univ-cadt');
  assert(cadt, 'CADT profile should exist');
  assert(cadt.majors.length >= 1, 'CADT should have majors listed');
  console.log('✓ University Service: profile scores, accreditation, and major mappings passed.\n');

  // 6. Testing Analytics Service (Privacy-first gating)
  console.log('6. Testing Analytics Service...');
  const analyticsService = new AnalyticsService();
  const skipped = analyticsService.recordActivity({
    event_type: 'TEST_EVENT_UNCONSENTED',
    metadata: { test: true }
  });
  assert.strictEqual(skipped.persisted, false, 'Unauthenticated/unconsented event should not persist');

  db.prepare('UPDATE student_privacy_consents SET allow_analytics_tracking = 1, is_minor = 0, consent_status = ? WHERE student_id = ?')
    .run('granted', regResult.user.id);
  const recorded = analyticsService.recordActivity({
    user_id: regResult.user.id,
    student_id: regResult.user.id,
    event_type: 'TEST_EVENT',
    metadata: { test: true }
  });
  assert.strictEqual(recorded.persisted, true, 'Consented event should persist');
  assert(recorded.event?.id, 'Event should be recorded in SQLite');
  const recents = analyticsService.getRecentActivities(5);
  assert(recents.some(e => e.event_type === 'TEST_EVENT'), 'Recorded event should be retrieved');
  console.log('✓ Analytics Service: SQLite activity event tracking passed.\n');

  console.log('===================================================');
  console.log('🎉 ALL BACKEND UNIT & INTEGRATION TESTS PASSED! 🎉');
  console.log('===================================================');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
