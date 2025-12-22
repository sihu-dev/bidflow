/**
 * @module ai/web-search-tool
 * @description Web Search Tool 통합 - 실시간 경쟁사 정보 및 시장 데이터
 *
 * Web Search Tool (API):
 * - 실시간 웹 검색
 * - 경쟁사 제품 및 가격 정보
 * - 최근 낙찰 사례 분석
 * - 발주처 선호도 파악
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

const MAX_INPUT_LENGTH = 500;

/**
 * 입력 검증 및 살균 (Prompt Injection 방지)
 */
function sanitizeInput(input: string, fieldName: string): string {
  // Null/undefined 체크
  if (!input || typeof input !== 'string') {
    throw new Error(`Invalid ${fieldName}: Must be a non-empty string`);
  }

  // 길이 제한
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error(`${fieldName} exceeds maximum length of ${MAX_INPUT_LENGTH} characters`);
  }

  // 위험한 문자 제거 (Prompt Injection 시도)
  const dangerous = [
    /ignore\s+previous\s+instructions/gi,
    /disregard\s+all\s+previous/gi,
    /system\s*:/gi,
    /assistant\s*:/gi,
    /user\s*:/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
    /```/g,  // Code blocks
  ];

  let sanitized = input;
  for (const pattern of dangerous) {
    if (pattern.test(sanitized)) {
      throw new Error(`${fieldName} contains potentially malicious content`);
    }
  }

  // 특수문자 이스케이프
  sanitized = sanitized
    .replace(/\\/g, '\\\\')  // Backslash
    .replace(/"/g, '\\"')    // Quote
    .replace(/\n/g, ' ')     // Newline
    .replace(/\r/g, '')      // Carriage return
    .trim();

  return sanitized;
}

/**
 * JSON 파싱 검증 (Prototype Pollution 방지)
 */
function safeJsonParse<T>(jsonString: string): T | null {
  try {
    const parsed = JSON.parse(jsonString);

    // Prototype pollution 방지
    if (parsed && typeof parsed === 'object') {
      if ('__proto__' in parsed || 'constructor' in parsed || 'prototype' in parsed) {
        throw new Error('Potential prototype pollution detected');
      }
    }

    return parsed as T;
  } catch (e) {
    console.warn('[Security] JSON parse failed:', e);
    return null;
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CompetitorInfo {
  company_name: string;
  products: Array<{
    name: string;
    specs: string;
    price_range: string;
  }>;
  recent_wins: Array<{
    organization: string;
    amount: number;
    date: string;
  }>;
  market_share: string;
  strengths: string[];
  weaknesses: string[];
}

export interface MarketIntelligence {
  average_winning_price: number;
  price_range: {
    min: number;
    max: number;
  };
  preferred_brands: string[];
  buyer_preferences: string[];
  recent_trends: string[];
  risk_factors: string[];
}

export interface BidHistoryAnalysis {
  organization: string;
  total_bids_last_year: number;
  average_bid_amount: number;
  preferred_vendors: string[];
  common_requirements: string[];
  success_factors: string[];
}

// ============================================================================
// WEB SEARCH FUNCTIONS
// ============================================================================

/**
 * 경쟁사 정보 검색
 */
export async function searchCompetitorInfo(
  productCategory: string,
  bidTitle: string
): Promise<CompetitorInfo[]> {
  try {
    // SECURITY: 입력 검증 및 살균
    const safeBidTitle = sanitizeInput(bidTitle, 'bidTitle');
    const safeCategory = sanitizeInput(productCategory, 'productCategory');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      tools: [
        {
          type: 'web_search_20250305' as const,
          name: 'web_search',
        },
      ],
      messages: [
        {
          role: 'user',
          content: `"${safeBidTitle}" 입찰 관련 "${safeCategory}" 분야 경쟁사 정보 검색:

1. 주요 경쟁사 3-5개 업체
2. 각 경쟁사의 주력 제품 사양
3. 가격대 정보
4. 최근 1년 낙찰 사례
5. 시장 점유율
6. 강점 및 약점

JSON 형식으로 응답:
[
  {
    "company_name": "회사명",
    "products": [...],
    "recent_wins": [...],
    "market_share": "점유율",
    "strengths": [...],
    "weaknesses": [...]
  }
]`,
        },
      ],
    });

    // SECURITY: Tool call 결과 파싱 (Prototype Pollution 방지)
    let competitorData: CompetitorInfo[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        const parsed = safeJsonParse<CompetitorInfo[]>(block.text);
        if (parsed) {
          competitorData = parsed;
        }
      }
    }

    return competitorData;
  } catch (error) {
    console.error('[Web Search] searchCompetitorInfo failed:', error);
    throw error;
  }
}

/**
 * 시장 동향 및 평균 낙찰가 검색
 */
export async function searchMarketIntelligence(
  productCategory: string,
  organization: string
): Promise<MarketIntelligence> {
  try {
    // SECURITY: 입력 검증 및 살균
    const safeCategory = sanitizeInput(productCategory, 'productCategory');
    const safeOrganization = sanitizeInput(organization, 'organization');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      tools: [
        {
          type: 'web_search_20250305' as const,
          name: 'web_search',
        },
      ],
      messages: [
        {
          role: 'user',
          content: `"${safeCategory}" 분야, "${safeOrganization}" 발주처의 시장 정보 검색:

1. 최근 1년간 평균 낙찰가
2. 가격 범위 (최저-최고)
3. 선호 브랜드
4. 구매자 선호 사항
5. 최근 시장 트렌드
6. 리스크 요인

JSON 형식으로 응답:
{
  "average_winning_price": 숫자,
  "price_range": {"min": 숫자, "max": 숫자},
  "preferred_brands": [...],
  "buyer_preferences": [...],
  "recent_trends": [...],
  "risk_factors": [...]
}`,
        },
      ],
    });

    const firstBlock = response.content[0];
    if (firstBlock.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }

    // SECURITY: Safe JSON parsing
    const parsed = safeJsonParse<MarketIntelligence>(firstBlock.text);
    if (!parsed) {
      throw new Error('Failed to parse market intelligence data');
    }

    return parsed;
  } catch (error) {
    console.error('[Web Search] searchMarketIntelligence failed:', error);
    throw error;
  }
}

/**
 * 발주처 과거 입찰 이력 검색
 */
export async function searchBidHistory(organization: string): Promise<BidHistoryAnalysis> {
  try {
    // SECURITY: 입력 검증 및 살균
    const safeOrganization = sanitizeInput(organization, 'organization');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      tools: [
        {
          type: 'web_search_20250305' as const,
          name: 'web_search',
        },
      ],
      messages: [
        {
          role: 'user',
          content: `"${safeOrganization}" 발주처의 과거 입찰 이력 검색:

1. 최근 1년 총 입찰 건수
2. 평균 입찰 금액
3. 선호 공급업체
4. 공통 요구사항
5. 낙찰 성공 요인

JSON 형식으로 응답:
{
  "organization": "기관명",
  "total_bids_last_year": 숫자,
  "average_bid_amount": 숫자,
  "preferred_vendors": [...],
  "common_requirements": [...],
  "success_factors": [...]
}`,
        },
      ],
    });

    const firstBlock = response.content[0];
    if (firstBlock.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }

    // SECURITY: Safe JSON parsing
    const parsed = safeJsonParse<BidHistoryAnalysis>(firstBlock.text);
    if (!parsed) {
      throw new Error('Failed to parse bid history data');
    }

    return parsed;
  } catch (error) {
    console.error('[Web Search] searchBidHistory failed:', error);
    throw error;
  }
}

// ============================================================================
// COMPREHENSIVE ANALYSIS
// ============================================================================

/**
 * 종합 시장 분석 (경쟁사 + 시장 + 발주처 이력)
 */
export async function comprehensiveMarketAnalysis(
  bidTitle: string,
  organization: string,
  productCategory: string
) {
  try {
    const [competitors, market, history] = await Promise.all([
      searchCompetitorInfo(productCategory, bidTitle),
      searchMarketIntelligence(productCategory, organization),
      searchBidHistory(organization),
    ]);

    return {
      competitors,
      market,
      buyer_history: history,
      analysis_timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Web Search] comprehensiveMarketAnalysis failed:', error);
    throw error;
  }
}

/**
 * 가격 경쟁력 분석
 */
export async function analyzePriceCompetitiveness(
  ourPrice: number,
  productCategory: string,
  organization: string
): Promise<{
  competitive: boolean;
  position: 'lowest' | 'competitive' | 'high' | 'too_high';
  market_average: number;
  recommendation: string;
}> {
  try {
    const market = await searchMarketIntelligence(productCategory, organization);

    let position: 'lowest' | 'competitive' | 'high' | 'too_high';
    if (ourPrice <= market.price_range.min) {
      position = 'lowest';
    } else if (ourPrice <= market.average_winning_price * 0.9) {
      position = 'competitive';
    } else if (ourPrice <= market.average_winning_price * 1.1) {
      position = 'high';
    } else {
      position = 'too_high';
    }

    let recommendation: string;
    switch (position) {
      case 'lowest':
        recommendation = '최저가 제시 - 낙찰 확률 높음. 마진 검토 필요.';
        break;
      case 'competitive':
        recommendation = '경쟁력 있는 가격 - 낙찰 가능성 양호.';
        break;
      case 'high':
        recommendation = '시장 평균 대비 높음 - 10% 할인 검토 권장.';
        break;
      case 'too_high':
        recommendation = '시장 평균 대비 매우 높음 - 가격 재조정 필수.';
        break;
    }

    return {
      competitive: position === 'lowest' || position === 'competitive',
      position,
      market_average: market.average_winning_price,
      recommendation,
    };
  } catch (error) {
    console.error('[Web Search] analyzePriceCompetitiveness failed:', error);
    throw error;
  }
}

// ============================================================================
// REAL-TIME ALERTS
// ============================================================================

/**
 * 실시간 경쟁사 동향 모니터링
 */
export async function monitorCompetitorActivity(productCategory: string) {
  try {
    // SECURITY: 입력 검증 및 살균
    const safeCategory = sanitizeInput(productCategory, 'productCategory');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      tools: [
        {
          type: 'web_search_20250305' as const,
          name: 'web_search',
        },
      ],
      messages: [
        {
          role: 'user',
          content: `"${safeCategory}" 분야 경쟁사 최신 동향 (최근 7일):

1. 신제품 출시
2. 가격 변동
3. 대규모 낙찰 사례
4. 전략 변화

간결하게 bullet points로 응답.`,
        },
      ],
    });

    const firstBlock = response.content[0];
    if (firstBlock.type !== 'text') {
      return [];
    }

    return firstBlock.text.split('\n').filter((line) => line.trim().length > 0);
  } catch (error) {
    console.error('[Web Search] monitorCompetitorActivity failed:', error);
    return [];
  }
}

/**
 * 입찰 기회 발견 (키워드 기반)
 */
export async function discoverBidOpportunities(keywords: string[]) {
  try {
    // SECURITY: 입력 검증 및 살균 (각 키워드)
    if (!Array.isArray(keywords) || keywords.length === 0) {
      throw new Error('Keywords must be a non-empty array');
    }

    const safeKeywords = keywords.map((k, i) => sanitizeInput(k, `keyword[${i}]`));

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      tools: [
        {
          type: 'web_search_20250305' as const,
          name: 'web_search',
        },
      ],
      messages: [
        {
          role: 'user',
          content: `다음 키워드 관련 최신 입찰 공고 검색 (최근 7일):
${safeKeywords.map((k) => `- ${k}`).join('\n')}

각 입찰에 대해 JSON으로 응답:
[
  {
    "title": "공고명",
    "organization": "발주처",
    "deadline": "마감일",
    "estimated_amount": 금액,
    "source_url": "URL"
  }
]`,
        },
      ],
    });

    const firstBlock = response.content[0];
    if (firstBlock.type !== 'text') {
      return [];
    }

    // SECURITY: Safe JSON parsing
    const parsed = safeJsonParse<any[]>(firstBlock.text);
    return parsed || [];
  } catch (error) {
    console.error('[Web Search] discoverBidOpportunities failed:', error);
    return [];
  }
}
