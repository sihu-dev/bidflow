/**
 * @module ai/cached-prompts
 * @description Prompt Caching for 90% cost reduction
 *
 * Claude Prompt Caching:
 * - 5분 TTL (ephemeral cache)
 * - 1024+ tokens 권장
 * - 비용: 읽기 $0.003/MTok (쓰기 대비 90% 저렴)
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// CACHED SYSTEM PROMPTS
// ============================================================================

/**
 * CMNTech 제품 카탈로그 (캐시됨)
 */
const PRODUCT_CATALOG = `
# CMNTech 제품 카탈로그 (유량계 전문)

## 1. USMAG-910F (전자기 유량계)
- 용도: 상하수도, 산업용수, 냉각수
- 정확도: ±0.5%
- 구경: DN15~DN3000
- 압력: PN10~PN40
- 온도: -20°C ~ 180°C
- 특징:
  * 압력 손실 없음
  * 부식성 유체 측정 가능
  * 양방향 측정
  * 펄스/아날로그/통신 출력
- 가격대: 150만원 ~ 2,500만원

## 2. USTQ-530 (터빈 유량계)
- 용도: 깨끗한 액체, 경유, 등유
- 정확도: ±0.5%
- 구경: DN15~DN300
- 압력: PN16~PN63
- 온도: -20°C ~ 120°C
- 특징:
  * 높은 재현성
  * 빠른 응답속도
  * 낮은 점성 유체 적합
  * 펄스 출력
- 가격대: 80만원 ~ 800만원

## 3. USVT-320 (와류 유량계)
- 용도: 증기, 가스, 액체
- 정확도: ±1.0%
- 구경: DN15~DN300
- 압력: PN16~PN40
- 온도: -40°C ~ 350°C
- 특징:
  * 증기 측정 최적화
  * 온도/압력 보상
  * 가동 부품 없음
  * 높은 신뢰성
- 가격대: 120만원 ~ 1,200만원

## 4. USUL-210 (초음파 유량계)
- 용도: 대구경 배관, 해수, 슬러리
- 정확도: ±1.0%
- 구경: DN50~DN6000
- 압력: PN10~PN25
- 온도: -20°C ~ 110°C
- 특징:
  * 비접촉식 (클램프온)
  * 설치 간편
  * 유지보수 최소화
  * 배관 절단 불필요
- 가격대: 200만원 ~ 3,000만원

## 5. USPT-150 (차압 유량계)
- 용도: 고온/고압 증기, 가스
- 정확도: ±0.5%
- 구경: DN25~DN1000
- 압력: PN100~PN250
- 온도: -100°C ~ 450°C
- 특징:
  * 고온/고압 대응
  * 오리피스/벤츄리 방식
  * 검증된 기술
  * 경제적
- 가격대: 50만원 ~ 500만원
`;

/**
 * 175점 매칭 규칙 (캐시됨)
 */
const MATCHING_RULES = `
# 175점 입찰 매칭 시스템

## 점수 구성 (총 175점)

### 1. 기술 적합성 (75점)
- 제품 유형 매칭 (25점)
  * 완벽 일치: 25점
  * 유사 제품: 15점
  * 대체 가능: 10점
  * 부적합: 0점

- 사양 충족도 (25점)
  * 구경 범위: 10점
  * 압력 등급: 8점
  * 온도 범위: 7점

- 특수 요구사항 (25점)
  * 인증서 (KS, ISO): 10점
  * 방폭 등급: 8점
  * 통신 프로토콜: 7점

### 2. 가격 경쟁력 (50점)
- 예산 대비 가격 (30점)
  * 80% 이하: 30점
  * 80-90%: 25점
  * 90-100%: 20점
  * 100% 초과: 0점

- 원가 경쟁력 (20점)
  * 경쟁사 대비 10% 저렴: 20점
  * 경쟁사와 동일: 15점
  * 경쟁사보다 비쌈: 5점

### 3. 기관 적합성 (30점)
- 과거 납품 실적 (15점)
  * 동일 기관: 15점
  * 유사 기관: 10점
  * 실적 없음: 0점

- 발주처 선호도 (15점)
  * 브랜드 선호: 10점
  * 국산 선호: 5점

### 4. 입찰 조건 (20점)
- 납기 대응 (10점)
  * 즉시 가능: 10점
  * 1개월 내: 7점
  * 2개월 내: 4점

- 하자보증/AS (10점)
  * 3년 이상: 10점
  * 2년: 7점
  * 1년: 4점

## 신뢰도 등급
- 150점 이상: very_high (낙찰 확률 90%+)
- 120-149점: high (낙찰 확률 70-89%)
- 80-119점: medium (낙찰 확률 50-69%)
- 80점 미만: low (낙찰 확률 50% 미만)
`;

