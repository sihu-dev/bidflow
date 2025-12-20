import { test, expect } from '@playwright/test';

test.describe('Landing Page - Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
  });

  test('Hero 섹션 렌더링', async ({ page }) => {
    // CMNTech 배지 확인
    const badge = page.locator('text=CMNTech 유량계 전문 입찰 자동화');
    await expect(badge).toBeVisible();

    // 메인 헤드라인 확인
    await expect(page.locator('text=UR-1000PLUS부터')).toBeVisible();
    await expect(page.locator('text=EnerRay까지')).toBeVisible();

    // 서브 텍스트 확인
    const subtitle = page.locator('text=나라장터부터 TED까지');
    await expect(subtitle).toBeVisible();
  });

  test('Hero CTA 버튼 표시', async ({ page }) => {
    // "무료로 시작하기" 버튼
    const startButton = page.locator('a:has-text("무료로 시작하기")').first();
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveAttribute('href', '/signup');

    // "데모 보기" 버튼  
    const demoButton = page.locator('a:has-text("데모 보기")').first();
    await expect(demoButton).toBeVisible();
  });

  test('제품 Pills 5개 표시', async ({ page }) => {
    // Hero 섹션의 제품 Pills
    const heroPills = page.locator('section').first();
    
    await expect(heroPills.locator('text=UR-1000PLUS')).toBeVisible();
    await expect(heroPills.locator('text=MF-1000C')).toBeVisible();
    await expect(heroPills.locator('text=UR-1010PLUS')).toBeVisible();
    await expect(heroPills.locator('text=SL-3000PLUS')).toBeVisible();
    await expect(heroPills.locator('text=EnerRay')).toBeVisible();
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

  test('통계 4개 표시', async ({ page }) => {
    // 섹션 제목
    await expect(page.locator('text=신뢰할 수 있는 숫자')).toBeVisible();

    // 4개 통계 확인
    await expect(page.locator('text=92%')).toBeVisible();
    await expect(page.locator('text=평균 제품 매칭 정확도')).toBeVisible();

    await expect(page.locator('text=5+')).toBeVisible();
    await expect(page.locator('text=CMNTech 연동 제품')).toBeVisible();

    await expect(page.locator('text=150+')).toBeVisible();
    await expect(page.locator('text=월간 분석 공고수')).toBeVisible();

    await expect(page.locator('text=3.2x')).toBeVisible();
    await expect(page.locator('text=입찰 참여율 증가')).toBeVisible();
  });

  test('반응형: 모바일 2열 → 데스크톱 4열', async ({ page }) => {
    // 모바일: 2열
    await page.setViewportSize({ width: 375, height: 667 });
    const gridMobile = page.locator('.grid.grid-cols-2').first();
    await expect(gridMobile).toBeVisible();

    // 데스크톱: 4열
    await page.setViewportSize({ width: 1280, height: 720 });
    const gridDesktop = page.locator('.md\\:grid-cols-4').first();
    await expect(gridDesktop).toBeVisible();
  });
});

test.describe('Landing Page - Features Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
  });

  test('핵심 기능 4개 표시', async ({ page }) => {
    // 섹션 제목
    await expect(page.locator('text=핵심 기능')).toBeVisible();

    // 4개 기능 확인
    await expect(page.locator('text=유량계 공고 자동 수집')).toBeVisible();
    await expect(page.locator('text=나라장터, TED, SAM.gov')).toBeVisible();

    await expect(page.locator('text=5가지 제품 자동 매칭')).toBeVisible();
    await expect(page.locator('text=UR-1000PLUS, MF-1000C')).toBeVisible();

    await expect(page.locator('text=AI 스마트 함수')).toBeVisible();
    await expect(page.locator('text==AI_SCORE(), =AI_MATCH()')).toBeVisible();

    await expect(page.locator('text=맞춤 제안서 생성')).toBeVisible();
  });

  test('아이콘 렌더링', async ({ page }) => {
    // lucide-react 아이콘들이 SVG로 렌더링되는지 확인
    const icons = page.locator('svg.lucide');
    await expect(icons.first()).toBeVisible();
  });
});

