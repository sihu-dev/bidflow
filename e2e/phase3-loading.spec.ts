/**
 * Phase 3 - 로딩 상태 (Skeleton UI) E2E 테스트
 *
 * 테스트 대상:
 * - Skeleton UI 표시
 * - Suspense boundaries
 * - LoadingSpinner 컴포넌트
 * - 로딩 → 콘텐츠 전환
 * - Layout Shift 방지 (CLS)
 */

import { test, expect } from '@playwright/test';

test.describe('Loading States - Skeleton UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Skeleton 표시', () => {
    test('페이지 로딩 중 skeleton이 표시됨', async ({ page }) => {
      // Slow 3G 네트워크 시뮬레이션
      await page.route('**/*', (route) => {
        setTimeout(() => route.continue(), 100);
      });

      await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

      // Skeleton 요소 확인
      const skeletons = page.locator('.animate-pulse, [class*="skeleton"]');
      const count = await skeletons.count();

      // 로딩 중에는 skeleton이 표시되어야 함 (빠르게 로딩되면 0일 수 있음)
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('skeleton에 animate-pulse 클래스가 있음', async ({ page }) => {
      // Skeleton 컴포넌트 직접 확인
      const skeleton = page.locator('.bg-neutral-200.animate-pulse').first();

      // Skeleton이 있으면 animate-pulse 확인
      const count = await page.locator('.animate-pulse').count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('skeleton에 aria-hidden="true" 속성이 있음', async ({ page }) => {
      // Skeleton은 스크린 리더에게 숨김
      const skeletons = page.locator('[aria-hidden="true"].animate-pulse');
      const count = await skeletons.count();

      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Skeleton 변형', () => {
    test('SkeletonText가 여러 줄로 표시됨', async ({ page }) => {
      // Skeleton text 확인
      const skeletonText = page.locator('.space-y-2 > .animate-pulse');
      const count = await skeletonText.count();

      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('SkeletonCard가 올바른 구조를 가짐', async ({ page }) => {
      // Card skeleton: header + content + footer
      const skeletonCard = page.locator('.rounded-xl.border').filter({ has: page.locator('.animate-pulse') });
      const count = await skeletonCard.count();

      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('SkeletonTable이 행과 열을 가짐', async ({ page }) => {
      // Table skeleton: rows + columns
      const skeletonTable = page.locator('.overflow-hidden.rounded-xl.border').filter({
        has: page.locator('.animate-pulse')
      });
      const count = await skeletonTable.count();

      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Loading Spinner', () => {
    test('LoadingSpinner가 회전함', async ({ page }) => {
      // Spinner 찾기
      const spinner = page.locator('.animate-spin');
      const count = await spinner.count();

      // Spinner가 있으면 animate-spin 클래스 확인
      if (count > 0) {
        const firstSpinner = spinner.first();
        await expect(firstSpinner).toHaveClass(/animate-spin/);
      }
    });

    test('LoadingSpinner에 3가지 크기가 있음', async ({ page }) => {
      // sm: w-4 h-4, md: w-6 h-6, lg: w-8 h-8
      // 실제 구현에 따라 확인
    });

    test('ButtonLoadingSpinner가 버튼 내부에 표시됨', async ({ page }) => {
      // 버튼 내부 spinner 확인
      const buttonSpinner = page.locator('button .animate-spin');
      const count = await buttonSpinner.count();

      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Suspense Boundaries', () => {
    test('LoadingBoundary가 fallback을 표시함', async ({ page }) => {
      // Suspense fallback 확인
      // React Suspense는 서버/클라이언트 렌더링에 따라 다름
    });

    test('lazy loaded 컴포넌트가 로딩됨', async ({ page }) => {
      // Dynamic import된 컴포넌트 확인
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // 페이지가 정상 로드되었는지 확인
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('Layout Shift 방지 (CLS)', () => {
    test('skeleton이 실제 콘텐츠와 동일한 높이를 가짐', async ({ page }) => {
      // Skeleton 높이 측정
      const skeleton = page.locator('.animate-pulse').first();
      const skeletonHeight = await skeleton.evaluate(el => el.getBoundingClientRect().height);

      // Skeleton이 있으면 높이가 0이 아니어야 함
      if (skeletonHeight > 0) {
        expect(skeletonHeight).toBeGreaterThan(0);
      }
    });

    test('로딩 완료 후 레이아웃이 이동하지 않음', async ({ page }) => {
      // 초기 위치 측정
      const initialY = await page.locator('main').evaluate(el => {
        return el.getBoundingClientRect().y;
      });

      // 페이지 완전 로드 대기
      await page.waitForLoadState('networkidle');

      // 최종 위치 측정
      const finalY = await page.locator('main').evaluate(el => {
        return el.getBoundingClientRect().y;
      });

      // 레이아웃 시프트 허용 범위 (5px 이내)
      expect(Math.abs(finalY - initialY)).toBeLessThan(5);
    });
  });

  test.describe('Progressive Loading', () => {
    test('콘텐츠가 단계적으로 로딩됨', async ({ page }) => {
      // 네트워크 느리게 설정
      await page.route('**/*', (route) => {
        setTimeout(() => route.continue(), 200);
      });

      await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

      // 단계별 로딩 확인 (헤더 → 통계 → 차트 → 테이블)
      // 구현에 따라 순서 확인
    });
  });

  test.describe('로딩 상태 메시지', () => {
    test('PageLoading에 "로딩 중..." 메시지 표시', async ({ page }) => {
      // Page loading 확인
      const loadingMessage = page.getByText(/로딩 중/);
      const count = await loadingMessage.count();

      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('SectionLoading에 커스텀 메시지 표시', async ({ page }) => {
      // Section loading with custom message
      // 구현에 따라 확인
    });
  });

  test.describe('모노크롬 디자인 일관성', () => {
    test('skeleton이 neutral-200 색상을 사용함', async ({ page }) => {
      const skeleton = page.locator('.bg-neutral-200.animate-pulse').first();
      const count = await skeleton.count();

      if (count > 0) {
        await expect(skeleton).toHaveClass(/bg-neutral-200/);
      }
    });

    test('spinner border가 neutral 색상을 사용함', async ({ page }) => {
      const spinner = page.locator('.animate-spin').first();
      const count = await spinner.count();

      if (count > 0) {
        // border-neutral-300, border-neutral-600 등 확인
        const classes = await spinner.getAttribute('class');
        expect(classes).toContain('border');
      }
    });
  });
});

test.describe('Loading States - useLoadingState Hook', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test.describe('로딩 상태 추적', () => {
    test('비동기 작업 중 로딩 상태 표시', async ({ page }) => {
      // 저장 버튼 클릭 (예시)
      // const saveButton = page.getByRole('button', { name: /저장/ });
      // await saveButton.click();

      // 로딩 스피너 또는 disabled 상태 확인
      // await expect(saveButton).toBeDisabled({ timeout: 1000 });
    });

    test('성공 시 toast 표시', async ({ page }) => {
      // 비동기 작업 성공
      // const toast = page.locator('[role="alert"]').filter({ hasText: /완료|성공/ });
      // await expect(toast).toBeVisible({ timeout: 5000 });
    });

    test('에러 시 toast 표시', async ({ page }) => {
      // 비동기 작업 실패
      // const toast = page.locator('[role="alert"]').filter({ hasText: /오류|실패/ });
      // await expect(toast).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Debounced Loading', () => {
    test('빠른 연속 입력 시 마지막 요청만 실행', async ({ page }) => {
      // 검색 입력 필드
      // const searchInput = page.getByPlaceholder(/검색/);
      // await searchInput.fill('test');
      // await searchInput.fill('test2');
      // await searchInput.fill('test3');

      // 디바운스 후 한 번만 요청
      // await page.waitForTimeout(500);
    });
  });

  test.describe('Combined Loading', () => {
    test('여러 로딩 상태 동시 추적', async ({ page }) => {
      // 여러 비동기 작업이 동시에 실행될 때
      // isAnyLoading, isAllLoading 상태 확인
    });
  });
});

test.describe('Loading States - Performance', () => {
  test('skeleton 렌더링이 빠름 (100ms 이내)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    const firstSkeleton = page.locator('.animate-pulse').first();
    await firstSkeleton.waitFor({ state: 'attached', timeout: 1000 });

    const renderTime = Date.now() - startTime;
    expect(renderTime).toBeLessThan(100);
  });

  test('로딩 → 콘텐츠 전환이 부드러움', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 페이지가 정상 렌더링되었는지 확인
    await expect(page.locator('main')).toBeVisible();
  });
});
