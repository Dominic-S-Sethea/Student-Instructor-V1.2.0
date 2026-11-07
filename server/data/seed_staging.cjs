// server/data/seed_staging.cjs
// Seeds 10,000 student profiles + representative telemetry into a staging DB.
// Staging-only. Does NOT change git, does NOT run migrations, does NOT touch production.
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..', '..');
const DB_PATH = process.env.DATABASE_PATH || path.join(ROOT, 'server', 'data', 'cdes_platform.staging.db');
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode=WAL;');
db.exec('PRAGMA synchronous=NORMAL;');

// Deterministic RNG (mulberry32)
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(0x12345678);
function pick(arr) { return arr[Math.floor(rng() * arr.length)]; }
function sample(arr, n) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}
function randInt(min, max) { return min + Math.floor(rng() * (max - min + 1)); }
function randDateStr() {
  const start = new Date(Date.UTC(2026, 3, 1, 0, 0, 0));
  const end = new Date(Date.UTC(2026, 9, 28, 0, 0, 0));
  return new Date(start.getTime() + rng() * (end.getTime() - start.getTime())).toISOString();
}
function randOldTs() {
  const start = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
  const end = new Date(Date.UTC(2026, 7, 31, 0, 0, 0));
  return new Date(start.getTime() + rng() * (end.getTime() - start.getTime())).toISOString();
}

const FIRST_NAMES = [ 'Sothea','Sreypov','Mey','Sokha','Vanny','Chhun','Ratanak','Dara','Sivutha','Kunthea','Syna','Narus','Chhanketh','Piseth','Sereyvann','Kimsan','Ouch','Lina','Mom','Thuon','Ry','Chhorn','Sokuntheara','Eng','Chantha','Nika','Tola','Pich','Somaly','Vathana','Sreytouch','Pichpong','Rina','Lindsey','Sarah','Emma','Liam','Noah','Aiden','Emma','Olivia','Ethan','Mia','Lucas','Charlotte','Amelia','Henry' ];
const LAST_NAMES = [ 'Sothea','Oum','Yim','Chhoun','Net','Khun','Lum','Chan','Oeurn','Hun','Rath','Pov','Kuntheang','Tep','Vann','Khmeng','Satt','Phou','Chhorn','Duch' ];
const educationLevels = [ 'Grade 9','Grade 10','Grade 11','Grade 12','Bac II','Vocational Diploma' ];
const degrees = [ 'Science','Arts','Engineering','IT & Communication','Business Administration','Education','Agriculture','Health Sciences' ];
const unis = [ 'Preah Sisovath High School','New Generation School','AUPP','ITC','RUPP','CADT','Paragon U','American University of Phnom Penh' ];
const majors = [ 'Computer Science','Software Engineering','Data Science','AI & ML','Cybersecurity','Civil Engineering','Mechanical Engineering','Business Admin','Accounting','Environmental Science','Biology','Pharmacy' ];
const targetCareers = [ 'Cloud & AI Systems Architect','Data Engineer','Cybersecurity Analyst','UX/UI Designer','Product Manager','Cloud Infrastructure Engineer','AI Research Engineer','Salesforce/CRM Consultant','DevOps Engineer','Technical Product Manager' ];
const locations = [ 'Phnom Penh','Siem Reap','Bat Dambang','Kampot','Kandal','Takeo','Sihanoukville','Kratie','Stung Treng','Mondulkiri','Pursat','Koh Kong','Preah Vihear','Oddar Meanchey','Ratanakiri','Banteay Meanchey' ];
const languages = [ 'km','km-en','km-fr','km-en-ks' ];

const BASE_SUBJECTS = [ 'sub-math','sub-physics','sub-chem','sub-bio','sub-cs','sub-eng','sub-biz','sub-life' ];
const BASE_ACTIVITIES = [ 'act-puzzle-logic','act-quiz-bac2','act-sim-sort','act-proj-water' ];
const BASE_EXPERIMENTS = [ 'exp-bio-01','exp-chem-01','exp-physics-01' ];
const genId = (prefix) => `${prefix}-${randInt(1000,9999)}`;

