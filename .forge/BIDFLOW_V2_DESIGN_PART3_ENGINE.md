# BIDFLOW V2 Beta Design Document
## Part 3: Connector Framework & Matching Engine

> GPT 5.2 Pro 검수용 마스터 설계 문서
> Version: 2.0-beta
> Date: 2025-12-21

---

# 5. Connector Framework

## 5.1 Framework Overview

모든 데이터 소스는 동일한 인터페이스를 통해 연동되어야 한다.
이를 통해 새로운 소스 추가 시 일관된 방식으로 구현 가능.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Connector Framework Architecture                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Source Connector Interface                      │  │
│  │                                                                    │  │
│  │  interface SourceConnector {                                       │  │
│  │    sourceId: string;                                               │  │
│  │    sourceName: string;                                             │  │
│  │    fetch(options: FetchOptions): Promise<NormalizedBid[]>;         │  │
│  │    validate(bid: RawBid): ValidationResult;                        │  │
│  │    normalize(bid: RawBid): NormalizedBid;                          │  │
│  │    getStatus(): ConnectorStatus;                                   │  │
│  │  }                                                                 │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                           │
│                              ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Common Services Layer                           │  │
│  │                                                                    │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │  │
│  │  │Rate Limiter │ │   Retry     │ │ Deduplicator│ │   Logger    │  │  │
│  │  │             │ │   Manager   │ │             │ │             │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │  │
│  │                                                                    │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │  │
│  │  │ Hash        │ │ Normalizer  │ │ Validator   │ │ Error       │  │  │
│  │  │ Generator   │ │             │ │             │ │ Handler     │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              │                                           │
│                              ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Connector Implementations                       │  │
│  │                                                                    │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │  │
│  │  │ TED         │ │ SAM.gov     │ │ G2B         │ │ Stub        │  │  │
│  │  │ Connector   │ │ Connector   │ │ Connector   │ │ Connector   │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 5.2 Core Interfaces

### 5.2.1 NormalizedBid Interface

```typescript
// src/lib/connectors/types.ts

/**
 * 모든 소스에서 정규화된 공고 형식
 * 이 형식으로 DB에 저장됨
 */
export interface NormalizedBid {
  // 소스 식별
  sourceId: string;              // 'ted' | 'sam_gov' | 'g2b' | 'g2b_stub'
  sourceNoticeId: string;        // 원천 시스템의 고유 ID
  sourceUrl: string | null;      // 원천 URL (공고 상세 페이지)

  // 공고 기본 정보
  title: string;                 // 공고 제목
  organization: string | null;   // 발주 기관
  country: string;               // 국가 코드 (ISO 3166-1 alpha-2)
  region: string | null;         // 지역/도시

  // 일정
  publishedAt: Date | null;      // 공고일
  deadline: Date | null;         // 마감일

  // 금액
  estimatedPrice: number | null; // 예정가격 (통화 변환 후)
  currency: string;              // 원래 통화 코드

  // 상세 정보
  description: string | null;    // 요약/설명
  category: string | null;       // 카테고리 (CPV, NAICS 등)
  keywords: string[];            // 추출된 키워드

  // 원본 데이터
  rawData: Record<string, unknown>;  // 원본 JSON (감사/재파싱용)

  // 해시 (중복 방지)
  contentHash: string;           // SHA-256(title + org + deadline)
}

/**
 * 커넥터 설정
 */
export interface ConnectorConfig {
  apiKey?: string;               // API 키 (환경변수에서)
  baseUrl: string;               // API 기본 URL
  rateLimit: number;             // 요청/분 제한
  timeout: number;               // 요청 타임아웃 (ms)
  retryCount: number;            // 재시도 횟수
  retryDelay: number;            // 재시도 간격 (ms)
}

/**
 * 수집 옵션
 */
export interface FetchOptions {
  fromDate?: Date;               // 시작일
  toDate?: Date;                 // 종료일
  category?: string;             // 카테고리 필터
  keywords?: string[];           // 키워드 필터
  maxResults?: number;           // 최대 결과 수
  pageSize?: number;             // 페이지 크기
}

/**
 * 커넥터 상태
 */
export interface ConnectorStatus {
  sourceId: string;
  isActive: boolean;
  lastSyncAt: Date | null;
  lastError: string | null;
  syncCount: number;
  status: 'idle' | 'running' | 'error';
}

/**
 * 수집 결과
 */
export interface FetchResult {
  bids: NormalizedBid[];
  totalCount: number;
  pagesFetched: number;
  errors: string[];
  duration: number;              // ms
}
```

### 5.2.2 Base Connector Class

