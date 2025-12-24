/**
 * @module clients/sam-gov-api
 * @description SAM.gov (System for Award Management) API 클라이언트
 * @see https://open.gsa.gov/api/sam-api-guide/
 */

import type { BidData, BidSource, CreateInput, ISODateString, KRW } from '@forge-labs/types/bidding';
import { checkCrawlingRateLimit } from '../security/rate-limiter';
import { logger } from '@/lib/utils/logger';
import { BaseAPIClient, APIClientError } from './base-api-client';

// ============================================================================
// SAM.gov API 타입 정의
// ============================================================================

interface SAMSearchParams {
  keywords?: string[];
  postedFrom?: string; // MM/DD/YYYY
  postedTo?: string;   // MM/DD/YYYY
  responseDeadlineFrom?: string;
  responseDeadlineTo?: string;
  naicsCode?: string[];  // NAICS 코드 (산업 분류)
  psc?: string[];        // Product Service Code
  setAside?: string;     // 중소기업 우대
  limit?: number;
  offset?: number;
  sortBy?: string;
}

interface SAMOpportunity {
  noticeId: string;
  title: string;
  solicitationNumber?: string;
  department?: string;
  subTier?: string;
  office?: string;
  postedDate: string;
  type?: string;
  baseType?: string;
  archiveType?: string;
  archiveDate?: string;
  setAside?: string;
  setAsideDescription?: string;
  responseDeadLine?: string;
  naicsCode?: string;
  naicsDescription?: string;
  classificationCode?: string;
  active: boolean;
  description?: string;
  organizationType?: string;
  additionalInfoLink?: string;
  uiLink?: string;
  links?: {
    self?: { href: string };
    related?: { href: string };
  }[];
  pointOfContact?: {
    fullName?: string;
    email?: string;
    phone?: string;
  }[];
  award?: {
    amount?: number;
    date?: string;
    awardee?: {
      name?: string;
      location?: {
        city?: string;
        state?: string;
        country?: string;
      };
    };
  };
}

interface SAMSearchResponse {
  totalRecords: number;
  limit: number;
  offset: number;
  opportunitiesData: SAMOpportunity[];
}

// ============================================================================
// SAM.gov API 클라이언트
// ============================================================================

