/**
 * Production-safe logger
 * 개발 환경에서만 로그 출력, 프로덕션에서는 자동 제거
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  error: (...args: unknown[]) => {
    // 에러는 프로덕션에서도 출력
    console.error(...args);
  },

  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

// 타입 안전한 로거 래퍼
export function createLogger(namespace: string) {
  return {
    log: (...args: unknown[]) => logger.log(`[${namespace}]`, ...args),
    warn: (...args: unknown[]) => logger.warn(`[${namespace}]`, ...args),
    error: (...args: unknown[]) => logger.error(`[${namespace}]`, ...args),
    info: (...args: unknown[]) => logger.info(`[${namespace}]`, ...args),
    debug: (...args: unknown[]) => logger.debug(`[${namespace}]`, ...args),
  };
}
