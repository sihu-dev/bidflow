/**
 * CSRF 보호 유닛 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import {
  generateCSRFToken,
  hashCSRFToken,
  verifyCSRFToken,
  validateOrigin,
  withCSRF,
  createCSRFResponse,
} from '@/lib/security/csrf';

// Environment setup
vi.stubEnv('CSRF_SECRET', 'test-csrf-secret-key-12345');
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://bidflow.example.com');
vi.stubEnv('NODE_ENV', 'test');

// ============================================================================
// 테스트 헬퍼
// ============================================================================

function createMockRequest(options: {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
} = {}): NextRequest {
  const headers = new Headers(options.headers || {});
  const url = options.url || 'http://localhost:3010/api/test';
  const method = options.method || 'POST';

  const request = new NextRequest(url, { method, headers });

  // 쿠키 모킹
  if (options.cookies) {
    Object.entries(options.cookies).forEach(([name, value]) => {
      vi.spyOn(request.cookies, 'get').mockImplementation((cookieName) => {
        if (cookieName === name) {
          return { name, value } as any;
        }
        return undefined;
      });
    });
  }

  return request;
}

describe('csrf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateCSRFToken', () => {
    it('32바이트(64자) 토큰 생성', () => {
      const token = generateCSRFToken();
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    it('매 호출마다 다른 토큰 생성', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(token1).not.toBe(token2);
    });

    it('토큰이 hex 형식', () => {
      const token = generateCSRFToken();
      expect(token).toMatch(/^[0-9a-f]+$/i);
    });
  });

  describe('hashCSRFToken', () => {
    it('동일 입력에 동일 해시 반환', () => {
      const token = 'test-token-123';
      const hash1 = hashCSRFToken(token);
      const hash2 = hashCSRFToken(token);
      expect(hash1).toBe(hash2);
    });

    it('다른 입력에 다른 해시 반환', () => {
      const hash1 = hashCSRFToken('token1');
      const hash2 = hashCSRFToken('token2');
      expect(hash1).not.toBe(hash2);
    });

    it('해시가 64자 (SHA-256)', () => {
      const hash = hashCSRFToken('test');
      expect(hash).toHaveLength(64);
    });
  });

  describe('verifyCSRFToken', () => {
    it('유효한 토큰 검증 성공', () => {
      const token = generateCSRFToken();
      const hash = hashCSRFToken(token);
      expect(verifyCSRFToken(token, hash)).toBe(true);
    });

    it('잘못된 토큰 검증 실패', () => {
      const token = generateCSRFToken();
      const hash = hashCSRFToken(token);
      expect(verifyCSRFToken('wrong-token', hash)).toBe(false);
    });

    it('잘못된 해시 검증 실패', () => {
      const token = generateCSRFToken();
      expect(verifyCSRFToken(token, 'wrong-hash')).toBe(false);
    });

    it('빈 토큰 검증 실패', () => {
      const hash = hashCSRFToken('token');
      expect(verifyCSRFToken('', hash)).toBe(false);
    });

    it('길이가 다른 해시 검증 실패', () => {
      const token = generateCSRFToken();
      expect(verifyCSRFToken(token, 'short')).toBe(false);
    });
  });

  describe('validateOrigin', () => {
    it('유효한 origin 검증 성공', () => {
      const mockRequest = {
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'origin') return 'https://bidflow.example.com';
            if (name === 'host') return 'bidflow.example.com';
            return null;
          }),
        },
      };
      // @ts-expect-error - mock request
      expect(validateOrigin(mockRequest)).toBe(true);
    });

    it('유효한 referer 검증 성공', () => {
      const mockRequest = {
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'origin') return null;
            if (name === 'referer') return 'https://bidflow.example.com/page';
            if (name === 'host') return 'bidflow.example.com';
            return null;
          }),
        },
      };
      // @ts-expect-error - mock request
      expect(validateOrigin(mockRequest)).toBe(true);
    });

    it('host 없으면 검증 실패', () => {
      const mockRequest = {
        headers: {
          get: vi.fn(() => null),
        },
      };
      // @ts-expect-error - mock request
      expect(validateOrigin(mockRequest)).toBe(false);
    });

    it('다른 origin 검증 실패', () => {
      const mockRequest = {
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'origin') return 'https://evil.com';
            if (name === 'host') return 'bidflow.example.com';
            return null;
          }),
        },
      };
      // @ts-expect-error - mock request
      expect(validateOrigin(mockRequest)).toBe(false);
    });
  });

  // ============================================================================
  // withCSRF 미들웨어 테스트
  // ============================================================================

  describe('withCSRF', () => {
    it('GET 요청은 CSRF 검증 없이 통과 (기본 면제 메서드)', async () => {
      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withCSRF(handler);
      const request = createMockRequest({ method: 'GET' });

      const response = await middleware(request);

      expect(handler).toHaveBeenCalledWith(request);
      expect(response.status).toBe(200);
    });

    it('HEAD 요청은 CSRF 검증 없이 통과', async () => {
      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withCSRF(handler);
      const request = createMockRequest({ method: 'HEAD' });

      const response = await middleware(request);

      expect(handler).toHaveBeenCalled();
    });

    it('OPTIONS 요청은 CSRF 검증 없이 통과', async () => {
      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withCSRF(handler);
      const request = createMockRequest({ method: 'OPTIONS' });

      const response = await middleware(request);

      expect(handler).toHaveBeenCalled();
    });

    it('면제된 경로는 CSRF 검증 없이 통과 (/api/health)', async () => {
      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withCSRF(handler);
      const request = createMockRequest({ url: 'http://localhost:3010/api/health', method: 'POST' });

      const response = await middleware(request);

      expect(handler).toHaveBeenCalled();
    });

    it('면제된 경로는 CSRF 검증 없이 통과 (/api/webhooks)', async () => {
      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withCSRF(handler);
      const request = createMockRequest({ url: 'http://localhost:3010/api/webhooks/stripe', method: 'POST' });

      const response = await middleware(request);

      expect(handler).toHaveBeenCalled();
    });

    it('POST 요청 + CSRF 헤더 없음: CSRF_TOKEN_MISSING', async () => {
      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withCSRF(handler);
      const request = createMockRequest({ method: 'POST' });

      const response = await middleware(request);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('CSRF_TOKEN_MISSING');
    });

    it('POST 요청 + CSRF 쿠키 없음: CSRF_TOKEN_MISSING', async () => {
      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withCSRF(handler);
      const request = createMockRequest({
        method: 'POST',
        headers: { 'x-csrf-token': 'test-token' },
      });

      const response = await middleware(request);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('CSRF_TOKEN_MISSING');
    });

    it('잘못된 CSRF 토큰: CSRF_TOKEN_INVALID', async () => {
      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withCSRF(handler);

      const token = generateCSRFToken();
      const hashedToken = hashCSRFToken(token);

      const request = createMockRequest({
        method: 'POST',
        headers: { 'x-csrf-token': 'wrong-token' },
        cookies: { 'csrf-token': hashedToken },
      });

      const response = await middleware(request);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('CSRF_TOKEN_INVALID');
    });

    it('올바른 CSRF 토큰: 성공', async () => {
      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withCSRF(handler);

      const token = generateCSRFToken();
      const hashedToken = hashCSRFToken(token);

      const request = createMockRequest({
        method: 'POST',
        headers: { 'x-csrf-token': token },
        cookies: { 'csrf-token': hashedToken },
      });

      const response = await middleware(request);

      expect(handler).toHaveBeenCalledWith(request);
      expect(response.status).toBe(200);
    });

    it('커스텀 면제 경로 설정', async () => {
      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withCSRF(handler, { exemptPaths: ['/api/custom'] });
      const request = createMockRequest({ url: 'http://localhost:3010/api/custom/endpoint', method: 'POST' });

      const response = await middleware(request);

      expect(handler).toHaveBeenCalled();
    });

    it('커스텀 면제 메서드 설정', async () => {
      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withCSRF(handler, { exemptMethods: ['GET', 'DELETE'] });
      const request = createMockRequest({ method: 'DELETE' });

      const response = await middleware(request);

      expect(handler).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // createCSRFResponse 테스트
  // ============================================================================

  describe('createCSRFResponse', () => {
    it('CSRF 토큰 생성 및 응답 반환', async () => {
      const response = createCSRFResponse();
      const body = await response.json();

      expect(body).toHaveProperty('token');
      expect(body.token).toHaveLength(64); // 32 bytes hex = 64 chars
    });

    it('쿠키에 해시된 토큰 설정', () => {
      const response = createCSRFResponse();
      const cookies = response.cookies;

      expect(cookies.get('csrf-token')).toBeDefined();
    });

    it('쿠키 옵션 확인', () => {
      const response = createCSRFResponse();
      const cookie = response.cookies.get('csrf-token');

      expect(cookie).toBeDefined();
      if (cookie) {
        expect(cookie.httpOnly).toBe(true);
        expect(cookie.sameSite).toBe('lax');
        expect(cookie.path).toBe('/');
        expect(cookie.maxAge).toBe(60 * 60 * 24); // 24시간
      }
    });

    it('매 호출마다 다른 토큰 생성', async () => {
      const response1 = createCSRFResponse();
      const response2 = createCSRFResponse();

      const body1 = await response1.json();
      const body2 = await response2.json();

      expect(body1.token).not.toBe(body2.token);
    });
  });
});
