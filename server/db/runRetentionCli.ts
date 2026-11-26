#!/usr/bin/env node
import 'dotenv/config';
import { closeDatabase, getDatabase } from './connection';
import { runRetentionCleanup } from '../services/retentionService';

/**
 * Production data retention CLI entrypoint.
 * Bundled to dist/server/retention.cjs so scheduled cron jobs run the full
 * TypeScript retentionService (analytics, feature store, Hermes memory,
 * inactive non-admin accounts, and expired revoked JWT tokens).
 */
async function main(): Promise<void> {
  try {
    // Ensure database connection is initialized using DATABASE_PATH
    getDatabase();
    const summary = await runRetentionCleanup();
    console.log(
      JSON.stringify({
        status: 'ok',
        executedAt: new Date().toISOString(),
        summary,
      })
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        status: 'error',
        executedAt: new Date().toISOString(),
        error: err instanceof Error ? err.message : String(err),
      })
    );
    process.exitCode = 1;
  } finally {
    closeDatabase();
  }
}

void main();
