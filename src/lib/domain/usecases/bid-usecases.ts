/**
 * @module domain/usecases/bid-usecases
 * @description 입찰 비즈니스 로직 (Use Cases)
 */

import type {
  BidData,
  UUID,
  BidStatus,
  ApiResponse,
  ProductMatch,
  PaginatedResult,
  CreateInput,
} from '@forge-labs/types/bidding';
import { getBidRepository, type BidFilters, type BidSortOptions } from '../repositories/bid-repository';
import { matchProducts } from '../../clients/product-matcher';
import { validatePromptInput, sanitizeInput } from '../../security/prompt-guard';

// ============================================================================
// 입찰 조회 Use Cases
// ============================================================================

/**
 * 입찰 목록 조회
 */
export async function listBids(params: {
  filters?: BidFilters;
  sort?: BidSortOptions;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<PaginatedResult<BidData>>> {
  const repository = getBidRepository();
  return repository.findAll(params.filters, params.sort, {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  });
}

/**
 * 입찰 상세 조회
 */
export async function getBidById(id: UUID): Promise<ApiResponse<BidData>> {
  const repository = getBidRepository();
  return repository.findById(id);
}

/**
 * 마감 임박 입찰 조회
 */
export async function getUpcomingDeadlines(days: number = 7): Promise<ApiResponse<BidData[]>> {
  const repository = getBidRepository();
  return repository.findUpcoming(days);
}

// ============================================================================
// 입찰 생성/수정 Use Cases
// ============================================================================

/**
 * 입찰 생성 (중복 체크 포함)
 */
export async function createBid(
  input: CreateInput<BidData>
): Promise<ApiResponse<BidData>> {
  const repository = getBidRepository();

  // 입력 정제
  const sanitizedInput = {
    ...input,
    title: sanitizeInput(input.title),
    organization: sanitizeInput(input.organization),
  };

  // 중복 체크
  const existing = await repository.findByExternalId(input.source, input.externalId);
  if (existing.success && existing.data) {
    return {
      success: false,
      error: {
        code: 'DUPLICATE',
        message: '이미 등록된 입찰 공고입니다',
        details: { existingId: existing.data.id },
      },
    };
  }

  return repository.create(sanitizedInput);
}

/**
 * 입찰 상태 변경
 */
export async function updateBidStatus(
  id: UUID,
  status: BidStatus,
  _notes?: string
): Promise<ApiResponse<BidData>> {
  // TODO: notes will be used for status change history
  const repository = getBidRepository();

  // 상태 전이 유효성 검사
  const current = await repository.findById(id);
  if (!current.success) {
    return current;
  }

  const validTransitions: Record<BidStatus, BidStatus[]> = {
    new: ['reviewing', 'cancelled'],
    reviewing: ['preparing', 'cancelled'],
    preparing: ['submitted', 'cancelled'],
    submitted: ['won', 'lost'],
    won: [],
    lost: [],
    cancelled: [],
  };

  const currentStatus = current.data.status;
  if (!validTransitions[currentStatus].includes(status)) {
    return {
      success: false,
      error: {
        code: 'INVALID_TRANSITION',
        message: `'${currentStatus}'에서 '${status}'로 변경할 수 없습니다`,
      },
    };
  }

  return repository.updateStatus(id, status);
}

// ============================================================================
// 제품 매칭 Use Cases
// ============================================================================

/**
 * 입찰에 대한 제품 매칭 실행
 */
export async function matchProductsForBid(bidId: UUID): Promise<
  ApiResponse<{
    bid: BidData;
    matches: ProductMatch[];
  }>
> {
  const repository = getBidRepository();
  const bidResult = await repository.findById(bidId);

  if (!bidResult.success) {
    return bidResult as ApiResponse<never>;
  }

  const bid = bidResult.data;
  const matches = matchProducts(bid);

  return {
    success: true,
    data: { bid, matches },
  };
}

/**
 * 모든 신규 입찰에 대해 자동 매칭 실행
 */
export async function autoMatchNewBids(): Promise<
  ApiResponse<{
    processed: number;
    matched: number;
  }>
> {
  const repository = getBidRepository();
  const bidsResult = await repository.findAll(
    { status: 'new' },
    { field: 'createdAt', direction: 'desc' },
    { page: 1, limit: 100 }
  );

  if (!bidsResult.success) {
    return bidsResult as ApiResponse<never>;
  }

  let matched = 0;
  for (const bid of bidsResult.data.items) {
    const matches = matchProducts(bid);
    if (matches.length > 0) {
      matched++;
      // 매칭 결과를 파이프라인에 저장하는 로직은 별도 구현
    }
  }

  return {
    success: true,
    data: {
      processed: bidsResult.data.items.length,
      matched,
    },
  };
}

// ============================================================================
// AI 분석 Use Cases
// ============================================================================

interface AIAnalysisResult {
  summary: string;
  keyRequirements: string[];
  recommendedProducts: string[];
  riskFactors: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
}

/**
 * AI를 통한 입찰 분석
 */
export async function analyzeWithAI(bidId: UUID): Promise<ApiResponse<AIAnalysisResult>> {
  const repository = getBidRepository();
  const bidResult = await repository.findById(bidId);

  if (!bidResult.success) {
    return bidResult as ApiResponse<never>;
  }

  const bid = bidResult.data;

  // Prompt Injection 검증
  const validation = validatePromptInput(
    `${bid.title} ${bid.rawData.requirements ?? ''}`
  );

  if (!validation.isValid) {
    return {
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: '입력에 위험한 패턴이 감지되었습니다',
        details: { threats: validation.threats },
      },
    };
  }

  // 실제 AI 호출은 별도 클라이언트에서 처리
  // 여기서는 인터페이스만 정의
  return {
    success: true,
    data: {
      summary: `${bid.title} 입찰 분석 결과`,
      keyRequirements: [],
      recommendedProducts: [],
      riskFactors: [],
      estimatedEffort: 'medium',
    },
  };
}

// ============================================================================
// 대시보드 통계 Use Cases
// ============================================================================

interface DashboardStats {
  totalBids: number;
  byStatus: Record<BidStatus, number>;
  upcomingDeadlines: number;
  highPriority: number;
  wonRate: number;
  recentActivity: Array<{
    id: UUID;
    title: string;
    action: string;
    timestamp: string;
  }>;
}

/**
 * 대시보드 통계 조회 (최적화: DB 집계 쿼리 사용)
 */
export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  const repository = getBidRepository();

  // DB에서 집계 쿼리로 통계 조회 (N+1 해결)
  const statsResult = await repository.getStats();

  if (!statsResult.success) {
    return statsResult as ApiResponse<never>;
  }

  const stats = statsResult.data;

  // 최근 활동은 별도 쿼리 (5개만 가져옴)
  const recentBids = await repository.findAll(
    undefined,
    { field: 'createdAt', direction: 'desc' },
    { page: 1, limit: 5 }
  );

  const recentActivity = recentBids.success
    ? recentBids.data.items.map((bid: BidData) => ({
        id: bid.id,
        title: bid.title,
        action: `상태: ${bid.status}`,
        timestamp: bid.updatedAt,
      }))
    : [];

  return {
    success: true,
    data: {
      totalBids: stats.totalBids,
      byStatus: stats.byStatus,
      upcomingDeadlines: stats.upcomingDeadlines,
      highPriority: stats.highPriority,
      wonRate: stats.wonRate,
      recentActivity,
    },
  };
}

