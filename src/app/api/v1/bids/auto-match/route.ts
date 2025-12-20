/**
 * @route /api/v1/bids/auto-match
 * @description 전체 신규 입찰 자동 매칭 API
 */

import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/security/auth-middleware';
import { withRateLimit, getEndpointIdentifier } from '@/lib/security/rate-limiter';
import { withCSRF } from '@/lib/security/csrf';
import { autoMatchNewBids } from '@/lib/domain/usecases/bid-usecases';
import type { ApiResponse } from '@forge-labs/types/bidding';

// ============================================================================
// POST /api/v1/bids/auto-match - 전체 자동 매칭 실행
// ============================================================================

async function handlePost(
  _request: AuthenticatedRequest
): Promise<NextResponse<ApiResponse<{ processed: number; matched: number }>>> {
  try {
    const result = await autoMatchNewBids();

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/v1/bids/auto-match 오류:', error);
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
  withCSRF(
    withAuth(handlePost, { requireAuth: true, allowedRoles: ['admin', 'user'] })
  ),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);
