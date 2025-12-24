/**
 * @route /api/v1/stats
 * @description 대시보드 통계 API
 */

import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/security/auth-middleware';
import { withRateLimit, getEndpointIdentifier } from '@/lib/security/rate-limiter';
import { getDashboardStats } from '@/lib/domain/usecases/bid-usecases';
import type { ApiResponse } from '@forge-labs/types/bidding';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// GET /api/v1/stats - 대시보드 통계 조회
// ============================================================================

async function handleGet(request: AuthenticatedRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Multi-tenant 격리: tenantId 전달
    const result = await getDashboardStats(request.tenantId);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error('GET /api/v1/stats 오류:', error);
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
