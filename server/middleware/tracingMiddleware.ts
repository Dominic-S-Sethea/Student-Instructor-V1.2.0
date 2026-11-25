// CDES Platform - Request Tracing Middleware
// Adds distributed tracing IDs to all requests for request tracing and debugging.
// Uses crypto.randomUUID (built into Node.js v19+) for unique trace IDs.

import { randomUUID } from "crypto";

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId: string;
  userId?: string;
}

const SAFE_TRACE_HEADER_RE = /^[a-zA-Z0-9._-]{1,64}$/;

function sanitizeTraceHeader(value: unknown): string | null {
  return typeof value === "string" && SAFE_TRACE_HEADER_RE.test(value) ? value : null;
}

export function traceMiddleware(req: any, res: any, next: () => void): void {
  const traceId = sanitizeTraceHeader(req.headers["x-trace-id"]) || randomUUID();
  const spanId = randomUUID();
  const parentSpanId = sanitizeTraceHeader(req.headers["x-parent-span-id"]) || traceId;

  req.traceId = traceId;
  req.spanId = spanId;
  req.parentSpanId = parentSpanId;

  res.setHeader("X-Trace-Id", traceId);
  res.setHeader("X-Span-Id", spanId);

  next();
}

export function getTraceContext(req: any): TraceContext {
  const fallbackTraceId = req.traceId || sanitizeTraceHeader(req.headers["x-trace-id"]) || randomUUID();
  return {
    traceId: fallbackTraceId,
    spanId: req.spanId || randomUUID(),
    parentSpanId: req.parentSpanId || sanitizeTraceHeader(req.headers["x-parent-span-id"]) || fallbackTraceId,
    userId: req.user?.userId,
  };
}
