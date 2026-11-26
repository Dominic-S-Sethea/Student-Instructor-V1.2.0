import { DatabaseSync, StatementSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { resolveMigrationsDir, resolveSchemaPath } from './schemaAssets';

export const SLOW_QUERY_THRESHOLD_MS = Number(process.env.SLOW_QUERY_THRESHOLD_MS) || 200;
export const TOP_N_QUERIES = Number(process.env.SQLITE_TOP_N_QUERIES) || 20;
const MAX_TRACKED_QUERIES = 500;

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

let explainDb: DatabaseSync | null = null;
const planCache = new Map<string, string[]>();

function normalizeSqlKey(sql: string): string {
  return sql
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\bIN\s*\(\s*\?(?:\s*,\s*\?)*\s*\)/gi, 'IN (?)');
}

/** Splits a SQL script into individual statements while respecting SQL comments and single-quoted literals. */
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i += 1) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }
    if (inSingleQuote) {
      current += ch;
      if (ch === "'") {
        if (next === "'") {
          current += next;
          i += 1;
        } else {
          inSingleQuote = false;
        }
      }
      continue;
    }

    if (ch === '-' && next === '-') {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }
    if (ch === "'") {
      inSingleQuote = true;
      current += ch;
      continue;
    }
    if (ch === ';') {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
      continue;
    }
    current += ch;
  }

  const tail = current.trim();
  if (tail) statements.push(tail);
  return statements;
}

function getExplainDb(): DatabaseSync | null {
  if (explainDb) return explainDb;
  try {
    const schemaPath = resolveSchemaPath();
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const db = new DatabaseSync(':memory:');
    db.exec(schema);
    db.exec('CREATE TABLE IF NOT EXISTS schema_version (schema_version INTEGER DEFAULT 0);');
    const migDir = resolveMigrationsDir();
    if (fs.existsSync(migDir)) {
      const files = fs
        .readdirSync(migDir)
        .filter((f) => f.endsWith('.sql') && /^\d+/.test(f))
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
      for (const file of files) {
        const sql = fs.readFileSync(path.join(migDir, file), 'utf8');
        for (const stmt of splitSqlStatements(sql)) {
          try {
            db.exec(`${stmt};`);
          } catch {
            // Ignore already-present ALTER columns on schema.sql in explain scratch DB
          }
        }
      }
    }
    explainDb = db;
    return explainDb;
  } catch {
    return null;
  }
}

export function closeExplainDb(): void {
  if (explainDb) {
    try {
      explainDb.close();
    } catch {
      // ignore close errors
    }
    explainDb = null;
  }
  planCache.clear();
}

function explainPlanFor(sql: string): string[] {
  if (!planCache.has(sql)) {
    if (planCache.size >= MAX_TRACKED_QUERIES) {
      const oldestKey = planCache.keys().next().value;
      if (oldestKey !== undefined) planCache.delete(oldestKey);
    }
    try {
      const db = getExplainDb();
      if (!db) {
        planCache.set(sql, []);
      } else {
        const rows = db.prepare(`EXPLAIN QUERY PLAN ${sql}`).all() as Array<{ detail: string }>;
        planCache.set(sql, rows.map((r) => r.detail));
      }
    } catch {
      planCache.set(sql, []);
    }
  }
  return planCache.get(sql) || [];
}

