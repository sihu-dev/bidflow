# BIDFLOW 피벗 실행 계획서

> **버전**: 1.0.0
> **작성일**: 2025-12-22
> **상태**: 승인 대기
> **분석 기반**: 5개 에이전트 병렬 분석 결과

---

## Executive Summary

### 피벗 방향

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BIDFLOW PIVOT DIRECTION                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   FROM: 일반 입찰 자동화 플랫폼                                          │
│                                                                         │
│   TO:   제조업 수출 SME 특화 Agentic AI 조달 플랫폼                       │
│         (Manufacturing Export SME Agentic Procurement)                  │
│                                                                         │
│   핵심 차별화:                                                           │
│   • 3-Tier Agentic AI (모니터링 → 분석 → 실행)                           │
│   • 정부 지원금 연계 (CAC Zero 모델)                                     │
│   • ROI 보장 (3개월 페이백)                                              │
│   • 글로벌 통합 (나라장터 + TED + SAM.gov)                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 핵심 지표

| 항목 | 현재 | 목표 (6개월) | 목표 (12개월) |
|------|------|-------------|---------------|
| 재사용 가능 코드 | 70% | 90% | 95% |
| 보안 등급 | B+ | A | A+ |
| White-label 지원 | 부분 | 완전 | 완전 |
| 산업 플러그인 | 1개 (유량계) | 5개 | 15개 |
| MAU | 0 | 50 | 500 |

---

## 1. 현황 분석 종합

### 1.1 코드베이스 분석 결과

```
총 파일: 234개 (TS/TSX)
코드량: 1.6MB
컴포넌트: 63개
API 엔드포인트: 22개
외부 API 클라이언트: 7개
```

#### 재사용 가능 모듈 (70-75%)

| 카테고리 | 모듈 | 재사용성 | 비고 |
|----------|------|----------|------|
| **보안** | auth-middleware, rate-limiter, csrf | 100% | 즉시 사용 가능 |
| **검증** | Zod schemas, validation | 100% | 산업 무관 |
| **UI** | Shadcn 컴포넌트 | 95% | White-label 준비됨 |
| **API** | TED, SAM.gov, UNIPASS | 100% | 공공 API |
| **데이터** | Repository 패턴 | 85% | 인터페이스 추상화 필요 |

#### 수정 필요 모듈 (25-30%)

| 모듈 | 현재 상태 | 필요 작업 |
|------|----------|----------|
| enhanced-matcher | 유량계 하드코딩 | 플러그인 인터페이스로 리팩토링 |
| product-scorer | CMNTech 특화 | 일반화된 스코어링 엔진 |
| dashboard | CRUD 미완성 | API 연결 완료 |

### 1.2 보안 감사 결과

**전체 등급: B+ (Good)**

| 심각도 | 개수 | 상세 |
|--------|------|------|
| 🔴 CRITICAL | 0 | - |
| 🟠 HIGH | 2 | Rate Limiting 누락 |
| 🟡 MEDIUM | 4 | CSP, CORS, 로깅 |
| 🟢 LOW | 3 | 헤더 최적화 |

**즉시 수정 필요 (P0)**:
1. `/api/v1/ai/score` - Rate Limiting 추가
2. `/api/v1/contact` - Rate Limiting 추가

### 1.3 UX/UI 감사 결과

**전체 점수: 8.2/10**

| 항목 | 점수 | 비고 |
|------|------|------|
| 디자인 시스템 | 9/10 | Shadcn 기반 일관성 |
| 반응형 | 8/10 | 모바일 최적화 필요 |
| 접근성 | 7/10 | ARIA 라벨 보강 필요 |
| White-label | 8/10 | TenantContext 구현됨 |

**컴포넌트 재사용성**:
- 완전 재사용: 66%
- 부분 수정: 24%
- 재작성 필요: 10%

### 1.4 시장 트렌드 분석

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        2025 핵심 트렌드                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   1. Agentic AI 폭발적 성장                                              │
│      • 2025년 기업 25% 도입 예상 (Gartner)                               │
│      • 복잡한 워크플로우 자동화 수요                                      │
│                                                                         │
│   2. 정부 지원 확대                                                      │
│      • 나라장터 디지털화 1,000억                                          │
│      • 혁신조달 2.5조                                                    │
│      • AI바우처 2억/기업                                                 │
│                                                                         │
│   3. 제조업 디지털 전환 가속                                             │
│      • 수출 SME 70%가 입찰 경험 없음                                     │
│      • 평균 입찰 참여율 12% (전문성 부족)                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 아키텍처 설계

### 2.1 플러그인 기반 산업 확장

