// server/data/benchmark_hot_queries.cjs
// Benchmarks the 5 hot per-student queries against the staging DB.
// All SQL mirrors the repository functions in server/repositories/.
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/sethe/GitHub/Student-Instructor-V1.2.0/server/data/cdes_platform.staging.db');

const benchStudent = 'usr-bench-0001';   // benchmark user id (conversations/recommendations)
const benchProfile = 'stu-bench-0001';   // benchmark profile id (recommendations)

const queries = [
  {
    name: 'getStudentActivityProgress (per-student activity feed)',
    target: 500, // ms
    sql: `SELECT sap.*, la.title as activity_title, la.title_km as activity_title_km, la.activity_type, la.difficulty, la.reward_points, s.name as subject_name
          FROM student_activity_progress sap
          JOIN learning_activities la ON sap.activity_id = la.id
          JOIN subjects s ON la.subject_id = s.id
          WHERE sap.student_id = ?`,
    params: [benchStudent],
    endpoint: '/api/learning/activities?studentId=' + benchStudent,
  },
  {
    name: 'getStudentLabResults (per-student lab results, ORDER BY updated_at DESC)',
    target: 500,
    sql: `SELECT ler.*, le.title as experiment_title, le.title_km as experiment_title_km, le.category, s.name
          FROM lab_experiment_results ler
          JOIN lab_experiments le ON ler.experiment_id = le.id
          JOIN subjects s ON le.subject_id = s.id
          WHERE ler.student_id = ?
          ORDER BY ler.updated_at DESC`,
    params: [benchStudent],
    endpoint: '/api/learning/experiments?studentId=' + benchStudent,
  },
  {
    name: 'getStudentAIEducationProfile (per-student history LIMIT 20)',
    target: 500,
    sql: `SELECT * FROM student_learning_history WHERE student_id = ? ORDER BY timestamp DESC LIMIT 20`,
    params: [benchStudent],
    endpoint: '/api/learning/student-ai-profile?studentId=' + benchStudent,
  },
  {
    name: 'getConversationHistory (per-user, LIMIT 20)',
    target: 1000,
    sql: `SELECT * FROM ai_conversations WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20`,
    params: [benchStudent],
    endpoint: '/api/ai/student-insight?studentId=' + benchStudent,
  },
  {
    name: 'getOrGenerateRecommendations (per-student, LIMIT 10)',
    target: 500,
    sql: `SELECT * FROM ai_recommendation_events WHERE student_id = ? AND status != 'dismissed' ORDER BY priority_score DESC, created_at DESC LIMIT 10`,
    params: [benchStudent],
    endpoint: '/api/ai/recommend',
  },
];

const N = 30; // iterations per query
const results = [];
for (const q of queries) {
  const times = [];
  let rows = 0;
  for (let i = 0; i < N; i++) {
    const t0 = performance.now();
    const stmt = db.prepare(q.sql);
    const data = stmt.all(...q.params);
    const t1 = performance.now();
    times.push(t1 - t0);
    rows = data.length;
  }
  times.sort((a, b) => a - b);
  const mean = times.reduce((a, b) => a + b, 0) / N;
  const p50 = times[Math.floor(N / 2)];
  const passes = mean < q.target;
  results.push({ name: q.name, target: q.target, meanMs: mean, p50Ms: p50, rows, passes, endpoint: q.endpoint });
  console.log(`\n${q.name}`);
  console.log(`  endpoint : ${q.endpoint}`);
  console.log(`  target   : < ${q.target}ms`);
  console.log(`  rows     : ${rows}`);
  console.log(`  mean     : ${mean.toFixed(3)} ms  ${passes ? 'PASS' : 'FAIL'}`);
  console.log(`  p50      : ${p50.toFixed(3)} ms`);
}

console.log('\n=== SUMMARY ===');
const allPass = results.every(r => r.passes);
for (const r of results) {
  console.log(`  ${r.name.padEnd(60)} mean=${r.meanMs.toFixed(2)}ms  target=${r.target}ms  ${r.passes?'PASS':'FAIL'}`);
}
console.log('\nOVERALL: ' + (allPass ? 'PERF BUDGET PASS' : 'PERF BUDGET FAIL'));
process.exit(allPass ? 0 : 1);
