import { SQLiteMetrics, dbMetrics, SLOW_QUERY_THRESHOLD_MS } from './server/db/metrics.ts';

const m = new SQLiteMetrics();

// Simulate read-heavy queries
m.recordQuery('SELECT * FROM users WHERE id = ?');
m.recordQuery('SELECT * FROM scholarships WHERE is_verified = 1');
m.recordQuery('SELECT * FROM scholarships WHERE is_verified = 1'); // repeated
m.recordQuery('SELECT * FROM universities ORDER BY profile_score_overall DESC');

// Simulate writes
m.enterWriter(); m.incrementWrite(); m.exitWriter();
m.recordQuery('INSERT INTO activity_events (id, student_id, event_type) VALUES (?, ?, ?)');
m.recordQuery('UPDATE learning_progress SET completed = 1 WHERE id = ?');

// Simulate a slow query
m.recordSlowQuery('SELECT * FROM big_table WHERE x = 1', 500);

console.log('readOps', m.readOps, 'writeOps', m.writeOps, 'slowQueries', m.slowQueries.length, 'topQueries', m.topQueries.length);
console.log('writerActive', m.writerActive, 'writerMax', m.writerMax, 'busyTimeoutRetries', m.busyTimeoutRetries);

const snap = dbMetrics.toJSON();
console.log('SNAPSHOT topQueries', snap.topQueries.length);
console.log('SNAPSHOT topQueries[0]', JSON.stringify(snap.topQueries[0]).slice(0, 200));
console.log('SNAPSHOT topQueries[1]', JSON.stringify(snap.topQueries[1]).slice(0, 200));
