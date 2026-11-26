import { BadRequestError } from './httpErrors';

/**
 * Validates optional external HTTP(S) URLs supplied by callers, rejecting dangerous schemes
 * such as javascript:, data:, vbscript:, or file:. Allows empty values and '#'.
 */
export function assertSafeOptionalHttpUrl(raw: unknown, fieldName: string): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== 'string') {
    throw new BadRequestError(`${fieldName} must be a valid http(s) URL.`);
  }
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '#') return undefined;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new BadRequestError(`${fieldName} must be a valid http(s) URL.`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestError(`${fieldName} must use http:// or https:// protocol.`);
  }
  if (parsed.username || parsed.password) {
    throw new BadRequestError(`${fieldName} must not embed credentials in the URL.`);
  }
  return trimmed;
}

export function assertSafeScholarshipUrls(data: Record<string, unknown>): void {
  assertSafeOptionalHttpUrl(data.applicationLink, 'applicationLink');
  assertSafeOptionalHttpUrl(data.application_link, 'application_link');
  assertSafeOptionalHttpUrl(data.officialSourceUrl, 'officialSourceUrl');
  assertSafeOptionalHttpUrl(data.official_source_url, 'official_source_url');
  assertSafeOptionalHttpUrl(data.officialWebsite, 'officialWebsite');
  assertSafeOptionalHttpUrl(data.official_website, 'official_website');
}

