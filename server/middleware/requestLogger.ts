// CDES Platform - Request Logging Middleware
// Logs every HTTP request and response with timing information.

import logger from "./loggingMiddleware";

export interface HttpRequestInfo {
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  startTime: number;
  statusCode: number;
  durationMs: number;
}

export function requestLogger(req: any, res: any, next: () => void): void {
  const start = Date.now();

  const requestInfo: HttpRequestInfo = {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection?.remoteAddress || "unknown",
    userAgent: req.get("User-Agent") || "",
    startTime: start,
    statusCode: 200,
    durationMs: 0,
  };

  res.on("finish", () => {
    requestInfo.statusCode = res.statusCode;
    requestInfo.durationMs = Date.now() - start;

    if (res.statusCode >= 500) {
      logger.error("REQUEST_ERROR", requestInfo);
    } else if (res.statusCode >= 400) {
      logger.warn("REQUEST_WARNING", requestInfo);
    } else {
      logger.info("REQUEST_COMPLETE", requestInfo);
    }
  });

  next();
}
