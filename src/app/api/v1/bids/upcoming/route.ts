/**
 * @route /api/v1/bids/upcoming
 * @description 마감 임박 입찰 조회 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/security/auth-middleware';
import { withRateLimit, getEndpointIdentifier } from '@/lib/security/rate-limiter';
import { getUpcomingDeadlines } from '@/lib/domain/usecases/bid-usecases';
import { z } from 'zod';
import type { ApiResponse, BidData } from '@forge-labs/types/bidding';

// BigInt를 JSON 직렬화 가능하게 변환
function serializeForJson<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))
  );
}

const querySchema = z.object({
  days: z.coerce.number().min(1).max(30).default(7),
});

// ============================================================================
// GET /api/v1/bids/upcoming - 마감 임박 입찰 조회
// ============================================================================

async function handleGet(request: NextRequest): Promise<NextResponse<ApiResponse<BidData[]>>> {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parseResult = querySchema.safeParse(queryParams);
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

    const result = await getUpcomingDeadlines(parseResult.data.days);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(serializeForJson(result));
  } catch (error) {
    console.error('GET /api/v1/bids/upcoming 오류:', error);
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

export const GET = withRateLimit(
  withAuth(handleGet, { requireAuth: true, allowedRoles: ['admin', 'user', 'viewer'] }),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);
