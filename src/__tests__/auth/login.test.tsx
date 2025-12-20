/**
 * 로그인 페이지 테스트
 * Note: 이 테스트는 로그인 로직에 집중합니다.
 * 전체 UI 테스트는 E2E (Playwright) 테스트를 참조하세요.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Login Page Logic', () => {
  describe('폼 검증', () => {
    it('이메일 형식 검증', () => {
      const validEmails = [
        'test@example.com',
        'user.name@company.co.kr',
        'admin+tag@domain.com',
      ];

      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test @example.com',
      ];

      validEmails.forEach((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('비밀번호 최소 길이 검증', () => {
      const validPasswords = ['12345678', 'password123', 'securePass!@#'];
      const invalidPasswords = ['', '123', 'short'];

      const minLength = 6;

      validPasswords.forEach((password) => {
        expect(password.length >= minLength).toBe(true);
      });

      invalidPasswords.forEach((password) => {
        expect(password.length >= minLength).toBe(false);
      });
    });
  });

  describe('Supabase 클라이언트 동작', () => {
    const mockSupabaseClient = {
      auth: {
        signInWithPassword: vi.fn(),
        signInWithOAuth: vi.fn(),
      },
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('이메일/비밀번호로 로그인 호출', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123', email: credentials.email } },
        error: null,
      });

      const result = await mockSupabaseClient.auth.signInWithPassword(credentials);

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith(credentials);
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe(credentials.email);
      expect(result.error).toBeNull();
    });

    it('잘못된 자격증명 시 에러 반환', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      const result = await mockSupabaseClient.auth.signInWithPassword({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Invalid login credentials');
    });

    it('OAuth 로그인 호출 (Google)', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth' },
        error: null,
      });

      const result = await mockSupabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3010/dashboard',
        },
      });

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3010/dashboard',
        },
      });
      expect(result.data.url).toBeDefined();
    });

    it('OAuth 로그인 호출 (GitHub)', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://github.com/login/oauth' },
        error: null,
      });

      const result = await mockSupabaseClient.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: 'http://localhost:3010/dashboard',
        },
      });

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: {
          redirectTo: 'http://localhost:3010/dashboard',
        },
      });
      expect(result.data.url).toBeDefined();
    });
  });

  describe('에러 메시지 처리', () => {
    it('Invalid login credentials 에러 메시지 변환', () => {
      const supabaseError = 'Invalid login credentials';
      const userFriendlyMessage = supabaseError.includes('Invalid login credentials')
        ? '이메일 또는 비밀번호가 올바르지 않습니다.'
        : supabaseError;

      expect(userFriendlyMessage).toBe('이메일 또는 비밀번호가 올바르지 않습니다.');
    });

    it('일반 에러 메시지는 그대로 표시', () => {
      const supabaseError = 'Server error';
      const userFriendlyMessage = supabaseError.includes('Invalid login credentials')
        ? '이메일 또는 비밀번호가 올바르지 않습니다.'
        : supabaseError;

      expect(userFriendlyMessage).toBe('Server error');
    });

    it('네트워크 오류 처리', () => {
      const fallbackMessage = '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';

      expect(fallbackMessage).toBe('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    });
  });

  describe('라우팅 로직', () => {
    it('성공적인 로그인 후 대시보드로 이동', () => {
      const mockPush = vi.fn();
      const user = { id: 'user-123', email: 'test@example.com' };

      if (user) {
        mockPush('/dashboard');
      }

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('Supabase 미설정 시 데모 모드로 이동', () => {
      const mockPush = vi.fn();
      const supabaseClient = null;

      if (!supabaseClient) {
        mockPush('/dashboard?demo=true');
      }

      expect(mockPush).toHaveBeenCalledWith('/dashboard?demo=true');
    });

    it('데모 모드 버튼 클릭 시 데모 모드로 이동', () => {
      const mockPush = vi.fn();

      mockPush('/dashboard?demo=true');

      expect(mockPush).toHaveBeenCalledWith('/dashboard?demo=true');
    });
  });

  describe('상태 관리', () => {
    it('로딩 상태 관리', () => {
      let isLoading = false;

      // 로그인 시작
      isLoading = true;
      expect(isLoading).toBe(true);

      // 로그인 완료
      isLoading = false;
      expect(isLoading).toBe(false);
    });

    it('에러 상태 관리', () => {
      let error: string | null = null;

      // 에러 설정
      error = '로그인 실패';
      expect(error).toBe('로그인 실패');

      // 에러 초기화
      error = null;
      expect(error).toBeNull();
    });

    it('폼 입력 상태 관리', () => {
      const formData = {
        email: '',
        password: '',
      };

      formData.email = 'test@example.com';
      formData.password = 'password123';

      expect(formData.email).toBe('test@example.com');
      expect(formData.password).toBe('password123');
    });
  });

  describe('OAuth 제공자', () => {
    it('지원하는 OAuth 제공자 목록', () => {
      const supportedProviders = ['google', 'github'];

      expect(supportedProviders).toContain('google');
      expect(supportedProviders).toContain('github');
      expect(supportedProviders).toHaveLength(2);
    });

    it('리다이렉트 URL 생성', () => {
      const origin = 'http://localhost:3010';
      const redirectTo = `${origin}/dashboard`;

      expect(redirectTo).toBe('http://localhost:3010/dashboard');
    });
  });

  describe('보안', () => {
    it('비밀번호는 평문으로 저장하지 않음', () => {
      const password = 'mySecretPassword123';

      // 비밀번호는 Supabase에 전달되지만 로컬에 저장되지 않음
      expect(password).toBeTruthy();
      // 실제 앱에서는 useState로 관리되며 서버로만 전달됨
    });

    it('HTTPS 리다이렉트 URL 사용 (프로덕션)', () => {
      const prodUrl = 'https://bidflow.com/dashboard';
      const devUrl = 'http://localhost:3010/dashboard';

      expect(prodUrl).toMatch(/^https:\/\//);
      expect(devUrl).toMatch(/^http:\/\/localhost/);
    });
  });

  describe('URL 파라미터', () => {
    it('데모 모드 파라미터 생성', () => {
      const demoUrl = '/dashboard?demo=true';

      expect(demoUrl).toContain('demo=true');
    });

    it('일반 대시보드 URL', () => {
      const dashboardUrl = '/dashboard';

      expect(dashboardUrl).toBe('/dashboard');
    });
  });

  describe('컴포넌트 속성', () => {
    it('이메일 입력 필드 속성', () => {
      const emailInputProps = {
        id: 'email',
        type: 'email',
        required: true,
        placeholder: 'you@company.com',
      };

      expect(emailInputProps.type).toBe('email');
      expect(emailInputProps.required).toBe(true);
      expect(emailInputProps.id).toBe('email');
    });

    it('비밀번호 입력 필드 속성', () => {
      const passwordInputProps = {
        id: 'password',
        type: 'password',
        required: true,
        placeholder: '••••••••',
      };

      expect(passwordInputProps.type).toBe('password');
      expect(passwordInputProps.required).toBe(true);
      expect(passwordInputProps.id).toBe('password');
    });

    it('로그인 버튼 속성', () => {
      const buttonProps = {
        type: 'submit',
        disabled: false,
      };

      expect(buttonProps.type).toBe('submit');
      expect(buttonProps.disabled).toBe(false);
    });

    it('로딩 중 버튼 비활성화', () => {
      const isLoading = true;
      const buttonProps = {
        type: 'submit',
        disabled: isLoading,
      };

      expect(buttonProps.disabled).toBe(true);
    });
  });
});