```typescript
// src/lib/connectors/base-connector.ts

import { createHash } from 'crypto';
import { NormalizedBid, ConnectorConfig, FetchOptions, FetchResult, ConnectorStatus } from './types';

export abstract class BaseConnector {
  protected config: ConnectorConfig;
  protected status: ConnectorStatus;

  abstract readonly sourceId: string;
  abstract readonly sourceName: string;

  constructor(config: Partial<ConnectorConfig>) {
    this.config = {
      baseUrl: '',
      rateLimit: 60,       // 60 req/min default
      timeout: 30000,      // 30s default
      retryCount: 3,
      retryDelay: 1000,
      ...config,
    };

    this.status = {
      sourceId: this.sourceId,
      isActive: true,
      lastSyncAt: null,
      lastError: null,
      syncCount: 0,
      status: 'idle',
    };
  }

  /**
   * 공고 수집 (구현 필수)
   */
  abstract fetch(options: FetchOptions): Promise<FetchResult>;

  /**
   * 원본 데이터 → 정규화
   */
  abstract normalize(rawBid: unknown): NormalizedBid;

  /**
   * 콘텐츠 해시 생성 (중복 방지)
   */
  protected generateHash(bid: Partial<NormalizedBid>): string {
    const content = [
      bid.title || '',
      bid.organization || '',
      bid.deadline?.toISOString() || '',
      bid.sourceNoticeId || '',
    ].join('|');

    return createHash('sha256').update(content).digest('hex').slice(0, 32);
  }

  /**
   * Rate limiting 처리
   */
  protected async rateLimitedFetch<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    // Rate limit 구현
    await this.waitForRateLimit();

    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json() as T;
  }

  /**
   * 재시도 로직
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    retries = this.config.retryCount
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError;
  }

  /**
   * Rate limit 대기
   */
  private lastRequestTime = 0;
  private async waitForRateLimit(): Promise<void> {
    const minInterval = 60000 / this.config.rateLimit; // ms per request
    const elapsed = Date.now() - this.lastRequestTime;

    if (elapsed < minInterval) {
      await this.delay(minInterval - elapsed);
    }

    this.lastRequestTime = Date.now();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 상태 반환
   */
  getStatus(): ConnectorStatus {
    return { ...this.status };
  }

  /**
   * 상태 업데이트
   */
  protected updateStatus(update: Partial<ConnectorStatus>): void {
    this.status = { ...this.status, ...update };
  }
}
```

---

## 5.3 TED API Connector (EU)

### 5.3.1 TED API Overview

```yaml
API: TED (Tenders Electronic Daily) - EU 공식 입찰 플랫폼
URL: https://ted.europa.eu/api/v3.0
인증: API Key (무료 등록)
문서: https://ted.europa.eu/api/documentation
Rate Limit: 100 requests/minute (추정)
데이터 형식: JSON
갱신 주기: 매일 (EU 업무일 기준)
```

### 5.3.2 TED Connector Implementation

