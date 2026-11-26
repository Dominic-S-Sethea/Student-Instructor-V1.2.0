/**
 * Pure parsing helpers shared by scholarship repositories, seeders, and formatters.
 */

/** Parses single explicit USD monthly stipend text without corrupting ranges or non-USD currencies. */
export function parseUsdMonthlyStipend(text?: string | null): number | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (/^(?:none|no stipend|\$\s*0(?:\.0+)?(?:\s*usd)?(?:\s*\/\s*(?:mo|month))?)$/i.test(trimmed)) {
    return 0;
  }
  if (/(?:\d\s*(?:-|–|—|\bto\b)\s*\$?\s*\d)/i.test(trimmed)) {
    return null;
  }
  if (/\b(?:AUD|CAD|SGD|EUR|GBP|JPY|KRW)\b|[£€¥₩]/i.test(trimmed)) {
    return null;
  }
  const usdMatch = trimmed.match(/^\$\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*(?:USD)?\s*\/\s*(?:mo|month)\b/i);
  if (usdMatch) {
    const parsed = Number(usdMatch[1].replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
