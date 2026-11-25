import { aiSafetyService } from './aiSafetyService';

export const ENTITY_ALIASES: Record<string, string[]> = {
  cadt: ['cadt', 'cambodia academy of digital technology', 'mptc', 'បណ្ឌិត្យសភាបច្ចេកវិទ្យាឌីជីថល'],
  itc: ['itc', 'institute of technology of cambodia', 'techno', 'តិចណូ', 'tronc commun'],
  rupp: ['rupp', 'royal university of phnom penh', 'សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ'],
  uhs: ['uhs', 'university of health sciences', 'វិទ្យាសាស្ត្រសុខាភិបាល'],
  aupp: ['aupp', 'american university of phnom penh'],
  camed: ['camed', 'acca', 'camed business school'],
  paragon: ['paragon', 'paragon international university', 'zaman'],
  'bac ii': ['bac ii', 'bac2', 'grade 12', 'national exam', 'បាក់ឌុប', 'ទី១២'],
  scholarship: ['scholarship', 'scholarships', 'fellowship', 'grant', 'អាហារូបករណ៍', 'mext', 'chevening', 'fulbright', 'gks'],
  math: ['math', 'mathematics', 'calculus', 'statistics', 'គណិតវិទ្យា'],
  english: ['english', 'ielts', 'toefl', 'អង់គ្លេស'],
  khmer: ['khmer', 'km', 'ភាសាខ្មែរ', 'ខ្មែរ'],
  user: ['user', 'student', 'me', 'myself', 'ខ្ញុំ', 'សិស្ស'],
};

/** Strips HTML/script markup and runs pedagogical + PII safety sanitization before persistence. */
export function sanitizeMemoryText(raw: string): string {
  const withoutTags = raw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const { sanitizedText } = aiSafetyService.sanitizeOutput(withoutTags);
  return sanitizedText;
}

/** Sanitizes multi-line USER.md/MEMORY.md docs while preserving newline boundaries for line-wise consolidation. */
export function sanitizeMemoryDocText(raw: string): string {
  const normalizedLines = raw
    .replace(/\r\n?/g, '\n')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line) => line.length > 0);
  const { sanitizedText } = aiSafetyService.sanitizeOutput(normalizedLines.join('\n'));
  return sanitizedText;
}

export function normalizeTokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,.;:/!?()[\]{}"'`]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

export function expandAliases(term: string): string[] {
  const lower = term.toLowerCase().trim();
  const expanded = new Set<string>([lower]);
  for (const [canonical, list] of Object.entries(ENTITY_ALIASES)) {
    if (canonical === lower || list.some((alias) => alias === lower || lower.includes(alias))) {
      expanded.add(canonical);
      for (const alias of list) expanded.add(alias);
    }
  }
  return Array.from(expanded);
}

export function extractAutoEntitiesAndKeywords(
  factText: string,
  explicitEntities?: string[],
  explicitKeywords?: string[]
): { entities: string[]; keywords: string[] } {
  const lower = factText.toLowerCase();
  const entities = new Set<string>(
    (explicitEntities || []).map((e) => e.trim().slice(0, 64)).filter(Boolean)
  );
  const keywords = new Set<string>(
    (explicitKeywords || []).map((k) => k.trim().toLowerCase().slice(0, 64)).filter(Boolean)
  );

  for (const [canonical, aliases] of Object.entries(ENTITY_ALIASES)) {
    if (aliases.some((alias) => lower.includes(alias))) {
      entities.add(canonical);
      for (const alias of aliases.slice(0, 4)) keywords.add(alias.slice(0, 64));
    }
  }
  for (const token of normalizeTokens(factText).slice(0, 12)) {
    keywords.add(token.slice(0, 64));
  }

  return {
    entities: Array.from(entities).slice(0, 12),
    keywords: Array.from(keywords).slice(0, 24),
  };
}

/** Keeps newest non-empty lines within the document character limit when pruning. */
export function consolidateTextToLimit(text: string, limit: number): string {
  const clean = text.trim();
  if (clean.length <= limit) return clean;
  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
  const kept: string[] = [];
  let runningLen = 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    const next = lines[i];
    const addition = kept.length > 0 ? next.length + 1 : next.length;
    if (runningLen + addition > limit - 40) break;
    kept.unshift(next);
    runningLen += addition;
  }
  if (kept.length === 0) {
    return clean.slice(-limit);
  }
  return kept.join('\n');
}