```typescript
// src/lib/connectors/ted-connector.ts

import { BaseConnector } from './base-connector';
import {
  NormalizedBid,
  ConnectorConfig,
  FetchOptions,
  FetchResult,
} from './types';

// TED API 응답 타입
interface TedNotice {
  ND: string;                    // Notice ID
  TI: string;                    // Title
  CY: string;                    // Country
  TW: string;                    // Town
  AA: string;                    // Authority Name (발주기관)
  DD: string;                    // Deadline Date
  DT: string;                    // Document Type
  NC: string;                    // Nature of Contract
  PR: string;                    // Procedure Type
  TD: string;                    // Total Deadline
  TV?: string;                   // Total Value
  RC?: string;                   // Region Code
  PC?: string;                   // CPV Code (카테고리)
  OL: string;                    // Original Language
  AU?: string;                   // Authority URL
}

interface TedSearchResponse {
  total: number;
  results: TedNotice[];
  links?: {
    next?: string;
  };
}

export class TEDConnector extends BaseConnector {
  readonly sourceId = 'ted';
  readonly sourceName = 'EU TED';

  constructor() {
    super({
      baseUrl: 'https://ted.europa.eu/api/v3.0',
      rateLimit: 60,
      timeout: 30000,
      retryCount: 3,
      retryDelay: 1000,
      apiKey: process.env.TED_API_KEY,
    });
  }

  async fetch(options: FetchOptions): Promise<FetchResult> {
    const startTime = Date.now();
    const allBids: NormalizedBid[] = [];
    const errors: string[] = [];
    let pagesFetched = 0;

    this.updateStatus({ status: 'running' });

    try {
      // 유량계 관련 CPV 코드
      const cpvCodes = [
        '38421100',  // Water meters
        '38423000',  // Flow meters
        '38424000',  // Measuring equipment
        '42131000',  // Taps, cocks, valves
      ];

      // 검색 쿼리 구성
      const query = this.buildSearchQuery(options, cpvCodes);
      let hasMore = true;
      let page = 1;
      const maxPages = Math.ceil((options.maxResults || 100) / 50);

      while (hasMore && page <= maxPages) {
        try {
          const response = await this.withRetry(() =>
            this.rateLimitedFetch<TedSearchResponse>(
              `${this.config.baseUrl}/notices/search?${query}&page=${page}&limit=50`
            )
          );

          for (const notice of response.results) {
            try {
              const normalizedBid = this.normalize(notice);
              allBids.push(normalizedBid);
            } catch (e) {
              errors.push(`Failed to normalize notice ${notice.ND}: ${e}`);
            }
          }

          pagesFetched++;
          hasMore = response.links?.next !== undefined;
          page++;
        } catch (e) {
          errors.push(`Failed to fetch page ${page}: ${e}`);
          hasMore = false;
        }
      }

      this.updateStatus({
        status: 'idle',
        lastSyncAt: new Date(),
        syncCount: this.status.syncCount + allBids.length,
        lastError: errors.length > 0 ? errors[0] : null,
      });
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      this.updateStatus({
        status: 'error',
        lastError: errorMsg,
      });
      errors.push(errorMsg);
    }

    return {
      bids: allBids,
      totalCount: allBids.length,
      pagesFetched,
      errors,
      duration: Date.now() - startTime,
    };
  }

  normalize(rawNotice: unknown): NormalizedBid {
    const notice = rawNotice as TedNotice;

    // 마감일 파싱
    let deadline: Date | null = null;
    if (notice.DD) {
      deadline = this.parseTedDate(notice.DD);
    }

    // 금액 파싱 (EUR 기준)
    let estimatedPrice: number | null = null;
    if (notice.TV) {
      estimatedPrice = this.parseTedValue(notice.TV);
    }

    // 키워드 추출
    const keywords = this.extractKeywords(notice.TI, notice.NC);

    return {
      sourceId: this.sourceId,
      sourceNoticeId: notice.ND,
      sourceUrl: `https://ted.europa.eu/notice/${notice.ND}`,

      title: notice.TI,
      organization: notice.AA || null,
      country: notice.CY,
      region: notice.TW || null,

      publishedAt: new Date(), // TED는 검색 시점 기준
      deadline,

      estimatedPrice,
      currency: 'EUR',

      description: null, // 상세 조회 필요
      category: notice.PC || null,
      keywords,

      rawData: notice as Record<string, unknown>,
      contentHash: this.generateHash({
        title: notice.TI,
        organization: notice.AA,
        deadline,
        sourceNoticeId: notice.ND,
      }),
    };
  }

  private buildSearchQuery(options: FetchOptions, cpvCodes: string[]): string {
    const params = new URLSearchParams();

    // CPV 코드 필터
    if (cpvCodes.length > 0) {
      params.append('cpv', cpvCodes.join(','));
    }

    // 날짜 필터
    if (options.fromDate) {
      params.append('publication-date-from', options.fromDate.toISOString().split('T')[0]);
    }
    if (options.toDate) {
      params.append('publication-date-to', options.toDate.toISOString().split('T')[0]);
    }

    // 키워드 필터 (유량계 관련)
    const defaultKeywords = [
      'flow meter',
      'ultrasonic',
      'water meter',
      'flowmeter',
    ];
    const keywords = options.keywords || defaultKeywords;
    params.append('q', keywords.join(' OR '));

    // 활성 공고만
    params.append('status', 'active');

    return params.toString();
  }

  private parseTedDate(dateStr: string): Date | null {
    try {
      // TED 날짜 형식: YYYYMMDD 또는 YYYY-MM-DD
      const cleaned = dateStr.replace(/-/g, '');
      const year = parseInt(cleaned.slice(0, 4));
      const month = parseInt(cleaned.slice(4, 6)) - 1;
      const day = parseInt(cleaned.slice(6, 8));
      return new Date(year, month, day);
    } catch {
      return null;
    }
  }

  private parseTedValue(valueStr: string): number | null {
    try {
      // "EUR 1,000,000" 형식 파싱
      const cleaned = valueStr.replace(/[^0-9.]/g, '');
      return parseFloat(cleaned) || null;
    } catch {
      return null;
    }
  }

  private extractKeywords(title: string, natureOfContract: string): string[] {
    const keywords: string[] = [];
    const text = `${title} ${natureOfContract}`.toLowerCase();

    // 유량계 관련 키워드 추출
    const patterns = [
      'flow meter', 'flowmeter', 'water meter',
      'ultrasonic', 'electromagnetic', 'magnetic',
      'measurement', 'instrumentation',
      'water supply', 'wastewater', 'sewage',
    ];

    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        keywords.push(pattern);
      }
    }

    return keywords;
  }
}
```

---

## 5.4 SAM.gov Connector (US)

### 5.4.1 SAM.gov API Overview

```yaml
API: SAM.gov (System for Award Management) - US 연방 조달 플랫폼
URL: https://api.sam.gov
인증: API Key (무료 등록, Sam.gov 계정 필요)
문서: https://open.gsa.gov/api/get-opportunities-public-api/
Rate Limit: 10 requests/second
데이터 형식: JSON
갱신 주기: 실시간
```

### 5.4.2 SAM.gov Connector Implementation

```typescript
// src/lib/connectors/sam-connector.ts

import { BaseConnector } from './base-connector';
import {
  NormalizedBid,
  ConnectorConfig,
  FetchOptions,
  FetchResult,
} from './types';

// SAM.gov API 응답 타입
interface SamOpportunity {
  noticeId: string;
  title: string;
  solicitationNumber?: string;
  department?: string;
  subTier?: string;
  office?: string;
  postedDate: string;
  type: string;
  baseType: string;
  archiveType?: string;
  archiveDate?: string;
  responseDeadLine?: string;
  naicsCode?: string;
  classificationCode?: string;
  active: string;
  description?: string;
  organizationType?: string;
  uiLink: string;
  award?: {
    amount?: number;
    date?: string;
  };
  pointOfContact?: Array<{
    type: string;
    email?: string;
    phone?: string;
    fullName?: string;
  }>;
  placeOfPerformance?: {
    city?: { name?: string };
    state?: { code?: string; name?: string };
    country?: { code?: string; name?: string };
  };
}

interface SamSearchResponse {
  totalRecords: number;
  limit: number;
  offset: number;
  opportunitiesData: SamOpportunity[];
}

export class SAMConnector extends BaseConnector {
  readonly sourceId = 'sam_gov';
  readonly sourceName = 'US SAM.gov';

  constructor() {
    super({
      baseUrl: 'https://api.sam.gov/opportunities/v2',
      rateLimit: 10 * 60, // 10 req/sec = 600 req/min
      timeout: 30000,
      retryCount: 3,
      retryDelay: 2000,
      apiKey: process.env.SAM_GOV_API_KEY,
    });
  }

