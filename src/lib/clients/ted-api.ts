/**
 * @module clients/ted-api
 * @description TED (Tenders Electronic Daily) API 클라이언트
 * @see https://ted.europa.eu/en/about-ted/api
 */

import type { BidData, BidSource, CreateInput, ISODateString, KRW } from '@forge-labs/types/bidding';
import { checkCrawlingRateLimit } from '../security/rate-limiter';
import { BaseAPIClient, APIClientError } from './base-api-client';

// ============================================================================
// TED API 타입 정의
// ============================================================================

interface TEDSearchParams {
  query?: string;
  publicationDate?: {
    from?: string;  // YYYYMMDD
    to?: string;    // YYYYMMDD
  };
  contractType?: 'supplies' | 'services' | 'works';
  country?: string;  // ISO 코드 (예: KR, DE, FR)
  cpvCodes?: string[];  // CPV 코드 (예: 38410000 = 계량기)
  pageNum?: number;
  pageSize?: number;
}

interface TEDNotice {
  noticeId: string;
  title: string;
  buyerName: string;
  buyerCountry: string;
  publicationDate: string;
  deadline: string;
  estimatedValue?: {
    amount: number;
    currency: string;
  };
  cpvCodes: string[];
  contractType: string;
  procedureType: string;
  url: string;
  description?: string;
}

interface TEDSearchResponse {
  total: number;
  pageNum: number;
  pageSize: number;
  notices: TEDNotice[];
}

// ============================================================================
// TED API 클라이언트
// ============================================================================

export class TEDAPIClient extends BaseAPIClient {
  protected readonly source = 'TED';
  protected readonly baseUrl = 'https://api.ted.europa.eu/v3';

  constructor() {
    super();
    // TED API는 공개 API로 API Key 불필요
  }