/**
 * 입찰 분석 프롬프트 (캐시됨)
 */
const BID_ANALYSIS_SYSTEM = `
당신은 공공조달 입찰 전문가입니다.

역할:
- 입찰 공고 분석
- 제품 매칭
- 낙찰 가능성 평가
- 제안서 작성 지원

분석 원칙:
1. 명시적 요구사항 정확히 파악
2. 암묵적 요구사항 추론
3. 리스크 요인 식별
4. 경쟁사 대비 우위 분석
5. 낙찰 전략 수립

출력 형식:
- 구조화된 JSON
- 명확한 근거 제시
- 액션 아이템 포함
`;

// ============================================================================
// CACHED PROMPT BUILDERS
// ============================================================================

/**
 * 캐시된 시스템 프롬프트 생성 (Bid Matching용)
 */
export function createCachedMatcherPrompt() {
  return [
    {
      type: 'text' as const,
      text: BID_ANALYSIS_SYSTEM,
      cache_control: { type: 'ephemeral' as const },
    },
    {
      type: 'text' as const,
      text: PRODUCT_CATALOG,
      cache_control: { type: 'ephemeral' as const },
    },
    {
      type: 'text' as const,
      text: MATCHING_RULES,
      cache_control: { type: 'ephemeral' as const },
    },
  ];
}

/**
 * 캐시된 시스템 프롬프트 생성 (PDF Analysis용)
 */
export function createCachedPDFAnalysisPrompt() {
  return [
    {
      type: 'text' as const,
      text: `당신은 입찰 공고 문서 분석 전문가입니다.

PDF에서 추출할 정보:
1. 입찰 기본 정보
   - 공고명
   - 발주처
   - 입찰 방식
   - 마감일시

2. 예산 및 계약
   - 추정가격
   - 계약 방식
   - 납품 기한
   - 대금 지급 조건

3. 기술 사양
   - 제품/서비스 상세
   - 수량
   - 기술 요구사항
   - 성능 기준

4. 자격 요건
   - 참가 자격
   - 필수 인증서
   - 실적 요구사항

5. 제출 서류
   - 기술 제안서
   - 가격 제안서
   - 증빙 서류

출력 형식: JSON`,
      cache_control: { type: 'ephemeral' as const },
    },
  ];
}

// ============================================================================
// API WRAPPERS WITH CACHING
// ============================================================================

/**
 * 캐시된 입찰 매칭 분석
 */
export async function cachedBidMatch(
  bidTitle: string,
  bidOrganization: string,
  bidDescription: string,
  estimatedAmount?: number
) {
  const systemPrompt = createCachedMatcherPrompt();

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `다음 입찰 공고에 가장 적합한 CMNTech 제품을 매칭하고 175점 시스템으로 점수를 계산하세요.

입찰 정보:
- 제목: ${bidTitle}
- 발주처: ${bidOrganization}
- 설명: ${bidDescription}
${estimatedAmount ? `- 추정금액: ${estimatedAmount.toLocaleString()}원` : ''}

JSON 형식으로 응답:
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
  "reasons": ["근거1", "근거2", ...],
  "risks": ["리스크1", ...],
  "recommendations": ["추천사항1", ...]
}`,
      },
    ],
  });

  return JSON.parse(response.content[0].text);
}

/**
 * 캐시 통계 조회
 */
export async function getCacheStats() {
  // Anthropic API는 아직 cache stats API를 제공하지 않음
  // 로컬에서 추적 필요
  return {
    hits: 0,
    misses: 0,
    savings: '$0.00',
  };
}

/**
 * Anthropic 클라이언트 export
 */
export { client as anthropic };
