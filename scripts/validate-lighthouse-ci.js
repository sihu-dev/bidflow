#!/usr/bin/env node
/**
 * Lighthouse CI 설정 검증 스크립트
 *
 * 실행: node scripts/validate-lighthouse-ci.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔦 Lighthouse CI 설정 검증 시작...\n');

let errors = [];
let warnings = [];
let successes = [];

// ============================================================================
// 1. 필수 파일 존재 확인
// ============================================================================

const requiredFiles = [
  { path: 'lighthouserc.json', description: 'Lighthouse CI 설정 파일' },
  { path: '.lighthouseci/budget.json', description: '성능 예산 파일' },
  { path: '.github/workflows/lighthouse-ci.yml', description: 'GitHub Actions 워크플로우' },
];

console.log('📁 필수 파일 확인:');
requiredFiles.forEach(({ path: filePath, description }) => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    successes.push(`✅ ${description}: ${filePath}`);
  } else {
    errors.push(`❌ ${description} 없음: ${filePath}`);
  }
});

// ============================================================================
// 2. lighthouserc.json 설정 검증
// ============================================================================

console.log('\n⚙️  Lighthouse CI 설정 검증:');
const lhConfigPath = path.join(__dirname, '..', 'lighthouserc.json');

if (fs.existsSync(lhConfigPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(lhConfigPath, 'utf8'));

    // URL 설정 확인
    if (config.ci?.collect?.url?.length > 0) {
      successes.push(`✅ 테스트 URL ${config.ci.collect.url.length}개 설정됨`);
    } else {
      errors.push('❌ 테스트 URL이 설정되지 않음');
    }

    // 성능 기준 확인
    if (config.ci?.assert?.assertions) {
      const assertions = config.ci.assert.assertions;
      const criticalMetrics = [
        'first-contentful-paint',
        'largest-contentful-paint',
        'cumulative-layout-shift',
        'total-blocking-time',
      ];

      criticalMetrics.forEach(metric => {
        if (assertions[metric]) {
          successes.push(`✅ ${metric} 기준 설정됨`);
        } else {
          warnings.push(`⚠️  ${metric} 기준 미설정`);
        }
      });
    } else {
      warnings.push('⚠️  성능 기준(assertions) 미설정');
    }

    // 실행 횟수 확인
    const runs = config.ci?.collect?.numberOfRuns || 1;
    if (runs >= 3) {
      successes.push(`✅ 테스트 반복 횟수: ${runs}회 (권장)`);
    } else {
      warnings.push(`⚠️  테스트 반복 횟수: ${runs}회 (3회 이상 권장)`);
    }

  } catch (e) {
    errors.push(`❌ lighthouserc.json 파싱 실패: ${e.message}`);
  }
} else {
  errors.push('❌ lighthouserc.json 파일 없음');
}

// ============================================================================
// 3. Budget.json 검증
// ============================================================================

console.log('\n💰 성능 예산 검증:');
const budgetPath = path.join(__dirname, '..', '.lighthouseci', 'budget.json');

if (fs.existsSync(budgetPath)) {
  try {
    const budgets = JSON.parse(fs.readFileSync(budgetPath, 'utf8'));

    if (Array.isArray(budgets) && budgets.length > 0) {
      successes.push(`✅ 성능 예산 ${budgets.length}개 경로에 설정됨`);

      budgets.forEach((budget, i) => {
        const path = budget.path || 'unknown';
        if (budget.resourceSizes) {
          successes.push(`  ✅ ${path}: 리소스 크기 제한 설정`);
        }
        if (budget.timings) {
          successes.push(`  ✅ ${path}: 타이밍 제한 설정`);
        }
      });
    } else {
      warnings.push('⚠️  성능 예산이 비어있음');
    }

  } catch (e) {
    errors.push(`❌ budget.json 파싱 실패: ${e.message}`);
  }
} else {
  warnings.push('⚠️  budget.json 파일 없음 (선택사항)');
}

// ============================================================================
// 4. Package.json 스크립트 확인
// ============================================================================

console.log('\n📦 Package.json 스크립트 확인:');
const packagePath = path.join(__dirname, '..', 'package.json');

if (fs.existsSync(packagePath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const scripts = pkg.scripts || {};

    const requiredScripts = ['lighthouse', 'lighthouse:collect', 'lighthouse:assert', 'perf'];

    requiredScripts.forEach(script => {
      if (scripts[script]) {
        successes.push(`✅ 스크립트 "${script}" 설정됨`);
      } else {
        warnings.push(`⚠️  스크립트 "${script}" 미설정`);
      }
    });

    // @lhci/cli 패키지 확인
    if (pkg.devDependencies?.['@lhci/cli']) {
      successes.push(`✅ @lhci/cli 패키지 설치됨: ${pkg.devDependencies['@lhci/cli']}`);
    } else {
      errors.push('❌ @lhci/cli 패키지 미설치');
    }

  } catch (e) {
    errors.push(`❌ package.json 파싱 실패: ${e.message}`);
  }
} else {
  errors.push('❌ package.json 파일 없음');
}

// ============================================================================
// 5. GitHub Actions 워크플로우 검증
// ============================================================================

console.log('\n🤖 GitHub Actions 워크플로우 확인:');
const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'lighthouse-ci.yml');

if (fs.existsSync(workflowPath)) {
  const workflow = fs.readFileSync(workflowPath, 'utf8');

  if (workflow.includes('npm run lighthouse') || workflow.includes('lhci autorun')) {
    successes.push('✅ Lighthouse CI 실행 단계 포함');
  } else {
    errors.push('❌ Lighthouse CI 실행 단계 없음');
  }

  if (workflow.includes('upload-artifact')) {
    successes.push('✅ 결과 업로드 단계 포함');
  } else {
    warnings.push('⚠️  결과 업로드 단계 없음');
  }

  if (workflow.includes('pull_request')) {
    successes.push('✅ PR 트리거 설정됨');
  } else {
    warnings.push('⚠️  PR 트리거 미설정');
  }

} else {
  warnings.push('⚠️  GitHub Actions 워크플로우 없음 (CI/CD 선택사항)');
}

// ============================================================================
// 결과 출력
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('📊 검증 결과 요약');
console.log('='.repeat(60) + '\n');

if (successes.length > 0) {
  console.log('✅ 성공:', successes.length);
  successes.forEach(msg => console.log(msg));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  경고:', warnings.length);
  warnings.forEach(msg => console.log(msg));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ 오류:', errors.length);
  errors.forEach(msg => console.log(msg));
  console.log('');
}

// ============================================================================
// 종료 코드
// ============================================================================

if (errors.length > 0) {
  console.log('❌ Lighthouse CI 설정에 오류가 있습니다.');
  console.log('   위 오류를 수정한 후 다시 시도하세요.\n');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('⚠️  Lighthouse CI 설정이 대부분 완료되었지만 경고가 있습니다.');
  console.log('   경고 사항을 확인하고 필요시 수정하세요.\n');
  process.exit(0);
} else {
  console.log('✅ Lighthouse CI 설정이 완벽합니다!');
  console.log('   `npm run perf` 명령으로 성능 테스트를 실행하세요.\n');
  process.exit(0);
}
