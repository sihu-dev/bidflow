/**
 * @route /api/v1/bids/[id]/match
 * @description 입찰 제품 매칭 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/security/auth-middleware';
import { withRateLimit, getEndpointIdentifier } from '@/lib/security/rate-limiter';
import { matchProductsForBid } from '@/lib/domain/usecases/bid-usecases';
import { uuidSchema } from '@/lib/validation/schemas';
import type { ApiResponse, UUID, ProductMatch, BidData } from '@forge-labs/types/bidding';

// BigInt를 JSON 직렬화 가능하게 변환
function serializeForJson<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))
  );
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================================================
// POST /api/v1/bids/[id]/match - 제품 매칭 실행
// ============================================================================

async function handlePost(
  request: AuthenticatedRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ bid: BidData; matches: ProductMatch[] }>>> {
  try {
    const { id } = await params;

    // ID 유효성 검증
    const idResult = uuidSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: '유효하지 않은 ID 형식입니다',
          },
        },
        { status: 400 }
      );
    }

    // 제품 매칭 실행
    const result = await matchProductsForBid(id as UUID);

    if (!result.success) {
      const status = result.error.code === 'NOT_FOUND' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(serializeForJson(result));
  } catch (error) {
    console.error('POST /api/v1/bids/[id]/match 오류:', error);
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
// 라우트 익스포트
// ============================================================================

export const POST = withRateLimit(
  withAuth(
    (req: NextRequest) => handlePost(req as AuthenticatedRequest, { params: Promise.resolve({ id: req.url.split('/').slice(-2)[0] || '' }) }),
    { requireAuth: true, allowedRoles: ['admin', 'user'] }
  ),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);
