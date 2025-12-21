/**
 * @route /api/v1/ai/score
 * @description AI 입찰 적합도 점수 API
 *
 * POST /api/v1/ai/score
 * - bidId로 DB 조회하거나
 * - title, organization, description 직접 입력
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  matchBidToProducts,
  type BidAnnouncement,
  type MatchResult,
} from '@/lib/matching/enhanced-matcher';

// ============================================================================
// 요청 스키마
// ============================================================================

const ScoreRequestSchema = z.object({
  // Option 1: DB 조회
  bidId: z.string().uuid().optional(),

  // Option 2: 직접 입력
  title: z.string().optional(),
  organization: z.string().optional(),
  description: z.string().optional(),

  // 옵션
  companyId: z.string().uuid().optional(),
}).refine(
  (data) => data.bidId || data.title,
  { message: 'bidId 또는 title이 필요합니다' }
);

// ============================================================================
// 타입 정의
// ============================================================================

interface Factor {
  name: string;
  score: number;
  weight: number;
  maxScore: number;
}

interface ScoreResponse {
  score: number;
  confidence: number;
  confidenceLevel: 'high' | 'medium' | 'low' | 'none';
  factors: Factor[];
  recommendation: string;
  recommendationCode: 'BID' | 'REVIEW' | 'SKIP';
  matchedProduct: {
    id: string;
    name: string;
  } | null;
  allMatches: Array<{
    productId: string;
    productName: string;
    score: number;
    confidence: string;
  }>;
  reasons: string[];
}

// ============================================================================
// 점수 정규화 (0-100)
// ============================================================================

function normalizeScore(rawScore: number): number {
  // enhanced-matcher의 최대 점수 기준
  // 키워드: ~100점 (강한 10점 x 6 + 약한 3점 x 4)
  // 파이프 규격: 25점
  // 기관: 50점
  // 총 최대: ~175점
  const maxPossibleScore = 175;
  const normalized = Math.round((rawScore / maxPossibleScore) * 100);
  return Math.min(100, Math.max(0, normalized));
}

// ============================================================================
// 신뢰도 계산 (0-1)
// ============================================================================

function calculateConfidence(result: MatchResult): number {
  switch (result.confidence) {
    case 'high':
      return 0.9 + (result.score / 200) * 0.1; // 0.9-1.0
    case 'medium':
      return 0.7 + (result.score / 100) * 0.15; // 0.7-0.85
    case 'low':
      return 0.4 + (result.score / 50) * 0.2; // 0.4-0.6
    default:
      return 0.1 + (result.score / 30) * 0.2; // 0.1-0.3
  }
}

// ============================================================================
// 추천 메시지 생성
// ============================================================================

function getRecommendationMessage(code: 'BID' | 'REVIEW' | 'SKIP'): string {
  switch (code) {
    case 'BID':
      return '입찰 참여 권장 - 높은 적합도';
    case 'REVIEW':
      return '검토 필요 - 추가 분석 권장';
    case 'SKIP':
      return '건너뛰기 권장 - 낮은 적합도';
  }
}

// ============================================================================
// API 핸들러
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // 입력 검증
    const parseResult = ScoreRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.errors[0]?.message || '잘못된 요청 형식',
        },
        { status: 400 }
      );
    }

    const { bidId, title, organization, description } = parseResult.data;

    // 입찰 공고 데이터 준비
    let bid: BidAnnouncement;

    if (bidId) {
      // TODO: Supabase에서 bid 조회
      // const { data, error } = await supabase
      //   .from('bid_announcements')
      //   .select('*')
      //   .eq('id', bidId)
      //   .single();

      // 현재는 Mock 데이터 반환
      bid = {
        id: bidId,
        title: title || `입찰 공고 ${bidId}`,
        organization: organization || '발주기관',
        description: description,
      };
    } else {
      bid = {
        id: `temp-${Date.now()}`,
        title: title!,
        organization: organization || '',
        description: description,
      };
    }

    // 매칭 실행
    const matchResult = matchBidToProducts(bid);
    const bestMatch = matchResult.allMatches[0]; // 항상 존재

    // 점수 정규화
    const normalizedScore = normalizeScore(bestMatch.score);
    const confidence = calculateConfidence(bestMatch);

    // 응답 생성
    const response: ScoreResponse = {
      score: normalizedScore,
      confidence: Math.round(confidence * 100) / 100,
      confidenceLevel: bestMatch.confidence,
      factors: [
        {
          name: '키워드 매칭',
          score: bestMatch.breakdown.keywordScore,
          weight: 0.5,
          maxScore: 100,
        },
        {
          name: '규격 적합도',
          score: bestMatch.breakdown.pipeSizeScore,
          weight: 0.2,
          maxScore: 25,
        },
        {
          name: '발주기관 매칭',
          score: bestMatch.breakdown.organizationScore,
          weight: 0.3,
          maxScore: 50,
        },
      ],
      recommendation: getRecommendationMessage(matchResult.recommendation),
      recommendationCode: matchResult.recommendation,
      matchedProduct: matchResult.bestMatch
        ? {
            id: matchResult.bestMatch.productId,
            name: matchResult.bestMatch.productName,
          }
        : null,
      allMatches: matchResult.allMatches.map((m) => ({
        productId: m.productId,
        productName: m.productName,
        score: normalizeScore(m.score),
        confidence: m.confidence,
      })),
      reasons: bestMatch.reasons,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('[AI Score API] 오류:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
