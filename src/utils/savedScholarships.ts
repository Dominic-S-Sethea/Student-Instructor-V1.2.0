const SAVED_SCHOLARSHIPS_PREFIX = 'csip_saved_scholarships';

export function getSavedScholarshipsKey(userId?: string | null): string {
  const scope = userId && userId.trim() ? userId.trim() : 'guest';
  return `${SAVED_SCHOLARSHIPS_PREFIX}:${scope}`;
}

/** Reads account-scoped saved scholarship IDs without fabricating default bookmarks. */
export function readSavedScholarshipIds(userId?: string | null): string[] {
  try {
    const scopedKey = getSavedScholarshipsKey(userId);
    const raw = localStorage.getItem(scopedKey);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  } catch {
    return [];
  }
}

/** Persists account-scoped saved scholarship IDs into browser localStorage. */
export function writeSavedScholarshipIds(userId: string | null | undefined, ids: string[]): void {
  try {
    const unique = Array.from(new Set(ids.filter((id) => typeof id === 'string' && id.trim().length > 0)));
    localStorage.setItem(getSavedScholarshipsKey(userId), JSON.stringify(unique));
  } catch {
    // Ignore storage quota or private-mode restrictions
  }
}

/** Removes any legacy unscoped saved-scholarship key so accounts never cross-leak on shared devices. */
export function clearLegacyUnscopedSavedScholarships(): void {
  try {
    localStorage.removeItem(SAVED_SCHOLARSHIPS_PREFIX);
  } catch {
    // Ignore storage errors
  }
}
