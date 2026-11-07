// CDES Platform - API Client
// Handles authentication via httpOnly cookies and CSRF token headers.
// This client should be used by all frontend components for API calls.

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export interface ApiError extends Error {
  status?: number;
  message: string;
  data?: any;
}

/**
 * Gets the CSRF token ID from a response header.
 * The token ID is sent by the server to the client after the first request.
 */
export function getCsrfTokenId(): string | null {
  if (typeof window === "undefined") return null;
  const el = document.getElementById("cdes-csrf-token-id");
  return el?.getAttribute("content") || null;
}

/**
 * Sets the CSRF token ID for subsequent requests.
 */
export function setCsrfTokenId(tokenId: string): void {
  if (typeof window === "undefined") return;
  const meta = document.getElementById("cdes-csrf-token-id");
  if (meta) {
    meta.setAttribute("content", tokenId);
  } else {
    const m = document.createElement("meta");
    m.id = "cdes-csrf-token-id";
    m.name = "csrf-token-id";
    m.content = tokenId;
    document.head.appendChild(m);
  }
}

/**
 * Gets the CSRF token from the cookie.
 * The token is stored in an httpOnly cookie by the server.
 */
export function getCsrfToken(): string | null {
  if (typeof window === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "cdes_csrf_token") {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Gets the authorization header.
 * The JWT is stored in a cookie, so we don't need to send it in the header.
 */
export function getAuthHeader(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
}

/**
 * Gets the CSRF headers for state-changing requests.
 */
export function getCsrfHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getCsrfToken();
  const tokenId = getCsrfTokenId();

  if (token) {
    headers["X-CSRF-Token"] = token;
  }
  if (tokenId) {
    headers["X-CSRF-Token-Id"] = tokenId;
  }
  return headers;
}

/**
 * Creates a standard API fetch with auth and CSRF support.
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<any>> {
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  const csrfHeaders = getCsrfHeaders();
  for (const [key, value] of Object.entries(csrfHeaders)) {
    defaultHeaders[key] = value;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include", // Important: send cookies (httpOnly JWT)
  };

  const res = await fetch(url, config);

  // Check for 401 - auth cookie may have expired
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
    throw { status: 401, message: "Authentication required. Please log in again." };
  }

  const data = await res.json();

  if (!res.ok) {
    throw {
      status: res.status,
      message: data.error || "Request failed",
      data: data,
    };
  }

  return data;
}

/**
 * Wrapper for GET requests
 */
export async function apiGet<T>(url: string): Promise<any> {
  const res = await apiFetch(url, { method: "GET" });
  return res.data;
}

/**
 * Wrapper for POST requests
 */
export async function apiPost<T>(url: string, body?: any): Promise<any> {
  const res = await apiFetch(url, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.data;
}
