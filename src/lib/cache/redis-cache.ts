/**
 * Redis 캐싱 유틸리티 (Upstash Redis REST API)
 * AI 함수 결과 및 API 응답 캐싱으로 비용 80% 절감
 */

import { Redis } from '@upstash/redis';
import { logger } from '@/lib/utils/logger';

// Upstash Redis 클라이언트 (serverless 환경 호환)
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    logger.warn('[Redis Cache] 환경변수 미설정 - 캐싱 비활성화');
  }
} catch (error) {
  logger.error('[Redis Cache] 초기화 실패:', error);
}

/**
 * 캐시 TTL 설정 (초 단위)
 */
export const CacheTTL = {
  AI_SUMMARY: 60 * 60 * 24 * 7, // 7일 (AI 요약은 입찰이 변경되지 않는 한 재사용)
  AI_SCORE: 60 * 60 * 24 * 7, // 7일
  AI_KEYWORDS: 60 * 60 * 24 * 7, // 7일
  AI_DEADLINE: 60 * 60 * 24 * 30, // 30일 (마감일은 거의 변경 안 됨)
  BID_LIST: 60 * 5, // 5분 (자주 변경되는 목록)
  BID_DETAIL: 60 * 30, // 30분
  MATCH_RESULT: 60 * 60, // 1시간
  ORG_SCORE: 60 * 60 * 24, // 1일
} as const;

/**
 * 캐시 키 생성 (prefix로 네임스페이스 구분)
 */
export function createCacheKey(namespace: string, ...parts: string[]): string {
  return `bidflow:${namespace}:${parts.join(':')}`;
}

/**
 * 캐시 조회 (타입 안전)
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const value = await redis.get<T>(key);
    if (value !== null) {
      logger.debug('[Redis Cache] HIT:', key);
    } else {
      logger.debug('[Redis Cache] MISS:', key);
    }
    return value;
  } catch (error) {
    logger.error('[Redis Cache] GET 실패:', { key, error });
    return null;
  }
}

/**
 * 캐시 저장 (타입 안전, TTL 포함)
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<boolean> {
  if (!redis) return false;

  try {
    await redis.set(key, value, { ex: ttlSeconds });
    logger.debug('[Redis Cache] SET:', { key, ttl: ttlSeconds });
    return true;
  } catch (error) {
    logger.error('[Redis Cache] SET 실패:', { key, error });
    return false;
  }
}

/**
 * 캐시 삭제
 */
export async function deleteCache(key: string): Promise<boolean> {
  if (!redis) return false;

  try {
    await redis.del(key);
    logger.debug('[Redis Cache] DEL:', key);
    return true;
  } catch (error) {
    logger.error('[Redis Cache] DEL 실패:', { key, error });
    return false;
  }
}

/**
 * 패턴 매칭으로 여러 키 삭제 (예: 'bidflow:bids:*')
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  if (!redis) return 0;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    await redis.del(...keys);
    logger.debug('[Redis Cache] DEL_PATTERN:', { pattern, count: keys.length });
    return keys.length;
  } catch (error) {
    logger.error('[Redis Cache] DEL_PATTERN 실패:', { pattern, error });
    return 0;
  }
}

/**
 * 캐시 무효화 헬퍼 (입찰 업데이트 시 호출)
 */
export async function invalidateBidCache(bidId: string): Promise<void> {
  await Promise.all([
    deleteCache(createCacheKey('bid', bidId)),
    deleteCachePattern(createCacheKey('bids', '*')),
    deleteCachePattern(createCacheKey('ai', 'summary', bidId)),
    deleteCachePattern(createCacheKey('ai', 'score', bidId)),
    deleteCachePattern(createCacheKey('ai', 'keywords', bidId)),
  ]);
}

/**
 * 고차 함수: 캐싱 래퍼
 * 함수 결과를 자동으로 캐싱하고 재사용
 */
export function withCache<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: {
    keyGenerator: (...args: TArgs) => string;
    ttl: number;
  }
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    const cacheKey = options.keyGenerator(...args);

    // 캐시 조회
    const cached = await getCache<TResult>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // 캐시 미스 - 원본 함수 실행
    const result = await fn(...args);

    // 결과 캐싱 (비동기, 에러 무시)
    setCache(cacheKey, result, options.ttl).catch(() => {
      // 캐싱 실패해도 결과는 반환
    });

    return result;
  };
}

/**
 * Redis 연결 상태 확인
 */
export async function checkRedisHealth(): Promise<boolean> {
  if (!redis) return false;

  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}
