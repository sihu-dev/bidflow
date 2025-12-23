/**
 * Auth Middleware 유닛 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withApiKey, hasRole } from '@/lib/security/auth-middleware';

// ============================================================================
// Mocks
// ============================================================================

// Supabase SSR 모킹
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

// Logger 모킹
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// ============================================================================
// 테스트 헬퍼
// ============================================================================

function createMockRequest(options: {
  headers?: Record<string, string>;
  cookies?: Array<{ name: string; value: string }>;
} = {}): NextRequest {
  const headers = new Headers(options.headers || {});
  const url = 'http://localhost:3010/api/test';

  const request = new NextRequest(url, { headers });

  // 쿠키 모킹
  if (options.cookies) {
    vi.spyOn(request.cookies, 'getAll').mockReturnValue(options.cookies);
  }

  return request;
}

describe('auth-middleware', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.clearAllMocks();

    // 기본 체인 설정
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ============================================================================
  // withAuth 테스트
  // ============================================================================

  describe('withAuth', () => {
    it('requireAuth=false: 인증 없이 핸들러 실행', async () => {
      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withAuth(handler, { requireAuth: false });
      const request = createMockRequest();

      const response = await middleware(request);

      expect(handler).toHaveBeenCalledWith(request);
      expect(response.status).toBe(200);
    });

    it('개발 모드 + Supabase 미설정: Mock 사용자 사용', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const handler = vi.fn(async (req) => {
        expect(req.userId).toBe('dev-user-001');
        expect(req.userEmail).toBe('dev@bidflow.local');
        expect(req.userRole).toBe('admin');
        return NextResponse.json({ data: 'success' });
      });

      const middleware = withAuth(handler);
      const request = createMockRequest();

      const response = await middleware(request);

      expect(handler).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('유효한 세션 + 역할 권한 있음: 성공', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      mockSingle.mockResolvedValue({
        data: { role: 'admin' },
        error: null,
      });

      const handler = vi.fn(async (req) => {
        expect(req.userId).toBe('user-123');
        expect(req.userEmail).toBe('test@example.com');
        expect(req.userRole).toBe('admin');
        return NextResponse.json({ data: 'success' });
      });

      const middleware = withAuth(handler, { allowedRoles: ['admin', 'user'] });
      const request = createMockRequest();

      const response = await middleware(request);

      expect(handler).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('세션 없음: UNAUTHORIZED', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No session' },
      });

      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withAuth(handler);
      const request = createMockRequest();

      const response = await middleware(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('역할 권한 부족: FORBIDDEN', async () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      mockSingle.mockResolvedValue({
        data: { role: 'viewer' },
        error: null,
      });

      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withAuth(handler, { allowedRoles: ['admin'] });
      const request = createMockRequest();

      const response = await middleware(request);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('FORBIDDEN');
    });
  });

  // ============================================================================
  // withApiKey 테스트
  // ============================================================================

  describe('withApiKey', () => {
    it('Authorization 헤더 없음: MISSING_API_KEY', async () => {
      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withApiKey(handler);
      const request = createMockRequest();

      const response = await middleware(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('MISSING_API_KEY');
    });

    it('Bearer 형식 아님: MISSING_API_KEY', async () => {
      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withApiKey(handler);
      const request = createMockRequest({ headers: { Authorization: 'Basic dGVzdA==' } });

      const response = await middleware(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('MISSING_API_KEY');
    });

    it('환경 변수 미설정: CONFIG_ERROR', async () => {
      delete process.env.API_SECRET_KEY;

      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withApiKey(handler);
      const request = createMockRequest({ headers: { Authorization: 'Bearer test-key' } });

      const response = await middleware(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('CONFIG_ERROR');
    });

    it('잘못된 API Key: INVALID_API_KEY', async () => {
      process.env.API_SECRET_KEY = 'correct-secret-key';

      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withApiKey(handler);
      const request = createMockRequest({ headers: { Authorization: 'Bearer wrong-key' } });

      const response = await middleware(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_API_KEY');
    });

    it('유효한 API Key: 성공', async () => {
      process.env.API_SECRET_KEY = 'correct-secret-key';

      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withApiKey(handler);
      const request = createMockRequest({ headers: { Authorization: 'Bearer correct-secret-key' } });

      const response = await middleware(request);

      expect(handler).toHaveBeenCalledWith(request);
      expect(response.status).toBe(200);
    });

    it('커스텀 환경 변수 사용', async () => {
      process.env.CUSTOM_API_KEY = 'custom-key-value';

      const handler = vi.fn(async () => NextResponse.json({ data: 'success' }));
      const middleware = withApiKey(handler, 'CUSTOM_API_KEY');
      const request = createMockRequest({ headers: { Authorization: 'Bearer custom-key-value' } });

      const response = await middleware(request);

      expect(handler).toHaveBeenCalledWith(request);
      expect(response.status).toBe(200);
    });
  });

  // ============================================================================
  // hasRole 테스트
  // ============================================================================

  describe('hasRole', () => {
    it('admin은 모든 역할에 접근 가능', () => {
      expect(hasRole('admin', 'admin')).toBe(true);
      expect(hasRole('admin', 'user')).toBe(true);
      expect(hasRole('admin', 'viewer')).toBe(true);
    });

    it('user는 user와 viewer에 접근 가능', () => {
      expect(hasRole('user', 'admin')).toBe(false);
      expect(hasRole('user', 'user')).toBe(true);
      expect(hasRole('user', 'viewer')).toBe(true);
    });

    it('viewer는 viewer에만 접근 가능', () => {
      expect(hasRole('viewer', 'admin')).toBe(false);
      expect(hasRole('viewer', 'user')).toBe(false);
      expect(hasRole('viewer', 'viewer')).toBe(true);
    });
  });

  describe('역할 계층 구조', () => {
    it('역할 계층이 올바르게 설정됨', () => {
      // admin > user > viewer
      expect(hasRole('admin', 'viewer')).toBe(true);
      expect(hasRole('viewer', 'admin')).toBe(false);
    });
  });

  describe('권한 검증 시나리오', () => {
    it('관리자 전용 기능 접근', () => {
      const requiredRole = 'admin';
      expect(hasRole('admin', requiredRole)).toBe(true);
      expect(hasRole('user', requiredRole)).toBe(false);
      expect(hasRole('viewer', requiredRole)).toBe(false);
    });

    it('일반 사용자 기능 접근', () => {
      const requiredRole = 'user';
      expect(hasRole('admin', requiredRole)).toBe(true);
      expect(hasRole('user', requiredRole)).toBe(true);
      expect(hasRole('viewer', requiredRole)).toBe(false);
    });

    it('읽기 전용 기능 접근', () => {
      const requiredRole = 'viewer';
      expect(hasRole('admin', requiredRole)).toBe(true);
      expect(hasRole('user', requiredRole)).toBe(true);
      expect(hasRole('viewer', requiredRole)).toBe(true);
    });
  });
});
