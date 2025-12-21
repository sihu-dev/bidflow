#!/usr/bin/env node

/**
 * BIDFLOW 콘솔 오류 및 UX/UI 자동 검증 (Puppeteer)
 */

import puppeteer from 'puppeteer';

async function checkConsole() {
  console.log('🚀 BIDFLOW 콘솔 검사 시작 (Puppeteer)...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

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
    logs.errors.push(`Network Failed: ${request.url()} - ${request.failure().errorText}`);
  });

  try {
    console.log('📄 메인 페이지 로드 중...');
    await page.goto('http://localhost:3010', { waitUntil: 'networkidle2', timeout: 30000 });
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
      const uniqueErrors = [...new Set(logs.errors)];
      uniqueErrors.forEach((err, i) => {
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

    const checks = await page.evaluate(() => {
      return {
        header: document.querySelectorAll('header').length > 0,
        footer: document.querySelectorAll('footer').length > 0,
        navigation: document.querySelectorAll('nav').length > 0,
        buttons: document.querySelectorAll('button').length,
        links: document.querySelectorAll('a').length,
        images: document.querySelectorAll('img').length,
        imagesWithoutAlt: document.querySelectorAll('img:not([alt])').length,
        buttonsWithoutLabel: document.querySelectorAll('button:not([aria-label]):not(:has(span)):not(:has(svg))').length,
      };
    });

    console.log('✅ 구조 검증:');
    console.log(`  - Header: ${checks.header ? '✓' : '✗'}`);
    console.log(`  - Footer: ${checks.footer ? '✓' : '✗'}`);
    console.log(`  - Navigation: ${checks.navigation ? '✓' : '✗'}`);
    console.log(`  - 버튼: ${checks.buttons}개`);
    console.log(`  - 링크: ${checks.links}개`);
    console.log(`  - 이미지: ${checks.images}개\n`);

    // 접근성 체크
    const accessibilityIssues = [];

    if (checks.imagesWithoutAlt > 0) {
      accessibilityIssues.push(`alt 속성 없는 이미지: ${checks.imagesWithoutAlt}개`);
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

    // 성능 메트릭
    const metrics = await page.metrics();
    console.log('⚡ 성능 메트릭:');
    console.log(`  - JSHeapUsedSize: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Nodes: ${metrics.Nodes}`);
    console.log(`  - LayoutCount: ${metrics.LayoutCount}`);
    console.log(`  - RecalcStyleCount: ${metrics.RecalcStyleCount}\n`);

    console.log('✅ 검사 완료!\n');

    // 요약
    console.log('📋 요약:');
    if (logs.errors.length === 0 && logs.warnings.length === 0) {
      console.log('  🎉 콘솔 오류 없음! 완벽합니다.\n');
    } else if (logs.errors.length === 0) {
      console.log(`  ⚠️  경고만 ${logs.warnings.length}개 발견됨\n`);
    } else {
      console.log(`  ❌ ${logs.errors.length}개 에러 발견, 수정 필요\n`);
    }

    await browser.close();
    process.exit(logs.errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ 검사 실패:', error.message);
    await browser.close();
    process.exit(1);
  }
}

checkConsole().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
