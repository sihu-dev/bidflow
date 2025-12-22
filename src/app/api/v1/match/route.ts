/**
 * @route /api/v1/match
 * @description 하이브리드 매칭 API (규칙 + 시맨틱)
 *
 * POST /api/v1/match
 * - bidId: 입찰 공고 ID (DB에서 조회)
 * - query: 검색 쿼리 (직접 시맨틱 검색)
 *
 * Rate Limit: 10 requests/minute (ai type)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import {
  hybridMatch,
  searchBids,
  searchProducts,
  getEmbeddingStats,
} from '@/lib/matching/semantic-matcher';

// ============================================================================
// 요청 스키마
// ============================================================================

const MatchRequestSchema = z.object({
  // Option 1: 입찰 ID로 매칭
  bidId: z.string().uuid().optional(),

  // Option 2: 쿼리로 검색
  query: z.string().min(2).optional(),

  // 검색 타입
  type: z.enum(['bid', 'product', 'match']).default('match'),

  // 옵션
  tenantId: z.string().uuid().optional(),
  threshold: z.number().min(0).max(1).default(0.6),
  limit: z.number().min(1).max(50).default(10),
}).refine(
  (data) => data.bidId || data.query,
  { message: 'bidId 또는 query가 필요합니다' }
);

// ============================================================================
// API 핸들러
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate Limit 체크
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const rateLimitResult = await checkRateLimit(ip, 'ai');

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          success: false,
          error: `요청 한도를 초과했습니다. ${retryAfter}초 후에 다시 시도해 주세요.`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.reset),
            'Retry-After': String(retryAfter),
          },
        }
      );
    }

    // 요청 파싱
    const body = await request.json();
    const parseResult = MatchRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.errors[0]?.message || '잘못된 요청 형식',
        },
        { status: 400 }
      );
    }

    const { bidId, query, type, tenantId, threshold, limit } = parseResult.data;

    // 타입별 처리
    let result: unknown;

    switch (type) {
      case 'match':
        // 입찰-제품 하이브리드 매칭
        if (!bidId) {
          return NextResponse.json(
            { success: false, error: 'match 타입은 bidId가 필요합니다' },
            { status: 400 }
          );
        }
        result = await hybridMatch(bidId, { tenantId, threshold });
        break;

      case 'bid':
        // 입찰 공고 시맨틱 검색
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'bid 검색은 query가 필요합니다' },
            { status: 400 }
          );
        }
        result = await searchBids(query, { threshold, limit });
        break;

      case 'product':
        // 제품 시맨틱 검색
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'product 검색은 query가 필요합니다' },
            { status: 400 }
          );
        }
        result = await searchProducts(query, { tenantId, threshold, limit });
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[Match API] 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '서버 오류',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET: 임베딩 통계
// ============================================================================

export async function GET(): Promise<NextResponse> {
  try {
    const stats = await getEmbeddingStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[Match API] 통계 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '서버 오류',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS (CORS Preflight)
// ============================================================================

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
