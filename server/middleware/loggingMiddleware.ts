// CDES Platform - Structured Logging Middleware
// Uses console with JSON formatting for structured logging.
// No third-party logging library dependencies required.

const isProduction = process.env.NODE_ENV === "production";

function formatLog(args: any[]): string {
  const timestamp = new Date().toISOString();
  const meta = args.find((a: any) => typeof a === "object" && a !== null) || {};
  const message = args.find((a: any) => typeof a === "string") || JSON.stringify(args);
  return JSON.stringify({
    timestamp,
    level: meta.level || "info",
    service: "cdes-platform",
    ...meta,
    message,
  });
}

export class Logger {
  static error(...args: any[]): void {
    console.error(formatLog(args));
  }
  static warn(...args: any[]): void {
    console.warn(formatLog(args));
  }
  static info(...args: any[]): void {
    console.log(formatLog(args));
  }
  static debug(...args: any[]): void {
    if (!isProduction) console.log(formatLog(args));
  }
}

// Default logger instance
const logger = {
  error: Logger.error.bind(Logger),
  warn: Logger.warn.bind(Logger),
  info: Logger.info.bind(Logger),
  debug: Logger.debug.bind(Logger),
};

export default logger;
