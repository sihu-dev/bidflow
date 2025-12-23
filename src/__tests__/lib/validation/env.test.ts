/**
 * env 환경 변수 검증 유닛 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('env', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    originalEnv = { ...process.env };
    originalWindow = (global as any).window;

    // window를 undefined로 설정 (서버 사이드 환경)
    delete (global as any).window;

    vi.clearAllMocks();

    // validatedEnv 캐시 초기화를 위해 모듈 재로드
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    (global as any).window = originalWindow;
  });

  // ============================================================================
  // maskApiKey 테스트
  // ============================================================================

  describe('maskApiKey', () => {
    it('8자 이상 키 마스킹', async () => {
      const { maskApiKey } = await import('@/lib/validation/env');
      const key = 'sk-ant-1234567890abcdef';
      const masked = maskApiKey(key);

      expect(masked).toBe('sk-a...cdef');
      expect(masked).toContain('...');
      expect(masked.length).toBeLessThan(key.length);
    });

    it('짧은 키는 모두 마스킹', async () => {
      const { maskApiKey } = await import('@/lib/validation/env');
      expect(maskApiKey('short')).toBe('****');
      expect(maskApiKey('12345')).toBe('****');
    });

    it('빈 문자열 처리', async () => {
      const { maskApiKey } = await import('@/lib/validation/env');
      expect(maskApiKey('')).toBe('****');
    });

    it('매우 긴 키도 처리', async () => {
      const { maskApiKey } = await import('@/lib/validation/env');
      const longKey = 'a'.repeat(100);
      const masked = maskApiKey(longKey);

      expect(masked).toContain('...');
      expect(masked.startsWith('aaaa')).toBe(true);
      expect(masked.endsWith('aaaa')).toBe(true);
    });

    it('특수문자 포함 키 마스킹', async () => {
      const { maskApiKey } = await import('@/lib/validation/env');
      const key = 'sk-test-api-key-123456';
      const masked = maskApiKey(key);

      expect(masked).toBe('sk-t...3456');
    });
  });

  // ============================================================================
  // hasEnv 테스트
  // ============================================================================

  describe('hasEnv', () => {
    it('존재하는 환경 변수 확인', async () => {
      process.env.NODE_ENV = 'test';

      // hasEnv는 validateEnv를 호출하므로 필수 변수 설정
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
      process.env.CSRF_SECRET = 'a'.repeat(32);

      const { hasEnv } = await import('@/lib/validation/env');
      const result = hasEnv('NODE_ENV');
      expect(result).toBe(true);
    });

    it('존재하지 않는 선택적 환경 변수', async () => {
      process.env.NODE_ENV = 'test';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
      process.env.CSRF_SECRET = 'a'.repeat(32);

      delete process.env.KAKAO_ALIMTALK_API_KEY;

      const { hasEnv } = await import('@/lib/validation/env');
      const result = hasEnv('KAKAO_ALIMTALK_API_KEY');
      expect(result).toBe(false);
    });

    it('빈 문자열은 존재하지 않는 것으로 간주', async () => {
      process.env.NODE_ENV = 'test';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
      process.env.CSRF_SECRET = 'a'.repeat(32);
      process.env.NARA_JANGTO_API_KEY = '';

      const { hasEnv } = await import('@/lib/validation/env');
      const result = hasEnv('NARA_JANGTO_API_KEY');
      expect(result).toBe(false);
    });
  });

  // ============================================================================
  // getEnv 테스트
  // ============================================================================

  describe('getEnv', () => {
    it('유효한 환경 변수 반환', async () => {
      process.env.NODE_ENV = 'test';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
      process.env.CSRF_SECRET = 'a'.repeat(32);

      const { getEnv } = await import('@/lib/validation/env');
      const env = getEnv();

      expect(env.NODE_ENV).toBe('test');
      expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
      expect(env.ANTHROPIC_API_KEY).toBe('test-anthropic-key');
    });

    it('선택적 환경 변수 처리', async () => {
      process.env.NODE_ENV = 'test';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
      process.env.CSRF_SECRET = 'a'.repeat(32);
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';

      const { getEnv } = await import('@/lib/validation/env');
      const env = getEnv();

      expect(env.SLACK_WEBHOOK_URL).toBe('https://hooks.slack.com/test');
    });

    it('기본값 적용 (NEXT_PUBLIC_APP_URL)', async () => {
      process.env.NODE_ENV = 'test';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
      process.env.CSRF_SECRET = 'a'.repeat(32);

      delete process.env.NEXT_PUBLIC_APP_URL;

      const { getEnv } = await import('@/lib/validation/env');
      const env = getEnv();

      expect(env.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3010');
    });
  });

  // ============================================================================
  // validateEnv 테스트
  // ============================================================================

  describe('validateEnv', () => {
    it('모든 필수 환경 변수가 있으면 성공', async () => {
      process.env.NODE_ENV = 'test';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
      process.env.CSRF_SECRET = 'a'.repeat(32);

      const { validateEnv } = await import('@/lib/validation/env');
      const env = validateEnv();

      expect(env).toBeDefined();
      expect(env.ANTHROPIC_API_KEY).toBe('test-anthropic-key');
    });

    it('잘못된 URL 형식은 실패', async () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'invalid-url';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
      process.env.CSRF_SECRET = 'a'.repeat(32);

      const { validateEnv } = await import('@/lib/validation/env');
      expect(() => validateEnv()).toThrow('환경 변수 검증 실패');
    });

    it('CSRF Secret 최소 길이 검증', async () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
      process.env.CSRF_SECRET = 'short'; // 32자 미만

      const { validateEnv } = await import('@/lib/validation/env');
      expect(() => validateEnv()).toThrow('환경 변수 검증 실패');
    });

    it('NODE_ENV 기본값 적용', async () => {
      delete process.env.NODE_ENV;
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
      process.env.CSRF_SECRET = 'a'.repeat(32);

      const { validateEnv } = await import('@/lib/validation/env');
      const env = validateEnv();

      expect(env.NODE_ENV).toBe('development');
    });

    it('선택적 환경 변수는 누락 가능', async () => {
      process.env.NODE_ENV = 'test';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
      process.env.CSRF_SECRET = 'a'.repeat(32);

      delete process.env.NARA_JANGTO_API_KEY;
      delete process.env.SLACK_WEBHOOK_URL;

      const { validateEnv } = await import('@/lib/validation/env');
      const env = validateEnv();

      expect(env).toBeDefined();
      expect(env.NARA_JANGTO_API_KEY).toBeUndefined();
    });
  });

  // ============================================================================
  // 환경별 동작 테스트
  // ============================================================================

  describe('환경별 동작', () => {
    it('프로덕션: 검증 실패 시 에러 throw', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ANTHROPIC_API_KEY;

      const { validateEnv } = await import('@/lib/validation/env');
      expect(() => validateEnv()).toThrow();
    });

    it('개발: 검증 실패 시 경고만 표시', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.ANTHROPIC_API_KEY;

      // 개발 환경에서는 에러를 던지지 않음
      const { validateEnv } = await import('@/lib/validation/env');
      const env = validateEnv();
      expect(env).toBeDefined();
    });
  });
});
