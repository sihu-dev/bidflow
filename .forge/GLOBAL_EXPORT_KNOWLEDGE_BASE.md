# BIDFLOW 글로벌 수출/해외 입찰 지식베이스

> **목적**: 제조업 기반 글로벌 수출 및 해외 입찰 분석 자료 종합
> **생성일**: 2025-12-22
> **버전**: 1.0

---

## 1. 시장 분석 요약

### 1.1 글로벌 조달 시장 규모

| 시장 | 연간 규모 | 공고 수 | 주요 특징 |
|------|----------|---------|----------|
| **TED (EU)** | €815B | 800K/년 | CPV 코드 기반, 공개 API |
| **SAM.gov (US)** | $700B+ | 100K+/년 | NAICS 코드, API 제공 |
| **UNGM (UN)** | $14B | 10K+/년 | 크롤링 필요 |
| **World Bank** | $1.6B | 5K+/년 | 제한적 API |
| **ADB (아시아개발)** | $10B+ | 3K+/년 | 크롤링 필요 |

### 1.2 한국 제조업 수출 현황

```yaml
수자원/환경 산업:
  - 수도산업 수출: 연간 2조원+
  - 주요 시장: 중동, 동남아, 중앙아시아
  - 성장률: 연평균 8-12%

유량계/계측기 시장:
  - 글로벌 시장: $8.5B (2024)
  - 연평균 성장률: 6.2%
  - 한국 점유율: ~3%
```

### 1.3 산업별 MVP Pain Point 분석 (90점/100점 기준)

| 순위 | 산업 | 점수 | 핵심 Pain Point |
|------|------|------|----------------|
| 1 | **수처리/환경** | 90 | 해외 입찰 정보 부족, 제안서 영문화 |
| 2 | **펌프/밸브** | 85 | 경쟁사 동향 파악 어려움 |
| 3 | **플랜트 장비** | 82 | 대형 프로젝트 진입 장벽 |
| 4 | **전기/전자** | 78 | 규격 인증 복잡성 |
| 5 | **금속/기계** | 75 | 가격 경쟁 치열 |

---

## 2. API 연동 현황

### 2.1 구현 완료 (7개)

| API | 용도 | 파일 | 상태 |
|-----|------|------|------|
| **TED API** | EU 조달 공고 검색 | `ted-api.ts` | ✅ 완료 |
| **SAM.gov API** | US 연방 조달 | `sam-gov-api.ts` | ✅ 완료 |
| **UNIPASS API** | HS 코드/관세율 | `unipass-api.ts` | ✅ 완료 |
| **수출입은행 환율** | 환율 변환 | `exchange-rate-api.ts` | ✅ 완료 |
| **DeepL API** | 입찰 문서 번역 | `deepl-api.ts` | ✅ 완료 |
| **국세청 API** | 사업자 검증 | `nts-api.ts` | ✅ 완료 |
| **REST Countries** | 국가 정보 | `countries-api.ts` | ✅ 완료 |

### 2.2 주요 API 기능

```typescript
// 통합 검색
import { searchAllBids, translateBidToKorean, convertBidAmountToKRW } from '@/lib/clients';

// EU + US 동시 검색
const results = await searchAllBids({
  keywords: ['flow meter', 'water meter'],
  cpvCodes: ['38410000', '38421000'],
  countries: ['DE', 'FR', 'US'],
});

// 입찰 번역 (영어 → 한국어)
const translated = await translateBidToKorean(title, description);

// 환율 변환 (EUR/USD → KRW)
const amountKRW = await convertBidAmountToKRW(50000, 'EUR');
```

### 2.3 필요 환경변수

```env
# 필수
SAM_GOV_API_KEY=xxx
KOREAEXIM_API_KEY=xxx
DEEPL_API_KEY=xxx

# 선택 (data.go.kr 통합)
DATA_GO_KR_API_KEY=xxx
UNIPASS_API_KEY=xxx

# 공개 API (키 불필요)
# TED API, REST Countries
```

---

## 3. 코드 분류 체계

### 3.1 CPV 코드 (EU)

```typescript
// 유량계/계량기 관련 CPV 코드
const FLOWMETER_CPV = {
  '38410000': '계량기',
  '38411000': '수도계량기',
  '38421000': '유량측정장비',
  '38421100': '물 계량기',
  '38421110': '유량계',
  '38423000': '계량장치',
  '38550000': '미터',
  '38551000': '에너지 미터',
};
```

### 3.2 NAICS 코드 (US)

```typescript
// 유량계/계량기 관련 NAICS 코드
const FLOWMETER_NAICS = {
  '334514': '전체 유량 측정 장비',
  '334516': '분석 실험실 장비',
  '334519': '기타 측정/제어 장비',
  '334513': '산업 프로세스 제어 장비',
};
```

### 3.3 HS 코드 (관세)

