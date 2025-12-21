/**
 * Responsive Layout Test
 * 모바일/태블릿/데스크톱 뷰포트에서 레이아웃 검증
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3010';

// 뷰포트 설정
const viewports = {
  mobile: { width: 375, height: 812, name: 'mobile' },
  tablet: { width: 768, height: 1024, name: 'tablet' },
  desktop: { width: 1280, height: 800, name: 'desktop' },
};

// 테스트할 페이지들
const pages = [
  { path: '/', name: 'landing' },
  { path: '/login', name: 'login' },
  { path: '/dashboard?demo=true', name: 'dashboard' },
];

test.describe('Responsive Layout Tests', () => {
  for (const [vpKey, viewport] of Object.entries(viewports)) {
    test.describe(`${vpKey} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      for (const pageConfig of pages) {
        test(`${pageConfig.name} page renders correctly`, async ({ page }) => {
          await page.goto(`${BASE_URL}${pageConfig.path}`);
          await page.waitForLoadState('networkidle');

          // 스크린샷 저장
          await page.screenshot({
            path: `tests/screenshots/${pageConfig.name}-${viewport.name}.png`,
            fullPage: pageConfig.name !== 'dashboard', // 대시보드는 뷰포트만
          });

          // 기본 검증: 페이지가 렌더링되었는지
          const body = page.locator('body');
          await expect(body).toBeVisible();

          // 페이지별 검증
          if (pageConfig.name === 'landing') {
            // 히어로 섹션 확인
            const hero = page.locator('section').first();
            await expect(hero).toBeVisible();
          }

          if (pageConfig.name === 'login') {
            // 로그인 폼 확인
            const form = page.locator('form');
            await expect(form).toBeVisible();
          }

          if (pageConfig.name === 'dashboard') {
            // 헤더 확인
            const header = page.locator('header');
            await expect(header).toBeVisible();

            // 모바일에서 네비게이션 숨김 확인
            if (vpKey === 'mobile') {
              const nav = page.locator('header nav');
              await expect(nav).toBeHidden();
            }
          }
        });
      }
    });
  }
});

test.describe('Mobile Navigation', () => {
  test('dashboard header hides nav on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/dashboard?demo=true`);
    await page.waitForLoadState('networkidle');

    // 네비게이션이 숨겨져 있어야 함
    const nav = page.locator('header nav');
    await expect(nav).toBeHidden();

    // 로고는 보여야 함
    const logo = page.locator('header a').first();
    await expect(logo).toBeVisible();
  });

  test('dashboard header shows nav on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/dashboard?demo=true`);
    await page.waitForLoadState('networkidle');

    // 네비게이션이 보여야 함
    const nav = page.locator('header nav');
    await expect(nav).toBeVisible();
  });
});

test.describe('Stats Bar Responsiveness', () => {
  test('shows core metrics on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/dashboard?demo=true`);
    await page.waitForLoadState('networkidle');

    // Total과 New는 보여야 함
    await expect(page.getByText('TOTAL')).toBeVisible();
    await expect(page.getByText('NEW')).toBeVisible();
    await expect(page.getByText('URGENT')).toBeVisible();
  });

  test('shows all metrics on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/dashboard?demo=true`);
    await page.waitForLoadState('networkidle');

    // 모든 메트릭 보여야 함
    await expect(page.getByText('TOTAL')).toBeVisible();
    await expect(page.getByText('NEW')).toBeVisible();
    await expect(page.getByText('REVIEW')).toBeVisible();
    await expect(page.getByText('PREPARE')).toBeVisible();
    await expect(page.getByText('URGENT')).toBeVisible();
    await expect(page.getByText('HIGH MATCH')).toBeVisible();
    await expect(page.getByText('WON')).toBeVisible();
    await expect(page.getByText('LOST')).toBeVisible();
  });
});
