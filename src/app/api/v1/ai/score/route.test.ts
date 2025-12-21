/**
 * AI Score API 테스트
 *
 * 실행: npx ts-node src/app/api/v1/ai/score/route.test.ts
 */

import {
  matchBidToProducts,
  SAMPLE_BIDS,
} from '@/lib/matching/enhanced-matcher';

// 테스트 실행
function runTests() {
  console.log('='.repeat(60));
  console.log('AI_SCORE API 테스트');
  console.log('='.repeat(60));

  for (const bid of SAMPLE_BIDS) {
    console.log('\n📋 입찰 공고:', bid.title);
    console.log('   기관:', bid.organization);

    const result = matchBidToProducts(bid);
    const best = result.allMatches[0];

    // 점수 정규화 (0-100)
    const normalizedScore = Math.min(100, Math.round((best.score / 175) * 100));

    console.log('   ───────────────────────────────');
    console.log(`   ✅ 점수: ${normalizedScore}/100 (원점: ${best.score})`);
    console.log(`   📊 신뢰도: ${best.confidence}`);
    console.log(`   🎯 추천: ${result.recommendation}`);

    if (result.bestMatch) {
      console.log(`   🔧 매칭 제품: ${result.bestMatch.productName}`);
    } else {
      console.log('   ❌ 매칭 제품 없음');
    }

    console.log('   💡 이유:');
    for (const reason of best.reasons.slice(0, 3)) {
      console.log(`      - ${reason}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('테스트 완료');
  console.log('='.repeat(60));
}

// 직접 실행 시
if (require.main === module) {
  runTests();
}

export { runTests };