  async fetch(options: FetchOptions): Promise<FetchResult> {
    const startTime = Date.now();
    const allBids: NormalizedBid[] = [];
    const errors: string[] = [];
    let pagesFetched = 0;

    this.updateStatus({ status: 'running' });

    try {
      // 유량계 관련 NAICS 코드
      const naicsCodes = [
        '334514',  // Totalizing Fluid Meter Manufacturing
        '334519',  // Other Measuring Instruments
        '333318',  // Other Commercial Equipment Manufacturing
      ];

      // 검색 쿼리 구성
      const params = this.buildSearchParams(options, naicsCodes);
      let offset = 0;
      const limit = 100;
      const maxResults = options.maxResults || 500;

      while (offset < maxResults) {
        try {
          const url = new URL(`${this.config.baseUrl}/search`);
          url.search = new URLSearchParams({
            ...params,
            limit: String(limit),
            offset: String(offset),
            api_key: this.config.apiKey || '',
          }).toString();

          const response = await this.withRetry(() =>
            this.rateLimitedFetch<SamSearchResponse>(url.toString())
          );

          if (!response.opportunitiesData || response.opportunitiesData.length === 0) {
            break;
          }

          for (const opp of response.opportunitiesData) {
            try {
              const normalizedBid = this.normalize(opp);
              allBids.push(normalizedBid);
            } catch (e) {
              errors.push(`Failed to normalize opportunity ${opp.noticeId}: ${e}`);
            }
          }

          pagesFetched++;
          offset += limit;

          if (response.opportunitiesData.length < limit) {
            break;
          }
        } catch (e) {
          errors.push(`Failed to fetch offset ${offset}: ${e}`);
          break;
        }
      }

      this.updateStatus({
        status: 'idle',
        lastSyncAt: new Date(),
        syncCount: this.status.syncCount + allBids.length,
        lastError: errors.length > 0 ? errors[0] : null,
      });
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      this.updateStatus({
        status: 'error',
        lastError: errorMsg,
      });
      errors.push(errorMsg);
    }

    return {
      bids: allBids,
      totalCount: allBids.length,
      pagesFetched,
      errors,
      duration: Date.now() - startTime,
    };
  }

  normalize(rawOpp: unknown): NormalizedBid {
    const opp = rawOpp as SamOpportunity;

    // 마감일 파싱
    let deadline: Date | null = null;
    if (opp.responseDeadLine) {
      deadline = new Date(opp.responseDeadLine);
    }

    // 게시일 파싱
    let publishedAt: Date | null = null;
    if (opp.postedDate) {
      publishedAt = new Date(opp.postedDate);
    }

    // 발주 기관 조합
    const organization = [opp.department, opp.subTier, opp.office]
      .filter(Boolean)
      .join(' - ') || null;

    // 지역 정보
    const region = opp.placeOfPerformance?.state?.name ||
                   opp.placeOfPerformance?.city?.name || null;

    // 금액 (award 정보가 있는 경우)
    const estimatedPrice = opp.award?.amount || null;

    // 키워드 추출
    const keywords = this.extractKeywords(opp);

    return {
      sourceId: this.sourceId,
      sourceNoticeId: opp.noticeId,
      sourceUrl: opp.uiLink || `https://sam.gov/opp/${opp.noticeId}/view`,

      title: opp.title,
      organization,
      country: 'US',
      region,

      publishedAt,
      deadline,

      estimatedPrice,
      currency: 'USD',

      description: opp.description || null,
      category: opp.naicsCode || opp.classificationCode || null,
      keywords,

      rawData: opp as Record<string, unknown>,
      contentHash: this.generateHash({
        title: opp.title,
        organization,
        deadline,
        sourceNoticeId: opp.noticeId,
      }),
    };
  }

  private buildSearchParams(
    options: FetchOptions,
    naicsCodes: string[]
  ): Record<string, string> {
    const params: Record<string, string> = {
      ptype: 'o,p,k', // Combined Synopsis/Solicitation, Presolicitation, Sources Sought
      status: 'active',
    };

    // 날짜 필터
    if (options.fromDate) {
      params.postedFrom = this.formatDate(options.fromDate);
    }
    if (options.toDate) {
      params.postedTo = this.formatDate(options.toDate);
    }

    // NAICS 코드 필터
    if (naicsCodes.length > 0) {
      params.naics = naicsCodes.join(',');
    }

    // 키워드 검색
    const defaultKeywords = [
      'flow meter',
      'ultrasonic meter',
      'water measurement',
      'flowmeter',
    ];
    const keywords = options.keywords || defaultKeywords;
    params.q = keywords.join(' ');

    return params;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  }

  private extractKeywords(opp: SamOpportunity): string[] {
    const keywords: string[] = [];
    const text = `${opp.title} ${opp.description || ''}`.toLowerCase();

    const patterns = [
      'flow meter', 'flowmeter', 'water meter',
      'ultrasonic', 'electromagnetic', 'magnetic',
      'measurement', 'instrumentation', 'sensor',
      'water', 'wastewater', 'utility',
    ];

    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        keywords.push(pattern);
      }
    }

    return keywords;
  }
}
```

---

## 5.5 G2B Stub Connector (Korea - 테스트용)

```typescript
// src/lib/connectors/g2b-stub-connector.ts

import { BaseConnector } from './base-connector';
import { NormalizedBid, FetchOptions, FetchResult } from './types';

