/** Tiny structured logger that respects a build-time verbosity flag. */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const ENABLED_LEVEL: LogLevel = import.meta.env.PROD ? 'warn' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[ENABLED_LEVEL];
}

function write(level: LogLevel, scope: string, message: string, meta?: unknown): void {
  if (!shouldLog(level)) return;
  const prefix = `[screen-recorder:${scope}]`;
  const args: unknown[] = [prefix, message];
  if (meta !== undefined) args.push(meta);
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  fn(...args);
}

export const logger = {
  debug: (scope: string, message: string, meta?: unknown) => write('debug', scope, message, meta),
  info: (scope: string, message: string, meta?: unknown) => write('info', scope, message, meta),
  warn: (scope: string, message: string, meta?: unknown) => write('warn', scope, message, meta),
  error: (scope: string, message: string, meta?: unknown) => write('error', scope, message, meta),
};
