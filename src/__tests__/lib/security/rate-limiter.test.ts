/**
 * Rate Limiter 유닛 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkRateLimit,
  getUserIdentifier,
  getEndpointIdentifier,
  checkAIRateLimit,
  checkCrawlingRateLimit,
  checkAuthRateLimit,
} from '@/lib/security/rate-limiter';

// Mock Upstash
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(() => ({
    // Mock Redis methods if needed
  })),
}));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn(() => ({
    limit: vi.fn(() => Promise.resolve({
      success: true,
      remaining: 99,
      reset: Date.now() + 60000,
      limit: 100,
    })),
  })),
}));

describe('rate-limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env for development mode (no Redis)
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
  });

  describe('checkRateLimit', () => {
    it('개발 모드에서 항상 성공 반환 (Redis 미설정)', async () => {
      const result = await checkRateLimit('test-ip', 'default');

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(999); // Dev mode value
    });

    it('다양한 타입 지원', async () => {
      const types = ['default', 'api', 'ai', 'crawling', 'auth'] as const;

      for (const type of types) {
        const result = await checkRateLimit('test-ip', type);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('getUserIdentifier', () => {
    it('사용자 ID 기반 식별자 생성', () => {
      const userId = 'user-123';
      const identifier = getUserIdentifier(userId);
      expect(identifier).toBe('user:user-123');
    });

    it('고유한 식별자 생성', () => {
      const id1 = getUserIdentifier('user1');
      const id2 = getUserIdentifier('user2');
      expect(id1).not.toBe(id2);
    });
  });

  describe('getEndpointIdentifier', () => {
    it('IP와 경로 조합 식별자 생성', () => {
      const mockRequest = {
        url: 'https://example.com/api/v1/bids',
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'x-forwarded-for') return '192.168.1.1';
            return null;
          }),
        },
      };

      // @ts-expect-error - mock request
      const identifier = getEndpointIdentifier(mockRequest);
      expect(identifier).toContain('192.168.1.1');
      expect(identifier).toContain('/api/v1/bids');
    });

    it('x-real-ip 헤더 지원', () => {
      const mockRequest = {
        url: 'https://example.com/api',
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'x-real-ip') return '10.0.0.1';
            return null;
          }),
        },
      };

      // @ts-expect-error - mock request
      const identifier = getEndpointIdentifier(mockRequest);
      expect(identifier).toContain('10.0.0.1');
    });

    it('Cloudflare IP 헤더 지원', () => {
      const mockRequest = {
        url: 'https://example.com/api',
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'cf-connecting-ip') return '172.16.0.1';
            return null;
          }),
        },
      };

      // @ts-expect-error - mock request
      const identifier = getEndpointIdentifier(mockRequest);
      expect(identifier).toContain('172.16.0.1');
    });

    it('헤더 없을 때 unknown 반환', () => {
      const mockRequest = {
        url: 'https://example.com/api',
        headers: {
          get: vi.fn(() => null),
        },
      };

      // @ts-expect-error - mock request
      const identifier = getEndpointIdentifier(mockRequest);
      expect(identifier).toContain('unknown');
    });
  });

  describe('특수 Rate Limiter', () => {
    it('AI Rate Limiter', async () => {
      const result = await checkAIRateLimit('user-123');
      expect(result.success).toBe(true);
    });

    it('크롤링 Rate Limiter', async () => {
      const result = await checkCrawlingRateLimit('narajangto');
      expect(result.success).toBe(true);
    });

    it('인증 Rate Limiter', async () => {
      const result = await checkAuthRateLimit('192.168.1.1');
      expect(result.success).toBe(true);
    });
  });

  describe('Rate Limit 결과 구조', () => {
    it('올바른 결과 구조 반환', async () => {
      const result = await checkRateLimit('test', 'default');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('reset');
      expect(result).toHaveProperty('limit');

      expect(typeof result.success).toBe('boolean');
      expect(typeof result.remaining).toBe('number');
      expect(typeof result.reset).toBe('number');
      expect(typeof result.limit).toBe('number');
    });
  });
});
