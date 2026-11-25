// CDES Platform - Unified API Client
// Uses HttpOnly session cookie (cdes_jwt) + session-bound X-CSRF-Token in memory.

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly data?: unknown;

  constructor(message: string, status: number, code?: string, data?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

let inMemoryCsrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

export function getCsrfToken(): string | null {
  return inMemoryCsrfToken;
}

export function setCsrfToken(token: string | null): void {
  inMemoryCsrfToken = token && token.trim() ? token.trim() : null;
}

export function clearCsrfToken(): void {
  inMemoryCsrfToken = null;
}

async function ensureCsrfToken(): Promise<string> {
  if (inMemoryCsrfToken) {
    return inMemoryCsrfToken;
  }
  if (!csrfPromise) {
    csrfPromise = fetch('/api/auth/csrf', {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then(async (res) => {
        const headerToken = res.headers.get('X-CSRF-Token');
        if (headerToken) {
          setCsrfToken(headerToken);
          return headerToken;
        }
        const json = (await res.json().catch(() => ({}))) as { data?: { csrfToken?: string } };
        if (json?.data?.csrfToken) {
          setCsrfToken(json.data.csrfToken);
          return json.data.csrfToken;
        }
        return '';
      })
      .finally(() => {
        csrfPromise = null;
      });
  }
  return csrfPromise;
}

/**
 * Executes a fetch request with HttpOnly credentials and automatic X-CSRF-Token handling.
 * Returns the parsed JSON payload directly.
 */
export async function apiFetchRaw<T = Record<string, unknown>>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (needsCsrf && !inMemoryCsrfToken) {
    await ensureCsrfToken();
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (needsCsrf && inMemoryCsrfToken && !headers['X-CSRF-Token']) {
    headers['X-CSRF-Token'] = inMemoryCsrfToken;
  }

  const execute = () =>
    fetch(url, {
      ...options,
      method,
      headers,
      credentials: 'include',
    });

  let res = await execute();
  const nextCsrf = res.headers.get('X-CSRF-Token');
  if (nextCsrf) {
    setCsrfToken(nextCsrf);
  }

  // Retry once if CSRF rotated across session change
  if (res.status === 403 && needsCsrf) {
    const firstErr = (await res.clone().json().catch(() => ({}))) as { code?: string };
    if (firstErr?.code === 'CSRF_MISSING' || firstErr?.code === 'CSRF_INVALID') {
      clearCsrfToken();
      const refreshed = await ensureCsrfToken();
      if (refreshed) {
        headers['X-CSRF-Token'] = refreshed;
        res = await execute();
        const headerAfter = res.headers.get('X-CSRF-Token');
        if (headerAfter) setCsrfToken(headerAfter);
      }
    }
  }

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof (body?.data as Record<string, unknown> | undefined)?.csrfToken === 'string') {
    setCsrfToken(String((body.data as Record<string, unknown>).csrfToken));
  }

  if (!res.ok) {
    throw new ApiClientError(
      String(body.error || `Request failed with status ${res.status}`),
      res.status,
      typeof body.code === 'string' ? body.code : undefined,
      body
    );
  }

  return body as T;
}

export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiFetchRaw<ApiResponse<T>>(url, options);
}

export async function apiGet<T = unknown>(url: string): Promise<T> {
  const res = await apiFetchRaw<ApiResponse<T>>(url, { method: 'GET' });
  return (res.data !== undefined ? res.data : res) as T;
}

export async function apiPost<T = unknown>(url: string, body?: unknown): Promise<T> {
  const res = await apiFetchRaw<ApiResponse<T>>(url, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return (res.data !== undefined ? res.data : res) as T;
}

export async function apiPut<T = unknown>(url: string, body?: unknown): Promise<T> {
  const res = await apiFetchRaw<ApiResponse<T>>(url, {
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return (res.data !== undefined ? res.data : res) as T;
}

export async function apiPatch<T = unknown>(url: string, body?: unknown): Promise<T> {
  const res = await apiFetchRaw<ApiResponse<T>>(url, {
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return (res.data !== undefined ? res.data : res) as T;
}

export async function apiDelete<T = unknown>(url: string): Promise<T> {
  const res = await apiFetchRaw<ApiResponse<T>>(url, { method: 'DELETE' });
  return (res.data !== undefined ? res.data : res) as T;
}
