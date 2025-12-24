import { logger } from '@/lib/utils/logger';
/**
 * @route /api/v1/bids
 * @description 입찰 목록 조회 및 생성 API
 */

import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/security/auth-middleware';
import { withRateLimit, getEndpointIdentifier } from '@/lib/security/rate-limiter';
import { withCSRF } from '@/lib/security/csrf';
import { listBidsQuerySchema, createBidSchema } from '@/lib/validation/schemas';
import { listBids, createBid } from '@/lib/domain/usecases/bid-usecases';
import type { ApiResponse, BidData, PaginatedResult, CreateInput } from '@forge-labs/types/bidding';

// BigInt를 JSON 직렬화 가능하게 변환
function serializeForJson<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))
  );
}

// ============================================================================
// GET /api/v1/bids - 입찰 목록 조회
// ============================================================================

async function handleGet(request: AuthenticatedRequest): Promise<NextResponse<ApiResponse<PaginatedResult<BidData>>>> {
  try {
    // 쿼리 파라미터 파싱
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    // 유효성 검증
    const parseResult = listBidsQuerySchema.safeParse(queryParams);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '잘못된 요청 파라미터입니다',
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { page, limit, sortBy, sortOrder, ...filters } = parseResult.data;

    // 비즈니스 로직 실행 (tenantId 추가 - Multi-tenant 격리)
    const result = await listBids({
      filters: { ...filters, tenantId: request.tenantId },
      sort: sortBy ? { field: sortBy as 'deadline', direction: sortOrder } : undefined,
      page,
      limit,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(serializeForJson(result));
  } catch (error) {
    logger.error('GET /api/v1/bids 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/v1/bids - 입찰 생성
// ============================================================================

async function handlePost(request: AuthenticatedRequest): Promise<NextResponse<ApiResponse<BidData>>> {
  try {
    // 요청 본문 파싱
    const body = await request.json();

    // 유효성 검증
    const parseResult = createBidSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '잘못된 요청 데이터입니다',
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    // 비즈니스 로직 실행 (Zod 출력을 Branded Type으로 캐스팅)
    const result = await createBid(parseResult.data as unknown as CreateInput<BidData>);

    if (!result.success) {
      const status = result.error.code === 'DUPLICATE' ? 409 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(serializeForJson(result), { status: 201 });
  } catch (error) {
    logger.error('POST /api/v1/bids 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// 라우트 익스포트 (미들웨어 적용)
// ============================================================================

// GET: 인증 필요, Rate Limit 적용
export const GET = withRateLimit(
  withAuth(handleGet, { requireAuth: true, allowedRoles: ['admin', 'user', 'viewer'] }),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);

// POST: 인증 필요, CSRF 보호, Rate Limit 적용
export const POST = withRateLimit(
  withCSRF(
    withAuth(handlePost, { requireAuth: true, allowedRoles: ['admin', 'user'] })
  ),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);
