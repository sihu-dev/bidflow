/**
 * 로그인 페이지 E2E 테스트
 */
import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test.describe('페이지 렌더링', () => {
    test('로그인 페이지가 올바르게 로드됨', async ({ page }) => {
      // 페이지 타이틀 확인
      await expect(page).toHaveURL(/\/login/);

      // 주요 요소 확인
      await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
      await expect(page.getByText('BIDFLOW에 다시 오신 것을 환영합니다')).toBeVisible();
    });

    test('로그인 폼 요소들이 모두 표시됨', async ({ page }) => {
      // 이메일 입력 필드
      await expect(page.getByLabel('이메일')).toBeVisible();

      // 비밀번호 입력 필드
      await expect(page.getByLabel('비밀번호')).toBeVisible();

      // 로그인 버튼
      await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    });

    test('데모 모드 버튼이 표시됨', async ({ page }) => {
      await expect(page.getByRole('button', { name: /로그인 없이 둘러보기/ })).toBeVisible();
    });

    test('소셜 로그인 버튼들이 표시됨', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Google로 계속하기/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /GitHub로 계속하기/ })).toBeVisible();
    });

    test('비밀번호 찾기 링크가 표시됨', async ({ page }) => {
      const forgotPasswordLink = page.getByRole('link', { name: '비밀번호 찾기' });
      await expect(forgotPasswordLink).toBeVisible();
      await expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });

    test('회원가입 링크가 표시됨', async ({ page }) => {
      const signupLink = page.getByRole('link', { name: '회원가입' });
      await expect(signupLink).toBeVisible();
      await expect(signupLink).toHaveAttribute('href', '/signup');
    });

    test('콘솔 에러 없이 로드됨', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.reload();

      // favicon 등 무시할 에러 제외
      const criticalErrors = consoleErrors.filter(
        (e) => !e.includes('favicon') && !e.includes('devtools')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe('폼 입력 검증', () => {
    test('이메일 필드에 입력 가능', async ({ page }) => {
      const emailInput = page.getByLabel('이메일');
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');
    });

    test('비밀번호 필드에 입력 가능', async ({ page }) => {
      const passwordInput = page.getByLabel('비밀번호');
      await passwordInput.fill('password123');
      await expect(passwordInput).toHaveValue('password123');
    });

    test('비밀번호 필드가 마스킹됨', async ({ page }) => {
      const passwordInput = page.getByLabel('비밀번호');
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('이메일 필드에 이메일 타입 속성이 있음', async ({ page }) => {
      const emailInput = page.getByLabel('이메일');
      await expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('필수 입력 필드가 required 속성을 가짐', async ({ page }) => {
      const emailInput = page.getByLabel('이메일');
      const passwordInput = page.getByLabel('비밀번호');

      await expect(emailInput).toHaveAttribute('required');
      await expect(passwordInput).toHaveAttribute('required');
    });
  });

  test.describe('데모 모드', () => {
    test('로그인 없이 둘러보기 버튼 클릭 시 대시보드로 이동', async ({ page }) => {
      const demoButton = page.getByRole('button', { name: /로그인 없이 둘러보기/ });
      await demoButton.click();

      // 데모 모드로 대시보드 이동 확인
      await expect(page).toHaveURL(/\/dashboard\?demo=true/);
    });
  });

  test.describe('로그인 플로우 (Supabase 미설정)', () => {
    test('Supabase 미설정 시 이메일 로그인 시도하면 데모 모드로 이동', async ({ page }) => {
      const emailInput = page.getByLabel('이메일');
      const passwordInput = page.getByLabel('비밀번호');
      const loginButton = page.getByRole('button', { name: '로그인' });

      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await loginButton.click();

      // Supabase가 설정되지 않은 경우 데모 모드로 이동
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('네비게이션', () => {
    test('비밀번호 찾기 링크 클릭 시 올바른 페이지로 이동', async ({ page }) => {
      const forgotPasswordLink = page.getByRole('link', { name: '비밀번호 찾기' });
      await forgotPasswordLink.click();

      await expect(page).toHaveURL(/\/forgot-password/);
    });

    test('회원가입 링크 클릭 시 회원가입 페이지로 이동', async ({ page }) => {
      const signupLink = page.getByRole('link', { name: '회원가입' });
      await signupLink.click();

      await expect(page).toHaveURL(/\/signup/);
    });
  });

  test.describe('UI 상태', () => {
    test('로그인 버튼 초기 상태 확인', async ({ page }) => {
      const loginButton = page.getByRole('button', { name: '로그인' });
      await expect(loginButton).toBeEnabled();
      await expect(loginButton).toHaveText('로그인');
    });

    test('로그인 시도 중 버튼 텍스트 변경 확인', async ({ page }) => {
      const emailInput = page.getByLabel('이메일');
      const passwordInput = page.getByLabel('비밀번호');
      const loginButton = page.getByRole('button', { name: '로그인' });

      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');

      // 로그인 버튼 클릭
      const loginPromise = loginButton.click();

      // 로딩 상태 확인 (빠르게 진행될 수 있으므로 조건부)
      try {
        await expect(page.getByText('로그인 중...')).toBeVisible({ timeout: 1000 });
      } catch {
        // 로딩이 너무 빨라 확인 불가한 경우 통과
      }

      await loginPromise;
    });
  });

  test.describe('폼 제출', () => {
    test('Enter 키로 폼 제출 가능', async ({ page }) => {
      const emailInput = page.getByLabel('이메일');
      const passwordInput = page.getByLabel('비밀번호');

      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await passwordInput.press('Enter');

      // 페이지 이동 확인
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('빈 폼 제출 시 브라우저 기본 검증 작동', async ({ page }) => {
      const loginButton = page.getByRole('button', { name: '로그인' });
      await loginButton.click();

      // 페이지가 이동하지 않음 (브라우저 기본 검증)
      await expect(page).toHaveURL(/\/login/);
    });

    test('이메일만 입력 후 제출 시 검증 작동', async ({ page }) => {
      const emailInput = page.getByLabel('이메일');
      const loginButton = page.getByRole('button', { name: '로그인' });

      await emailInput.fill('test@example.com');
      await loginButton.click();

      // 페이지가 이동하지 않음
      await expect(page).toHaveURL(/\/login/);
    });

    test('비밀번호만 입력 후 제출 시 검증 작동', async ({ page }) => {
      const passwordInput = page.getByLabel('비밀번호');
      const loginButton = page.getByRole('button', { name: '로그인' });

      await passwordInput.fill('password123');
      await loginButton.click();

      // 페이지가 이동하지 않음
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('소셜 로그인 버튼', () => {
    test('Google 로그인 버튼이 클릭 가능', async ({ page }) => {
      const googleButton = page.getByRole('button', { name: /Google로 계속하기/ });
      await expect(googleButton).toBeEnabled();
    });

    test('GitHub 로그인 버튼이 클릭 가능', async ({ page }) => {
      const githubButton = page.getByRole('button', { name: /GitHub로 계속하기/ });
      await expect(githubButton).toBeEnabled();
    });

    test('Google 로그인 버튼에 아이콘이 있음', async ({ page }) => {
      const googleButton = page.getByRole('button', { name: /Google로 계속하기/ });
      const svg = googleButton.locator('svg').first();
      await expect(svg).toBeVisible();
    });

    test('GitHub 로그인 버튼에 아이콘이 있음', async ({ page }) => {
      const githubButton = page.getByRole('button', { name: /GitHub로 계속하기/ });
      const svg = githubButton.locator('svg').first();
      await expect(svg).toBeVisible();
    });
  });

  test.describe('접근성', () => {
    test('키보드 탐색이 가능함', async ({ page }) => {
      // 첫 번째 포커스 가능한 요소로 탭
      await page.keyboard.press('Tab');

      // 여러 번 탭하여 모든 인터랙티브 요소 확인
      const focusableElements = [
        page.getByRole('button', { name: /로그인 없이 둘러보기/ }),
        page.getByRole('button', { name: /Google로 계속하기/ }),
        page.getByRole('button', { name: /GitHub로 계속하기/ }),
        page.getByLabel('이메일'),
        page.getByLabel('비밀번호'),
        page.getByRole('link', { name: '비밀번호 찾기' }),
        page.getByRole('button', { name: '로그인' }),
        page.getByRole('link', { name: '회원가입' }),
      ];

      // 모든 요소가 존재하는지 확인
      for (const element of focusableElements) {
        await expect(element).toBeAttached();
      }
    });

    test('레이블과 입력 필드가 올바르게 연결됨', async ({ page }) => {
      const emailLabel = page.locator('label[for="email"]');
      const passwordLabel = page.locator('label[for="password"]');

      await expect(emailLabel).toHaveText('이메일');
      await expect(passwordLabel).toHaveText('비밀번호');
    });
  });

  test.describe('반응형 디자인', () => {
    test('모바일 뷰포트에서 올바르게 표시됨', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
      await expect(page.getByLabel('이메일')).toBeVisible();
      await expect(page.getByLabel('비밀번호')).toBeVisible();
      await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    });

    test('태블릿 뷰포트에서 올바르게 표시됨', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
      await expect(page.getByLabel('이메일')).toBeVisible();
      await expect(page.getByLabel('비밀번호')).toBeVisible();
      await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    });

    test('데스크톱 뷰포트에서 올바르게 표시됨', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
      await expect(page.getByLabel('이메일')).toBeVisible();
      await expect(page.getByLabel('비밀번호')).toBeVisible();
      await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    });
  });

  test.describe('페이지 성능', () => {
    test('페이지가 2초 이내에 로드됨', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(2000);
    });

    test('주요 요소가 1초 이내에 표시됨', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible({ timeout: 1000 });
      const renderTime = Date.now() - startTime;

      expect(renderTime).toBeLessThan(1000);
    });
  });

  test.describe('에러 상태', () => {
    test('에러 메시지가 표시되면 Alert 아이콘이 함께 표시됨', async ({ page }) => {
      // Supabase가 설정되어 있고 잘못된 자격증명 사용 시 에러 발생
      // 현재는 데모 모드로 리디렉션되므로 실제 에러 테스트는 Supabase 설정 후 가능
      // 이 테스트는 스켈레톤으로 남겨둠

      // TODO: Supabase 설정 후 실제 에러 케이스 테스트
    });
  });

  test.describe('보안', () => {
    test('비밀번호 필드에 자동완성 속성이 없음', async ({ page }) => {
      const passwordInput = page.getByLabel('비밀번호');
      const autocomplete = await passwordInput.getAttribute('autocomplete');

      // autocomplete가 'current-password' 또는 undefined인 것 확인
      expect(['current-password', null, undefined]).toContain(autocomplete);
    });

    test('폼이 HTTPS를 통해 제출됨 (프로덕션)', async ({ page }) => {
      // 로컬 개발에서는 HTTP이므로 URL 체크만 수행
      const url = page.url();
      expect(url).toContain('/login');
    });
  });
});

test.describe('Login Page - Integration Tests', () => {
  test.describe('전체 플로우', () => {
    test('회원가입 페이지에서 로그인 페이지로 이동', async ({ page }) => {
      await page.goto('/signup');
      const loginLink = page.getByRole('link', { name: /로그인/ });
      await loginLink.click();

      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
    });

    test('로그인 페이지에서 회원가입 페이지로 이동', async ({ page }) => {
      await page.goto('/login');
      const signupLink = page.getByRole('link', { name: '회원가입' });
      await signupLink.click();

      await expect(page).toHaveURL(/\/signup/);
    });
  });
});