```typescript
// 유량계 관련 HS 코드
const FLOWMETER_HS = {
  '9026.10': '액체 유량/유면 측정기기',
  '9026.20': '압력 측정기기',
  '9028.10': '가스미터',
  '9028.20': '액체미터',
  '9028.30': '전기미터',
  '9032.89': '자동 조절/제어기기',
};
```

### 3.4 코드 상호 매핑

```typescript
// HS → CPV 변환
export function hsCodeToCPV(hsCode: string): string[] {
  const mappings = {
    '9026.10': ['38421100', '38421110'],
    '9026.20': ['38424000'],
    '9028.10': ['38551000'],
    '9028.20': ['38411000', '38421000'],
  };
  return mappings[hsCode.substring(0, 7)] || [];
}

// HS → NAICS 변환
export function hsCodeToNAICS(hsCode: string): string[] {
  const mappings = {
    '9026': ['334514', '334519'],
    '9028': ['334514', '334516'],
    '9032': ['334513', '334519'],
  };
  return mappings[hsCode.substring(0, 4)] || [];
}
```

---

## 4. 정부 지원 프로그램

### 4.1 AI/SW 바우처

| 프로그램 | 지원금 | 지원비율 | 주관 |
|----------|--------|----------|------|
| **AI 바우처** | 최대 3억원 | 70% | NIPA |
| **수출 바우처** | 최대 1.2억원 | 70% | 중기부/KOTRA |
| **클라우드 바우처** | 최대 8천만원 | 70% | NIPA |
| **해외조달 종합지원** | 최대 3천만원 | 100% | 조달청 |

### 4.2 Triple Voucher Stack 전략

```yaml
Year 1 (2025):
  - AI 바우처: ₩1억 (BIDFLOW AI 고도화)
  - 수출 바우처: ₩6천만 (해외 마케팅)
  합계: ₩1.6억

Year 2 (2026):
  - 클라우드 바우처: ₩5천만 (인프라)
  - 해외조달 지원: ₩3천만 (TED/SAM 진출)
  합계: ₩8천만

고객사 혜택:
  - 정가: ₩2,400만/년
  - 정부지원 후: ₩480만/년 (80% 할인)
```

---

## 5. 제품 카탈로그 (CMNTech 예시)

### 5.1 핵심 제품 5종

| 제품 | 유형 | 스펙 | 주요 시장 |
|------|------|------|----------|
| **UR-1000PLUS** | 다회선 초음파 | DN100-4000, ±0.5% | 대구경 상수도 |
| **MF-1000C** | 일체형 전자 | DN15-2000, 상거래용 | 일반 배관 |
| **UR-1010PLUS** | 비만관형 | DN200-3000, 하수 | 하수/슬러지 |
| **SL-3000PLUS** | 개수로 | 하천/수로 | 환경부/농림부 |
| **EnerRay** | 초음파 열량계 | DN15-300, EN 1434 | 지역난방 |

### 5.2 입찰 키워드 매핑

```typescript
const PRODUCT_KEYWORDS = {
  'UR-1000PLUS': ['초음파유량계', '다회선', '만관', '상수도', 'ultrasonic'],
  'MF-1000C': ['전자유량계', '전자식', '상거래', 'electromagnetic'],
  'UR-1010PLUS': ['비만관', '하수', '우수', 'non-full pipe'],
  'SL-3000PLUS': ['개수로', '하천', '방류', 'open channel'],
  'EnerRay': ['열량계', '에너지', '난방', 'heat meter'],
};
```

---

## 6. 175점 매칭 시스템

### 6.1 점수 구성

| 카테고리 | 배점 | 세부 항목 |
|----------|------|----------|
| **제품 매칭** | 50점 | 키워드(20) + 스펙(20) + 인증(10) |
| **기관 적합성** | 50점 | 유형(20) + 이력(15) + 선호도(15) |
| **가격 경쟁력** | 35점 | 예산범위(15) + 과거낙찰(10) + 마진(10) |
| **일정 가능성** | 20점 | 납기(10) + 준비기간(10) |
| **지역 접근성** | 20점 | 물류(10) + A/S(10) |

### 6.2 매칭 알고리즘

```typescript
interface MatchScore {
  total: number;        // 0-175
  product: number;      // 0-50
  organization: number; // 0-50
  price: number;        // 0-35
  schedule: number;     // 0-20
  location: number;     // 0-20
  recommendation: 'strong' | 'medium' | 'weak';
}

function calculateMatchScore(bid: Bid, product: Product): MatchScore {
  const product = matchProduct(bid, product);      // 0-50
  const org = matchOrganization(bid);              // 0-50
  const price = matchPrice(bid, product);          // 0-35
  const schedule = matchSchedule(bid);             // 0-20
  const location = matchLocation(bid, product);    // 0-20

  const total = product + org + price + schedule + location;

  return {
    total,
    product, organization: org, price, schedule, location,
    recommendation: total >= 140 ? 'strong' : total >= 100 ? 'medium' : 'weak',
  };
}
```

---

