/**
 * 개선된 제품 매칭 엔진
 * 가중치 기반 키워드 + 규격 + 기관 종합 점수 계산
 */

import { extractPipeSize, matchPipeSize } from './pipe-size-extractor';
import { getOrganizationProductScore } from './organization-dictionary';

/**
 * CMNTech 제품 정의
 */
export interface Product {
  id: string;
  name: string;
  category: string;
  /** 파이프 규격 범위 (null이면 규격 무관) */
  pipeSizeRange: { min: number; max: number } | null;
  /** 강한 키워드 (필수 매칭, 가중치 10) */
  strongKeywords: string[];
  /** 약한 키워드 (보조 매칭, 가중치 3) */
  weakKeywords: string[];
  /** 제외 키워드 (존재 시 매칭 불가) */
  excludeKeywords: string[];
}

/**
 * CMNTech 5개 제품 카탈로그
 */
export const CMNTECH_PRODUCTS: Product[] = [
  {
    id: 'UR-1000PLUS',
    name: '다회선 초음파 유량계',
    category: '상수도',
    pipeSizeRange: { min: 300, max: 4000 },
    strongKeywords: [
      '초음파유량계',
      '초음파 유량계',
      '다회선',
      '상수도',
      '정수장',
      '취수장',
    ],
    weakKeywords: ['유량계', '계측기', '측정기', '상수'],
    excludeKeywords: ['전자유량계', '전자식', '비만관', '개수로', '열량계'],
  },
  {
    id: 'MF-1000C',
    name: '일체형 전자 유량계',
    category: '상거래',
    pipeSizeRange: { min: 15, max: 300 },
    strongKeywords: [
      '전자유량계',
      '전자 유량계',
      '일체형',
      '플랜지형',
      '공업용수',
      '상거래',
    ],
    weakKeywords: ['유량계', '계측기', '측정기', '전자식'],
    excludeKeywords: ['초음파', '비만관', '개수로', '열량계'],
  },
  {
    id: 'UR-1010PLUS',
    name: '비만관형 유량계',
    category: '하수처리',
    pipeSizeRange: { min: 300, max: 3000 },
    strongKeywords: [
      '비만관',
      '비만관형',
      '비접촉',
      '하수',
      '하수처리',
      '우수',
      '우수관거',
    ],
    weakKeywords: ['유량계', '계측기', '환경', '관거'],
    excludeKeywords: ['전자유량계', '개수로', '열량계', '상수도'],
  },
  {
    id: 'SL-3000PLUS',
    name: '개수로 유량계',
    category: '하천/수로',
    pipeSizeRange: null, // 폭 기준 측정
    strongKeywords: [
      '개수로',
      '레벨센서',
      '하천',
      '수로',
      '농업용수',
      '관개용수',
    ],
    weakKeywords: ['유량계', '유량측정', '농어촌', '수자원'],
    excludeKeywords: ['비만관', '전자유량계', '열량계', '파이프'],
  },
  {
    id: 'EnerRay',
    name: '초음파 열량계',
    category: '에너지',
    pipeSizeRange: null, // 규격 다양
    strongKeywords: [
      '열량계',
      '초음파 열량계',
      '에너지',
      '난방',
      '지역난방',
      '열공급',
    ],
    weakKeywords: ['계측기', '측정기', '열', '온도'],
    excludeKeywords: ['유량계', '비만관', '개수로'],
  },
];

/**
 * 입찰 공고 인터페이스
 */
export interface BidAnnouncement {
  id: string;
  title: string;
  organization: string;
  description?: string;
  estimatedPrice?: number;
}

/**
 * 매칭 결과
 */
export interface MatchResult {
  productId: string;
  productName: string;
  score: number;
  confidence: 'high' | 'medium' | 'low' | 'none';
  breakdown: {
    keywordScore: number;
    pipeSizeScore: number;
    organizationScore: number;
    totalScore: number;
  };
  reasons: string[];
  isMatch: boolean;
}

/**
 * 키워드 매칭 점수 계산
 */
function calculateKeywordScore(
  text: string,
  product: Product
): {
  score: number;
  matchedStrong: string[];
  matchedWeak: string[];
  hasExclude: boolean;
} {
  const lowerText = text.toLowerCase();
  const matchedStrong: string[] = [];
  const matchedWeak: string[] = [];

  // 제외 키워드 체크 (최우선)
  for (const keyword of product.excludeKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return { score: -100, matchedStrong: [], matchedWeak: [], hasExclude: true };
    }
  }

  // 강한 키워드 매칭 (10점씩)
  for (const keyword of product.strongKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matchedStrong.push(keyword);
    }
  }

  // 약한 키워드 매칭 (3점씩)
  for (const keyword of product.weakKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matchedWeak.push(keyword);
    }
  }

  const strongScore = matchedStrong.length * 10;
  const weakScore = matchedWeak.length * 3;
  const totalScore = strongScore + weakScore;

  return {
    score: totalScore,
    matchedStrong,
    matchedWeak,
    hasExclude: false,
  };
}