/**
 * 나라장터 스텁 커넥터
 * - 합법적 API 확인 전까지 테스트용 데이터 제공
 * - 실제 API 연동 시 이 클래스를 교체
 */
export class G2BStubConnector extends BaseConnector {
  readonly sourceId = 'g2b_stub';
  readonly sourceName = 'Korea G2B (Stub)';

  constructor() {
    super({
      baseUrl: '',
      rateLimit: 100,
      timeout: 5000,
      retryCount: 0,
      retryDelay: 0,
    });
  }

  async fetch(options: FetchOptions): Promise<FetchResult> {
    const startTime = Date.now();

    // 테스트 데이터 생성
    const stubBids = this.generateStubData(options.maxResults || 10);

    this.updateStatus({
      status: 'idle',
      lastSyncAt: new Date(),
      syncCount: this.status.syncCount + stubBids.length,
    });

    return {
      bids: stubBids,
      totalCount: stubBids.length,
      pagesFetched: 1,
      errors: [],
      duration: Date.now() - startTime,
    };
  }

  normalize(rawBid: unknown): NormalizedBid {
    return rawBid as NormalizedBid;
  }

  private generateStubData(count: number): NormalizedBid[] {
    const stubData: NormalizedBid[] = [];

    const organizations = [
      'K-water 대전지사',
      '서울시 상수도사업본부',
      '부산시 수도사업본부',
      '한국환경공단',
      '인천광역시 상수도사업본부',
    ];

    const titles = [
      '초음파 유량계 구매',
      '전자식 유량계 설치 사업',
      '하수관거 유량측정 장비 도입',
      '상수도 스마트 미터링 사업',
      '정수장 계측기 교체 공사',
    ];

    const products = [
      { name: 'UR-1000PLUS', spec: 'DN200-500' },
      { name: 'MF-1000C', spec: 'DN50-150' },
      { name: 'UR-1010PLUS', spec: 'DN300-800' },
      { name: 'SL-3000PLUS', spec: '개수로형' },
      { name: 'EnerRay', spec: 'DN25-100' },
    ];

    for (let i = 0; i < count; i++) {
      const org = organizations[i % organizations.length];
      const titleBase = titles[i % titles.length];
      const product = products[i % products.length];

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 7 + Math.floor(Math.random() * 30));

      const bid: NormalizedBid = {
        sourceId: this.sourceId,
        sourceNoticeId: `G2B-STUB-${Date.now()}-${i}`,
        sourceUrl: `https://www.g2b.go.kr/pt/menu/selectSubFrame.do?framesrc=/pt/menu/frameTgong.do?url=https://www.g2b.go.kr:8101/ep/tbid/tbidList.do`,

        title: `${titleBase} (${product.spec})`,
        organization: org,
        country: 'KR',
        region: org.includes('서울') ? '서울' :
                org.includes('부산') ? '부산' :
                org.includes('인천') ? '인천' : '대전',

        publishedAt: new Date(),
        deadline,

        estimatedPrice: Math.floor(100000000 + Math.random() * 400000000),
        currency: 'KRW',

        description: `${org}에서 ${titleBase}을 위한 입찰 공고입니다. 대상 제품: ${product.name}`,
        category: '유량계',
        keywords: ['유량계', '초음파', product.name, product.spec],

        rawData: {
          stub: true,
          generatedAt: new Date().toISOString(),
          matchingProduct: product.name,
        },
        contentHash: this.generateHash({
          title: `${titleBase} (${product.spec})`,
          organization: org,
          deadline,
          sourceNoticeId: `G2B-STUB-${Date.now()}-${i}`,
        }),
      };

      stubBids.push(bid);
    }

    return stubBids;
  }
}
```

---

# 6. Matching Engine

## 6.1 175-Point Scoring System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    175-Point Matching System                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Total Score: 175 points                                                 │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Keyword Score: 100 points (57%)                                 │    │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │    │
│  │                                                                  │    │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │    │
│  │  │ Primary: 60pts │  │Secondary: 25pts│  │ Spec: 15pts    │     │    │
│  │  │ 핵심 키워드    │  │ 보조 키워드    │  │ 스펙 키워드    │     │    │
│  │  └────────────────┘  └────────────────┘  └────────────────┘     │    │
│  │                                                                  │    │
│  │  Exclude Penalty: -50 points (제외 키워드 발견 시)               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Spec Score: 25 points (14%)                                     │    │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │    │
│  │                                                                  │    │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │    │
│  │  │Diameter: 10pts │  │Accuracy: 8pts  │  │Protocol: 7pts  │     │    │
│  │  │ 구경 범위 일치 │  │ 정확도 충족    │  │ 통신 프로토콜  │     │    │
│  │  └────────────────┘  └────────────────┘  └────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Organization Score: 50 points (29%)                             │    │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │    │
│  │                                                                  │    │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │    │
│  │  │History: 25pts  │  │Preference: 15pt│  │ Size: 10pts    │     │    │
│  │  │ 거래 이력      │  │ 선호도 분석    │  │ 기관 규모      │     │    │
│  │  └────────────────┘  └────────────────┘  └────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 6.2 Enhanced Matcher Implementation

```typescript
// src/lib/matching/enhanced-matcher.ts

import { NormalizedBid } from '@/lib/connectors/types';

// 제품 인터페이스
interface Product {
  id: string;
  tenantId: string;
  name: string;
  modelNumber: string;
  category: string;
  keywords: {
    primary: string[];
    secondary: string[];
    specs: string[];
    exclude: string[];
  };
  specs: Record<string, unknown>;
}