```typescript
// src/lib/domain/matchers/types.ts

interface MatcherPlugin {
  // 플러그인 메타데이터
  id: string;
  name: string;
  version: string;
  industry: string;  // 'flowmeter' | 'solar' | 'battery' | ...

  // 핵심 메서드
  extractRequirements(bid: Bid): Promise<Requirement[]>;
  matchProducts(bid: Bid, products: Product[]): Promise<MatchResult[]>;
  calculateScore(match: MatchResult): Promise<number>;  // 0-175

  // 선택적 메서드
  generateProposal?(match: MatchResult): Promise<ProposalDraft>;
  analyzeCompetitor?(bid: Bid): Promise<CompetitorInsight[]>;
}
```

### 2.2 신규 DB 스키마

```sql
-- 산업 테이블
CREATE TABLE industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,  -- 'flowmeter', 'solar', 'battery'
  name VARCHAR(255) NOT NULL,
  name_ko VARCHAR(255),
  parent_id UUID REFERENCES industries(id),
  cpv_codes TEXT[],  -- 연관 CPV 코드
  naics_codes TEXT[],  -- 연관 NAICS 코드
  hs_codes TEXT[],  -- 연관 HS 코드
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 산업별 매칭 설정
CREATE TABLE industry_matchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id UUID REFERENCES industries(id) NOT NULL,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  config JSONB NOT NULL,  -- 매칭 설정
  weights JSONB NOT NULL,  -- 가중치 설정
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(industry_id, tenant_id)
);

-- 제품 카탈로그 확장
ALTER TABLE products ADD COLUMN industry_id UUID REFERENCES industries(id);
ALTER TABLE products ADD COLUMN specifications JSONB;  -- 기술 사양
ALTER TABLE products ADD COLUMN certifications TEXT[];  -- 인증 목록
```

### 2.3 Agentic AI 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     3-Tier Agentic AI System                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   TIER 1: 모니터링 에이전트 (24/7)                                       │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  • 나라장터/TED/SAM.gov 실시간 모니터링                           │  │
│   │  • 키워드 기반 1차 필터링                                         │  │
│   │  • 신규 공고 감지 → 알림                                          │  │
│   │  • 모델: Gemini Flash (저비용)                                    │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
│                              ▼                                          │
│   TIER 2: 분석 에이전트 (온디맨드)                                       │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  • 175점 심층 매칭 분석                                           │  │
│   │  • 경쟁사 패턴 분석                                               │  │
│   │  • 낙찰가 예측                                                    │  │
│   │  • 모델: Claude Sonnet                                            │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                              │                                          │
│                              ▼                                          │
│   TIER 3: 실행 에이전트 (승인 후)                                        │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  • 제안서 초안 자동 생성                                          │  │
│   │  • 가격 전략 추천                                                 │  │
│   │  • 서류 준비 체크리스트                                           │  │
│   │  • 모델: Claude Opus (고품질)                                     │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 실행 로드맵

### Phase 1: 기반 정비 (Week 1-2)

| 작업 | 우선순위 | 담당 | 상태 |
|------|----------|------|------|
| P0 보안 이슈 수정 | 🔴 Critical | Backend | 대기 |
| Dashboard CRUD 완성 | 🔴 Critical | Frontend | 대기 |
| 알림 발송 구현 | 🟠 High | Backend | 대기 |
| TypeScript strict 모드 | 🟡 Medium | All | 대기 |

```
주요 마일스톤:
□ Rate Limiting 전 API 적용 완료
□ Dashboard 생성/수정/삭제 작동
□ 이메일/SMS 알림 발송 가능
```

### Phase 2: 플러그인 아키텍처 (Week 3-4)

| 작업 | 우선순위 | 담당 | 상태 |
|------|----------|------|------|
| MatcherPlugin 인터페이스 정의 | 🔴 Critical | Architect | 대기 |
| industries 테이블 마이그레이션 | 🔴 Critical | DB | 대기 |
| FlowmeterPlugin 구현 | 🟠 High | Backend | 대기 |
| 플러그인 레지스트리 | 🟠 High | Backend | 대기 |

```typescript
// 마일스톤: 플러그인 시스템 작동
const plugin = PluginRegistry.get('flowmeter');
const matches = await plugin.matchProducts(bid, products);
```

### Phase 3: Agentic AI 통합 (Week 5-6)

| 작업 | 우선순위 | 담당 | 상태 |
|------|----------|------|------|
| Tier 1 모니터링 에이전트 | 🔴 Critical | AI | 대기 |
| Tier 2 분석 에이전트 | 🟠 High | AI | 대기 |
| 에이전트 오케스트레이션 | 🟠 High | Backend | 대기 |
| 비용 모니터링 대시보드 | 🟡 Medium | Frontend | 대기 |

```
주요 마일스톤:
□ 자동 공고 수집 24/7 작동
□ 175점 매칭 자동 분석
□ 토큰 사용량 실시간 모니터링
```

