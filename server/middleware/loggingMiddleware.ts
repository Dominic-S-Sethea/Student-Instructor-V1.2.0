// CDES Platform - Structured Logging Middleware
// Uses console with JSON formatting for structured logging.
// No third-party logging library dependencies required.

const isProduction = process.env.NODE_ENV === "production";

type LogLevel = "error" | "warn" | "info" | "debug";

function formatLog(level: LogLevel, args: unknown[]): string {
  const timestamp = new Date().toISOString();
  const meta =
    (args.find((a): a is Record<string, unknown> => typeof a === "object" && a !== null)) || {};
  const message =
    args.find((a): a is string => typeof a === "string") || JSON.stringify(args);
  return JSON.stringify({
    timestamp,
    service: "cdes-platform",
    ...meta,
    level,
    message,
  });
}

export class Logger {
  static error(...args: unknown[]): void {
    console.error(formatLog("error", args));
  }
  static warn(...args: unknown[]): void {
    console.warn(formatLog("warn", args));
  }
  static info(...args: unknown[]): void {
    console.log(formatLog("info", args));
  }
  static debug(...args: unknown[]): void {
    if (!isProduction) console.log(formatLog("debug", args));
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
