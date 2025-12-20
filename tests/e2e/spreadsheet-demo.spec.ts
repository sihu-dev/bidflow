import { test, expect } from '@playwright/test';

test.describe('SpreadsheetDemo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
    await page.waitForSelector('[id="spreadsheet"]');
  });

  test('랜딩 페이지 로드 및 SpreadsheetDemo 표시', async ({ page }) => {
    // 섹션 헤더 확인
    const header = page.locator('text=CMNTech 5개 제품');
    await expect(header).toBeVisible();

    // AI 자동 매칭 텍스트 확인
    const subtitle = page.locator('text=AI 자동 매칭');
    await expect(subtitle).toBeVisible();
  });

  test('스프레드시트 그리드 렌더링', async ({ page }) => {
    // 테이블 헤더 확인
    await expect(page.locator('th:has-text("No")')).toBeVisible();
    await expect(page.locator('th:has-text("출처")')).toBeVisible();
    await expect(page.locator('th:has-text("공고명")')).toBeVisible();
    await expect(page.locator('th:has-text("매칭")')).toBeVisible();

    // 6개 입찰 데이터 행 확인
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(6);
  });

  test('입찰 행 클릭 시 사이드 패널 표시', async ({ page }) => {
    // 데스크톱 뷰포트
    await page.setViewportSize({ width: 1280, height: 720 });

    // 첫 번째 행 클릭
    await page.locator('tbody tr').first().click();

    // 사이드 패널 표시 확인 (lg: 이상에서만)
    const sidePanel = page.locator('text=AI 분석 결과');
    await expect(sidePanel).toBeVisible();

    // 매칭 점수 프로그레스바 확인
    const scoreBar = page.locator('.h-2.bg-neutral-100.rounded-full');
    await expect(scoreBar).toBeVisible();
  });

  test('AI 함수 드롭다운 토글', async ({ page }) => {
    // AI 함수 버튼 클릭
    const aiButton = page.locator('button:has-text("AI 함수")');
    await aiButton.click();

    // 드롭다운 표시 확인
    await expect(page.locator('text=AI 스마트 함수')).toBeVisible();
    await expect(page.locator('code:has-text("=AI_SUMMARY()")')).toBeVisible();
    await expect(page.locator('code:has-text("=AI_SCORE()")')).toBeVisible();
    await expect(page.locator('code:has-text("=AI_MATCH()")')).toBeVisible();
  });

  test('CMNTech 제품 Pills 표시', async ({ page }) => {
    // 5개 제품 pill 확인
    await expect(page.locator('text=UR-1000PLUS').first()).toBeVisible();
    await expect(page.locator('text=MF-1000C').first()).toBeVisible();
    await expect(page.locator('text=UR-1010PLUS').first()).toBeVisible();
    await expect(page.locator('text=SL-3000PLUS').first()).toBeVisible();
    await expect(page.locator('text=EnerRay').first()).toBeVisible();
  });

  test('반응형: 모바일에서 사이드 패널 숨김', async ({ page }) => {
    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });

    // 첫 번째 행 클릭
    await page.locator('tbody tr').first().click();

    // 사이드 패널이 숨겨져 있어야 함
    const sidePanel = page.locator('.w-80.rounded-2xl').first();
    await expect(sidePanel).toBeHidden();
  });

  test('반응형: 모바일에서 테이블 가로 스크롤', async ({ page }) => {
    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });

    // overflow-x-auto 컨테이너 확인
    const tableContainer = page.locator('.overflow-x-auto').first();
    await expect(tableContainer).toBeVisible();

    // 테이블이 뷰포트보다 넓은지 확인
    const tableWidth = await page.locator('table').first().evaluate((el) => el.scrollWidth);
    expect(tableWidth).toBeGreaterThan(375);
  });

  test('D-Day 배지 긴급도 표시', async ({ page }) => {
    // D-3 등 긴급한 공고는 검정 배지
    const urgentBadge = page.locator('.bg-neutral-900.text-white').filter({ hasText: 'D-' });
    await expect(urgentBadge.first()).toBeVisible();
  });

  test('매칭 점수 바 렌더링', async ({ page }) => {
    // 모든 행의 매칭 점수 바 확인
    const scoreBars = page.locator('.w-12.h-1\\.5.bg-neutral-200.rounded-full');
    await expect(scoreBars).toHaveCount(6);
  });
});
