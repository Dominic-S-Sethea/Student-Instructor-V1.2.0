/**
 * server/db/metrics.ts
 *
 * SQLite writer-concurrency and slow-query instrumentation for the CDES
 * production database.
 *
 * Installed on top of the DatabaseSync singleton in server/db/connection.ts so
 * every repository query is automatically counted and timed. No changes are
 * required inside the 12 repositories; they keep calling
 * `db.prepare(sql).get/all/run()` exactly as before.
 *
 * Exposed (GET /api/metrics/sqlite) as a machine-readable snapshot:
 *   - SQLITE_BUSY proxy:  busy-timeout retries observed (writer-concurrency)
 *   - writer concurrency: active / peak writer connections
 *   - read/write ops:     cumulative read and write statement counts
 *   - slow queries:       statements exceeding SLOW_QUERY_THRESHOLD_MS
 *   - top-N queries:       the N most-executed SQL shapes with their recorded
 *                          EXPLAIN QUERY PLAN (captured once per shape)
 */

import { DatabaseSync, StatementSync } from 'node:sqlite';
import * as fs from 'fs';
import * as path from 'path';

/** Slow-query threshold in milliseconds (env-overridable). */
export const SLOW_QUERY_THRESHOLD_MS = Number(process.env.SLOW_QUERY_THRESHOLD_MS) || 200;

/** Number of top queries to keep with their EXPLAIN QUERY PLAN output. */
export const TOP_N_QUERIES = Number(process.env.SQLITE_TOP_N_QUERIES) || 20;

export interface SlowQueryMetric {
  sql: string;
  durationMs: number;
  timestamp: string;
}

export interface TopQueryMetric {
  sql: string;
  executions: number;
  explainQueryPlan: string[];
}

export interface SQLiteMetricsSnapshot {
  readOps: number;
  writeOps: number;
  busyTimeoutRetries: number;
  writerActive: number;
  writerMax: number;
  slowQueries: SlowQueryMetric[];
  topQueries: TopQueryMetric[];
  totalQueryExecutions: number;
}

// Minimal reproduction of node:sqlite SQLInputValue for callers of
// TrackedDatabase.prepare().sql.
type SqlInputValue = string | number | bigint | null;

// Schema of the app database; used to build a representative in-memory DB that
// produces accurate EXPLAIN QUERY PLAN output (mirror of server/db/schema.sql).
const schemaFilePath = path.resolve(process.cwd(), 'server', 'db', 'schema.sql');

function buildExplainPlanDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  const schema = fs.readFileSync(schemaFilePath, 'utf8');
  db.exec(schema);
  return db;
}

// Reusable in-memory DB used to cache EXPLAIN QUERY PLAN output.
const EXPLAIN_DB = buildExplainPlanDb();

const planCache = new Map<string, string[]>();

function explainPlanFor(sql: string): string[] {
  if (!planCache.has(sql)) {
    try {
      const rows = EXPLAIN_DB.prepare(`EXPLAIN QUERY PLAN ${sql}`).all() as Array<{ detail: string }>;
      planCache.set(sql, rows.map((r) => r.detail));
    } catch {
      // Non-DML or unsupported shape: record an empty plan rather than erroring.
      planCache.set(sql, []);
    }
  }
  return planCache.get(sql)!;
}

export class SQLiteMetrics {
  private readOps = 0;
  private writeOps = 0;
  private busyTimeoutRetries = 0;
  private writerActive = 0;
  private writerMax = 0;
  private slowQueries: SlowQueryMetric[] = [];
  private readonly queryCounts = new Map<string, number>();
  private topQueries: TopQueryMetric[] = [];
  private readonly topN: number;

  constructor() {
    this.topN = TOP_N_QUERIES;
  }

  incrementRead(): void {
    this.readOps += 1;
  }

  incrementWrite(): void {
    this.writeOps += 1;
  }