function isBusyError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const record = err as { code?: unknown; message?: unknown };
  const text = `${String(record.code ?? '')} ${String(record.message ?? '')}`;
  return text.includes('SQLITE_BUSY') || text.includes('database is locked');
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

  enterWriter(): void {
    this.writerActive += 1;
    if (this.writerActive > this.writerMax) {
      this.writerMax = this.writerActive;
    }
  }

  exitWriter(): void {
    if (this.writerActive > 0) {
      this.writerActive -= 1;
    }
  }

  recordBusyTimeout(): void {
    this.busyTimeoutRetries += 1;
  }

  recordSlowQuery(sql: string, durationMs: number): void {
    this.slowQueries.push({
      sql,
      durationMs: Math.round(durationMs * 100) / 100,
      timestamp: new Date().toISOString(),
    });
    if (this.slowQueries.length > 1000) {
      this.slowQueries.shift();
    }
  }

  recordQuery(sql: string): void {
    const key = normalizeSqlKey(sql);
    if (!this.queryCounts.has(key) && this.queryCounts.size >= MAX_TRACKED_QUERIES) {
      const oldest = this.queryCounts.keys().next().value;
      if (oldest !== undefined) {
        this.queryCounts.delete(oldest);
      }
    }
    this.queryCounts.set(key, (this.queryCounts.get(key) ?? 0) + 1);
  }

  private buildTopQueries(): TopQueryMetric[] {
    return Array.from(this.queryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.topN)
      .map(([sql, executions]) => ({
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
    this.topQueries = this.buildTopQueries();
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

export class TrackedDatabase {
  private readonly db: DatabaseSync;
  private readonly isWrite = /^\s*(INSERT|UPDATE|DELETE|REPLACE|DROP|ALTER|CREATE|PRAGMA|BEGIN|COMMIT|ROLLBACK|ATTACH|DETACH)\b/i;

  constructor(dbFilePath: string) {
    this.db = new DatabaseSync(dbFilePath);
    this.db.exec(
      'PRAGMA journal_mode=WAL;' +
      'PRAGMA foreign_keys=ON;' +
      'PRAGMA synchronous=NORMAL;' +
      'PRAGMA busy_timeout=5000;' +
      'PRAGMA cache_size=-64000;' +
      'PRAGMA mmap_size=268435456;'
    );
  }

  enterWriter(): void {
    dbMetrics.enterWriter();
  }

  exitWriter(): void {
    dbMetrics.exitWriter();
  }

  prepare(sql: string): InstrumentedStatement {
    return new InstrumentedStatement(this.db.prepare(sql), sql, this);
  }

  exec(sql: string): void {
    const started = process.hrtime.bigint();
    try {
      this.db.exec(sql);
    } catch (err: unknown) {
      if (isBusyError(err)) dbMetrics.recordBusyTimeout();
      throw err;
    } finally {
      const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
      if (durationMs > SLOW_QUERY_THRESHOLD_MS) {
        dbMetrics.recordSlowQuery(sql, durationMs);
      }
      if (this.isWrite.test(sql)) dbMetrics.incrementWrite();
      else dbMetrics.incrementRead();
    }
  }

  close(): void {
    try {
      this.db.close();
    } catch {
      // ignore
    }
  }
}

export class InstrumentedStatement {
  private readonly stmt: StatementSync;
  private readonly sql: string;
  private readonly tracked: TrackedDatabase;

  constructor(stmt: StatementSync, sql: string, tracked: TrackedDatabase) {
    this.stmt = stmt;
    this.sql = sql;
    this.tracked = tracked;
  }

  get(...params: Array<string | number | bigint | Uint8Array | null>): unknown {
    return this.timed(() => this.stmt.get(...params), true);
  }

  all(...params: Array<string | number | bigint | Uint8Array | null>): unknown[] {
    return this.timed(() => this.stmt.all(...params), true) as unknown[];
  }

  run(...params: Array<string | number | bigint | Uint8Array | null>): {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  } {
    this.tracked.enterWriter();
    try {
      return this.timed(() => this.stmt.run(...params), false) as {
        changes: number | bigint;
        lastInsertRowid: number | bigint;
      };
    } finally {
      this.tracked.exitWriter();
    }
  }

  iterate(...params: Array<string | number | bigint | Uint8Array | null>): unknown {
    return this.timed(() => this.stmt.iterate(...params), true);
  }

  private timed(fn: () => unknown, isRead: boolean): unknown {
    const started = process.hrtime.bigint();
    try {
      return fn();
    } catch (err: unknown) {
      if (isBusyError(err)) {
        dbMetrics.recordBusyTimeout();
      }
      throw err;
    } finally {
      const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
      if (isRead) {
        dbMetrics.incrementRead();
      } else {
        dbMetrics.incrementWrite();
      }
      dbMetrics.recordQuery(this.sql);
      if (durationMs > SLOW_QUERY_THRESHOLD_MS) {
        dbMetrics.recordSlowQuery(this.sql, durationMs);
      }
    }
  }
}

export const dbMetrics = new SQLiteMetrics();
