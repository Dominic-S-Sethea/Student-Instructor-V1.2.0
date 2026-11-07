// CDES Platform - Retention Cron Job
// Schedules and runs the retention cleanup service.
// Can be run as a scheduled task in production.

import { runRetentionCleanup } from "./retentionService";

/**
 * Runs the full retention cleanup job.
 * Returns a summary of cleanup results.
 */
export async function runRetentionCron(): Promise<void> {
  console.log("[Retention] Starting retention cleanup...");

  try {
    const results = await runRetentionCleanup();
    console.log("[Retention] Cleanup complete:", JSON.stringify(results, null, 2));
    console.log("[Retention] Retention cleanup job finished.");
  } catch (error) {
    console.error("[Retention] Retention cleanup job failed:", error);
    throw error;
  }
}
