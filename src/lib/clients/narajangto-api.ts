/**
 * 나라장터 (G2B) API 클라이언트
 * 공공데이터포털 입찰공고 정보 API
 * https://www.data.go.kr/data/15000766/openapi.do
 */

import { z } from 'zod';
import { logger } from '@/lib/utils/logger';
import { checkCrawlingRateLimit } from '../security/rate-limiter';
import { BaseAPIClient, APIClientError } from './base-api-client';

// ============================================================================
// 타입 정의
// ============================================================================

/** 나라장터 입찰공고 응답 스키마 */
const BidNoticeSchema = z.object({
  bidNtceNo: z.string(),              // 입찰공고번호
  bidNtceOrd: z.string().optional(),  // 입찰공고차수
  reNtceYn: z.string().optional(),    // 재공고여부
  bidNtceNm: z.string(),              // 입찰공고명
  ntceInsttNm: z.string(),            // 공고기관명
  dminsttNm: z.string().optional(),   // 수요기관명
  bidNtceDt: z.string().optional(),   // 입찰공고일시
  bidClseDt: z.string(),              // 입찰마감일시
  opengDt: z.string().optional(),     // 개찰일시
  ntceKindNm: z.string().optional(),  // 공고종류
  intrbidYn: z.string().optional(),   // 국제입찰여부
  bidMethdNm: z.string().optional(),  // 입찰방식
  cntrctMthdNm: z.string().optional(), // 계약방법
  presmptPrce: z.number().nullable().optional(), // 추정가격
  asignBdgtAmt: z.number().nullable().optional(), // 배정예산액
  bidNtceDtlUrl: z.string().optional(), // 상세URL
  bidNtceUrl: z.string().optional(),   // 공고URL
  rgstDt: z.string().optional(),       // 등록일시
});

export type BidNotice = z.infer<typeof BidNoticeSchema>;

/** API 응답 스키마 */
const ApiResponseSchema = z.object({
  response: z.object({
    header: z.object({
      resultCode: z.string(),
      resultMsg: z.string(),
    }),
    body: z.object({
      items: z.array(BidNoticeSchema).nullable().optional(),
      numOfRows: z.number(),
      pageNo: z.number(),
      totalCount: z.number(),
    }),
  }),
});

/** 검색 옵션 */
export interface SearchOptions {
  keywords?: string[];
  fromDate?: Date;
  toDate?: Date;
  pageNo?: number;
  numOfRows?: number;
}

/** BIDFLOW Bid 타입으로 변환된 결과 */
export interface MappedBid {
  source: 'narajangto';
  external_id: string;
  title: string;
  organization: string;
  deadline: Date;
  estimated_amount: number | null;
  url: string | null;
  type: 'product' | 'service';
  status: 'new';
  keywords: string[];
  raw_data: BidNotice;
}

// ============================================================================
// 클라이언트 구현
// ============================================================================

export class NaraJangtoClient extends BaseAPIClient {
  protected readonly source = 'NaraJangto';
  protected readonly baseUrl = 'http://apis.data.go.kr/1230000';
  private readonly apiKey: string;

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.NARA_JANGTO_API_KEY || '';