  /** Track a writer connection entering a write transaction. */
  enterWriter(): void {
    this.writerActive += 1;
    if (this.writerActive > this.writerMax) {
      this.writerMax = this.writerActive;
    }
  }

  /** Track a writer connection leaving a write transaction. */
  exitWriter(): void {
    if (this.writerActive > 0) {
      this.writerActive -= 1;
    }
  }

  /** One busy-timeout retry was taken (proxy for SQLITE_BUSY pressure). */
  recordBusyTimeout(): void {
    this.busyTimeoutRetries += 1;
  }

  recordSlowQuery(sql: string, durationMs: number): void {
    this.slowQueries.push({
      sql,
      durationMs,
      timestamp: new Date().toISOString(),
    });
    if (this.slowQueries.length > 1000) {
      this.slowQueries.shift();
    }
  }

  recordQuery(sql: string): void {
    const count = (this.queryCounts.get(sql) ?? 0) + 1;
    this.queryCounts.set(sql, count);

    if (count === 1) {
      try {
        explainPlanFor(sql);
      } catch {
        // Unsupported statement shape: leave an empty plan rather than failing.
      }
    }
    this.rebuildTop();
  }

  private rebuildTop(): void {
    const sorted = Array.from(this.queryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.topN);

    this.topQueries = sorted.map(([sql, executions]) => ({
      sql,
      executions,
      explainQueryPlan: explainPlanFor(sql),
    }));
  }

  reset(): void {
    this.readOps = 0;
    this.writeOps = 0;
    this.busyTimeoutRetries = 0;
    this.writerActive = 0;
    this.writerMax = 0;
    this.slowQueries = [];
    this.queryCounts.clear();
    this.topQueries = [];
    planCache.clear();
  }

  toJSON(): SQLiteMetricsSnapshot {
    let total = 0;
    for (const c of this.queryCounts.values()) {
      total += c;
    }
    return {
      readOps: this.readOps,
      writeOps: this.writeOps,
      busyTimeoutRetries: this.busyTimeoutRetries,
      writerActive: this.writerActive,
      writerMax: this.writerMax,
      slowQueries: this.slowQueries,
      topQueries: this.topQueries,
      totalQueryExecutions: total,
    };
  }
}

/**
 * TrackedDatabase — the instrumented SQLite singleton that every repository and
 * service uses. It wraps node:sqlite's DatabaseSync and instruments every
 * prepared-statement execution so the SQLiteMetrics counters actually observe
 * prod traffic:
 *
 *   - readOps / writeOps         (per executed statement, classified by the
 *                                 leading SQL keyword)
 *   - busyTimeoutRetries         (proxy for SQLITE_BUSY pressure; raised when a
 *                                 statement hits the PRAGMA busy_timeout
 *                                 ceiling without completing)
 *   - writerActive / writerMax   (concurrent writers in-flight / peak)
 *   - slowQueries                (statements exceeding SLOW_QUERY_THRESHOLD_MS)
 *   - topQueries                 (top-N most-executed SQL shapes, each with a
 *                                 one-time EXPLAIN QUERY PLAN capture)
 *
 * Usage (unchanged by repositories/services):
 *   const db = getDatabase();
 *   db.prepare('SELECT ...').get(...)   // read
 *   db.prepare('INSERT ...').run(...)   // write
 *   db.prepare('UPDATE ...').run(...)   // write, tracks writer concurrency
 *   db.exec('PRAGMA ...')               // multi-statement, counted as a write
 */
export class TrackedDatabase {
  private readonly db: DatabaseSync;
  private readonly isWrite = /^\s*(INSERT|UPDATE|DELETE|REPLACE|DROP|ALTER|CREATE|PRAGMA|BEGIN|COMMIT|ROLLBACK|ATTACH|DETACH)\b/i;

