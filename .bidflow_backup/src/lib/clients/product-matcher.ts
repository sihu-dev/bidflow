/**
 * @module clients/product-matcher
 * @description 제품 매칭 로직 (씨엠엔텍 제품 기준)
 */

import type { BidData, ProductMatch, MatchConfidence } from '@forge-labs/types/bidding';

// ============================================================================
// 제품 매칭 규칙 정의
// ============================================================================

interface ProductRule {
  product: string;
  productName: string;
  keywords: string[];
  organizations: string[];
  pipeSize?: { min: number; max: number };
  priority: number;
}

const PRODUCT_RULES: ProductRule[] = [
  {
    product: 'UR-1000PLUS',
    productName: 'UR-1000PLUS® 다회선 초음파 유량계',
    keywords: ['초음파유량계', '다회선', '만관', '상수도', '취수장', '정수장', '유량측정', '관로유량'],
    organizations: ['수자원공사', '상수도', '환경부', '지자체', '정수장'],
    pipeSize: { min: 100, max: 4000 },
    priority: 1,
  },
  {
    product: 'MF-1000C',
    productName: 'MF-1000C 일체형 전자유량계',
    keywords: ['전자유량계', '전자식', '상거래', '공업용수', '계량기', '유량측정'],
    organizations: ['지자체', '산업단지', '농어촌', '공단'],
    pipeSize: { min: 15, max: 2000 },
    priority: 2,
  },
  {
    product: 'UR-1010PLUS',
    productName: 'UR-1010PLUS® 비만관형 초음파 유량계',
    keywords: ['비만관', '하수', '우수', '복류수', '하수관로', '우수관로', '부분충수'],
    organizations: ['하수도', '환경공단', '환경부', '하수처리'],
    pipeSize: { min: 200, max: 3000 },
    priority: 1,
  },
  {
    product: 'SL-3000PLUS',
    productName: 'SL-3000PLUS 개수로 유량계',
    keywords: ['개수로', '하천', '방류', '농업용수', '수로', '하천유량', '방류량'],
    organizations: ['하천', '농림', '환경부', '댐', '저수지'],
    priority: 2,
  },
  {
    product: 'EnerRay',
    productName: 'EnerRay 초음파 열량계',
    keywords: ['열량계', '에너지', '난방', '냉난방', '열교환', '지역난방'],
    organizations: ['지역난방', '열병합', '에너지', '난방공사'],
    priority: 3,
  },
];

// ============================================================================
// 매칭 함수
// ============================================================================

/**
 * 입찰 공고에 대한 제품 매칭
 */
export function matchProducts(bid: BidData): ProductMatch[] {
  const matches: ProductMatch[] = [];
  const bidText = `${bid.title} ${bid.organization} ${bid.rawData.requirements ?? ''} ${bid.rawData.specifications ?? ''}`.toLowerCase();

  for (const rule of PRODUCT_RULES) {
    let score = 0;
    const reasons: string[] = [];
    const requirementsMatch: string[] = [];
    const requirementsGap: string[] = [];

    // 키워드 매칭 (각 20점)
    for (const keyword of rule.keywords) {
      if (bidText.includes(keyword.toLowerCase())) {
        score += 20;
        reasons.push(`키워드 매칭: ${keyword}`);
        requirementsMatch.push(keyword);
      }
    }

    // 기관 매칭 (각 30점)
    for (const org of rule.organizations) {
      if (bid.organization.toLowerCase().includes(org.toLowerCase())) {
        score += 30;
        reasons.push(`발주처 매칭: ${org}`);
      }
    }

    // 파이프 크기 매칭 (25점)
    if (rule.pipeSize && bid.rawData.pipeSize) {
      const sizeMatch = bid.rawData.pipeSize.match(/(\d+)/);
      if (sizeMatch) {
        const size = parseInt(sizeMatch[1], 10);
        if (size >= rule.pipeSize.min && size <= rule.pipeSize.max) {
          score += 25;
          reasons.push(`파이프 규격 적합: DN${size}`);
          requirementsMatch.push(`DN${size} (${rule.pipeSize.min}~${rule.pipeSize.max}mm 범위)`);
        } else {
          requirementsGap.push(`파이프 규격 불일치: DN${size}`);
        }
      }
    }

    // 우선순위 보너스 (P1: +10점)
    if (rule.priority === 1 && score > 0) {
      score += 10;
      reasons.push('핵심 제품');
    }

    // 점수 정규화 (0-100)
    const normalizedScore = Math.min(100, score);

    if (normalizedScore > 0) {
      matches.push({
        productId: rule.product,
        productName: rule.productName,
        score: normalizedScore,
        confidence: getConfidenceLevel(normalizedScore),
        reasons,
        requirementsMatch,
        requirementsGap,
      });
    }
  }

  // 점수 순으로 정렬
  return matches.sort((a, b) => b.score - a.score);
}