const prep = (sql) => db.prepare(sql);
const insertUser = prep(`INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, 'student', 'active', ?, ?)`);
const insertProfile = prep(`INSERT INTO student_profiles (id, user_id, name, education_level, school, university, major, graduation_year, language, location, target_career, interests, favorite_subjects, goals, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insertActivityProgress = prep(`INSERT INTO student_activity_progress (id, student_id, activity_id, status, score, attempts, hint_used_count, response_data, completed_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insertLabResult = prep(`INSERT INTO lab_experiment_results (id, student_id, experiment_id, status, attempts_count, actions_log, parameters_used, observation_notes, outcome_data, score, completed_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insertLearningHistory = prep(`INSERT INTO student_learning_history (id, student_id, entity_type, entity_id, title, subject, action, score, time_spent_seconds, performance_rating, strengths_observed, weaknesses_observed, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insertConversation = prep(`INSERT INTO ai_conversations (id, user_id, session_title, message, response, suggested_majors, suggested_skills, suggested_mentors, source_attribution, latency_ms, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insertActivityEvent = prep(`INSERT INTO activity_events (id, student_id, user_id, session_id, event_type, timestamp, duration, metadata, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insertLearningEvent = prep(`INSERT INTO learning_events (id, student_id, user_id, content_id, action, score, time_spent, difficulty, performance, metadata, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insertGameEvent = prep(`INSERT INTO game_events (id, student_id, user_id, game_id, level, attempt, success, failure_reason, time_taken, action, duration, result, score, metadata, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const insertAICompanionEvent = prep(`INSERT INTO ai_interaction_analytics_events (id, student_id, event_stage, agent_key, item_reference_id, details, timestamp) VALUES (?, ?, 'recommendation_delivered', 'education_advisor', ?, '{}', ?)`);
const insertAnalyticsStream = prep(`INSERT INTO cdes_analytics_events_stream (id, event_uuid, student_id, event_name, event_category, properties_json, client_timestamp, server_timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
const insertRecommendation = prep(`INSERT INTO ai_recommendation_events (id, student_id, recommendation_type, title, description, match_reason, target_entity_id, priority_score, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const N = 10000;
const seedBench = 'usr-bench-0001';

function baseIds() {
  const rows = db.prepare(`SELECT id FROM learning_activities ORDER BY id`).all().map(r => r.id);
  const expRows = db.prepare(`SELECT id FROM lab_experiments ORDER BY id`).all().map(r => r.id);
  return { activities: rows, experiments: expRows };
}
let { activities: ACTIVITIES, experiments: EXPERIMENTS } = baseIds();

// Ensure enough activities exist (base had only 4; need ~16 per student)
if (ACTIVITIES.length < 32) {
  const insertAct = prep(`INSERT INTO learning_activities (id, title, title_km, activity_type, subject_id, difficulty, learning_objective, instructions, activity_data, hint, reward_points, item_reward_id, badge_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const subjectPool = BASE_SUBJECTS.slice();
  const startId = ACTIVITIES.length + 1;
  for (let i = startId; i <= 400; i++) {
    const id = `act-${i}`;
    const subject = pick(subjectPool);
    const types = [ 'puzzle','quiz','simulation','challenge','project' ];
    const title = `${pick(['Micro-lab','Drill','Sim','Project','Quest'])} #${i}`;
    insertAct.run(
      id, title, '', pick(types), subject, pick(['beginner','intermediate','advanced']),
      title, title, '{}', '', 25, null, null, '2026-05-01T00:00:00Z'
    );
  }
  const refreshed = baseIds();
  ACTIVITIES = refreshed.activities;
  EXPERIMENTS = refreshed.experiments;
}

console.log(`[seed] staging DB: ${DB_PATH}`);
console.log(`[seed] activities: ${ACTIVITIES.length}, experiments: ${EXPERIMENTS.length}, students: ${N}`);

const totalRows = { profile: 0, progress: 0, lab: 0, history: 0, conversation: 0, activity: 0, learning: 0, game: 0, aiEvent: 0, stream: 0, rec: 0 };

db.exec('BEGIN TRANSACTION;');
try {
  for (let i = 1; i <= N; i++) {
    const uid = `usr-${i.toString().padStart(4, '0')}`;
    const isBench = (uid === seedBench);
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const name = `${firstName} ${lastName} ${i}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@cdes.edu.kh`;
    const education_level = pick(educationLevels);
    const school = pick(unis);
    const uni = pick(unis);
    const major = pick(majors);
    const location = pick(locations);
    const targetCareer = pick(targetCareers);
    const interests = JSON.stringify(sample(BASE_SUBJECTS.concat(['ai','robotics','energy','health']), randInt(1,4)));
    const favSubjects = JSON.stringify(sample(BASE_SUBJECTS, randInt(2,4)));
    const nowIso = new Date().toISOString();

    insertUser.run(uid, email, `dummyhash-${i}`, nowIso, nowIso);
    insertProfile.run(uid + '-' + i, uid, name, education_level, school, uni, major, 2026, pick(languages), location, targetCareer, interests, favSubjects, '{}', nowIso, nowIso);
    totalRows.profile++;

    // PROGRESS: 12-16 distinct activities each
    const cnt = 12 + randInt(0, 4);
    const chosen = sample(ACTIVITIES, Math.min(cnt, ACTIVITIES.length));
    for (const aid of chosen) {
      const status = pick(['completed','completed','completed','in_progress','started','completed']);
      const score = pick([85, 90, 78, 92, 88, 95, 80, 87, 75, 93]);
      insertActivityProgress.run(uid + '-prog-' + aid, uid, aid, status, score, 1, 0, '{"logic_output":1}', null, nowIso);
    }
    totalRows.progress += cnt;

    // LAB results: 6-8 (simulated)
    const lc = 6 + randInt(0, 2);
    for (let k = 0; k < lc; k++) {
      const exp = pick(EXPERIMENTS);
      insertLabResult.run(uid + '-res-' + exp + '-' + k, uid, exp, 'completed', 1, '[]', '{}', null, '{}', 90, nowIso, nowIso);
    }
    totalRows.lab += lc;

    // LEARNING history: 40-50 per student
    const hc = 40 + randInt(0, 10);
    const types = [ 'content','activity','experiment','quiz','path' ];
    const titles = [ 'Opened Micro-lab: Bio-Simulation','Completed Bac II Calculus Drill','Experiment: Titration Endpoint','Quiz: Logic Gates','Path: CS Foundations' ];
    for (let k = 0; k < hc; k++) {
      const type = pick(types);
      const subj = pick(BASE_SUBJECTS);
      const entId = type === 'content' ? `cnt-${type}-${k}` : `ent-${type}-${k}`;
      const action = pick(['opened','started','completed','quiz_attempt','completed']);
      const score = type === 'quiz_attempt' ? randInt(55, 100) : null;
      const ts = randDateStr();
      insertLearningHistory.run(uid + '-hist-' + k, uid, type, entId, titles[k % titles.length], subj, action, score, randInt(30,300), score ? (score >= 80 ? 'excellent' : 'good') : 'good', '[]', '[]', ts);
    }
    totalRows.history += hc;

    // CONVERSATIONS only for benchmark student (>20 to hit LIMIT 20 boundary)
    if (isBench) {
      const cc = 12 + randInt(0, 12);
      for (let k = 0; k < cc; k++) {
        const msg = `Question about ${pick(['Scholarships','Major Choice','AI Career','Lab Safety','University'])}`;
        const resp = `Here is guidance on ${pick(['Scholarships','Major Choice','AI Career','Lab Safety','University'])}.`;
        insertConversation.run(uid + '-conv-' + k, uid, 'Educational Advising', msg, resp, '[]', '[]', '[]', 'gemini', 0, nowIso);
      }
      totalRows.conversation += cc;
    }

    // ACTIVITY events: ~70 per student (32% old -> needs archive)
    const ac = 70 + randInt(0, 15);
    for (let k = 0; k < ac; k++) {
      const eventType = pick(['profile_view','lesson_started','lesson_completed','quiz_attempt','experiment_started','experiment_completed','content_opened','page_visit','achievement_unlocked','recommendation_view']);
      const deletedAt = rng() < 0.32 ? randOldTs() : null;
      const sessionId = 'sess-' + uid.slice(-4) + '-' + k;
      insertActivityEvent.run(uid + '-act-' + k, uid, uid, sessionId, eventType, randDateStr(), 0, '{}', deletedAt);
    }
    totalRows.activity += ac;

    // LEARNING events: ~15 per student
    const lenc = 12 + randInt(0, 6);
    for (let k = 0; k < lenc; k++) {
      const contentId = `cnt-${pick(['bio','chem','math','physics','cs'])}-${k}`;
      insertLearningEvent.run(uid + '-learn-' + k, uid, uid, contentId, pick(['lesson_started','lesson_completed','quiz_attempt','experiment_started','content_opened']), randInt(40, 100), randInt(30,600), null, null, '{}', nowIso);
    }
    totalRows.learning += lenc;

    // GAME events: ~8 per student
    const gc = 6 + randInt(0, 4);
    for (let k = 0; k < gc; k++) {
      const gid = 'game-stem-' + randInt(1,5);
      insertGameEvent.run(uid + '-game-' + k, uid, uid, gid, 1, 1, 1, null, randInt(10,300), 'level_completed', randInt(10,300), 'SUCCESS', 95, '{}', nowIso);
    }
    totalRows.game += gc;

    // AI companion analytics: ~8 per student
    const acc = 6 + randInt(0, 4);
    for (let k = 0; k < acc; k++) {
      insertAICompanionEvent.run(uid + '-ai-' + k, uid, `item-${k}`, nowIso);
    }
    totalRows.aiEvent += acc;

    // ANALYTICS stream: ~60 per student
    const sc = 60 + randInt(0, 20);
    for (let k = 0; k < sc; k++) {
      insertAnalyticsStream.run(uid + '-stream-' + k, 'evt-' + Math.random().toString(36).slice(2,10), uid, 'profile_view', 'engagement', '{}', nowIso, nowIso);
    }
    totalRows.stream += sc;

    // RECOMMENDATIONS only for benchmark student (6 rows)
    if (isBench) {
      const types = [ 'learning','career','scholarship' ];
      const titles = [ 'Virtual STEM Lab: Snell\'s Law & Refraction Simulator','AI & Machine Learning Foundations','MPTC Digital Skill 100% Undergraduate Scholarship','Paragon IU President Excellence Full Scholarship','Embedded Robotics & AI Systems Engineering Pathway','Full-Stack Cloud & Software Architecture Pathway' ];
      for (let k = 0; k < 6; k++) {
        const type = pick(types);
        const title = titles[k % titles.length];
        const desc = 'Personalized recommendation for benchmark student (type=' + type + ').';
        const reason = 'Matched on demonstrated mastery and labor-market demand (priority 90+).';
        insertRecommendation.run(uid + '-rec-' + k, uid, type, title, desc, reason, 'ent-' + type + '-' + k, 90 + k * 2, 'given', nowIso, nowIso);
      }
      totalRows.rec += 6;
    }
  }


  // ---- Dedicated benchmark student (exercises all 5 hot queries) ----
  const benchUId = 'usr-bench-0001';
  const benchPid = 'stu-bench-0001';
  const benchIso = new Date().toISOString();
  insertUser.run(benchUId, benchUId.toLowerCase() + '@cdes.edu.kh', 'bench-dummy', benchIso, benchIso);
  insertProfile.run(benchPid, benchUId, 'Bench Benchington ' + benchUId, 'Grade 12', 'CADT', 'CADT', 'Computer Science', 2026, 'km', 'Phnom Penh', 'Cloud & AI Systems Architect', JSON.stringify(sample(BASE_SUBJECTS, 3)), JSON.stringify(sample(BASE_SUBJECTS, 3)), '{}', benchIso, benchIso);

  const benchActs = sample(ACTIVITIES, 20);
  benchActs.forEach((aid, ki) => {
    insertActivityProgress.run(benchPid + '-prog-' + aid, benchUId, aid, 'completed', 88 + (ki % 12), 1, 0, '{}', null, benchIso);
  });
  for (let k = 0; k < 12; k++) {
    insertLabResult.run(benchPid + '-lab-' + k, benchUId, pick(EXPERIMENTS), 'completed', 1, '[]', '{}', null, '{}', 90, benchIso, benchIso);
  }
  for (let k = 0; k < 50; k++) {
    insertLearningHistory.run(benchPid + '-hist-' + k, benchUId, pick(['content','activity','experiment','quiz']), 'e-' + k, 'Benchmark content ' + k, pick(BASE_SUBJECTS), pick(['opened','started','completed','quiz_attempt']), k % 5 === 0 ? 90 : null, 120, 'excellent', '[]', '[]', benchIso);
  }
  for (let k = 0; k < 24; k++) {
    insertConversation.run(benchPid + '-conv-' + k, benchUId, 'Educational Advising', 'Question ' + k, 'Answer ' + k, '[]', '[]', '[]', 'gemini', 0, benchIso);
  }
  for (let k = 0; k < 80; k++) {
    insertActivityEvent.run(benchPid + '-act-' + k, benchUId, benchUId, 'sess-bench-' + k, pick(['profile_view','lesson_started','lesson_completed','quiz_attempt','experiment_started','experiment_completed','content_opened','page_visit']), randDateStr(), 0, '{}', rng() < 0.32 ? randOldTs() : null);
  }
  for (let k = 0; k < 15; k++) {
    insertLearningEvent.run(benchPid + '-learn-' + k, benchUId, benchUId, 'cnt-' + k, pick(['lesson_started','lesson_completed','quiz_attempt']), 88, 300, null, null, '{}', benchIso);
  }
  for (let k = 0; k < 8; k++) {
    insertGameEvent.run(benchPid + '-game-' + k, benchUId, benchUId, 'game-stem-1', 1, 1, 1, null, 60, 'level_completed', 60, 'SUCCESS', 95, '{}', benchIso);
  }
  const benchTypes = ['learning','career','scholarship'];
  const benchTitles = ["Virtual STEM Lab: Snell's Law & Refraction Simulator","AI & Machine Learning Foundations","MPTC Digital Skill 100% Undergraduate Scholarship","Paragon IU President Excellence Full Scholarship","Embedded Robotics & AI Systems Engineering Pathway","Full-Stack Cloud & Software Architecture Pathway"];
  for (let k = 0; k < 6; k++) {
    insertRecommendation.run(benchPid + '-rec-' + k, benchUId, benchTypes[k % 3], benchTitles[k], 'Benchmark recommendation ' + k, 'Matched benchmark criteria.', 'ent-' + k, 90 + k * 2, 'given', benchIso, benchIso);
  }

  db.exec('COMMIT;');

  console.log('[seed] COMMIT done.');

  const report = (t) => {
    const r = db.prepare(`SELECT COUNT(*) c FROM ${t}`).get();
    console.log(`  ${t.padEnd(26)} : ${r.c}`);
  };
  console.log('\n[seed] row counts (staging DB):');
  [ 'users','student_profiles','student_activity_progress','lab_experiment_results','student_learning_history','activity_events','learning_events','game_events','ai_interaction_analytics_events','cdes_analytics_events_stream','ai_conversations','ai_recommendation_events' ].forEach(report);
  console.log('[seed] complete.');
} catch (err) {
  db.exec('ROLLBACK;');
  console.error('[seed] ERROR:', err);
  process.exit(1);
} finally {
  db.close();
}