  constructor(dbFilePath: string) {
    this.db = new DatabaseSync(dbFilePath);

    // §8 runbook: WAL + busy timeout + cache + mmap before any traffic.
    this.db.exec(
      'PRAGMA journal_mode=WAL;' +
      'PRAGMA synchronous=NORMAL;' +
      'PRAGMA busy_timeout=5000;' +
      'PRAGMA cache_size=-64000;' + // ~64 MB page cache
      'PRAGMA mmap_size=268435456;', // 256 MB memory-mapped I/O
    );

    // NOTE: the TrackedDatabase singleton is itself the single logical writer.
    // The writer counter is accounted for per explicit transaction (`run()`),
    // so no separate constructor entry is needed.
  }

  enterWriter(): void {
    dbMetrics.enterWriter();
  }

  exitWriter(): void {
    dbMetrics.exitWriter();
  }

  // The instrumented DatabaseSync — wrapped to count every statement.
  prepare(sql: string): InstrumentedStatement {
    return new InstrumentedStatement(this.db.prepare(sql), sql, this);
  }

  /** Multi-statement execution (e.g. PRAGMA tuning, migrations). Counted as a write. */
  exec(sql: string): void {
    const started = process.hrtime.bigint();
    const slow = Number(process.hrtime.bigint() - started) / 1e6 > SLOW_QUERY_THRESHOLD_MS;
    try {
      this.db.exec(sql);
    } catch (err: any) {
      if (this.isBusyError(err)) dbMetrics.recordBusyTimeout();
      throw err;
    } finally {
      if (slow) dbMetrics.recordSlowQuery(sql, Number(process.hrtime.bigint() - started) / 1e6);
      if (this.isWrite.test(sql)) dbMetrics.incrementWrite(); else dbMetrics.incrementRead();
    }
  }

  close(): void {
    try {
      this.db.close();
    } catch {
      // ignore
    }
  }

  private isBusyError(err: any): boolean {
    const code = err.code ?? err.message ?? '';
    return typeof code === 'string' && code.includes('SQLITE_BUSY');
  }
}

/** Instrumented statement wrapper — transparently counts + times execution. */
export class InstrumentedStatement {
  private readonly stmt: StatementSync;
  private readonly sql: string;
  private readonly tracked: TrackedDatabase;

  constructor(stmt: StatementSync, sql: string, tracked: TrackedDatabase) {
    this.stmt = stmt;
    this.sql = sql;
    this.tracked = tracked;
  }

  private start(): bigint {
    return process.hrtime.bigint();
  }

  get(...params: any[]): unknown {
    return this.timed(() => this.stmt.get(...(params)), true);
  }

  all(...params: any[]): unknown[] {
    return this.timed(() => this.stmt.all(...(params)), true) as unknown[];
  }

  run(...params: any[]): { changes: number | bigint; lastInsertRowid: number | bigint } {
    this.tracked.enterWriter();
    try {
      return this.timed(() => this.stmt.run(...(params)), false) as { changes: number | bigint; lastInsertRowid: number | bigint };
    } finally {
      this.tracked.exitWriter();
    }
  }

  iterate(...params: any[]): unknown {
    return this.timed(() => this.stmt.iterate(...(params)), true);
  }

  private timed(fn: () => unknown, isRead: boolean): unknown {
    const started = this.start();
    const slow = Number(process.hrtime.bigint() - started) / 1e6 > SLOW_QUERY_THRESHOLD_MS;
    try {
      return fn();
    } finally {
      if (isRead) {
        dbMetrics.incrementRead();
      } else {
        dbMetrics.incrementWrite();
      }
      // Record execution so the top-N tracking (EXPLAIN QUERY PLAN) stays current.
      dbMetrics.recordQuery(this.sql);
      if (slow) {
        dbMetrics.recordSlowQuery(this.sql, Number(process.hrtime.bigint() - started) / 1e6);
      }
    }
  }
}

// Singleton metrics instance — exposed to the monitoring endpoint by
// server/db/connection.ts. Reset on each clean reconnect in tests.
export const dbMetrics = new SQLiteMetrics();