/**
 * 단일 제품에 대한 매칭 점수 계산
 */
function matchProduct(
  bid: BidAnnouncement,
  product: Product
): MatchResult {
  const fullText = [bid.title, bid.description || '', bid.organization]
    .join(' ')
    .trim();

  const reasons: string[] = [];
  let totalScore = 0;

  // 1. 키워드 매칭 (최대 100점)
  const keywordResult = calculateKeywordScore(fullText, product);

  if (keywordResult.hasExclude) {
    return {
      productId: product.id,
      productName: product.name,
      score: 0,
      confidence: 'none',
      breakdown: {
        keywordScore: 0,
        pipeSizeScore: 0,
        organizationScore: 0,
        totalScore: 0,
      },
      reasons: ['제외 키워드 발견 - 매칭 불가'],
      isMatch: false,
    };
  }

  totalScore += keywordResult.score;

  if (keywordResult.matchedStrong.length > 0) {
    reasons.push(
      `강한 키워드 ${keywordResult.matchedStrong.length}개: ${keywordResult.matchedStrong.slice(0, 3).join(', ')}`
    );
  }
  if (keywordResult.matchedWeak.length > 0) {
    reasons.push(
      `약한 키워드 ${keywordResult.matchedWeak.length}개: ${keywordResult.matchedWeak.slice(0, 3).join(', ')}`
    );
  }

  // 2. 파이프 규격 매칭 (최대 25점)
  let pipeSizeScore = 0;
  if (product.pipeSizeRange !== null) {
    const extracted = extractPipeSize(fullText);
    const matchResult = matchPipeSize(extracted, product.pipeSizeRange);

    pipeSizeScore = matchResult.matchScore;
    totalScore += pipeSizeScore;

    if (matchResult.isMatch) {
      reasons.push(`규격 매칭: ${matchResult.reason}`);
    } else if (extracted.allDns.length > 0) {
      reasons.push(`규격 불일치: ${matchResult.reason}`);
      // 규격 불일치 시 감점
      totalScore -= 10;
    }
  } else {
    // 규격 무관 제품 (SL-3000PLUS, EnerRay)
    pipeSizeScore = 10;
    totalScore += 10;
    reasons.push('규격 조건 없음');
  }

  // 3. 발주기관 매칭 (최대 50점)
  const orgResult = getOrganizationProductScore(bid.organization, product.id);
  const organizationScore = orgResult.score;
  totalScore += organizationScore;

  if (orgResult.isRelated) {
    reasons.push(`타겟 기관: ${orgResult.reason}`);
  } else if (organizationScore > 0) {
    reasons.push(`기관 매칭: ${orgResult.reason}`);
  }

  // 4. 신뢰도 계산
  let confidence: MatchResult['confidence'];
  if (totalScore >= 50 && keywordResult.matchedStrong.length >= 1) {
    confidence = 'high';
  } else if (totalScore >= 30) {
    confidence = 'medium';
  } else if (totalScore >= 15) {
    confidence = 'low';
  } else {
    confidence = 'none';
  }

  // 5. 매칭 여부 결정
  const isMatch = confidence === 'high' || confidence === 'medium';

  return {
    productId: product.id,
    productName: product.name,
    score: totalScore,
    confidence,
    breakdown: {
      keywordScore: keywordResult.score,
      pipeSizeScore,
      organizationScore,
      totalScore,
    },
    reasons,
    isMatch,
  };
}

/**
 * 모든 제품에 대한 매칭 수행 (AI_MATCH 함수 구현)
 */
export function matchBidToProducts(
  bid: BidAnnouncement
): {
  bestMatch: MatchResult | null;
  allMatches: MatchResult[];
  recommendation: 'BID' | 'REVIEW' | 'SKIP';
} {
  const allMatches = CMNTECH_PRODUCTS.map((product) =>
    matchProduct(bid, product)
  );

  // 점수 기준 정렬
  allMatches.sort((a, b) => b.score - a.score);

  const bestMatch = allMatches[0];

  // 추천 전략
  let recommendation: 'BID' | 'REVIEW' | 'SKIP';
  if (bestMatch.confidence === 'high' && bestMatch.score >= 60) {
    recommendation = 'BID'; // 적극 참여
  } else if (bestMatch.confidence === 'medium' || bestMatch.score >= 30) {
    recommendation = 'REVIEW'; // 검토 필요
  } else {
    recommendation = 'SKIP'; // 건너뛰기
  }

  return {
    bestMatch: bestMatch.isMatch ? bestMatch : null,
    allMatches,
    recommendation,
  };
}

