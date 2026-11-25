/** Parse an HTTP Cookie header string into a key-value map. */
export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = Object.create(null) as Record<string, string>;
  if (!cookieHeader) {
    return result;
  }

  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx <= 0) continue;
    const key = pair.slice(0, idx).trim();
    const rawVal = pair.slice(idx + 1).trim();
    if (!key || key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    try {
      result[key] = decodeURIComponent(rawVal);
    } catch {
      result[key] = rawVal;
    }
  }
  return result;
}
