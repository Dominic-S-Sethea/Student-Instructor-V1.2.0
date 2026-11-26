// CDES Platform - Structured Logging Middleware
// Respects process.env.LOG_LEVEL dynamically, merges multiple metadata objects,
// and serializes Error instances cleanly without leaking stack traces in production.

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function getConfiguredLevel(): LogLevel {
  const raw = (process.env.LOG_LEVEL || '').trim().toLowerCase();
  if (raw === 'error' || raw === 'warn' || raw === 'info' || raw === 'debug') {
    return raw;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

function shouldEmit(level: LogLevel): boolean {
  return LEVEL_WEIGHT[level] <= LEVEL_WEIGHT[getConfiguredLevel()];
}

function serializeError(err: Error): Record<string, unknown> {
  const out: Record<string, unknown> = {
    errorName: err.name,
    errorMessage: err.message,
  };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    out.errorStack = err.stack;
  }
  return out;
}

function formatLog(level: LogLevel, args: unknown[]): string {
  const timestamp = new Date().toISOString();
  const mergedMeta: Record<string, unknown> = {};
  const messages: string[] = [];

  for (const arg of args) {
    if (typeof arg === 'string') {
      messages.push(arg);
    } else if (arg instanceof Error) {
      Object.assign(mergedMeta, serializeError(arg));
      if (messages.length === 0) messages.push(arg.message);
    } else if (arg && typeof arg === 'object' && !Array.isArray(arg)) {
      for (const [k, v] of Object.entries(arg as Record<string, unknown>)) {
        mergedMeta[k] = v instanceof Error ? serializeError(v) : v;
      }
    } else if (arg !== undefined) {
      messages.push(String(arg));
    }
  }

  return JSON.stringify({
    timestamp,
    service: 'cdes-platform',
    ...mergedMeta,
    level,
    message: messages.join(' ') || level.toUpperCase(),
  });
}

export class Logger {
  static error(...args: unknown[]): void {
    if (shouldEmit('error')) console.error(formatLog('error', args));
  }
  static warn(...args: unknown[]): void {
    if (shouldEmit('warn')) console.warn(formatLog('warn', args));
  }
  static info(...args: unknown[]): void {
    if (shouldEmit('info')) console.log(formatLog('info', args));
  }
  static debug(...args: unknown[]): void {
    if (shouldEmit('debug')) console.log(formatLog('debug', args));
  }
}

const logger = {
  error: Logger.error.bind(Logger),
  warn: Logger.warn.bind(Logger),
  info: Logger.info.bind(Logger),
  debug: Logger.debug.bind(Logger),
};

export default logger;
