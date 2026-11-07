/**
 * server/middleware/auditMiddleware.ts
 *
 * Audit logging middleware for the CDES platform.
 *
 * Logs all write operations (POST, PUT, DELETE, PATCH) to the audit log table.
 * Logs include: user_id, action, timestamp, IP address, endpoint, and a summary
 * of the resulting data (not raw data — only aggregate counts and types).
 *
 * Usage:
 *   import { auditMiddleware } from './middleware/auditMiddleware';
 *   app.use(auditMiddleware);
 *
 * The middleware records:
 *   - user_id (from JWT)
 *   - action (endpoint + HTTP method)
 *   - timestamp (ISO 8601)
 *   - ip_address (from req.ip)
 *   - endpoint (URL path)
 *   - changes (aggregate summary: counts of created/updated/deleted records by type)
 */

import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from '../db/connection';

const db = new DatabaseSync(process.env.DATABASE_PATH || 'server/data/cdes_platform.db');

// Ensure the audit log table exists
db.exec(`CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  ip_address TEXT,
  endpoint TEXT NOT NULL,
  changes_summary TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);`)

export function auditMiddleware(req: any, res: any, next: () => void) {
  // Track response to capture the result for logging
  const originalJson = res.json;
  const originalStatus = res.status;

  // Count changes to report in the audit log
  const changesSummary = {
    created: 0,
    updated: 0,
    deleted: 0,
  };

  // Wrap res.json to detect changes
  res.json = function(data: any) {
    // Analyze the response data for changes summary
    // This is a simplified implementation — in production, use a more robust approach
    if (Array.isArray(data)) {
      changesSummary.created = data.length;
    } else if (data && typeof data === 'object') {
      if (data.id && !data.id.startsWith('new')) {
        changesSummary.updated = 1;
      }
    }
    return originalJson.call(this, data);
  };

  // Wrap res.status to detect 204 (no content = deleted)
  res.status = function(code: number) {
    if (code === 204) {
      changesSummary.deleted = 1;
    }
    return originalStatus.call(this, code);
  };

  const startTime = Date.now();

  // Execute the request
  const result = next();

  // Log audit entry after response is sent
  // Note: We log asynchronously to avoid delaying the response

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Extract user_id from the request (JWT)
  const userId = req.user?.id || req.headers['user-id'] || null;

  // Extract IP address
  const ipAddress = req.ip || req.connection?.remoteAddress || null;

  // Get the endpoint
  const endpoint = req.originalUrl || req.url;

  // Determine the action based on HTTP method
  const method = req.method;
  const action = `${method} ${endpoint}`;

  // Insert audit log entry
  try {
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, timestamp, ip_address, endpoint, changes_summary)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      action,
      new Date().toISOString(),
      ipAddress,
      endpoint,
      JSON.stringify(changesSummary)
    );
  } catch (err) {
    // Log failure silently (don't let audit logging break the app)
    console.error('Audit log insertion failed:', err);
  }

  return result;
}

export { db as auditDb };