test.describe('Landing Page - HowItWorks Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
  });

  test('작동 방식 3단계 표시', async ({ page }) => {
    await expect(page.locator('text=어떻게 작동하나요')).toBeVisible();

    // 3단계 확인
    await expect(page.locator('text=CMNTech 제품 등록')).toBeVisible();
    await expect(page.locator('text=5개 유량계/열량계 제품')).toBeVisible();

    await expect(page.locator('text=AI 공고 매칭')).toBeVisible();
    await expect(page.locator('text=매일 자동 분석')).toBeVisible();

    await expect(page.locator('text=입찰 준비 완료')).toBeVisible();
  });
});

test.describe('Landing Page - Testimonials Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
  });

  test('고객 후기 3개 표시', async ({ page }) => {
    await expect(page.locator('text=고객 후기')).toBeVisible();

    // 씨엠엔텍 후기 확인
    await expect(page.locator('text=씨엠엔텍').first()).toBeVisible();
    await expect(page.locator('text=UR-1000PLUS 관련 공고를')).toBeVisible();
    await expect(page.locator('text=EnerRay 열량계 관련')).toBeVisible();
    await expect(page.locator('text=UR-1010PLUS 비만관')).toBeVisible();
  });
});

test.describe('Landing Page - FAQ Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
  });

  test('FAQ 5개 질문 표시', async ({ page }) => {
    await expect(page.locator('text=자주 묻는 질문')).toBeVisible();

    // 5개 질문 확인
    await expect(page.locator('text=CMNTech 5개 제품이 기본으로 등록')).toBeVisible();
    await expect(page.locator('text=AI 매칭 점수는 어떻게')).toBeVisible();
    await expect(page.locator('text==AI_MATCH() 함수는 어떻게')).toBeVisible();
    await expect(page.locator('text=추가 제품도 등록할 수 있나요')).toBeVisible();
    await expect(page.locator('text=TED, SAM.gov 해외 입찰')).toBeVisible();
  });

  test('FAQ 아코디언 토글', async ({ page }) => {
    // 첫 번째 질문 클릭
    const firstQuestion = page.locator('button:has-text("CMNTech 5개 제품")');
    await firstQuestion.click();

    // 답변 표시 확인
    await expect(page.locator('text=UR-1000PLUS, MF-1000C, UR-1010PLUS, SL-3000PLUS, EnerRay')).toBeVisible();

    // 다시 클릭하면 닫힘
    await firstQuestion.click();
    await page.waitForTimeout(500); // 애니메이션 대기
  });
});

test.describe('Landing Page - CTA Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
  });

  test('최종 CTA 표시', async ({ page }) => {
    await expect(page.locator('text=CMNTech 5개 제품 입찰 자동화를 시작하세요')).toBeVisible();
    await expect(page.locator('text=UR-1000PLUS부터 EnerRay까지').last()).toBeVisible();

    // CTA 버튼들
    const startButton = page.locator('a:has-text("무료로 시작하기")').last();
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveAttribute('href', '/signup');

    const contactButton = page.locator('a:has-text("영업팀 문의")');
    await expect(contactButton).toBeVisible();
    await expect(contactButton).toHaveAttribute('href', '/contact');
  });

  test('제품 Pills 5개 표시 (CTA)', async ({ page }) => {
    // CTA 섹션의 제품 Pills
    const ctaSection = page.locator('section.bg-neutral-900').last();
    
    await expect(ctaSection.locator('text=UR-1000PLUS')).toBeVisible();
    await expect(ctaSection.locator('text=MF-1000C')).toBeVisible();
    await expect(ctaSection.locator('text=UR-1010PLUS')).toBeVisible();
    await expect(ctaSection.locator('text=SL-3000PLUS')).toBeVisible();
    await expect(ctaSection.locator('text=EnerRay')).toBeVisible();
  });
});
