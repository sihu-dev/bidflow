/**
 * @route /api/v1/crawl
 * @description 크롤링 트리거 API
 */

import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/security/auth-middleware';
import { withRateLimit, getEndpointIdentifier } from '@/lib/security/rate-limiter';
import { withCSRF } from '@/lib/security/csrf';
import { inngest } from '@/inngest/client';
import { z } from 'zod';
import type { ApiResponse } from '@forge-labs/types/bidding';
import { logger } from '@/lib/utils/logger';

// ============================================================================
// 요청 스키마
// ============================================================================

const crawlRequestSchema = z.object({
  source: z.enum(['narajangto', 'ted', 'sam', 'kepco', 'all']).default('all'),
  keywords: z.array(z.string()).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

// ============================================================================
// GET /api/v1/crawl - 크롤링 상태 조회
// ============================================================================

async function handleGet(): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // 마지막 크롤링 정보 반환 (실제로는 DB에서 조회)
    return NextResponse.json({
      success: true,
      data: {
        lastCrawlAt: new Date().toISOString(),
        scheduledCrawls: [
          { time: '09:00', description: '정기 크롤링 1차' },
          { time: '15:00', description: '정기 크롤링 2차' },
          { time: '21:00', description: '정기 크롤링 3차' },
        ],
        availableSources: ['narajangto', 'ted', 'sam', 'kepco'],
        status: 'idle',
      },
    });
  } catch (error) {
    logger.error('GET /api/v1/crawl 오류:', error);
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
// POST /api/v1/crawl - 수동 크롤링 트리거
// ============================================================================

async function handlePost(
  request: AuthenticatedRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const body = await request.json();

    // 입력 검증
    const parseResult = crawlRequestSchema.safeParse(body);
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

    const { source, keywords, fromDate, toDate } = parseResult.data;

    // Inngest 이벤트 발송
    await inngest.send({
      name: 'bid/crawl.requested',
      data: {
        source,
        keywords,
        fromDate,
        toDate,
        requestedBy: request.userId,
        requestedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: '크롤링이 시작되었습니다',
        source,
        status: 'queued',
        estimatedTime: '1-5분',
      },
    });
  } catch (error) {
    logger.error('POST /api/v1/crawl 오류:', error);
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
  withAuth(handleGet, { requireAuth: true, allowedRoles: ['admin', 'user'] }),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);

export const POST = withRateLimit(
  withCSRF(
    withAuth(handlePost, { requireAuth: true, allowedRoles: ['admin'] })
  ),
  { type: 'api', getIdentifier: getEndpointIdentifier }
);
