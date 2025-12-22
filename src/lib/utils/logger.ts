/**
 * Production-safe logger
 * 개발 환경에서만 로그 출력, 프로덕션에서는 자동 제거
 * 민감정보 자동 마스킹 기능 포함
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

/**
 * 민감정보 마스킹
 */
function maskSensitiveData(args: unknown[]): unknown[] {
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'api_key',
    'apiKey',
    'apikey',
    'authorization',
    'cookie',
    'auth',
  ];

  return args.map((arg) => {
    if (typeof arg === 'object' && arg !== null) {
      const masked: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(arg)) {
        const lowerKey = key.toLowerCase();

        if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
          masked[key] = '***REDACTED***';
        } else if (typeof value === 'object' && value !== null) {
          masked[key] = maskSensitiveData([value])[0];
        } else {
          masked[key] = value;
        }
      }

      return masked;
    }

    return arg;
  });
}

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment && !isTest) {
      const masked = maskSensitiveData(args);
      console.log(...masked);
    }
  },

  warn: (...args: unknown[]) => {
    if (isDevelopment || process.env.NODE_ENV === 'production') {
      const masked = maskSensitiveData(args);
      console.warn(...masked);
    }
  },

  error: (...args: unknown[]) => {
    // 에러는 항상 출력 (민감정보 마스킹)
    const masked = maskSensitiveData(args);
    console.error(...masked);
  },

  info: (...args: unknown[]) => {
    if (isDevelopment && !isTest) {
      const masked = maskSensitiveData(args);
      console.info(...masked);
    }
  },

  debug: (...args: unknown[]) => {
    if (isDevelopment && !isTest) {
      const masked = maskSensitiveData(args);
      console.debug(...masked);
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