// ============================================================================
// 크롤링 데이터 처리 Use Case
// ============================================================================

/**
 * 크롤링된 데이터 일괄 처리 (최적화: 배치 조회로 N+1 해결)
 */
export async function processCrawledBids(
  source: BidData['source'],
  crawledData: Array<Omit<CreateInput<BidData>, 'source'>>
): Promise<
  ApiResponse<{
    created: number;
    updated: number;
    skipped: number;
  }>
> {
  const repository = getBidRepository();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  // 1. 모든 externalId를 한 번에 조회 (N+1 해결!)
  const externalIds = crawledData.map((item) => item.externalId);
  const existingResult = await repository.findByExternalIds(source, externalIds);

  if (!existingResult.success) {
    return existingResult as ApiResponse<never>;
  }

  // 2. externalId → BidData 맵 생성 (O(1) 조회)
  const existingMap = new Map<string, BidData>();
  for (const bid of existingResult.data) {
    existingMap.set(bid.externalId, bid);
  }

  // 3. 각 크롤링 데이터 처리 (메모리 맵 조회만)
  for (const item of crawledData) {
    const existingBid = existingMap.get(item.externalId);

    if (existingBid) {
      // 기존 데이터 업데이트 (변경사항 있는 경우만)
      if (
        existingBid.title !== item.title ||
        existingBid.deadline !== item.deadline
      ) {
        await repository.update(existingBid.id, item);
        updated++;
      } else {
        skipped++;
      }
    } else {
      // 새 데이터 생성
      const result = await repository.create({ ...item, source });
      if (result.success) {
        created++;
      }
    }
  }

  return {
    success: true,
    data: { created, updated, skipped },
  };
}