// 매칭 결과 인터페이스
interface MatchResult {
  bidId: string;
  productId: string;
  tenantId: string;

  // 점수
  totalScore: number;
  keywordScore: number;
  specScore: number;
  orgScore: number;

  // 상세
  matchDetails: {
    matchedKeywords: string[];
    matchedSpecs: string[];
    excludedKeywords: string[];
    orgHistory: {
      prevContracts: number;
      preferenceLevel: 'high' | 'medium' | 'low' | 'none';
    };
  };

  // 권장 액션
  action: 'BID' | 'REVIEW' | 'SKIP';
  actionReason: string;
}

// 기관 히스토리 인터페이스
interface OrgHistory {
  organization: string;
  contractCount: number;
  lastContract: Date | null;
  preferenceLevel: 'high' | 'medium' | 'low' | 'none';
}

export class EnhancedMatcher {
  // 점수 가중치
  private static readonly WEIGHTS = {
    keyword: {
      primary: 60,      // 핵심 키워드 60점
      secondary: 25,    // 보조 키워드 25점
      specs: 15,        // 스펙 키워드 15점
    },
    spec: {
      diameter: 10,     // 구경 범위 10점
      accuracy: 8,      // 정확도 8점
      protocol: 7,      // 통신 프로토콜 7점
    },
    org: {
      history: 25,      // 거래 이력 25점
      preference: 15,   // 선호도 15점
      size: 10,         // 기관 규모 10점
    },
    excludePenalty: -50, // 제외 키워드 패널티
  };

  // 액션 임계값
  private static readonly THRESHOLDS = {
    bid: 120,           // 120점 이상: 적극 참여 권장
    review: 70,         // 70-119점: 검토 후 결정
    skip: 0,            // 70점 미만: 건너뛰기 권장
  };

  constructor(
    private readonly orgHistories: Map<string, OrgHistory> = new Map()
  ) {}

  /**
   * 단일 공고-제품 매칭
   */
  match(bid: NormalizedBid, product: Product): MatchResult {
    const keywordResult = this.calculateKeywordScore(bid, product);
    const specResult = this.calculateSpecScore(bid, product);
    const orgResult = this.calculateOrgScore(bid, product);

    const totalScore = Math.max(0,
      keywordResult.score + specResult.score + orgResult.score
    );

    const action = this.determineAction(totalScore);
    const actionReason = this.generateActionReason(
      action, keywordResult, specResult, orgResult
    );

    return {
      bidId: bid.sourceNoticeId,
      productId: product.id,
      tenantId: product.tenantId,

      totalScore,
      keywordScore: keywordResult.score,
      specScore: specResult.score,
      orgScore: orgResult.score,

      matchDetails: {
        matchedKeywords: keywordResult.matched,
        matchedSpecs: specResult.matched,
        excludedKeywords: keywordResult.excluded,
        orgHistory: {
          prevContracts: orgResult.contractCount,
          preferenceLevel: orgResult.preferenceLevel,
        },
      },

      action,
      actionReason,
    };
  }

  /**
   * 여러 제품에 대해 공고 매칭 (최고 점수 제품 반환)
   */
  matchBest(bid: NormalizedBid, products: Product[]): MatchResult | null {
    if (products.length === 0) return null;

    const results = products.map(product => this.match(bid, product));
    return results.reduce((best, current) =>
      current.totalScore > best.totalScore ? current : best
    );
  }

  /**
   * 키워드 점수 계산 (100점 만점)
   */
  private calculateKeywordScore(bid: NormalizedBid, product: Product): {
    score: number;
    matched: string[];
    excluded: string[];
  } {
    const text = this.normalizeText(
      `${bid.title} ${bid.description || ''} ${bid.category || ''}`
    );

    const matched: string[] = [];
    const excluded: string[] = [];
    let score = 0;

    // Primary 키워드 (60점)
    const primaryMatched = product.keywords.primary.filter(kw =>
      this.fuzzyMatch(text, kw)
    );
    if (primaryMatched.length > 0) {
      const ratio = primaryMatched.length / product.keywords.primary.length;
      score += Math.round(EnhancedMatcher.WEIGHTS.keyword.primary * ratio);
      matched.push(...primaryMatched);
    }

    // Secondary 키워드 (25점)
    const secondaryMatched = product.keywords.secondary.filter(kw =>
      this.fuzzyMatch(text, kw)
    );
    if (secondaryMatched.length > 0) {
      const ratio = secondaryMatched.length / product.keywords.secondary.length;
      score += Math.round(EnhancedMatcher.WEIGHTS.keyword.secondary * Math.min(ratio * 2, 1));
      matched.push(...secondaryMatched);
    }

    // Specs 키워드 (15점)
    const specsMatched = product.keywords.specs.filter(kw =>
      this.fuzzyMatch(text, kw)
    );
    if (specsMatched.length > 0) {
      const ratio = specsMatched.length / product.keywords.specs.length;
      score += Math.round(EnhancedMatcher.WEIGHTS.keyword.specs * ratio);
      matched.push(...specsMatched);
    }

    // Exclude 키워드 체크 (패널티)
    const excludeMatched = product.keywords.exclude.filter(kw =>
      this.fuzzyMatch(text, kw)
    );
    if (excludeMatched.length > 0) {
      // 강한 패널티 대신 완화된 패널티 (Recall 유지)
      const penalty = Math.min(
        EnhancedMatcher.WEIGHTS.excludePenalty,
        -10 * excludeMatched.length
      );
      score += penalty;
      excluded.push(...excludeMatched);
    }

    return { score: Math.max(0, score), matched, excluded };
  }

