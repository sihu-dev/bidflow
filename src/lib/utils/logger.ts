/**
 * BIDFLOW Structured Logging System
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  debug(message: string, meta?: LogMeta): void {
    if (!this.isDevelopment) return;
    console.log('[DEBUG]', message, meta);
  }

  info(message: string, meta?: LogMeta): void {
    if (this.isDevelopment) {
      console.log('[INFO]', message, meta);
    } else {
      console.log(JSON.stringify({ level: 'info', message, ...meta }));
    }
  }

  warn(message: string, meta?: LogMeta): void {
    if (this.isDevelopment) {
      console.warn('[WARN]', message, meta);
    } else {
      console.log(JSON.stringify({ level: 'warn', message, ...meta }));
    }
  }

  error(message: string, error?: Error | unknown, meta?: LogMeta): void {
    const errorMeta = error instanceof Error
      ? { ...meta, error: { name: error.name, message: error.message, stack: error.stack } }
      : { ...meta, error };

    if (this.isDevelopment) {
      console.error('[ERROR]', message, errorMeta);
    } else {
      console.log(JSON.stringify({ level: 'error', message, ...errorMeta }));
    }
  }
}

export const logger = new Logger();
export const { debug, info, warn, error } = logger;
