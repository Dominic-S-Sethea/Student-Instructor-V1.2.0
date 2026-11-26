/**
 * Validates that an external or user-provided URL uses an allowlisted HTTP(S) protocol.
 * Returns the normalized href string when safe, or null when invalid or unsafe.
 */
export function getSafeHttpUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return null;
  }
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}