  /**
   * 스펙 점수 계산 (25점 만점)
   */
  private calculateSpecScore(bid: NormalizedBid, product: Product): {
    score: number;
    matched: string[];
  } {
    const text = this.normalizeText(
      `${bid.title} ${bid.description || ''}`
    );
    const matched: string[] = [];
    let score = 0;

    // 구경 범위 매칭 (10점)
    const diameterRange = product.specs.diameter_range as string;
    if (diameterRange) {
      const bidDiameters = this.extractDiameters(text);
      const productRange = this.parseDiameterRange(diameterRange);

      if (bidDiameters.length > 0 && productRange) {
        const inRange = bidDiameters.some(d =>
          d >= productRange.min && d <= productRange.max
        );
        if (inRange) {
          score += EnhancedMatcher.WEIGHTS.spec.diameter;
          matched.push(`Diameter: ${bidDiameters.join(', ')}`);
        }
      }
    }

    // 정확도 매칭 (8점)
    const accuracy = product.specs.accuracy as string;
    if (accuracy && text.includes(accuracy.replace('±', ''))) {
      score += EnhancedMatcher.WEIGHTS.spec.accuracy;
      matched.push(`Accuracy: ${accuracy}`);
    }

    // 통신 프로토콜 매칭 (7점)
    const protocols = product.specs.communication as string[];
    if (protocols) {
      const matchedProtocols = protocols.filter(p =>
        this.fuzzyMatch(text, p)
      );
      if (matchedProtocols.length > 0) {
        score += EnhancedMatcher.WEIGHTS.spec.protocol;
        matched.push(`Protocol: ${matchedProtocols.join(', ')}`);
      }
    }

    return { score, matched };
  }

  /**
   * 기관 점수 계산 (50점 만점)
   */
  private calculateOrgScore(bid: NormalizedBid, product: Product): {
    score: number;
    contractCount: number;
    preferenceLevel: 'high' | 'medium' | 'low' | 'none';
  } {
    const org = bid.organization || '';
    let score = 0;
    let contractCount = 0;
    let preferenceLevel: 'high' | 'medium' | 'low' | 'none' = 'none';

    // 기관 히스토리 조회
    const history = this.orgHistories.get(this.normalizeOrgName(org));

    if (history) {
      contractCount = history.contractCount;
      preferenceLevel = history.preferenceLevel;

      // 거래 이력 점수 (25점)
      if (history.contractCount >= 5) {
        score += EnhancedMatcher.WEIGHTS.org.history;
      } else if (history.contractCount >= 3) {
        score += Math.round(EnhancedMatcher.WEIGHTS.org.history * 0.7);
      } else if (history.contractCount >= 1) {
        score += Math.round(EnhancedMatcher.WEIGHTS.org.history * 0.4);
      }

      // 선호도 점수 (15점)
      switch (history.preferenceLevel) {
        case 'high':
          score += EnhancedMatcher.WEIGHTS.org.preference;
          break;
        case 'medium':
          score += Math.round(EnhancedMatcher.WEIGHTS.org.preference * 0.6);
          break;
        case 'low':
          score += Math.round(EnhancedMatcher.WEIGHTS.org.preference * 0.3);
          break;
      }
    }

    // 기관 규모 점수 (10점) - 키워드 기반 추정
    const largeOrgKeywords = ['K-water', '환경공단', '광역시', '특별시'];
    if (largeOrgKeywords.some(kw => org.includes(kw))) {
      score += EnhancedMatcher.WEIGHTS.org.size;
    }

    return { score, contractCount, preferenceLevel };
  }

  /**
   * 액션 결정
   */
  private determineAction(score: number): 'BID' | 'REVIEW' | 'SKIP' {
    if (score >= EnhancedMatcher.THRESHOLDS.bid) return 'BID';
    if (score >= EnhancedMatcher.THRESHOLDS.review) return 'REVIEW';
    return 'SKIP';
  }

  /**
   * 액션 사유 생성
   */
  private generateActionReason(
    action: 'BID' | 'REVIEW' | 'SKIP',
    keyword: { score: number; matched: string[]; excluded: string[] },
    spec: { score: number; matched: string[] },
    org: { score: number; contractCount: number; preferenceLevel: string }
  ): string {
    const reasons: string[] = [];

    if (keyword.matched.length > 0) {
      reasons.push(`키워드 ${keyword.matched.length}개 일치`);
    }
    if (spec.matched.length > 0) {
      reasons.push(`스펙 ${spec.matched.length}개 충족`);
    }
    if (org.contractCount > 0) {
      reasons.push(`기존 거래 ${org.contractCount}건`);
    }
    if (keyword.excluded.length > 0) {
      reasons.push(`제외 키워드 ${keyword.excluded.length}개 발견`);
    }

    const prefix = {
      BID: '적극 참여 권장: ',
      REVIEW: '검토 필요: ',
      SKIP: '건너뛰기 권장: ',
    }[action];

    return prefix + (reasons.length > 0 ? reasons.join(', ') : '분석 중');
  }

  /**
   * 텍스트 정규화
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 기관명 정규화
   */
  private normalizeOrgName(org: string): string {
    return org
      .replace(/\s+/g, '')
      .replace(/주식회사|㈜|\(주\)/g, '')
      .toLowerCase();
  }

