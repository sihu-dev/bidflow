# BIDFLOW 엔터프라이즈 - AI 바우처 사업 기획

> **목적**: 중소/중견기업용 고급 자동화 기능
> **지원금**: 정보통신산업진흥원 AI 바우처 (최대 3억원)
> **작성일**: 2025-12-20

---

## 1. 사업 개요

### 1.1 AI 바우처란?
- 정부 지원 AI 도입 지원금 (NIPA)
- 중소/중견기업 대상
- 최대 3억원 (70% 정부, 30% 자부담)
- 신청: 연 2회 (상반기/하반기)

### 1.2 BIDFLOW 적용 영역

```
┌─────────────────────────────────────────────────────────────┐
│                BIDFLOW Enterprise Features                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [1. 경쟁사 모니터링]                                        │
│   ├── 실시간 경쟁사 입찰 추적                                  │
│   ├── 낙찰 패턴 분석                                         │
│   └── 가격 전략 인사이트                                      │
│                                                             │
│   [2. 스마트 매칭]                                           │
│   ├── 제품-공고 자동 매칭                                     │
│   ├── 적합성 점수 예측                                        │
│   └── 추천 우선순위                                          │
│                                                             │
│   [3. 자동 제안서]                                           │
│   ├── 제안서 초안 생성                                        │
│   ├── 템플릿 학습                                            │
│   └── 규격 자동 맞춤                                         │
│                                                             │
│   [4. 시장 인사이트]                                          │
│   ├── 산업별 트렌드 분석                                      │
│   ├── 예산 사이클 예측                                        │
│   └── 신규 기회 발굴                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 핵심 기능 상세

### 2.1 경쟁사 모니터링 시스템

#### 기능 설명
- 경쟁사 낙찰 이력 자동 수집
- 가격 패턴 분석 (평균 낙찰률)
- 참여 빈도 및 선호 분야 파악

#### 기술 구현

```typescript
// src/lib/features/competitor-monitor.ts

interface CompetitorProfile {
  name: string;
  registrationNumber: string;
  totalBids: number;
  winRate: number;
  avgDiscountRate: number;
  preferredCategories: string[];
  recentActivity: BidActivity[];
}

interface CompetitorInsight {
  competitor: string;
  pattern: 'aggressive' | 'conservative' | 'selective';
  avgPrice: number;
  strongAreas: string[];
  weakAreas: string[];
  recommendation: string;
}

export async function analyzeCompetitor(
  competitorId: string,
  bidCategory: string
): Promise<CompetitorInsight> {
  // 1. 경쟁사 낙찰 이력 조회
  const history = await fetchCompetitorHistory(competitorId);

  // 2. 패턴 분석 (Gemini - 저렴)
  const pattern = await classifyPattern(history);

  // 3. 전략 추천 (Claude - 복잡 분석)
  const recommendation = await generateStrategy(pattern, bidCategory);

  return { competitor: competitorId, pattern, ...recommendation };
}
```

#### 데이터 소스
- 나라장터 낙찰 공개 데이터
- 조달청 API
- 공공데이터포털

---

### 2.2 스마트 매칭 엔진

#### 기능 설명
- 자사 제품 카탈로그 기반 공고 매칭
- 요구사항 자동 분석
- 적합성 점수 (0-100)

#### 기술 구현

```typescript
// src/lib/features/smart-matching.ts

interface MatchResult {
  bidId: string;
  productId: string;
  score: number;
  matchedRequirements: string[];
  missingRequirements: string[];
  recommendation: 'strong' | 'medium' | 'weak';
}

export async function matchBidToProducts(
  bid: Bid,
  products: Product[]
): Promise<MatchResult[]> {
  // 1. 요구사항 추출 (Gemini)
  const requirements = await extractRequirements(bid.description);

  // 2. 제품별 매칭 (병렬 처리)
  const matches = await Promise.all(
    products.map(product =>
      calculateMatch(product, requirements)
    )
  );

  // 3. 순위 정렬
  return matches.sort((a, b) => b.score - a.score);
}
```

#### 매칭 알고리즘
1. 키워드 매칭 (40%)
2. 규격 호환성 (30%)
3. 가격 범위 (20%)
4. 과거 낙찰 이력 (10%)

---

### 2.3 자동 제안서 생성

#### 기능 설명
- 공고 요구사항 기반 제안서 초안
- 과거 제안서 템플릿 학습
- 섹션별 커스터마이징

#### 생성 섹션

| 섹션 | 내용 | 모델 |
|------|------|------|
| 요약 | Executive Summary | Claude |
| 기술 | 기술 제안서 | Claude |
| 가격 | 가격 제안서 | Gemini |
| 일정 | 이행 일정 | Gemini |
| 회사 | 회사 소개 | Template |

#### 기술 구현

```typescript
// src/lib/features/proposal-generator.ts

