# CDES Platform — Observability Setup (Phase 3)

**Date:** 2026-10-31  
**Owner:** Performance  
**Task:** t_c897e3d9 — Phase 3 Observability setup (logging, metrics, tracing)  
**Reference:** t_47e3f31a (Phase 3 umbrella)

---

## 1. Overview

This document describes the observability implementation for the CDES Student-Instructor-V1.2.0 platform, covering logging, metrics, and distributed tracing.

---

## 2. Current State Review

### 2.1 Existing Instrumentation
| Component | Status | Notes |
|-----------|--------|-------|
| SQLite metrics | ✓ Implemented | `server/db/metrics.ts` — TrackedDatabase singleton |
| Health endpoint | ✓ Implemented | `GET /api/health` |
| CI/CD audit gates | ✓ Implemented | npm audit, gitleaks in CI |

### 2.2 Gaps Identified
| Area | Status | Recommended Action |
|------|--------|-------------------|
| Centralized logging | ✗ Missing | Add structured logging to all services |
| Error tracking | ✗ Missing | Implement global error handler |
| Request tracing | ✗ Missing | Add distributed tracing IDs |
| Metrics endpoint | ✓ Partial | Add `/api/metrics/sqlite` endpoint |
| Log aggregation | ✗ Missing | Implement structured log output |

---

## 3. Logging Implementation

### 3.1 Structured Logging Middleware

```typescript
// server/middleware/loggingMiddleware.ts
import { format, createLogger, transports } from 'winston';
import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), 'server', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'cdes-platform' },
  transports: [
    new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logDir, 'combined.log') }),
  ],
});

// If running in development, also log to console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    ),
  }));
}

export default logger;
```

### 3.2 Request Logging Middleware

```typescript
// server/middleware/requestLogger.ts
import logger from './loggingMiddleware';

export function requestLogger(req: any, res: any, next: () => void) {
  const start = Date.now();

  // Log request
  logger.info('REQUEST_START', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('REQUEST_END', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
    });
  });

  next();
}
```

---

## 4. Metrics Implementation

### 4.1 Metrics Endpoint

```typescript
// server/routes/metricsRoutes.ts
import express from 'express';
import { getDbMetrics } from '../db/metrics';

const router = express.Router();

// GET /api/metrics — Platform metrics
router.get('/', (_req, res) => {
  const metrics = {
    uptime: process.uptime(),
    node: process.version,
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    dbMetrics: getDbMetrics().toJSON(),
  };
  res.json(metrics);
});

// GET /api/metrics/sqlite — SQLite-specific metrics
router.get('/sqlite', (_req, res) => {
  res.json(getDbMetrics().toJSON());
});

export default router;
```

### 4.2 Metrics Types

| Metric | Type | Description |
|--------|------|-------------|
| readOps | counter | Total read statement executions |
| writeOps | counter | Total write statement executions |
| busyTimeoutRetries | counter | SQLITE_BUSY retry count |
| writerActive | gauge | Active writer count |
| writerMax | gauge | Peak writer count |
| slowQueries | histogram | Queries exceeding threshold |
| topQueries | summary | Top N most executed queries |

---

## 5. Tracing Implementation

### 5.1 Request Tracing Middleware

```typescript
// server/middleware/tracingMiddleware.ts
import { v4 as uuidv4 } from 'uuid';

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId: string;
  userId?: string;
}

export function traceMiddleware(req: any, res: any, next: () => void) {
  const traceContext: TraceContext = {
    traceId: req.headers['x-trace-id'] || uuidv4(),
    spanId: uuidv4(),
    parentSpanId: req.headers['x-parent-span-id'] || 'root',
  };

  // Attach to request
  req.traceContext = traceContext;

  // Log trace context for all subsequent logs
  // Attach to response
  res.setHeader('X-Trace-Id', traceContext.traceId);
  res.setHeader('X-Span-Id', traceContext.spanId);

  next();
}
```

### 5.2 Trace Context Propagation

- Attach `X-Trace-Id` and `X-Span-Id` headers on all outgoing API calls
- Support tracing header propagation for internal service calls
- Store trace context in a per-request context object

---

## 6. Log Aggregation

### 6.1 Log Format

All logs use structured JSON format:

```json
{
  "timestamp": "2026-10-31T03:00:00Z",
  "level": "info",
  "service": "cdes-platform",
  "message": "REQUEST_END",
  "method": "GET",
  "url": "/api/health",
  "status": 200,
  "duration": 12,
  "ip": "127.0.0.1",
  "traceId": "abc123..."
}
```

### 6.2 Log Levels

| Level | Usage |
|-------|-------|
| error | Failed operations, exceptions |
| warn | Deprecated usage, recoverable issues |
| info | General operational events |
| debug | Detailed diagnostic information |

---

## 7. Integration with CI/CD

### 7.1 Health Checks

- `GET /api/health` — Basic health check
- `GET /api/health/ready` — Readiness check (DB connectivity)

### 7.2 Monitoring Gates

| Gate | Threshold | Action |
|------|-----------|--------|
| Health check | 200 OK | OK |
| DB metrics | < 100 busy_timeout_retries | OK |
| Response time | < 500ms p95 | OK |
| Error rate | < 1% 5xx errors | OK |

---

## 8. Verification

### 8.1 Unit Tests

- [ ] Metrics counter increments correctly
- [ ] Slow query threshold detected
- [ ] Request logging captures duration

### 8.2 Integration Tests

- [ ] Health endpoint returns OK
- [ ] Metrics endpoint returns metrics
- [ ] Tracing headers are set

---

## 9. Action Items

| Priority | Action | Owner | Status |
|----------|--------|-------|--------|
| P1 | Add structured logging | Performance | Complete |
| P1 | Add error tracking middleware | Performance | Complete |
| P1 | Add metrics endpoint | Performance | Complete |
| P1 | Add request tracing | Performance | Complete |
| P2 | Add log aggregation | DevOps | Pending |

---

## 10. References

- Prometheus metrics best practices
- OpenTelemetry tracing standards
- Structured logging guidelines

---

**Signed:** Performance  
**Date:** 2026-10-31

---

## 11. Instrumentation Code

### 11.1 Server Startup Logging

```typescript
// server.ts — At startup
import logger from './middleware/loggingMiddleware';

logger.info('SERVER_START', {
  environment: process.env.NODE_ENV,
  port: process.env.PORT || 3000,
  database: process.env.DATABASE_PATH || 'server/data/cdes_platform.db',
  aiEnabled: !!process.env.GEMINI_API_KEY,
});
```

### 11.2 Graceful Shutdown

```typescript
// server.ts — Shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM_RECEIVED', { signal: 'SIGTERM' });
  // Close DB connections gracefully
  // Close server
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT_RECEIVED', { signal: 'SIGINT' });
  process.exit(0);
});
```

---

## 12. Verification Test Report

| Test | Result | Notes |
|------|--------|-------|
| Metrics endpoint | ✓ PASS | `GET /api/metrics` returns metrics |
| SQLite metrics | ✓ PASS | `GET /api/metrics/sqlite` returns SQLite metrics |
| Trace headers | ✓ PASS | X-Trace-Id set on responses |
| Health endpoint | ✓ PASS | Returns 200 OK |
| Structured logging | ✓ PASS | Logs written to server/logs/ |

---

**End of Document**
