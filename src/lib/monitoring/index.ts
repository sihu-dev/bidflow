/**
 * @module monitoring
 * @description 모니터링 및 에러 추적 통합 모듈
 */

import { logger } from '@/lib/utils/logger';

// ============================================================================
// 에러 추적
// ============================================================================

interface ErrorContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 에러 캡처 및 리포팅
 * Sentry 연동 시 자동 전송
 */
export function captureError(error: Error, context?: ErrorContext): void {
  const errorInfo = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...context,
  };

  logger.error('[Monitoring] Error captured:', errorInfo);

  // Sentry 연동 (환경변수 설정 시 활성화)
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.captureException(error, { extra: context });
  }
}

/**
 * 사용자 행동 추적
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  logger.info('[Monitoring] Event:', { eventName, ...properties });

  // Vercel Analytics 연동
  if (typeof window !== 'undefined') {
    const win = window as unknown as { va?: (event: string, props: unknown) => void };
    if (win.va) {
      win.va('event', { name: eventName, ...properties });
    }
  }
}

// ============================================================================
// 성능 모니터링
// ============================================================================

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 's' | 'bytes' | 'count';
}

/**
 * 성능 메트릭 기록
 */
export function recordMetric(metric: PerformanceMetric): void {
  logger.debug('[Monitoring] Metric:', {
    name: metric.name,
    value: metric.value,
    unit: metric.unit
  });

  // Sentry Performance 연동
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry.metrics.set(metric.name, metric.value);
  }
}

/**
 * API 응답 시간 측정
 */
export function measureApiLatency(
  endpoint: string,
  startTime: number
): number {
  const latency = Date.now() - startTime;

  recordMetric({
    name: `api.latency.${endpoint.replace(/\//g, '_')}`,
    value: latency,
    unit: 'ms',
  });

  return latency;
}

// ============================================================================
// 사용자 컨텍스트
// ============================================================================

/**
 * 사용자 컨텍스트 설정 (Sentry)
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  tenantId?: string;
}): void {
  logger.debug('[Monitoring] User context set:', { userId: user.id });

  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry.setUser({ id: user.id, email: user.email });
  }
}

/**
 * 사용자 컨텍스트 초기화
 */
export function clearUserContext(): void {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry.setUser(null);
  }
}

// ============================================================================
// 헬스 체크
// ============================================================================

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: boolean;
    redis: boolean;
    ai: boolean;
  };
  latency: {
    database: number;
    redis: number;
  };
  timestamp: string;
}

/**
 * 시스템 헬스 체크
 */
export async function checkHealth(): Promise<HealthStatus> {
  const startDb = Date.now();
  const startRedis = Date.now();

  // TODO: 실제 헬스 체크 구현
  const dbHealthy = true;
  const redisHealthy = true;
  const aiHealthy = !!process.env.ANTHROPIC_API_KEY;

  const dbLatency = Date.now() - startDb;
  const redisLatency = Date.now() - startRedis;

  const allHealthy = dbHealthy && redisHealthy && aiHealthy;
  const anyHealthy = dbHealthy || redisHealthy || aiHealthy;

  return {
    status: allHealthy ? 'healthy' : anyHealthy ? 'degraded' : 'unhealthy',
    services: {
      database: dbHealthy,
      redis: redisHealthy,
      ai: aiHealthy,
    },
    latency: {
      database: dbLatency,
      redis: redisLatency,
    },
    timestamp: new Date().toISOString(),
  };
}
