#!/usr/bin/env node

/**
 * BIDFLOW 콘솔 오류 및 UX/UI 자동 검증
 * Playwright로 브라우저 실행 후 콘솔 로그 수집
 */

import { chromium } from 'playwright';

async function checkConsole() {
  console.log('🚀 BIDFLOW 콘솔 검사 시작...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  // 콘솔 로그 수집
  const logs = {
    errors: [],
    warnings: [],
    info: [],
  };

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();

    if (type === 'error') {
      logs.errors.push(text);
    } else if (type === 'warning') {
      logs.warnings.push(text);
    } else if (type === 'log' || type === 'info') {
      logs.info.push(text);
    }
  });

  // 페이지 에러 수집
  page.on('pageerror', (error) => {
    logs.errors.push(`Page Error: ${error.message}`);
  });

  // 네트워크 실패 수집
  page.on('requestfailed', (request) => {
    logs.errors.push(`Network Failed: ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    console.log('📄 메인 페이지 로드 중...');
    await page.goto('http://localhost:3010', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // 스크린샷 저장
    await page.screenshot({ path: '/tmp/bidflow-main.png', fullPage: true });
    console.log('✅ 메인 페이지 로드 완료\n');

    // 주요 페이지 테스트
    const pages = [
      { url: '/', name: '메인' },
      { url: '/pricing', name: '가격' },
      { url: '/features', name: '기능' },
      { url: '/login', name: '로그인' },
    ];

    for (const { url, name } of pages) {
      console.log(`📄 ${name} 페이지 검사 중...`);
      await page.goto(`http://localhost:3010${url}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
    }

    console.log('\n📊 콘솔 로그 분석 결과:\n');
    console.log(`❌ 에러: ${logs.errors.length}개`);
    console.log(`⚠️  경고: ${logs.warnings.length}개`);
    console.log(`ℹ️  정보: ${logs.info.length}개\n`);

    if (logs.errors.length > 0) {
      console.log('🔴 발견된 에러:\n');
      logs.errors.forEach((err, i) => {
        console.log(`${i + 1}. ${err}`);
      });
      console.log();
    }

    if (logs.warnings.length > 0) {
      console.log('🟡 발견된 경고:\n');
      const uniqueWarnings = [...new Set(logs.warnings)];
      uniqueWarnings.slice(0, 10).forEach((warn, i) => {
        console.log(`${i + 1}. ${warn}`);
      });
      console.log();
    }

    // UX/UI 체크
    console.log('🎨 UX/UI 검증 중...\n');

    const checks = {
      header: await page.locator('header').count() > 0,
      footer: await page.locator('footer').count() > 0,
      navigation: await page.locator('nav').count() > 0,
      buttons: await page.locator('button').count(),
      links: await page.locator('a').count(),
      images: await page.locator('img').count(),
    };

    console.log('✅ 구조 검증:');
    console.log(`  - Header: ${checks.header ? '✓' : '✗'}`);
    console.log(`  - Footer: ${checks.footer ? '✓' : '✗'}`);
    console.log(`  - Navigation: ${checks.navigation ? '✓' : '✗'}`);
    console.log(`  - 버튼: ${checks.buttons}개`);
    console.log(`  - 링크: ${checks.links}개`);
    console.log(`  - 이미지: ${checks.images}개\n`);

    // 접근성 체크 (기본)
    const accessibilityIssues = [];

    // alt 없는 이미지
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      accessibilityIssues.push(`alt 속성 없는 이미지: ${imagesWithoutAlt}개`);
    }

    // aria-label 없는 버튼
    const buttonsWithoutLabel = await page.locator('button:not([aria-label]):not(:has-text(""))').count();
    if (buttonsWithoutLabel > 0) {
      accessibilityIssues.push(`텍스트/aria-label 없는 버튼: ${buttonsWithoutLabel}개`);
    }

    if (accessibilityIssues.length > 0) {
      console.log('♿ 접근성 이슈:\n');
      accessibilityIssues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue}`);
      });
      console.log();
    } else {
      console.log('♿ 접근성: 기본 검증 통과\n');
    }

    // 결과 JSON 저장
    const results = {
      timestamp: new Date().toISOString(),
      logs,
      checks,
      accessibilityIssues,
      summary: {
        totalErrors: logs.errors.length,
        totalWarnings: logs.warnings.length,
        totalInfo: logs.info.length,
        passed: logs.errors.length === 0,
      },
    };

    await page.evaluate((data) => {
      console.log('BIDFLOW_TEST_RESULTS:', JSON.stringify(data, null, 2));
    }, results);

    console.log('✅ 검사 완료!\n');

    // 결과 반환
    process.exit(logs.errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ 검사 실패:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

checkConsole().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