/**
 * NONE 클래스 판단
 * 모든 제품이 low/none 신뢰도면 NONE
 */
export function isNoneBid(allMatches: MatchResult[]): boolean {
  return allMatches.every(
    (match) => match.confidence === 'low' || match.confidence === 'none'
  );
}

/**
 * 매칭 결과 요약 텍스트 생성
 */
export function generateMatchSummary(result: {
  bestMatch: MatchResult | null;
  recommendation: 'BID' | 'REVIEW' | 'SKIP';
}): string {
  if (!result.bestMatch) {
    return 'NONE - 적합한 제품 없음';
  }

  const { productName, score, confidence, reasons } = result.bestMatch;

  const lines = [
    `제품: ${productName}`,
    `점수: ${score}점 (신뢰도: ${confidence})`,
    `이유: ${reasons.slice(0, 2).join(', ')}`,
    `권장: ${result.recommendation === 'BID' ? '입찰 참여' : result.recommendation === 'REVIEW' ? '검토 필요' : '건너뛰기'}`,
  ];

  return lines.join('\n');
}

/**
 * 배치 매칭 (여러 공고 동시 처리)
 */
export function batchMatchBids(
  bids: BidAnnouncement[]
): Array<{
  bid: BidAnnouncement;
  result: ReturnType<typeof matchBidToProducts>;
}> {
  return bids.map((bid) => ({
    bid,
    result: matchBidToProducts(bid),
  }));
}

/**
 * 매칭 통계 계산
 */
export interface MatchingStats {
  total: number;
  byRecommendation: {
    BID: number;
    REVIEW: number;
    SKIP: number;
  };
  byProduct: Record<string, number>;
  noneCount: number;
  noneRate: number;
}

export function calculateMatchingStats(
  results: Array<ReturnType<typeof matchBidToProducts>>
): MatchingStats {
  const stats: MatchingStats = {
    total: results.length,
    byRecommendation: { BID: 0, REVIEW: 0, SKIP: 0 },
    byProduct: {},
    noneCount: 0,
    noneRate: 0,
  };

  for (const result of results) {
    stats.byRecommendation[result.recommendation]++;

    if (result.bestMatch) {
      const productId = result.bestMatch.productId;
      stats.byProduct[productId] = (stats.byProduct[productId] || 0) + 1;
    } else {
      stats.noneCount++;
    }
  }

  stats.noneRate = stats.total > 0 ? stats.noneCount / stats.total : 0;

  return stats;
}

/**
 * 테스트용 샘플 공고
 */
export const SAMPLE_BIDS: BidAnnouncement[] = [
  {
    id: 'BID-001',
    title: '서울시 상수도사업본부 초음파유량계 구매',
    organization: '서울특별시 상수도사업본부',
    description: 'DN500 초음파유량계 20대 납품 설치',
    estimatedPrice: 450000000,
  },
  {
    id: 'BID-002',
    title: '부산환경공단 하수처리장 비만관유량계 설치',
    organization: '부산광역시 환경공단',
    description: 'DN1000 비만관형 유량계 5대',
    estimatedPrice: 95000000,
  },
  {
    id: 'BID-003',
    title: '한국농어촌공사 농업용 개수로 유량측정 시스템',
    organization: '한국농어촌공사',
    description: '개수로 레벨센서 유량계 10개소',
    estimatedPrice: 180000000,
  },
  {
    id: 'BID-004',
    title: '한국지역난방공사 열량계 납품',
    organization: '한국지역난방공사',
    description: '초음파 열량계 100대',
    estimatedPrice: 120000000,
  },
  {
    id: 'BID-005',
    title: '수도권 정수장 펌프 및 밸브 교체 공사',
    organization: '한국수자원공사',
    description: 'DN300 펌프 10대, 밸브 20개',
    estimatedPrice: 320000000,
  },
  {
    id: 'BID-006',
    title: '인천시 공업용수 전자유량계 교체',
    organization: '인천광역시',
    description: 'DN100 전자식 유량계 일체형 30대',
    estimatedPrice: 85000000,
  },
];
