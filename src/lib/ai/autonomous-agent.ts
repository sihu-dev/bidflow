/**
 * @module ai/autonomous-agent
 * @description 자율 에이전트 - Interleaved Thinking + 모든 도구 통합
 *
 * Interleaved Thinking (Beta):
 * - 도구 호출 사이 사고 과정 유지
 * - 복잡한 멀티스텝 워크플로우 자동화
 * - 오류 시 자가 복구
 */

import Anthropic from '@anthropic-ai/sdk';
import { uploadAndAnalyzeBidAttachments } from './files-manager';
import { comprehensiveMarketAnalysis, analyzePriceCompetitiveness } from './web-search-tool';
import { autoMatchWithEffort } from './effort-matcher';
import { createClient } from '@supabase/supabase-js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// SECURITY WARNING: Using SERVICE_ROLE_KEY bypasses Row Level Security (RLS)
// This is acceptable for backend-only operations IF:
// 1. This function is NEVER exposed to client-side code
// 2. All callers are authenticated and authorized
// 3. All queries include explicit tenant_id filtering (if multi-tenant)
// 4. Input validation is performed on all parameters
//
// Current usage: Only called from Inngest (master-orchestrator.ts)
// TODO: Add tenant_id filtering if multi-tenant support is added
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

/**
 * Bid ID 검증 (SQL Injection 및 Invalid ID 방지)
 */
