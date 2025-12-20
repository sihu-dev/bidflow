/**
 * Auth Middleware 유닛 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasRole } from '@/lib/security/auth-middleware';

// Mock modules
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
}));

describe('auth-middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