### Phase 4: White-label & 다중 산업 (Week 7-8)

| 작업 | 우선순위 | 담당 | 상태 |
|------|----------|------|------|
| 테넌트 온보딩 플로우 | 🔴 Critical | Full-stack | 대기 |
| 브랜딩 커스터마이징 UI | 🟠 High | Frontend | 대기 |
| SolarPlugin 구현 | 🟡 Medium | Backend | 대기 |
| BatteryPlugin 구현 | 🟡 Medium | Backend | 대기 |

### Phase 5: 정부 지원 & GTM (Week 9-12)

| 작업 | 우선순위 | 담당 | 상태 |
|------|----------|------|------|
| AI바우처 공급기업 등록 | 🔴 Critical | Biz | 대기 |
| 조달청 혁신제품 신청 | 🟠 High | Biz | 대기 |
| 파일럿 고객 3곳 확보 | 🟠 High | Sales | 대기 |
| KOTRA 수출바우처 등록 | 🟡 Medium | Biz | 대기 |

---

## 4. 보안 개선 계획

### 4.1 P0 수정 (즉시)

#### `/api/v1/ai/score` Rate Limiting

```typescript
// src/app/api/v1/ai/score/route.ts

import { rateLimit } from '@/lib/security/rate-limiter';

const aiScoreLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1분
  max: 10,  // 분당 10회
  keyPrefix: 'ai-score',
});

export async function POST(request: NextRequest) {
  const rateLimitResult = await aiScoreLimiter(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitResult.headers }
    );
  }
  // ... 기존 로직
}
```

#### `/api/v1/contact` Rate Limiting

```typescript
// src/app/api/v1/contact/route.ts

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1시간
  max: 5,  // 시간당 5회 (스팸 방지)
  keyPrefix: 'contact',
});
```

### 4.2 MEDIUM 수정 (1주 내)

| 이슈 | 해결책 |
|------|--------|
| CSP 헤더 | next.config.js에 Content-Security-Policy 추가 |
| CORS 정책 | 허용 도메인 화이트리스트로 제한 |
| 에러 로깅 | Sentry 연동 + 민감 정보 마스킹 |
| API 버저닝 | /api/v1 → /api/v2 마이그레이션 계획 |

---

## 5. 정부 지원 활용 전략

### 5.1 AI 바우처 (NIPA)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI 바우처 활용 계획                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   지원금: 최대 2억원 (수요기업당)                                         │
│   구조: 수요기업 ←→ BIDFLOW (공급기업) ←→ AI 모델                        │
│                                                                         │
│   수요기업 타겟:                                                         │
│   • 제조업 수출 SME (연매출 10-500억)                                    │
│   • 해외 입찰 경험 있으나 성과 미흡                                       │
│   • 디지털 전환 의지 있는 기업                                           │
│                                                                         │
│   제공 서비스:                                                           │
│   • Agentic AI 입찰 자동화 시스템 구축                                   │
│   • 175점 매칭 엔진 커스터마이징                                         │
│   • 6개월 운영 지원                                                      │
│                                                                         │
│   예상 효과:                                                             │
│   • 고객 획득 비용 (CAC): 0원                                            │
│   • 고객 LTV: 연 1,200만원 (월 100만원 × 12개월)                         │
│   • 연간 타겟: 10개 기업 = 1.2억 ARR                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 수출 바우처 (KOTRA)

| 항목 | 내용 |
|------|------|
| 지원금 | 최대 1.2억원 |
| 활용 | 해외 입찰 컨설팅 서비스로 등록 |
| 타겟 | 해외 시장 진출 희망 제조업체 |

### 5.3 조달청 혁신제품

| 항목 | 내용 |
|------|------|
| 지정 효과 | 공공기관 수의계약 가능 |
| 신청 조건 | 신기술 인증 또는 특허 보유 |
| 활용 | 공공기관 대상 B2G 영업 |

---

## 6. 재무 계획

### 6.1 비용 구조

| 항목 | 월간 | 연간 | 비고 |
|------|------|------|------|
| 인프라 | 50만원 | 600만원 | Vercel + Supabase + Upstash |
| AI 모델 | 100만원 | 1,200만원 | Claude + Gemini |
| 외부 API | 20만원 | 240만원 | TED, DeepL 등 |
| **총 운영비** | **170만원** | **2,040만원** | |

