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

export function traceMiddleware(req: any, res: any, next: () => void): void {
  const traceId = req.headers["x-trace-id"] || randomUUID();
  const spanId = randomUUID();
  const parentSpanId = req.headers["x-parent-span-id"] || traceId;

  req.traceId = traceId;
  req.spanId = spanId;
  req.parentSpanId = parentSpanId;

  res.setHeader("X-Trace-Id", traceId);
  res.setHeader("X-Span-Id", spanId);

  next();
}

export function getTraceContext(req: any): TraceContext {
  return {
    traceId: req.traceId || req.headers["x-trace-id"] || randomUUID(),
    spanId: req.spanId || randomUUID(),
    parentSpanId: req.parentSpanId || req.headers["x-parent-span-id"] || req.traceId,
    userId: req.user?.userId,
  };
}
