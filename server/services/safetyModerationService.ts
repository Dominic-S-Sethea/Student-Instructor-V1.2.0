import crypto from 'node:crypto';
import { getDatabase } from '../db/connection';

export interface ContentFilterResult {
  isSafe: boolean;
  action: 'pass' | 'flagged' | 'blocked';
  matchedRule?: string;
  sanitizedContent: string;
  warningNotice?: string;
}

export interface ModerationReportInput {
  reporter_id: string;
  reported_item_type: 'post' | 'comment' | 'mentor' | 'project' | 'message';
  reported_item_id: string;
  reason: 'inappropriate_content' | 'harassment' | 'spam' | 'unsafe_contact_request' | 'false_information';
  description: string;
}

class SafetyModerationService {
  // Regex patterns to protect minors from unsafe contact sharing & harmful text
  private phoneRegex = /(\+?855|0)[\s-]?[1-9]\d[\s-]?\d{3}[\s-]?\d{3,4}/gi;
  private telegramDirectRegex = /(t\.me\/|telegram\.me\/|telegram:\s*@?)[a-zA-Z0-9_]{4,}/gi;
  private emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  private dangerousKeywords = [
    'hate', 'gambling', 'casino', 'betting', 'scam', 'cheat on exam',
    'leak exam paper', 'buy bacii paper', 'buy bac ii key', 'leak bac ii questions'
  ];

  private redactContactPii(text: string): string {
    return text
      .replace(this.phoneRegex, '[Protected Phone Number - Please use CDES Official Sessions]')
      .replace(this.telegramDirectRegex, '[Direct Contact Link Redacted for Minor Protection]')
      .replace(this.emailRegex, '[Email Redacted]');
  }

  /**
   * Evaluates text for child safety & academic integrity
   */
  public evaluateContent(text: string, userId: string = 'usr-anonymous'): ContentFilterResult {
    const sanitizedForLog = this.redactContactPii(text);
    let matchedRule: string | undefined;

    // 1. Check for illicit exam tampering / cheating claims (protecting academic integrity)
    for (const kw of this.dangerousKeywords) {
      if (text.toLowerCase().includes(kw)) {
        matchedRule = `PROHIBITED_ACADEMIC_VIOLATION: ${kw}`;
        this.logViolation(userId, 'academic_dishonesty', matchedRule, sanitizedForLog.substring(0, 100), 'blocked');
        return {
          isSafe: false,
          action: 'blocked',
          matchedRule,
          sanitizedContent: '[Content blocked by CDES Academic Integrity System]',
          warningNotice: 'Your message was blocked because it contains terms violating CDES academic honesty guidelines.'
        };
      }
    }

    // 2. Minor Protection: Flag and sanitize unverified phone numbers or direct personal messaging links
    const phoneSanitized = text.replace(this.phoneRegex, '[Protected Phone Number - Please use CDES Official Sessions]');
    const sanitized = phoneSanitized.replace(this.telegramDirectRegex, '[Direct Contact Link Redacted for Minor Protection]');
    if (sanitized !== text) {
      matchedRule = 'UNSAFE_DIRECT_CONTACT_MINOR_PROTECTION';
      this.logViolation(userId, 'contact_leak', matchedRule, sanitizedForLog.substring(0, 100), 'sanitized');
      return {
        isSafe: true,
        action: 'flagged',
        matchedRule,
        sanitizedContent: sanitized,
        warningNotice: 'To protect student privacy and minor safety, personal direct phone numbers and external messaging links are redacted. All mentoring occurs safely through CDES verified sessions.'
      };
    }

    return {
      isSafe: true,
      action: 'pass',
      sanitizedContent: text
    };
  }

  /**
   * Submits a report to the safety audit system
   */
  public submitReport(input: ModerationReportInput): { id: string; status: string } {
    const db = getDatabase();
    const id = `rep-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const safeDesc = this.redactContactPii(input.description || '');

    db.prepare(`
      INSERT INTO moderation_reports (
        id, reporter_id, reported_item_type, reported_item_id, reason, description,
        status, moderator_notes, created_at, resolved_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      input.reporter_id,
      input.reported_item_type,
      input.reported_item_id,
      input.reason,
      safeDesc,
      'pending',
      'Auto-assigned to CDES Safety Desk',
      now,
      null
    );

    db.prepare(`
      INSERT INTO community_safety_audits (
        id, entity_type, entity_id, checked_by, check_result, details, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `audit-${crypto.randomUUID()}`,
      input.reported_item_type,
      input.reported_item_id,
      'user_report_intake',
      'warning',
      `Flagged for ${input.reason}: ${safeDesc.substring(0, 80)}`,
      now
    );

    return { id, status: 'pending' };
  }

  /**
   * Retrieves pending or reviewed moderation reports
   */
  public getReports(status?: string) {
    const db = getDatabase();
    if (status) {
      return db.prepare('SELECT * FROM moderation_reports WHERE status = ? ORDER BY created_at DESC LIMIT 50').all(status);
    }
    return db.prepare('SELECT * FROM moderation_reports ORDER BY created_at DESC LIMIT 50').all();
  }

  /**
   * Action a moderation report
   */
  public resolveReport(reportId: string, action: 'dismissed' | 'action_taken', moderatorNotes: string) {
    const db = getDatabase();
    const now = new Date().toISOString();
    return db.prepare(`
      UPDATE moderation_reports
      SET status = ?, moderator_notes = ?, resolved_at = ?
      WHERE id = ?
    `).run(action, moderatorNotes, now, reportId);
  }

  /**
   * Log safety violation in database (always PII-redacted)
   */
  private logViolation(
    userId: string,
    contentType: string,
    rule: string,
    snippet: string,
    action: 'blocked' | 'flagged_for_review' | 'sanitized'
  ) {
    try {
      const db = getDatabase();
      const safeSnippet = this.redactContactPii(snippet).substring(0, 120);
      db.prepare(`
        INSERT INTO content_filter_logs (
          id, user_id, content_type, matched_rule, raw_snippet, action_taken, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        `log-${crypto.randomUUID()}`,
        userId,
        contentType,
        rule,
        safeSnippet,
        action,
        new Date().toISOString()
      );
    } catch (e) {
      console.warn('Could not log violation to content_filter_logs:', e);
    }
  }
}

export const safetyModerationService = new SafetyModerationService();
