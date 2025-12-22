/**
 * @route /api/v1/ai/score
 * @description AI 입찰 적합도 점수 API (Prompt Caching 적용)
 *
 * POST /api/v1/ai/score
 * - bidId로 DB 조회하거나
 * - title, organization, description 직접 입력
 * - useCaching=true로 Prompt Caching 활성화 (기본값)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  matchBidToProducts,
  type BidAnnouncement,
  type MatchResult,
} from '@/lib/matching/enhanced-matcher';
import { cachedBidMatch } from '@/lib/ai/cached-prompts';
import { autoMatchWithEffort, type EffortLevel } from '@/lib/ai/effort-matcher';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

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
  estimatedAmount: z.number().optional(), // 추정금액 (원)

  // 옵션
  companyId: z.string().uuid().optional(),
  useCaching: z.boolean().default(true), // Prompt Caching 사용 여부
  useAI: z.boolean().default(false), // Claude AI 사용 여부 (기본: Enhanced Matcher)
  useEffort: z.boolean().default(false), // Effort Parameter 사용 (Claude Opus 4.5 전용)
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
  method: string;
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
  effortUsed?: EffortLevel; // Effort Parameter 사용 시
  tokensUsed?: {
    input: number;
    output: number;
  };
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

    const { bidId, title, organization, description, estimatedAmount, useAI, useCaching, useEffort } = parseResult.data;

    // 입찰 공고 데이터 준비
    let bid: BidAnnouncement;
    let bidAmount: number | undefined = estimatedAmount;

    if (bidId) {
      // Supabase에서 bid 조회
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('bids')
        .select('id, title, organization, description, keywords, estimated_amount')
        .eq('id', bidId)
        .single();

      if (error || !data) {
        return NextResponse.json(
          {
            success: false,
            error: `입찰 공고를 찾을 수 없습니다 (ID: ${bidId})`,
          },
          { status: 404 }
        );
      }

      // Type assertion for selected fields
      const bidData = data as {
        id: string;
        title: string;
        organization: string;
        description: string | null;
        keywords: string[] | null;
        estimated_amount: number | null;
      };

      bid = {
        id: bidData.id,
        title: bidData.title,
        organization: bidData.organization,
        description: bidData.description || bidData.keywords?.join(', '),
      };

      // DB에서 가져온 금액이 있으면 사용
      if (bidData.estimated_amount && !bidAmount) {
        bidAmount = bidData.estimated_amount;
      }
    } else {
      bid = {
        id: `temp-${Date.now()}`,
        title: title!,
        organization: organization || '',
        description: description,
      };
    }

    // 매칭 실행
    let matchResult: {
      bestMatch: MatchResult | null;
      allMatches: MatchResult[];
      recommendation: 'BID' | 'REVIEW' | 'SKIP';
    };
    let aiResult;
    let effortResult;

    if (useAI && useEffort) {
      // Claude Opus 4.5 with Effort Parameter (최신 기능)
      effortResult = await autoMatchWithEffort({
        title: bid.title,
        organization: bid.organization,
        description: bid.description || '',
        estimatedAmount: bidAmount,
      });

      // Effort 결과를 MatchResult 형식으로 변환
      const effortMatchResult: MatchResult = {
        productId: effortResult.matched_product,
        productName: effortResult.matched_product,
        score: effortResult.score,
        confidence: effortResult.confidence as 'high' | 'medium' | 'low' | 'none',
        breakdown: {
          keywordScore: effortResult.breakdown?.technical || effortResult.score * 0.5,
          pipeSizeScore: effortResult.breakdown?.price || effortResult.score * 0.2,
          organizationScore: effortResult.breakdown?.organization || effortResult.score * 0.3,
          totalScore: effortResult.score,
        },
        reasons: effortResult.reasons || [],
        isMatch: effortResult.score >= 30,
      };

      matchResult = {
        bestMatch: effortMatchResult,
        allMatches: [effortMatchResult],
        recommendation: effortResult.score >= 150 ? 'BID' : effortResult.score >= 120 ? 'REVIEW' : 'SKIP',
      };
    } else if (useAI && useCaching) {
      // Claude AI with Prompt Caching (90% 비용 절감)
      aiResult = await cachedBidMatch(
        bid.title,
        bid.organization,
        bid.description || ''
      );

      // AI 결과를 MatchResult 형식으로 변환
      const aiMatchResult: MatchResult = {
        productId: aiResult.matched_product,
        productName: aiResult.matched_product,
        score: aiResult.score,
        confidence: aiResult.confidence as 'high' | 'medium' | 'low' | 'none',
        breakdown: {
          keywordScore: aiResult.breakdown?.technical || aiResult.score * 0.5,
          pipeSizeScore: aiResult.breakdown?.price || aiResult.score * 0.2,
          organizationScore: aiResult.breakdown?.organization || aiResult.score * 0.3,
          totalScore: aiResult.score,
        },
        reasons: aiResult.reasons || [],
        isMatch: aiResult.score >= 30,
      };

      matchResult = {
        bestMatch: aiMatchResult,
        allMatches: [aiMatchResult],
        recommendation: aiResult.score >= 60 ? 'BID' : aiResult.score >= 30 ? 'REVIEW' : 'SKIP',
      };
    } else {
      // Enhanced Matcher (기본)
      matchResult = matchBidToProducts(bid);
    }

    const bestMatch = matchResult.allMatches[0]; // 항상 존재

    // 점수 정규화
    const normalizedScore = normalizeScore(bestMatch.score);
    const confidence = calculateConfidence(bestMatch);

    // 응답 생성
    const response: ScoreResponse = {
      score: normalizedScore,
      method: useAI && useEffort
        ? 'claude_opus_4.5_effort'
        : useAI && useCaching
        ? 'claude_ai_cached'
        : 'enhanced_matcher',
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
      // Effort Parameter 사용 시 추가 정보
      ...(effortResult && {
        effortUsed: effortResult.effort_used,
        tokensUsed: effortResult.tokens_used,
      }),
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