function validateBidId(bidId: string): void {
  // UUID v4 형식 검증
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!bidId || typeof bidId !== 'string') {
    throw new Error('Invalid bidId: Must be a non-empty string');
  }

  if (!uuidRegex.test(bidId)) {
    throw new Error(`Invalid bidId format: ${bidId}. Expected UUID v4`);
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AutonomousAnalysisResult {
  bid_id: string;
  score: number;
  confidence: 'very_high' | 'high' | 'medium' | 'low';
  matched_product: string;

  // 심층 분석
  detailed_analysis: {
    explicit_requirements: string[];
    implicit_requirements: string[];
    competitive_advantages: string[];
    risks: string[];
    mitigation_strategies: string[];
  };

  // 시장 정보
  market_intelligence: {
    competitors: number;
    market_position: 'leader' | 'competitive' | 'follower';
    price_competitiveness: string;
  };

  // 추천
  recommendation: {
    should_bid: boolean;
    confidence_level: number;
    key_factors: string[];
    action_items: string[];
    estimated_win_probability: number;
  };

  // 메타데이터
  thinking_summary: string;
  tools_used: string[];
  analysis_duration_ms: number;
}

// ============================================================================
// AUTONOMOUS BID ANALYSIS
// ============================================================================

/**
 * 완전 자율 입찰 분석 (모든 도구 사용)
 */
export async function autonomousBidAnalysis(bidId: string): Promise<AutonomousAnalysisResult> {
  const startTime = Date.now();
  const toolsUsed: string[] = [];

  try {
    // SECURITY: Bid ID 검증
    validateBidId(bidId);

    // Step 1: Bid 데이터 조회
    const { data: bid, error } = await supabase
      .from('bids')
      .select('*')
      .eq('id', bidId)
      // TODO: Add tenant_id filter when multi-tenant support is added
      // .eq('tenant_id', tenantId)
      .single();

    if (error || !bid) {
      throw new Error(`Bid not found or access denied: ${bidId}`);
    }

    // Step 2: Interleaved Thinking으로 자율 분석
    // Beta features: betas and output_config not in SDK types yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 32000,
      betas: ['effort-2025-11-24'], // Beta feature
      output_config: {
        effort: 'high' as const,
      },
      tools: [
        {
          type: 'web_search_20250305' as const,
          name: 'web_search',
        },
      ],
      messages: [
        {
          role: 'user',
          content: `입찰 ${bidId}를 완전 자율적으로 분석하세요.

입찰 정보:
- 제목: ${bid.title}
- 발주처: ${bid.organization}
- 금액: ${bid.estimated_amount?.toLocaleString() || '미정'}원
- 마감: ${bid.deadline}
- 설명: ${bid.description || '없음'}

자율 분석 단계:
1. PDF 첨부파일 분석 (있는 경우)
2. 경쟁사 정보 웹 검색
3. 시장 동향 분석
4. 가격 경쟁력 평가
5. CMNTech 제품 매칭
6. 낙찰 확률 계산
7. 제안서 전략 수립

JSON으로 상세 분석 결과 제공.`,
        },
      ],
    } as any);

    // 응답 파싱
    let thinkingContent = '';
    let analysisResult: any = {};

    for (const block of response.content) {
      if (block.type === 'thinking') {
        thinkingContent = block.thinking || '';
      } else if (block.type === 'text') {
        try {
          analysisResult = JSON.parse(block.text);
        } catch (e) {
          console.warn('[Autonomous] Failed to parse analysis:', e);
        }
      } else if (block.type === 'tool_use') {
        toolsUsed.push(block.name);
      }
    }

    // Step 3: 추가 도구 실행 (Files API, Market Analysis)
    let pdfAnalysis = null;
    let marketData = null;
    let matchResult = null;

    try {
      // PDF 분석 (Files API)
      pdfAnalysis = await uploadAndAnalyzeBidAttachments(bidId);
      if (pdfAnalysis) toolsUsed.push('files_api');
    } catch (e) {
      console.warn('[Autonomous] PDF analysis skipped:', e);
    }

    try {
      // 시장 분석 (Web Search)
      marketData = await comprehensiveMarketAnalysis(
        bid.title,
        bid.organization,
        analysisResult.matched_product || '유량계'
      );
      toolsUsed.push('web_search');
    } catch (e) {
      console.warn('[Autonomous] Market analysis skipped:', e);
    }

    try {
      // 제품 매칭 (Effort Parameter)
      matchResult = await autoMatchWithEffort({
        title: bid.title,
        organization: bid.organization,
        description: bid.description || '',
        estimatedAmount: bid.estimated_amount ?? undefined,
      });
      toolsUsed.push('effort_matcher');
    } catch (e) {
      console.warn('[Autonomous] Product matching skipped:', e);
    }

    // Step 4: 결과 통합
    const finalResult: AutonomousAnalysisResult = {
      bid_id: bidId,
      score: matchResult?.score || analysisResult.score || 0,
      confidence: matchResult?.confidence || analysisResult.confidence || 'medium',
      matched_product: matchResult?.matched_product || analysisResult.matched_product || 'N/A',

      detailed_analysis: {
        explicit_requirements: analysisResult.detailed_analysis?.explicit_requirements || [],
        implicit_requirements: analysisResult.detailed_analysis?.implicit_requirements || [],
        competitive_advantages: analysisResult.detailed_analysis?.competitive_advantages || [],
        risks: analysisResult.detailed_analysis?.risks || [],
        mitigation_strategies: analysisResult.detailed_analysis?.mitigation_strategies || [],
      },

      market_intelligence: {
        competitors: marketData?.competitors.length || 0,
        market_position: 'competitive',
        price_competitiveness: marketData?.market.average_winning_price
          ? `평균 ${marketData.market.average_winning_price.toLocaleString()}원`
          : '정보 없음',
      },

      recommendation: {
        should_bid: (matchResult?.score || 0) >= 120,
        confidence_level: matchResult?.confidence === 'very_high' ? 0.95 : 0.75,
        key_factors: matchResult?.reasons || [],
        action_items: analysisResult.recommendation?.action_items || [],
        estimated_win_probability: (matchResult?.score || 0) / 175,
      },

      thinking_summary: thinkingContent.substring(0, 500) + '...',
      tools_used: [...new Set(toolsUsed)],
      analysis_duration_ms: Date.now() - startTime,
    };

    // Step 5: Supabase 업데이트
    await supabase
      .from('bids')
      .update({
        ai_summary: finalResult.matched_product,
        match_score: finalResult.score / 175,
        status: finalResult.recommendation.should_bid ? 'matched' : 'reviewed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bidId);

    return finalResult;
  } catch (error) {
    console.error(`[Autonomous] Analysis failed for ${bidId}:`, error);
    throw error;
  }
}

/**
 * 배치 자율 분석 (여러 입찰)
 */
export async function batchAutonomousAnalysis(bidIds: string[]) {
  // SECURITY: 입력 검증
  if (!Array.isArray(bidIds) || bidIds.length === 0) {
    throw new Error('bidIds must be a non-empty array');
  }

  if (bidIds.length > 100) {
    throw new Error('Maximum 100 bids allowed per batch');
  }

  // 각 bidId 검증
  bidIds.forEach((id, index) => {
    try {
      validateBidId(id);
    } catch (e) {
      throw new Error(`Invalid bidId at index ${index}: ${e}`);
    }
  });

  const results = await Promise.all(
    bidIds.map(async (bidId) => {
      try {
        return await autonomousBidAnalysis(bidId);
      } catch (error) {
        console.error(`[Autonomous] Failed for ${bidId}:`, error);
        return null;
      }
    })
  );

  return {
    total: bidIds.length,
    successful: results.filter((r) => r !== null).length,
    failed: results.filter((r) => r === null).length,
    results: results.filter((r) => r !== null),
  };
}

/**
 * 자가 복구 분석 (실패 시 재시도)
 */
export async function selfHealingAnalysis(bidId: string, maxRetries: number = 3) {
  // SECURITY: 입력 검증
  validateBidId(bidId);

  if (maxRetries < 1 || maxRetries > 5) {
    throw new Error('maxRetries must be between 1 and 5');
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Autonomous] Attempt ${attempt}/${maxRetries} for ${bidId}`);
      return await autonomousBidAnalysis(bidId);
    } catch (error) {
      console.error(`[Autonomous] Attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error}`);
      }

      // 지수 백오프
      await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));
    }
  }

  throw new Error('Unexpected error in selfHealingAnalysis');
}
