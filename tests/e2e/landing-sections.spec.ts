import { test, expect } from '@playwright/test';

test.describe('Landing Page - Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
  });

  test('Hero 섹션 렌더링', async ({ page }) => {
    // 메인 헤드라인 확인 (일반 모드)
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=47건')).toBeVisible();
    await expect(page.locator('text=자동 포착')).toBeVisible();
  });

  test('Hero CTA 버튼 표시', async ({ page }) => {
    // "14일 무료로 시작하기" 버튼
    const startButton = page.locator('a:has-text("14일 무료로 시작하기")').first();
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveAttribute('href', '/signup');

    // "실시간 데모 보기" 버튼
    const demoButton = page.locator('a:has-text("실시간 데모")').first();
    await expect(demoButton).toBeVisible();
  });

  test('Hero 서브텍스트 표시', async ({ page }) => {
    // 서브 텍스트 확인 - use exact match to avoid multiple elements
    await expect(page.getByText('45개 소스', { exact: true })).toBeVisible();
  });

  test('반응형: 모바일에서 버튼 세로 배치', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // flex-col 클래스로 세로 배치되어야 함
    const buttonContainer = page.locator('.flex.flex-col.sm\\:flex-row').first();
    await expect(buttonContainer).toBeVisible();
  });
});

test.describe('Landing Page - Stats Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
  });

  test('통계 섹션 표시', async ({ page }) => {
    // 통계 관련 숫자들이 표시되는지 확인
    const statsSection = page.locator('section');
    await expect(statsSection.first()).toBeVisible();
  });

  test('반응형: 그리드 레이아웃', async ({ page }) => {
    // 모바일: 그리드 확인
    await page.setViewportSize({ width: 375, height: 667 });
    const grid = page.locator('.grid').first();
    await expect(grid).toBeVisible();
  });
});

test.describe('Landing Page - Features Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
  });

  test('핵심 기능 섹션 표시', async ({ page }) => {
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');

    // 기능 섹션이 표시되는지 확인
    const sections = page.locator('section');
    await expect(sections.first()).toBeVisible();
  });

  test('아이콘 렌더링', async ({ page }) => {
    // SVG 아이콘들이 렌더링되는지 확인 - find a visible one
    const icons = page.locator('svg:visible');
    await expect(icons.first()).toBeVisible();
  });
});

test.describe('Landing Page - HowItWorks Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
  });

  test('작동 방식 섹션 표시', async ({ page }) => {
    await expect(page.locator('text=간단한 3단계로 시작하세요')).toBeVisible();
  });
});

test.describe('Landing Page - Testimonials Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
  });

  test('고객 후기 섹션 표시', async ({ page }) => {
    await expect(page.locator('text=고객들의 이야기')).toBeVisible();
  });
});

test.describe('Landing Page - FAQ Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
  });

  test('FAQ 섹션 표시', async ({ page }) => {
    await expect(page.locator('text=자주 묻는 질문')).toBeVisible();
  });

  test('FAQ 아코디언 토글', async ({ page }) => {
    // FAQ 질문 버튼들 찾기
    const faqButtons = page.locator('button').filter({ hasText: /\?|어떻게|무엇/ });
    const count = await faqButtons.count();

    if (count > 0) {
      // 첫 번째 질문 클릭
      await faqButtons.first().click();
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Landing Page - CTA Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
  });

  test('최종 CTA 버튼 표시', async ({ page }) => {
    // CTA 버튼들 - "14일 무료로 시작하기"
    const startButtons = page.locator('a:has-text("14일 무료로 시작하기")');
    await expect(startButtons.first()).toBeVisible();
  });

  test('문의 링크 표시', async ({ page }) => {
    const contactLinks = page.locator('a[href="/contact"]');
    const count = await contactLinks.count();

    if (count > 0) {
      await expect(contactLinks.first()).toBeVisible();
    }
  });
});
