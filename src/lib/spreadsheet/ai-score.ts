/**
 * AI_SCORE() 함수 구현
 * 낙찰 가능성 점수 예측 (0-100%)
 */

import { matchBidToProducts, type BidAnnouncement } from '../matching/enhanced-matcher';
import type { Product } from '../matching/enhanced-matcher';

/**
 * 낙찰 가능성 점수 계산
 *
 * 알고리즘:
 * - 매칭 점수 (60%): Enhanced Matcher 결과 기반
 * - 경쟁 강도 (20%): 추정가격 대비 시장 경쟁
 * - 과거 실적 (20%): 유사 공고 낙찰 이력
 *
 * @param bid 입찰 공고 정보
 * @param product 매칭된 제품 (선택)
 * @returns 낙찰 가능성 점수 (0-100)
 *
 * @example
 * ```typescript
 * const score = AI_SCORE({
 *   title: "서울시 상수도본부 초음파유량계",
 *   organization: "서울시 상수도사업본부",
 *   estimatedPrice: 450000000
 * });
 * // → 92
 * ```
 */
export function AI_SCORE(
  bid: BidAnnouncement,
  _product?: Product
): number {
  // 1. 매칭 점수 (60%)
  const matchResult = matchBidToProducts(bid);
  const bestMatch = matchResult.bestMatch;

  if (!bestMatch) {
    return 0; // 매칭 제품 없으면 0점
  }

  // 매칭 점수 정규화 (0-1)
  const matchScore = bestMatch.score / 175;

  // 2. 경쟁 강도 (20%)
  const competitionScore = calculateCompetitionIntensity(bid.estimatedPrice);

  // 3. 과거 실적 (20%)
  const historyScore = getHistoricalSuccessRate(bid.organization, bestMatch.productId);

  // 최종 점수 계산
  const finalScore = (
    matchScore * 0.6 +
    competitionScore * 0.2 +
    historyScore * 0.2
  ) * 100;

  return Math.round(finalScore);
}

/**
 * 경쟁 강도 계산
 *
 * 로직:
 * - 추정가격이 높을수록 경쟁 낮음 (진입 장벽 높음)
 * - 추정가격이 낮을수록 경쟁 높음 (많은 업체 참여)
 *
 * @param estimatedPrice 추정가격 (원)
 * @returns 경쟁 강도 점수 (0-1, 높을수록 낙찰 가능성 높음)
 */
function calculateCompetitionIntensity(estimatedPrice: number | undefined): number {
  if (!estimatedPrice) return 0.5; // 정보 없으면 중간값

  // 5억 이상: 대규모 공사 (경쟁 낮음, 낙찰 가능성 높음)
  if (estimatedPrice >= 500000000) {
    return 0.8;
  }

  // 1억 ~ 5억: 중규모 공사 (중간 경쟁)
  if (estimatedPrice >= 100000000) {
    return 0.6;
  }

  // 5천만 ~ 1억: 소규모 공사 (경쟁 보통)
  if (estimatedPrice >= 50000000) {
    return 0.5;
  }

  // 5천만 미만: 소액 공사 (경쟁 높음, 낙찰 가능성 낮음)
  return 0.3;
}

/**
 * 과거 낙찰 실적 점수
 *
 * TODO: 실제 DB에서 과거 낙찰 이력 조회
 * 현재는 기관별 가중치 기반 추정
 *
 * @param organization 발주기관
 * @param productId 제품 ID
 * @returns 과거 실적 점수 (0-1)
 */
function getHistoricalSuccessRate(organization: string, _productId: string): number {
  // 기관명 정규화
  const orgLower = organization.toLowerCase();

  // 주요 타겟 기관 (높은 성공률)
  const highSuccessOrgs = [
    'k-water', '수자원공사', '상수도사업본부', '환경공단',
    '농어촌공사', '지역난방공사', '한국전력'
  ];

  for (const targetOrg of highSuccessOrgs) {
    if (orgLower.includes(targetOrg)) {
      return 0.8; // 80% 성공률
    }
  }

  // 일반 공공기관
  const publicOrgs = ['시청', '군청', '구청', '공단', '공사'];
  for (const publicOrg of publicOrgs) {
    if (orgLower.includes(publicOrg)) {
      return 0.6; // 60% 성공률
    }
  }

  // 기타 기관
  return 0.5; // 50% 기본 성공률
}

/**
 * 점수 상세 분석 정보
 */
export interface ScoreBreakdown {
  totalScore: number;
  matchScore: number;
  competitionScore: number;
  historyScore: number;
  confidence: 'high' | 'medium' | 'low';
  reasons: string[];
}

/**
 * 점수 상세 분석
 *
 * @param bid 입찰 공고
 * @returns 점수 분해 정보
 */
export function getScoreBreakdown(bid: BidAnnouncement): ScoreBreakdown {
  const matchResult = matchBidToProducts(bid);
  const bestMatch = matchResult.bestMatch;

  if (!bestMatch) {
    return {
      totalScore: 0,
      matchScore: 0,
      competitionScore: 0,
      historyScore: 0,
      confidence: 'low',
      reasons: ['매칭된 제품 없음'],
    };
  }

  const matchScore = (bestMatch.score / 175) * 0.6 * 100;
  const competitionScore = calculateCompetitionIntensity(bid.estimatedPrice) * 0.2 * 100;
  const historyScore = getHistoricalSuccessRate(bid.organization, bestMatch.productId) * 0.2 * 100;
  const totalScore = Math.round(matchScore + competitionScore + historyScore);

  const reasons: string[] = [
    `매칭 점수: ${bestMatch.score}점/175점 (60% 가중치)`,
    `경쟁 강도: ${bid.estimatedPrice ? `${(bid.estimatedPrice / 100000000).toFixed(1)}억원` : '정보 없음'} (20% 가중치)`,
    `과거 실적: ${bid.organization} (20% 가중치)`,
  ];

  let confidence: 'high' | 'medium' | 'low';
  if (totalScore >= 80) confidence = 'high';
  else if (totalScore >= 60) confidence = 'medium';
  else confidence = 'low';

  return {
    totalScore,
    matchScore: Math.round(matchScore),
    competitionScore: Math.round(competitionScore),
    historyScore: Math.round(historyScore),
    confidence,
    reasons,
  };
}
