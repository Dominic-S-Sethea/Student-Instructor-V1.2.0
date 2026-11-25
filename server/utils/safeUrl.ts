import { BadRequestError } from './httpErrors';

/**
 * Validates optional external HTTP(S) URLs supplied by callers, rejecting dangerous schemes
 * such as javascript:, data:, vbscript:, or file:. Allows empty values and '#'.
 */
export function assertSafeOptionalHttpUrl(raw: unknown, fieldName: string): void {
  if (raw === undefined || raw === null) return;
  if (typeof raw !== 'string') {
    throw new BadRequestError(`${fieldName} must be a valid http(s) URL.`);
  }
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '#') return;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new BadRequestError(`${fieldName} must be a valid http(s) URL.`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestError(`${fieldName} must use http:// or https:// protocol.`);
  }
}

export function assertSafeScholarshipUrls(data: Record<string, unknown>): void {
  assertSafeOptionalHttpUrl(data.applicationLink ?? data.application_link, 'applicationLink');
  assertSafeOptionalHttpUrl(data.officialSourceUrl ?? data.official_source_url, 'officialSourceUrl');
  assertSafeOptionalHttpUrl(data.officialWebsite ?? data.official_website, 'officialWebsite');
}
