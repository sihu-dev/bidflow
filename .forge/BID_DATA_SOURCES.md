# 입찰 데이터 소스 종합 가이드

> **생성일**: 2025-12-19
> **목적**: FORGEONE 입찰 자동화 데이터 수집 전략
> **범위**: 국내 공공/민간 + 해외 조달

---

## 1. 데이터 수집 전략 개요

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FORGEONE 입찰 데이터 파이프라인                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                   │
│   │  공공 API   │   │  공기업 API │   │  해외 API   │                   │
│   │  (REST)    │   │  (REST)    │   │  (REST)    │                   │
│   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘                   │
│          │                 │                 │                          │
│          ▼                 ▼                 ▼                          │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                   데이터 통합 레이어                         │      │
│   │   - 정규화 (스키마 통일)                                     │      │
│   │   - 중복 제거                                                │      │
│   │   - AI 요약/분류                                             │      │
│   └─────────────────────────────────────────────────────────────┘      │
│          │                 │                 │                          │
│   ┌──────┴──────┐   ┌──────┴──────┐   ┌──────┴──────┐                   │
│   │  웹 크롤링   │   │  민간 플랫폼 │   │  RSS/Alert │                   │
│   │ (Playwright)│   │   (스크래핑) │   │   (실시간)  │                   │
│   └─────────────┘   └─────────────┘   └─────────────┘                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 공공데이터 API (공식)

### 2.1 조달청 나라장터 (G2B)

