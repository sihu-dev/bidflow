/**
 * @route /api/v1/bids/[id]
 * @description 입찰 상세 조회, 수정, 삭제 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/security/auth-middleware';
import { withRateLimit, getEndpointIdentifier } from '@/lib/security/rate-limiter';
import { withCSRF } from '@/lib/security/csrf';
import { uuidSchema, updateBidSchema } from '@/lib/validation/schemas';
import { getBidById, updateBidStatus } from '@/lib/domain/usecases/bid-usecases';
import { getBidRepository } from '@/lib/domain/repositories/bid-repository';
import type { ApiResponse, BidData, UUID } from '@forge-labs/types/bidding';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================================================
// GET /api/v1/bids/[id] - 입찰 상세 조회
// ============================================================================

async function handleGet(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<BidData>>> {
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

    // 비즈니스 로직 실행
    const result = await getBidById(id as UUID);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/v1/bids/[id] 오류:', error);
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
// PATCH /api/v1/bids/[id] - 입찰 수정
// ============================================================================

async function handlePatch(
  request: AuthenticatedRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<BidData>>> {
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

    // 요청 본문 파싱
    const body = await request.json();

    // 유효성 검증
    const parseResult = updateBidSchema.safeParse(body);
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

    // 상태 변경인 경우 유효성 검사 포함 처리
    if (parseResult.data.status) {
      const result = await updateBidStatus(id as UUID, parseResult.data.status);
      if (!result.success) {
        const status = result.error.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json(result, { status });
      }
      return NextResponse.json(result);
    }

    // 일반 업데이트
    const repository = getBidRepository();
    const result = await repository.update(id as UUID, parseResult.data);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('PATCH /api/v1/bids/[id] 오류:', error);
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
// DELETE /api/v1/bids/[id] - 입찰 삭제
// ============================================================================

async function handleDelete(
  request: AuthenticatedRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
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

    // 권한 확인 (admin만 삭제 가능)
    if (request.userRole !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '삭제 권한이 없습니다',
          },
        },
        { status: 403 }
      );
    }

    // 비즈니스 로직 실행
    const repository = getBidRepository();
    const result = await repository.delete(id as UUID);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('DELETE /api/v1/bids/[id] 오류:', error);
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

export const GET = withRateLimit(
  withAuth(
    (req: NextRequest) => handleGet(req, { params: Promise.resolve({ id: req.url.split('/').pop() || '' }) }),
    { requireAuth: true, allowedRoles: ['admin', 'user', 'viewer'] }
  ),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);

export const PATCH = withRateLimit(
  withCSRF(
    withAuth(
      (req: NextRequest) => handlePatch(req as AuthenticatedRequest, { params: Promise.resolve({ id: req.url.split('/').pop() || '' }) }),
      { requireAuth: true, allowedRoles: ['admin', 'user'] }
    )
  ),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);

export const DELETE = withRateLimit(
  withCSRF(
    withAuth(
      (req: NextRequest) => handleDelete(req as AuthenticatedRequest, { params: Promise.resolve({ id: req.url.split('/').pop() || '' }) }),
      { requireAuth: true, allowedRoles: ['admin'] }
    )
  ),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);
