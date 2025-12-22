/**
 * @module ai/deep-matcher
 * @description Extended Thinking for complex bid analysis
 *
 * Claude Extended Thinking:
 * - 모델: claude-3-7-sonnet-20250219
 * - 깊은 추론 능력
 * - 복잡한 문제 해결
 * - 사고 과정 노출
 */

import { anthropic, createCachedMatcherPrompt } from './cached-prompts';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DeepMatchResult {
  matched_product: string;
  score: number;
  confidence: 'very_high' | 'high' | 'medium' | 'low';
  breakdown: {
    technical: number;
    price: number;
    organization: number;
    conditions: number;
  };
  detailed_analysis: {
    explicit_requirements: string[];
    implicit_requirements: string[];
    competitive_advantages: string[];
    risks: string[];
    mitigation_strategies: string[];
  };
  thinking_summary: string;
  recommendation: {
    should_bid: boolean;
    confidence_level: number;
    key_factors: string[];
    action_items: string[];
  };
}

// ============================================================================
// EXTENDED THINKING ANALYSIS
// ============================================================================

/**
 * Extended Thinking으로 입찰 심층 분석
 */
export async function deepBidAnalysis(
  bidId: string,
  bidTitle: string,
  bidOrganization: string,
  bidDescription: string,
  estimatedAmount?: number,
  pastBids?: Array<{
    title: string;
    organization: string;
    won: boolean;
    score: number;
  }>
): Promise<DeepMatchResult> {
  const systemPrompt = createCachedMatcherPrompt();

  const response = await anthropic.messages.create({
    model: 'claude-3-7-sonnet-20250219', // Extended Thinking 지원 모델
    max_tokens: 16000,
    thinking: {
      type: 'enabled',
      budget_tokens: 10000, // 깊은 사고를 위한 충분한 토큰
    },
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `다음 고액 입찰 공고를 깊이 분석하고, 최적의 전략을 수립하세요.

## 입찰 정보
- ID: ${bidId}
- 제목: ${bidTitle}
- 발주처: ${bidOrganization}
- 상세 설명:
${bidDescription}
${estimatedAmount ? `- 추정금액: ${estimatedAmount.toLocaleString()}원` : ''}

${
  pastBids && pastBids.length > 0
    ? `
## 과거 유사 입찰 (참고)
${pastBids.map((b) => `- ${b.title} (${b.organization}) - ${b.won ? '낙찰' : '탈락'}, 점수: ${b.score}`).join('\n')}
`
    : ''
}

## 분석 요구사항

### 1. 명시적 요구사항 분석
- 공고문에 명시된 모든 기술 사양
- 자격 요건
- 제출 서류

### 2. 암묵적 요구사항 추론
- 발주처의 진짜 니즈는 무엇인가?
- 공고문에는 없지만 중요한 요소는?
- 경쟁사는 어떤 전략을 취할까?

### 3. CMNTech 경쟁 우위
- 우리 제품의 강점
- 경쟁사 대비 차별화 포인트
- 가격 경쟁력

### 4. 리스크 분석
- 기술적 리스크
- 가격 리스크
- 일정 리스크
- 경쟁 리스크

### 5. 완화 전략
- 각 리스크에 대한 대응 방안
- 제안서 작성 전략
- 가격 책정 전략

### 6. 입찰 여부 결정
- 175점 시스템 점수
- 낙찰 확률 추정
- 입찰 추천 여부
- 핵심 성공 요인

JSON 형식으로 상세히 응답하세요:
{
  "matched_product": "제품명",
  "score": 점수,
  "confidence": "very_high|high|medium|low",
  "breakdown": {
    "technical": 점수,
    "price": 점수,
    "organization": 점수,
    "conditions": 점수
  },
  "detailed_analysis": {
    "explicit_requirements": ["명시적 요구사항1", ...],
    "implicit_requirements": ["암묵적 요구사항1", ...],
    "competitive_advantages": ["우위1", ...],
    "risks": ["리스크1", ...],
    "mitigation_strategies": ["완화 전략1", ...]
  },
  "thinking_summary": "사고 과정 요약",
  "recommendation": {
    "should_bid": true/false,
    "confidence_level": 0.85,
    "key_factors": ["핵심 요인1", ...],
    "action_items": ["액션 아이템1", ...]
  }
}`,
      },
    ],
  });

  // Extended Thinking 과정 추출
  let thinkingContent = '';
  for (const block of response.content) {
    if (block.type === 'thinking') {
      thinkingContent = block.thinking;
    }
  }

  // 응답 파싱
  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  const result: DeepMatchResult = JSON.parse(textContent.text);

  // Thinking 요약 추가
  if (thinkingContent) {
    result.thinking_summary = thinkingContent.slice(0, 500) + '...';
  }

  return result;
}

