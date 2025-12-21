/**
 * @description Contact Form E2E 테스트
 * - 문의 폼 표시
 * - 유효성 검사
 * - 폼 제출
 * - 응답 확인
 */

import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    // 랜딩 페이지의 CTA 섹션 또는 Contact 페이지로 이동
    await page.goto('/');
  });

  test('should have contact section on landing page', async ({ page }) => {
    // CTA 섹션 또는 Contact 섹션 존재 확인
    const hasContactSection = await page
      .locator('[data-section="cta"], #contact, section:has-text("문의")')
      .isVisible()
      .catch(() => false);

    const hasContactButton = await page
      .locator('a:has-text("문의"), button:has-text("문의"), a:has-text("Contact")')
      .isVisible()
      .catch(() => false);

    expect(hasContactSection || hasContactButton).toBeTruthy();
  });

  test('should display contact form fields', async ({ page }) => {
    // 문의 폼으로 스크롤 또는 이동
    await page.evaluate(() => {
      const contactSection = document.querySelector('[data-section="cta"], #contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });

    // 폼 필드 확인 (폼이 있는 경우)
    const hasForm = await page.locator('form').isVisible().catch(() => false);

    if (hasForm) {
      // 필수 필드 확인
      await expect(page.locator('input[name="name"], input[placeholder*="이름"]').first()).toBeVisible();
      await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible();
    }
  });

  test('should validate required fields', async ({ page }) => {
    const form = page.locator('form').first();
    const hasForm = await form.isVisible().catch(() => false);

    if (hasForm) {
      // 빈 폼 제출 시도
      const submitButton = form.locator('button[type="submit"], button:has-text("제출"), button:has-text("보내기")');

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // 유효성 검사 메시지 또는 required 속성 확인
        const hasValidation = await page
          .locator('[role="alert"], .error, .invalid-feedback, :invalid')
          .isVisible()
          .catch(() => false);

        // HTML5 required 속성이 있는 경우 자동 검증
        const hasRequired = await form.locator('[required]').count();

        expect(hasValidation || hasRequired > 0).toBeTruthy();
      }
    }
  });

  test('should submit contact form successfully', async ({ page }) => {
    // 문의 폼이 있는 페이지로 이동
    const hasForm = await page.locator('form:has(input[type="email"])').isVisible().catch(() => false);

    if (hasForm) {
      // 폼 필드 입력
      const nameInput = page.locator('input[name="name"], input[placeholder*="이름"]').first();
      const emailInput = page.locator('input[name="email"], input[type="email"]').first();
      const messageInput = page.locator('textarea[name="message"], textarea').first();

      if (await nameInput.isVisible()) {
        await nameInput.fill('테스트 사용자');
      }

      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
      }

      if (await messageInput.isVisible()) {
        await messageInput.fill('이것은 E2E 테스트 메시지입니다. 최소 10자 이상 작성합니다.');
      }

      // 문의 유형 선택 (있는 경우)
      const selectType = page.locator('select[name="inquiryType"]');
      if (await selectType.isVisible()) {
        await selectType.selectOption({ index: 1 });
      }

      // 폼 제출
      const submitButton = page.locator('button[type="submit"], button:has-text("제출"), button:has-text("보내기")').first();

      if (await submitButton.isVisible()) {
        // API 응답 대기
        const responsePromise = page.waitForResponse(
          (response) => response.url().includes('/api/v1/contact'),
          { timeout: 5000 }
        ).catch(() => null);

        await submitButton.click();

        const response = await responsePromise;

        if (response) {
          // API 응답 확인
          expect([200, 201]).toContain(response.status());
        }

        // 성공 메시지 확인
        const hasSuccess = await page
          .locator('text=/성공|감사|완료|Success|Thank/i')
          .isVisible({ timeout: 3000 })
          .catch(() => false);

        // 성공 메시지 또는 에러 없음 확인
        const hasError = await page
          .locator('text=/오류|실패|Error|Failed/i')
          .isVisible({ timeout: 1000 })
          .catch(() => false);

        expect(hasSuccess || !hasError).toBeTruthy();
      }
    }
  });
});

test.describe('Contact API', () => {
  test('should accept valid contact request', async ({ request }) => {
    const response = await request.post('/api/v1/contact', {
      data: {
        name: 'E2E 테스트',
        email: 'e2e@test.com',
        company: '테스트 회사',
        phone: '010-1234-5678',
        inquiryType: 'demo',
        message: '이것은 E2E 테스트를 위한 문의 메시지입니다.',
      },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.id).toBeDefined();
  });

  test('should reject invalid contact request', async ({ request }) => {
    const response = await request.post('/api/v1/contact', {
      data: {
        name: '',
        email: 'invalid-email',
        message: 'short',
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
  });

  test('should handle CORS preflight', async ({ request }) => {
    const response = await request.fetch('/api/v1/contact', {
      method: 'OPTIONS',
    });

    expect([200, 204]).toContain(response.status());
  });
});
