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

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export const DEFAULT_API_TIMEOUT_MS = 15_000;

function createTimeoutController(
  callerSignal: AbortSignal | null | undefined,
  timeoutMs: number
): { signal: AbortSignal; cleanup: () => void; didTimeout: () => boolean } {
  const controller = new AbortController();
  let timedOut = false;

  const onCallerAbort = (): void => {
    controller.abort(callerSignal?.reason);
  };

  if (callerSignal) {
    if (callerSignal.aborted) {
      controller.abort(callerSignal.reason);
    } else {
      callerSignal.addEventListener('abort', onCallerAbort, { once: true });
    }
  }

  const timer =
    timeoutMs > 0
      ? setTimeout(() => {
          timedOut = true;
          controller.abort(new Error(`Request timed out after ${timeoutMs}ms`));
        }, timeoutMs)
      : null;

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timer !== null) clearTimeout(timer);
      if (callerSignal) callerSignal.removeEventListener('abort', onCallerAbort);
    },
    didTimeout: () => timedOut,
  };
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

async function ensureCsrfToken(timeoutMs = DEFAULT_API_TIMEOUT_MS): Promise<string> {
  if (inMemoryCsrfToken) {
    return inMemoryCsrfToken;
  }
  if (!csrfPromise) {
    const { signal, cleanup } = createTimeoutController(undefined, timeoutMs);
    csrfPromise = fetch('/api/auth/csrf', {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      signal,
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
        cleanup();
        csrfPromise = null;
      });
  }
  return csrfPromise;
}

/**
 * Executes a fetch request with HttpOnly credentials, automatic X-CSRF-Token handling,
 * and a default 15s timeout composable with a caller-supplied AbortSignal.
 */
export async function apiFetchRaw<T = Record<string, unknown>>(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = DEFAULT_API_TIMEOUT_MS, signal: callerSignal, ...fetchOptions } = options;
  const method = (fetchOptions.method || 'GET').toUpperCase();
  const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (needsCsrf && !inMemoryCsrfToken) {
    await ensureCsrfToken(timeoutMs);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(fetchOptions.headers as Record<string, string> | undefined),
  };

  if (needsCsrf && inMemoryCsrfToken && !headers['X-CSRF-Token']) {
    headers['X-CSRF-Token'] = inMemoryCsrfToken;
  }

  const execute = async (): Promise<Response> => {
    const { signal, cleanup, didTimeout } = createTimeoutController(callerSignal, timeoutMs);
    try {
      return await fetch(url, {
        ...fetchOptions,
        method,
        headers,
        credentials: 'include',
        signal,
      });
    } catch (err) {
      if (didTimeout()) {
        throw new ApiClientError('Request timed out. Please try again.', 408, 'REQUEST_TIMEOUT');
      }
      throw err;
    } finally {
      cleanup();
    }
  };

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
      const refreshed = await ensureCsrfToken(timeoutMs);
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
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<ApiResponse<T>> {
  return apiFetchRaw<ApiResponse<T>>(url, options);
}

export async function apiGet<T = unknown>(url: string, requestOptions?: RequestOptions): Promise<T> {
  const res = await apiFetchRaw<ApiResponse<T>>(url, { method: 'GET', ...requestOptions });
  return (res.data !== undefined ? res.data : res) as T;
}

export async function apiPost<T = unknown>(
  url: string,
  body?: unknown,
  requestOptions?: RequestOptions
): Promise<T> {
  const res = await apiFetchRaw<ApiResponse<T>>(url, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...requestOptions,
  });
  return (res.data !== undefined ? res.data : res) as T;
}

export async function apiPut<T = unknown>(
  url: string,
  body?: unknown,
  requestOptions?: RequestOptions
): Promise<T> {
  const res = await apiFetchRaw<ApiResponse<T>>(url, {
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...requestOptions,
  });
  return (res.data !== undefined ? res.data : res) as T;
}

export async function apiPatch<T = unknown>(
  url: string,
  body?: unknown,
  requestOptions?: RequestOptions
): Promise<T> {
  const res = await apiFetchRaw<ApiResponse<T>>(url, {
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...requestOptions,
  });
  return (res.data !== undefined ? res.data : res) as T;
}

export async function apiDelete<T = unknown>(url: string, requestOptions?: RequestOptions): Promise<T> {
  const res = await apiFetchRaw<ApiResponse<T>>(url, { method: 'DELETE', ...requestOptions });
  return (res.data !== undefined ? res.data : res) as T;
}
