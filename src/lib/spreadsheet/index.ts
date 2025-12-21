/**
 * @module spreadsheet
 * @description BIDFLOW 스프레드시트 유틸리티
 */

export * from './formula-engine';
export * from './excel-export';

// ============================================================================
// AI 스마트 함수 (5개)
// ============================================================================

// AI_SUMMARY: 입찰 공고 요약
export { AI_SUMMARY, batchAI_SUMMARY } from './ai-summary';

// AI_SCORE: 낙찰 가능성 점수
export {
  AI_SCORE,
  getScoreBreakdown,
  type ScoreBreakdown
} from './ai-score';

// AI_KEYWORDS: 핵심 키워드 추출
export {
  AI_KEYWORDS,
  getCategorizedKeywords,
  highlightKeywords,
  type CategorizedKeywords
} from './ai-keywords';

// AI_DEADLINE: 마감일 분석
export {
  AI_DEADLINE,
  getSimpleDday,
  isUrgent,
  shouldSendReminder,
  groupByDeadline,
  formatDeadline,
  type DeadlineAnalysis,
  type DeadlineGroup,
} from './ai-deadline';

// AI_MATCH: 최적 제품 추천 (Enhanced Matcher)
export {
  matchBidToProducts as AI_MATCH,
  generateMatchSummary,
  batchMatchBids,
  calculateMatchingStats,
  type MatchResult,
  type MatchingStats,
} from '../matching/enhanced-matcher';

/**
 * 모든 AI 함수를 한 번에 실행
 */
export async function runAllAIFunctions(bid: {
  id: string;
  title: string;
  organization: string;
  description?: string;
  estimatedPrice?: number;
  deadline: Date | string;
}) {
  const bidText = `${bid.title}\n${bid.description || ''}`;

  const { AI_SUMMARY } = await import('./ai-summary');
  const { AI_KEYWORDS } = await import('./ai-keywords');
  const { AI_SCORE } = await import('./ai-score');
  const { AI_DEADLINE } = await import('./ai-deadline');
  const { matchBidToProducts } = await import('../matching/enhanced-matcher');

  // 병렬 실행
  const [summary, keywords, matchResult] = await Promise.all([
    AI_SUMMARY(bidText),
    Promise.resolve(AI_KEYWORDS(bidText)),
    Promise.resolve(matchBidToProducts(bid)),
  ]);

  // 순차 실행 (매칭 결과 필요)
  const score = AI_SCORE(bid);
  const deadlineAnalysis = AI_DEADLINE(bid.deadline);

  return {
    summary,
    score,
    match: matchResult,
    keywords,
    deadline: deadlineAnalysis,
  };
}
