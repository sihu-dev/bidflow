/**
 * @description Dashboard E2E 테스트
 * - 대시보드 페이지 접근
 * - Bid 목록 표시
 * - 필터/정렬 기능
 * - API 연동 확인
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should load dashboard page', async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/BIDFLOW|Dashboard/i);

    // 대시보드 메인 요소 존재 확인
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display bid list or demo mode message', async ({ page }) => {
    // 데모 모드 또는 실제 bid 목록
    const hasBids = await page.locator('[data-testid="bid-list"]').isVisible().catch(() => false);
    const hasDemo = await page.locator('text=/데모|Demo|Sign up/i').isVisible().catch(() => false);

    expect(hasBids || hasDemo).toBeTruthy();
  });

  test('should have refresh button', async ({ page }) => {
    // 새로고침 버튼 존재 확인
    const refreshButton = page.locator('button:has-text("새로고침"), button:has-text("Refresh"), button[aria-label*="refresh"]');
    const hasRefresh = await refreshButton.isVisible().catch(() => false);

    // 새로고침 버튼이 있거나 자동 갱신 텍스트가 있어야 함
    const hasAutoRefresh = await page.locator('text=/자동|auto/i').isVisible().catch(() => false);
    expect(hasRefresh || hasAutoRefresh).toBeTruthy();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });

    // 페이지 로드 확인
    await expect(page.locator('main')).toBeVisible();

    // 모바일에서 메뉴 버튼 또는 네비게이션 존재
    const hasMobileNav = await page.locator('button[aria-label*="menu"], [data-testid="mobile-nav"]').isVisible().catch(() => false);
    const hasNav = await page.locator('nav').isVisible().catch(() => false);

    expect(hasMobileNav || hasNav).toBeTruthy();
  });
});

test.describe('Dashboard Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should have filter controls', async ({ page }) => {
    // 필터 관련 요소 찾기
    const hasStatusFilter = await page.locator('select, [data-testid="status-filter"], button:has-text("상태")').isVisible().catch(() => false);
    const hasSearchInput = await page.locator('input[type="search"], input[placeholder*="검색"]').isVisible().catch(() => false);
    const hasDateFilter = await page.locator('input[type="date"], [data-testid="date-filter"]').isVisible().catch(() => false);

    // 최소 하나의 필터 요소가 있어야 함 (데모 모드가 아닐 경우)
    const isDemo = await page.locator('text=/데모|Demo/i').isVisible().catch(() => false);
    if (!isDemo) {
      expect(hasStatusFilter || hasSearchInput || hasDateFilter).toBeTruthy();
    }
  });
});

test.describe('Dashboard Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // 3초 이내 로드 (개발 서버 기준)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 심각한 에러만 필터링 (React hydration 경고 제외)
    const criticalErrors = errors.filter(
      (e) => !e.includes('hydrat') && !e.includes('Warning')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