    if (!this.apiKey) {
      logger.warn('[NaraJangtoClient] API Key가 설정되지 않았습니다.');
    }
  }

  /**
   * 물품 입찰공고 검색
   */
  async searchProductBids(options: SearchOptions = {}): Promise<BidNotice[]> {
    // Rate Limit 체크
    const rateLimitResult = await checkCrawlingRateLimit('narajangto');
    if (!rateLimitResult.success) {
      throw new APIClientError(
        `나라장터 API Rate Limit 초과: ${rateLimitResult.reset - Date.now()}ms 후 재시도`,
        this.source,
        429,
        true
      );
    }

    const {
      keywords = [],
      fromDate,
      toDate,
      pageNo = 1,
      numOfRows = 100,
    } = options;

    const url = new URL(`${this.baseUrl}/BidPublicInfoService04/getBidPblancListInfoThng`);

    url.searchParams.set('serviceKey', this.apiKey);
    url.searchParams.set('pageNo', String(pageNo));
    url.searchParams.set('numOfRows', String(numOfRows));
    url.searchParams.set('type', 'json');

    if (fromDate) {
      url.searchParams.set('inqryBgnDt', this.formatDate(fromDate));
    }
    if (toDate) {
      url.searchParams.set('inqryEndDt', this.formatDate(toDate));
    }
    if (keywords.length > 0) {
      url.searchParams.set('bidNtceNm', keywords[0]); // 첫 번째 키워드만 사용
    }

    // 캐시 키 생성
    const cacheKey = `narajangto:product:${url.searchParams.toString()}`;

    try {
      const data = await this.fetchWithRetry<unknown>(url.toString(), {
        cacheKey,
        cacheTTL: 5 * 60 * 1000, // 5분 캐시
      });

      const parsed = ApiResponseSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('[NaraJangtoClient] 응답 파싱 실패:', parsed.error);
        return [];
      }

      return parsed.data.response.body.items || [];
    } catch (error) {
      logger.error('[NaraJangtoClient] API 호출 실패:', error);
      throw error;
    }
  }

  /**
   * 용역 입찰공고 검색
   */
  async searchServiceBids(options: SearchOptions = {}): Promise<BidNotice[]> {
    // Rate Limit 체크
    const rateLimitResult = await checkCrawlingRateLimit('narajangto');
    if (!rateLimitResult.success) {
      throw new APIClientError(
        `나라장터 API Rate Limit 초과`,
        this.source,
        429,
        true
      );
    }

    const {
      keywords = [],
      fromDate,
      toDate,
      pageNo = 1,
      numOfRows = 100,
    } = options;

    const url = new URL(`${this.baseUrl}/BidPublicInfoService04/getBidPblancListInfoServc`);

    url.searchParams.set('serviceKey', this.apiKey);
    url.searchParams.set('pageNo', String(pageNo));
    url.searchParams.set('numOfRows', String(numOfRows));
    url.searchParams.set('type', 'json');

    if (fromDate) {
      url.searchParams.set('inqryBgnDt', this.formatDate(fromDate));
    }
    if (toDate) {
      url.searchParams.set('inqryEndDt', this.formatDate(toDate));
    }
    if (keywords.length > 0) {
      url.searchParams.set('bidNtceNm', keywords[0]);
    }

    // 캐시 키 생성
    const cacheKey = `narajangto:service:${url.searchParams.toString()}`;

    try {
      const data = await this.fetchWithRetry<unknown>(url.toString(), {
        cacheKey,
        cacheTTL: 5 * 60 * 1000,
      });

      const parsed = ApiResponseSchema.safeParse(data);

      if (!parsed.success) {
        logger.error('[NaraJangtoClient] 응답 파싱 실패:', parsed.error);
        return [];
      }

      return parsed.data.response.body.items || [];
    } catch (error) {
      logger.error('[NaraJangtoClient] API 호출 실패:', error);
      throw error;
    }
  }

  /**
   * 유량계/계측기 관련 입찰 검색 (씨엠엔텍 전용)
   */
  async searchFlowMeterBids(options?: Omit<SearchOptions, 'keywords'>): Promise<MappedBid[]> {
    const flowMeterKeywords = [
      '유량계',
      '초음파유량계',
      '전자유량계',
      '계측기',
      '수도미터',
      '열량계',
      '수도계량기',
      '유량측정',
    ];

    const allResults: BidNotice[] = [];
    const seen = new Set<string>();

    // 각 키워드로 검색
    for (const keyword of flowMeterKeywords) {
      try {
        const results = await this.searchProductBids({
          keywords: [keyword],
          ...options,
        });

        // 중복 제거
        for (const bid of results) {
          const key = `${bid.bidNtceNo}-${bid.bidNtceOrd || '0'}`;
          if (!seen.has(key)) {
            seen.add(key);
            allResults.push(bid);
          }
        }

        // Rate limit 방지 - 베이스 클라이언트의 delay 사용
        await this.delay(200);
      } catch (error) {
        logger.warn(`[NaraJangtoClient] 키워드 "${keyword}" 검색 실패: ${error instanceof Error ? error.message : String(error)}`);
        // 일부 키워드 실패해도 계속 진행
      }
    }

    // BIDFLOW 형식으로 변환
    return allResults.map(notice => this.mapToBid(notice, 'product'));
  }

  /**
   * 나라장터 응답을 BIDFLOW Bid 형식으로 변환
   */
  mapToBid(notice: BidNotice, type: 'product' | 'service' = 'product'): MappedBid {
    // 키워드 추출
    const keywords = this.extractKeywords(notice.bidNtceNm);

    return {
      source: 'narajangto',
      external_id: `${notice.bidNtceNo}-${notice.bidNtceOrd || '0'}`,
      title: notice.bidNtceNm,
      organization: notice.ntceInsttNm || notice.dminsttNm || '미상',
      deadline: this.parseDate(notice.bidClseDt),
      estimated_amount: notice.presmptPrce || notice.asignBdgtAmt || null,
      url: notice.bidNtceDtlUrl || notice.bidNtceUrl || null,
      type,
      status: 'new',
      keywords,
      raw_data: notice,
    };
  }

  /**
   * 제목에서 키워드 추출
   */
  private extractKeywords(title: string): string[] {
    const keywordPatterns = [
      '유량계', '초음파', '전자식', '계측기', '수도미터',
      '열량계', '밸브', '펌프', '배관', '상수도', '하수도',
      '정수장', '취수장', '관로', '계량기',
    ];

    return keywordPatterns.filter(kw => title.includes(kw));
  }

  /**
   * 날짜 포맷팅 (YYYYMMDD)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * 날짜 파싱
   */
  private parseDate(dateStr: string): Date {
    // 형식: "2025/01/15 18:00" 또는 "20250115"
    if (dateStr.includes('/')) {
      return new Date(dateStr.replace(/\//g, '-'));
    }

    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    const hour = dateStr.slice(8, 10) || '00';
    const min = dateStr.slice(10, 12) || '00';

    return new Date(`${year}-${month}-${day}T${hour}:${min}:00`);
  }
}

// ============================================================================
// 싱글톤 인스턴스
// ============================================================================

let clientInstance: NaraJangtoClient | null = null;

export function getNaraJangtoClient(): NaraJangtoClient {
  if (!clientInstance) {
    clientInstance = new NaraJangtoClient();
  }
  return clientInstance;
}