interface ProposalDraft {
  executiveSummary: string;
  technicalProposal: string;
  priceProposal: PriceBreakdown;
  schedule: MilestoneSchedule;
  companyProfile: string;
}

export async function generateProposal(
  bid: Bid,
  company: Company,
  template?: ProposalTemplate
): Promise<ProposalDraft> {
  // 병렬 생성
  const [summary, technical, price, schedule] = await Promise.all([
    generateExecutiveSummary(bid, company),      // Claude
    generateTechnicalSection(bid, company),      // Claude
    generatePriceSection(bid, company),          // Gemini
    generateSchedule(bid),                       // Gemini
  ]);

  return {
    executiveSummary: summary,
    technicalProposal: technical,
    priceProposal: price,
    schedule,
    companyProfile: company.profile,
  };
}
```

---

### 2.4 시장 인사이트 대시보드

#### 기능 설명
- 산업별 입찰 트렌드
- 예산 사이클 예측
- 신규 기회 알림

#### 인사이트 항목

```typescript
interface MarketInsight {
  industry: string;
  period: string;
  metrics: {
    totalBids: number;
    avgAmount: number;
    growthRate: number;
    topCategories: string[];
  };
  trends: {
    direction: 'up' | 'down' | 'stable';
    forecast: string;
    opportunities: string[];
  };
  recommendations: string[];
}
```

---

## 3. AI 바우처 신청 계획

### 3.1 사업비 구성

| 항목 | 금액 | 비고 |
|------|------|------|
| SW 개발 | 1.5억 | 핵심 기능 개발 |
| 인프라 | 0.3억 | 클라우드/API |
| 데이터 | 0.2억 | 학습 데이터 구축 |
| **합계** | **2.0억** | |

### 3.2 지원금 배분

```
정부 지원: 1.4억 (70%)
자부담:    0.6억 (30%)
```

### 3.3 개발 일정

| 단계 | 기간 | 내용 |
|------|------|------|
| 1단계 | 1-2개월 | 경쟁사 모니터링 |
| 2단계 | 3-4개월 | 스마트 매칭 |
| 3단계 | 5-6개월 | 제안서 생성 |
| 4단계 | 7-8개월 | 시장 인사이트 |

---

## 4. 기대 효과

### 4.1 정량적 효과

| 지표 | 현재 | 도입 후 | 개선율 |
|------|------|---------|--------|
| 입찰 분석 시간 | 4시간/건 | 30분/건 | 87% 감소 |
| 제안서 작성 | 3일/건 | 4시간/건 | 83% 감소 |
| 적합 공고 발굴 | 10건/주 | 50건/주 | 400% 증가 |
| 낙찰률 | 15% | 25% | 67% 향상 |

### 4.2 정성적 효과

- 경쟁 전략 고도화
- 데이터 기반 의사결정
- 영업 인력 업무 효율화
- 신규 시장 진출 기회 발굴

---

## 5. 기술 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                  BIDFLOW Enterprise                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js 15 Frontend                      │  │
│  │        (Enterprise Dashboard + Analytics)             │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                           │                                 │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │                   API Gateway                         │  │
│  │              (Rate Limit + Auth)                      │  │
│  └───────┬────────────────┬────────────────────┬────────┘  │
│          ▼                ▼                    ▼           │
│  ┌───────────┐    ┌───────────┐       ┌───────────┐       │
│  │ Gemini    │    │ Claude    │       │ Supabase  │       │
│  │ (Simple)  │    │ (Agent)   │       │ (Data)    │       │
│  └───────────┘    └───────────┘       └───────────┘       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Data Pipeline (Inngest)                     │  │
│  │  - Daily crawl → Analysis → Notification              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. 경쟁 우위

### 6.1 기존 솔루션 대비

| 항목 | 기존 솔루션 | BIDFLOW |
|------|------------|---------|
| 가격 | 월 50-100만원 | 월 10-30만원 |
| 자동화 | 수동 검색 | 완전 자동화 |
| 분석 | 단순 키워드 | 의미 기반 매칭 |
| 제안서 | 템플릿 제공 | 자동 생성 |

### 6.2 기술적 차별점

- 하이브리드 모델 (비용 87% 절감)
- 실시간 경쟁사 분석
- 맥락 기반 매칭
- 지속 학습 시스템

---

## 7. 다음 단계

### 7.1 즉시 착수
- [ ] 나라장터 데이터 수집 파이프라인
- [ ] 경쟁사 모니터링 MVP
- [ ] 하이브리드 모델 통합

### 7.2 AI 바우처 신청
- [ ] 사업계획서 작성
- [ ] 기술 검증 자료
- [ ] 예상 ROI 분석

---

*BIDFLOW 엔터프라이즈 AI 바우처 기획 v1.0*
*2025-12-20*
