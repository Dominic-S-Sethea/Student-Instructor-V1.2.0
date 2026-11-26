import { BadRequestError } from './httpErrors';

/**
 * Extracts a single optional string query parameter, rejecting duplicate/array query params
 * (e.g. `?badge=a&badge=b`) with 400 Bad Request instead of crashing SQLite bindings.
 */
export function parseOptionalQueryString(
  raw: unknown,
  paramName: string,
  maxLength: number = 200
): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (Array.isArray(raw)) {
    throw new BadRequestError(`Query parameter "${paramName}" must be a single value.`);
  }
  if (typeof raw !== 'string') {
    throw new BadRequestError(`Query parameter "${paramName}" must be a string.`);
  }
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

/**
 * Extracts a single optional positive integer query parameter, rejecting arrays with 400.
 */
export function parseOptionalPositiveInt(
  raw: unknown,
  paramName: string,
  defaultValue: number,
  maxValue: number
): number {
  const str = parseOptionalQueryString(raw, paramName, 20);
  if (!str) return defaultValue;
  const parsed = Number.parseInt(str, 10);
  if (!Number.isFinite(parsed)) return defaultValue;
  return Math.min(Math.max(1, parsed), maxValue);
}
