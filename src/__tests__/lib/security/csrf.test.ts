/**
 * CSRF 보호 유닛 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateCSRFToken,
  hashCSRFToken,
  verifyCSRFToken,
  validateOrigin,
} from '@/lib/security/csrf';

// Environment setup
vi.stubEnv('CSRF_SECRET', 'test-csrf-secret-key-12345');
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://bidflow.example.com');

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
});