/**
 * Extended Thinking 사용 여부 결정
 */
export function shouldUseExtendedThinking(
  estimatedAmount?: number,
  complexity?: 'low' | 'medium' | 'high'
): boolean {
  // 1억원 이상 고액 입찰
  if (estimatedAmount && estimatedAmount >= 100_000_000) {
    return true;
  }

  // 복잡도 높음
  if (complexity === 'high') {
    return true;
  }

  // 사용자가 명시적으로 요청
  return false;
}

/**
 * Extended Thinking 비용 계산
 */
export function calculateExtendedThinkingCost(
  thinkingTokens: number,
  outputTokens: number
): number {
  // Extended Thinking: $8/MTok (input), $24/MTok (output)
  const thinkingCost = (thinkingTokens / 1_000_000) * 8;
  const outputCost = (outputTokens / 1_000_000) * 24;
  return thinkingCost + outputCost;
}

// ============================================================================
// COMPETITIVE ANALYSIS
// ============================================================================

/**
 * 경쟁사 분석 (Extended Thinking)
 */
export async function analyzeCompetitors(
  bidTitle: string,
  competitors: Array<{
    name: string;
    product: string;
    price_range: string;
    market_share: number;
  }>
) {
  const response = await anthropic.messages.create({
    model: 'claude-3-7-sonnet-20250219',
    max_tokens: 8000,
    thinking: {
      type: 'enabled',
      budget_tokens: 5000,
    },
    messages: [
      {
        role: 'user',
        content: `다음 입찰에서 경쟁사 대비 우리의 전략을 수립하세요.

입찰: ${bidTitle}

경쟁사 정보:
${competitors.map((c) => `- ${c.name}: ${c.product} (${c.price_range}), 시장 점유율 ${c.market_share}%`).join('\n')}

분석 요청:
1. 각 경쟁사의 강점/약점
2. 우리의 차별화 포인트
3. 가격 책정 전략
4. 제안서 작성 포인트
5. 낙찰 확률 극대화 방법

JSON으로 응답하세요.`,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return JSON.parse(textContent.text);
}

// ============================================================================
// PROPOSAL GENERATION
// ============================================================================

/**
 * 제안서 초안 생성 (Extended Thinking)
 */
export async function generateProposalDraft(
  analysis: DeepMatchResult,
  bidTitle: string,
  bidOrganization: string
) {
  const response = await anthropic.messages.create({
    model: 'claude-3-7-sonnet-20250219',
    max_tokens: 16000,
    thinking: {
      type: 'enabled',
      budget_tokens: 8000,
    },
    messages: [
      {
        role: 'user',
        content: `다음 입찰 분석 결과를 바탕으로 기술 제안서 초안을 작성하세요.

## 입찰 정보
- 제목: ${bidTitle}
- 발주처: ${bidOrganization}

## 분석 결과
${JSON.stringify(analysis, null, 2)}

## 제안서 구성
1. 제안 개요 (1페이지)
2. 제품 사양 및 적합성 (2-3페이지)
3. 기술적 우위 (2페이지)
4. 납품 계획 (1페이지)
5. 품질 보증 및 A/S (1페이지)
6. 가격 경쟁력 (1페이지)

마크다운 형식으로 작성하세요.`,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return textContent.text;
}
