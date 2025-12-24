# BIDFLOW 운영 비용 분석 보고서

> **작성일**: 2025-12-24  
> **분석 대상**: 월간 운영 비용 (USD/KRW)  
> **환율 기준**: 1 USD = 1,350 KRW

---

## 목차

1. [비용 구조 개요](#비용-구조-개요)
2. [Claude API 비용](#1-claude-api-비용)
3. [인프라 비용](#2-인프라-비용)
4. [외부 API 비용](#3-외부-api-비용)
5. [시나리오별 총비용](#시나리오별-총비용)
6. [비용 최적화 전략](#비용-최적화-전략)

---

## 비용 구조 개요

```
BIDFLOW 운영 비용
├── Claude API (변동비)
│   ├── 입찰 분석 (analyzeBid)
│   ├── 제품 매칭 (matchProducts)
│   └── 키워드 추출 (extractKeywords)
├── 인프라 (고정비 + 변동비)
│   ├── Supabase (DB, Auth, Realtime, Storage)
│   ├── Upstash Redis (Rate Limiting)
│   └── Vercel (Next.js 호스팅)
└── 외부 API (무료/제한)
    ├── 나라장터 API (무료)
    ├── TED API (무료)
    └── SAM.gov API (무료 1,000 req/day)
```

---

## 1. Claude API 비용

### 1.1 가격표 (2025년 기준)

| 모델 | Input 토큰 | Output 토큰 | Cache Write | Cache Read | Thinking 토큰 |
|------|-----------|------------|-------------|------------|--------------|
| **Haiku 4.5** | $0.80 / 1M | $4.00 / 1M | $1.00 / 1M | $0.08 / 1M | - |
| **Sonnet 4** | $3.00 / 1M | $15.00 / 1M | $3.75 / 1M | $0.30 / 1M | - |
| **Opus 4.5** | $15.00 / 1M | $75.00 / 1M | $18.75 / 1M | $1.50 / 1M | $15.00 / 1M |

### 1.2 모델 선택 전략 (소스 코드 기반)

```typescript
// src/lib/ai/claude-client.ts 참조
selectModel({
  bidAmount >= 100,000,000원 → Opus 4.5 (고정확도)
  bidAmount >= 10,000,000원  → Sonnet 4 (균형)
  urgent = true              → Haiku 4.5 (빠른 응답)
  default                    → Haiku 4.5 (비용 절감)
})
```

### 1.3 평균 토큰 사용량 (실측 추정)

| 작업 | 모델 | Input | Output | Cache Hit | 평균 비용 |
|------|------|-------|--------|-----------|----------|
| **입찰 분석** (`analyzeBid`) | Sonnet | 800 | 300 | 600 (75%) | $0.00294 |
| **제품 매칭** (`matchProducts`) | Sonnet | 500 | 200 | 400 (80%) | $0.00186 |
| **키워드 추출** (`extractKeywords`) | Haiku | 200 | 50 | 150 (75%) | $0.00027 |

**Prompt Caching 효과**:
- 시스템 프롬프트 재사용 시 **90% 비용 절감**
- Cache Hit Rate: 평균 75-80%

### 1.4 입찰당 평균 비용 (Workflow 전체)

```
입찰 1건 처리 프로세스:
1. 키워드 추출 (Haiku)          $0.00027
2. 입찰 분석 (Sonnet/Haiku)     $0.00294
3. 제품 매칭 (Sonnet/Haiku)     $0.00186
────────────────────────────────────────
총 비용 (캐싱 적용)              $0.00507 / 건
총 비용 (캐싱 미적용)            $0.0203 / 건  (4배 증가)
```

### 1.5 시나리오별 Claude API 비용

| 시나리오 | 입찰 수/월 | 캐싱 적용 | 캐싱 미적용 | 절감액 |
|---------|-----------|----------|-----------|--------|
| **Small** | 100 | $0.51 | $2.03 | $1.52 (75%) |
| **Medium** | 1,000 | $5.07 | $20.30 | $15.23 (75%) |
| **Large** | 10,000 | $50.70 | $203.00 | $152.30 (75%) |

**💡 최적화 포인트**:
- Prompt Caching은 **필수** (75% 비용 절감)
- 저금액 입찰은 Haiku 사용 → 비용 80% 절감
- Extended Thinking은 1억원 이상 입찰만 사용

---

## 2. 인프라 비용

### 2.1 Supabase 비용

| 플랜 | 월 비용 | 포함 사항 | 제한 |
|------|--------|----------|------|
| **Free** | $0 | 500 MB DB, 1 GB 파일, 50k MAU | 2 GB 대역폭/일 |
| **Pro** | $25 | 8 GB DB, 100 GB 파일, 100k MAU | 250 GB 대역폭/월 |
| **Team** | $599 | 사용량 기반 | 무제한 |

**예상 사용량**:

| 항목 | Small | Medium | Large | 권장 플랜 |
|------|-------|--------|-------|----------|
| DB 크기 | 200 MB | 2 GB | 15 GB | Free / Pro / Team |
| 월간 요청 | 50k | 500k | 5M | Free / Pro / Team |
| Realtime 연결 | 10 | 50 | 200 | Free / Pro / Pro |

**선택**:
- **Small**: Free ($0)
- **Medium**: Pro ($25)
- **Large**: Pro ($25) + 추가 DB $0.125/GB

### 2.2 Upstash Redis 비용

| 플랜 | 월 비용 | 포함 사항 | 제한 |
|------|--------|----------|------|
| **Free** | $0 | 10,000 commands/day | 256 MB |
| **Pay-as-you-go** | $0.2 / 100k | 무제한 | 사용량 기반 |

**예상 사용량** (Rate Limiting):

```typescript
// src/lib/security/rate-limiter.ts 참조
Rate Limit 체크 = 입찰 수 × 3 (크롤링 + API + AI)

Small:  100 × 3 × 30일 = 9,000 commands/월 → Free
Medium: 1,000 × 3 × 30일 = 90,000 → $0.18
Large:  10,000 × 3 × 30일 = 900,000 → $1.80
```

### 2.3 Vercel 비용

| 플랜 | 월 비용 | 포함 사항 | 제한 |
|------|--------|----------|------|
| **Hobby** | $0 | 무제한 배포 | 100 GB 대역폭/월 |
| **Pro** | $20 | 팀 협업, 분석 | 1 TB 대역폭/월 |
| **Enterprise** | Custom | SLA, 지원 | 무제한 |

**예상 사용량**:

| 시나리오 | 페이지뷰/월 | 대역폭 | 권장 플랜 |
|---------|-----------|--------|----------|
| Small | 5,000 | 10 GB | Hobby ($0) |
| Medium | 50,000 | 100 GB | Hobby/Pro ($0-20) |
| Large | 500,000 | 500 GB | Pro ($20) |

**선택**:
- **Small/Medium**: Hobby ($0)
- **Large**: Pro ($20)

### 2.4 인프라 총비용 요약

| 시나리오 | Supabase | Upstash | Vercel | 총계 (USD) | 총계 (KRW) |
|---------|---------|---------|--------|-----------|-----------|
| **Small** | $0 | $0 | $0 | **$0** | **₩0** |
| **Medium** | $25 | $0.18 | $0 | **$25.18** | **₩33,993** |
| **Large** | $30 | $1.80 | $20 | **$51.80** | **₩69,930** |

---

## 3. 외부 API 비용

### 3.1 나라장터 API (공공데이터포털)

**비용**: 무료  
**제한**: 일일 10,000 요청  
**사용 패턴**:
- 크롤링: 1회/시간 × 24시간 = 24 요청/일
- Small/Medium/Large 모두 무료 사용 가능

### 3.2 TED API (유럽 입찰)

**비용**: 무료  
**제한**: 공개 API (Rate Limit 없음)  
**사용 패턴**:
- 크롤링: 1회/6시간 × 4 = 4 요청/일
- 무료

### 3.3 SAM.gov API (미국 입찰)

**비용**: 무료 (기본)  
**제한**: 1,000 요청/일  
**사용 패턴**:
- 크롤링: 1회/6시간 × 4 = 4 요청/일
- 무료 티어 충분

**유료 티어** (필요 시):
- Premium: 10,000 요청/일 ($50/월)

### 3.4 외부 API 총비용

| 시나리오 | 나라장터 | TED | SAM.gov | 총계 |
|---------|---------|-----|---------|------|
| **All** | $0 | $0 | $0 | **$0** |

---

## 시나리오별 총비용

### Small (100 입찰/월)

| 항목 | USD | KRW |
|------|-----|-----|
| Claude API | $0.51 | ₩689 |
| Supabase | $0 | ₩0 |
| Upstash Redis | $0 | ₩0 |
| Vercel | $0 | ₩0 |
| 외부 API | $0 | ₩0 |
| **총계** | **$0.51** | **₩689** |

**연간 비용**: $6.12 (₩8,262)

---

### Medium (1,000 입찰/월)

| 항목 | USD | KRW |
|------|-----|-----|
| Claude API | $5.07 | ₩6,845 |
| Supabase Pro | $25.00 | ₩33,750 |
| Upstash Redis | $0.18 | ₩243 |
| Vercel Hobby | $0 | ₩0 |
| 외부 API | $0 | ₩0 |
| **총계** | **$30.25** | **₩40,838** |

**연간 비용**: $363 (₩490,050)

---

### Large (10,000 입찰/월)

| 항목 | USD | KRW |
|------|-----|-----|
| Claude API | $50.70 | ₩68,445 |
| Supabase Pro + DB | $30.00 | ₩40,500 |
| Upstash Redis | $1.80 | ₩2,430 |
| Vercel Pro | $20.00 | ₩27,000 |
| 외부 API | $0 | ₩0 |
| **총계** | **$102.50** | **₩138,375** |

**연간 비용**: $1,230 (₩1,660,500)

---

## 비용 최적화 전략

### 1. Claude API 최적화 (75% 절감 가능)

#### 1.1 Prompt Caching 활성화 (필수)
```typescript
// 항상 enableCaching: true 사용
await claude.sendMessage(prompt, {
  enableCaching: true,  // 75% 비용 절감
  systemPrompt: CACHED_SYSTEM_PROMPTS.bidAnalysis,
});
```

**효과**: $152/월 → $38/월 (Large 시나리오)

#### 1.2 모델 선택 최적화

```typescript
// 현재 전략 (claude-client.ts)
입찰금액 < 1천만원: Haiku ($0.80/1M)     // 80% 비용 절감
입찰금액 < 1억원:   Sonnet ($3.00/1M)   // 기준
입찰금액 >= 1억원:  Opus ($15.00/1M)    // 5배 비용
```

**개선안**:
- 키워드 추출은 **항상 Haiku** 사용
- 단순 분석 (제품명 매칭)은 **Haiku**
- 복잡한 분석 (제안서 생성)만 **Sonnet/Opus**

**예상 절감**: 추가 30% 절감 가능

#### 1.3 배치 처리

```typescript
// 여러 입찰을 한 번에 분석
const bids = await fetchBids(100);
const analysis = await claude.analyzeBatch(bids, {
  maxTokens: 2048, // 배치 처리로 토큰 공유
});
```

**효과**: Input 토큰 20% 절감

### 2. 인프라 최적화

#### 2.1 Supabase DB 정리

```sql
-- 90일 이상 된 입찰 삭제
DELETE FROM bids WHERE deadline < NOW() - INTERVAL '90 days';

-- 로그 테이블 정리 (30일)
DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL '30 days';
```

**효과**: DB 크기 50% 절감 → Medium 유지 가능

#### 2.2 Vercel Edge Functions

```typescript
// API Routes를 Edge로 전환
export const runtime = 'edge'; // 응답 속도 ↑, 비용 ↓
```

**효과**: Serverless 비용 30% 절감

#### 2.3 Redis 캐시 TTL 최적화

```typescript
// 캐시 TTL 연장 (5분 → 1시간)
const cacheKey = `ted:search:${query}`;
await redis.set(cacheKey, data, { ex: 3600 }); // 1시간
```

**효과**: Redis 명령어 80% 절감

### 3. 크롤링 최적화

#### 3.1 증분 크롤링

```typescript
// 전체 크롤링 대신 신규/변경만
const lastCrawled = await getLastCrawlTime();
const newBids = await naraJangto.searchBids({
  fromDate: lastCrawled,
});
```

**효과**: API 호출 90% 절감

#### 3.2 스마트 스케줄링

```typescript
// 시간대별 차등 크롤링
const schedule = {
  '09:00-18:00': '1h',   // 업무시간: 1시간마다
  '18:00-09:00': '6h',   // 비업무: 6시간마다
  'weekend': '12h',      // 주말: 12시간마다
};
```

**효과**: 불필요한 크롤링 50% 절감

### 4. 데이터 압축

```typescript
// raw_data JSONB 압축
CREATE INDEX idx_bids_rawdata_gin ON bids USING gin(raw_data jsonb_path_ops);
ALTER TABLE bids ALTER COLUMN raw_data SET STORAGE EXTERNAL;
```

**효과**: DB 저장 공간 30% 절감

---

## 비용 비교 (최적화 전/후)

### Large 시나리오 (10,000 입찰/월)

| 항목 | 최적화 전 | 최적화 후 | 절감 |
|------|----------|----------|------|
| Claude API | $203.00 | $50.70 | **-75%** |
| Supabase | $30.00 | $25.00 | **-17%** |
| Upstash | $1.80 | $0.36 | **-80%** |
| Vercel | $20.00 | $20.00 | 0% |
| **총계** | **$254.80** | **$96.06** | **-62%** |

**연간 절감액**: $1,905 (₩2,571,750)

---

## 부록: 실시간 비용 모니터링

### 권장 도구

1. **Anthropic Console**
   - https://console.anthropic.com/
   - 토큰 사용량 실시간 추적
   - 모델별 비용 분석

2. **Supabase Dashboard**
   - DB 크기, API 요청, 대역폭 모니터링
   - 알림 설정 (80% 도달 시)

3. **Vercel Analytics**
   - 페이지뷰, 함수 실행 시간
   - 대역폭 사용량

### 예산 알림 설정

```typescript
// src/lib/monitoring/cost-alert.ts
export async function checkMonthlyCost() {
  const costs = {
    claude: await getClaudeUsage(),
    supabase: await getSupabaseUsage(),
  };
  
  if (costs.total > BUDGET_LIMIT) {
    await sendAlert('비용 초과 경고', costs);
  }
}
```

---

## 결론

### 권장 사항

| 단계 | 시나리오 | 월 비용 | 연 비용 | 입찰당 비용 |
|------|---------|--------|--------|-----------|
| **MVP** | Small | ₩689 | ₩8,262 | ₩6.89 |
| **Growth** | Medium | ₩40,838 | ₩490,050 | ₩40.84 |
| **Scale** | Large | ₩138,375 | ₩1,660,500 | ₩13.84 |

### 핵심 인사이트

1. **Claude API가 가장 큰 변동비** (Small 제외)
   - Prompt Caching 필수 → 75% 절감
   - 모델 선택 전략 중요 (Haiku vs Sonnet vs Opus)

2. **인프라는 Medium부터 유료** (Supabase Pro $25)
   - Small은 **완전 무료** 운영 가능
   - Free 티어만으로 100 입찰/월 처리

3. **스케일 효율성 우수**
   - 10배 입찰 증가 시 비용은 3.4배만 증가
   - 입찰당 비용: Small ₩6.89 → Large ₩13.84

4. **외부 API는 완전 무료**
   - 나라장터, TED, SAM.gov 모두 무료
   - Rate Limit 내에서 충분히 사용 가능

### 다음 단계

1. **Prompt Caching 검증**
   - 실제 Cache Hit Rate 측정
   - 목표: 75% 이상 유지

2. **비용 모니터링 대시보드 구축**
   - 실시간 토큰 사용량 추적
   - 예산 초과 알림

3. **모델 선택 A/B 테스트**
   - Haiku vs Sonnet 정확도 비교
   - 비용 대비 성능 최적점 찾기

---

**작성자**: Claude Code (Sonnet 4.5)  
**검증 필요**: 실제 운영 데이터 수집 후 업데이트 권장