  /**
   * 입찰 공고 검색
   */
  async searchNotices(params: TEDSearchParams): Promise<TEDSearchResponse> {
    // Rate Limit 체크
    const rateLimitResult = await checkCrawlingRateLimit('ted');
    if (!rateLimitResult.success) {
      throw new APIClientError(
        `TED API Rate Limit 초과: ${rateLimitResult.reset - Date.now()}ms 후 재시도`,
        this.source,
        429,
        true
      );
    }

    const searchBody = this.buildSearchQuery(params);

    // 캐시 키 생성
    const cacheKey = `ted:search:${JSON.stringify(searchBody)}`;

    const data = await this.fetchWithRetry<Record<string, unknown>>(
      `${this.baseUrl}/notices/search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(searchBody),
        cacheKey,
        cacheTTL: 5 * 60 * 1000, // 5분 캐시
      }
    );

    return this.parseSearchResponse(data);
  }

  /**
   * 특정 공고 상세 조회
   */
  async getNotice(noticeId: string): Promise<TEDNotice | null> {
    const rateLimitResult = await checkCrawlingRateLimit('ted');
    if (!rateLimitResult.success) {
      throw new APIClientError('TED API Rate Limit 초과', this.source, 429, true);
    }

    const cacheKey = `ted:notice:${noticeId}`;

    try {
      const data = await this.fetchWithRetry<Record<string, unknown>>(
        `${this.baseUrl}/notices/${noticeId}`,
        {
          headers: {
            'Accept': 'application/json',
          },
          cacheKey,
          cacheTTL: 10 * 60 * 1000, // 10분 캐시
        }
      );

      return this.parseNotice(data);
    } catch (error) {
      if (error instanceof APIClientError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 계량기/측정기기 관련 공고 검색
   */
  async searchFlowMeterTenders(options: {
    fromDate?: Date;
    toDate?: Date;
    countries?: string[];
  } = {}): Promise<TEDNotice[]> {
    // 유량계/계량기 관련 CPV 코드
    const flowMeterCPVCodes = [
      '38410000', // 계량기
      '38411000', // 수도계량기
      '38421000', // 유량측정장비
      '38421100', // 물 계량기
      '38421110', // 유량계
      '38423000', // 계량장치
      '38550000', // 미터
      '38551000', // 에너지 미터
    ];

    const fromDate = options.fromDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30일 전
    const toDate = options.toDate ?? new Date();

    const result = await this.searchNotices({
      cpvCodes: flowMeterCPVCodes,
      publicationDate: {
        from: this.formatDate(fromDate),
        to: this.formatDate(toDate),
      },
      contractType: 'supplies',
      pageSize: 100,
    });

    // 국가 필터링 (옵션)
    if (options.countries && options.countries.length > 0) {
      return result.notices.filter((notice) =>
        options.countries!.includes(notice.buyerCountry)
      );
    }

    return result.notices;
  }

  // ============================================================================
  // Private 메서드
  // ============================================================================

  private buildSearchQuery(params: TEDSearchParams): Record<string, unknown> {
    const query: Record<string, unknown> = {
      page: {
        number: params.pageNum ?? 1,
        size: params.pageSize ?? 20,
      },
      fields: [
        'notice-id',
        'publication-number',
        'title',
        'buyer-name',
        'buyer-country',
        'publication-date',
        'deadline',
        'estimated-value',
        'cpv-codes',
        'contract-type',
        'procedure-type',
        'ted-url',
      ],
    };

    // 검색 조건 구성
    const conditions: string[] = [];

    if (params.query) {
      conditions.push(`(title:${params.query} OR description:${params.query})`);
    }

    if (params.publicationDate?.from) {
      conditions.push(`publication-date>=${params.publicationDate.from}`);
    }

    if (params.publicationDate?.to) {
      conditions.push(`publication-date<=${params.publicationDate.to}`);
    }

    if (params.contractType) {
      const typeMap = { supplies: 'SUPPLIES', services: 'SERVICES', works: 'WORKS' };
      conditions.push(`contract-type=${typeMap[params.contractType]}`);
    }

    if (params.country) {
      conditions.push(`buyer-country=${params.country}`);
    }

    if (params.cpvCodes && params.cpvCodes.length > 0) {
      const cpvCondition = params.cpvCodes.map((c) => `cpv-codes:${c}*`).join(' OR ');
      conditions.push(`(${cpvCondition})`);
    }

    if (conditions.length > 0) {
      query.query = conditions.join(' AND ');
    }

    return query;
  }

  private parseSearchResponse(data: Record<string, unknown>): TEDSearchResponse {
    const notices = (data.notices as unknown[]) ?? [];

    return {
      total: (data.total as number) ?? 0,
      pageNum: (data.page as { number?: number })?.number ?? 1,
      pageSize: (data.page as { size?: number })?.size ?? 20,
      notices: notices.map((n) => this.parseNotice(n as Record<string, unknown>)),
    };
  }

  private parseNotice(data: Record<string, unknown>): TEDNotice {
    return {
      noticeId: String(data['notice-id'] ?? data.noticeId ?? ''),
      title: String(data.title ?? ''),
      buyerName: String(data['buyer-name'] ?? data.buyerName ?? ''),
      buyerCountry: String(data['buyer-country'] ?? data.buyerCountry ?? ''),
      publicationDate: String(data['publication-date'] ?? data.publicationDate ?? ''),
      deadline: String(data.deadline ?? ''),
      estimatedValue: data['estimated-value']
        ? {
            amount: Number((data['estimated-value'] as Record<string, unknown>).amount ?? 0),
            currency: String((data['estimated-value'] as Record<string, unknown>).currency ?? 'EUR'),
          }
        : undefined,
      cpvCodes: (data['cpv-codes'] as string[]) ?? [],
      contractType: String(data['contract-type'] ?? data.contractType ?? ''),
      procedureType: String(data['procedure-type'] ?? data.procedureType ?? ''),
      url: String(data['ted-url'] ?? data.url ?? ''),
      description: data.description ? String(data.description) : undefined,
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }
}

// ============================================================================
// TED 공고 → BidData 변환
// ============================================================================

export function convertTEDToBidData(notice: TEDNotice): CreateInput<BidData> {
  return {
    source: 'ted' as BidSource,
    externalId: notice.noticeId,
    title: notice.title,
    organization: `${notice.buyerName} (${notice.buyerCountry})`,
    deadline: new Date(notice.deadline).toISOString() as ISODateString,
    estimatedAmount: notice.estimatedValue
      ? BigInt(Math.round(notice.estimatedValue.amount)) as KRW
      : null,
    status: 'new',
    priority: determinePriority(notice),
    type: mapContractType(notice.contractType),
    keywords: [...notice.cpvCodes, notice.contractType, notice.buyerCountry],
    url: notice.url,
    rawData: {
      cpvCodes: notice.cpvCodes,
      procedureType: notice.procedureType,
      publicationDate: notice.publicationDate,
      description: notice.description,
      currency: notice.estimatedValue?.currency,
    },
  };
}

function determinePriority(notice: TEDNotice): 'high' | 'medium' | 'low' {
  // 유량계/계량기 관련 CPV 코드가 있으면 높은 우선순위
  const highPriorityCPV = ['38411', '38421', '38410'];
  const hasHighPriorityCPV = notice.cpvCodes.some((cpv) =>
    highPriorityCPV.some((prefix) => cpv.startsWith(prefix))
  );

  if (hasHighPriorityCPV) return 'high';

  // 금액이 큰 경우 중간 우선순위
  if (notice.estimatedValue && notice.estimatedValue.amount > 100000) {
    return 'medium';
  }

  return 'low';
}

function mapContractType(tedType: string): BidData['type'] {
  const typeMap: Record<string, BidData['type']> = {
    SUPPLIES: 'product',
    SERVICES: 'service',
    WORKS: 'construction',
  };
  return typeMap[tedType.toUpperCase()] ?? 'product';
}

// ============================================================================
// 싱글톤 인스턴스
// ============================================================================

let tedClient: TEDAPIClient | null = null;

export function getTEDClient(): TEDAPIClient {
  if (!tedClient) {
    tedClient = new TEDAPIClient();
  }
  return tedClient;
}