  /**
   * 퍼지 매칭 (오타/변형 허용)
   */
  private fuzzyMatch(text: string, keyword: string): boolean {
    const normalizedKeyword = this.normalizeText(keyword);

    // 정확히 포함
    if (text.includes(normalizedKeyword)) return true;

    // 영문 키워드의 경우 공백 제거 후 매칭
    const noSpaceText = text.replace(/\s/g, '');
    const noSpaceKeyword = normalizedKeyword.replace(/\s/g, '');
    if (noSpaceText.includes(noSpaceKeyword)) return true;

    return false;
  }

  /**
   * 구경(DN) 추출
   */
  private extractDiameters(text: string): number[] {
    const pattern = /dn\s*(\d+)/gi;
    const matches = [...text.matchAll(pattern)];
    return matches.map(m => parseInt(m[1])).filter(d => !isNaN(d));
  }

  /**
   * 구경 범위 파싱
   */
  private parseDiameterRange(range: string): { min: number; max: number } | null {
    const match = range.match(/dn(\d+)\s*[-~]\s*dn(\d+)/i);
    if (match) {
      return {
        min: parseInt(match[1]),
        max: parseInt(match[2]),
      };
    }
    return null;
  }
}
```

---

## 6.3 Matching Pipeline

```typescript
// src/lib/matching/matching-pipeline.ts

import { createClient } from '@supabase/supabase-js';
import { EnhancedMatcher } from './enhanced-matcher';
import { NormalizedBid } from '@/lib/connectors/types';

interface PipelineConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  batchSize: number;
}

export class MatchingPipeline {
  private supabase;
  private matcher: EnhancedMatcher;

  constructor(private config: PipelineConfig) {
    this.supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey
    );
    this.matcher = new EnhancedMatcher();
  }

  /**
   * 새 공고들에 대해 매칭 실행
   */
  async runMatching(bidIds?: string[]): Promise<{
    processed: number;
    matched: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processed = 0;
    let matched = 0;

    // 1. 처리할 공고 조회
    let query = this.supabase
      .from('bids')
      .select('*')
      .eq('status', 'active');

    if (bidIds && bidIds.length > 0) {
      query = query.in('id', bidIds);
    } else {
      // 최근 24시간 내 수집된 공고
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      query = query.gte('created_at', yesterday.toISOString());
    }

    const { data: bids, error: bidsError } = await query;

    if (bidsError) {
      errors.push(`Failed to fetch bids: ${bidsError.message}`);
      return { processed, matched, errors };
    }

    if (!bids || bids.length === 0) {
      return { processed, matched, errors };
    }

    // 2. 모든 테넌트의 활성 제품 조회
    const { data: products, error: productsError } = await this.supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (productsError) {
      errors.push(`Failed to fetch products: ${productsError.message}`);
      return { processed, matched, errors };
    }

    if (!products || products.length === 0) {
      return { processed, matched, errors };
    }

    // 3. 테넌트별로 그룹화
    const productsByTenant = new Map<string, typeof products>();
    for (const product of products) {
      const existing = productsByTenant.get(product.tenant_id) || [];
      existing.push(product);
      productsByTenant.set(product.tenant_id, existing);
    }

    // 4. 배치 처리
    for (let i = 0; i < bids.length; i += this.config.batchSize) {
      const batch = bids.slice(i, i + this.config.batchSize);

      for (const bid of batch) {
        processed++;

        // 각 테넌트에 대해 매칭 실행
        for (const [tenantId, tenantProducts] of productsByTenant) {
          try {
            const normalizedBid: NormalizedBid = {
              sourceId: bid.source_id,
              sourceNoticeId: bid.source_notice_id,
              sourceUrl: bid.source_url,
              title: bid.title,
              organization: bid.organization,
              country: bid.country,
              region: null,
              publishedAt: bid.published_at ? new Date(bid.published_at) : null,
              deadline: bid.deadline ? new Date(bid.deadline) : null,
              estimatedPrice: bid.estimated_price,
              currency: bid.currency,
              description: bid.description,
              category: bid.category,
              keywords: [],
              rawData: bid.raw_data,
              contentHash: bid.content_hash,
            };

            const matchResult = this.matcher.matchBest(
              normalizedBid,
              tenantProducts
            );

            if (matchResult && matchResult.totalScore >= 50) {
              // 매칭 결과 저장
              const { error: insertError } = await this.supabase
                .from('matches')
                .upsert({
                  tenant_id: tenantId,
                  bid_id: bid.id,
                  product_id: matchResult.productId,
                  total_score: matchResult.totalScore,
                  keyword_score: matchResult.keywordScore,
                  spec_score: matchResult.specScore,
                  org_score: matchResult.orgScore,
                  match_details: matchResult.matchDetails,
                  action: matchResult.action,
                  action_reason: matchResult.actionReason,
                }, {
                  onConflict: 'tenant_id,bid_id,product_id',
                });

              if (insertError) {
                errors.push(`Failed to save match for bid ${bid.id}: ${insertError.message}`);
              } else {
                matched++;
              }
            }
          } catch (e) {
            errors.push(`Error matching bid ${bid.id}: ${e}`);
          }
        }
      }
    }

    return { processed, matched, errors };
  }
}
```

---

*Part 3 끝 - Part 4: UI/UX & Demo로 계속*