export class SAMGovAPIClient extends BaseAPIClient {
  protected readonly source = 'SAM.gov';
  protected readonly baseUrl = 'https://api.sam.gov/opportunities/v2';
  private apiKey: string;

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.SAM_GOV_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('[SAM.gov] API 키가 설정되지 않았습니다. 일부 기능이 제한될 수 있습니다.');
    }
  }

  /**
   * 기회(Opportunity) 검색
   */
  async searchOpportunities(params: SAMSearchParams): Promise<SAMSearchResponse> {
    // Rate Limit 체크
    const rateLimitResult = await checkCrawlingRateLimit('sam');
    if (!rateLimitResult.success) {
      throw new APIClientError(
        `SAM.gov API Rate Limit 초과: ${rateLimitResult.reset - Date.now()}ms 후 재시도`,
        this.source,
        429,
        true
      );
    }

    const queryParams = this.buildQueryParams(params);
    const url = `${this.baseUrl}/search?${queryParams}`;

    // 캐시 키 생성
    const cacheKey = `sam:search:${queryParams}`;

    const data = await this.fetchWithRetry<Record<string, unknown>>(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // API 키는 Header로만 전송 (URL 노출 방지)
        ...(this.apiKey ? { 'X-Api-Key': this.apiKey } : {}),
      },
      cacheKey,
      cacheTTL: 5 * 60 * 1000, // 5분 캐시
    });

    return this.parseSearchResponse(data);
  }

  /**
   * 특정 기회 상세 조회
   */
  async getOpportunity(noticeId: string): Promise<SAMOpportunity | null> {
    const rateLimitResult = await checkCrawlingRateLimit('sam');
    if (!rateLimitResult.success) {
      throw new APIClientError('SAM.gov API Rate Limit 초과', this.source, 429, true);
    }

    const url = `${this.baseUrl}/${noticeId}`;
    const cacheKey = `sam:opportunity:${noticeId}`;

    try {
      const data = await this.fetchWithRetry<SAMOpportunity>(url, {
        headers: {
          'Accept': 'application/json',
          ...(this.apiKey ? { 'X-Api-Key': this.apiKey } : {}),
        },
        cacheKey,
        cacheTTL: 10 * 60 * 1000, // 10분 캐시
      });
      return data;
    } catch (error) {
      if (error instanceof APIClientError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 계량기/측정 장비 관련 기회 검색
   */
  async searchFlowMeterOpportunities(options: {
    fromDate?: Date;
    toDate?: Date;
  } = {}): Promise<SAMOpportunity[]> {
    // 유량계/계량기 관련 키워드
    const flowMeterKeywords = [
      'flow meter',
      'flowmeter',
      'water meter',
      'ultrasonic meter',
      'electromagnetic flowmeter',
      'meter calibration',
      'measurement equipment',
      'instrumentation',
      'sensor equipment',
    ];

    // 관련 NAICS 코드
    const relatedNAICS = [
      '334514', // 자동 환경 제어 제조
      '334516', // 분석 실험실 기기 제조
      '334519', // 기타 측정 및 제어 장치 제조
      '423830', // 산업 기계 및 장비 도매업
    ];

    const fromDate = options.fromDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = options.toDate ?? new Date();

    const result = await this.searchOpportunities({
      keywords: flowMeterKeywords,
      naicsCode: relatedNAICS,
      postedFrom: this.formatDate(fromDate),
      postedTo: this.formatDate(toDate),
      limit: 100,
    });

    return result.opportunitiesData;
  }

  /**
   * 중소기업 우대 기회 검색
   */
  async searchSmallBusinessOpportunities(keywords: string[]): Promise<SAMOpportunity[]> {
    const result = await this.searchOpportunities({
      keywords,
      setAside: 'SBA', // Small Business Administration
      limit: 50,
    });

    return result.opportunitiesData;
  }

  // ============================================================================
  // Private 메서드
  // ============================================================================

  private buildQueryParams(params: SAMSearchParams): string {
    const queryParts: string[] = [];

    if (params.keywords && params.keywords.length > 0) {
      queryParts.push(`keywords=${encodeURIComponent(params.keywords.join(' OR '))}`);
    }

    if (params.postedFrom) {
      queryParts.push(`postedFrom=${params.postedFrom}`);
    }

    if (params.postedTo) {
      queryParts.push(`postedTo=${params.postedTo}`);
    }

    if (params.responseDeadlineFrom) {
      queryParts.push(`rdlfrom=${params.responseDeadlineFrom}`);
    }

    if (params.responseDeadlineTo) {
      queryParts.push(`rdlto=${params.responseDeadlineTo}`);
    }

    if (params.naicsCode && params.naicsCode.length > 0) {
      queryParts.push(`ncode=${params.naicsCode.join(',')}`);
    }

    if (params.psc && params.psc.length > 0) {
      queryParts.push(`psc=${params.psc.join(',')}`);
    }

    if (params.setAside) {
      queryParts.push(`typeOfSetAside=${params.setAside}`);
    }

    queryParts.push(`limit=${params.limit ?? 25}`);
    queryParts.push(`offset=${params.offset ?? 0}`);

    if (params.sortBy) {
      queryParts.push(`sortBy=${params.sortBy}`);
    }

    // API 키는 URL에 포함하지 않음 (Header로만 전송)
    // 보안: URL에 API 키가 노출되면 로그/브라우저 히스토리에 기록됨

    return queryParts.join('&');
  }

  private parseSearchResponse(data: Record<string, unknown>): SAMSearchResponse {
    const opportunities = (data.opportunitiesData as unknown[]) ?? [];

    return {
      totalRecords: (data.totalRecords as number) ?? 0,
      limit: (data.limit as number) ?? 25,
      offset: (data.offset as number) ?? 0,
      opportunitiesData: opportunities as SAMOpportunity[],
    };
  }

  private formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
}

// ============================================================================
// SAM.gov → BidData 변환
// ============================================================================

export function convertSAMToBidData(opportunity: SAMOpportunity): CreateInput<BidData> {
  const organization = [opportunity.department, opportunity.subTier, opportunity.office]
    .filter(Boolean)
    .join(' > ') || 'US Government';

  return {
    source: 'sam' as BidSource,
    externalId: opportunity.noticeId,
    title: opportunity.title,
    organization,
    deadline: opportunity.responseDeadLine
      ? new Date(opportunity.responseDeadLine).toISOString() as ISODateString
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() as ISODateString,
    estimatedAmount: opportunity.award?.amount
      ? BigInt(Math.round(opportunity.award.amount * 1350)) as KRW // USD to KRW 근사 변환
      : null,
    status: 'new',
    priority: determinePriority(opportunity),
    type: mapOpportunityType(opportunity.baseType || opportunity.type),
    keywords: buildKeywords(opportunity),
    url: opportunity.uiLink || `https://sam.gov/opp/${opportunity.noticeId}/view`,
    rawData: {
      solicitationNumber: opportunity.solicitationNumber,
      naicsCode: opportunity.naicsCode,
      naicsDescription: opportunity.naicsDescription,
      setAside: opportunity.setAside,
      setAsideDescription: opportunity.setAsideDescription,
      postedDate: opportunity.postedDate,
      classificationCode: opportunity.classificationCode,
      pointOfContact: opportunity.pointOfContact,
    },
  };
}

function determinePriority(opportunity: SAMOpportunity): 'high' | 'medium' | 'low' {
  // 마감일이 가까우면 높은 우선순위
  if (opportunity.responseDeadLine) {
    const daysRemaining = Math.ceil(
      (new Date(opportunity.responseDeadLine).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );
    if (daysRemaining <= 7) return 'high';
    if (daysRemaining <= 14) return 'medium';
  }

  // 계량기 관련 NAICS 코드면 높은 우선순위
  const highPriorityNAICS = ['334514', '334516', '334519'];
  if (opportunity.naicsCode && highPriorityNAICS.includes(opportunity.naicsCode)) {
    return 'high';
  }

  // 중소기업 우대면 중간 우선순위
  if (opportunity.setAside) {
    return 'medium';
  }

  return 'low';
}

function mapOpportunityType(samType?: string): BidData['type'] {
  if (!samType) return 'product';

  const typeMap: Record<string, BidData['type']> = {
    'o': 'product',        // Solicitation
    'p': 'product',        // Presolicitation
    'r': 'product',        // Sources Sought
    's': 'service',        // Special Notice
    'g': 'service',        // Sale of Surplus Property
    'k': 'product',        // Combined Synopsis/Solicitation
    'i': 'service',        // Intent to Bundle Requirements
    'a': 'service',        // Award Notice
    'j': 'construction',   // Justification and Approval
    'u': 'service',        // Fair Opportunity / Limited Sources Justification
  };

  return typeMap[samType.toLowerCase()] ?? 'product';
}

function buildKeywords(opportunity: SAMOpportunity): string[] {
  const keywords: string[] = [];

  if (opportunity.naicsCode) {
    keywords.push(opportunity.naicsCode);
  }

  if (opportunity.naicsDescription) {
    keywords.push(opportunity.naicsDescription);
  }

  if (opportunity.classificationCode) {
    keywords.push(opportunity.classificationCode);
  }

  if (opportunity.setAside) {
    keywords.push(opportunity.setAside);
  }

  if (opportunity.department) {
    keywords.push(opportunity.department);
  }

  // 제목에서 키워드 추출
  const titleWords = opportunity.title.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const relevantWords = titleWords.filter((word) =>
    ['meter', 'flow', 'sensor', 'measurement', 'instrument', 'equipment'].some((kw) =>
      word.includes(kw)
    )
  );
  keywords.push(...relevantWords);

  return [...new Set(keywords)];
}

// ============================================================================
// 싱글톤 인스턴스
// ============================================================================

let samClient: SAMGovAPIClient | null = null;

export function getSAMGovClient(): SAMGovAPIClient {
  if (!samClient) {
    samClient = new SAMGovAPIClient();
  }
  return samClient;
}

// ============================================================================
// SAM.gov API 사용 가이드
// ============================================================================

/**
 * SAM.gov API 사용법
 *
 * 1. API 키 발급
 *    - https://api.sam.gov 에서 계정 생성
 *    - Entity Management 또는 Opportunities API 액세스 요청
 *
 * 2. 환경 변수 설정
 *    SAM_GOV_API_KEY=your_api_key_here
 *
 * 3. Rate Limiting
 *    - 기본: 1000 요청/일
 *    - 프리미엄: 10000 요청/일
 *
 * 4. 데이터 갱신
 *    - 공고 데이터는 매일 업데이트됨
 *    - 일일 크롤링 권장
 *
 * 5. 보안 주의사항
 *    - API 키는 절대 URL에 포함하지 말 것
 *    - Header (X-Api-Key)로만 전송
 */