### 6.2 수익 모델

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BIDFLOW 수익 모델                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   [Tier 1] Starter: 월 30만원                                           │
│   • 공고 모니터링 100건/월                                               │
│   • 기본 매칭 분석                                                       │
│   • 이메일 알림                                                          │
│                                                                         │
│   [Tier 2] Pro: 월 100만원                                              │
│   • 공고 모니터링 무제한                                                  │
│   • 175점 심층 매칭                                                      │
│   • 경쟁사 분석                                                          │
│   • 카카오 알림                                                          │
│                                                                         │
│   [Tier 3] Enterprise: 월 300만원                                       │
│   • Pro 전체 기능                                                        │
│   • 제안서 자동 생성                                                     │
│   • 전담 컨설턴트                                                        │
│   • White-label 지원                                                    │
│                                                                         │
│   [Add-on] AI 바우처 연계: 건당 500만원                                  │
│   • 정부 지원금으로 결제                                                  │
│   • 고객 실부담 0원                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 매출 시뮬레이션

| 시점 | 고객 수 | 월 매출 | 연 매출 | 비고 |
|------|---------|---------|---------|------|
| Month 3 | 3 | 300만 | - | 파일럿 |
| Month 6 | 10 | 1,000만 | - | PMF 검증 |
| Year 1 | 30 | 3,000만 | 3.6억 | 정식 런칭 |
| Year 2 | 100 | 1억 | 12억 | 스케일업 |

### 6.4 손익분기점

```
월간 고정비: 170만원
평균 고객 단가: 100만원/월
손익분기: 2명 고객

→ Month 3에 BEP 달성 가능
```

---

## 7. 리스크 관리

### 7.1 기술 리스크

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| AI 모델 비용 폭증 | 중 | 높음 | Gemini Flash 우선 사용, 캐싱 |
| API 변경 | 낮음 | 중간 | 어댑터 패턴, 버저닝 |
| 서비스 장애 | 낮음 | 높음 | 다중 리전, 헬스체크 |

### 7.2 사업 리스크

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| 정부 지원 미선정 | 중 | 중간 | 다중 채널 신청 |
| 경쟁사 진입 | 중 | 중간 | 빠른 실행, 네트워크 효과 |
| 고객 이탈 | 낮음 | 높음 | ROI 보장, 성공 사례 공유 |

---

## 8. 성공 지표 (KPI)

### 8.1 제품 지표

| 지표 | 현재 | 3개월 | 6개월 | 12개월 |
|------|------|-------|-------|--------|
| 코드 커버리지 | 0% | 40% | 70% | 80% |
| 빌드 성공률 | 95% | 99% | 99.5% | 99.9% |
| API 응답시간 | - | <500ms | <300ms | <200ms |
| 업타임 | - | 99% | 99.5% | 99.9% |

### 8.2 비즈니스 지표

| 지표 | 3개월 | 6개월 | 12개월 |
|------|-------|-------|--------|
| 파일럿 고객 | 3 | 10 | 30 |
| MRR | 300만 | 1,000만 | 3,000만 |
| NPS | 30+ | 50+ | 60+ |
| Churn Rate | <10% | <5% | <3% |

### 8.3 AI 지표

| 지표 | 기준 | 목표 |
|------|------|------|
| 매칭 정확도 | - | 85%+ |
| 분석 시간 | - | <30초/건 |
| 토큰 효율 | - | <$0.5/분석 |

---

## 9. 즉시 실행 항목 (This Week)

### Day 1-2: 보안 수정

```bash
# P0 보안 이슈 수정
1. /api/v1/ai/score Rate Limiting 추가
2. /api/v1/contact Rate Limiting 추가
3. CORS 정책 강화
4. CSP 헤더 추가
```

### Day 3-4: Dashboard 완성

```bash
# CRUD 완료
1. 입찰 수정 API 연결
2. 입찰 삭제 API 연결
3. 새로고침 기능 완성
4. 에러 핸들링 개선
```

### Day 5: 플러그인 설계

```bash
# MatcherPlugin 인터페이스
1. 타입 정의
2. FlowmeterPlugin 골격
3. 플러그인 레지스트리
```

---

## 10. 결론

### 핵심 메시지

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   BIDFLOW는 70-75%의 코드 재사용성을 바탕으로                            │
│   8-12주 내에 제조업 수출 SME 특화 Agentic AI 플랫폼으로 피벗 가능        │
│                                                                         │
│   핵심 성공 요인:                                                        │
│   1. 플러그인 기반 산업 확장 아키텍처                                    │
│   2. 3-Tier Agentic AI로 차별화                                         │
│   3. 정부 지원금 연계 CAC Zero 모델                                      │
│   4. 175점 매칭 시스템의 정밀도                                          │
│                                                                         │
│   첫 3개월 목표:                                                         │
│   • 파일럿 고객 3곳 확보                                                 │
│   • AI 바우처 공급기업 등록                                              │
│   • MRR 300만원 달성                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 승인 요청

- [ ] 피벗 방향 승인
- [ ] 예산 배정
- [ ] 일정 확정
- [ ] 팀 구성

---

*BIDFLOW Pivot Execution Plan v1.0*
*Generated: 2025-12-22*
*Based on: 5-Agent Parallel Analysis*