| API | 설명 | 데이터포털 URL |
|-----|------|----------------|
| **입찰공고정보서비스** | 물품/용역/공사/외자 입찰공고 | [data.go.kr/15129394](https://www.data.go.kr/data/15129394/openapi.do) |
| **공공데이터개방표준서비스** | 입찰/낙찰/계약정보 표준 | [data.go.kr/15058815](https://www.data.go.kr/data/15058815/openapi.do) |
| **조달 데이터허브** | 통합 데이터 제공 | [data.g2b.go.kr](https://data.g2b.go.kr/) |

```typescript
// API 호출 예시
const narajangteoAPI = {
  baseUrl: 'http://apis.data.go.kr/1230000',
  endpoints: {
    bidList: '/BidPublicInfoService/getBidPblancListInfoServc', // 입찰공고목록
    bidDetail: '/BidPublicInfoService/getBidPblancDetailInfo', // 상세정보
    resultList: '/ScsbidInfoService/getScsbidListSttus', // 낙찰정보
  },
  params: {
    serviceKey: process.env.DATA_GO_KR_API_KEY,
    numOfRows: 100,
    pageNo: 1,
    inqryDiv: '1', // 1:물품, 2:공사, 3:용역
  }
};
```

### 2.2 공기업/공공기관 API

| 기관 | API/시스템 | URL |
|------|------------|-----|
| **한국전력공사** | 전자입찰계약정보 API | [data.go.kr/15148223](https://www.data.go.kr/data/15148223/openapi.do) |
| **한국전력거래소** | 입찰공고 데이터 | [data.go.kr/15096190](https://www.data.go.kr/data/15096190/fileData.do) |
| **한국수자원공사** | 전자조달 입찰공고 API | [data.go.kr/15101635](https://www.data.go.kr/data/15101635/openapi.do) |
| **한국도로공사** | 전자조달 계약공개 API | [data.go.kr/15128076](https://www.data.go.kr/data/15128076/openapi.do) |
| **한전KDN** | 전자입찰 공지사항 | [data.go.kr/15064540](https://www.data.go.kr/data/15064540/fileData.do) |

---

## 3. 전자조달 시스템 (크롤링 대상)

### 3.1 공기업 전자조달

| 기관 | 시스템 URL | 비고 |
|------|------------|------|
| **한국전력공사** | [srm.kepco.net](https://srm.kepco.net/) | 한전 SRM |
| **한국가스공사** | [bid.kogas.or.kr](http://bid.kogas.or.kr/) | 가스공사 입찰 |
| **한국수자원공사** | [ebid.kwater.or.kr](https://ebid.kwater.or.kr/) | K-water e-Bid |
| **한국토지주택공사** | [ebid.lh.or.kr](https://ebid.lh.or.kr/) | LH e-Bid |
| **한국도로공사** | [ebid.ex.co.kr](https://ebid.ex.co.kr/) | EX 전자조달 |
| **국가철도공단** | [ebid.kr.or.kr](https://ebid.kr.or.kr/) | KR 전자조달 |
| **한국철도공사** | [ebid.korail.com](https://ebid.korail.com/) | KORAIL 전자조달 |
| **한국국토정보공사** | [ebid.lx.or.kr](https://ebid.lx.or.kr/) | LX 전자조달 |
| **한국마사회** | [ebid.kra.co.kr](https://ebid.kra.co.kr/) | KRA 전자조달 |
| **KOICA** | [nebid.koica.go.kr](https://nebid.koica.go.kr/) | 국제협력 |
| **한국원자력발전** | [ebiz.khnp.co.kr](https://ebiz.khnp.co.kr/) | KHNP 조달 |

### 3.2 지방자치단체

| 지자체 | 접근 방법 |
|--------|----------|
| **서울시** | 나라장터(G2B) 통합 공고 |
| **경기도** | 경기데이터드림 API + G2B |
| **부산시** | 나라장터(G2B) 통합 공고 |
| **기타 지자체** | 나라장터(G2B) 통합 공고 |

> 대부분의 지자체는 나라장터(G2B)를 통해 입찰공고를 통합 게시합니다.

---

## 4. 민간 입찰정보 플랫폼

### 4.1 입찰정보 서비스 (유료/무료)

| 플랫폼 | URL | 특징 |
|--------|-----|------|
| **케이비드** | [kbid.co.kr](https://www.kbid.co.kr/) | 국내 1위, 통계/분석 |
| **비드큐** | [bidq.co.kr](https://www.bidq.co.kr/) | 낙찰분석 34조원 |
| **모두입찰** | [modoobid.co.kr](https://www.modoobid.co.kr/) | 소비자 선정 1위 |
| **DeepBID** | [deepbid.com](https://www.deepbid.com/) | 빅데이터 기반 |
| **대한비드** | [bid-korea.com](https://www.bid-korea.com/) | 맞춤형 정보 |
| **한국전자입찰정보** | [ebidkorea.com](https://ebidkorea.com/) | 적격심사 자료 |
| **비드폼** | [bidform.co.kr](https://www.bidform.co.kr/) | 낙찰예측 |
| **아이건설넷** | [igunsul.net](https://www.igunsul.net/) | 건설업 특화 |

### 4.2 데이터 수집 전략

```typescript
// 민간 플랫폼 스크래핑 (참고용 - TOS 확인 필요)
const privatePlatforms = [
  {
    name: 'Kbid',
    loginRequired: true,
    dataType: 'aggregated', // 이미 집계된 데이터
    useCase: 'backup_verification', // 검증용
  },
  {
    name: 'DeepBID',
    loginRequired: true,
    dataType: 'aggregated',
    features: ['민간입찰', '해외입찰', '기업분석'],
  }
];
```

---

## 5. 해외 조달 플랫폼

### 5.1 국제기구

| 플랫폼 | URL | API | 비고 |
|--------|-----|-----|------|
| **UNGM** | [ungm.org](https://www.ungm.org/) | ❌ | UN 조달 ($14B/년) |
| **World Bank** | [worldbank.org/procurement](https://projects.worldbank.org/en/projects-operations/procurement) | 제한적 | $1.6B/년 |
| **ADB** | [adb.org](https://www.adb.org/) | ❌ | 아시아개발은행 |
| **EBRD** | [ebrd.com](https://www.ebrd.com/) | ❌ | 유럽부흥개발은행 |

### 5.2 유럽 (TED)

| 서비스 | URL | API | 비고 |
|--------|-----|-----|------|
| **TED** | [ted.europa.eu](https://ted.europa.eu/en/) | ✅ REST API | €815B/년, 800K 공고 |

```typescript
// TED API 예시
const tedAPI = {
  baseUrl: 'https://ted.europa.eu/api',
  endpoints: {
    search: '/v3/notices/search',
    notice: '/v3/notices/{id}',
  },
  docs: 'https://ted.europa.eu/api/documentation/index.html',
  features: {
    anonymousAccess: true,
    formats: ['XML', 'JSON'],
    bulkDownload: true,
  }
};
```

### 5.3 기타 해외

| 국가/지역 | 플랫폼 | URL |
|----------|--------|-----|
| **미국** | SAM.gov | [sam.gov](https://sam.gov/) |
| **일본** | 電子調達 | [geps.go.jp](https://www.geps.go.jp/) |
| **싱가포르** | GeBIZ | [gebiz.gov.sg](https://www.gebiz.gov.sg/) |
| **호주** | AusTender | [tenders.gov.au](https://www.tenders.gov.au/) |

---

## 6. 크롤링 우선순위

### 6.1 Phase 1 (MVP) - 국내 공공

| 우선순위 | 소스 | 방식 | 난이도 |
|----------|------|------|--------|
| P0 | 나라장터 API | REST API | 쉬움 |
| P0 | 한전 API | REST API | 쉬움 |
| P0 | 수자원공사 API | REST API | 쉬움 |
| P1 | 가스공사 웹 | 크롤링 | 중간 |
| P1 | LH공사 웹 | 크롤링 | 중간 |
| P1 | 도로공사 API | REST API | 쉬움 |

### 6.2 Phase 2 - 공기업 확장

| 우선순위 | 소스 | 방식 | 난이도 |
|----------|------|------|--------|
| P1 | 철도공단 웹 | 크롤링 | 중간 |
| P1 | 철도공사 웹 | 크롤링 | 중간 |
| P2 | 원자력발전 | 크롤링 | 어려움 |
| P2 | 기타 공기업 | 크롤링 | 중간 |

### 6.3 Phase 3 - 해외

| 우선순위 | 소스 | 방식 | 난이도 |
|----------|------|------|--------|
| P2 | TED (유럽) | REST API | 쉬움 |
| P3 | UNGM (UN) | 크롤링 | 어려움 |
| P3 | World Bank | 크롤링 | 어려움 |

---

## 7. 기술 구현

### 7.1 Inngest 크롤링 스케줄러

```typescript
// lib/crawling/scheduler.ts
import { Inngest } from 'inngest';

const inngest = new Inngest({ id: 'forgeone-crawler' });

// 데이터 소스별 스케줄
const CRAWL_SCHEDULES = {
  // 공공 API (실시간성 높음)
  'narajangto-api': '0 */2 * * *',      // 2시간마다
  'kepco-api': '0 */4 * * *',           // 4시간마다
  'kwater-api': '0 */4 * * *',          // 4시간마다
  'ex-api': '0 9,15,21 * * *',          // 하루 3회

  // 웹 크롤링 (서버 부담 고려)
  'kogas-web': '0 8,14,20 * * *',       // 하루 3회
  'lh-web': '0 8,14,20 * * *',          // 하루 3회
  'kr-web': '0 9,18 * * *',             // 하루 2회

  // 해외 (일 1회)
  'ted-api': '0 6 * * *',               // 매일 오전 6시
  'ungm-web': '0 7 * * *',              // 매일 오전 7시
};

// 통합 스케줄러
export const masterScheduler = inngest.createFunction(
  { id: 'master-scheduler' },
  { cron: '0 * * * *' }, // 매시간 체크
  async ({ step }) => {
    const now = new Date();
    const currentHour = now.getHours();

    // 시간대별 작업 트리거
    for (const [source, cron] of Object.entries(CRAWL_SCHEDULES)) {
      if (shouldRun(cron, now)) {
        await step.sendEvent(`crawl-${source}`, {
          name: 'crawl/execute',
          data: { source },
        });
      }
    }
  }
);
```

### 7.2 API 통합 클라이언트

```typescript
// lib/crawling/clients/public-api.ts
interface BidData {
  source: string;
  sourceId: string;
  title: string;
  organization: string;
  amount?: number;
  deadline?: Date;
  category?: string[];
  rawData: Record<string, any>;
}

// 나라장터 API 클라이언트
export class NaraJangtoClient {
  private apiKey: string;
  private baseUrl = 'http://apis.data.go.kr/1230000';

  async fetchBidList(params: {
    type: 'product' | 'service' | 'construction';
    fromDate: Date;
    toDate: Date;
  }): Promise<BidData[]> {
    const endpoint = {
      product: '/BidPublicInfoService/getBidPblancListInfoServcPPSSrch',
      service: '/BidPublicInfoService/getBidPblancListInfoServcSrch',
      construction: '/BidPublicInfoService/getBidPblancListInfoCnstwkPPSSrch',
    }[params.type];

    const response = await fetch(`${this.baseUrl}${endpoint}?${new URLSearchParams({
      serviceKey: this.apiKey,
      numOfRows: '100',
      pageNo: '1',
      inqryBgnDt: formatDate(params.fromDate),
      inqryEndDt: formatDate(params.toDate),
    })}`);

    const data = await response.json();
    return this.normalize(data);
  }

  private normalize(raw: any): BidData[] {
    // 나라장터 응답 → 표준 스키마 변환
    return raw.response.body.items.map((item: any) => ({
      source: 'narajangto',
      sourceId: item.bidNtceNo,
      title: item.bidNtceNm,
      organization: item.ntceInsttNm,
      amount: parseInt(item.presmptPrce) || undefined,
      deadline: parseDate(item.bidClseDt),
      category: [item.ntceKindNm],
      rawData: item,
    }));
  }
}

// TED API 클라이언트
export class TEDClient {
  private baseUrl = 'https://ted.europa.eu/api';

  async searchNotices(params: {
    query?: string;
    country?: string;
    fromDate?: Date;
  }): Promise<BidData[]> {
    const response = await fetch(`${this.baseUrl}/v3/notices/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: params.query,
        filters: {
          'publication-date': {
            gte: params.fromDate?.toISOString(),
          },
        },
      }),
    });

    const data = await response.json();
    return this.normalize(data);
  }
}
```

---

## 8. 키워드 필터링 (제조업 특화)

### 8.1 유량계/계측기 키워드

```typescript
const PRODUCT_KEYWORDS = {
  flowmeter: [
    '유량계', '초음파유량계', '전자유량계', '터빈유량계',
    '볼텍스유량계', '질량유량계', '코리올리스',
    'flowmeter', 'flow meter', 'ultrasonic',
  ],
  instrumentation: [
    '계측기', '압력계', '온도계', '수위계', '레벨미터',
    '트랜스미터', '센서', '측정기',
  ],
  valve: [
    '밸브', '게이트밸브', '버터플라이밸브', '체크밸브',
    '안전밸브', '제어밸브', '전동밸브',
  ],
  pipe: [
    '배관', '파이프', '플랜지', '피팅', '이음관',
  ],
};

// 기관별 키워드 조합
const ORGANIZATION_KEYWORDS = {
  utility: ['한전', '가스공사', '수자원공사', '열병합'],
  infrastructure: ['도로공사', '철도', '공항', '항만'],
  environment: ['환경부', '수도', '하수', '정수장'],
  manufacturing: ['발전소', '플랜트', '정유', '석유화학'],
};
```

---

## 9. 데이터 품질 관리

### 9.1 중복 제거

```typescript
// 공고번호 기반 중복 체크
const deduplicateBids = (bids: BidData[]): BidData[] => {
  const seen = new Map<string, BidData>();

  for (const bid of bids) {
    const key = `${bid.source}:${bid.sourceId}`;
    if (!seen.has(key)) {
      seen.set(key, bid);
    }
  }

  return Array.from(seen.values());
};
```

### 9.2 데이터 검증

```typescript
const validateBid = (bid: BidData): boolean => {
  return (
    bid.title?.length > 0 &&
    bid.sourceId?.length > 0 &&
    (!bid.deadline || bid.deadline > new Date())
  );
};
```

---

## 10. 월간 예상 데이터량

| 소스 | 일 평균 | 월 예상 | 비고 |
|------|---------|---------|------|
| 나라장터 | 500건 | 15,000건 | 물품/용역/공사 |
| 한전 | 20건 | 600건 | 전력 관련 |
| 수자원공사 | 15건 | 450건 | 수도/환경 |
| 가스공사 | 10건 | 300건 | 가스 관련 |
| 기타 공기업 | 50건 | 1,500건 | 도로/철도/LH |
| TED (유럽) | 2,500건 | 75,000건 | 유럽 전체 |
| **합계** | ~3,000건 | ~90,000건 | - |

> 키워드 필터링 후 제조업 관련: 월 ~3,000-5,000건 예상

---

---

## 11. 수출/해외조달 데이터 소스

### 11.1 KOTRA (코트라)

| 서비스 | URL | 설명 |
|--------|-----|------|
| **해외시장뉴스 API** | [dream.kotra.or.kr](https://dream.kotra.or.kr/kotranews/cms/com/index.do?MENU_ID=710) | 해외시장 동향, 입찰정보 |
| **국가정보 API** | [data.go.kr/15034830](https://www.data.go.kr/data/15034830/openapi.do) | 국가별 비즈니스 정보 |
| **해외진출 기업 DB** | [data.go.kr/15003297](https://www.data.go.kr/data/15003297/fileData.do) | 해외진출 한국기업 |
| **무역투자빅데이터** | [dream.kotra.or.kr](https://dream.kotra.or.kr/) | 해외입찰, ODA 정보 |
| **무역투자24** | [kotra.or.kr](https://www.kotra.or.kr/) | 사업신청, 지사화 |

```typescript
// KOTRA API 활용
const kotraAPI = {
  baseUrl: 'http://apis.data.go.kr/B410001',
  endpoints: {
    countryInfo: '/CountryInfoService/getCountryInfo',
    marketNews: '/OverseasMarketNewsService/getNewsList',
  },
  dream: {
    baseUrl: 'https://dream.kotra.or.kr',
    features: ['해외입찰정보', '해외조달동향', 'ODA정보'],
  }
};
```

### 11.2 한국무역협회 (KITA)

| 서비스 | URL | 설명 |
|--------|-----|------|
| **K-STAT 무역통계** | [stat.kita.net](https://stat.kita.net/) | 61개국 무역통계 |
| **tradeKorea** | [tradekorea.com](https://kr.tradekorea.com/) | 바이어 발굴 |
| **AI 수출유망시장** | [kita.net](https://www.kita.net/aiBigData/aiPromisingExportMarket/aiMarketService.do) | AI 기반 시장 추천 |

### 11.3 수출바우처 플랫폼

| 서비스 | URL | 설명 |
|--------|-----|------|
| **수출바우처** | [exportvoucher.com](https://www.exportvoucher.com/) | 수출지원 통합 |
| **해외지사화** | [exportvoucher.com/jisahwa](https://www.exportvoucher.com/jisahwa) | KOTRA 지사화 사업 |

### 11.4 ODA/개발협력

| 기관 | 서비스 | URL |
|------|--------|-----|
| **KOICA** | 전자조달 | [nebid.koica.go.kr](https://nebid.koica.go.kr/) |
| **EDCF** | 사업정보 | [edcfkorea.go.kr](https://www.edcfkorea.go.kr/) |
| **ODA Korea** | 통합정보 | [odakorea.go.kr](https://www.odakorea.go.kr/) |

---

## 12. 전체 데이터 소스 요약

### 12.1 API 우선순위

| 구분 | 소스 | API 가용 | 우선순위 |
|------|------|----------|----------|
| **국내 공공** | 나라장터 | ✅ REST | P0 |
| | 한전 | ✅ REST | P0 |
| | 수자원공사 | ✅ REST | P0 |
| | 도로공사 | ✅ REST | P1 |
| **국내 공기업** | 가스공사 | ❌ 크롤링 | P1 |
| | LH공사 | ❌ 크롤링 | P1 |
| | 철도공단 | ❌ 크롤링 | P2 |
| **수출/해외** | KOTRA API | ✅ REST | P1 |
| | TED (유럽) | ✅ REST | P2 |
| | UNGM | ❌ 크롤링 | P3 |
| | World Bank | 제한적 | P3 |

### 12.2 월간 데이터 예상량 (확장)

| 카테고리 | 소스 | 월 예상 건수 |
|----------|------|--------------|
| 국내 공공 | 나라장터 + 공기업 | 20,000건 |
| 해외 | TED + UNGM + WB | 80,000건 |
| KOTRA | 해외입찰/시장정보 | 5,000건 |
| **합계** | - | ~105,000건 |

> 키워드 필터링 후 제조업 관련: 월 ~5,000-8,000건 예상

---

## Sources

- [조달청 나라장터 입찰공고정보서비스](https://www.data.go.kr/data/15129394/openapi.do)
- [조달 데이터허브](https://data.g2b.go.kr/)
- [한국수자원공사 전자조달 입찰공고 API](https://www.data.go.kr/data/15101635/openapi.do)
- [한국전력공사 전자입찰계약정보 API](https://www.data.go.kr/data/15148223/openapi.do)
- [KOTRA 해외시장뉴스 API](https://dream.kotra.or.kr/kotranews/cms/com/index.do?MENU_ID=710)
- [KOTRA 국가정보 API](https://www.data.go.kr/data/15034830/openapi.do)
- [한국무역협회 K-STAT](https://stat.kita.net/)
- [TED Developers' Corner](https://ted.europa.eu/en/simap/developers-corner-for-reusers)
- [UNGM](https://www.ungm.org/)
- [케이비드](https://www.kbid.co.kr/)

---

*Generated by Claude 4.5 Opus*
*Version: v1.1 (KOTRA/수출 추가)*
