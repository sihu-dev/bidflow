/**
 * @module security/rate-limiter
 * @description Rate Limiting 구현 (Upstash Redis 기반)
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import type { ApiErrorResponse } from '@forge-labs/types/bidding';

// ============================================================================
// 개발 모드 감지
// ============================================================================

const isDevelopment = process.env.NODE_ENV !== 'production';

// ============================================================================
// Redis 클라이언트 초기화
// ============================================================================

let redis: Redis | null = null;
let redisAvailable = true;

function getRedis(): Redis | null {
  if (!redisAvailable) return null;
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (isDevelopment) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[DEV] Upstash Redis 미설정 - Rate Limiting 비활성화');
      }
      redisAvailable = false;
      return null;
    }
    throw new Error('Upstash Redis 환경 변수가 설정되지 않았습니다');
  }

  redis = new Redis({ url, token });
  return redis;
}

// ============================================================================
// Rate Limiter 인스턴스
// ============================================================================

type RateLimitType = 'default' | 'api' | 'ai' | 'crawling' | 'auth';

interface RateLimitConfig {
  requests: number;
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`;
  prefix: string;
}

const RATE_LIMIT_CONFIGS: Record<RateLimitType, RateLimitConfig> = {
  default: { requests: 100, window: '1 m', prefix: 'rl:default' },
  api: { requests: 60, window: '1 m', prefix: 'rl:api' },
  ai: { requests: 10, window: '1 m', prefix: 'rl:ai' },       // AI 호출은 더 제한적
  crawling: { requests: 5, window: '1 m', prefix: 'rl:crawl' }, // 크롤링은 매우 제한적
  auth: { requests: 5, window: '15 m', prefix: 'rl:auth' },     // 인증 시도 제한
};

const rateLimiters = new Map<RateLimitType, Ratelimit>();

function getRateLimiter(type: RateLimitType): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  if (rateLimiters.has(type)) {
    return rateLimiters.get(type)!;
  }

  const config = RATE_LIMIT_CONFIGS[type];
  const limiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: config.prefix,
    analytics: true,
  });

  rateLimiters.set(type, limiter);
  return limiter;
}

// ============================================================================
// Rate Limit 체크 함수
// ============================================================================

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

/**
 * Rate Limit 체크
 * @param identifier - 식별자 (IP, 사용자 ID 등)
 * @param type - Rate Limit 유형
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'default'
): Promise<RateLimitResult> {
  try {
    const limiter = getRateLimiter(type);

    // 개발 모드에서 Redis 미설정 시 항상 통과
    if (!limiter) {
      return {
        success: true,
        remaining: 999,
        reset: Date.now() + 60000,
        limit: 999,
      };
    }

    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
      limit: result.limit,
    };
  } catch (error) {
    console.error('Rate limit 체크 실패:', error);
    // 오류 시 통과 (fail-open)
    return {
      success: true,
      remaining: -1,
      reset: Date.now() + 60000,
      limit: -1,
    };
  }
}

// ============================================================================
// Rate Limit 미들웨어
// ============================================================================

interface RateLimitMiddlewareConfig {
  type?: RateLimitType;
  getIdentifier?: (req: NextRequest) => string;
}

/**
 * Rate Limit 미들웨어
 * @param handler - API 핸들러 함수
 * @param config - Rate Limit 설정
 */
export function withRateLimit<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>,
  config: RateLimitMiddlewareConfig = {}
) {
  const {
    type = 'default',
    getIdentifier = defaultGetIdentifier,
  } = config;

  return async (request: NextRequest): Promise<NextResponse<T | ApiErrorResponse>> => {
    const identifier = getIdentifier(request);
    const result = await checkRateLimit(identifier, type);

    // Rate Limit 헤더 설정
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', String(result.limit));
    headers.set('X-RateLimit-Remaining', String(result.remaining));
    headers.set('X-RateLimit-Reset', String(result.reset));

    if (!result.success) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
      headers.set('Retry-After', String(retryAfter));

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `요청 한도를 초과했습니다. ${retryAfter}초 후에 다시 시도해 주세요.`,
            details: {
              limit: result.limit,
              remaining: result.remaining,
              reset: result.reset,
            },
          },
        },
        { status: 429, headers }
      );
    }

    // 정상 처리
    const response = await handler(request);

    // Rate Limit 헤더 추가
    const newHeaders = new Headers(response.headers);
    headers.forEach((value, key) => newHeaders.set(key, value));

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

// ============================================================================
// 식별자 추출 함수
// ============================================================================

/**
 * 기본 식별자 추출 (IP 주소)
 */
function defaultGetIdentifier(request: NextRequest): string {
  // Cloudflare, Vercel 등 프록시 뒤의 실제 IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // CF 연결 IP
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }

  // 기본값
  return 'unknown';
}

/**
 * 사용자 ID 기반 식별자 추출
 */
export function getUserIdentifier(userId: string): string {
  return `user:${userId}`;
}

/**
 * 복합 식별자 (IP + 엔드포인트)
 */
export function getEndpointIdentifier(request: NextRequest): string {
  const ip = defaultGetIdentifier(request);
  const path = new URL(request.url).pathname;
  return `${ip}:${path}`;
}

// ============================================================================
// 특수 Rate Limiter
// ============================================================================

/**
 * AI 호출 전용 Rate Limiter
 */
export async function checkAIRateLimit(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(`ai:${userId}`, 'ai');
}

/**
 * 크롤링 전용 Rate Limiter
 */
export async function checkCrawlingRateLimit(source: string): Promise<RateLimitResult> {
  return checkRateLimit(`crawl:${source}`, 'crawling');
}

/**
 * 인증 시도 Rate Limiter
 */
export async function checkAuthRateLimit(identifier: string): Promise<RateLimitResult> {
  return checkRateLimit(`auth:${identifier}`, 'auth');
}
