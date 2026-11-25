import type { NextFunction, Request, Response } from 'express';

/** Typed HTTP error carrying status code, optional machine code, and validation details. */
export class HttpError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, code: string = 'BAD_REQUEST', details?: unknown) {
    super(400, message, code, details);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string, code: string = 'FORBIDDEN') {
    super(403, message, code);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, code: string = 'NOT_FOUND') {
    super(404, message, code);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string, code: string = 'CONFLICT') {
    super(409, message, code);
  }
}

export class BadGatewayError extends HttpError {
  constructor(message: string, code: string = 'BAD_GATEWAY') {
    super(502, message, code);
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message: string, code: string = 'SERVICE_UNAVAILABLE') {
    super(503, message, code);
  }
}

export class GatewayTimeoutError extends HttpError {
  constructor(message: string, code: string = 'GATEWAY_TIMEOUT') {
    super(504, message, code);
  }
}

/** Wraps Express 4 async route handlers so rejected promises always reach the global error handler. */
export function asyncHandler<Req extends Request = Request>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<unknown>
): (req: Req, res: Response, next: NextFunction) => void {
  return (req: Req, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/** Masks internal 5xx error details in production/staging while keeping 4xx client errors actionable. */
export function safeErrorMessage(err: unknown, fallback: string, status: number = 500): string {
  const env = process.env.NODE_ENV || 'development';
  const hideInternal = env === 'production' || env === 'staging';
  if (status >= 500 && hideInternal) {
    return fallback;
  }
  return err instanceof Error && err.message ? err.message : fallback;
}
