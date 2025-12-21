/**
 * Enhanced Matcher 테스트 스크립트
 */

import {
  matchBidToProducts,
  batchMatchBids,
  calculateMatchingStats,
  generateMatchSummary,
  isNoneBid,
  SAMPLE_BIDS,
} from './src/lib/matching/enhanced-matcher.ts';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  BIDFLOW Enhanced Matcher 테스트');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 개별 공고 테스트
console.log('[ 개별 공고 매칭 테스트 ]\n');

for (const bid of SAMPLE_BIDS) {
  const result = matchBidToProducts(bid);
  const isNone = isNoneBid(result.allMatches);

  console.log(`📋 ${bid.title}`);
  console.log(`   발주: ${bid.organization}`);
  console.log('');

  if (result.bestMatch) {
    console.log(`✅ 매칭: ${result.bestMatch.productName}`);
    console.log(`   점수: ${result.bestMatch.score}점`);
    console.log(`   신뢰도: ${result.bestMatch.confidence}`);
    console.log(`   권장: ${result.recommendation}`);
    console.log('   세부 점수:');
    console.log(`     - 키워드: ${result.bestMatch.breakdown.keywordScore}점`);
    console.log(`     - 규격: ${result.bestMatch.breakdown.pipeSizeScore}점`);
    console.log(`     - 기관: ${result.bestMatch.breakdown.organizationScore}점`);
    console.log(`   이유: ${result.bestMatch.reasons.join(', ')}`);
  } else {
    console.log('❌ NONE - 매칭 제품 없음');
  }

  console.log('');
  console.log('   전체 제품 점수:');
  for (const match of result.allMatches.slice(0, 3)) {
    console.log(`     ${match.productName}: ${match.score}점 (${match.confidence})`);
  }

  console.log('\n' + '─'.repeat(60) + '\n');
}

// 배치 통계
console.log('[ 배치 매칭 통계 ]\n');

const batchResults = batchMatchBids(SAMPLE_BIDS);
const stats = calculateMatchingStats(batchResults.map((r) => r.result));

console.log(`총 공고: ${stats.total}건`);
console.log('');
console.log('권장 액션:');
console.log(`  BID (입찰 참여): ${stats.byRecommendation.BID}건`);
console.log(`  REVIEW (검토): ${stats.byRecommendation.REVIEW}건`);
console.log(`  SKIP (건너뛰기): ${stats.byRecommendation.SKIP}건`);
console.log('');
console.log('제품별 매칭:');
for (const [productId, count] of Object.entries(stats.byProduct)) {
  console.log(`  ${productId}: ${count}건`);
}
console.log('');
console.log(`NONE: ${stats.noneCount}건 (${(stats.noneRate * 100).toFixed(1)}%)`);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  테스트 완료');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