## 7. 데이터 수집 파이프라인

### 7.1 소스별 수집 주기

| 소스 | 방식 | 주기 | 월 예상 건수 |
|------|------|------|-------------|
| **나라장터** | REST API | 2시간 | 15,000건 |
| **한전/수공** | REST API | 4시간 | 1,500건 |
| **TED (EU)** | REST API | 일 1회 | 75,000건 |
| **SAM.gov** | REST API | 일 1회 | 8,000건 |
| **KOTRA** | REST API | 일 1회 | 5,000건 |

### 7.2 필터링 후 예상

```yaml
전체 수집: ~105,000건/월
키워드 필터링 후: ~5,000-8,000건/월 (제조업 관련)
매칭 점수 100+ : ~500-1,000건/월 (적합 공고)
```

---

## 8. 경쟁사 분석 인프라

### 8.1 모니터링 대상

```typescript
const COMPETITORS = {
  global: ['E+H (Endress+Hauser)', 'Siemens', 'ABB', 'Krohne', 'Emerson'],
  korea: ['태광산전', '대동게이지', 'KOMETER'],
  china: ['Kaifeng Instrument', 'Dalian Sonic'],
};
```

### 8.2 수집 데이터

- 낙찰 이력 (나라장터 공개)
- 가격 패턴 (평균 낙찰률)
- 선호 분야/기관
- 최근 동향 알림

---

## 9. 제안서 자동 생성

### 9.1 생성 섹션

| 섹션 | 자동화율 | AI 모델 |
|------|----------|---------|
| 업체 소개 | 100% | 템플릿 |
| 제품 사양 | 90% | 매칭 엔진 |
| 납품 실적 | 80% | DB 조회 |
| 가격 제안 | 50% | 검토 필요 |
| A/S 조건 | 100% | 표준 조건 |

### 9.2 시간 절감

| 단계 | Before | After | 절감 |
|------|--------|-------|------|
| 검색 | 3시간/일 | 35분 | 83% |
| 제안서 | 3시간/건 | 45분 | 75% |
| 경쟁 분석 | 수동/가끔 | 자동/상시 | - |

---

## 10. FTA 국가 목록

### 10.1 한국 FTA 체결국 (55개국)

```typescript
const FTA_COUNTRIES = {
  asia: ['SG', 'IN', 'MY', 'VN', 'ID', 'TH', 'PH', 'BN', 'KH', 'LA', 'MM', 'CN'],
  europe: [...EU_27, 'GB', 'TR', 'NO', 'IS', 'LI', 'CH'],
  americas: ['US', 'CA', 'MX', 'CL', 'PE', 'CO', 'PA', 'HN', 'SV', 'CR', 'NI'],
  oceania: ['AU', 'NZ'],
};
```

### 10.2 관세 혜택

| 지역 | 기본 관세 | FTA 후 | 혜택 |
|------|----------|--------|------|
| EU | 4-6% | 0% | 완전 면제 |
| US | 2-4% | 0% | 완전 면제 |
| ASEAN | 5-10% | 0-3% | 대폭 감면 |

---

## 11. 주요 조달 포털

| 국가 | 포털 | URL |
|------|------|-----|
| 한국 | 나라장터 | g2b.go.kr |
| 미국 | SAM.gov | sam.gov |
| EU | TED | ted.europa.eu |
| 일본 | 電子調達 | geps.go.jp |
| 싱가포르 | GeBIZ | gebiz.gov.sg |
| 호주 | AusTender | tenders.gov.au |
| 영국 | Contracts Finder | gov.uk/contracts-finder |

---

## 12. 핵심 성공 지표

### 12.1 비즈니스 KPI

| 지표 | 현재 | 목표 (Y1) | 목표 (Y3) |
|------|------|----------|----------|
| 낙찰률 | 15% | 25% | 38% |
| 월 입찰 건수 | 5건 | 10건 | 15건 |
| 공고 놓침률 | 60% | 5% | 2% |
| 제안서 작성 시간 | 3시간 | 1시간 | 45분 |

### 12.2 기술 KPI

| 지표 | 목표 |
|------|------|
| 매칭 정확도 | 90%+ |
| API 응답 시간 | <2초 |
| 데이터 수집 지연 | <4시간 |
| 시스템 가용성 | 99.9% |

---

## 13. 피벗 가능 방향

### 13.1 산업 확장

```
유량계/계측기 → 펌프/밸브 → 플랜트 설비 → 환경/수처리 → 에너지/신재생
```

### 13.2 지역 확장

```
한국 → EU (TED) → US (SAM.gov) → ASEAN → 중동/아프리카
```

### 13.3 서비스 확장

```
입찰 검색 → AI 매칭 → 제안서 생성 → 낙찰 예측 → 계약 관리 → 수출 물류
```

---

*BIDFLOW Global Export Knowledge Base v1.0*
*Generated: 2025-12-22*
*Source: 이전 대화 분석 자료 종합*
