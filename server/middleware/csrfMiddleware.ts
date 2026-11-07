// CDES Platform - CSRF Token Middleware
// Protects state-changing endpoints (POST, PUT, PATCH, DELETE) from CSRF attacks.
// Generates a CSRF token, stores it in an httpOnly cookie, and validates it
// against a X-CSRF-Token header on state-changing requests.

import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

// Token storage (in production, use Redis or a database for multi-instance)
const csrfTokenStore = new Map<string, string>();

/**
 * Generates a CSRF token and sets it in an httpOnly cookie.
 * The token value is also stored in an in-memory map for validation.
 */
export function generateCsrfToken(req: Request, res: Response, next: NextFunction): void {
  const token = randomUUID();
  const tokenId = randomUUID();

  csrfTokenStore.set(tokenId, token);

  // Set the token as a cookie (httpOnly prevents XSS access)
  res.cookie("cdes_csrf_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 86400000, // 24 hours
  });

  // Send the token ID to the client (not the token value)
  // The client must send the token ID in the X-CSRF-Token-Id header
  res.setHeader("X-CSRF-Token-Id", tokenId);

  next();
}

/**
 * Validates the CSRF token for state-changing requests.
 * Checks both the X-CSRF-Token header and the X-CSRF-Token-Id header.
 */
export function validateCsrfToken(req: Request, res: Response, next: NextFunction): void {
  const method = req.method?.toUpperCase();
  const isStateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(method || "");

  if (!isStateChanging) {
    next();
    return;
  }

  const tokenId = req.headers["x-csrf-token-id"] as string | undefined;
  const token = req.headers["x-csrf-token"] as string | undefined;

  if (!tokenId || !token) {
    res.status(403).json({
      success: false,
      error: "CSRF validation failed: missing X-CSRF-Token or X-CSRF-Token-Id header.",
    });
    return;
  }

  const expectedToken = csrfTokenStore.get(tokenId);
  if (!expectedToken || expectedToken !== token) {
    res.status(403).json({
      success: false,
      error: "CSRF validation failed: invalid or expired token.",
    });
    return;
  }

  // Token valid - delete it to prevent reuse (CSRF token should be single-use)
  csrfTokenStore.delete(tokenId);

  next();
}
