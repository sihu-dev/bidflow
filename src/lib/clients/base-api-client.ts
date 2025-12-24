/**
 * @module clients/base-api-client
 * @description 외부 API 클라이언트 베이스 클래스
 * - 재시도 로직 (Exponential Backoff)
 * - 타임아웃 설정
 * - 캐싱 레이어
 * - 공통 에러 처리
 */

import { logger } from '@/lib/utils/logger';

// ============================================================================
// 타입 정의
// ============================================================================

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cacheKey?: string;
  cacheTTL?: number;
}

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class APIClientError extends Error {
  constructor(
    message: string,
    public source: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'APIClientError';
  }
}

// ============================================================================
// 캐시 구현
// ============================================================================

class APICache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5분

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttl ?? this.defaultTTL),
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 만료된 항목 정리
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// 싱글톤 캐시 인스턴스
const globalCache = new APICache();

// ============================================================================
// 베이스 API 클라이언트
// ============================================================================

export abstract class BaseAPIClient {
  protected abstract readonly source: string;
  protected abstract readonly baseUrl: string;

  protected timeout = 30000; // 30초
  protected maxRetries = 3;
  protected retryDelay = 1000; // 1초
  protected cache = globalCache;

  /**
   * 재시도 로직이 포함된 fetch
   */
  protected async fetchWithRetry<T>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const {
      timeout = this.timeout,
      retries = this.maxRetries,
      retryDelay = this.retryDelay,
      cacheKey,
      cacheTTL,
      ...fetchOptions
    } = options;

    // 캐시 확인
    if (cacheKey) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        logger.debug(`[${this.source}] Cache hit: ${cacheKey}`);
        return cached;
      }
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await this.fetchWithTimeout<T>(url, fetchOptions, timeout);

        // 성공 시 캐시 저장
        if (cacheKey) {
          this.cache.set(cacheKey, result, cacheTTL);
        }

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        const isRetryable = this.isRetryableError(lastError);
        const isLastAttempt = attempt === retries;

        if (!isRetryable || isLastAttempt) {
          throw new APIClientError(
            lastError.message,
            this.source,
            this.extractStatusCode(lastError),
            isRetryable
          );
        }

        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        logger.warn(
          `[${this.source}] Retry ${attempt + 1}/${retries} after ${delay}ms: ${lastError.message}`
        );
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  /**
   * 타임아웃이 포함된 fetch
   */
  private async fetchWithTimeout<T>(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new APIClientError(
          `${this.source} API 오류 (${response.status}): ${errorText}`,
          this.source,
          response.status,
          this.isRetryableStatus(response.status)
        );
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 재시도 가능한 에러인지 확인
   */
  private isRetryableError(error: Error): boolean {
    // AbortError (timeout)
    if (error.name === 'AbortError') return true;

    // Network errors
    if (error.message.includes('fetch failed')) return true;
    if (error.message.includes('network')) return true;

    // APIClientError with retryable flag
    if (error instanceof APIClientError) return error.retryable;

    return false;
  }

  /**
   * 재시도 가능한 HTTP 상태 코드인지 확인
   */
  private isRetryableStatus(status: number): boolean {
    return [408, 429, 500, 502, 503, 504].includes(status);
  }

  /**
   * 에러에서 상태 코드 추출
   */
  private extractStatusCode(error: Error): number | undefined {
    if (error instanceof APIClientError) return error.statusCode;
    const match = error.message.match(/\((\d{3})\)/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  /**
   * 딜레이 유틸리티
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 캐시 관리 메서드
   */
  clearCache(): void {
    this.cache.clear();
  }

  cleanupCache(): void {
    this.cache.cleanup();
  }
}

// ============================================================================
// 환경 설정 헬퍼
// ============================================================================

/**
 * CORS 허용 도메인 가져오기
 */
export function getAllowedOrigins(): string[] {
  const origins = process.env.ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_APP_URL || '';
  if (!origins) {
    // 개발 환경에서는 localhost 허용
    if (process.env.NODE_ENV !== 'production') {
      return ['http://localhost:3010', 'http://localhost:3000'];
    }
    return [];
  }
  return origins.split(',').map((o) => o.trim());
}

/**
 * CORS 헤더 생성
 */
export function getCorsHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigins = getAllowedOrigins();

  // Origin 검증
  let allowOrigin = '';
  if (origin && allowedOrigins.includes(origin)) {
    allowOrigin = origin;
  } else if (allowedOrigins.length > 0) {
    allowOrigin = allowedOrigins[0];
  }

  // 개발 환경에서는 더 관대하게
  if (process.env.NODE_ENV !== 'production' && !allowOrigin) {
    allowOrigin = origin || '*';
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}