/**
 * 점수에 따른 신뢰도 등급 결정
 */
function getConfidenceLevel(score: number): MatchConfidence {
  if (score >= 90) return 'very_high';
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

// ============================================================================
// AI 기반 매칭 (확장용)
// ============================================================================

interface AIMatchRequest {
  bid: BidData;
  products: Array<{
    id: string;
    name: string;
    description: string;
    specifications: Record<string, string>;
  }>;
}

interface AIMatchResponse {
  recommended: string;
  score: number;
  reasons: string[];
  requirementsMatch: string[];
  requirementsGap: string[];
}

/**
 * AI를 통한 고급 매칭 (프롬프트 생성)
 */
export function generateAIMatchPrompt(request: AIMatchRequest): string {
  const productsDescription = request.products
    .map((p, i) => `${i + 1}. ${p.name}: ${p.description}`)
    .join('\n');

  return `
입찰 공고를 분석하고 가장 적합한 제품을 추천해 주세요.

## 입찰 정보
- 제목: ${request.bid.title}
- 발주처: ${request.bid.organization}
- 유형: ${request.bid.type}
- 요구사항: ${request.bid.rawData.requirements ?? '없음'}
- 사양: ${request.bid.rawData.specifications ?? '없음'}

## 당사 제품 라인업
${productsDescription}

## 응답 형식 (JSON)
{
  "recommended": "제품ID",
  "score": 0-100,
  "reasons": ["추천 이유1", "추천 이유2"],
  "requirementsMatch": ["충족 요건1", "충족 요건2"],
  "requirementsGap": ["미충족 요건1"]
}
`.trim();
}

/**
 * AI 응답 파싱
 */
export function parseAIMatchResponse(response: string): AIMatchResponse | null {
  try {
    // JSON 블록 추출
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as AIMatchResponse;

    // 필수 필드 검증
    if (
      typeof parsed.recommended !== 'string' ||
      typeof parsed.score !== 'number' ||
      !Array.isArray(parsed.reasons)
    ) {
      return null;
    }

    return {
      recommended: parsed.recommended,
      score: Math.min(100, Math.max(0, parsed.score)),
      reasons: parsed.reasons,
      requirementsMatch: parsed.requirementsMatch ?? [],
      requirementsGap: parsed.requirementsGap ?? [],
    };
  } catch {
    return null;
  }
}

// ============================================================================
// 매칭 결과 포맷팅
// ============================================================================

/**
 * 매칭 결과를 사람이 읽기 쉬운 형식으로 변환
 */
export function formatMatchResults(matches: ProductMatch[]): string {
  if (matches.length === 0) {
    return '적합한 제품을 찾지 못했습니다.';
  }

  return matches
    .map((match, index) => {
      const confidenceEmoji =
        match.confidence === 'very_high' ? '🎯' :
        match.confidence === 'high' ? '✅' :
        match.confidence === 'medium' ? '⚠️' : '❓';

      return `${index + 1}. ${confidenceEmoji} ${match.productName}
   - 매칭 점수: ${match.score}/100 (${match.confidence})
   - 이유: ${match.reasons.join(', ')}
   - 충족 요건: ${match.requirementsMatch.join(', ') || '없음'}
   - 미충족 요건: ${match.requirementsGap.join(', ') || '없음'}`;
    })
    .join('\n\n');
}
